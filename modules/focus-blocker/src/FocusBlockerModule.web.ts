import { registerWebModule, NativeModule } from 'expo';

import { FocusBlockerModuleEvents } from './FocusBlocker.types';

class FocusBlockerModule extends NativeModule<FocusBlockerModuleEvents> {
  hello() {
    return 'Hello world! 👋';
  }

  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
}

export default registerWebModule(FocusBlockerModule, 'FocusBlockerModule');
