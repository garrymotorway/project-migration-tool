export default interface Producer {
  produce(data: any): Promise<void>;
}
