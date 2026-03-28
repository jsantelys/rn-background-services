package expo.modules.rnbackgroundservices

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context.NOTIFICATION_SERVICE
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.util.Log
import androidx.annotation.RequiresApi
import androidx.core.app.NotificationManagerCompat
import androidx.core.os.bundleOf
import expo.modules.interfaces.permissions.Permissions
import expo.modules.interfaces.permissions.PermissionsResponse
import expo.modules.interfaces.permissions.PermissionsStatus
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class RnBackgroundServicesModule : Module() {

  private var serviceRunning: Boolean = false
  private val context
    get() = requireNotNull(appContext.reactContext)

  private val permissions: Permissions
    get() = requireNotNull(appContext.permissions)

  override fun definition() = ModuleDefinition {
    Name("RnBackgroundServices")

    Function("getBackgroundServicesAvailability") {
      return@Function getBackgroundServicesAvailability()
    }
    Function("registerService") { serviceName: String, channelName: String ->
      return@Function registerService(channelName)
    }
    Function("startService") { identifier: String, title: String, subtitle: String ->
      return@Function startService(identifier, title, subtitle)
    }
    Function("stopService") { success: Boolean ->
      stopService()
    }
    Function("setCurrentTaskProgress") { progress: Int ->
      setCurrentTaskProgress(progress)
    }

    AsyncFunction("getPermissionsAsync") { promise: Promise ->
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        getPermissionWithPromiseImplApi33(promise)
      } else {
        getPermissionsWithPromiseImplClassic(promise)
      }
    }

    AsyncFunction("requestPermissionsAsync") { promise: Promise ->
      if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        requestPermissionsWithPromiseImplApi33(promise)
      } else {
        getPermissionsWithPromiseImplClassic(promise)
      }
    }
  }

  //region Module main functions to foregroundService functionality
  private fun getBackgroundServicesAvailability(): BackgroundServicesAvailability {
    val availability = BackgroundServicesAvailability()
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      availability.isAvailable = true
    } else {
      availability.reason = "Android version is not enough to support foreground services, SDK >= 26"
    }
    return availability
  }

  private fun registerService (channelName: String): RegisterServiceResult {
    val result = RegisterServiceResult()
    if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      try {
        val channel = NotificationChannel(
          "running-channel",
          channelName,
          NotificationManager.IMPORTANCE_LOW,
        )
        val notificationManager = context.getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.createNotificationChannel(channel)
        result.success = true
        Log.d("RnBackgroundServices", "Service registered successfully")
      } catch (e: Exception) {
        result.reason = "Failed to create channel due to $e"
      }
    } else {
      result.reason = "Couldn't create notification channel due to android version being < 26"
    }
    return result
  }

  private fun startService (identifier: String, title: String, subtitle: String): StartServiceResult {
    val result = StartServiceResult()
    Log.d("RnBackgroundServices", "startService function called")
    if (!serviceRunning) {
      try {
        Intent(context.applicationContext, MyForegroundService::class.java).also {
          Log.d("RnBackgroundServices", "Starting Intent")
          it.action = MyForegroundService.Actions.START.toString()
          it.putExtra("identifier", identifier)
          it.putExtra("notification_title", title)
          it.putExtra("notification_subtitle", subtitle)
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(it)
          } else {
            context.startService(it)
          }
        }
        result.success = true
        serviceRunning = true
      } catch (e: Exception) {
        Log.d("RnBackgroundServices", "Failed to start service due to $e")
        result.reason = "Failed to start service due to $e"
      }

    } else {
      Log.d("RnBackgroundServices", "Failed to start service is already running")
      result.reason = "Failed to start the foreground service as a service is already running"
    }
    Log.d("RnBackgroundServices", "Ending function startService")
    return result
  }

  private fun stopService () {
    Intent(context, MyForegroundService::class.java). also {
      it.action = MyForegroundService.Actions.STOP.toString()
      context.stopService(it)
    }
    serviceRunning = false
  }

  private fun setCurrentTaskProgress (progress: Int) {
    if (serviceRunning) {
      Intent(context, MyForegroundService::class.java).also {
        it.action = MyForegroundService.Actions.UPDATE_PROGRESS.toString()
        it.putExtra("progress", progress)
        context.startService(it)
      }
      if (progress >= 100) {
        Handler(context.mainLooper).postDelayed({
          if (serviceRunning) {
            stopService()
          }
        }, 1500)
      }
    }
  }
  //endregion


  //region Permissions for notifications
  private fun getPermissionsWithPromiseImplClassic(promise: Promise) {
    val managerCompat = NotificationManagerCompat.from(context)
    val areEnabled = managerCompat.areNotificationsEnabled()
    val status = if (areEnabled) PermissionsStatus.GRANTED else PermissionsStatus.DENIED

    promise.resolve(
      bundleOf(
        PermissionsResponse.EXPIRES_KEY to PermissionsResponse.PERMISSION_EXPIRES_NEVER,
        PermissionsResponse.STATUS_KEY to status.status,
        PermissionsResponse.CAN_ASK_AGAIN_KEY to areEnabled,
        PermissionsResponse.GRANTED_KEY to (status == PermissionsStatus.GRANTED),
      )
    )
  }

  @RequiresApi(Build.VERSION_CODES.TIRAMISU)
  private fun getPermissionWithPromiseImplApi33(promise: Promise) {
    permissions.getPermissions(
      { permissionsMap: Map<String, PermissionsResponse> ->
        val managerCompat = NotificationManagerCompat.from(context)
        val areEnabled = managerCompat.areNotificationsEnabled()

        val areAllGranted = permissionsMap.all { (_, response) -> response.status == PermissionsStatus.GRANTED }
        val areAllDenied = permissionsMap.all { (_, response) -> response.status == PermissionsStatus.DENIED }
        val canAskAgain = permissionsMap.all { (_, response) -> response.canAskAgain }
        val status = when {
          areAllDenied -> PermissionsStatus.DENIED.status
          !areEnabled -> PermissionsStatus.DENIED.status
          areAllGranted -> PermissionsStatus.GRANTED.status
          else -> PermissionsStatus.UNDETERMINED.status
        }

        promise.resolve(
          bundleOf(
            PermissionsResponse.EXPIRES_KEY to PermissionsResponse.PERMISSION_EXPIRES_NEVER,
            PermissionsResponse.STATUS_KEY to status,
            PermissionsResponse.CAN_ASK_AGAIN_KEY to canAskAgain,
            PermissionsResponse.GRANTED_KEY to areAllGranted,
          )
        )

      },
      Manifest.permission.POST_NOTIFICATIONS
    )
  }

  @RequiresApi(Build.VERSION_CODES.TIRAMISU)
  private fun requestPermissionsWithPromiseImplApi33(promise: Promise) {
    permissions.askForPermissions(
      {
        getPermissionsWithPromiseImplClassic(promise)
      },
      Manifest.permission.POST_NOTIFICATIONS
    )
  }
  //endregion
}
