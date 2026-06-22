# Getting started

## Requirements

- [Alpine.js](https://alpinejs.dev/) v3+
- A bundler with ESM support (Vite, Webpack, etc.) or native ES modules in the browser

## Installation

Install Alpine.js and one or more packages:

```bash
npm install alpinejs @airluracode/alpine-theme @airluracode/alpine-screen
```

## Registration

Register plugins **before** `Alpine.start()`:

```js
import Alpine from "alpinejs";
import theme from "@airluracode/alpine-theme";
import screen from "@airluracode/alpine-screen";
import online from "@airluracode/alpine-online";

Alpine.plugin(theme({ onChange: applyTheme }));
Alpine.plugin(screen);
Alpine.plugin(online);

Alpine.start();
```

Some plugins accept options (e.g. `theme`). Others are plain functions:

```js
Alpine.plugin(screen);
Alpine.plugin(online);
```

## Using in HTML

### Stores

Access global reactive state with `$store`:

```html
<button :class="{ active: $store.theme.isDark }" @click="$store.theme.set('dark')">
  Dark
</button>

<div x-show="$store.device.isMobile">Mobile layout</div>
```

### Magics

Read environment state or call utilities directly:

```html
<div x-show="!$online.isOnline">You are offline</div>

<button @click="await $clipboard('Hello')">Copy</button>

<p x-show="$touch.isTouch">Touch-optimized UI</p>
```

## Combining packages

```js
import Alpine from "alpinejs";
import theme from "@airluracode/alpine-theme";
import scroll from "@airluracode/alpine-scroll";

function applyTheme({ resolved }) {
  document.documentElement.dataset.theme = resolved;
}

Alpine.plugin(theme({ onChange: applyTheme }));
Alpine.plugin(scroll);

Alpine.start();
```

```html
<div
  class="progress"
  :style="`width: ${$store.scroll.progress}%`"
></div>

<button x-show="$store.scroll.showToTop" @click="$store.scroll.toTop()">
  Back to top
</button>
```

## TypeScript

These packages ship as plain JavaScript modules. For TypeScript projects, add declarations in your project or use JSDoc:

```js
/** @type {import('alpinejs').Alpine} */
const Alpine = window.Alpine;
```

## Next steps

- [Architecture: stores vs magics](./architecture.md) — when to use each pattern
- Individual package docs: [theme](./theme.md), [screen](./screen.md), [online](./online.md), [clipboard](./clipboard.md), [scroll](./scroll.md), [touch](./touch.md)
