export default interface Mapper<TSource, TDest> {
  map(dataData: TSource): TDest;
}
