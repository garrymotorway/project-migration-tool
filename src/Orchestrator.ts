import Consumer from '@consumers/Consumer';
import Producer from '@producers/Producer';
import { Mapper } from '@mappers/Mapper';

import ConsumerFactory from '@consumers/ConsumerFactory';
import ProducerFactory from '@producers/ProducerFactory';
import MapperFactory from '@mappers/MapperFactory';
import { Config } from '@models/Config';

export default class Orchestrator {
  private mapper: Mapper<any, any>;

  private consumer: Consumer;

  private producer: Producer;

  constructor(config: Config) {
    this.mapper = MapperFactory.create(config);
    this.consumer = ConsumerFactory.create(config.source);
    this.producer = ProducerFactory.create(config.destination);
  }

  async run() {
    const data = await this.consumer.consume();
    const mappedFromSource = await this.mapper.sourceMapper.from(data);
    const mappedToDest = await this.mapper.destinationMapper.to(mappedFromSource);
    await this.producer.produce(mappedToDest);
  }
}
