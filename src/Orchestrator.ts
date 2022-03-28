import Consumer from '@consumers/Consumer';
import Producer from '@producers/Producer';
import Mapper from '@mappers/Mapper';

const ConsumerFactory = require('@consumers/ConsumerFactory');
const ProducerFactory = require('@producers/ProducerFactory');
const MapperFactory = require('@mappers/MapperFactory');

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
    const mapped = this.mapper.map(data);
    await this.producer.produce(mapped);
  }
}
