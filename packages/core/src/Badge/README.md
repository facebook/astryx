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
| `variant`  | `'neutral' \| 'info' \| 'success' \| 'warning' \| 'error' \| 'blue' \| 'cyan' \| 'gray' \| 'green' \| 'orange' \| 'pink' \| 'purple' \| 'red' \| 'teal' \| 'yellow'` | `'neutral'` | Visual style variant                  |
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

// Non-semantic color variants (for tags, categories, labels)
<XDSBadge variant="blue">Frontend</XDSBadge>
<XDSBadge variant="purple">Design</XDSBadge>
<XDSBadge variant="teal">Infrastructure</XDSBadge>

// Dot indicator (no children)
<XDSBadge variant="success" />
```

### Variant categories

**Semantic variants** use solid backgrounds with on-media text for status meaning:
`neutral` · `info` · `success` · `warning` · `error`

**Non-semantic color variants** use tinted backgrounds with colored text for categorization:
`blue` · `cyan` · `gray` · `green` · `orange` · `pink` · `purple` · `red` · `teal` · `yellow`

## Theming

Themes can override `Badge` styles via `ComponentStyles`:

```tsx
// In your theme definition
const theme: Theme = {
  // ...tokens...
  components: {
    badge: {
      root: myStyles,
      variants: myStyles,
    },
  },
};
```

### Available surfaces

| Surface    | Description                                                            |
| ---------- | ---------------------------------------------------------------------- |
| `root`     | Root badge styles                                                      |
| `variants` | Per-variant overrides (Partial<Record<XDSBadgeVariant, StyleXStyles>>) |

## Files

| File                | Purpose                  |
| ------------------- | ------------------------ |
| `XDSBadge.tsx`      | Component implementation |
| `XDSBadge.test.tsx` | Unit tests               |
| `index.ts`          | Barrel exports           |
