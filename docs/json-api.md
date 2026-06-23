# @ailuracode/alpine-json-api

Strongly typed JSON:API client for Alpine.js.

## Install

```bash
npm install @ailuracode/alpine-json-api @ailuracode/alpine-query alpinejs
```

## Schema-driven types

`defineJsonApiSchema()` ingests your resource map and preserves literal `type` keys, attribute shapes, and relationship targets:

```ts
import { defineJsonApiSchema, createJsonApiClient } from "@ailuracode/alpine-json-api";

const schema = defineJsonApiSchema({
  articles: {
    attributes: {} as { title: string; body: string },
    relationships: {
      author: { type: "people" },
      comments: { type: "comments", many: true },
    },
  },
  people: {
    attributes: {} as { name: string },
  },
  comments: {
    attributes: {} as { body: string },
  },
});

const client = createJsonApiClient(schema, { baseUrl: "https://api.example.com" });
```

`createJsonApiClient()` and `$jsonapi` infer:

- `attributes` for each resource type
- relationship names and target resource types
- `include`, `fields`, `create`, and `update` payloads

## Alpine plugin

```js
import jsonApi from "@ailuracode/alpine-json-api";

Alpine.plugin(jsonApi({ schema, baseUrl: "/api" }));
```

Registers magic `$jsonapi` with the configured client.

## JSON:API features

- `application/vnd.api+json` `Accept` / `Content-Type` headers
- Compound documents (`included`)
- Sparse fieldsets (`fields[type]=a,b`)
- `include`, `sort`, `page`, and `filter` query params
- JSON:API error documents via `JsonApiHttpError`
- Built on `typedFetch` from `@ailuracode/alpine-query`

## Query cache integration

```js
$store.query.observe(["articles", page], () =>
  $jsonapi.findAll("articles", {
    page: { number: page, size: 10 },
    include: ["author"],
  })
);
```

## See also

- [JSON:API specification](https://jsonapi.org/format/)
- [@ailuracode/alpine-query](./query.md)
