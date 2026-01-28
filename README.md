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

### Installation

```bash
npm install @xds/core
# or
yarn add @xds/core
```

### 1. Set Up the Theme Provider

Wrap your application with the `Theme` component. This sets up CSS custom properties used by all XDS components.

```tsx
import {Theme, defaultTheme} from '@xds/core';

function App() {
  return (
    <Theme theme={defaultTheme}>
      <YourApp />
    </Theme>
  );
}
```

### 2. Import Typography Styles (Optional)

For styling native HTML elements (h1-h6, p, lists, code blocks, etc.), import the typography stylesheet:

```tsx
import '@xds/core/typography.css';
```

Apply to your document body or use `XDSFontWrapper` for scoped sections:

```tsx
// Option A: Global - apply to body
<body className="xds-typography">

// Option B: Scoped - wrap specific content
import { XDSFontWrapper } from '@xds/core';

<XDSFontWrapper>
  <article dangerouslySetInnerHTML={{ __html: markdownContent }} />
</XDSFontWrapper>
```

The typography styles support two heading scales:

- **default** — Dense scale for internal tools (h1: 20px)
- **editorial** — Larger scale for documentation/content (h1: 32px)

```tsx
<XDSFontWrapper variant="editorial">
  <h1>Article Title</h1>
  <p>Long-form content...</p>
</XDSFontWrapper>
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

| Directory   | Purpose                                                          |
| ----------- | ---------------------------------------------------------------- |
| `apps/`     | Application packages: documentation site, sandbox, and Storybook |
| `packages/` | Published packages: core components and utilities                |
| `internal/` | Internal tooling: test utilities and build helpers               |
| `e2e/`      | End-to-end tests using Playwright                                |

## Contributing

We welcome contributions! Please see our contributing guide for details.

## License

MIT
