# @ailuracode/alpine-tooltip

Headless tooltip and popover positioning store for Alpine.js. Basic placement built-in; optional `@floating-ui/dom` peer dependency for advanced positioning.

**[Full documentation →](../../docs/plugins/tooltip.md)**

## Install

```bash
npm install @ailuracode/alpine-tooltip alpinejs
```

## Store API

```js
$store.tooltip.open("help");
$store.tooltip.close("help");
$store.tooltip.getPosition("help");
```
