import Mapper from './Mapper';

export default class implements Mapper<any, any> {
  map(sourceData: any): any {
    return sourceData;
  }
}
