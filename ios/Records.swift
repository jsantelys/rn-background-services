//
//  Records.swift
//  RnBackgroundServices
//
//  Created by Javier Santelys on 15/09/2025.
//
import ExpoModulesCore

struct BackgroundServicesAvailability: Record {
    @Field
    var isAvailable: Bool = false
    
    @Field
    var reason: String? = nil
}

struct RegisterServiceResult: Record {
    @Field
    var success: Bool = false
    
    @Field
    var reason: String? = nil
}

struct StartServiceResult: Record {
    @Field
    var success: Bool = false
    
    @Field
    var reason: String? = nil
}

struct PermissionsResponse: Record {
  @Field
  var status: String = "undetermined"
  
  @Field
  var expires: String = "never"
  
  @Field
  var granted: Bool = false
  
  @Field
  var canAskAgain: Bool = false

  @Field
  var reason: String? = nil
}
