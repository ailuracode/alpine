---
title: "Env"
description: "Paquete: @ailuracode/alpine-env"
---

Package: `@ailuracode/alpine-env`

Magics del entorno del navegador en un solo paquete: conectividad, visibilidad de pestaña, batería y detección de plataforma.

## Magics

| Magic | Descripción |
|-------|-------------|
| `$network` | Estado online / offline |
| `$visibility` | Visibilidad de pestaña (Page Visibility API) |
| `$battery` | Nivel de batería y carga |
| `$platform` | Detección de SO y dispositivo |

## Instalación

```bash
npm install @ailuracode/alpine-env alpinejs
```

## Configuración

```js
import Alpine from "alpinejs";
import env from "@ailuracode/alpine-env";

Alpine.plugin(env());
Alpine.start();
```

## Registro selectivo

```js
Alpine.plugin(env({ battery: false, visibility: false }));
```

## `$network`

Conectividad reactiva desde `navigator.onLine`.

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `isOnline` | `boolean` | `true` cuando hay conexión |
| `isOffline` | `boolean` | `true` cuando no hay conexión |

```html
<div x-show="$network.isOffline">Estás sin conexión</div>
```

## `$visibility`

Visibilidad reactiva de la pestaña desde la Page Visibility API.

| Propiedad / método | Tipo | Descripción |
|--------------------|------|-------------|
| `isVisible` | `boolean` | La pestaña es visible |
| `isHidden` | `boolean` | La pestaña está oculta |
| `state` | `"visible" \| "hidden" \| "prerender"` | Estado bruto de visibilidad |
| `is(state)` | `(state) => boolean` | Compara el estado actual |

```html
<div x-show="$visibility.isHidden">La pestaña está en segundo plano</div>
```

`$visibility` lo registra [`@ailuracode/alpine-env`](./env.md). Combínalo con [`@ailuracode/alpine-attention`](./attention.md) cuando también necesites wake lock o detección de inactividad.

## `$battery`

Estado reactivo de la batería cuando la Battery Status API está disponible.

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `level` | `number \| null` | Nivel de carga 0–1 |
| `charging` | `boolean \| null` | Si el dispositivo se está cargando |
| `supported` | `boolean` | API disponible en este navegador |

```html
<span x-text="`${Math.round(($battery.level ?? 0) * 100)}%`"></span>
```

## `$platform`

Flags de sistema operativo y dispositivo desde `navigator.userAgent` y señales relacionadas.

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `name` | `PlatformName` | `"mac"`, `"windows"`, `"ios"`, `"android"`, etc. |
| `isMac` | `boolean` | macOS |
| `isWindows` | `boolean` | Windows |
| `isIos` | `boolean` | iOS (incluye iPadOS) |
| `isAndroid` | `boolean` | Android |
| `isLinux` | `boolean` | Linux de escritorio |
| `isChromeOs` | `boolean` | ChromeOS |

```html
<button x-show="$platform.isIos">Instalar en pantalla de inicio</button>
```

Consulta [Detección de dispositivo](../device-detection.md) para cuándo usar `env` vs `media`.

## Registro independiente

Registra magics individuales sin el plugin completo:

```js
import {
  registerNetworkMagic,
  registerVisibilityMagic,
  registerBatteryMagic,
  registerPlatformMagic,
} from "@ailuracode/alpine-env";

registerNetworkMagic(Alpine);
```

Alias: `networkPlugin`, `visibilityPlugin`, `batteryPlugin`, `platformPlugin`.

## Utilidades

| Función | Descripción |
|---------|-------------|
| `readNetworkState()` | Snapshot de conectividad |
| `readVisibilityState(doc?)` | Snapshot de visibilidad de pestaña |
| `readBatteryState()` | Snapshot de batería |
| `readPlatformState()` / `createPlatformState()` | Snapshot de flags de plataforma |
| `detectPlatformName()` | Nombre del SO sin Alpine |
| `isIosDevice()` / `isAndroidDevice()` | Helpers de dispositivo (usados por `@ailuracode/alpine-notify`) |
