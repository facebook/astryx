# @xds/core

A design system for building internal tools and products at Meta.

## Installation

```bash
# Install core + a theme + the CLI (dev tooling)
yarn add @xds/core @xds/theme-default
yarn add -D @xds/cli

# npm
npm install @xds/core @xds/theme-default
npm install -D @xds/cli

# pnpm
pnpm add @xds/core @xds/theme-default
pnpm add -D @xds/cli
```

## Quick Start

### 1. Import CSS

Import the reset, base component styles, and your theme's CSS at the root of your application:

```tsx
// In your root layout or entry point
import '@xds/core/reset.css'; // CSS reset (normalize + box-sizing)
import '@xds/core/xds.css'; // Pre-compiled component styles
import '@xds/theme-default/theme.css'; // Theme tokens
```

> **Building from source with the StyleX plugin?** You can skip `xds.css` —
> the plugin compiles component styles at build time. See the
> [Vite example](apps/example-vite/) for the source-path setup.

### 2. Set Up the Theme Provider

Wrap your application with the `XDSTheme` component:

```tsx
import {XDSTheme} from '@xds/core';
import {defaultTheme} from '@xds/theme-default';

function App() {
  return (
    <XDSTheme theme={defaultTheme}>
      <YourApp />
    </XDSTheme>
  );
}
```

### 3. Use Components

```tsx
import {XDSButton, XDSText, XDSHeading} from '@xds/core';

function Example() {
  return (
    <>
      <XDSHeading>Welcome</XDSHeading>
      <XDSText>Click the button below to get started.</XDSText>
      <XDSButton label="Get Started" onClick={() => console.log('clicked')} />
    </>
  );
}
```

## Installation from dist (vendored)

If you'd rather vendor XDS without a package manager:

1. Ensure React is available. XDS peer-requires `react` and `react-dom` (>=19.0.0).
2. Run `yarn build` to generate the dist files.
3. Copy `packages/core/dist/` into your project (e.g., `vendor/xds/`).
4. Import the CSS — `reset.css` for the reset, `xds.css` for all component styles:

You can use a `<link>` tag or a CSS import (recommended):

```
import '../vendor/xds/reset.css';
import '../vendor/xds/xds.css';
```

5. Import components. If you are using a bundler such as Vite/TS you can add a resolver so you can use standard imports:

Add this to `vite.config.ts`:

```
  resolve: {
    alias: {
      '@xds/core': path.resolve(__dirname, 'vendor/xds'),
    },
  },
```

Add this to `tsconfig.json`:

```
    "paths": {
      "@xds/core/*": ["./vendor/xds/*"]
    },
```

Then you can use standard imports as described in "Use Components" above. Alternatively you can use relative imports:

```
// Import from index
import {Button} from './vendor/xds/index.mjs'
// Or import individual components (preferred)
import {Button} from './vendor/xds/Button/index.mjs'
```

## CLI Tooling

The `@xds/cli` package provides component docs, scaffolding, and upgrade tooling:

```bash
xds component --list          # Browse all components by category
xds component Button          # Full docs for a component (props, usage, examples)
xds docs principles           # Design rules and anti-patterns
xds docs tokens               # Token reference (spacing, color, radius, type)
xds template <name> [path]    # Scaffold a page (blank, table, login)
xds swizzle <Name>            # Eject component source for customization
```

> If `@xds/cli` is installed as a devDependency, use `xds` directly (yarn/pnpm resolve it from `node_modules/.bin`). Otherwise, use `npx xds`.

### Initialize your project

Run `xds init` to set up project configuration:

```bash
xds init
```

This walks you through setting up agent docs, templates, and other project-level configuration.

### AI Agent Setup

If you use AI coding agents (Claude Code, Cursor, Codex, etc.), install the XDS component catalog into your project's agent docs:

```bash
xds init --features agents
```

This injects a compact component index into your CLAUDE.md or AGENTS.md so your AI agent can discover and correctly use XDS components. Re-run after upgrading XDS to keep the index current.

## Upgrading

When upgrading to a new version, use the built-in upgrade command to automatically migrate breaking API changes:

```bash
xds upgrade --apply
```

This bumps all `@xds/*` dependencies, runs `yarn install`, applies codemods for breaking changes, and refreshes agent docs if present. To migrate between specific versions:

```bash
xds upgrade --apply --from 0.0.1 --to 0.0.2
```

Preview what would change without writing to disk:

```bash
xds upgrade
```

## Themes

XDS supports pluggable themes. Install a theme package and pass it to `XDSTheme`:

| Package              | Description                 |
| -------------------- | --------------------------- |
| `@xds/theme-default` | Clean, professional default |
| `@xds/theme-neutral` | Muted, minimal aesthetic    |

Each theme package exports a JS theme object and a `theme.css` file:

```bash
yarn add @xds/theme-neutral
```

```tsx
import '@xds/theme-neutral/theme.css';
import {neutralTheme} from '@xds/theme-neutral';

<XDSTheme theme={neutralTheme}>...</XDSTheme>;
```

### Custom Themes

Build your own theme with `defineTheme()`. For a full guide on creating custom themes, token overrides, and component style customization:

```bash
xds docs theme
```

## Resources

- [Component Storybook](https://facebookexperimental.github.io/xds/)
- [GitHub Repository](https://github.com/facebookexperimental/xds)
- [Changelog](https://github.com/facebookexperimental/xds/blob/main/packages/core/CHANGELOG.md)

## License

MIT
