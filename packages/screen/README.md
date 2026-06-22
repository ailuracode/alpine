# @ailuracode/alpine-screen

Responsive device type and viewport width store for Alpine.js.

**[Full documentation →](../../docs/screen.md)**

## Install

```bash
npm install @ailuracode/alpine-screen alpinejs
```

## Quick example

```js
import Alpine from "alpinejs";
import screen from "@ailuracode/alpine-screen";

Alpine.plugin(screen);
Alpine.start();
```

```html
<nav x-show="$store.device.isMobile">Mobile menu</nav>
<p>Width: <span x-text="$store.device.width"></span>px</p>
```

## API summary

| | |
|-|-|
| **Store** | `$store.device` |
| **State** | `type`, `width`, `mobileMax`, `tabletMax` |
| **Getters** | `isMobile`, `isTablet`, `isDesktop` |
| **Methods** | `setBreakpoints({ mobileMax, tabletMax })`, `refresh()` |
| **Defaults** | mobile ≤767px · tablet 768–1023px · desktop ≥1024px |

## License

MIT
