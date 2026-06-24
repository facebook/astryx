<!-- SYNC CONTRACT: Architecture changes require documentation updates. -->

# Astryx

An open source design system that's fully customizable and agent ready.

> **Currently in Beta** · Built on [React](https://react.dev) and [StyleX](https://stylexjs.com)

## Overview

Astryx is an open source design system born from years of building internal tools at scale in Meta's monorepo. It has grown inside Meta over the last eight years and powers over 13,000 apps, shaped by the engineers, designers, and product teams who depend on it every day.

It provides the foundations, components, templates, and themes that work together to deliver consistent, accessible interfaces — and it's designed so both humans and AI agents can build with the same tooling.

**What makes Astryx different:**

- **Open internals:** All primitives are exported and composable, not hidden. Compose at any level and build exactly what you need.
- **Automatic spacing:** Context-aware spacing compensation eliminates "double padding" issues so layouts stay clean without manual fixups.
- **Themeable:** First-class theming with a CSS variable cascade. Ten ready-made themes, all fully customizable.
- **Agent ready:** JSDoc annotations with composition hints, plus a CLI and MCP server so agents can scaffold, browse, and document using the same API you do.

## Getting Started

For full setup instructions, see the **[@astryxdesign/core README](packages/core/README.md)**.

Quick install:

```bash
# pnpm
pnpm add @astryxdesign/core @astryxdesign/theme-default
pnpm add -D @astryxdesign/cli

# npm
npm install @astryxdesign/core @astryxdesign/theme-default
npm install -D @astryxdesign/cli

# yarn
yarn add @astryxdesign/core @astryxdesign/theme-default
yarn add -D @astryxdesign/cli
```

For reliable CLI access, add this script to your `package.json`:

```json
"scripts": {
  "xds": "node node_modules/@astryxdesign/cli/bin/astryx.mjs"
}
```

Then use the CLI as `npm run xds -- component --list`. This avoids path errors when AI assistants or new developers invoke the CLI directly.

Then follow the [setup guide](packages/core/README.md#quick-start) to import styles, configure the theme provider, and start using components.

## Packages

| Package                           | Description                                                                                                                   | README                             |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| [`@astryxdesign/core`](packages/core)      | Components, theme system, and utilities                                                                                       | [README](packages/core/README.md)  |
| [`@astryxdesign/cli`](packages/cli)        | CLI tooling: component docs, templates, scaffolding, themes, and codemods                                                     | [README](packages/cli/README.md)   |
| [`@astryxdesign/build`](packages/build)    | Build plugins for StyleX source builds                                                                                        | [README](packages/build/README.md) |
| [`@astryxdesign/vega`](packages/vega)      | Vega/Vega-Lite chart wrapper                                                                                                  | [README](packages/vega/README.md)  |
| [`@astryxdesign/theme-*`](packages/themes) | Ten ready-made, fully customizable themes (default, neutral, daily, butter, chocolate, matcha, stone, gothic, brutalist, y2k) | [README](packages/themes)          |

> `@astryxdesign/lab` hosts experimental components for testing in Storybook and the sandbox; it is not published.

## Features

- **Over 90 components** — accessible, themeable React components with built-in spacing, dark mode, and flexible styling.
- **Themes that fit your brand** — fully customizable themes ready for use. Make it yours without starting from scratch.
- **Ready to ship templates** — production-ready templates for common pages; just plug in your content.
- **A design system your agent can use** — scaffold projects, browse templates, generate themes, and get agent-ready docs from the command line or MCP.

## Philosophy

- **Design for speed:** Foundations you can trust, speed you can feel. Teams stop reinventing the basics and start shipping the ideas that matter.
- **Built by the people who use it:** The system gets sharper when we put it to work in the real world. Using it in context strengthens the whole system for everyone.
- **Ready for what's next:** Opinionated foundations paired with flexible patterns so your system keeps pace, no matter how the craft evolves.

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
| `apps/`     | Example apps, the docsite, and Storybook                    |
| `packages/` | Published packages: core, cli, build, vega, themes          |
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
