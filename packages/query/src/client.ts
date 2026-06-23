import { QueryCache } from "./cache.js";
import type { QueryPluginOptions, QueryStore } from "./types.js";
import { resolveQueryOptions, resolveRetryCount, resolveRetryDelay } from "./utils.js";

/** Framework-agnostic query client backed by Nanostores. */
export function createQueryClient(options: QueryPluginOptions = {}): QueryStore {
  const defaultQueryOptions = options.defaultOptions?.queries ?? {};
  const defaultMutationOptions = options.defaultOptions?.mutations ?? {};

  const cache = new QueryCache({
    defaultQueryOptions: resolveQueryOptions(defaultQueryOptions, {}),
    defaultMutationRetry: resolveRetryCount(defaultMutationOptions.retry, 0),
    defaultMutationRetryDelay: resolveRetryDelay(defaultMutationOptions.retryDelay, 1000),
  });

  return createQueryStore(cache);
}

export function createQueryStore(cache: QueryCache): QueryStore {
  return {
    devtools: cache.getDevtools(),
    observe(key, queryFn, queryOptions) {
      return cache.observe(key, queryFn, queryOptions);
    },
    fetch(key, queryFn, queryOptions) {
      return cache.fetch(key, queryFn, queryOptions);
    },
    get(key) {
      return cache.get(key);
    },
    prefetch(key, queryFn, queryOptions) {
      return cache.prefetch(key, queryFn, queryOptions);
    },
    invalidate(key) {
      cache.invalidate(key);
    },
    remove(key) {
      cache.remove(key);
    },
    setData(key, data) {
      cache.setData(key, data);
    },
    cancel(key) {
      cache.cancel(key);
    },
    reset() {
      cache.reset();
    },
    mutate(mutationOptions) {
      return cache.mutate(mutationOptions);
    },
  };
}
