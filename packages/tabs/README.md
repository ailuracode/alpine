# @ailuracode/alpine-tabs

Headless accessible tabs store for Alpine.js — selection, keyboard navigation, ARIA helpers, and optional URL query sync.

**[Full documentation →](../../docs/plugins/tabs.md)**

## Install

```bash
npm install @ailuracode/alpine-tabs alpinejs
```

## Store API

```js
$store.tabs.select("settings-tabs", "profile");
$store.tabs.active("settings-tabs");
$store.tabs.isActive("settings-tabs", "profile");
$store.tabs.next("settings-tabs");
```
