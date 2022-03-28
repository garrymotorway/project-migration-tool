import Consumer from '@consumers/Consumer';
import Producer from '@producers/Producer';
import Mapper from '@mappers/Mapper';

import ConsumerFactory from '@consumers/ConsumerFactory';
import ProducerFactory from '@producers/ProducerFactory';
import MapperFactory from '@mappers/MapperFactory';

export default class Orchestrator {
  private mapper: Mapper<any, any>;

  private consumer: Consumer;

  private producer: Producer;

  constructor(consumerName: string, producerName: string) {
    this.mapper = MapperFactory.create(consumerName, producerName);
    this.consumer = ConsumerFactory.create(consumerName);
    this.producer = ProducerFactory.create(producerName);
  }

  async run() {
    const data = await this.consumer.consume();
    const mappedFromSource = this.mapper.from(data);
    const mappedToDest = this.mapper.to(mappedFromSource);
    await this.producer.produce(mappedToDest);
  }
}
