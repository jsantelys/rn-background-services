import ExpoModulesCore
import BackgroundTasks

public class RnBackgroundServicesModule: Module {
  
  private let bundleId = Bundle.main.bundleIdentifier
  private var currentTask: Any? = nil

  private func makePermissionsResponse() -> PermissionsResponse {
      let response = PermissionsResponse()

      if #available(iOS 26.0, *) {
          response.status = "granted"
          response.granted = true
          response.canAskAgain = false
      } else {
          response.status = "denied"
          response.reason = "BGContinuedProcessingTask requires iOS 26.0 or later."
      }

      return response
  }

  //MARK: Run Service Task
  @available(iOS 26.0, *)
  private func runTask(_ task: BGContinuedProcessingTask) {
      self.currentTask = task
      task.progress.totalUnitCount = 100
      
      task.expirationHandler = { [weak self] in
          guard let self = self else { return }
          print("Task expired")
          task.setTaskCompleted(success: false)
          self.currentTask = nil
      }
      
  }

  private func getBackgroundServicesAvailability()
      -> BackgroundServicesAvailability
  {
      let availability = BackgroundServicesAvailability()

      if #available(iOS 26.0, *) {
          availability.isAvailable = true
      } else {
          availability.reason =
              "Background tasks are not available on iOS < 26.0 versions."
      }
      return availability
  }

  //MARK: Register Service in BGTaskScheduler
  private func registerService(identifier: String) -> RegisterServiceResult {
      let result = RegisterServiceResult()
      if #available(iOS 26.0, *) {
          let didRegister = BGTaskScheduler.shared.register(
              forTaskWithIdentifier: "\(bundleId!).\(identifier)",
              using: nil
          ) { task in
              guard let task = task as? BGContinuedProcessingTask else {
                  return
              }
              self.runTask(task)
          }
          result.success = didRegister
          if !didRegister {
              result.reason = "Failed to register service"
          }
      } else {
          result.reason =
              "Failed to register service as device is not iOS 26.0 or later "
      }
      return result
  }
  
  private func startService(identifier: String, title: String, subtitle: String) -> StartServiceResult {
      let result = StartServiceResult()
      if #available(iOS 26.0, *) {
          let request = BGContinuedProcessingTaskRequest(
              identifier: "\(bundleId!).\(identifier)",
              title: title,
              subtitle: subtitle
          )
          do {
              try BGTaskScheduler.shared.submit(request)
              result.success = true
          } catch {
              result.reason = "Error scheduling task: \(error)"
              print("Error scheduling task: \(error)")
          }
      } else {
          print("Not in IOS 26.0+")
          result.reason = "Couldn't schedule task. Reason: Not in IOS 26.0+"
      }
      return result
  }
  
  private func setCurrentTaskProgress(progress: Int, title: String? = nil, subtitle: String? = nil) {
      if #available(iOS 26.0, *) {
          guard let task = self.currentTask as? BGContinuedProcessingTask
          else {
              return
          }
          print("Updating progress with value: \(progress)")
          task.progress.completedUnitCount = Int64(progress)
          
          let newTitle = title ?? task.title
          let newSubtitle = subtitle ?? "Completed: \(progress)%"
          
          task.updateTitle(newTitle, subtitle: newSubtitle)
          
          if progress >= 100 {
              task.setTaskCompleted(success: true)
              self.currentTask = nil
          }
      }
  }
  
  private func stopService(success: Bool) {
      if #available(iOS 26.0, *) {
          guard let task = self.currentTask as? BGContinuedProcessingTask else {
              return
          }
          
          task.setTaskCompleted(success: success)
          self.currentTask = nil
      }
  }
  
  private func getPermissions(promise: Promise) {
    promise.resolve(makePermissionsResponse())
  }

  public func definition() -> ModuleDefinition {
    Name("RnBackgroundServices")

    Function("getBackgroundServicesAvailability") {
        () -> BackgroundServicesAvailability in
        return getBackgroundServicesAvailability()
    }

    Function("registerService") {
        (identifier: String, channelName: String) -> RegisterServiceResult in
        return registerService(identifier: identifier)
    }

    // Schedule the task
    Function("startService") {
        (identifier: String, title: String, subtitle: String) -> StartServiceResult in
        return startService(identifier: identifier, title: title, subtitle: subtitle)
    }

    Function("setCurrentTaskProgress") { (progress: Int) -> Void in
        return setCurrentTaskProgress(progress: progress)
    }

    Function("stopService") { (success: Bool) -> Void in
        stopService(success: success)
    }
    
    AsyncFunction("getPermissionsAsync") { (promise: Promise) in
      getPermissions(promise: promise)
    }
    
    AsyncFunction("requestPermissionsAsync") { (promise: Promise) in
      getPermissions(promise: promise)
    }
  }
}
