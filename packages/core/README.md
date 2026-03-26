# @xds/core

A design system for building internal tools and products at Meta.

## Installation

```bash
yarn add @xds/core @xds/theme-default
```

## Quick Start

### 1. Import Base Styles

```tsx
// In your root layout or entry point
import '@xds/core/reset.css';
import '@xds/core/typography.css';
```

### 2. Set Up the Theme Provider

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
      <XDSButton label="Get Started" onPress={() => console.log('clicked')} />
    </>
  );
}
```

## CLI Tooling

XDS ships a CLI for component docs, scaffolding, and upgrade tooling:

```bash
npx xds component --list          # Browse all components by category
npx xds component Button          # Full docs for a component (props, usage, examples)
npx xds docs principles           # Design rules and anti-patterns
npx xds docs tokens               # Token reference (spacing, color, radius, type)
npx xds template <name> [path]    # Scaffold a page (blank, table, login)
npx xds swizzle <Name>            # Eject component source for customization
```

### Initialize your project

Run `xds init` to set up project configuration:

```bash
npx xds init
```

This walks you through setting up agent docs, templates, and other project-level configuration.

### AI Agent Setup

If you use AI coding agents (Claude Code, Cursor, Codex, etc.), install the XDS component catalog into your project's agent docs:

```bash
npx xds init --features agents
```

This injects a compact component index into your CLAUDE.md or AGENTS.md so your AI agent can discover and correctly use XDS components. Re-run after upgrading XDS to keep the index current.

## Upgrading

When upgrading to a new version, use the built-in upgrade command to automatically migrate breaking API changes:

```bash
npx xds upgrade --apply
```

This bumps all `@xds/*` dependencies, runs `yarn install`, applies codemods for breaking changes, and refreshes agent docs if present. To migrate between specific versions:

```bash
npx xds upgrade --apply --from 0.0.1 --to 0.0.2
```

Preview what would change without writing to disk:

```bash
npx xds upgrade
```

## Themes

XDS supports pluggable themes. Install a theme package and pass it to `XDSTheme`:

- `@xds/theme-default` — Clean, professional default
- `@xds/theme-neutral` — Muted, minimal aesthetic

```bash
yarn add @xds/theme-neutral
```

## Resources

- [Component Storybook](https://facebookexperimental.github.io/xds/)
- [GitHub Repository](https://github.com/facebookexperimental/xds)
- [Changelog](https://github.com/facebookexperimental/xds/blob/main/packages/core/CHANGELOG.md)

## License

MIT
