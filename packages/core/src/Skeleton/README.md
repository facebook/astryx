# /packages/core/src/Skeleton

A placeholder loading component that displays an animated pulsing effect while content is loading.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Pulsing Animation**: Smooth opacity animation using stepped timing for a subtle shimmer effect
- **Staggered Animation**: Sequential skeletons can be staggered to create a wave effect
- **High Contrast Support**: Automatically adjusts for users with `prefers-contrast: more`
- **Flexible Sizing**: Width and height props accept pixels or any CSS value
- **Token-aligned Radius**: Border radius options map directly to design tokens

## Usage

```tsx
import { XDSSkeleton } from '@xds/core/Skeleton';

// Basic text placeholder
<XDSSkeleton width={200} height={16} />

// Circular avatar placeholder
<XDSSkeleton width={40} height={40} radius="rounded" />

// Full-width with percentage
<XDSSkeleton width="100%" height={20} />

// Staggered animation for multiple skeletons
<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
  <XDSSkeleton width={300} height={16} index={0} />
  <XDSSkeleton width={280} height={16} index={1} />
  <XDSSkeleton width={320} height={16} index={2} />
</div>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number \| string` | `'100%'` | Width in pixels (number) or CSS value (string) |
| `height` | `number \| string` | `'100%'` | Height in pixels (number) or CSS value (string) |
| `radius` | `'none' \| 'inner' \| 'content' \| 'element' \| 'container' \| 'rounded'` | `'container'` | Border radius using design tokens |
| `index` | `number` | `0` | Index for staggered animation timing |
| `data-testid` | `string` | — | Test ID for testing |

## Radius Options

| Value | Use Case |
|-------|----------|
| `none` | Sharp corners (images, rectangles) |
| `inner` | Inner elements |
| `content` | Content areas |
| `element` | Standard elements |
| `container` | Container-level rounding (default) |
| `rounded` | Fully rounded (avatars, pills, circles) |

## Animation Timing

The skeleton uses three timing constants:

- **DELAY_TIME** (1000ms): Initial delay before animation starts
- **FADE_TIME** (1000ms): Duration of one opacity cycle
- **STAGGER_TIME** (100ms): Delay increment between sequential elements

For element at index `n`, animation starts at: `DELAY_TIME + (STAGGER_TIME × n)`

## Files

| File | Role | Purpose |
|------|------|---------|
| `index.ts` | Entry | Exports component and types |
| `XDSSkeleton.tsx` | Core | Component implementation |

## Implementation Notes

- Uses `steps(10, end)` timing function for a subtle shimmer effect
- Animation alternates between 0.25 and 1.0 opacity
- Background color comes from the `glimmer` token, with `glimmerHighContrast` for accessibility
- Numeric dimensions are converted to pixels; strings are passed through as-is
