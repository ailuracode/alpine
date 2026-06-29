---
title: "Tooltip"
description: "Package: @ailuracode/alpine-tooltip"
---

Package: `@ailuracode/alpine-tooltip`

Headless tooltip and popover positioning store. Hover/focus triggers, open/close delays, Escape dismiss, and basic placement. Optional `@floating-ui/dom` for flip/shift/arrow strategies.

## Install

```bash
npm install @ailuracode/alpine-tooltip alpinejs
```

For advanced positioning:

```bash
npm install @floating-ui/dom
```

## Store API

| Method | Description |
|--------|-------------|
| `open(id)` / `close(id)` / `toggle(id)` | Visibility |
| `isOpen(id)` | Open state |
| `getPosition(id)` | `{ x, y, placement }` |
| `tooltipStyle(id)` | Fixed `left` / `top` styles for the floating node |
| `register(id, options?)` | Configure placement, delays |
| `bindElements(id, anchor, floating)` | Attach anchor and floating nodes |
| `showOnHover(id)` / `hideOnHover(id)` | Hover helpers |
| `showOnFocus(id)` / `hideOnFocus(id)` | Focus helpers |
| `refreshPosition(id)` | Recompute coordinates |

## Basic markup

```html
<div
  x-data
  x-init="
    $store.tooltip.register('help', { placement: 'top', openDelay: 150 });
    $nextTick(() => $store.tooltip.bindElements('help', $refs.helpAnchor, $refs.helpTooltip));
  "
>
  <button
    x-ref="helpAnchor"
    @mouseenter="$store.tooltip.showOnHover('help')"
    @mouseleave="$store.tooltip.hideOnHover('help')"
    @focus="$store.tooltip.showOnFocus('help')"
    @blur="$store.tooltip.hideOnFocus('help')"
    aria-describedby="help-tooltip"
  >
    Help
  </button>

  <template x-teleport="body">
    <div
      id="help-tooltip"
      x-ref="helpTooltip"
      x-show="$store.tooltip.isOpen('help')"
      x-bind:style="$store.tooltip.tooltipStyle('help')"
      role="tooltip"
      class="fixed z-50"
    >
      Tooltip content
    </div>
  </template>
</div>
```

## SSR

Delays and positioning require DOM measurements — initialize on the client via `x-init`.

## Limitations

- Built-in placement is anchor-relative without collision detection; use Floating UI for complex layouts
- Call `bindElements()` before opening; use `<template x-teleport="body">` when the floating node sits inside `overflow-hidden` ancestors
