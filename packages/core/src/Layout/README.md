# /packages/core/src/Layout

XDS Layout System - composable utilities and components for building structured layouts.

<!-- SYNC: When files in this directory change, update this document. -->

## Overview

The layout system provides a container/content separation pattern with:
- Zero styling customization (no xstyle props)
- Context-aware defaults
- Automatic RTL support via logical properties
- Polymorphic rendering support

## Import

All layout utilities and components are exported from `@xds/core/Layout`:

```tsx
import {
  XDSHStack,
  XDSVStack,
  XDSStackItem,
  stack,
  stackItem
} from '@xds/core/Layout';
```

## Structure

```
Layout/
├── index.ts           # Entry point, re-exports everything
├── Stack/             # Stack utilities and components
│   ├── index.ts
│   ├── README.md      # Stack documentation
│   ├── stack.stylex.ts
│   ├── stackItem.stylex.ts
│   ├── XDSHStack.tsx
│   ├── XDSHStack.test.tsx
│   ├── XDSVStack.tsx
│   ├── XDSVStack.test.tsx
│   ├── XDSStackItem.tsx
│   └── XDSStackItem.test.tsx
└── README.md
```

## Available Components

### Stack Components

Stack layout primitives for arranging items in horizontal or vertical sequences.

See [Stack/README.md](./Stack/README.md) for full documentation.

| Component | Description |
|-----------|-------------|
| `XDSHStack` | Horizontal stack (left-to-right) |
| `XDSVStack` | Vertical stack (top-to-bottom) |
| `XDSStackItem` | Stack item with fill/alignment control |

Quick example:

```tsx
<XDSHStack gap="space2">
  <XDSStackItem size="static">Logo</XDSStackItem>
  <XDSStackItem size="fill">Content</XDSStackItem>
  <XDSStackItem size="static">Actions</XDSStackItem>
</XDSHStack>
```

## Components (Planned)

| Component | Status | Description |
|-----------|--------|-------------|
| `XDSLayoutContainer` | Planned | Outer container with variant-based styling |
| `XDSLayout` | Planned | Section arrangement with named slots |
| `XDSLayoutHeader` | Planned | Header content area |
| `XDSLayoutFooter` | Planned | Footer content area |
| `XDSLayoutContent` | Planned | Main content area |
| `XDSLayoutPanel` | Planned | Side panel content area |

## Related

- See `.context/proposals/layout-system.md` for full design proposal
