import Producer from '@producers/Producer';

export default class implements Producer {
  async produce(data: any): Promise<void> {
    console.log(JSON.stringify(data, undefined, 2));
  }
}
