import type AlpineType from "alpinejs";
import { readLocationSearch } from "./location.js";
import { URL_VALUE_REJECTED, type UrlSchemaHandler } from "./schema-handler.js";
import type { UrlStore, UrlZodSchema } from "./types.js";

function isRemovalValue(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

function applyUpdates(
  target: Record<string, unknown>,
  updates: Record<string, unknown> | undefined,
  handler: UrlSchemaHandler
): void {
  if (!updates) {
    return;
  }

  for (const [key, value] of Object.entries(updates)) {
    if (isRemovalValue(value)) {
      delete target[key];
      continue;
    }

    const validated = handler.validateValue(key, value);
    if (validated === URL_VALUE_REJECTED) {
      continue;
    }

    target[key] = validated;
  }
}

function writeLocationSearch(
  query: Record<string, unknown>,
  handler: UrlSchemaHandler,
  mode: "push" | "replace",
  state?: unknown
): void {
  if (typeof window === "undefined") {
    return;
  }

  const params = handler.buildSearchParams(query);
  const search = params.toString();
  const nextUrl = `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`;
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (nextUrl === currentUrl) {
    return;
  }

  if (mode === "push") {
    window.history.pushState(state ?? null, "", nextUrl);
    return;
  }

  window.history.replaceState(state ?? null, "", nextUrl);
}

export type UrlStoreConfig<TQuery> = {
  handler: UrlSchemaHandler;
  syncUrl: boolean;
  pushOnSet: boolean;
  onChange?: (query: TQuery) => void;
};

export function createUrlStore<TQuery extends Record<string, unknown>>(
  Alpine: AlpineType.Alpine,
  config: UrlStoreConfig<TQuery>
): UrlStore<UrlZodSchema> & { query: TQuery } {
  const { handler } = config;

  const parseQuery = () => handler.parse(readLocationSearch());
  const query = Alpine.reactive(parseQuery()) as TQuery;

  const notify = () => {
    config.onChange?.(query);
  };

  const commit = (mode: "push" | "replace", state?: unknown) => {
    if (!config.syncUrl) {
      notify();
      return;
    }

    writeLocationSearch(query as Record<string, unknown>, handler, mode, state);
    notify();
  };

  const store = {
    query,

    get search() {
      const value = handler.buildSearchParams(this.query as Record<string, unknown>).toString();
      return value ? `?${value}` : "";
    },

    get(key: string) {
      return (this.query as Record<string, unknown>)[key];
    },

    set(key: string, value: unknown) {
      const record = this.query as Record<string, unknown>;

      if (isRemovalValue(value)) {
        delete record[key];
        commit(config.pushOnSet ? "push" : "replace");
        return;
      }

      const validated = handler.validateValue(key, value);
      if (validated === URL_VALUE_REJECTED) {
        return;
      }

      record[key] = validated;
      commit(config.pushOnSet ? "push" : "replace");
    },

    has(key: string) {
      const value = (this.query as Record<string, unknown>)[key];
      return value !== undefined && value !== null;
    },

    remove(key: string) {
      const record = this.query as Record<string, unknown>;
      if (!(key in record)) {
        return;
      }

      delete record[key];
      commit(config.pushOnSet ? "push" : "replace");
    },

    push(updates?: Record<string, unknown>, state?: unknown) {
      applyUpdates(this.query as Record<string, unknown>, updates, handler);
      commit("push", state);
    },

    replace(updates?: Record<string, unknown>, state?: unknown) {
      applyUpdates(this.query as Record<string, unknown>, updates, handler);
      commit("replace", state);
    },

    sync() {
      const next = parseQuery();
      const record = this.query as Record<string, unknown>;

      for (const key of Object.keys(record)) {
        if (!(key in next)) {
          delete record[key];
        }
      }

      for (const [key, value] of Object.entries(next)) {
        record[key] = value;
      }

      notify();
    },
  };

  return store as UrlStore<UrlZodSchema> & { query: TQuery };
}
