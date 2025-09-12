import { registerWebModule, NativeModule } from 'expo';

import { RnBackgroundServicesModuleEvents } from './RnBackgroundServices.types';

class RnBackgroundServicesModule extends NativeModule<RnBackgroundServicesModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(RnBackgroundServicesModule, 'RnBackgroundServicesModule');
