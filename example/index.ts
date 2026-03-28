import { registerRootComponent } from 'expo';
import { AppRegistry } from 'react-native';
import { setCurrentTaskProgress } from 'rn-background-services';

import App from './App';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

AppRegistry.registerHeadlessTask('RnBackgroundServicesTask', () => {
  return async (data) => {
    console.log('[RnBackgroundServicesTask] started', data);

    for (const progress of [10, 30, 50, 75, 100]) {
      setCurrentTaskProgress(progress);
      console.log(`[RnBackgroundServicesTask] progress ${progress}%`);
      await delay(1000);
    }
  };
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
