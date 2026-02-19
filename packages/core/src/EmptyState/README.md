# EmptyState

An empty state placeholder for content areas with no data. Displays an icon or illustration, title, optional description, and action buttons.

## Exports

| Export               | Type      | Description                |
| -------------------- | --------- | -------------------------- |
| `XDSEmptyState`      | Component | Main empty state component |
| `XDSEmptyStateProps` | Type      | Props interface            |

## Props

| Prop          | Type           | Default | Description                                                   |
| ------------- | -------------- | ------- | ------------------------------------------------------------- |
| `title`       | `string`       | —       | Primary message (required)                                    |
| `description` | `string`       | —       | Optional secondary text                                       |
| `icon`        | `ReactNode`    | —       | Optional icon/illustration (rendered decorative, aria-hidden) |
| `actions`     | `ReactNode`    | —       | Optional action buttons (horizontal, stacked when compact)    |
| `isCompact`   | `boolean`      | `false` | Compact variant with reduced spacing                          |
| `xstyle`      | `StyleXStyles` | —       | StyleX override styles for the container                      |
| `data-testid` | `string`       | —       | Test ID for the container element                             |

## Usage

```tsx
import {XDSEmptyState} from '@xds/core/EmptyState';

// Minimal
<XDSEmptyState title="No results found" />

// With description
<XDSEmptyState
  title="No results found"
  description="Try adjusting your search or filters."
/>

// Full example
<XDSEmptyState
  icon={<XDSIcon icon={InboxIcon} size="lg" />}
  title="No messages"
  description="You're all caught up!"
  actions={<XDSButton label="Compose" variant="primary" />}
/>

// Compact variant
<XDSEmptyState
  title="No items"
  description="Nothing to show here."
  isCompact
/>
```

## Accessibility

- Container uses `role="status"` to announce content to screen readers
- Icon wrapper has `aria-hidden="true"` (decorative)
- Title renders as an `<h3>` heading element

## Files

| File                     | Purpose                  |
| ------------------------ | ------------------------ |
| `XDSEmptyState.tsx`      | Component implementation |
| `XDSEmptyState.test.tsx` | Unit tests               |
| `index.ts`               | Barrel exports           |
