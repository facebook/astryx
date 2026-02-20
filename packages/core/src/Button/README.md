# /packages/core/src/Button

XDSButton component with multiple variants, sizes, and isLoading state support.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Variants**: `primary`, `secondary`, `ghost`, `destructive`
- **Sizes**: `sm` (28px), `md` (32px), `lg` (36px)
- **Loading state**: Shows spinner, disables interaction
- **Focus visible**: Accessible focus outline with variant-specific colors
- **Hover/active states**: Uses overlay colors via `backgroundImage` for consistent layering

## Usage

```tsx
import { XDSButton } from '@xds/core/Button';

// Basic usage
<XDSButton label="Click me" variant="primary" />

// With size
<XDSButton label="Large button" variant="primary" size="lg" />

// With isLoading state
<XDSButton label="Saving..." variant="primary" isLoading />

// Destructive action
<XDSButton label="Delete" variant="destructive" />

// Icon-only button (renders as a square)
// Pass `icon` without `children` — `label` becomes the aria-label
<XDSButton label="Settings" icon={<GearIcon />} variant="ghost" />

// Icon-only with emoji or text content
<XDSButton label="Select rocket emoji" icon={<span>🚀</span>} variant="ghost" size="sm" />

// Icon + visible label (pass children to show text alongside icon)
<XDSButton label="Edit" icon={<PencilIcon />}>Edit</XDSButton>
```

### Icon-Only Buttons

When `icon` is provided without `children`, the button becomes **icon-only**:

- Renders as a perfect square (`aspectRatio: 1/1`)
- `label` is used as `aria-label` for accessibility (not rendered visually)
- Works with any `ReactNode` as the icon — SVG components, emoji, or text

Use icon-only buttons for toolbars, action grids, compact controls, and anywhere
you need a small clickable element. Always prefer `XDSButton` over `<div onClick>`
or `<span onClick>` for accessibility (keyboard navigation, focus management, screen readers).

## Props

| Prop         | Type                                                   | Default       | Description                 |
| ------------ | ------------------------------------------------------ | ------------- | --------------------------- |
| `label`      | `string`                                               | —             | Accessible label (required) |
| `variant`    | `'primary' \| 'secondary' \| 'ghost' \| 'destructive'` | `'secondary'` | Visual style variant        |
| `size`       | `'sm' \| 'md' \| 'lg'`                                 | `'md'`        | Size variant                |
| `isLoading`  | `boolean`                                              | `false`       | Shows isLoading spinner     |
| `isDisabled` | `boolean`                                              | `false`       | Disables the button         |
| `icon`       | `ReactNode`                                            | —             | Icon element                |
| `children`   | `ReactNode`                                            | —             | Button content              |
| `tooltip`    | `string`                                               | —             | Tooltip text shown on hover |

## Files

| File                 | Role  | Purpose                               |
| -------------------- | ----- | ------------------------------------- |
| `index.ts`           | Entry | Exports XDSButton component and types |
| `XDSButton.tsx`      | Core  | XDSButton component implementation    |
| `XDSButton.test.tsx` | Test  | Unit tests for XDSButton component    |

## Implementation Notes

- `XDSButtonVariant` type is derived from the `variants` StyleX object using `keyof typeof variants`
- Hover/active states use `backgroundImage` with `linear-gradient` to layer overlay colors on top of the base background
- Destructive variant uses `colorTokens.negative` for its focus outline color
