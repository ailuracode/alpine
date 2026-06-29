---
title: "URL"
description: "Pacote: @ailuracode/alpine-url"
---

Package: `@ailuracode/alpine-url`

Estado reativo e tipado dos query params sincronizado com a URL do navegador. Defina um esquema objeto [Zod](https://zod.dev) uma vez para obter inferência em TypeScript, autocompletar e parsing em runtime para paginação, filtros, tabs e mais.

## Instalação

```bash
npm install @ailuracode/alpine-url zod alpinejs
```

Requer **Zod 3 ou 4** como peer dependency.

## Configuração

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

## Inferência de tipos

Os tipos são inferidos do seu esquema Zod — `get()`, `set()`, `query`, `push()` e `replace()` ficam tipados.

```ts
import type { UrlStoreOf } from "@ailuracode/alpine-url";

type Store = UrlStoreOf<typeof querySchema>;

$store.url.get("page"); // number | undefined
$store.url.set("tab", "settings"); // ok
$store.url.set("tab", "other"); // erro TS
```

`z.coerce.number()` e `z.coerce.boolean()` funcionam bem com strings de URL. Valores inválidos passam a `undefined` ao ler da URL; `set()` ignora valores que falham na validação.

Helpers: `urlSchema()`, `urlOptions()`.

Os tipos globais não são ampliados automaticamente por esquema — use `UrlStoreOf<typeof querySchema>`, `UrlStoreFor<z.infer<typeof querySchema>>` ou um cast de `Alpine.store("url")` na sua app.

## Padrões de esquema

### Paginação e filtros

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

Valores fora do enum são rejeitados em runtime e lidos como `undefined` da URL.

### Arrays

Arrays são lidos de chaves repetidas (`?tags=a&tags=b`) ou valores separados por vírgula (`?tags=a,b`). Ao escrever, usa-se chaves repetidas.

```ts
z.object({
  tags: z.array(z.string()).optional(),
  ids: z.array(z.coerce.number()).optional(),
})
```

## Validação em runtime

Os campos são parseados com `safeParse` ao ler da URL:

- Números coerce inválidos → `undefined`
- Booleanos inválidos → `undefined`
- Valores enum fora da lista → `undefined`
- Elementos de array que falham validação → o campo passa a `undefined`

`set()`, `push()` e `replace()` ignoram valores que não passam na validação do esquema.

## Store API

Nome do store: `$store.url`

### Estado

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `query` | objeto tipado | Snapshot reativo dos query params atuais |
| `search` | `string` | Search serializado reativo (ex.: `?page=2`) |

### Métodos

| Método | Descrição |
|--------|-----------|
| `get(key)` | Lê um param (tipado pelo esquema) |
| `set(key, value)` | Define ou remove um param (`null` / `undefined` remove) |
| `has(key)` | Se o param está presente |
| `remove(key)` | Remove um param |
| `push(updates?, state?)` | Aplica mudanças e chama `history.pushState` |
| `replace(updates?, state?)` | Aplica mudanças e chama `history.replaceState` |
| `sync()` | Relê params de `window.location.search` |

### Opções

| Opção | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| `schema` | objeto Zod | obrigatório | Definições tipadas de params |
| `syncUrl` | `boolean` | `true` | Atualiza a URL do navegador ao mudar |
| `pushOnSet` | `boolean` | `false` | Usa `pushState` em `set()` / `remove()` |
| `onChange` | `(query) => void` | — | Chamado após mudar o query reativo |

## Exemplos

### Paginação

```html
<div x-data>
  <button @click="$store.url.set('page', ($store.url.get('page') ?? 1) - 1)">Anterior</button>
  <span x-text="$store.url.get('page') ?? 1"></span>
  <button @click="$store.url.set('page', ($store.url.get('page') ?? 1) + 1)">Próximo</button>
</div>
```

### Filtro de busca

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

### Atualização em lote com histórico

```js
$store.url.push({ page: 1, tab: "settings" });
```

## Helpers exportados

```js
import {
  createUrlPlugin,
  createSchemaHandler,
  urlOptions,
  urlSchema,
  readLocationSearch,
} from "@ailuracode/alpine-url";
```

Use `urlOptions({ schema: querySchema })` quando precisar de inferência literal completa em um objeto de configuração separado.

## Tipos globais

```ts
/// <reference types="@ailuracode/alpine-url/global" />
```

Amplia `Alpine.Stores.url` com uma forma genérica do store. Para tipos de esquema específicos da app, use `UrlStoreOf<typeof querySchema>` ou `UrlStoreFor<z.infer<typeof querySchema>>`.
