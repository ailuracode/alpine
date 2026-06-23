# @ailuracode/alpine-query-adapter-nanostores

## 2.0.0

### Patch Changes

- e164010: Add `query({ adapter })` as the primary Alpine plugin API. Pass a state adapter, then the plugin registers `$store.query`. Adapter packages export factories for use with `query()`.
- Updated dependencies [e164010]
  - @ailuracode/alpine-query@0.4.0

## 1.0.1

### Patch Changes

- 26bf083: Add required `name` on `QueryStateAdapter` and show it in query devtools (`Alpine Query · Nanostores`).
- Updated dependencies [26bf083]
  - @ailuracode/alpine-query@0.3.1

## 1.0.0

### Minor Changes

- 75eb769: Add three independent query adapter plugins (Alpine.reactive, Nanostores, Zustand). The core package is now store-agnostic and no longer exports a default Alpine plugin.

### Patch Changes

- Updated dependencies [75eb769]
  - @ailuracode/alpine-query@0.3.0
