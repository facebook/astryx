# /apps/sandbox

Astryx component sandbox for designer exploration and vibe testing. Deployed alongside Storybook on every PR.

<!-- SYNC: When files in this directory change, update this document. -->

## Setup

Before writing any code, install dependencies:

```bash
npm install
```

This automatically generates `AGENTS.md` with the Astryx component index via `astryx init --features agents`. **Read `AGENTS.md` for all Astryx component documentation**: it contains CLI commands to browse components, tokens, themes, and design rules.

If `AGENTS.md` is missing, regenerate it:

```bash
npx astryx init --features agents
```

## How it works

The sandbox is a Next.js app configured for static export (`output: 'export'`). On PRs, the CI workflow builds it and deploys to GitHub Pages at a versioned URL:

```
https://facebook.github.io/astryx/{commit}/sandbox/
```

## Adding a new page

1. Create `src/app/pages/<name>/page.tsx`:

```tsx
'use client';

import {VStack, Heading, Text} from '@astryxdesign/core';

export default function MyPage() {
  return (
    <VStack gap={4}>
      <Heading level={1}>My Page</Heading>
      <Text type="body">Content here</Text>
    </VStack>
  );
}
```

2. Add an entry to the `pages` array in `src/app/Sidebar.tsx`

The page will appear in the sidebar and get its own URL in the PR deployment.

## Development

Three ways to run the sandbox locally, depending on what you're iterating on:

### Quick start (build once, then dev)

```bash
pnpm dev:sandbox
```

Builds `@astryxdesign/core` once, then starts the sandbox. Edits to `packages/core/src/` require a manual rebuild (`pnpm build`). Good for working on sandbox pages themselves without touching core components.

### Source mode (fast hot reload, no theming)

```bash
pnpm dev:sandbox:source
```

Resolves `@astryxdesign/core` from TypeScript source directly via the `"source"` exports condition. Edits to component source hot-reload instantly (~200ms). **Theming and CSS layers don't work** in this mode because the CSS `@layer` wrapping only exists in the built dist output. Use for layout and behavior iteration only.

### Watch mode (correct theming, near-hot-reload)

Run in two terminals:

```bash
# Terminal 1: watch core for changes, rebuild dist incrementally
pnpm -F @astryxdesign/core dev

# Terminal 2: start sandbox (uses dist with correct CSS layers)
pnpm -F @astryxdesign/sandbox dev
```

Edits trigger incremental dist rebuilds via Babel CLI (a few seconds), and CSS layer ordering is correct. Theming works properly.

## File manifest

| File                       | Purpose                                                                  |
| -------------------------- | ------------------------------------------------------------------------ |
| `package.json`             | Dependencies; uses PostCSS path for StyleX                              |
| `babel.config.js`          | StyleX babel plugin config (as plugin, not preset)                       |
| `postcss.config.js`        | StyleX PostCSS plugin: extracts CSS from `@stylex;` directive           |
| `next.config.mjs`          | Static export, basePath for GitHub Pages, webpack alias for theme tokens |
| `tsconfig.json`            | TypeScript config with workspace path aliases                            |
| `src/app/globals.css`      | `@stylex;` injection point: PostCSS replaces this with extracted CSS    |
| `src/app/providers.tsx`    | Client-side theme provider wrapper                                       |
| `src/app/layout.tsx`       | Root layout with sidebar navigation                                      |
| `src/app/Sidebar.tsx`      | Sidebar navigation component                                             |
| `src/app/page.tsx`         | Home page                                                                |
| `src/app/pages/*/page.tsx` | Example sandbox pages                                                    |
