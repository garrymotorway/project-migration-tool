const DEFAULT_SEED = 0;

export function parseSeed(value: string | undefined) : number {
  const seed = parseInt(value || DEFAULT_SEED.toString(), 10);
  return Number.isNaN(seed) ? DEFAULT_SEED : seed;
}

export function getDestSeed() : number {
  return parseSeed(process.env.DEST_SEED);
}
