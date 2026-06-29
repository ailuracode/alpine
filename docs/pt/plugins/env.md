---
title: "Env"
description: "Pacote: @ailuracode/alpine-env"
---

Package: `@ailuracode/alpine-env`

Magics do ambiente do navegador em um único pacote: conectividade, visibilidade da aba, bateria e detecção de plataforma.

## Magics

| Magic | Descrição |
|-------|-----------|
| `$network` | Estado online / offline |
| `$visibility` | Visibilidade da aba (Page Visibility API) |
| `$battery` | Nível de bateria e carregamento |
| `$platform` | Detecção de SO e dispositivo |

## Instalação

```bash
npm install @ailuracode/alpine-env alpinejs
```

## Configuração

```js
import Alpine from "alpinejs";
import env from "@ailuracode/alpine-env";

Alpine.plugin(env());
Alpine.start();
```

## Registro seletivo

```js
Alpine.plugin(env({ battery: false, visibility: false }));
```

## `$network`

Conectividade reativa a partir de `navigator.onLine`.

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `isOnline` | `boolean` | `true` quando online |
| `isOffline` | `boolean` | `true` quando offline |

```html
<div x-show="$network.isOffline">Você está offline</div>
```

## `$visibility`

Visibilidade reativa da aba via Page Visibility API.

| Propriedade / método | Tipo | Descrição |
|----------------------|------|-----------|
| `isVisible` | `boolean` | A aba está visível |
| `isHidden` | `boolean` | A aba está oculta |
| `state` | `"visible" \| "hidden" \| "prerender"` | Estado bruto de visibilidade |
| `is(state)` | `(state) => boolean` | Compara o estado atual |

```html
<div x-show="$visibility.isHidden">A aba está em segundo plano</div>
```

`$visibility` é registrado por [`@ailuracode/alpine-env`](./env.md). Combine com [`@ailuracode/alpine-attention`](./attention.md) quando também precisar de wake lock ou detecção de inatividade.

## `$battery`

Status reativo da bateria quando a Battery Status API está disponível.

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `level` | `number \| null` | Nível de carga 0–1 |
| `charging` | `boolean \| null` | Se o dispositivo está carregando |
| `supported` | `boolean` | API disponível neste navegador |

```html
<span x-text="`${Math.round(($battery.level ?? 0) * 100)}%`"></span>
```

## `$platform`

Flags de sistema operacional e dispositivo a partir de `navigator.userAgent` e sinais relacionados.

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `name` | `PlatformName` | `"mac"`, `"windows"`, `"ios"`, `"android"`, etc. |
| `isMac` | `boolean` | macOS |
| `isWindows` | `boolean` | Windows |
| `isIos` | `boolean` | iOS (inclui iPadOS) |
| `isAndroid` | `boolean` | Android |
| `isLinux` | `boolean` | Linux desktop |
| `isChromeOs` | `boolean` | ChromeOS |

```html
<button x-show="$platform.isIos">Instalar na tela inicial</button>
```

Veja [Detecção de dispositivo](../device-detection.md) para quando usar `env` vs `media`.

## Registro independente

Registre magics individuais sem o plugin completo:

```js
import {
  registerNetworkMagic,
  registerVisibilityMagic,
  registerBatteryMagic,
  registerPlatformMagic,
} from "@ailuracode/alpine-env";

registerNetworkMagic(Alpine);
```

Aliases: `networkPlugin`, `visibilityPlugin`, `batteryPlugin`, `platformPlugin`.

## Utilitários

| Função | Descrição |
|--------|-----------|
| `readNetworkState()` | Snapshot de conectividade |
| `readVisibilityState(doc?)` | Snapshot de visibilidade da aba |
| `readBatteryState()` | Snapshot de bateria |
| `readPlatformState()` / `createPlatformState()` | Snapshot de flags de plataforma |
| `detectPlatformName()` | Nome do SO sem Alpine |
| `isIosDevice()` / `isAndroidDevice()` | Helpers de dispositivo (usados por `@ailuracode/alpine-notify`) |
