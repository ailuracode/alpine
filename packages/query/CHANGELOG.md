# @ailuracode/alpine-query

## 0.4.0

### Minor Changes

- e164010: Add `query({ adapter })` as the primary Alpine plugin API. Pass a state adapter, then the plugin registers `$store.query`. Adapter packages export factories for use with `query()`.

## 0.3.1

### Patch Changes

- 26bf083: Add required `name` on `QueryStateAdapter` and show it in query devtools (`Alpine Query · Nanostores`).

## 0.3.0

### Minor Changes

- 75eb769: Add three independent query adapter plugins (Alpine.reactive, Nanostores, Zustand). The core package is now store-agnostic and no longer exports a default Alpine plugin.

## 0.2.0

### Minor Changes

- c7d717d: Make the query cache store-agnostic via pluggable `QueryStateAdapter`. Export `vanillaQueryAdapter` (default), `nanostoresQueryAdapter` (recommended), and `createAlpineNanostoresAdapter` for the Alpine plugin with `@nanostores/alpine`.

## 0.1.2

### Patch Changes

- cdf3436: Migrate internal query cache state from Alpine.reactive to Nanostores. Export `createQueryClient()` for framework-agnostic usage; Alpine plugin bridges Nanostores into `$store.query`.

## 0.1.1

### Patch Changes

- 190d37c: Add `@ailuracode/alpine-query-devtools` panel and expose `$store.query.devtools` snapshot/subscribe API on the query plugin.

## 0.1.0

### Minor Changes

- 8e32c64: Add `@ailuracode/alpine-query` — TanStack Query-style async data fetching with caching, invalidation, retries, polling, and mutations for Alpine.js.
