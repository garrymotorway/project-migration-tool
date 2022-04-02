import JIRAProducer from '@producers/JIRAProducer';
import Producer from '@producers/Producer';

const { JIRA } = require('@enums/ProjectManagementSystems');

export default class ProducerFactory {
  static create(producerName: string): Producer {
    switch (producerName?.toLowerCase()) {
      case JIRA:
        return new JIRAProducer();
      default:
        throw new Error(`The producer ${producerName} is not valid.`);
    }
  }
}
