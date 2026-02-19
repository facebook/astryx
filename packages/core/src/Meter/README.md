# Meter

A determinate progress/meter indicator bar for displaying known values within a range.

## Exports

| Export            | Type      | Description          |
| ----------------- | --------- | -------------------- |
| `XDSMeter`        | Component | Main meter component |
| `XDSMeterProps`   | Type      | Props interface      |
| `XDSMeterVariant` | Type      | Variant union type   |
| `XDSMeterSize`    | Type      | Size union type      |

## Props

| Prop               | Type                                                | Default    | Description                                  |
| ------------------ | --------------------------------------------------- | ---------- | -------------------------------------------- |
| `value`            | `number`                                            | —          | Current value of the meter                   |
| `max`              | `number`                                            | `100`      | Maximum value                                |
| `label`            | `string`                                            | —          | Accessible label (required)                  |
| `isLabelHidden`    | `boolean`                                           | `false`    | Visually hide the label (remains accessible) |
| `hasValueLabel`    | `boolean`                                           | `false`    | Show formatted value text next to the label  |
| `formatValueLabel` | `(value: number, max: number) => string`            | percentage | Custom value label formatter                 |
| `variant`          | `'accent' \| 'positive' \| 'warning' \| 'negative'` | `'accent'` | Semantic color variant                       |
| `size`             | `'sm' \| 'md' \| 'lg'`                              | `'md'`     | Track height: sm=4px, md=8px, lg=12px        |
| `xstyle`           | `StyleXStyles`                                      | —          | StyleX overrides for outer container         |
| `data-testid`      | `string`                                            | —          | Test ID                                      |

## Usage

```tsx
import {XDSMeter} from '@xds/core/Meter';

// Basic meter
<XDSMeter value={75} label="Upload progress" />

// With visible value label
<XDSMeter value={75} label="Storage used" hasValueLabel />

// Custom format
<XDSMeter
  value={3.2}
  max={5}
  label="Disk usage"
  hasValueLabel
  formatValueLabel={(value, max) => `${value} GB / ${max} GB`}
/>

// Variant and size
<XDSMeter value={92} label="Disk" variant="negative" size="sm" />

// Hidden label (accessible but not visible)
<XDSMeter value={50} label="Loading" isLabelHidden />
```

## Accessibility

- Uses `role="meter"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Label is always connected via `aria-labelledby`
- `aria-valuetext` provides human-readable value description

## Files

| File                | Purpose                  |
| ------------------- | ------------------------ |
| `XDSMeter.tsx`      | Component implementation |
| `XDSMeter.test.tsx` | Unit tests               |
| `index.ts`          | Barrel exports           |
