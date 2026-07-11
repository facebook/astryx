# @astryxdesign/lab

Experimental Astryx components. This package is a staging area for components being developed before graduating to `@astryxdesign/core`. It ships to npm **only under the `@canary` dist-tag** — there is never a stable (`latest`) release.

## Purpose

Components in lab:

- Are importable in storybook and sandbox for testing
- Are publishable for early external testing via the `@canary` tag only
- Can be iterated on freely without worrying about breaking stable consumers
- Compose with `@astryxdesign/core` components (use the theme, follow naming conventions)
- Graduate to `@astryxdesign/core` after thorough engineering review

See the **[Component Lifecycle](https://github.com/facebook/astryx/wiki/Component-Lifecycle)** wiki for how a component moves from lab → core (and the promotion gates), and the **[Component Hardening Protocol](https://github.com/facebook/astryx/wiki/Component-Hardening-Protocol)** for the bar a component must clear to graduate.

## What's here vs what's in core

**Lab:** Works, has basic props, maybe has stories. API might change. Not accessibility-hardened, not vibe-tested, not fully themed. **Canary-only — no stability promise.**

**Core:** Full keyboard/a11y, hover guards, theming story, status states, spec compliance, vibe tested. Shipped to consumers on `latest`.

## Usage

Inside the monorepo (storybook/sandbox), imports resolve via pnpm workspaces:

```tsx
import {CodeEditor} from '@astryxdesign/lab';
```

### Trying lab components in your own project (canary)

Lab is published **only** under the `@canary` dist-tag, so you must request that tag explicitly. There is no `latest` version to install.

```bash
npm install @astryxdesign/lab@canary @astryxdesign/core@canary
```

```tsx
import {CodeEditor} from '@astryxdesign/lab';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/lab/lab.css';
```

> Canary builds track the latest commit on `main` (`0.x.y-canary.<sha>`). They can break between any two versions — pin an exact version if you need stability.

## Why no stable release?

`package.json` keeps `"private": true` plus an `"astryx": { "canaryOnly": true }` marker. The release workflow's stable (`latest`) job skips both private and `canaryOnly` packages, while the canary job strips `private` in its ephemeral CI checkout only (never in git) to publish the `@canary` tag. The committed `private: true` is npm's hard guarantee that no stable publish can ever happen — **do not remove it.**
