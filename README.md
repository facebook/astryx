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

## Philosophy

- **AI-First** — Built to produce better trajectories in AI-assisted development, with auto-documentation and patterns designed for LLM consumption
- **Open Internals** — Unlike closed systems, all subcomponents are exported and recommended for use. Compose at any level.
- **Themeable** — First-class theming with CSS variable cascade

## Architecture

### Foundations

The building blocks for visually cohesive and accessible interfaces: typography, color, layout, and accessibility.

### Components

A library of 300+ reusable UI building blocks with full TypeScript support.

### Patterns

33+ battle-tested design solutions for common interactions and workflows: table pages, detail page layouts, form wizards, navigation patterns, data entry flows.

## Project Structure

| Directory | Purpose |
|-----------|---------|
| `apps/` | Application packages: documentation site, sandbox, and Storybook |
| `packages/` | Published packages: core components and utilities |
| `internal/` | Internal tooling: test utilities and build helpers |
| `e2e/` | End-to-end tests using Playwright |

## Contributing

We welcome contributions! Please see our contributing guide for details.

## License

MIT
