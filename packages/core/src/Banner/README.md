# Banner

A banner component for displaying contextual messages with status indicators. Supports info, warning, error, and success statuses with appropriate colors, default icons, and optional dismiss functionality.

## Exports

| Export             | Type      | Description                          |
| ------------------ | --------- | ------------------------------------ |
| `XDSBanner`        | Component | Main banner component                |
| `XDSBannerProps`   | Type      | Props interface                      |
| `XDSBannerStatus`  | Type      | Status union: info, warning, error, success |
| `XDSBannerVariant` | Type      | Variant union: card, section         |

## Props

| Prop            | Type                                           | Default  | Description                                      |
| --------------- | ---------------------------------------------- | -------- | ------------------------------------------------ |
| `status`        | `'info' \| 'warning' \| 'error' \| 'success'` | —        | Status type controlling color and default icon   |
| `title`         | `ReactNode`                                    | —        | Title text of the banner                         |
| `description`   | `ReactNode`                                    | —        | Optional description below the title             |
| `icon`          | `ReactNode`                                    | —        | Custom icon (overrides default status icon)      |
| `isDismissable` | `boolean`                                      | `false`  | Whether the banner can be dismissed              |
| `onDismiss`     | `() => void`                                   | —        | Callback fired on dismiss                        |
| `endButton`     | `ReactNode`                                    | —        | Action button at the end of the banner           |
| `variant`       | `'card' \| 'section'`                          | `'card'` | Visual variant                                   |
| `children`      | `ReactNode`                                    | —        | Additional content below title and description   |
| `xstyle`        | `StyleXStyles`                                 | —        | Additional StyleX styles                         |
| `data-testid`   | `string`                                       | —        | Test ID for testing frameworks                   |

## Usage

```tsx
import {XDSBanner} from '@xds/core/Banner';

// Basic info banner
<XDSBanner status="info" title="Update available" />

// With description
<XDSBanner
  status="error"
  title="Upload failed"
  description="Please try again later."
/>

// Dismissable
<XDSBanner
  status="warning"
  title="Low disk space"
  isDismissable
  onDismiss={() => console.log('dismissed')}
/>

// Section variant (full-width, no border radius)
<XDSBanner status="success" title="Saved!" variant="section" />
```

## Variants

- **card** (default): Rounded corners with a colored left border accent
- **section**: Full-width with no border radius, suitable for page-level banners

## Accessibility

- Uses `role="alert"` for `error` and `warning` statuses
- Uses `role="status"` for `info` and `success` statuses
- Dismiss button uses `XDSCloseButton` with accessible label

## Files

| File                 | Purpose                  |
| -------------------- | ------------------------ |
| `XDSBanner.tsx`      | Component implementation |
| `XDSBanner.test.tsx` | Unit tests               |
| `index.ts`           | Barrel exports           |
