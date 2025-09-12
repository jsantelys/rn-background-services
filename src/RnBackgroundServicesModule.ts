import { NativeModule, requireNativeModule } from 'expo';

import { RnBackgroundServicesModuleEvents } from './RnBackgroundServices.types';

declare class RnBackgroundServicesModule extends NativeModule<RnBackgroundServicesModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<RnBackgroundServicesModule>('RnBackgroundServices');
