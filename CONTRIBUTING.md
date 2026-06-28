# Contributing to Astryx

For the full contribution process — what we accept, how to propose new components, and how API decisions are made — read the **[Contributing wiki](https://github.com/facebook/astryx/wiki/Contributing)**.

Key pages:

- **[API Conventions](https://github.com/facebook/astryx/wiki/API-Conventions)** — naming, prop patterns, composition rules (read before submitting an RFC)
- **[Specification Protocol](https://github.com/facebook/astryx/wiki/Component-Specification-Protocol)** — the 9-phase process for new components
- **[API Arbitration](https://github.com/facebook/astryx/wiki/API-Arbitration)** — how we resolve API design questions
- **[Contributing with AI](https://github.com/facebook/astryx/wiki/Contributing-with-AI-Assistants)** — safe zones, spec protocol, and working with AI tools

This file covers local development setup.

---

## Prerequisites

### Node.js

Install Node.js v22+ using one of these methods:

**Via nvm (recommended):**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.zshrc
nvm install 22
```

**Via nodejs.org:**
Download and install from https://nodejs.org

### pnpm

Astryx uses [pnpm](https://pnpm.io/) as its package manager (declared in
the `packageManager` field of `package.json`). The easiest way to install
it is via [Corepack](https://nodejs.org/api/corepack.html), which ships
with Node.js:

```bash
corepack enable
```

This makes the `pnpm` command available with the exact version Astryx pins.
Alternatively, install pnpm directly:

```bash
# Via npm
npm install -g pnpm@10

# Via Homebrew (macOS)
brew install pnpm

# Via standalone installer (no npm or Node.js required)
curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=10.33.4 sh -

# Via GitHub releases (single binary, no dependencies)
# https://github.com/pnpm/pnpm/releases/latest
```

Verify installation:

```bash
node --version   # v22.x.x
pnpm --version   # 10.x.x
```

## Getting Started

```bash
# Clone the repo
git clone https://github.com/facebook/astryx.git
cd astryx

# Install dependencies
pnpm install

# Build core package first (required for Storybook)
pnpm -F @astryxdesign/core build

# Start Storybook for component development
cd apps/storybook
pnpm dev
```

### Running Storybook

Storybook loads pre-built packages from `dist/` folders, so you need to build packages before running Storybook.

**First time setup:**

```bash
# Build all packages
pnpm build

# Or build just core
pnpm -F @astryxdesign/core build
```

**Start Storybook:**

```bash
cd apps/storybook
pnpm dev
```

Storybook will open at http://localhost:6006 with:

- **Theme switcher** - Toggle between Default and Shadcn themes
- **Mode switcher** - Toggle between Light and Dark modes
- **Component stories** - Interactive component examples

**If you make changes to `@astryxdesign/core`:**

```bash
# Rebuild core package
pnpm -F @astryxdesign/core build

# Restart Storybook to see changes
cd apps/storybook
pnpm dev
```

## Project Structure

```
astryx/
├── apps/
│   ├── storybook/      # Component playground (localhost:6006)
│   └── sandbox/        # Development testing
│
├── packages/
│   ├── core/           # Core components (Button, Input, etc.)
│   ├── cli/            # CLI tooling (npx astryx)
│   ├── lab/            # Experimental components (not yet stable)
│   └── themes/         # Theme presets (default, neutral, daily, and more)
│
└── internal/           # Internal tooling (not published)
    └── test-utils/     # Shared test helpers
```

## Development Workflow

### Common Commands

| Command           | Description                       |
| ----------------- | --------------------------------- |
| `pnpm install`    | Install all dependencies          |
| `pnpm dev`        | Start all dev servers             |
| `pnpm build`      | Build all packages                |
| `pnpm test`       | Run all tests                     |
| `pnpm test:watch` | Run tests in watch mode           |
| `pnpm storybook`  | Start Storybook at localhost:6006 |
| `pnpm lint`       | Lint all packages                 |

## Adding a New Component

Components use **colocated tests** — test files live alongside the component.

### 1. Create the Component Directory

```bash
mkdir -p packages/core/src/MyComponent
```

### 2. Create the Component Files

```
packages/core/src/MyComponent/
├── MyComponent.tsx        # Component implementation
├── MyComponent.test.tsx   # Unit tests (colocated)
├── MyComponent.stories.tsx # Storybook stories
└── index.ts               # Public exports
```

### 3. Component Template

````tsx
// MyComponent.tsx
import {forwardRef, type HTMLAttributes, type ReactNode} from 'react';

export interface MyComponentProps extends HTMLAttributes<HTMLDivElement> {
  /** Description for AI-assisted development */
  children: ReactNode;
}

/**
 * Brief description of the component.
 *
 * @example
 * ```tsx
 * <MyComponent>Hello</MyComponent>
 * ```
 */
export const MyComponent = forwardRef<HTMLDivElement, MyComponentProps>(
  ({children, ...props}, ref) => {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  },
);

MyComponent.displayName = 'MyComponent';
````

### 4. Test Template

```tsx
// MyComponent.test.tsx
import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {MyComponent} from './MyComponent';

describe('MyComponent', () => {
  it('renders children', () => {
    render(<MyComponent>Hello</MyComponent>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### 5. Story Template

```tsx
// MyComponent.stories.tsx
import type {Meta, StoryObj} from '@storybook/react';
import {MyComponent} from './MyComponent';

const meta = {
  title: 'Components/MyComponent',
  component: MyComponent,
  tags: ['autodocs'],
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Hello World',
  },
};
```

### 6. Export from Package

```ts
// packages/core/src/index.ts
export * from './MyComponent';
```

> **Note:** Do not manually edit the `"exports"` field in `packages/core/package.json`.
> It is auto-generated from the `src/` directory by `scripts/sync-exports.js` and
> committed automatically when changes land on `main`. If you need to verify your
> component will be included, run `pnpm sync:exports:check`.

## Testing

### Run Tests

```bash
# All tests
pnpm test

# Watch mode
pnpm test:watch

# Specific package
pnpm -F @astryxdesign/core test

# With coverage
pnpm test:coverage

# Screenshot tests
pnpm test:screenshots
```

### Test Structure

Tests are colocated with components:

```
src/Button/
├── Button.tsx
└── Button.test.tsx   # Tests live here
```

## Versioning & Releases

We use [Changesets](https://github.com/changesets/changesets) for versioning, with a thin Astryx layer on top so changelogs stay categorized, contributor-attributed, and aligned with our pre-1.0 conventions.

### Adding a Changeset

When you make a change that should be released:

```bash
pnpm changeset:new
```

This wrapper:

1. **Detects which packages you changed** from your git diff and pre-selects them — no hand-enumerating the frontmatter.
2. **Asks for a category** (`breaking`, `component`, `feat`, `fix`, `perf`, `docs`, `chore`) — this drives changelog grouping, _not_ the semver bump.
3. **Captures the contributor(s)** — defaults to your `gh`/git identity, so credit is recorded at authoring time (not reconstructed from the release bot's commit).
4. **Forces a `patch` bump** while we're pre-1.0 (see below).

It writes a normal `.changeset/<id>.md` — commit it with your PR. The body looks like:

```md
---
'@astryxdesign/core': patch
---

[fix] Spinner inherits the variant foreground on themed buttons (#2717)
@yourhandle
```

You can also pass everything as flags for non-interactive use:

```bash
pnpm changeset:new --category fix --summary "…" --pr 2717 --contributor yourhandle
```

> The bare `pnpm changeset` CLI still works, but you must follow the body
> convention by hand (`[category]` first line + `@handle` line). CI
> (`pnpm check:changesets`) rejects changesets missing a category or
> contributor, or declaring a `minor`/`major` bump while pre-1.0.

### Version Bumps

- **Pre-1.0 (current): always `patch`.** The Changesets CLI maps `minor` → 0.0.x → 0.1.0 and `major` → 1.0.0. While we're on 0.0.x we ship every change — features, fixes, and breaking changes alike — as a `patch`. Signal a breaking change with the `[breaking]` **category**, not a `major` bump. `pnpm changeset:new` enforces this; `pnpm check:changesets` is the CI backstop.
- All publishable packages are a `fixed` group, so a single change co-bumps them to the same version. Only genuinely-affected packages get a changelog entry — the rest get a clean version-only bump.

### How a release is cut

```bash
pnpm version-packages   # changeset version + scripts/format-changelogs.mjs
```

`format-changelogs.mjs` rewrites each just-bumped package CHANGELOG into the doc-site format (h1 version, `#### <Category>` sections in canonical order, and a `#### Contributors` section aggregated from the changeset `@handle`s). It's idempotent and has a `--check` mode for CI drift detection.

## Finding Something to Work On

Labels signal what's open for contribution:

- **`good first issue`** / **`help wanted`** — ready to be picked up; start here.
- **`discussion`** — still being shaped and **not ready for contribution**. The problem is
  recorded but the solution isn't decided. Please don't start work on a fix until it's triaged
  out of `discussion`. Comments and ideas are welcome.

For **pull requests**, use GitHub's native **Draft** state to signal "not ready to review/merge
yet" — open the PR as a draft and mark it ready for review when it's done.

## Pull Request Guidelines

1. Create a feature branch from `main`
2. Make your changes with tests
3. Run `pnpm test` and `pnpm lint`
4. Add a changeset if needed: `pnpm changeset:new`
5. Open a PR with a clear description

## Code Style

- TypeScript strict mode
- Functional components with `forwardRef`
- JSDoc comments for AI-assisted development
- Export types alongside components

## Troubleshooting

### pnpm Installation Issues

If `corepack enable` succeeds but `pnpm` fails to download its binary
(e.g. `ECONNRESET`, `fetch failed`, or `503` from `registry.npmjs.org`),
your environment likely blocks outbound network access.

**Alternative install methods (no `registry.npmjs.org` needed):**

```bash
brew install pnpm                        # Homebrew (macOS)
curl -fsSL https://get.pnpm.io/install.sh | sh -  # Standalone installer
npm install -g pnpm@10                   # Via npm
```

You can also download the binary directly from
[GitHub Releases](https://github.com/pnpm/pnpm/releases/latest).

**Sandboxed IDE terminals:** if your IDE blocks all network, run
`corepack enable && pnpm install` from a regular terminal first, then
open the project in your IDE — `node_modules` is on the local filesystem
and doesn't need network to use.

### Storybook Issues

**"Failed to fetch dynamically imported module"**

- Cause: Core package not built or out of date
- Fix: `pnpm -F @astryxdesign/core build` then restart Storybook

**"React is not defined"**

- Cause: Missing React import in preview.tsx
- Fix: Ensure `import * as React from 'react';` at top of preview.tsx

**"Unexpected 'stylex.defineVars' call at runtime"**

- Cause: StyleX code trying to run without compilation
- Fix: Storybook should load from `dist/` not `src/`. Check vite.config.ts aliases.

**Changes not appearing in Storybook**

- Rebuild the package: `pnpm -F @astryxdesign/core build`
- Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Clear Storybook cache: Remove `apps/storybook/node_modules/.cache`

## Contributor License Agreement ("CLA")

In order to accept your pull request, we need you to submit a CLA. You only need
to do this once to work on any of Meta's open source projects.

Complete your CLA here: <https://code.facebook.com/cla>

## Issues

We use GitHub issues to track public bugs. Please ensure your description is
clear and has sufficient instructions to be able to reproduce the issue.

Meta has a [bounty program](https://bugbounty.meta.com/) for the safe disclosure
of security bugs. In those cases, please go through the process outlined on that
page and do not file a public issue.
