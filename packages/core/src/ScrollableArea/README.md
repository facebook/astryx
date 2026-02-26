# ScrollableArea

Custom scrollable container with styled scrollbars. CSS-styled native scrollbars — no custom DOM structure.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Orientation**: Vertical, horizontal, or both-axis scrolling
- **Scrollbar Sizes**: Thin (sm) and standard (md) scrollbar tracks
- **Auto-hide**: Scrollbar visibility on hover/scroll or always visible
- **Dimension Constraints**: `maxHeight` / `maxWidth` convenience props
- **Accessible**: Keyboard scrollable with optional landmark semantics
- **Themeable**: Component style overrides via `ComponentStyles`

## Usage

```tsx
import { XDSScrollableArea } from '@xds/core/ScrollableArea';

// Basic vertical scroll
<XDSScrollableArea maxHeight={400}>
  <LongContent />
</XDSScrollableArea>

// Horizontal scroll for code/tables
<XDSScrollableArea orientation="horizontal" maxWidth="100%">
  <WideTable />
</XDSScrollableArea>

// Compact sidebar with always-visible thin scrollbar
<XDSScrollableArea
  orientation="vertical"
  size="sm"
  isAlwaysVisible
  maxHeight="calc(100vh - 64px)"
  label="Sidebar navigation"
>
  <SidebarNav />
</XDSScrollableArea>

// Both axes (e.g. canvas or large grid)
<XDSScrollableArea orientation="both" maxHeight={600} maxWidth="100%">
  <LargeGrid />
</XDSScrollableArea>
```

## Props

| Prop              | Type                                   | Default      | Description                                           |
| ----------------- | -------------------------------------- | ------------ | ----------------------------------------------------- |
| `children`        | `ReactNode`                            | —            | Content to render inside the scrollable area          |
| `orientation`     | `'vertical' \| 'horizontal' \| 'both'` | `'vertical'` | Which axes are scrollable                             |
| `size`            | `'sm' \| 'md'`                         | `'md'`       | Scrollbar track size (4px thin / 8px standard)        |
| `isAlwaysVisible` | `boolean`                              | `false`      | Always show scrollbar vs auto-hide on hover           |
| `maxHeight`       | `number \| string`                     | —            | Max height constraint (numbers are px)                |
| `maxWidth`        | `number \| string`                     | —            | Max width constraint (numbers are px)                 |
| `label`           | `string`                               | —            | Accessible label; adds `role="region"` + `aria-label` |
| `xstyle`          | `StyleXStyles`                         | —            | StyleX overrides for the container                    |
| `data-testid`     | `string`                               | —            | Test ID for the container element                     |

## Accessibility

- Container has `tabindex="0"` for keyboard scrolling
- When `label` is provided: `role="region"` + `aria-label` for landmark navigation
- Focus outline visible on `:focus-visible`
- Native scroll behavior handles all keyboard interaction

## Theming

Register style overrides via `ComponentStyles`:

```tsx
declare module '@xds/core/theme' {
  interface ComponentStyles {
    scrollableArea?: {
      root?: StyleXStyles;
    };
  }
}
```

## Design Decisions

| Decision                 | Choice                                    | Rationale                                                     |
| ------------------------ | ----------------------------------------- | ------------------------------------------------------------- |
| Native scrollbar styling | CSS `scrollbar-width` + `scrollbar-color` | Simpler, better performance, sufficient for internal tools    |
| `orientation` prop       | Single enum vs separate booleans          | Cleaner API, covers all cases with one prop                   |
| `maxHeight`/`maxWidth`   | Dedicated props + `xstyle` fallback       | Most common use case is constraining scroll dimensions        |
| `isAlwaysVisible`        | Boolean with `is` prefix                  | Only two states needed (auto-hide vs always visible)          |
| `label` for landmark     | Optional string                           | Only needed when scrollable area is a meaningful page section |
