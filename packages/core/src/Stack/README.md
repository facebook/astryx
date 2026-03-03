# Stack

Stack layout primitives for arranging items in horizontal or vertical sequences.

<!-- SYNC: When files in this directory change, update this document. -->

## Overview

`XDSStack` is the primary layout component for arranging items in horizontal or vertical sequences. It provides a single, unified API with an explicit `direction` prop.

## Import

```tsx
import {XDSStack, XDSStackItem} from '@xds/core/Layout';
```

## Quick Start

```tsx
// Vertical stack (page sections, form fields, card content)
<XDSStack direction="vertical" gap="space4">
  <Heading>Title</Heading>
  <Text>Description</Text>
  <Button>Action</Button>
</XDSStack>

// Horizontal stack (toolbar, nav items, inline elements)
<XDSStack direction="horizontal" gap="space2" vAlign="center">
  <Avatar />
  <Text>Username</Text>
  <Badge>Online</Badge>
</XDSStack>
```

## XDSStack

Unified stack component. The `direction` prop controls whether items flow horizontally or vertically.

The `hAlign` and `vAlign` props automatically map to the correct CSS axis based on direction:
- `direction="horizontal"`: `hAlign` → main-axis (justify-content), `vAlign` → cross-axis (align-items)
- `direction="vertical"`: `vAlign` → main-axis (justify-content), `hAlign` → cross-axis (align-items)

```tsx
// Horizontal with vertical centering
<XDSStack direction="horizontal" gap="space2" vAlign="center">
  <Item />
  <Item />
</XDSStack>

// Vertical with horizontal centering
<XDSStack direction="vertical" gap="space4" hAlign="center">
  <Item />
  <Item />
</XDSStack>

// Main-axis distribution (space-between)
<XDSStack direction="horizontal" gap="space2" hAlign="between">
  <Logo />
  <Navigation />
  <UserMenu />
</XDSStack>

// Polymorphic rendering
<XDSStack direction="horizontal" element="nav" gap="space2">
  <Link />
  <Link />
</XDSStack>
```

| Prop       | Type                                                                         | Default     | Description                                                              |
| ---------- | ---------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------ |
| `direction`| `'horizontal' \| 'vertical'`                                                | Required    | Stack direction                                                          |
| `gap`      | `SpacingScale`                                                               | —           | Spacing token: `space0` `space1` `space2` `space3` `space4` `space5` ... |
| `hAlign`   | `'start' \| 'center' \| 'end' \| 'stretch' \| 'between' \| 'around' \| 'evenly'` | —  | Horizontal alignment (axis depends on direction)                         |
| `vAlign`   | `'start' \| 'center' \| 'end' \| 'stretch' \| 'between' \| 'around' \| 'evenly'` | —  | Vertical alignment (axis depends on direction)                           |
| `wrap`     | `'nowrap' \| 'wrap' \| 'wrap-reverse'`                                     | `'nowrap'`  | Flex wrap behavior                                                       |
| `element`  | `ElementType`                                                                | `'div'`     | HTML element to render                                                   |
| `xstyle`   | `StyleXStyles`                                                               | —           | StyleX styles                                                            |
| `children` | `ReactNode`                                                                  | —           | Stack content                                                            |

## XDSStackItem

Controls individual item behavior within a stack. Supports polymorphic rendering.

```tsx
// Fill remaining space
<XDSStack direction="horizontal" gap="space2">
  <XDSStackItem size="static">Logo</XDSStackItem>
  <XDSStackItem size="fill">Content</XDSStackItem>
  <XDSStackItem size="static">Actions</XDSStackItem>
</XDSStack>

// Override alignment for a single item
<XDSStack direction="horizontal" vAlign="start">
  <XDSStackItem crossAlignSelf="center">Centered</XDSStackItem>
  <XDSStackItem>Top-aligned</XDSStackItem>
</XDSStack>

// Polymorphic rendering
<XDSStackItem element="section" size="fill">
  Section content
</XDSStackItem>
```

| Prop             | Type                                        | Default    | Description                   |
| ---------------- | ------------------------------------------- | ---------- | ----------------------------- |
| `size`           | `'static' \| 'fill'`                       | `'static'` | Flex grow behavior            |
| `crossAlignSelf` | `'start' \| 'center' \| 'end' \| 'stretch'` | —       | Override cross-axis alignment |
| `element`        | `ElementType`                               | `'div'`    | HTML element to render        |
| `xstyle`         | `StyleXStyles`                              | —          | StyleX styles                 |
| `children`       | `ReactNode`                                 | —          | Item content                  |

