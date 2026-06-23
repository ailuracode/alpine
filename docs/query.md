# @ailuracode/alpine-query

TanStack Query-style async data fetching for Alpine.js: caching, stale-while-revalidate, invalidation, retries, polling, and mutations.

## Install

```bash
npm install @ailuracode/alpine-query @ailuracode/alpine-query-adapter-nanostores alpinejs nanostores @nanostores/alpine
```

## Quick start

Pick an adapter plugin for Alpine. **Nanostores** is recommended (`@nanostores/alpine` provides `x-nano` and `$nano`):

```js
import Alpine from "alpinejs";
import nanostoresQuery from "@ailuracode/alpine-query-adapter-nanostores";

Alpine.plugin(nanostoresQuery());
Alpine.start();
```

Other adapter packages:

| Package | Backend |
|---------|---------|
| `@ailuracode/alpine-query-adapter-nanostores` | Nanostores + `@nanostores/alpine` (**recommended**) |
| `@ailuracode/alpine-query-adapter-alpine` | Native `Alpine.reactive` |
| `@ailuracode/alpine-query-adapter-zustand` | Zustand vanilla (manual bridge; no official zustand-alpine) |

### Without Alpine

`createQueryClient()` exposes the same API without registering `$store.query`. The cache core is **store-agnostic** — pass any `QueryStateAdapter` or use the vanilla default.

```js
import { createQueryClient, vanillaQueryAdapter } from "@ailuracode/alpine-query";
import { nanostoresQueryAdapter } from "@ailuracode/alpine-query-adapter-nanostores";

const query = createQueryClient({ adapter: nanostoresQueryAdapter });
const todos = query.observe(["todos"], fetchTodos);
```

```html
<div
  x-data="{
    todos: $store.query.observe(['todos'], () => fetch('/api/todos').then((r) => r.json())),
  }"
>
  <p x-show="todos.isLoading">Loading…</p>
  <ul x-show="todos.isSuccess">
    <template x-for="todo in todos.data" :key="todo.id">
      <li x-text="todo.title"></li>
    </template>
  </ul>
</div>
```

Keep the query object nested (e.g. `todos.isLoading`) — do not spread `observe()` into `x-data`, or getters like `isSuccess` will not work.

### Pagination

Use the page number in the query key so each page is cached independently:

```html
<div
  x-data="{
    page: 1,
    pageSize: 12,
    query: null,
    loadPage() {
      this.query?.destroy?.();
      const page = this.page;
      this.query = $store.query.observe(
        ['pokemon', page],
        () =>
          fetch(
            `https://pokeapi.co/api/v2/pokemon?limit=${this.pageSize}&offset=${(page - 1) * this.pageSize}`
          ).then((r) => r.json()),
        { staleTime: 5 * 60_000 }
      );
    },
  }"
  x-init="loadPage()"
>
  <template x-if="query?.isSuccess">
    <ul>
      <template x-for="pokemon in query.data.results" :key="pokemon.name">
        <li x-text="pokemon.name"></li>
      </template>
    </ul>
  </template>
  <button type="button" @click="page--; loadPage()" x-bind:disabled="page <= 1">Previous</button>
  <button type="button" @click="page++; loadPage()" x-bind:disabled="!query?.data?.next">Next</button>
</div>
```

Navigating back to a previous page serves cached data instantly while `staleTime` has not expired.

See the [package README](../packages/query/README.md) for the full API.

## Custom adapter

The cache engine talks to your store library through a **`QueryStateAdapter`**. Implement this interface to plug in any reactive runtime — Redux, Pinia, Solid signals, a custom event bus, etc.

Every adapter must expose a **`name`** string (e.g. `"Nanostores"`, `"Zustand"`). Query devtools display it in the panel header (`Alpine Query · YourName`).

### Contract

Each cached query and mutation gets a **handle** with four responsibilities:

| Method | Role |
|--------|------|
| `get()` | Snapshot of the raw record (`data`, `status`, `fetchStatus`, …) |
| `patch(partial)` | Apply cache updates from the engine |
| `listen(listener)` | Notify when the record changes; return an unsubscribe function |
| `state` | Reactive view exposed to consumers (`observe()`, `mutate()`) |

Query records use `QueryStateRecord<TData>`; mutations use `MutationStateRecord<TData>`. The `state` object must expose getters for those fields plus boolean flags (`isLoading`, `isSuccess`, …) and actions (`refetch`, `mutate`, `reset`).

### Minimal example (vanilla)

The built-in `vanillaQueryAdapter` is the simplest reference — a plain object plus a listener set:

```js
import {
  createQueryClient,
  createMutationStateView,
  createQueryStateView,
  vanillaQueryAdapter,
  type QueryStateAdapter,
} from "@ailuracode/alpine-query";

