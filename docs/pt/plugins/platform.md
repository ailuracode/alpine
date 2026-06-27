---
title: "Platform"
description: "Deteção de SO, browser e dispositivo com $platform."
---

Package: `@ailuracode/alpine-platform`

Detecta o sistema operacional e a plataforma do cliente via magic `$platform`.

## Instalação

```bash
npm install @ailuracode/alpine-platform alpinejs
```

## Configuração

```js
import Alpine from "alpinejs";
import platform from "@ailuracode/alpine-platform";

Alpine.plugin(platform);
Alpine.start();
```

## Magic API

| Propriedade | Tipo | Descrição |
|----------|------|-------------|
| `name` | `PlatformName` (getter) | Plataforma resolvida |
| `isMac` | `boolean` (getter) | macOS desktop |
| `isWindows` | `boolean` (getter) | Windows |
| `isLinux` | `boolean` (getter) | Linux desktop |
| `isIos` | `boolean` (getter) | iOS / iPadOS |
| `isAndroid` | `boolean` (getter) | Android |
| `isChromeos` | `boolean` (getter) | ChromeOS |
| `is(platform)` | `boolean` | `true` quando `name` corresponde à plataforma informada |

## Exemplos HTML

```html
<p x-show="$platform.isMac">Use ⌘ shortcuts</p>
<p x-show="$platform.isWindows">Use Ctrl shortcuts</p>
<p x-show="$platform.isIos">iOS-specific instructions</p>

<p>Platform: <span x-text="$platform.name"></span></p>
```

## Helpers exportados

Funções puras de detecção são exportadas para reutilização em outros pacotes:

```js
import {
  PLATFORM_NAMES,
  createPlatformState,
  detectPlatformName,
  isAndroidDevice,
  isIosDevice,
  isLinuxDevice,
  isMacDevice,
  isWindowsDevice,
  platformFlags,
  readPlatformState,
} from "@ailuracode/alpine-platform";
```

`@ailuracode/alpine-notify` usa `isIosDevice()` e `isAndroidDevice()` internamente para entrega de notificações em dispositivos móveis.

## Estratégia de detecção

1. `navigator.userAgentData.platform` (Client Hints) quando disponível
2. `navigator.userAgent` e `navigator.platform`
3. Modo desktop do iPadOS via `MacIntel` + `maxTouchPoints > 1`

## Casos de uso

- Exibir dicas de atalhos de teclado específicas do SO
- Ramificar instruções de instalação ou permissão (ex.: Home Screen no iOS)
- Complementar `@ailuracode/alpine-screen` (viewport) e `@ailuracode/alpine-touch` (ponteiro)

## Notas

- Magic somente leitura — sem store
- Agnóstico a framework CSS
- A plataforma é resolvida uma vez no carregamento do plugin (estática durante a sessão)
