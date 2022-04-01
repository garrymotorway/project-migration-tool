import Consumer from '@consumers/Consumer';
import ShortcutConsumer from '@consumers/ShortcutConsumer';

import { SHORTCUT } from '@enums/ProjectManagementSystems';

export default class ConsumerFactory {
  static create(consumerName: string, projectId: string): Consumer {
    switch (consumerName?.toLowerCase()) {
      case SHORTCUT:
        return new ShortcutConsumer(projectId);
      default:
        throw new Error(`The consumer ${consumerName} is not valid.`);
    }
  }
}
