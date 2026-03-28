package expo.modules.rnbackgroundservices

import android.app.ForegroundServiceStartNotAllowedException
import android.app.NotificationManager
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.Bundle
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

class MyForegroundService: HeadlessJsTaskService() {

  private lateinit var notificationBuilder: NotificationCompat.Builder
  private lateinit var notificationManager: NotificationManager
  private val notificationId = 1
  
  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when(intent?.action) {
      Actions.START.toString() -> {
        start(intent)
        return super.onStartCommand(intent, flags, startId)
      }
      Actions.STOP.toString() -> {
        stopSelf()
        return START_NOT_STICKY
      }
      Actions.UPDATE_PROGRESS.toString() -> {
        val progress = intent.getIntExtra("progress", 0)
        updateProgress(progress)
        return START_NOT_STICKY
      }
    }
    return START_NOT_STICKY
  }

  override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
    if (intent?.action != Actions.START.toString()) {
      return null
    }

    val identifier = intent.getStringExtra("identifier") ?: return null
    val data = Bundle().apply {
      putString("identifier", identifier)
    }

    return HeadlessJsTaskConfig(
      HEADLESS_TASK_NAME,
      Arguments.fromBundle(data),
      TASK_TIMEOUT_MS,
      true
    )
  }

  override fun onTimeout(startId: Int) {
    stopSelf()
    super.onTimeout(startId)
  }

  private fun start(intent: Intent) {
    try {
      Log.d("RnBackgroundServices", "Starting Service")
      val notificationIcon = android.R.drawable.ic_popup_sync
      val notificationTitle = intent.getStringExtra("notification_title") ?: "Service is running"
      val notificationSubTitle = intent.getStringExtra("notification_subtitle") ?: "Service is in progress..."

      notificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager

      notificationBuilder = NotificationCompat.Builder(this, "running-channel")
        .setContentTitle(notificationTitle)
        .setContentText(notificationSubTitle)
        .setSmallIcon(notificationIcon)
        .setProgress(100, 0, true)
        .setOngoing(true)
        .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)

      ServiceCompat.startForeground(this,
        notificationId,
        notificationBuilder.build(),
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
          ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC
        } else {
          0
        }
      )
      Log.d("RnBackgroundServices", "Service Started")
    } catch (e: Exception) {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S
        && e is ForegroundServiceStartNotAllowedException
      )
      {
        Log.d("RnBackgroundServices", "App is not in a valid state to start the foreground service")
      }
    }
  }

  private fun updateProgress(progress: Int) {
    if (::notificationBuilder.isInitialized && ::notificationManager.isInitialized) {
      notificationBuilder.setProgress(100, progress, false)
        .setContentText("Completed: $progress%")
      notificationManager.notify(notificationId, notificationBuilder.build())
    }
  }

  enum class Actions {
    START, UPDATE_PROGRESS, STOP
  }

  companion object {
    private const val HEADLESS_TASK_NAME = "RnBackgroundServicesTask"
    private const val TASK_TIMEOUT_MS = 10 * 60 * 1000L
  }
}
