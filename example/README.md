# Alpine.js plugins example

Interactive [Astro](https://astro.build) demo for all `@ailuracode/alpine-*` packages. Styled with [Tailwind CSS](https://tailwindcss.com) and [daisyUI](https://daisyui.com). Part of the pnpm workspace (`example/`). **Private** — not published to npm.

## Run locally

From the repo root:

```bash
pnpm install
pnpm run dev:example
```

Or from this directory:

```bash
pnpm dev
```

Open [http://localhost:4321](http://localhost:4321).

## Build

```bash
pnpm run build
pnpm run preview
```

## Alpine setup

This demo loads Alpine manually from `BaseLayout.astro` (not `@astrojs/alpinejs`).

Two requirements for directives in `.astro` files to work:

1. **Root `x-data`** on `<body>` — Alpine only walks the DOM from `x-data` roots. Without it, `$store` bindings in the layout and page never initialize.
2. **Register plugins before `Alpine.start()`** — see `src/entrypoint.ts`, called from the layout script at the end of `<body>`.

## Plugin registration

Plugins are registered in `src/entrypoint.ts`.
