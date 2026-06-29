---
title: "Query kit"
description: "Paquete: @ailuracode/alpine-query-kit"
---

Package: `@ailuracode/alpine-query-kit`

Stack de query Alpine recomendado: núcleo de caché agnóstico al store, adaptador Nanostores, `@nanostores/alpine` y el panel de devtools — en un solo paquete.

## Incluye

| Módulo | Descripción |
|--------|-------------|
| Query cache | Reexporta `@ailuracode/alpine-query` (`$store.query`, `queryKey`, …) |
| Adaptador Nanostores | `nanostoresQueryAdapter`, `createAlpineNanostoresAdapter`, `NanoStores` |
| Devtools | Panel inspector para la caché de query |

Para setups solo Alpine/Zustand sin Nanostores, usa [`@ailuracode/alpine-query`](../query.md) con [`query-adapter-alpine`](../query.md) o [`query-adapter-zustand`](../query.md).

## Instalación

```bash
npm install @ailuracode/alpine-query-kit alpinejs nanostores @nanostores/alpine
```

## Configuración

```js
import Alpine from "alpinejs";
import queryKit from "@ailuracode/alpine-query-kit";

Alpine.plugin(queryKit());
Alpine.start();
```

Registra `$store.query`, `@nanostores/alpine` (`x-nano`, `$nano`) y el panel de devtools.

## Sin devtools

```js
Alpine.plugin(queryKit({ devtools: false }));
```

## Solo adaptador Nanostores

```js
import query, { createAlpineNanostoresAdapter } from "@ailuracode/alpine-query-kit";

Alpine.plugin(query({ adapter: createAlpineNanostoresAdapter }));
```

O registra `$nano` sin el store de query:

```js
import { NanoStores } from "@ailuracode/alpine-query-kit";

Alpine.plugin(NanoStores);
```

## Devtools

El panel de devtools se monta tras `alpine:initialized`. Configura posición, esquina del toggle y persistencia:

```js
import queryKit, { queryDevtoolsPlugin } from "@ailuracode/alpine-query-kit";

// Incluido por defecto en queryKit()
Alpine.plugin(queryKit());

// O regístralo por separado (p. ej. con query core + otro adaptador)
Alpine.plugin(
  queryDevtoolsPlugin({
    position: "bottom",
    toggleCorner: "bottom-left",
    storeName: "query",
  })
);
```

Carga lazy en producción:

```js
if (import.meta.env.DEV) {
  const { default: queryDevtools } = await import("@ailuracode/alpine-query-kit");
  Alpine.plugin(queryDevtools({ devtools: false }));
  Alpine.plugin((await import("@ailuracode/alpine-query-kit")).queryDevtoolsPlugin());
}
```

### Opciones de devtools

| Opción | Default | Descripción |
|--------|---------|-------------|
| `position` | `"bottom"` | Panel acoplado: `"bottom"` o `"right"` |
| `toggleCorner` | `"bottom-right"` | Posición del toggle flotante |
| `persistToggleCorner` | `true` | Guarda la esquina del toggle en `localStorage` |
| `persistPreferences` | `true` | Guarda preferencias del panel |
| `followLatest` | `true` | Auto-selecciona la actividad de query más reciente |
| `initialOpen` | `false` | Abrir panel al cargar |
| `filter` | `""` | Filtro inicial |
| `storeName` | `"query"` | Nombre del store Alpine a inspeccionar |
| `additionalStores` | — | Stores de query extra para fusionar en el panel |

## Exports

Todas las APIs públicas de la caché de query, el adaptador Nanostores y devtools se exportan desde este paquete:

```js
import queryKit, {
  queryKey,
  nanostoresQueryAdapter,
  createAlpineNanostoresAdapter,
  nanostoresQueryPlugin,
  queryDevtoolsPlugin,
  mountQueryDevtools,
} from "@ailuracode/alpine-query-kit";
```

Consulta [Query cache](../query.md) para opciones de fetch, mutaciones y autoría de adaptadores.
