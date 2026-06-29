# @ailuracode/alpine-query-kit

## 0.1.0

### Minor Changes

- 531ed60: Unify the recommended Alpine query stack into one package with inlined source.

  - Nanostores adapter (`nanostoresQueryAdapter`, `createAlpineNanostoresAdapter`, `NanoStores`)
  - Query devtools panel (`queryDevtoolsPlugin`, `mountQueryDevtools`)
  - Re-exports `@ailuracode/alpine-query`

  Removed standalone packages: `@ailuracode/alpine-query-adapter-nanostores`, `@ailuracode/alpine-query-devtools`.

  Migrate imports to `@ailuracode/alpine-query-kit`. Use `queryKit({ devtools: false })` when you only need the cache + Nanostores adapter.
