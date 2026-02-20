# ProgressBar

A progress bar for displaying determinate or indeterminate progress.

## Exports

| Export                  | Type      | Description                 |
| ----------------------- | --------- | --------------------------- |
| `XDSProgressBar`        | Component | Main progress bar component |
| `XDSProgressBarProps`   | Type      | Props interface             |
| `XDSProgressBarVariant` | Type      | Variant union type          |
| `XDSProgressBarSize`    | Type      | Size union type             |

## Props

| Prop               | Type                                                | Default    | Description                                            |
| ------------------ | --------------------------------------------------- | ---------- | ------------------------------------------------------ |
| `value`            | `number`                                            | `0`        | Current value (ignored when indeterminate)             |
| `max`              | `number`                                            | `100`      | Maximum value                                          |
| `label`            | `string`                                            | —          | Accessible label (required)                            |
| `isLabelHidden`    | `boolean`                                           | `false`    | Visually hide the label (remains accessible)           |
| `hasValueLabel`    | `boolean`                                           | `false`    | Show formatted value text (ignored when indeterminate) |
| `formatValueLabel` | `(value: number, max: number) => string`            | percentage | Custom value label formatter                           |
| `variant`          | `'accent' \| 'positive' \| 'warning' \| 'negative'` | `'accent'` | Semantic color variant                                 |
| `size`             | `'sm' \| 'md' \| 'lg'`                              | `'md'`     | Track height: sm=4px, md=8px, lg=12px                  |
| `isIndeterminate`  | `boolean`                                           | `false`    | Animated loading indicator for unknown progress        |
| `xstyle`           | `StyleXStyles`                                      | —          | StyleX overrides for outer container                   |
| `data-testid`      | `string`                                            | —          | Test ID                                                |

## Usage

```tsx
import {XDSProgressBar} from '@xds/core/ProgressBar';

// Determinate progress bar
<XDSProgressBar value={75} label="Upload progress" />

// With visible value label
<XDSProgressBar value={75} label="Storage used" hasValueLabel />

// Custom format
<XDSProgressBar
  value={3.2}
  max={5}
  label="Disk usage"
  hasValueLabel
  formatValueLabel={(value, max) => `${value} GB / ${max} GB`}
/>

// Indeterminate loading
<XDSProgressBar isIndeterminate label="Loading..." />

// Variant and size
<XDSProgressBar value={92} label="Disk" variant="negative" size="sm" />

// Hidden label (accessible but not visible)
<XDSProgressBar value={50} label="Loading" isLabelHidden />
```

## Accessibility

- Determinate: uses `role="meter"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Indeterminate: uses `role="progressbar"` without value attributes
- Label is always connected via `aria-labelledby`
- `aria-valuetext` provides human-readable value description (determinate only)
- Indeterminate animation respects `prefers-reduced-motion`

## Files

| File                      | Purpose                  |
| ------------------------- | ------------------------ |
| `XDSProgressBar.tsx`      | Component implementation |
| `XDSProgressBar.test.tsx` | Unit tests               |
| `index.ts`                | Barrel exports           |
