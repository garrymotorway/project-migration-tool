import { CommonModel } from '@models/CommonModels';

export interface SourceMapper<TSource> {
  from(dataData: TSource): Promise<CommonModel>;
}

export interface DestinationMapper<TDest> {
  to(dataData: CommonModel): Promise<TDest>;
}

export interface Mapper<TSource, TDest> {
  sourceMapper: SourceMapper<TSource>
  destinationMapper: DestinationMapper<TDest>
}
