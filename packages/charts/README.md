# @astryxdesign/charts

Astryx chart components. This package provides thin, themeable wrappers over a peer charting engine — it owns the design-system surface while leaving the rendering engine as a peer dependency the consumer manages.

It ships to npm **only under the `@canary` dist-tag** — there is never a stable (`latest`) release yet.

## Status

**Bootstrap scaffold.** The package is set up and building but ships no components yet. Add components under `src/` and export them from `src/index.ts`. The StyleX + Astryx-token build setup mirrors `@astryxdesign/lab`, so components can consume `@astryxdesign/core` theme tokens directly.

> When the first component adds StyleX styles, wire up a pre-compiled stylesheet the same way `lab` does: add a `charts` target to `scripts/build-css.mjs`, restore the `build:css` script and the `./charts.css` export in `package.json`, and document the `import '@astryxdesign/charts/charts.css'` step below.

## Usage

Inside the monorepo (storybook/sandbox), imports resolve via pnpm workspaces:

```tsx
import {} from /* ... */ '@astryxdesign/charts';
```

### Trying charts in your own project (canary)

`@astryxdesign/charts` is published **only** under the `@canary` dist-tag, so you must request that tag explicitly. There is no `latest` version to install.

```bash
npm install @astryxdesign/charts@canary @astryxdesign/core@canary
```

> Canary builds track the latest commit on `main` (`0.x.y-canary.<sha>`). They can break between any two versions — pin an exact version if you need stability.

## Why no stable release?

`package.json` keeps `"private": true` plus an `"astryx": { "canaryOnly": true }` marker. The release workflow's stable (`latest`) job skips both private and `canaryOnly` packages, while the canary job strips `private` in its ephemeral CI checkout only (never in git) to publish the `@canary` tag. The committed `private: true` is npm's hard guarantee that no stable publish can ever happen — **do not remove it.**
