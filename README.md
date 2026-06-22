# @airluracode/alpine

Alpine.js plugin monorepo by **airluracode**. Independent npm packages for common UI utilities — theme, viewport, connectivity, clipboard, scroll, and touch detection.

## Packages

| Package | Type | Description |
|---------|------|-------------|
| [`@airluracode/alpine-theme`](./packages/theme/README.md) | Store | Light / dark / system theme preference |
| [`@airluracode/alpine-screen`](./packages/screen/README.md) | Store | Responsive device type and viewport width |
| [`@airluracode/alpine-online`](./packages/online/README.md) | Magic | Network online / offline state |
| [`@airluracode/alpine-clipboard`](./packages/clipboard/README.md) | Magic | Copy text to clipboard |
| [`@airluracode/alpine-scroll`](./packages/scroll/README.md) | Store | Scroll position tracking and body lock |
| [`@airluracode/alpine-touch`](./packages/touch/README.md) | Magic | Touch and pointer capabilities |

## Quick start

```bash
npm install @airluracode/alpine-theme alpinejs
```

```js
import Alpine from "alpinejs";
import theme from "@airluracode/alpine-theme";

Alpine.plugin(theme({
  onChange({ resolved }) {
    document.documentElement.classList.toggle("dark", resolved === "dark");
  },
}));

Alpine.start();
```

Install only the packages you need. Each one is a separate dependency.

## Documentation

- [Getting started](./docs/getting-started.md)
- [Architecture: stores vs magics](./docs/architecture.md)
- [Theme](./docs/theme.md)
- [Screen](./docs/screen.md)
- [Online](./docs/online.md)
- [Clipboard](./docs/clipboard.md)
- [Scroll](./docs/scroll.md)
- [Touch](./docs/touch.md)
- [Contributing](./docs/contributing.md)

## Development

```bash
npm install
npm test              # all packages
npm run test:watch    # watch mode
npm run test:packages # run tests in each workspace
```

## Publishing

Requires an npm account with access to the `@airluracode` scope:

```bash
npm publish -w @airluracode/alpine-theme
```

Each package under `packages/*` has its own version, tests, and README.

## License

MIT
