# Alpine.js plugins example

Interactive [Astro](https://astro.build) demo for all `@ailuracode/alpine-*` packages. This folder is **not** part of the pnpm workspace and is **not** published to npm.

## Run locally

From this directory:

```bash
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321).

## Build

```bash
npm run build
npm run preview
```

## Plugin registration

Plugins are registered in `src/entrypoint.ts` via the `@astrojs/alpinejs` `entrypoint` option in `astro.config.mjs`.
