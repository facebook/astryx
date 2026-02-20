# XDSBanner

Persistent status notification for info, warning, error, or success messages.

## Usage

```tsx
import {XDSBanner} from '@xds/core/Banner';

<XDSBanner status="info" title="New update available" />

<XDSBanner
  status="error"
  title="Something went wrong"
  description="Please try again later."
  isDismissable
  onDismiss={() => setVisible(false)}
/>
```

## Props

| Prop            | Type                                          | Default  | Description                                       |
| --------------- | --------------------------------------------- | -------- | ------------------------------------------------- |
| `status`        | `'info' \| 'warning' \| 'error' \| 'success'` | —        | Status type controlling icon and color (required) |
| `title`         | `ReactNode`                                   | —        | Title text or ReactNode (required)                |
| `description`   | `ReactNode`                                   | —        | Description text below the title                  |
| `icon`          | `ReactNode`                                   | —        | Override the default status icon                  |
| `isDismissable` | `boolean`                                     | `false`  | Whether the banner can be dismissed               |
| `onDismiss`     | `() => void`                                  | —        | Called when dismissed                             |
| `endButton`     | `ReactNode`                                   | —        | Action button on the end                          |
| `variant`       | `'card' \| 'section'`                         | `'card'` | Visual variant                                    |
| `children`      | `ReactNode`                                   | —        | Extra content below description                   |
| `xstyle`        | `StyleXStyles`                                | —        | StyleX overrides                                  |
| `data-testid`   | `string`                                      | —        | Test ID                                           |

## Status Colors

| Status    | Color Token        | Role     |
| --------- | ------------------ | -------- |
| `info`    | `--color-accent`   | `status` |
| `warning` | `--color-warning`  | `alert`  |
| `error`   | `--color-negative` | `alert`  |
| `success` | `--color-positive` | `status` |

## Variants

- **Card** (default): Has border-radius, subtle background, left border accent
- **Section**: No border-radius, full-width, subtle background

## Default Icons

Each status has a default icon from `@heroicons/react/24/solid`:

- `info` → `InformationCircleIcon`
- `warning` → `ExclamationTriangleIcon`
- `error` → `XCircleIcon`
- `success` → `CheckCircleIcon`

## Accessibility

- Uses `role="alert"` for error/warning statuses
- Uses `role="status"` for info/success statuses
- Dismiss button has `aria-label="Dismiss"`
- Status icon is `aria-hidden="true"` (status conveyed by role)

## File Manifest

| File                 | Purpose                  |
| -------------------- | ------------------------ |
| `XDSBanner.tsx`      | Component implementation |
| `XDSBanner.test.tsx` | Unit tests               |
| `index.ts`           | Public exports           |
| `README.md`          | Documentation            |
