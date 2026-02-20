# /packages/core/src/Layout/Container

Layout container components: a primitive and higher-order containers for sections.

<!-- SYNC: When files in this directory change, update this document. -->

## Overview

This folder contains:

- **XDSLayoutContainer** — A primitive that sets CSS variables for padding
- **XDSSection** — Higher-order component with background variants
- **XDSCard** — Re-exported for backward compatibility (canonical source: `/packages/core/src/Card/`)

## Import

```tsx
// Card — use the direct import
import {XDSCard} from '@xds/core/Card';

// Section and other layout utilities
import {XDSLayoutContainer, XDSSection} from '@xds/core/Layout';
```

## Components

### Types

```tsx
// Size value type - accepts numbers (pixels) or strings (CSS values)
type SizeValue = number | string;

// Examples:
// width={400}        → "400px"
// width="100%"       → "100%"
// width="50vh"       → "50vh"
```

### XDSCard

A card container with elevation and themed styling. Use for elevated content containers.

```tsx
<XDSCard width={400} height={300}>
  <XDSLayout
    header={<XDSLayoutHeader hasDivider>Title</XDSLayoutHeader>}
    content={<XDSLayoutContent>Content</XDSLayoutContent>}
    footer={<XDSLayoutFooter hasDivider>Actions</XDSLayoutFooter>}
  />
</XDSCard>
```

| Prop        | Type        | Default | Description                              |
| ----------- | ----------- | ------- | ---------------------------------------- |
| `width`     | `SizeValue` | —       | Width (number = pixels, string = as-is)  |
| `height`    | `SizeValue` | —       | Height (number = pixels, string = as-is) |
| `maxWidth`  | `SizeValue` | —       | Maximum width                            |
| `minHeight` | `SizeValue` | —       | Minimum height                           |
| `children`  | `ReactNode` | —       | Content (typically XDSLayout)            |

### XDSSection

A section container with background variants. Use for content sections within a page.

```tsx
<XDSSection variant="wash" width={300} height={250}>
  <XDSLayout
    content={<XDSLayoutContent>Content in wash section</XDSLayoutContent>}
  />
</XDSSection>
```

| Prop        | Type                                   | Default     | Description                              |
| ----------- | -------------------------------------- | ----------- | ---------------------------------------- |
| `variant`   | `'section' \| 'transparent' \| 'wash'` | `'section'` | Background variant                       |
| `width`     | `SizeValue`                            | —           | Width (number = pixels, string = as-is)  |
| `height`    | `SizeValue`                            | —           | Height (number = pixels, string = as-is) |
| `maxWidth`  | `SizeValue`                            | —           | Maximum width                            |
| `minHeight` | `SizeValue`                            | —           | Minimum height                           |
| `children`  | `ReactNode`                            | —           | Content                                  |

**Variants:**

| Variant       | Background    |
| ------------- | ------------- |
| `section`     | Surface color |
| `transparent` | Transparent   |
| `wash`        | Wash color    |

### XDSLayoutContainer (Primitive)

A low-level primitive that sets CSS variables for layout padding. Prefer XDSCard or XDSSection for most use cases.

```tsx
// Direct usage is rare - prefer higher-order components
<XDSLayoutContainer
  xstyle={customStyles}
  paddingInnerX="space3"
  paddingInnerY="space3"
>
  <XDSLayout ... />
</XDSLayoutContainer>
```

| Prop            | Type           | Default    | Description                                        |
| --------------- | -------------- | ---------- | -------------------------------------------------- |
| `xstyle`        | `StyleXStyles` | —          | Custom styles (background, shadow, radius, sizing) |
| `paddingOuterX` | `SpacingToken` | `'space4'` | Outer horizontal padding                           |
| `paddingOuterY` | `SpacingToken` | `'space4'` | Outer vertical padding                             |
| `paddingInnerX` | `SpacingToken` | `'space4'` | Inner horizontal padding for content areas         |
| `paddingInnerY` | `SpacingToken` | `'space4'` | Inner vertical padding for content areas           |
| `children`      | `ReactNode`    | —          | Content                                            |

**CSS Variables Set:**

- `--layout-padding-outer-x`, `--layout-padding-outer-y` — Used by XDSLayout for fullBleed calculations
- `--layout-padding-inner-x`, `--layout-padding-inner-y` — Used by content areas (Header, Footer, Content, Panel)

## Files

| File                     | Role      | Purpose                            |
| ------------------------ | --------- | ---------------------------------- |
| `index.ts`               | Entry     | Exports all components and types   |
| `XDSLayoutContainer.tsx` | Primitive | Base container, sets CSS variables |
| `XDSCard.tsx`            | Component | Card with elevation                |
| `XDSSection.tsx`         | Component | Section with background variants   |
| `README.md`              | Docs      | This documentation                 |

## Theming

Higher-order components support theme-level overrides:

```tsx
// XDSCard theming
declare module '@xds/core' {
  interface ComponentStyles {
    card?: {base?: StyleXStyles};
  }
}

// XDSSection theming
declare module '@xds/core' {
  interface ComponentStyles {
    section?: {variants?: Partial<Record<XDSSectionVariant, StyleXStyles>>};
  }
}
```

Themes can override padding by setting the CSS variables in their style overrides:

```tsx
const cardStyles = stylex.create({
  base: {
    '--layout-padding-inner-x': spacingTokens.space3,
    '--layout-padding-inner-y': spacingTokens.space3,
  },
});
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Higher-Order Components                                 │
│  XDSCard, XDSSection (and future: XDSModal, XDSPopover) │
├─────────────────────────────────────────────────────────┤
│  Primitive                                               │
│  XDSLayoutContainer                                      │
│  (Sets CSS variables, flex container)                    │
└─────────────────────────────────────────────────────────┘
```

XDSCard and XDSSection wrap XDSLayoutContainer, adding their own styling. They expose explicit sizing props (width, height, maxWidth, minHeight) rather than xstyle for better introspectability. Padding values are fixed internally (not exposed as props).
