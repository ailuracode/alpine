# Changesets

This monorepo uses [Changesets](https://github.com/changesets/changesets) for versioning.

## Add a changeset

After making a user-facing change:

```bash
pnpm run changeset
```

Select the package(s), choose semver bump, and write a short summary.

## Release flow

1. Merge changesets to `master`.
2. GitHub Action **Release** applies pending changesets on the same branch (bumps versions + CHANGELOGs).
3. When `master` has no pending changesets, packages publish to npm automatically (requires `NPM_TOKEN` secret).

Manual release:

```bash
pnpm run version
pnpm run release
```
