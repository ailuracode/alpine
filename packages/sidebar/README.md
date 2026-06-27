# @ailuracode/alpine-sidebar

Alpine.js sidebar store focused on **visibility** — open/close state, overlay, keyboard navigation, and responsive breakpoints. Compose with `@ailuracode/alpine-scroll` for body scroll locking.

The plugin is intentionally **headless** and knows nothing about the width, mode, or appearance of your sidebar. The consumer owns the visual representation (drawer, rail, mini, expanded, floating, etc.) via local Alpine state.

**[Full documentation →](../../docs/plugins/sidebar.md)**

## Install

```bash
npm install @ailuracode/alpine-sidebar alpinejs
```

## Setup

```js
import Alpine from "alpinejs";
import sidebar from "@ailuracode/alpine-sidebar";

Alpine.plugin(sidebar());
Alpine.start();
```

All visual changes (classes, attributes, transitions) are applied via callbacks — no CSS framework is assumed.

## Store API

Store name: `$store.sidebar`

### State

| Property | Type | Description |
|----------|------|-------------|
| `visible` | `boolean` | Whether the sidebar is currently visible |
| `matchesBreakpoint` | `boolean` | Whether the breakpoint query matches |

### Getters

| Getter | Description |
|--------|-------------|
| `isVisible` | Alias for `visible` |
| `hasOverlay` | `true` when visible and `closeOnOverlayClick` is enabled |

### Methods

| Method | Description |
|--------|-------------|
| `show()` | Show the sidebar |
| `hide()` | Hide the sidebar |
| `toggle()` | Toggle visible/hidden |

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `closeOnEscape` | `boolean` | `true` | Hide on Escape key |
| `closeOnOverlayClick` | `boolean` | `true` | Hide when overlay is clicked |
| `breakpoint` | `string` | — | CSS media query for auto-hide |
| `onShow` | `() => void` | — | Called when the sidebar becomes visible |
| `onHide` | `() => void` | — | Called when the sidebar becomes hidden |
| `onOverlayClick` | `() => void` | — | Called when the overlay is clicked |

## HTML examples

### Basic sidebar with callbacks

```js
Alpine.plugin(
  sidebar({
    onShow() {
      document.documentElement.setAttribute("data-sidebar", "");
    },
    onHide() {
      document.documentElement.removeAttribute("data-sidebar");
    },
  }),
);
```

### Sidebar with overlay

```html
<button @click="$store.sidebar.toggle()">Toggle sidebar</button>

<!-- Overlay -->
<div
  x-show="$store.sidebar.hasOverlay"
  x-transition.opacity
  @click="$store.sidebar.hide()"
  class="overlay"
></div>

<!-- Sidebar panel -->
<aside
  x-show="$store.sidebar.visible"
  x-transition:enter="transition-slide-left"
  x-transition:leave="transition-slide-left-reverse"
>
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>
  <button @click="$store.sidebar.hide()">Close</button>
</aside>
```

### Manage visual width locally

The plugin only controls visibility. Define your own width / mode in Alpine:

```html
<div
  x-data="{ expanded: true }"
  :class="expanded ? 'w-64' : 'w-16'"
>
  <button @click="expanded = !expanded">Toggle width</button>

  <aside x-show="$store.sidebar.visible">
    <!-- … -->
  </aside>
</div>
```

### With scroll lock integration

```js
import scroll from "@ailuracode/alpine-scroll";
import sidebar from "@ailuracode/alpine-sidebar";

Alpine.plugin(scroll());
Alpine.plugin(
  sidebar({
    onShow() {
      Alpine.store("scroll").lock();
    },
    onHide() {
      Alpine.store("scroll").unlock();
    },
  }),
);
```

### With breakpoint auto-hide

```js
Alpine.plugin(
  sidebar({
    breakpoint: "(min-width: 1024px)",
    onShow() {
      document.documentElement.setAttribute("data-sidebar", "");
    },
    onHide() {
      document.documentElement.removeAttribute("data-sidebar");
    },
  }),
);
```

When the viewport no longer matches the breakpoint, the sidebar auto-hides.
