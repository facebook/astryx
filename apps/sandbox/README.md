# /apps/sandbox

XDS component sandbox for designer exploration and vibe testing. Deployed alongside Storybook on every PR.

<!-- SYNC: When files in this directory change, update this document. -->

## Setup

Before writing any code, install dependencies:

```bash
npm install
```

This automatically generates `AGENTS.md` with the XDS component index via `xds init --features agents`. **Read `AGENTS.md` for all XDS component documentation** — it contains CLI commands to browse components, tokens, themes, and design rules.

If `AGENTS.md` is missing, regenerate it:

```bash
npx xds init --features agents
```

## How it works

The sandbox is a Next.js app configured for static export (`output: 'export'`). On PRs, the CI workflow builds it and deploys to GitHub Pages at a versioned URL:

```
https://facebookexperimental.github.io/xds/{commit}/sandbox/
```

## Adding a new page

1. Create `src/app/pages/<name>/page.tsx`:

```tsx
'use client';

import {XDSVStack, XDSHeading, XDSText} from '@xds/core';

export default function MyPage() {
  return (
    <XDSVStack gap={4}>
      <XDSHeading level={1}>My Page</XDSHeading>
      <XDSText type="body">Content here</XDSText>
    </XDSVStack>
  );
}
```

2. Add an entry to the `pages` array in `src/app/Sidebar.tsx`

The page will appear in the sidebar and get its own URL in the PR deployment.

## Local development

```bash
# From repo root
yarn workspace @xds/sandbox dev
# or
cd apps/sandbox && yarn dev
```

## File manifest

| File                       | Purpose                                                                  |
| -------------------------- | ------------------------------------------------------------------------ |
| `package.json`             | Dependencies — uses PostCSS path for StyleX                              |
| `babel.config.js`          | StyleX babel plugin config (as plugin, not preset)                       |
| `postcss.config.js`        | StyleX PostCSS plugin — extracts CSS from `@stylex;` directive           |
| `next.config.mjs`          | Static export, basePath for GitHub Pages, webpack alias for theme tokens |
| `tsconfig.json`            | TypeScript config with workspace path aliases                            |
| `src/app/globals.css`      | `@stylex;` injection point — PostCSS replaces this with extracted CSS    |
| `src/app/providers.tsx`    | Client-side theme provider wrapper                                       |
| `src/app/layout.tsx`       | Root layout with sidebar navigation                                      |
| `src/app/Sidebar.tsx`      | Sidebar navigation component                                             |
| `src/app/page.tsx`         | Home page                                                                |
| `src/app/pages/*/page.tsx` | Example sandbox pages                                                    |
