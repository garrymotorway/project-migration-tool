import { DestinationConfig } from '@models/Config';
import JIRAProducer from '@producers/JIRAProducer';
import Producer from '@producers/Producer';

const { JIRA } = require('@enums/ProjectManagementSystems');

export default class ProducerFactory {
  static create(config: DestinationConfig): Producer {
    switch (config.name?.toLowerCase()) {
      case JIRA:
        return new JIRAProducer();
      default:
        throw new Error(`The producer ${config.name} is not valid.`);
    }
  }
}
