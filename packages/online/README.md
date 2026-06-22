# @airluracode/alpine-online

Online/offline connectivity magic for Alpine.js.

**[Full documentation →](../../docs/online.md)**

## Install

```bash
npm install @airluracode/alpine-online alpinejs
```

## Quick example

```js
import Alpine from "alpinejs";
import online from "@airluracode/alpine-online";

Alpine.plugin(online);
Alpine.start();
```

```html
<div x-show="!$online.isOnline">You are offline</div>
<button :disabled="!$online.isOnline">Save</button>
```

## API summary

| | |
|-|-|
| **Magic** | `$online` |
| **Properties** | `isOnline` (boolean) |

## License

MIT
