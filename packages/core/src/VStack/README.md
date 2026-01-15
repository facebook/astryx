# /packages/core/src/VStack

Vertical stack component for arranging items top-to-bottom with consistent spacing.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Vertical layout**: Items stack top-to-bottom
- **Flexible gap**: Any pixel value for spacing
- **Horizontal alignment**: Control cross-axis alignment with `hAlign`
- **Wrapping support**: Optional flex wrapping

## Usage

```tsx
import { XDSVStack } from '@xds/core/VStack';

// Basic vertical stack
<XDSVStack gap={8}>
  <Item />
  <Item />
</XDSVStack>

// Centered items
<XDSVStack gap={16} hAlign="center">
  <Item />
  <Item />
</XDSVStack>

// With wrapping
<XDSVStack gap={8} wrap="wrap">
  <Item />
  <Item />
  <Item />
</XDSVStack>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gap` | `number` | `0` | Spacing between items (px) |
| `hAlign` | `'start' \| 'center' \| 'end' \| 'stretch'` | `'stretch'` | Horizontal alignment |
| `wrap` | `'nowrap' \| 'wrap' \| 'wrap-reverse'` | `'nowrap'` | Flex wrap behavior |
| `children` | `ReactNode` | — | Stack content |

## Files

| File | Role | Purpose |
|------|------|---------|
| `index.ts` | Entry | Exports XDSVStack component and types |
| `XDSVStack.tsx` | Core | XDSVStack component implementation |
| `XDSVStack.test.tsx` | Test | Unit tests for XDSVStack |

## Implementation Notes

- Uses `stack()` utility from `../Layout` with `direction: 'vertical'`
- `hAlign` maps to `crossAlign` in the stack utility
- No variant system - pure layout utility component
