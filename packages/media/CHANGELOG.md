# @ailuracode/alpine-media

## 0.1.0

### Minor Changes

- Unify viewport and media feature plugins into `@ailuracode/alpine-media` with inlined source.

  - Absorbs `screen` and `touch` into a single `$store.media` store

  Removed standalone packages: `@ailuracode/alpine-screen`, `@ailuracode/alpine-touch`.

  Migrate imports to `@ailuracode/alpine-media`.

## 0.0.0

### Major Changes

- Rename `@ailuracode/alpine-screen` to `@ailuracode/alpine-media` with store `$store.media`.
- Add browser media feature detection: `prefersReducedMotion`, `prefersContrast`, `prefersColorScheme`, `hover`, `pointer`, and `orientation`.
- Add `height`, `breakpoint`, and convenience getters `isMobile`, `isTablet`, `isDesktop`.
