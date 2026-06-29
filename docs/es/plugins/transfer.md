---
title: "Transfer"
description: "Paquete: @ailuracode/alpine-transfer"
---

Package: `@ailuracode/alpine-transfer`

Magics de transferencia de datos salientes: copia al portapapeles, Web Share y descargas programáticas.

## Magics

| Magic | Descripción |
|-------|-------------|
| `$clipboard` | Copiar texto al portapapeles |
| `$share` | Web Share API |
| `$export` | Descargas programáticas de archivos |

## Instalación

```bash
npm install @ailuracode/alpine-transfer alpinejs
```

## Configuración

```js
import Alpine from "alpinejs";
import transfer from "@ailuracode/alpine-transfer";

Alpine.plugin(transfer());
Alpine.start();
```

## Registro selectivo

```js
Alpine.plugin(transfer({ share: false }));
```

## `$clipboard`

Copia texto con fallback automático entre Clipboard API y `execCommand`.

```html
<button @click="$clipboard('¡Copiado!')">Copiar</button>
```

Modos: `"auto"` (por defecto), `"clipboard"`, `"legacy"`.

```js
await $clipboard("hello", "clipboard");
await $clipboard("hello", { mode: "legacy" });
```

## `$share`

Comparte datos mediante la [Web Share API](https://developer.mozilla.org/es/docs/Web/API/Navigator/share).

```html
<button
  x-show="$share.supported"
  @click="$share({ title: 'Hola', url: location.href })"
>
  Compartir
</button>
```

| Propiedad / método | Descripción |
|--------------------|-------------|
| `supported` | `true` cuando `navigator.share` está disponible |
| `(data)` | Comparte `{ title?, text?, url?, files? }` |

## `$export`

Descarga blobs, strings o JSON como archivos.

```html
<button @click="$export({ data: csv, filename: 'report.csv', mimeType: 'text/csv' })">
  Descargar
</button>
```

| Propiedad / método | Descripción |
|--------------------|-------------|
| `supported` | `true` cuando la descarga programática está disponible |
| `(options)` | `{ data, filename, mimeType? }` |

`data` acepta `string`, `Blob`, `ArrayBuffer`, `Uint8Array` u objetos serializables (exportados como JSON).

## Registro independiente

```js
import {
  registerClipboardMagic,
  registerShareMagic,
  registerExportMagic,
} from "@ailuracode/alpine-transfer";

registerClipboardMagic(Alpine);
```

Alias: `clipboardPlugin`, `sharePlugin`, `exportPlugin`.

## Utilidades

| Función | Descripción |
|---------|-------------|
| `copyToClipboard(text, options?)` | Copiar sin Alpine |
| `shareData(data)` | Compartir sin Alpine |
| `canShareData(data)` | Si el payload se puede compartir |
| `isShareSupported()` | Disponibilidad de Web Share API |
| `exportData(options)` | Descargar sin Alpine |
| `isExportSupported()` | Disponibilidad de export |
