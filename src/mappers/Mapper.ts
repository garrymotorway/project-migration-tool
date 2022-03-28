export default interface Mapper<TSource, TDest> {
  from(dataData: TSource): TDest;
  to(dataData: TDest): TSource;
}
