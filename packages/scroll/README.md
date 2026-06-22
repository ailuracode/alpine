# @airluracode/alpine-scroll

Scroll position tracking and reference-counted body scroll lock for Alpine.js.

**[Full documentation →](../../docs/scroll.md)**

## Install

```bash
npm install @airluracode/alpine-scroll alpinejs
```

## Quick example

```js
import Alpine from "alpinejs";
import scroll from "@airluracode/alpine-scroll";

Alpine.plugin(scroll);
Alpine.start();
```

```html
<button x-show="$store.scroll.showToTop" @click="$store.scroll.toTop()">Top</button>
```

Add `.scroll-locked` CSS — see [docs](../../docs/scroll.md#required-css).

## API summary

| | |
|-|-|
| **Store** | `$store.scroll` |
| **State** | `x`, `y`, `direction`, `progress`, `atTop`, `atBottom`, `locked` |
| **Getters** | `isLocked`, `showToTop`, `isScrollingDown`, `isScrollingUp` |
| **Methods** | `lock()`, `unlock()`, `toggleLock()`, `toTop()`, `toBottom()` |

## License

MIT
