# @ailuracode/alpine-query-devtools

TanStack Query-style devtools panel for [`@ailuracode/alpine-query`](../query/README.md). Inspect cached queries, live status flags, mutation history, and trigger cache actions while developing.

## Install

```bash
npm install @ailuracode/alpine-query-devtools @ailuracode/alpine-query alpinejs
```

## Setup

Register **after** the query plugin:

```js
import Alpine from "alpinejs";
import query from "@ailuracode/alpine-query";
import queryDevtools from "@ailuracode/alpine-query-devtools";

Alpine.plugin(query());
Alpine.plugin(queryDevtools({ initialOpen: false, position: "bottom" }));
Alpine.start();
```

A floating **Query** button appears in the bottom-right corner. Click it to open the panel.

## Features

- Live query list with `status`, `fetchStatus`, stale state, and observer count
- Query detail view with `data`, `error`, and resolved options
- Mutation history with variables and results
- Search filter by query key
- Actions: **Refetch**, **Invalidate**, **Remove**
- Tabs for **Queries** and **Mutations**

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `position` | `"bottom"` | `"bottom"` or `"right"` panel layout |
| `initialOpen` | `false` | Open the panel on mount |
| `filter` | `""` | Initial search text |
| `storeName` | `"query"` | Alpine store name |

## Imperative API

```js
import { mountQueryDevtools, getQueryStore } from "@ailuracode/alpine-query-devtools";

const controller = mountQueryDevtools({
  store: getQueryStore(Alpine),
  position: "right",
});

controller.open();
controller.destroy();
```

## Production

Tree-shake devtools out of production bundles:

```js
if (import.meta.env.DEV) {
  const { default: queryDevtools } = await import("@ailuracode/alpine-query-devtools");
  Alpine.plugin(queryDevtools());
}
```

## License

MIT
