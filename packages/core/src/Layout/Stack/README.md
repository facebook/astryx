# /packages/core/src/Layout/Stack

Stack layout primitives for arranging items in horizontal or vertical sequences.

<!-- SYNC: When files in this directory change, update this document. -->

## Overview

The Stack system provides flexbox-based layout components with:
- Horizontal (`XDSHStack`) and vertical (`XDSVStack`) stacking
- Themed spacing via gap tokens
- Individual item control via `XDSStackItem`
- Polymorphic rendering support

## Import

```tsx
import {
  XDSHStack,
  XDSVStack,
  XDSStackItem,
  stack,
  stackItem
} from '@xds/core/Layout';
```

## Components

### XDSHStack

Horizontal stack for arranging items left-to-right. Supports polymorphic rendering.

```tsx
// Basic horizontal stack
<XDSHStack gap="space2">
  <Item />
  <Item />
</XDSHStack>

// With alignment
<XDSHStack gap="space4" vAlign="center">
  <Item />
  <Item />
</XDSHStack>

// Polymorphic rendering
<XDSHStack element="nav" gap="space2">
  <Link />
  <Link />
</XDSHStack>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gap` | `SpacingScale` | — | Spacing token between items |
| `vAlign` | `'start' \| 'center' \| 'end' \| 'stretch'` | `'stretch'` | Vertical alignment |
| `wrap` | `'nowrap' \| 'wrap' \| 'wrap-reverse'` | `'nowrap'` | Flex wrap behavior |
| `element` | `ElementType` | `'div'` | HTML element to render |
| `children` | `ReactNode` | — | Stack content |

### XDSVStack

Vertical stack for arranging items top-to-bottom. Supports polymorphic rendering.

```tsx
// Basic vertical stack
<XDSVStack gap="space2">
  <Item />
  <Item />
</XDSVStack>

// With alignment
<XDSVStack gap="space4" hAlign="center">
  <Item />
  <Item />
</XDSVStack>

// Polymorphic rendering
<XDSVStack element="main" gap="space4">
  <Header />
  <Content />
</XDSVStack>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gap` | `SpacingScale` | — | Spacing token between items |
| `hAlign` | `'start' \| 'center' \| 'end' \| 'stretch'` | `'stretch'` | Horizontal alignment |
| `wrap` | `'nowrap' \| 'wrap' \| 'wrap-reverse'` | `'nowrap'` | Flex wrap behavior |
| `element` | `ElementType` | `'div'` | HTML element to render |
| `children` | `ReactNode` | — | Stack content |

### XDSStackItem

Stack item for controlling individual item behavior within a stack. Supports polymorphic rendering.

```tsx
// Basic usage with fill
<XDSHStack gap="space2">
  <XDSStackItem size="static">Logo</XDSStackItem>
  <XDSStackItem size="fill">Content</XDSStackItem>
  <XDSStackItem size="static">Actions</XDSStackItem>
</XDSHStack>

// Override alignment
<XDSHStack vAlign="start">
  <XDSStackItem crossAlignSelf="center">Centered</XDSStackItem>
  <XDSStackItem>Top-aligned</XDSStackItem>
</XDSHStack>

// Polymorphic rendering
<XDSStackItem element="section" size="fill">
  Section content
</XDSStackItem>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'static' \| 'fill'` | `'static'` | Flex grow behavior |
| `crossAlignSelf` | `'start' \| 'center' \| 'end' \| 'stretch'` | — | Override cross-axis alignment |
| `element` | `ElementType` | `'div'` | HTML element to render |
| `children` | `ReactNode` | — | Item content |

## Utilities

For advanced use cases, you can use the underlying StyleX utilities directly.

### stack

StyleX utility for creating flex containers.

```tsx
import { stack } from '@xds/core/Layout';
import * as stylex from '@stylexjs/stylex';

<div {...stylex.props(...stack({ direction: 'horizontal', gap: 'space2' }))}>
  <Child />
  <Child />
</div>
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `direction` | `'horizontal' \| 'vertical'` | Required | Stack direction |
| `gap` | `SpacingScale` | — | Spacing token between items |
| `crossAlign` | `'start' \| 'center' \| 'end' \| 'stretch'` | — | Cross-axis alignment |
| `wrap` | `'nowrap' \| 'wrap' \| 'wrap-reverse'` | `'nowrap'` | Flex wrap behavior |

### stackItem

StyleX utility for controlling flex item behavior.

```tsx
import { stackItem } from '@xds/core/Layout';
import * as stylex from '@stylexjs/stylex';

<div {...stylex.props(...stackItem({ size: 'fill' }))}>
  Content
</div>
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `size` | `'static' \| 'fill'` | `'static'` | Flex grow behavior |
| `crossAlignSelf` | `'start' \| 'center' \| 'end' \| 'stretch'` | — | Override cross-axis alignment |

## Spacing Scale

The `gap` prop uses spacing tokens from the theme:

| Token | Description |
|-------|-------------|
| `space0` | No spacing |
| `space0.5` | Extra small spacing |
| `space1` | Small spacing |
| `space2` | Medium-small spacing |
| `space3` | Medium spacing |
| `space4` | Medium-large spacing |
| `space5` | Large spacing |
| `space6` | Extra large spacing |
| `space7` | Maximum spacing |

## Common Patterns

### Header Layout

```tsx
<XDSHStack element="header" gap="space2">
  <XDSStackItem size="static">
    <Logo />
  </XDSStackItem>
  <XDSStackItem size="fill">
    <Navigation />
  </XDSStackItem>
  <XDSStackItem size="static">
    <UserMenu />
  </XDSStackItem>
</XDSHStack>
```

### Sidebar Layout

```tsx
<XDSHStack gap="space4">
  <XDSStackItem size="static">
    <Sidebar />
  </XDSStackItem>
  <XDSStackItem size="fill">
    <MainContent />
  </XDSStackItem>
</XDSHStack>
```

### Page Layout

```tsx
<XDSVStack element="main" gap="space6">
  <XDSStackItem size="static">
    <PageHeader />
  </XDSStackItem>
  <XDSStackItem size="fill">
    <PageContent />
  </XDSStackItem>
  <XDSStackItem size="static">
    <PageFooter />
  </XDSStackItem>
</XDSVStack>
```

## Files

| File | Role | Purpose |
|------|------|---------|
| `index.ts` | Entry | Exports all stack utilities and components |
| `stack.stylex.ts` | Utility | StyleX styles for stack (flex container) behavior |
| `stackItem.stylex.ts` | Utility | StyleX styles for stack item behavior |
| `XDSHStack.tsx` | Component | Horizontal stack component |
| `XDSHStack.test.tsx` | Test | XDSHStack unit tests |
| `XDSVStack.tsx` | Component | Vertical stack component |
| `XDSVStack.test.tsx` | Test | XDSVStack unit tests |
| `XDSStackItem.tsx` | Component | Stack item wrapper component |
| `XDSStackItem.test.tsx` | Test | XDSStackItem unit tests |
