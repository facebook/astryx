# /packages/core/src/Button

Button component with multiple variants and loading state support.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Variants**: `primary`, `secondary`, `ghost`, `destructive`
- **Loading state**: Shows spinner, disables interaction
- **Focus visible**: Accessible focus outline with variant-specific colors
- **Hover/active states**: Uses overlay colors via `backgroundImage` for consistent layering

## Usage

```tsx
import { Button } from '@xds/core/Button';

// Basic usage
<Button variant="primary">Click me</Button>

// With loading state
<Button variant="primary" loading>Saving...</Button>

// Destructive action
<Button variant="destructive">Delete</Button>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'destructive'` | `'primary'` | Visual style variant |
| `loading` | `boolean` | `false` | Shows loading spinner |
| `disabled` | `boolean` | `false` | Disables the button |
| `children` | `ReactNode` | — | Button content |

## Files

| File | Role | Purpose |
|------|------|---------|
| `index.ts` | Entry | Exports Button component and types |
| `Button.tsx` | Core | Button component implementation |
| `Button.test.tsx` | Test | Unit tests for Button component |

## Implementation Notes

- `ButtonVariant` type is derived from the `variants` StyleX object using `keyof typeof variants`
- Hover/active states use `backgroundImage` with `linear-gradient` to layer overlay colors on top of the base background
- Destructive variant uses `colorTokens.negative` for its focus outline color
