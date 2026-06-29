/// <reference types="@types/alpinejs" />

import type { UrlStore, UrlZodSchema } from "./types.js";

export type {
  UrlPluginOptions,
  UrlQuery,
  UrlQueryUpdates,
  UrlQueryValue,
  UrlStore,
  UrlStoreFor,
  UrlStoreKey,
  UrlStoreOf,
  UrlZodSchema,
} from "./types.js";

declare global {
  namespace Alpine {
    interface Stores {
      url: UrlStore<UrlZodSchema>;
    }
    interface Magics<T> {
      $url: UrlStore<UrlZodSchema>;
    }
  }
}
