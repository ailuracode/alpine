# @ailuracode/alpine-dialog

Headless accessible dialog store for Alpine.js — open/close state, focus trap, scroll lock hooks, and ARIA helpers. No markup or CSS included.

**[Full documentation →](../../docs/plugins/dialog.md)**

## Install

```bash
npm install @ailuracode/alpine-dialog alpinejs
```

## Setup

```js
import Alpine from "alpinejs";
import dialog from "@ailuracode/alpine-dialog";

Alpine.plugin(
  dialog({
    onLockChange(locked) {
      // compose with $store.scroll.lock() / unlock()
    },
  })
);
Alpine.start();
```

## Store API

```js
$store.dialog.open("settings");
$store.dialog.close("settings");
$store.dialog.toggle("settings");
$store.dialog.isOpen("settings");
```

See the docs for `dialogProps()`, focus trap helpers, and multi-dialog patterns.
