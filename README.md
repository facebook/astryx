<!-- SYNC CONTRACT: Architecture changes require documentation updates. -->

# XDS

A design system for building internal tools and products.

## Overview

XDS is an open source design system born from years of building internal tools at scale in Meta's monorepo. It provides foundations, components, and patterns that work together to deliver consistent, accessible interfaces.

**What makes XDS different:**

- **Open internals:** All primitives are exported and composable, not hidden. Build exactly what you need.
- **Plugin architecture:** Transform and extend components through a unified plugin system
- **Automatic spacing:** Context-aware spacing compensation eliminates "double padding" issues
- **AI-ready:** JSDoc annotations with composition hints for LLM-assisted development

## Getting Started

For full setup instructions, see the **[@xds/core README](packages/core/README.md)**.

Quick install:

```bash
# pnpm
pnpm add @xds/core @xds/theme-default
pnpm add -D @xds/cli

# npm
npm install @xds/core @xds/theme-default
npm install -D @xds/cli

# yarn
yarn add @xds/core @xds/theme-default
yarn add -D @xds/cli
```

For reliable CLI access, add this script to your `package.json`:

```json
"scripts": {
  "xds": "node node_modules/@xds/cli/bin/xds.mjs"
}
```

Then use the CLI as `npm run xds -- component --list`. This avoids path errors when AI assistants or new developers invoke the CLI directly.

Then follow the [setup guide](packages/core/README.md#quick-start) to import styles, configure the theme provider, and start using components.

## Packages

| Package                                         | Description                                        | README                                      |
| ----------------------------------------------- | -------------------------------------------------- | ------------------------------------------- |
| [`@xds/core`](packages/core)                    | Components, theme system, and utilities            | [README](packages/core/README.md)           |
| [`@xds/cli`](packages/cli)                      | CLI tooling: component docs, scaffolding, codemods | [README](packages/cli/README.md)            |
| [`@xds/build`](packages/build)                  | Build plugins for StyleX source builds             | [README](packages/build/README.md)          |
| [`@xds/vega`](packages/vega)                    | Vega/Vega-Lite chart wrapper                       | [README](packages/vega/README.md)           |
| [`@xds/theme-default`](packages/themes/default) | Clean, professional default theme                  | [README](packages/themes/default/README.md) |
| [`@xds/theme-neutral`](packages/themes/neutral) | Muted, minimal aesthetic theme                     | [README](packages/themes/neutral/README.md) |
| [`@xds/theme-daily`](packages/themes/daily)     | Warm, productivity-focused theme                   | [README](packages/themes/daily/README.md)   |

## Philosophy

- **AI-First:** Built to produce better trajectories in AI-assisted development, with auto-documentation and patterns for LLM consumption
- **Open Internals:** Unlike closed systems, all subcomponents are exported and recommended for use. Compose at any level.
- **Themeable:** First-class theming with CSS variable cascade

## Architecture

### Foundations

The building blocks for visually cohesive and accessible interfaces: typography, color, layout, and accessibility.

### Components

A library of 90+ reusable UI building blocks with full TypeScript support.

### Patterns

Battle-tested design solutions for common interactions and workflows: table pages, detail page layouts, form wizards, navigation patterns, data entry flows.

## Project Structure

| Directory   | Purpose                                                     |
| ----------- | ----------------------------------------------------------- |
| `apps/`     | Example apps and Storybook                                  |
| `packages/` | Published packages: core, cli, themes                       |
| `internal/` | Internal tooling: test utilities, eslint plugin, vibe tests |

## Contributing

We welcome contributions! See **[CONTRIBUTING.md](CONTRIBUTING.md)** for the full guide.

Quick start for contributors: this repo uses **pnpm 10** via [Corepack](https://nodejs.org/api/corepack.html). Enable it once and the right pnpm version installs automatically:

```bash
corepack enable
pnpm install
```

## License

MIT
