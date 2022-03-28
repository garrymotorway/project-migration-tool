import ConsumerModel from '@consumers/ConsumerModel';

export default interface Consumer {
  consume(): Promise<any>;
}
