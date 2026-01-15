# /packages/core/src/Layout

XDS Layout System - composable components for building structured layouts.

<!-- SYNC: When files in this directory change, update this document. -->

## Overview

The layout system provides a container/content separation pattern with:
- Zero styling customization (no xstyle props)
- Context-aware defaults
- Automatic RTL support via logical properties

## Files

| File | Role | Purpose |
|------|------|---------|
| `index.ts` | Entry | Exports all layout components and utilities |
| `stack.stylex.ts` | Utility | StyleX styles for stack (flex container) behavior |
| `stackItem.stylex.ts` | Utility | StyleX styles for stack item behavior |

## Utilities

### stack

StyleX utility for creating flex containers (stacks).

```tsx
import { stack } from '@xds/core/Layout';
import * as stylex from '@stylexjs/stylex';

// Horizontal stack with gap
<div {...stylex.props(...stack({ direction: 'horizontal', gap: 8 }))}>
  <Child />
  <Child />
</div>

// Vertical stack with centered items
<div {...stylex.props(...stack({ direction: 'vertical', crossAlign: 'center' }))}>
  <Child />
  <Child />
</div>
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `direction` | `'horizontal' \| 'vertical'` | Required | Stack direction |
| `gap` | `number` | `0` | Spacing between items (px) |
| `crossAlign` | `'start' \| 'center' \| 'end' \| 'stretch'` | — | Cross-axis alignment |
| `wrap` | `'nowrap' \| 'wrap' \| 'wrap-reverse'` | `'nowrap'` | Flex wrap behavior |

### stackItem

StyleX utility for controlling flex item behavior within stacks.

```tsx
import { stackItem } from '@xds/core/Layout';
import * as stylex from '@stylexjs/stylex';

// Fill remaining space
<div {...stylex.props(...stackItem({ size: 'fill' }))}>
  Content
</div>

// Override cross-alignment
<div {...stylex.props(...stackItem({ crossAlignSelf: 'center' }))}>
  Centered item
</div>
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `size` | `'static' \| 'fill'` | `'static'` | Flex grow behavior |
| `crossAlignSelf` | `'start' \| 'center' \| 'end' \| 'stretch'` | — | Override cross-axis alignment |

## Components (Planned)

| Component | Status | Description |
|-----------|--------|-------------|
| `XDSLayoutContainer` | Planned | Outer container with variant-based styling |
| `XDSLayout` | Planned | Section arrangement with named slots |
| `XDSLayoutHeader` | Planned | Header content area |
| `XDSLayoutFooter` | Planned | Footer content area |
| `XDSLayoutContent` | Planned | Main content area |
| `XDSLayoutPanel` | Planned | Side panel content area |
| `XDSHStack` | Planned | Horizontal stack |
| `XDSVStack` | Planned | Vertical stack |
| `XDSStackItem` | Planned | Stack item wrapper |

## Related

- See `.context/proposals/layout-system.md` for full design proposal
