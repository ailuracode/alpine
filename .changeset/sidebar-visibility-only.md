---
"@ailuracode/alpine-sidebar": major
---

Refactor `@ailuracode/alpine-sidebar` to focus exclusively on sidebar visibility. Remove all expand/collapse logic from the plugin — visual width, mode (rail, mini, drawer, etc.) is now the consumer's responsibility.

Breaking changes:

- Rename `open` → `visible` and `isOpen` → `isVisible` on `$store.sidebar`.
- Remove `collapse()`, `expand()`, `toggleCollapse()` methods.
- Remove `collapsed` state.
- Remove `collapsed` option.
- Remove `onOpen`/`onClose` callbacks — renamed to `onShow`/`onHide` to match the new visibility API.
- Remove `onCollapse`/`onExpand` callbacks.
- Manage any "expanded" / "collapsed" visual state locally with Alpine (e.g. `x-data="{ expanded: true }"`).
