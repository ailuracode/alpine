---
title: "Query kit"
description: "Pacote: @ailuracode/alpine-query-kit"
---

Package: `@ailuracode/alpine-query-kit`

Stack de query Alpine recomendado: núcleo de cache agnóstico ao store, adaptador Nanostores, `@nanostores/alpine` e o painel de devtools — em um único pacote.

## Inclui

| Módulo | Descrição |
|--------|-----------|
| Query cache | Reexporta `@ailuracode/alpine-query` (`$store.query`, `queryKey`, …) |
| Adaptador Nanostores | `nanostoresQueryAdapter`, `createAlpineNanostoresAdapter`, `NanoStores` |
| Devtools | Painel inspector para o cache de query |

Para setups apenas Alpine/Zustand sem Nanostores, use [`@ailuracode/alpine-query`](../query.md) com [`query-adapter-alpine`](../query.md) ou [`query-adapter-zustand`](../query.md).

## Instalação

```bash
npm install @ailuracode/alpine-query-kit alpinejs nanostores @nanostores/alpine
```

## Configuração

```js
import Alpine from "alpinejs";
import queryKit from "@ailuracode/alpine-query-kit";

Alpine.plugin(queryKit());
Alpine.start();
```

Registra `$store.query`, `@nanostores/alpine` (`x-nano`, `$nano`) e o painel de devtools.

## Sem devtools

```js
Alpine.plugin(queryKit({ devtools: false }));
```

## Apenas adaptador Nanostores

```js
import query, { createAlpineNanostoresAdapter } from "@ailuracode/alpine-query-kit";

Alpine.plugin(query({ adapter: createAlpineNanostoresAdapter }));
```

Ou registre `$nano` sem o store de query:

```js
import { NanoStores } from "@ailuracode/alpine-query-kit";

Alpine.plugin(NanoStores);
```

## Devtools

O painel de devtools monta após `alpine:initialized`. Configure posição, canto do toggle e persistência:

```js
import queryKit, { queryDevtoolsPlugin } from "@ailuracode/alpine-query-kit";

// Incluído por padrão em queryKit()
Alpine.plugin(queryKit());

// Ou registre separadamente (p. ex. com query core + outro adaptador)
Alpine.plugin(
  queryDevtoolsPlugin({
    position: "bottom",
    toggleCorner: "bottom-left",
    storeName: "query",
  })
);
```

Lazy-load em produção:

```js
if (import.meta.env.DEV) {
  const { default: queryDevtools } = await import("@ailuracode/alpine-query-kit");
  Alpine.plugin(queryDevtools({ devtools: false }));
  Alpine.plugin((await import("@ailuracode/alpine-query-kit")).queryDevtoolsPlugin());
}
```

### Opções de devtools

| Opção | Default | Descrição |
|-------|---------|-----------|
| `position` | `"bottom"` | Painel acoplado: `"bottom"` ou `"right"` |
| `toggleCorner` | `"bottom-right"` | Posição do toggle flutuante |
| `persistToggleCorner` | `true` | Salva o canto do toggle em `localStorage` |
| `persistPreferences` | `true` | Salva preferências do painel |
| `followLatest` | `true` | Auto-seleciona a atividade de query mais recente |
| `initialOpen` | `false` | Abrir painel ao carregar |
| `filter` | `""` | Filtro inicial |
| `storeName` | `"query"` | Nome do store Alpine a inspecionar |
| `additionalStores` | — | Stores de query extras para mesclar no painel |

## Exports

Todas as APIs públicas do cache de query, adaptador Nanostores e devtools são exportadas deste pacote:

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

Veja [Query cache](../query.md) para opções de fetch, mutações e criação de adaptadores.
