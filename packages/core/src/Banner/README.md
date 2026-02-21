# XDSBanner

Persistent status notification for info, warning, error, or success messages.

## Visual Structure

The banner has a two-part layout:

1. **Header area** — colored status background with icon, title, description, action buttons, and dismiss
2. **Content area** (optional) — card background below the header for additional rich content

When no `children` are provided, only the colored header renders.

## Usage

```tsx
import {XDSBanner} from '@xds/core/Banner';

// Simple — just the colored header
<XDSBanner status="info" title="New update available" />

// With description and self-dismissing behavior
<XDSBanner
  status="error"
  title="Something went wrong"
  description="Please try again later."
  isDismissable
  onDismiss={() => logDismiss()}
/>

// With content area (card background below header)
<XDSBanner
  status="error"
  title="Multiple errors found"
  description="The following issues need to be resolved:"
>
  <ul>
    <li>Email address is invalid</li>
    <li>Password must be at least 8 characters</li>
  </ul>
</XDSBanner>
```

## Props

| Prop            | Type                                          | Default  | Description                                           |
| --------------- | --------------------------------------------- | -------- | ----------------------------------------------------- |
| `status`        | `'info' \| 'warning' \| 'error' \| 'success'` | —        | Status type controlling icon and color (required)     |
| `title`         | `ReactNode`                                   | —        | Title text or ReactNode (required)                    |
| `description`   | `ReactNode`                                   | —        | Description text below the title                      |
| `icon`          | `ReactNode`                                   | —        | Override the default status icon                      |
| `isDismissable` | `boolean`                                     | `false`  | Whether the banner can be dismissed                   |
| `onDismiss`     | `() => void`                                  | —        | Called on dismiss (banner hides itself regardless)    |
| `endButton`     | `ReactNode`                                   | —        | Action button in the header area (end-aligned)        |
| `variant`       | `'card' \| 'section'`                         | `'card'` | Visual variant                                        |
| `children`      | `ReactNode`                                   | —        | Content rendered in card-background area below header |
| `xstyle`        | `StyleXStyles`                                | —        | StyleX overrides                                      |
| `data-testid`   | `string`                                      | —        | Test ID                                               |

## Dismiss Behavior

When `isDismissable` is true, the banner manages its own dismissed state internally.
Clicking the dismiss button hides the banner immediately, even if `onDismiss` is not provided.
This ensures product teams get working dismiss behavior out of the box without needing
to wire up state management. The `onDismiss` callback is optional and fires alongside
the internal state change for logging or backend sync.

## Status Colors

| Status    | Background Token                | Role     |
| --------- | ------------------------------- | -------- |
| `info`    | `--color-accent-deemphasized`   | `status` |
| `warning` | `--color-warning-deemphasized`  | `alert`  |
| `error`   | `--color-negative-deemphasized` | `alert`  |
| `success` | `--color-positive-deemphasized` | `status` |

## Variants

- **Card** (default): Has border-radius, colored header with optional card content area below
- **Section**: No border-radius, full-width for page-level banners

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

## Future

- **Collapsible**: Banner will support collapsing the content area via `useXDSCollapsible` (#187)

## File Manifest

| File                 | Purpose                  |
| -------------------- | ------------------------ |
| `XDSBanner.tsx`      | Component implementation |
| `XDSBanner.test.tsx` | Unit tests               |
| `index.ts`           | Public exports           |
| `README.md`          | Documentation            |
