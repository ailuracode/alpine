import type AlpineType from "alpinejs";
import { QueryCache } from "./cache.js";
import { createQueryStore } from "./client.js";
import type { QueryPluginOptions } from "./types.js";
import { resolveQueryOptions, resolveRetryCount, resolveRetryDelay } from "./utils.js";

export { createQueryClient } from "./client.js";
export type {
  MutationDevtoolsEntry,
  QueryDevtoolsApi,
  QueryDevtoolsEntry,
  QueryDevtoolsSnapshot,
} from "./devtools.js";
export type {
  FetchStatus,
  MutationOptions,
  MutationState,
  MutationStatus,
  QueryKey,
  QueryOptions,
  QueryPluginOptions,
  QueryState,
  QueryStore,
} from "./types.js";

/** Alpine.js query plugin inspired by TanStack Query. Registers `$store.query`. */
export default function queryPlugin(options: QueryPluginOptions = {}): AlpineType.PluginCallback {
  const defaultQueryOptions = options.defaultOptions?.queries ?? {};
  const defaultMutationOptions = options.defaultOptions?.mutations ?? {};

  return function registerQuery(Alpine) {
    const cache = new QueryCache({
      defaultQueryOptions: resolveQueryOptions(defaultQueryOptions, {}),
      defaultMutationRetry: resolveRetryCount(defaultMutationOptions.retry, 0),
      defaultMutationRetryDelay: resolveRetryDelay(defaultMutationOptions.retryDelay, 1000),
      reactive: Alpine.reactive,
    });

    const queryStore = createQueryStore(cache);

    Alpine.store("query", queryStore);
  };
}

export { hashKey, matchesQueryKey } from "./utils.js";
