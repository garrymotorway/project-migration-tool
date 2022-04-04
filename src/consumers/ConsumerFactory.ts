import Consumer from '@consumers/Consumer';
import ShortcutConsumer from '@consumers/ShortcutConsumer';

import { SHORTCUT } from '@enums/ProjectManagementSystems';
import { SourceConfig } from '@models/Config';

export default class ConsumerFactory {
  static create(config: SourceConfig): Consumer {
    switch (config.name?.toLowerCase()) {
      case SHORTCUT:
        return new ShortcutConsumer(config);
      default:
        throw new Error(`The consumer ${config.name} is not valid.`);
    }
  }
}
