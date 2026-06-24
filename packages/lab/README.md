# @astryxdesign/lab

Experimental XDS components. This package is **not published**; it exists as a staging area for components being developed before graduating to `@astryxdesign/core`.

## Purpose

Components in lab:

- Are importable in storybook and sandbox for testing
- Can be iterated on freely without worrying about breaking consumers
- Compose with `@astryxdesign/core` components (use the theme, follow naming conventions)
- Graduate to `@astryxdesign/core` after thorough engineering review

## What's here vs what's in core

**Lab:** Works, has basic props, maybe has stories. API might change. Not accessibility-hardened, not vibe-tested, not fully themed.

**Core:** Full keyboard/a11y, hover guards, theming story, status states, spec compliance, vibe tested. Shipped to consumers.

## Usage

```tsx
import {XDSCodeEditor} from '@astryxdesign/lab';
```

Since this is a workspace package (not published), imports resolve via pnpm workspaces in storybook and sandbox.
