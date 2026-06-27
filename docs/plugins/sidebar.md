---
title: "Sidebar"
description: "Package: @ailuracode/alpine-sidebar"
---

Package: `@ailuracode/alpine-sidebar`

Controls sidebar **visibility** (show / hide / toggle) with overlay, keyboard navigation, and responsive breakpoints. CSS-framework agnostic — all visual changes are applied via callbacks. Compose with `@ailuracode/alpine-scroll` for body scroll locking.

The plugin is intentionally **headless** and does not know about the width, mode, or appearance of your sidebar. The visual representation (drawer, rail, mini, expanded, floating, etc.) is owned by the consumer via local Alpine state.

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

### With callbacks

Apply your own CSS classes or attributes when the sidebar visibility changes:

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

### With scroll lock

Compose with `@ailuracode/alpine-scroll` via callbacks to lock body scroll when the sidebar is visible:

```js
import scroll from "@ailuracode/alpine-scroll";
import sidebar from "@ailuracode/alpine-sidebar";

Alpine.plugin(scroll());
Alpine.plugin(
  sidebar({
    onShow() {
      document.documentElement.setAttribute("data-sidebar", "");
      Alpine.store("scroll").lock();
    },
    onHide() {
      document.documentElement.removeAttribute("data-sidebar");
      Alpine.store("scroll").unlock();
    },
  }),
);
```

## Exported helpers

```js
import { sidebarOptions } from "@ailuracode/alpine-sidebar";
```

## Store API

Store name: `$store.sidebar`

### State

| Property | Type | Description |
|----------|------|-------------|
| `visible` | `boolean` | Whether the sidebar is currently visible |
| `matchesBreakpoint` | `boolean` | Whether the breakpoint media query currently matches |

### Getters

| Getter | Description |
|--------|-------------|
| `isVisible` | Alias for `visible` |
| `hasOverlay` | `true` when visible and `closeOnOverlayClick` is enabled (default) |

### Methods

| Method | Description |
|--------|-------------|
| `show()` | Show the sidebar |
| `hide()` | Hide the sidebar |
| `toggle()` | Toggle visible/hidden |

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `closeOnEscape` | `boolean` | `true` | Hide sidebar on Escape key press |
| `closeOnOverlayClick` | `boolean` | `true` | Hide sidebar when overlay is clicked |
| `breakpoint` | `string` | — | CSS media query — auto-hides when it no longer matches |
| `onShow` | `() => void` | — | Called when the sidebar becomes visible |
| `onHide` | `() => void` | — | Called when the sidebar becomes hidden |
| `onOverlayClick` | `() => void` | — | Called when the overlay is clicked |

## HTML examples

### Sidebar with overlay and transitions

```html
<div x-data>
  <button @click="$store.sidebar.toggle()">Toggle sidebar</button>

  <!-- Overlay -->
  <div
    x-show="$store.sidebar.hasOverlay"
    x-transition.opacity
    class="fixed inset-0 bg-black/50 z-40"
    @click="$store.sidebar.hide()"
  ></div>

  <!-- Sidebar panel -->
  <aside
    x-show="$store.sidebar.visible"
    x-transition:enter="transition ease-out duration-300"
    x-transition:enter-start="-translate-x-full"
    x-transition:enter-end="translate-x-0"
    x-transition:leave="transition ease-in duration-200"
    x-transition:leave-start="translate-x-0"
    x-transition:leave-end="-translate-x-full"
    class="fixed inset-y-0 left-0 z-50 w-64 bg-base-100 shadow-lg"
  >
    <nav class="p-4">
      <a href="/" class="block py-2">Home</a>
      <a href="/about" class="block py-2">About</a>
    </nav>
    <button @click="$store.sidebar.hide()" class="absolute top-4 right-4">✕</button>
  </aside>
</div>
```

### Responsive auto-hide

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

When the viewport crosses the breakpoint, the sidebar auto-hides.

### Visual width is owned by the consumer

The plugin does not track width or mode. Define your own visual state in Alpine — for example, a 16rem panel vs. a 4rem rail:

```html
<div x-data="{ expanded: true }">
  <button @click="expanded = !expanded">
    <span x-text="expanded ? 'Collapse' : 'Expand'"></span>
  </button>

  <aside
    x-show="$store.sidebar.visible"
    x-transition
    :class="expanded ? 'w-64' : 'w-16'"
  >
    <a href="/" x-show="expanded">Home</a>
    <a href="/about" x-show="expanded">About</a>
  </aside>
</div>
```

You can swap this for any other strategy — a `data-mode` attribute, a separate `x-data` for the rail, a CSS-only implementation, or nothing at all.

## See also

- [Scroll](./scroll.md) — compose with `$store.scroll` for body scroll locking via callbacks
- [Theme](./theme.md) — similar factory plugin pattern with callbacks
