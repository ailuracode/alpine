# Screen

Package: `@ailuracode/alpine-screen`

Responsive device detection and live viewport width. Uses `matchMedia` for device type and `requestAnimationFrame`-coalesced `resize` updates for width.

## Install

```bash
npm install @ailuracode/alpine-screen alpinejs
```

## Setup

```js
import Alpine from "alpinejs";
import screen from "@ailuracode/alpine-screen";

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
| `type` | `DeviceType` | `mobile`, `tablet`, or `desktop` (via `matchMedia`) |
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
| `is(name)` | Generic type check: `is('mobile')` — `name` is `DeviceType` |
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

## Exported helpers

```js
import {
  DEVICE_TYPES,
  DEFAULT_DEVICE_BREAKPOINTS,
  deviceBreakpoints,
  readDeviceSnapshot,
  resolveDeviceTypeFromWidth,
} from "@ailuracode/alpine-screen";
```

`readDeviceSnapshot()` and `resolveDeviceTypeFromWidth()` derive type from width. `$store.device.type` uses `matchMedia` at runtime and may differ in edge cases.

## Custom breakpoints

```js
// After Alpine.start(), from a component or script:
Alpine.store("device").setBreakpoints(
  deviceBreakpoints({ mobileMax: 640, tabletMax: 1024 }),
);
```

Or call during plugin init via a wrapper if you need custom defaults at startup.

## Performance

- Device **type** updates via `matchMedia` `change` events (no resize polling)
- **Width** updates on `resize`, coalesced to one refresh per animation frame
