import Producer from '@producers/Producer';

export default class implements Producer {
  produce(data: any): Promise<void> {
    console.log('I sent your data to JIRA');
    return Promise.resolve();
  }
}
