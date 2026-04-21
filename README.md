<!-- SYNC CONTRACT: Architecture changes require documentation updates. -->

# XDS

A design system for building internal tools and products, enabling the creation of high-quality product experiences.

## Overview

XDS is an open source design system born from years of building internal tools at scale in Meta's monorepo. It provides foundations, components, and patterns that work together to deliver consistent, accessible interfaces.

**What makes XDS different:**

- **Open internals** — All primitives are exported and composable, not hidden. Build exactly what you need.
- **Plugin architecture** — Transform and extend components through a unified plugin system
- **Automatic spacing** — Context-aware spacing compensation eliminates "double padding" issues
- **AI-ready** — JSDoc annotations with composition hints designed for LLM-assisted development

## Getting Started

For full setup instructions, see the **[@xds/core README](packages/core/README.md)**.

Quick install:

```bash
yarn add @xds/core @xds/theme-default
yarn add -D @xds/cli
```

Then follow the [setup guide](packages/core/README.md#quick-start) to import styles, configure the theme provider, and start using components.

## Packages

| Package                                         | Description                                           | README                                       |
| ----------------------------------------------- | ----------------------------------------------------- | -------------------------------------------- |
| [`@xds/core`](packages/core)                    | Components, theme system, and utilities               | [README](packages/core/README.md)            |
| [`@xds/cli`](packages/cli)                      | CLI tooling — component docs, scaffolding, codemods   | [README](packages/cli/README.md)             |
| [`@xds/build`](packages/build)                  | Build plugins for StyleX source builds                | [README](packages/build/README.md)           |
| [`@xds/vega`](packages/vega)                    | Vega/Vega-Lite chart wrapper                          | [README](packages/vega/README.md)            |
| [`@xds/theme-default`](packages/themes/default) | Clean, professional default theme                     | [README](packages/themes/default/README.md)  |
| [`@xds/theme-neutral`](packages/themes/neutral) | Muted, minimal aesthetic theme                        | [README](packages/themes/neutral/README.md)  |
| [`@xds/theme-daily`](packages/themes/daily)     | Warm, productivity-focused theme                      | [README](packages/themes/daily/README.md)    |

## Philosophy

- **AI-First** — Built to produce better trajectories in AI-assisted development, with auto-documentation and patterns designed for LLM consumption
- **Open Internals** — Unlike closed systems, all subcomponents are exported and recommended for use. Compose at any level.
- **Themeable** — First-class theming with CSS variable cascade

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
| `e2e/`      | End-to-end tests (Playwright)                               |

## Contributing

We welcome contributions! Please see our contributing guide for details.

## License

MIT
