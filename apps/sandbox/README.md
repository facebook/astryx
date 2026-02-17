# /apps/sandbox

Local development and exploration environment for XDS components. Designers and developers can compose XDS components into real-world layouts and test them interactively.

<!-- SYNC: When files in this directory change, update this document. -->

## Getting Started

```bash
# From the repo root
yarn dev --filter @xds/sandbox

# Or from this directory
cd apps/sandbox
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the sandbox.

## Adding a New Page

1. Create a directory under `src/app/pages/<name>/`
2. Add a `page.tsx` file:

```tsx
import {XDSVStack, XDSHeading, XDSText} from '@xds/core';

export default function MyPage() {
  return (
    <XDSVStack gap="space4">
      <XDSHeading level={1}>My Page</XDSHeading>
      <XDSText type="body">Content here</XDSText>
    </XDSVStack>
  );
}
```

3. Add an entry to the `pages` array in `src/app/Sidebar.tsx`:

```tsx
const pages = [
  {name: 'Buttons', href: '/pages/buttons'},
  {name: 'Form', href: '/pages/form'},
  {name: 'My Page', href: '/pages/my-page'},  // ← add here
];
```

The page will be accessible at `/pages/<name>` and appear in the sidebar navigation.

## Directory Structure

| File | Role | Purpose |
|------|------|---------|
| `package.json` | Config | Package dependencies and scripts |
| `next.config.mjs` | Config | Next.js config with static export and StyleX |
| `src/app/layout.tsx` | Layout | Root layout with theme provider and sidebar |
| `src/app/Sidebar.tsx` | Component | Navigation sidebar listing all pages |
| `src/app/page.tsx` | Page | Home / welcome page |
| `src/app/pages/` | Directory | All sandbox exploration pages |
| `src/app/pages/buttons/page.tsx` | Page | Button variants, sizes, and states |
| `src/app/pages/form/page.tsx` | Page | Text inputs, checkboxes, and switches |

## Deployment

The sandbox is built as a static export (`output: 'export'`) and deployed alongside Storybook on GitHub Pages via the CI workflow. Each PR gets a unique sandbox URL at:

```
https://<owner>.github.io/<repo>/<commit-hash>/sandbox/
```

PR enrichment automatically detects new/modified sandbox pages and adds links to the PR comment.

## Notes

- Uses Next.js App Router with file-based routing
- Static export means no server components that require runtime — use `'use client'` for interactive pages
- `basePath` is set via `SANDBOX_BASE_PATH` env var for GitHub Pages subdirectory deployment
- All pages should use XDS components from `@xds/core`