## Common Patterns

### Header Layout

```tsx
<XDSStack direction="horizontal" element="header" gap="space2">
  <XDSStackItem size="static">
    <Logo />
  </XDSStackItem>
  <XDSStackItem size="fill">
    <Navigation />
  </XDSStackItem>
  <XDSStackItem size="static">
    <UserMenu />
  </XDSStackItem>
</XDSStack>
```

### Sidebar Layout

```tsx
<XDSStack direction="horizontal" gap="space4">
  <XDSStackItem size="static">
    <Sidebar />
  </XDSStackItem>
  <XDSStackItem size="fill">
    <MainContent />
  </XDSStackItem>
</XDSStack>
```

### Page Layout

```tsx
<XDSStack direction="vertical" element="main" gap="space6">
  <XDSStackItem size="static">
    <PageHeader />
  </XDSStackItem>
  <XDSStackItem size="fill">
    <PageContent />
  </XDSStackItem>
  <XDSStackItem size="static">
    <PageFooter />
  </XDSStackItem>
</XDSStack>
```

### Centered Content

```tsx
<XDSStack direction="vertical" gap="space4" hAlign="center" vAlign="center">
  <Icon name="check-circle" size="lg" />
  <Heading>Success</Heading>
  <Text>Your changes have been saved.</Text>
</XDSStack>
```

## Utilities

For advanced use cases, you can use the underlying StyleX utilities directly.

### stack

StyleX utility for creating flex containers.

```tsx
import {stack} from '@xds/core/Layout';
import * as stylex from '@stylexjs/stylex';

<div {...stylex.props(...stack({direction: 'horizontal', gap: 'space2'}))}>
  <Child />
  <Child />
</div>;
```

| Option       | Type                                        | Default    | Description                                                              |
| ------------ | ------------------------------------------- | ---------- | ------------------------------------------------------------------------ |
| `direction`  | `'horizontal' \| 'vertical'`               | Required   | Stack direction                                                          |
| `gap`        | `SpacingScale`                              | —          | Spacing token: `space0` `space1` `space2` `space3` `space4` `space5` ... |
| `crossAlign` | `'start' \| 'center' \| 'end' \| 'stretch'` | —       | Cross-axis alignment                                                     |
| `mainAlign`  | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly'` | — | Main-axis alignment                                       |
| `wrap`       | `'nowrap' \| 'wrap' \| 'wrap-reverse'`     | `'nowrap'` | Flex wrap behavior                                                       |

### stackItem

StyleX utility for controlling flex item behavior.

```tsx
import {stackItem} from '@xds/core/Layout';
import * as stylex from '@stylexjs/stylex';

<div {...stylex.props(...stackItem({size: 'fill'}))}>Content</div>;
```

| Option           | Type                                        | Default    | Description                   |
| ---------------- | ------------------------------------------- | ---------- | ----------------------------- |
| `size`           | `'static' \| 'fill'`                       | `'static'` | Flex grow behavior            |
| `crossAlignSelf` | `'start' \| 'center' \| 'end' \| 'stretch'` | —       | Override cross-axis alignment |

## Spacing Scale

The `gap` prop uses spacing tokens from the theme:

| Token      | Description          |
| ---------- | -------------------- |
| `space0`   | No spacing           |
| `space0.5` | Extra small spacing  |
| `space1`   | Small spacing        |
| `space2`   | Medium-small spacing |
| `space3`   | Medium spacing       |
| `space4`   | Medium-large spacing |
| `space5`   | Large spacing        |
| `space6`   | Extra large spacing  |
| `space7`   | Maximum spacing      |

## Files

| File                    | Role      | Purpose                                           |
| ----------------------- | --------- | ------------------------------------------------- |
| `index.ts`              | Entry     | Exports all stack utilities and components        |
| `stack.stylex.ts`       | Utility   | StyleX styles for stack (flex container) behavior |
| `stackItem.stylex.ts`   | Utility   | StyleX styles for stack item behavior             |
| `XDSStack.tsx`          | Component | Unified stack component                           |
| `XDSStack.test.tsx`     | Test      | XDSStack unit tests                               |
| `XDSStackItem.tsx`      | Component | Stack item wrapper component                      |
| `XDSStackItem.test.tsx` | Test      | XDSStackItem unit tests                           |
