# Screen

Package: `@airluracode/alpine-screen`

Responsive device detection and live viewport width. Uses `matchMedia` for device type and debounced `resize` for width.

## Install

```bash
npm install @airluracode/alpine-screen alpinejs
```

## Setup

```js
import Alpine from "alpinejs";
import screen from "@airluracode/alpine-screen";

Alpine.plugin(screen);
Alpine.start();
```

## Default breakpoints

| Type | Range |
|------|-------|
| Mobile | ≤ 767px |
| Tablet | 768px – 1023px |
| Desktop | ≥ 1024px |

## Store API

Store name: `$store.device`

### State

| Property | Type | Description |
|----------|------|-------------|
| `type` | `string` | `mobile`, `tablet`, or `desktop` |
| `width` | `number` | Current `window.innerWidth` |
| `mobileMax` | `number` | Mobile upper bound (default `767`) |
| `tabletMax` | `number` | Tablet upper bound (default `1023`) |

### Getters

| Getter | Description |
|--------|-------------|
| `isMobile` | `type === 'mobile'` |
| `isTablet` | `type === 'tablet'` |
| `isDesktop` | `type === 'desktop'` |

### Methods

| Method | Description |
|--------|-------------|
| `is(name)` | Generic type check: `is('mobile')` |
| `refresh()` | Update type and width |
| `refreshType()` | Update type only |
| `refreshWidth()` | Update width only |
| `setBreakpoints({ mobileMax, tabletMax })` | Custom breakpoints and rebind listeners |

## HTML examples

```html
<span x-show="$store.device.isMobile">Mobile nav</span>
<span x-show="$store.device.isDesktop">Desktop nav</span>

<p>Width: <span x-text="$store.device.width"></span>px</p>
<p>Device: <span x-text="$store.device.type"></span></p>
```

## Custom breakpoints

```js
// After Alpine.start(), from a component or script:
Alpine.store("device").setBreakpoints({
  mobileMax: 640,
  tabletMax: 1024,
});
```

Or call during plugin init via a wrapper if you need custom defaults at startup.

## Performance

- Device **type** updates via `matchMedia` `change` events (no resize polling)
- **Width** updates on `resize` with 100ms debounce
