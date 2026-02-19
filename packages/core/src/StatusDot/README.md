# StatusDot

A small colored dot indicator for status display (online/offline, severity, etc).

## Exports

| Export                | Type      | Description              |
| --------------------- | --------- | ------------------------ |
| `XDSStatusDot`        | Component | Main status dot component |
| `XDSStatusDotProps`   | Type      | Props interface          |
| `XDSStatusDotVariant` | Type      | Variant union type       |
| `XDSStatusDotSize`    | Type      | Size union type          |

## Props

| Prop          | Type                                                              | Default  | Description                                      |
| ------------- | ----------------------------------------------------------------- | -------- | ------------------------------------------------ |
| `variant`     | `'positive' \| 'warning' \| 'negative' \| 'info' \| 'neutral'`   | -        | Semantic color variant (required)                |
| `size`        | `'sm' \| 'md'`                                                    | `'md'`   | Dot size: sm=8px, md=10px                        |
| `label`       | `string`                                                          | -        | Accessible label (required)                      |
| `isPulsing`   | `boolean`                                                         | `false`  | Pulse animation, respects prefers-reduced-motion |
| `xstyle`      | `StyleXStyles`                                                    | -        | Optional StyleX style override                   |
| `data-testid` | `string`                                                          | -        | Optional test ID                                 |

## Usage

```tsx
import {XDSStatusDot} from '@xds/core/StatusDot';

// Basic status indicators
<XDSStatusDot variant="positive" label="Online" />
<XDSStatusDot variant="negative" label="Offline" />
<XDSStatusDot variant="warning" label="Away" />

// Small size
<XDSStatusDot variant="positive" label="Active" size="sm" />

// Pulsing animation
<XDSStatusDot variant="positive" label="Live" isPulsing />
```

## Accessibility

- Renders as `<span role="img" aria-label={label}>` for screen reader support
- Not focusable (decorative indicator)
- `isPulsing` animation respects `prefers-reduced-motion: reduce`

## Files

| File                    | Purpose                  |
| ----------------------- | ------------------------ |
| `XDSStatusDot.tsx`      | Component implementation |
| `XDSStatusDot.test.tsx` | Unit tests               |
| `index.ts`              | Barrel exports           |
