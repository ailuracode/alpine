---
title: "Menu"
description: "Package: @ailuracode/alpine-menu"
---

Package: `@ailuracode/alpine-menu`

Headless menu store for dropdowns and context menus. Keyboard navigation (`Arrow*`, `Home`, `End`, `Enter`, `Space`, `Escape`), roving tabindex, and ARIA helpers. **No HTML or CSS is shipped.**

## Install

```bash
npm install @ailuracode/alpine-menu alpinejs
```

## Setup

```js
import Alpine from "alpinejs";
import menu from "@ailuracode/alpine-menu";

Alpine.plugin(menu());
Alpine.start();
```

Compose scroll locking with `@ailuracode/alpine-scroll`:

```js
menu({
  onLockChange(locked) {
    locked ? Alpine.store("scroll").lock() : Alpine.store("scroll").unlock();
  },
});
```

## Store API

| Method | Description |
|--------|-------------|
| `open(id)` / `close(id)` / `toggle(id)` | Visibility |
| `isOpen(id)` | Open state |
| `activeItem(id)` | Currently focused item id |
| `registerItem(menuId, itemId, options?)` | Register a menu item |
| `bindMenu(menuId, element)` | Attach the menu root for roving focus |
| `bindTrigger(menuId, element)` | Attach the trigger for fixed positioning |
| `handleOutsideClick(menuId, event)` | Close when clicking outside trigger + menu |
| `handleKeydown(menuId, event)` | Keyboard navigation |
| `itemProps(menuId, itemId)` | `role`, `tabindex`, `aria-disabled` |
| `menuProps(menuId)` | `role`, `aria-orientation` |

### Options per menu

| Option | Default | Description |
|--------|---------|-------------|
| `orientation` | `"vertical"` | Arrow key axis |
| `closeOnSelect` | `true` | Close after `selectItem()` |
| `scrollLock` | `true` | Notify `onLockChange` while open |
| `onOpen` / `onClose` | — | Lifecycle callbacks |
| `onSelect` | — | Fired when an item is chosen (click, Enter, or Space) |

## Basic markup

```html
<div
  x-data
  x-init="$store.menu.register('user-menu', { onSelect: (id) => console.log(id) }); ['profile','settings','logout'].forEach(id => $store.menu.registerItem('user-menu', id))"
  @keydown.window="$store.menu.isOpen('user-menu') && $store.menu.handleKeydown('user-menu', $event)"
  @click.window="$store.menu.handleOutsideClick('user-menu', $event)"
>
  <div x-init="$store.menu.bindTrigger('user-menu', $el)">
    <button @click="$store.menu.toggle('user-menu')" aria-haspopup="menu">Account</button>
  </div>

  <template x-teleport="body">
    <ul
      x-bind="$store.menu.menuProps('user-menu')"
      x-init="$store.menu.bindMenu('user-menu', $el)"
      x-show="$store.menu.isOpen('user-menu')"
      class="fixed z-50 min-w-48"
    >
    <template x-for="id in ['profile','settings','logout']" :key="id">
      <li>
        <button
          x-bind="$store.menu.itemProps('user-menu', id)"
          @click="$store.menu.selectItem('user-menu', id)"
          x-text="id"
        ></button>
      </li>
    </template>
  </ul>
  </template>
</div>
```

## Accessibility

- Roving `tabindex` on the active item
- Vertical or horizontal orientation
- `Escape` closes the menu
- `Enter` / `Space` selects the active item

## SSR

Register items during `x-init` on the client. Control visibility with `x-show` (or your own CSS).

## Limitations

- Put `@click.outside` on a wrapper that includes the trigger — not on the menu panel alone, or opening clicks will dismiss immediately
- For teleported menus, use `@click.window` + `handleOutsideClick()` so outside clicks ignore both trigger and panel
- Wire `@keydown.window` while the menu is open; `@keydown` on the panel alone misses keys when focus stays on the trigger
- Use `<template x-teleport="body">` with `bindTrigger()` + `bindMenu()` when the menu sits inside `overflow-hidden` ancestors
- Call `bindMenu()` on the menu root so arrow keys move roving focus to the active item
