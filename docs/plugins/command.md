---
title: "Command"
description: "Package: @ailuracode/alpine-command"
---

Package: `@ailuracode/alpine-command`

Headless command palette (Spotlight-style) store — searchable actions, groups, keyboard navigation, shortcuts, and disabled items.

## Install

```bash
npm install @ailuracode/alpine-command alpinejs
```

## Setup

```js
import Alpine from "alpinejs";
import command from "@ailuracode/alpine-command";

Alpine.plugin(
  command({
    onRun(item) {
      console.log("Ran", item.id);
    },
  })
);
Alpine.start();
```

## Store API

| Member | Description |
|--------|-------------|
| `open()` / `close()` / `toggle()` | Palette visibility |
| `isOpen` | Whether the palette is open |
| `search` | Reactive filter string |
| `activeIndex` | Keyboard-highlighted row |
| `filteredItems` | Items matching `search` |
| `groupedItems` | Filtered items grouped by `group` |
| `register(item)` | Register an action |
| `run(id)` | Execute an action |
| `handleKeydown(event)` | Typing, Backspace, Arrow/Home/End/Enter/Escape |

### Command item

```ts
{
  id: "toggle-theme",
  label: "Toggle theme",
  group?: "Appearance",
  shortcut?: "⌘K",
  keywords?: ["dark", "light"],
  disabled?: false,
  action: () => {},
}
```

## Integration

- **Dialog** — render the palette inside a dialog panel and open via `$store.dialog` + `$store.command.open()` in demos
- **Toast** — call `$toast()` inside `action` or `onRun` for feedback (optional peer)

Neither dialog nor toast is a required dependency.

## SSR

Register commands on the client. Global shortcut listeners are consumer-owned.

## Limitations

- Built-in filter is substring match on label/group/shortcut/keywords
- No built-in modal markup — pair with `@ailuracode/alpine-dialog` when needed
