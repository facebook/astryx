# Badge

A badge component for displaying status indicators, counts, or labels.

## Exports

| Export            | Type      | Description          |
| ----------------- | --------- | -------------------- |
| `XDSBadge`        | Component | Main badge component |
| `XDSBadgeProps`   | Type      | Props interface      |
| `XDSBadgeVariant` | Type      | Variant union type   |

## Props

| Prop       | Type                                                       | Default     | Description                           |
| ---------- | ---------------------------------------------------------- | ----------- | ------------------------------------- |
| `variant`  | `'neutral' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'neutral'` | Visual style variant                  |
| `children` | `ReactNode`                                                | -           | Badge content. Omit for dot indicator |
| `icon`     | `ReactNode`                                                | -           | Optional leading icon                 |

## Usage

```tsx
import {XDSBadge} from '@xds/core/Badge';

// Text badge
<XDSBadge>Default</XDSBadge>

// Status variants
<XDSBadge variant="success">Active</XDSBadge>
<XDSBadge variant="error">Failed</XDSBadge>
<XDSBadge variant="warning">Pending</XDSBadge>

// Count badge
<XDSBadge variant="info">42</XDSBadge>

// Dot indicator (no children)
<XDSBadge variant="success" />
```

## Files

| File                | Purpose                  |
| ------------------- | ------------------------ |
| `XDSBadge.tsx`      | Component implementation |
| `XDSBadge.test.tsx` | Unit tests               |
| `index.ts`          | Barrel exports           |
