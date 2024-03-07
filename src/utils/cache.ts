import { unstable_cache } from 'next/cache';

import { parse, stringify } from 'superjson';
import { getLastBite } from './server';

const cache = <T, P extends unknown[]>(
  fn: (...params: P) => Promise<T>,
  keys: Parameters<typeof unstable_cache>[1],
  opts: Parameters<typeof unstable_cache>[2],
): typeof fn => {
  const wrap = async (params: unknown[]): Promise<string> => {
    const result = await fn(...(params as P));
    return stringify(result);
  };

  const cachedFn = unstable_cache(wrap, keys, opts);

  return async (...params: P): Promise<T> => {
    const result = await cachedFn(params);
    return parse(result);
  };
};

export const lastBiteCacheTag = (id: string) => `last-bite-${id}`;

export const getCachedLastBite = async (id: string) =>
  cache(getLastBite, ['cachedLastBite'], {
    tags: [lastBiteCacheTag(id)],
  })(id);
