# Contributing

## Repository structure

```
packages/
  theme/       @airluracode/alpine-theme
  screen/      @airluracode/alpine-screen
  online/      @airluracode/alpine-online
  clipboard/   @airluracode/alpine-clipboard
  scroll/      @airluracode/alpine-scroll
  touch/       @airluracode/alpine-touch
test/          shared Vitest setup and helpers
docs/          documentation
```

Each package contains:

- `src/index.js` — plugin source
- `test/` — package tests
- `README.md` — package overview
- `package.json` — independent npm manifest

## Setup

```bash
npm install
```

## Running tests

```bash
npm test                    # all tests
npm run test:watch          # watch mode
npm run test:packages       # each workspace
npm test -w @airluracode/alpine-theme  # single package
```

Tests use [Vitest](https://vitest.dev/) with [happy-dom](https://github.com/capricorn86/happy-dom).

### Test helpers

- `test/setup.js` — `matchMedia` mock, `localStorage` reset, DOM cleanup
- `test/helpers.js` — `startAlpine(...plugins)` for store integration tests
- `test/mock-alpine.js` — minimal Alpine mock for magic-only plugins

## Conventions

### Stores vs magics

See [Architecture](./architecture.md). Prefer stores for shared mutable state; magics for read-only environment data or utilities.

### Naming

- Package scope: `@airluracode/alpine-*`
- Boolean getters: `isLight`, `isOnline`, `isLocked` (no `()` in templates)
- Methods for actions: `set()`, `lock()`, `cycle()`
- Avoid React patterns (`use*Store`, hooks)

### CSS

Plugins must stay CSS-framework agnostic. DOM styling belongs in the consumer app (via callbacks like `theme.onChange` or app-level CSS for `.scroll-locked`).

## Adding a new package

1. Create `packages/my-feature/` with `src/index.js`, `package.json`, `test/`, `README.md`
2. Add `"name": "@airluracode/alpine-my-feature"` with `peerDependencies.alpinejs`
3. Add docs in `docs/my-feature.md` and link from root README
4. Ensure `npm test` passes

## Publishing

```bash
npm publish -w @airluracode/alpine-theme
```

Bump version in the package's `package.json` before publishing. Packages are versioned independently.

## License

MIT — see package `package.json` files.
