# @ailuracode/alpine-sidebar

## 1.0.0

### Major Changes

- 819ca11: Refactor `@ailuracode/alpine-sidebar` to focus exclusively on sidebar visibility. Remove all expand/collapse logic from the plugin — visual width, mode (rail, mini, drawer, etc.) is now the consumer's responsibility.

  Breaking changes:

  - Rename `open` → `visible` and `isOpen` → `isVisible` on `$store.sidebar`.
  - Remove `collapse()`, `expand()`, `toggleCollapse()` methods.
  - Remove `collapsed` state.
  - Remove `collapsed` option.
  - Remove `onOpen`/`onClose` callbacks — renamed to `onShow`/`onHide` to match the new visibility API.
  - Remove `onCollapse`/`onExpand` callbacks.
  - Manage any "expanded" / "collapsed" visual state locally with Alpine (e.g. `x-data="{ expanded: true }"`).

## 0.1.1

### Patch Changes

- 2476868: Fix `$store.sidebar` reactivity in templates by routing `storage` and `resize` listener updates through `Alpine.store("sidebar")` instead of mutating the internal store object directly.

## 0.1.0

### Minor Changes

- Redesign `@ailuracode/alpine-screen` with configurable `ScreenInterval` breakpoints, `requestAnimationFrame` width updates, and typed `getDevice()` helper. Add new `@ailuracode/alpine-sidebar` store plugin. Export store types from geo, scroll, and theme. Add `zIndex` option to query devtools panel.
