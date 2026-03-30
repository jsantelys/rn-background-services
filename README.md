# rn-background-services

Enables using the BGProcesssingTask on iOS and ForegroundServices on Android

# API documentation

- [Documentation for the latest stable release](https://docs.expo.dev/versions/latest/sdk/rn-background-services/)
- [Documentation for the main branch](https://docs.expo.dev/versions/unversioned/sdk/rn-background-services/)

# Installation in managed Expo projects

For [managed](https://docs.expo.dev/archive/managed-vs-bare/) Expo projects, please follow the installation instructions in the [API documentation for the latest stable release](#api-documentation). If you follow the link and there is no documentation available then this library is not yet usable within managed projects &mdash; it is likely to be included in an upcoming Expo SDK release.

# Installation in bare React Native projects

For bare React Native projects, you must ensure that you have [installed and configured the `expo` package](https://docs.expo.dev/bare/installing-expo-modules/) before continuing.

### Add the package to your npm dependencies

```
npm install rn-background-services
```

### Configure for Android




### Configure for iOS

Run `npx pod-install` after installing the npm package.

### Configure with the Expo plugin

If you are using Expo prebuild / Continuous Native Generation, add the package to your app config plugins and declare the task identifiers you will use with `registerService(identifier, ...)`.

```json
{
  "expo": {
    "plugins": [
      [
        "rn-background-services",
        {
          "taskIdentifiers": ["background-processing-demo"]
        }
      ]
    ]
  }
}
```

The plugin adds `processing` to `UIBackgroundModes` and writes the corresponding values to `BGTaskSchedulerPermittedIdentifiers` in iOS `Info.plist`.

# Contributing

Contributions are very welcome! Please refer to guidelines described in the [contributing guide]( https://github.com/expo/expo#contributing).
