# Online

Package: `@airluracode/alpine-online`

Reactive network connectivity via the `$online` magic. Wraps `navigator.onLine` and browser `online` / `offline` events.

## Install

```bash
npm install @airluracode/alpine-online alpinejs
```

## Setup

```js
import Alpine from "alpinejs";
import online from "@airluracode/alpine-online";

Alpine.plugin(online);
Alpine.start();
```

## Magic API

| Property | Type | Description |
|----------|------|-------------|
| `isOnline` | `boolean` | `true` when the browser reports online |

## HTML examples

```html
<div x-show="!$online.isOnline" class="offline-banner">
  You are offline
</div>

<button :disabled="!$online.isOnline">
  Save (requires connection)
</button>

<span :class="$online.isOnline ? 'dot-online' : 'dot-offline'"></span>
```

## Notes

- Reflects the browser's connectivity hint, not a real network ping
- `isOnline` naming avoids redundant `$online.online`
- Read-only — no store, no persistence
