import type AlpineType from "alpinejs";
import { createUrlStore, type UrlStoreConfig } from "./store-factory.js";

export function registerUrlPlugin<TQuery extends Record<string, unknown>>(
  Alpine: AlpineType.Alpine,
  config: UrlStoreConfig<TQuery>
): ReturnType<typeof createUrlStore<TQuery>> {
  const urlStore = createUrlStore<TQuery>(Alpine, config);

  // App-level `Alpine.Stores.url` augmentation may narrow the registered store.
  Alpine.store("url", urlStore as never);
  Alpine.magic("url", () => Alpine.store("url"));

  if (typeof window !== "undefined") {
    window.addEventListener("popstate", () => {
      urlStore.sync();
    });
  }

  return urlStore;
}
