# /packages/core/src/Spinner

A pure spinner component for indicating loading state. No layout, no text — just the spinning indicator.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **CSS Border Animation**: Lightweight border-based spinner with smooth 360° rotation
- **Size Variants**: Three sizes (sm, md, lg) matching existing inline spinners
- **Shade Support**: Default shade for light backgrounds, onMedia for dark/accent backgrounds
- **Accessible**: `role="status"` and `aria-label="Loading"` by default

## Usage

```tsx
import { XDSSpinner } from '@xds/core/Spinner';

// Default spinner
<XDSSpinner />

// Small spinner
<XDSSpinner size="sm" />

// Large spinner on a dark background
<XDSSpinner size="lg" shade="onMedia" />
```

### Composing with layout

XDSSpinner is intentionally minimal. Compose with layout and text components for loading states:

```tsx
import {XDSSpinner} from '@xds/core/Spinner';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

<XDSVStack gap="space2" align="center">
  <XDSSpinner size="lg" />
  <XDSText color="secondary">Loading...</XDSText>
</XDSVStack>;
```

## Props

| Prop          | Type                     | Default     | Description                               |
| ------------- | ------------------------ | ----------- | ----------------------------------------- |
| `size`        | `'sm' \| 'md' \| 'lg'`   | `'md'`      | Spinner size (12px, 20px, 28px)           |
| `shade`       | `'default' \| 'onMedia'` | `'default'` | Color shade for light or dark backgrounds |
| `data-testid` | `string`                 | —           | Test ID for testing                       |

## Size Reference

| Size | Dimensions | Border Width | Use Case                      |
| ---- | ---------- | ------------ | ----------------------------- |
| `sm` | 12×12px    | 2px          | Inline with text, buttons     |
| `md` | 20×20px    | 2px          | Default, standalone indicator |
| `lg` | 28×28px    | 3px          | Full-page or section loading  |

## Files

| File                  | Role  | Purpose                     |
| --------------------- | ----- | --------------------------- |
| `index.ts`            | Entry | Exports component and types |
| `XDSSpinner.tsx`      | Core  | Component implementation    |
| `XDSSpinner.test.tsx` | Test  | Unit tests                  |

## Implementation Notes

- Uses CSS `border` technique: three visible borders + one transparent for the gap
- Animation: `rotate(360deg)` at 0.6s linear infinite
- Color inherits from `currentColor`, controlled by shade styles using theme tokens
- Element is a `<span>` with `display: inline-block` for inline composability
