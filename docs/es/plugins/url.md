---
title: "URL"
description: "Paquete: @ailuracode/alpine-url"
---

Package: `@ailuracode/alpine-url`

Estado reactivo y tipado de los query params sincronizado con la URL del navegador. Define un esquema objeto [Zod](https://zod.dev) una vez para obtener inferencia en TypeScript, autocompletado y parsing en runtime para paginación, filtros, tabs y más.

## Instalación

```bash
npm install @ailuracode/alpine-url zod alpinejs
```

Requiere **Zod 3 o 4** como peer dependency.

## Configuración

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

## Inferencia de tipos

Los tipos se infieren desde tu esquema Zod — `get()`, `set()`, `query`, `push()` y `replace()` quedan tipados.

```ts
import type { UrlStoreOf } from "@ailuracode/alpine-url";

type Store = UrlStoreOf<typeof querySchema>;

$store.url.get("page"); // number | undefined
$store.url.set("tab", "settings"); // ok
$store.url.set("tab", "other"); // error TS
```

`z.coerce.number()` y `z.coerce.boolean()` encajan bien con strings de URL. Los valores inválidos pasan a `undefined` al leer desde la URL; `set()` ignora valores que no pasan la validación.

Helpers: `urlSchema()`, `urlOptions()`.

Los tipos globales no se amplían automáticamente por esquema — usa `UrlStoreOf<typeof querySchema>`, `UrlStoreFor<z.infer<typeof querySchema>>` o un cast de `Alpine.store("url")` en tu app.

## Patrones de esquema

### Paginación y filtros

```ts
z.object({
  page: z.coerce.number().optional(),
  search: z.string().optional(),
  active: z.coerce.boolean().optional(),
})
```

### Enums (tabs, vistas)

```ts
z.object({
  tab: z.enum(["overview", "settings", "billing"]).optional(),
})
```

Los valores fuera del enum se rechazan en runtime y se leen como `undefined` desde la URL.

### Arrays

Los arrays se leen desde claves repetidas (`?tags=a&tags=b`) o valores separados por comas (`?tags=a,b`). Al escribir, se usan claves repetidas.

```ts
z.object({
  tags: z.array(z.string()).optional(),
  ids: z.array(z.coerce.number()).optional(),
})
```

## Validación en runtime

Los campos se parsean con `safeParse` al leer desde la URL:

- Números coerce inválidos → `undefined`
- Booleanos inválidos → `undefined`
- Valores enum fuera de la lista → `undefined`
- Elementos de array que fallan validación → el campo pasa a `undefined`

`set()`, `push()` y `replace()` ignoran valores que no pasan la validación del esquema.

## Store API

Nombre del store: `$store.url`

### Estado

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `query` | objeto tipado | Snapshot reactivo de los query params actuales |
| `search` | `string` | Search serializado reactivo (p. ej. `?page=2`) |

### Métodos

| Método | Descripción |
|--------|-------------|
| `get(key)` | Lee un param (tipado desde el esquema) |
| `set(key, value)` | Establece o elimina un param (`null` / `undefined` elimina) |
| `has(key)` | Si el param está presente |
| `remove(key)` | Elimina un param |
| `push(updates?, state?)` | Aplica cambios y llama `history.pushState` |
| `replace(updates?, state?)` | Aplica cambios y llama `history.replaceState` |
| `sync()` | Relee params desde `window.location.search` |

### Opciones

| Opción | Tipo | Default | Descripción |
|--------|------|---------|-------------|
| `schema` | objeto Zod | requerido | Definiciones tipadas de params |
| `syncUrl` | `boolean` | `true` | Actualiza la URL del navegador al cambiar |
| `pushOnSet` | `boolean` | `false` | Usa `pushState` en `set()` / `remove()` |
| `onChange` | `(query) => void` | — | Se llama tras cambiar el query reactivo |

## Ejemplos

### Paginación

```html
<div x-data>
  <button @click="$store.url.set('page', ($store.url.get('page') ?? 1) - 1)">Anterior</button>
  <span x-text="$store.url.get('page') ?? 1"></span>
  <button @click="$store.url.set('page', ($store.url.get('page') ?? 1) + 1)">Siguiente</button>
</div>
```

### Filtro de búsqueda

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

### Actualización por lotes con historial

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

Usa `urlOptions({ schema: querySchema })` cuando necesites inferencia literal completa en un objeto de configuración aparte.

## Tipos globales

```ts
/// <reference types="@ailuracode/alpine-url/global" />
```

Amplía `Alpine.Stores.url` con una forma genérica del store. Para tipos de esquema específicos de tu app, usa `UrlStoreOf<typeof querySchema>` o `UrlStoreFor<z.infer<typeof querySchema>>`.
