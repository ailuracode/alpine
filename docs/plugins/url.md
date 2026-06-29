---
title: "URL"
description: "Package: @ailuracode/alpine-url"
---

Package: `@ailuracode/alpine-url`

Reactive, typed query-param state synced with the browser URL. Define a [Zod](https://zod.dev) object schema once to get TypeScript inference, autocomplete, and runtime parsing for pagination, filters, tabs, and more.

## Install

```bash
npm install @ailuracode/alpine-url zod alpinejs
```

Requires **Zod 3 or 4** as a peer dependency.

## Setup

```ts
import Alpine from "alpinejs";
import createUrlPlugin from "@ailuracode/alpine-url";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().optional(),
  search: z.string().optional(),
  active: z.coerce.boolean().optional(),
  tags: z.array(z.string()).optional(),
  tab: z.enum(["overview", "settings", "billing"]).optional(),
});

Alpine.plugin(createUrlPlugin({ schema: querySchema }));
Alpine.start();
```

## Type inference

Types are inferred from your Zod schema — `get()`, `set()`, `query`, `push()`, and `replace()` are all typed.

```ts
import type { UrlStoreOf } from "@ailuracode/alpine-url";

type Store = UrlStoreOf<typeof querySchema>;

$store.url.get("page"); // number | undefined
$store.url.set("tab", "settings"); // ok
$store.url.set("tab", "other"); // TS error
```

`z.coerce.number()` and `z.coerce.boolean()` work well for URL strings. Invalid values become `undefined` when read from the URL; `set()` ignores values that fail validation.

Helpers: `urlSchema()`, `urlOptions()`.

Global types are not auto-augmented per schema — use `UrlStoreOf<typeof querySchema>`, `UrlStoreFor<z.infer<typeof querySchema>>`, or cast `Alpine.store("url")` in app code.

## Schema patterns

### Pagination and filters

```ts
z.object({
  page: z.coerce.number().optional(),
  search: z.string().optional(),
  active: z.coerce.boolean().optional(),
})
```

### Enums (tabs, views)

```ts
z.object({
  tab: z.enum(["overview", "settings", "billing"]).optional(),
})
```

Values outside the enum are rejected at runtime and become `undefined` when read from the URL.

### Arrays

Arrays are read from repeated query keys (`?tags=a&tags=b`) or comma-separated values (`?tags=a,b`). On write, repeated keys are used.

```ts
z.object({
  tags: z.array(z.string()).optional(),
  ids: z.array(z.coerce.number()).optional(),
})
```

## Runtime validation

Fields are parsed with `safeParse` when reading from the URL:

- Invalid coerced numbers → `undefined`
- Invalid booleans → `undefined`
- Enum values outside the list → `undefined`
- Array elements that fail item validation → field becomes `undefined`

`set()`, `push()`, and `replace()` ignore values that fail schema validation.

## Store API

Store name: `$store.url`

### State

| Property | Type | Description |
|----------|------|-------------|
| `query` | typed object | Reactive snapshot of current query params |
| `search` | `string` | Reactive serialized search (e.g. `?page=2`) |

### Methods

| Method | Description |
|--------|-------------|
| `get(key)` | Read a single param (typed from schema) |
| `set(key, value)` | Set or remove a param (`null` / `undefined` removes) |
| `has(key)` | Whether the param is present |
| `remove(key)` | Remove a param |
| `push(updates?, state?)` | Apply updates and call `history.pushState` |
| `replace(updates?, state?)` | Apply updates and call `history.replaceState` |
| `sync()` | Re-read params from `window.location.search` |

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `schema` | Zod object | required | Typed param definitions |
| `syncUrl` | `boolean` | `true` | Update the browser URL on changes |
| `pushOnSet` | `boolean` | `false` | Use `pushState` for `set()` / `remove()` |
| `onChange` | `(query) => void` | — | Called after the reactive query changes |

## Examples

### Pagination

```html
<div x-data>
  <button @click="$store.url.set('page', ($store.url.get('page') ?? 1) - 1)">Prev</button>
  <span x-text="$store.url.get('page') ?? 1"></span>
  <button @click="$store.url.set('page', ($store.url.get('page') ?? 1) + 1)">Next</button>
</div>
```

### Search filter

```html
<input
  type="search"
  :value="$store.url.get('search') ?? ''"
  @input.debounce.300ms="$store.url.set('search', $event.target.value || null)"
/>
```

### Tabs

```html
<nav class="flex gap-2">
  <template x-for="tab in ['overview', 'settings', 'billing']" :key="tab">
    <button
      @click="$store.url.set('tab', tab)"
      :aria-current="$store.url.get('tab') === tab ? 'page' : false"
      x-text="tab"
    ></button>
  </template>
</nav>
```

### Batch update with history

```js
$store.url.push({ page: 1, tab: "settings" });
```

## Exported helpers

```js
import {
  createUrlPlugin,
  createSchemaHandler,
  urlOptions,
  urlSchema,
  readLocationSearch,
} from "@ailuracode/alpine-url";
```

Use `urlOptions({ schema: querySchema })` when you need full literal inference in a separate config object.

## Global types

```ts
/// <reference types="@ailuracode/alpine-url/global" />
```

Augments `Alpine.Stores.url` with a generic store shape. For app-specific schema types, use `UrlStoreOf<typeof querySchema>` or `UrlStoreFor<z.infer<typeof querySchema>>`.
