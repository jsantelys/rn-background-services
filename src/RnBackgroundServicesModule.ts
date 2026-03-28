import { NativeModule, requireNativeModule } from 'expo';

import { BackgroundServicesAvailability, PermissionsResponse, RegisterServiceResult, StartServiceResult } from './RnBackgroundServices.types';

declare class RnBackgroundServicesModule extends NativeModule {
  getBackgroundServicesAvailability(): BackgroundServicesAvailability;
  registerService(identifier: string, channelName: string): RegisterServiceResult;
  startService(identifier: string, title: string, subtitle: string): StartServiceResult;
  stopService(success: boolean): void;
  setCurrentTaskProgress(progress: number): void;
  getPermissionsAsync(): Promise<PermissionsResponse>;
  requestPermissionsAsync(): Promise<PermissionsResponse>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<RnBackgroundServicesModule>('RnBackgroundServices');
