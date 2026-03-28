package expo.modules.rnbackgroundservices

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class BackgroundServicesAvailability: Record {
  @Field
  var isAvailable: Boolean = true

  @Field
  var reason: String? = null
}

class RegisterServiceResult: Record {
  @Field
  var success: Boolean = false

  @Field
  var reason: String? = null
}

class StartServiceResult: Record {
  @Field
  var success: Boolean = false

  @Field
  var reason: String? = null
}
