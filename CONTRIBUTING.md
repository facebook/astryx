# Contributing to XDS

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

### Yarn

Install Yarn 1 (Classic) after Node.js is set up:

```bash
npm install -g yarn
```

Verify installation:

```bash
node --version   # v22.x.x
yarn --version   # 1.22.x
```

## Getting Started

```bash
# Clone the repo
git clone https://github.com/facebookexperimental/xds.git
cd xds

# Install dependencies
yarn install

# Build core package first (required for Storybook)
yarn workspace @xds/core build

# Start Storybook for component development
cd apps/storybook
yarn dev
```

### Running Storybook

Storybook loads pre-built packages from `dist/` folders, so you need to build packages before running Storybook.

**First time setup:**

```bash
# Build all packages
yarn build

# Or build just core
yarn workspace @xds/core build
```

**Start Storybook:**

```bash
cd apps/storybook
yarn dev
```

Storybook will open at http://localhost:6006 with:

- **Theme switcher** - Toggle between Default and Shadcn themes
- **Mode switcher** - Toggle between Light and Dark modes
- **Component stories** - Interactive component examples

**If you make changes to `@xds/core`:**

```bash
# Rebuild core package
yarn workspace @xds/core build

# Restart Storybook to see changes
cd apps/storybook
yarn dev
```

## Project Structure

```
xds/
├── apps/
│   ├── docs/           # Documentation site
│   ├── storybook/      # Component playground (localhost:6006)
│   └── sandbox/        # Development testing
│
├── packages/
│   ├── core/           # Core components (Button, Input, etc.)
│   ├── foundations/    # Design tokens, typography, colors
│   ├── patterns/       # Composed patterns (TablePage, FormWizard)
│   ├── icons/          # Icon library
│   ├── themes/         # Theme presets
│   └── utils/          # Shared utilities
│
├── internal/           # Internal tooling (not published)
│   └── test-utils/     # Shared test helpers
│
└── e2e/                # End-to-end tests
```

## Development Workflow

### Common Commands

| Command           | Description                       |
| ----------------- | --------------------------------- |
| `yarn install`    | Install all dependencies          |
| `yarn dev`        | Start all dev servers             |
| `yarn build`      | Build all packages                |
| `yarn test`       | Run all tests                     |
| `yarn test:watch` | Run tests in watch mode           |
| `yarn storybook`  | Start Storybook at localhost:6006 |
| `yarn lint`       | Lint all packages                 |

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
> component will be included, run `yarn sync:exports:check`.

### 7. Generate screenshot test snapshots

If adding a new component or adding new examples to existing:

```
yarn storybook:build
npx playwright test --update-snapshots --grep "XDSButton"`
```

Snapshots will be stored in e2e/visual-regression.spec.ts-snapshots/ and _must be committed_ to the repo.

## Testing

### Run Tests

```bash
# All tests
yarn test

# Watch mode
yarn test:watch

# Specific package
yarn workspace @xds/core test

# With coverage
yarn test:coverage

# Screenshot tests
yarn test:screenshots
```

### Test Structure

Tests are colocated with components:

```
src/Button/
├── Button.tsx
└── Button.test.tsx   # Tests live here
```

## Versioning & Releases

We use [Changesets](https://github.com/changesets/changesets) for versioning.

### Adding a Changeset

When you make a change that should be released:

```bash
yarn changeset
```

Follow the prompts to:

1. Select changed packages
2. Choose bump type (patch/minor/major)
3. Write a summary

This creates a file in `.changeset/` — commit it with your PR.

### Version Bumps

- **patch**: Bug fixes, no API changes
- **minor**: New features, backward compatible
- **major**: Breaking changes

## Pull Request Guidelines

1. Create a feature branch from `main`
2. Make your changes with tests
3. Run `yarn test` and `yarn lint`
4. Add a changeset if needed: `yarn changeset`
5. Open a PR with a clear description

## Code Style

- TypeScript strict mode
- Functional components with `forwardRef`
- JSDoc comments for AI-assisted development
- Export types alongside components

## Troubleshooting

### Storybook Issues

**"Failed to fetch dynamically imported module"**

- Cause: Core package not built or out of date
- Fix: `yarn workspace @xds/core build` then restart Storybook

**"React is not defined"**

- Cause: Missing React import in preview.tsx
- Fix: Ensure `import * as React from 'react';` at top of preview.tsx

**"Unexpected 'stylex.defineVars' call at runtime"**

- Cause: StyleX code trying to run without compilation
- Fix: Storybook should load from `dist/` not `src/`. Check vite.config.ts aliases.

**Changes not appearing in Storybook**

- Rebuild the package: `yarn workspace @xds/core build`
- Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Clear Storybook cache: Remove `apps/storybook/node_modules/.cache`
