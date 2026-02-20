# /packages/core/src/Layout

XDS Layout System - composable utilities and components for building structured layouts.

<!-- SYNC: When files in this directory change, update this document. -->

## Overview

The layout system provides a container/content separation pattern with:

- **Primitive + higher-order architecture** — XDSLayoutContainer is a primitive; XDSCard, XDSSection are higher-order
- **Directional padding via CSS variables** — Inner/outer, horizontal/vertical padding control
- **Context-aware defaults** — Components detect their slot and self-adjust
- **Automatic RTL support** — Uses CSS logical properties

## Import

All layout utilities and components are exported from `@xds/core/Layout`:

```tsx
import {
  // Container components
  XDSLayoutContainer,
  XDSCard,
  XDSSection,
  // Layout structure
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutFooter,
  XDSLayoutContent,
  XDSLayoutPanel,
  // Stack utilities
  XDSHStack,
  XDSVStack,
  XDSStackItem,
  stack,
  stackItem,
} from '@xds/core/Layout';
```

## Structure

```
Layout/
├── index.ts              # Entry point, re-exports everything
├── README.md             # This documentation
├── Container/            # Container primitive and higher-order components
│   ├── index.ts
│   ├── README.md
│   ├── XDSLayoutContainer.tsx  # Primitive
│   ├── XDSCard.tsx             # Card with elevation
│   └── XDSSection.tsx          # Section with background variants
├── XDSLayout/            # Layout structure components
│   ├── index.ts
│   ├── README.md
│   ├── XDSLayout.tsx
│   ├── XDSLayoutHeader.tsx
│   ├── XDSLayoutFooter.tsx
│   ├── XDSLayoutContent.tsx
│   ├── XDSLayoutPanel.tsx
│   └── XDSLayoutAreaContext.ts
└── Stack/                # Stack utilities and components
    ├── index.ts
    ├── README.md
    ├── stack.stylex.ts
    ├── stackItem.stylex.ts
    ├── XDSHStack.tsx
    ├── XDSVStack.tsx
    └── XDSStackItem.tsx
```

## Quick Start

### Card Layout

```tsx
<XDSCard>
  <XDSLayout
    header={<XDSLayoutHeader hasDivider>Title</XDSLayoutHeader>}
    content={<XDSLayoutContent>Body content</XDSLayoutContent>}
    footer={
      <XDSLayoutFooter hasDivider>
        <XDSHStack gap="space2" hAlign="end">
          <XDSButton variant="secondary">Cancel</XDSButton>
          <XDSButton variant="primary">Save</XDSButton>
        </XDSHStack>
      </XDSLayoutFooter>
    }
  />
</XDSCard>
```

### App shell with sidebar

```tsx
<XDSLayout
  header={<XDSLayoutHeader hasDivider>App Name</XDSLayoutHeader>}
  start={
    <XDSLayoutPanel hasDivider width={240} role="navigation">
      <Navigation />
    </XDSLayoutPanel>
  }
  content={
    <XDSLayoutContent role="main">
      <MainContent />
    </XDSLayoutContent>
  }
/>
```

## Components

### Container Components

| Component            | Description                                                   |
| -------------------- | ------------------------------------------------------------- |
| `XDSLayoutContainer` | Primitive that sets CSS variables for padding                 |
| `XDSCard`            | Card with elevation and themed styling                        |
| `XDSSection`         | Section with background variants (section, transparent, wash) |

See [Container/README.md](./Container/README.md) for full documentation.

### Layout Structure

Use XDSLayout for page shells and app layouts — any UI with a header bar, sidebar navigation,
scrollable content area, or action footer. Don't use for simple stacking (use XDSVStack/XDSHStack).

| Component          | Description                                                               |
| ------------------ | ------------------------------------------------------------------------- |
| `XDSLayout`        | Page shell with header, sidebar(s), content, and footer slots             |
| `XDSLayoutHeader`  | Top bar — page titles, app bars, toolbars                                 |
| `XDSLayoutFooter`  | Bottom bar — action bars, pagination, status bars                         |
| `XDSLayoutContent` | Scrollable main content area                                              |
| `XDSLayoutPanel`   | Sidebar — navigation panels, settings sidebars, detail/inspector panels   |

See [XDSLayout/README.md](./XDSLayout/README.md) for full documentation.

### Stack Components

| Component      | Description                            |
| -------------- | -------------------------------------- |
| `XDSHStack`    | Horizontal stack (left-to-right)       |
| `XDSVStack`    | Vertical stack (top-to-bottom)         |
| `XDSStackItem` | Stack item with fill/alignment control |

See [Stack/README.md](./Stack/README.md) for full documentation.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Higher-Order Components                                 │
│  XDSCard, XDSSection (future: XDSModal, XDSPopover)     │
├─────────────────────────────────────────────────────────┤
│  Layout Structure                                        │
│  XDSLayout + XDSLayoutHeader/Footer/Content/Panel       │
├─────────────────────────────────────────────────────────┤
│  Primitive                                               │
│  XDSLayoutContainer (sets CSS variables)                │
├─────────────────────────────────────────────────────────┤
│  Layout Utilities                                        │
│  XDSHStack, XDSVStack, stack(), stackItem()             │
└─────────────────────────────────────────────────────────┘
```

## CSS Variables

XDSLayoutContainer sets these CSS variables that child components read:

| Variable                   | Used By                        | Purpose                  |
| -------------------------- | ------------------------------ | ------------------------ |
| `--layout-padding-outer-x` | XDSLayout                      | Outer horizontal padding |
| `--layout-padding-outer-y` | XDSLayout                      | Outer vertical padding   |
| `--layout-padding-inner-x` | Header, Footer, Content, Panel | Inner horizontal padding |
| `--layout-padding-inner-y` | Header, Footer, Content, Panel | Inner vertical padding   |

## Related

- See `.context/proposals/layout-system.md` for full design proposal