// Use as-is for tests or non-reactive environments
const client = createQueryClient({ adapter: vanillaQueryAdapter });
```

See [`packages/query/src/adapters/vanilla.ts`](../packages/query/src/adapters/vanilla.ts) for the full implementation.

### Store-backed adapter

When your library already owns reactive state (Zustand, Nanostores, MobX, …), keep the **record** in the store and build the **view** with core helpers:

```js
import {
  createMutationStateView,
  createQueryStateView,
  type MutationStateRecord,
  type QueryStateAdapter,
  type QueryStateRecord,
} from "@ailuracode/alpine-query";

export const myStoreAdapter: QueryStateAdapter = {
  name: "My Store",

  createQueryState(initial, staleTime, refetch) {
    const record = { ...initial }; // or your store's map/set API
    const state = createQueryStateView(() => record, staleTime, refetch);
    const listeners = new Set();

    return {
      state,
      get: () => record,
      patch: (patch) => {
        Object.assign(record, patch);
        listeners.forEach((l) => l(record));
      },
      listen: (listener) => {
        listeners.add(listener);
        listener(record);
        return () => listeners.delete(listener);
      },
    };
  },

  createMutationState(handlers) {
    const record = { data: undefined, error: null, status: "idle" };
    const state = createMutationStateView(() => record, handlers);
    const listeners = new Set();

    return {
      state,
      get: () => record,
      patch: (patch) => {
        Object.assign(record, patch);
        listeners.forEach((l) => l(record));
      },
      listen: (listener) => {
        listeners.add(listener);
        listener(record);
        return () => listeners.delete(listener);
      },
    };
  },
};
```

Wire the store's native `subscribe` / `listen` into `listen` instead of a manual `Set` when available. Existing adapters:

- [`query-adapter-nanostores`](../packages/query-adapter-nanostores/src/adapter.ts) — Nanostores `map()`
- [`query-adapter-zustand`](../packages/query-adapter-zustand/src/adapter.ts) — Zustand vanilla `createStore`

### Alpine plugin from a custom adapter

Register `$store.query` with `createQueryPlugin`:

```js
import Alpine from "alpinejs";
import { createQueryPlugin } from "@ailuracode/alpine-query";
import { myStoreAdapter } from "./my-store-adapter.js";

Alpine.plugin(createQueryPlugin(myStoreAdapter));
Alpine.start();
```

If the adapter is **not** already bound to Alpine templates, wrap it with `createAlpineBridgedAdapter` (used by the Nanostores and Zustand plugins):

```js
import { createAlpineBridgedAdapter, createQueryPlugin } from "@ailuracode/alpine-query";

Alpine.plugin(
  createQueryPlugin((Alpine) => createAlpineBridgedAdapter(Alpine, myStoreAdapter))
);
```

For native `Alpine.reactive` storage, use [`createAlpineStoreAdapter`](../packages/query-adapter-alpine/src/adapter.ts) as a reference — it calls `attachQueryFlags` / `attachMutationFlags` directly on the reactive object.

### Adapter factory

`createQueryPlugin` accepts a factory `(Alpine) => QueryStateAdapter` when the adapter needs the Alpine instance at registration time:

```js
createQueryPlugin((Alpine) => createAlpineBridgedAdapter(Alpine, myStoreAdapter));
```

### Publishing a plugin package

The official adapters are independent npm packages (`@ailuracode/alpine-query-adapter-*`). To ship your own:

1. Depend on `@ailuracode/alpine-query` and your store library.
2. Export the adapter and a default plugin: `(options) => createQueryPlugin(adapter, options)`.
3. Add tests with `createQueryClient({ adapter })` and, for Alpine, `startAlpine(createQueryPlugin(adapter))`.

Only **`patch` + `listen`** need to connect to your store; the cache engine handles fetching, retries, invalidation, and GC.

## Concepts

### Query keys

Arrays identify cached entries. Use stable, serializable values:

```js
['todos']
['todos', todoId]
['users', userId, 'posts']
```

### `observe()` vs `fetch()`

- **`observe()`** — for `x-data`. Subscribes to the cache entry; call `destroy()` when the subscription is no longer needed (e.g. pagination) so entries can be garbage-collected.
- **`fetch()`** — imperative fetch without holding a subscription.

### Stale time and garbage collection

- **`staleTime`** — how long cached data is treated as fresh.
- **`gcTime`** — how long unused entries stay in memory after all observers disconnect.

### Mutations

`$store.query.mutate()` returns a reactive mutation object with `mutate()`, `reset()`, and status getters (`isPending`, `isSuccess`, …). Use `invalidate()` in `onSuccess` to refresh related queries.

## TypeScript

```ts
/// <reference types="@ailuracode/alpine-query/global" />
```

## See also

- [Architecture](./architecture.md)
- [TanStack Query docs](https://tanstack.com/query/latest/docs/framework/react/overview)
