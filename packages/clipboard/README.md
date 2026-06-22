# @ailuracode/alpine-clipboard

Copy text to the clipboard via Alpine.js magic.

**[Full documentation →](../../docs/clipboard.md)**

## Install

```bash
npm install @ailuracode/alpine-clipboard alpinejs
```

## Quick example

```js
import Alpine from "alpinejs";
import clipboard from "@ailuracode/alpine-clipboard";

Alpine.plugin(clipboard);
Alpine.start();
```

```html
<button @click="await $clipboard('Hello world')">Copy</button>
```

## API summary

| | |
|-|-|
| **Magic** | `$clipboard(text)` → `Promise<void>` |
| **Note** | UI feedback is handled in your component, not the plugin |

## License

MIT
