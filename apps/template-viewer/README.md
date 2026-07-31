<!-- Copyright (c) Meta Platforms, Inc. and affiliates. -->

# Template Viewer

A tiny Vite app that renders any template from `packages/cli/assets/templates` in the
browser. Replaces the heavier `apps/sandbox` for previewing templates.

## Usage

```bash
pnpm -F @astryxdesign/template-viewer dev
```

Then open the path to a template directory as the URL, e.g.:

- http://localhost:5173/packages/cli/assets/templates/pages/ai-chat
- http://localhost:5173/packages/cli/assets/templates/blocks/components/Avatar

Opening `/` lists every available template.

## How it works

`src/App.tsx` globs every `.tsx` under `packages/cli/assets/templates`, matches the one
in the directory named by the URL path, and lazy-renders it inside `<Theme>`.
StyleX is compiled from `@astryxdesign/core` source by `astryxStylex()` — no
codegen, no Babel/PostCSS/Next.js.

## Prerequisites

The `@astryxdesign/build`, `@astryxdesign/core`, and `@astryxdesign/theme-neutral`
packages must be built once (they ship from `dist`):

```bash
pnpm -F @astryxdesign/build build
pnpm -F @astryxdesign/core build
pnpm -F @astryxdesign/theme-neutral build
```
