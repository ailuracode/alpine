---
title: "Transfer"
description: "Pacote: @ailuracode/alpine-transfer"
---

Package: `@ailuracode/alpine-transfer`

Magics de transferência de dados de saída: cópia para a área de transferência, Web Share e downloads programáticos.

## Magics

| Magic | Descrição |
|-------|-----------|
| `$clipboard` | Copiar texto para a área de transferência |
| `$share` | Web Share API |
| `$export` | Downloads programáticos de arquivos |

## Instalação

```bash
npm install @ailuracode/alpine-transfer alpinejs
```

## Configuração

```js
import Alpine from "alpinejs";
import transfer from "@ailuracode/alpine-transfer";

Alpine.plugin(transfer());
Alpine.start();
```

## Registro seletivo

```js
Alpine.plugin(transfer({ share: false }));
```

## `$clipboard`

Copia texto com fallback automático entre Clipboard API e `execCommand`.

```html
<button @click="$clipboard('Copiado!')">Copiar</button>
```

Modos: `"auto"` (padrão), `"clipboard"`, `"legacy"`.

```js
await $clipboard("hello", "clipboard");
await $clipboard("hello", { mode: "legacy" });
```

## `$share`

Compartilha dados via [Web Share API](https://developer.mozilla.org/pt-BR/docs/Web/API/Navigator/share).

```html
<button
  x-show="$share.supported"
  @click="$share({ title: 'Olá', url: location.href })"
>
  Compartilhar
</button>
```

| Propriedade / método | Descrição |
|--------------------|-----------|
| `supported` | `true` quando `navigator.share` está disponível |
| `(data)` | Compartilha `{ title?, text?, url?, files? }` |

## `$export`

Baixa blobs, strings ou JSON como arquivos.

```html
<button @click="$export({ data: csv, filename: 'report.csv', mimeType: 'text/csv' })">
  Baixar
</button>
```

| Propriedade / método | Descrição |
|--------------------|-----------|
| `supported` | `true` quando o download programático está disponível |
| `(options)` | `{ data, filename, mimeType? }` |

`data` aceita `string`, `Blob`, `ArrayBuffer`, `Uint8Array` ou objetos serializáveis (exportados como JSON).

## Registro independente

```js
import {
  registerClipboardMagic,
  registerShareMagic,
  registerExportMagic,
} from "@ailuracode/alpine-transfer";

registerClipboardMagic(Alpine);
```

Aliases: `clipboardPlugin`, `sharePlugin`, `exportPlugin`.

## Utilitários

| Função | Descrição |
|--------|-----------|
| `copyToClipboard(text, options?)` | Copiar sem Alpine |
| `shareData(data)` | Compartilhar sem Alpine |
| `canShareData(data)` | Se o payload pode ser compartilhado |
| `isShareSupported()` | Disponibilidade da Web Share API |
| `exportData(options)` | Baixar sem Alpine |
| `isExportSupported()` | Disponibilidade de export |
