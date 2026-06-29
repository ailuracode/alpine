import type AlpineType from "alpinejs";
import { registerUrlPlugin } from "./plugin-core.js";
import { createSchemaHandler } from "./schema.js";
import type { UrlPluginOptions, UrlQuery, UrlStore, UrlZodSchema } from "./types.js";

export { readLocationSearch } from "./location.js";
export { createSchemaHandler, urlSchema } from "./schema.js";
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

/** Builds typed URL plugin options with a Zod schema. */
export function urlOptions<T extends UrlZodSchema>(
  options: UrlPluginOptions<T>
): UrlPluginOptions<T> {
  return options;
}

/**
 * Alpine.js URL plugin factory.
 *
 * Registers the reactive `$store.url` store for Zod-typed query-param state synced with the browser URL.
 */
export function createUrlPlugin<T extends UrlZodSchema>(
  options: UrlPluginOptions<T>
): AlpineType.PluginCallback {
  const handler = createSchemaHandler(options.schema);

  return function registerUrl(Alpine) {
    registerUrlPlugin<UrlQuery<T>>(Alpine, {
      handler,
      syncUrl: options.syncUrl ?? true,
      pushOnSet: options.pushOnSet ?? false,
      onChange: options.onChange,
    });
  };
}

export default createUrlPlugin;

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
