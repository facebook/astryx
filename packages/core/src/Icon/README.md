# /packages/core/src/Icon

A wrapper component for rendering Hero Icons with XDS design system colors and sizes.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Hero Icons Integration**: Renders any Hero Icon (outline or solid) as a component
- **Theme Colors**: Color variants mapped to XDS icon color tokens
- **Consistent Sizing**: Four size options aligned with common UI patterns
- **Tree-shakeable**: Icons are imported individually, keeping bundle size minimal
- **Accessible**: Icons are hidden from screen readers by default (aria-hidden)

## Usage

```tsx
import { XDSIcon } from '@xds/core/Icon';
import { HomeIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';

// Basic usage
<XDSIcon icon={HomeIcon} />

// With color variant
<XDSIcon icon={HomeIcon} color="accent" />

// With size
<XDSIcon icon={HomeIcon} size="lg" />

// Solid icon with color
<XDSIcon icon={HeartIcon} color="negative" />

// Accessible icon with label
<XDSIcon icon={HomeIcon} aria-hidden={false} aria-label="Home" role="img" />
```

## Props

| Prop    | Type                                                                                                                     | Default     | Description                   |
| ------- | ------------------------------------------------------------------------------------------------------------------------ | ----------- | ----------------------------- |
| `icon`  | `ComponentType<SVGProps>`                                                                                                | (required)  | Hero Icon component to render |
| `color` | `'primary' \| 'secondary' \| 'tertiary' \| 'disabled' \| 'accent' \| 'positive' \| 'negative' \| 'warning' \| 'inherit'` | `'primary'` | Color variant                 |
| `size`  | `'xsm' \| 'sm' \| 'md' \| 'lg'`                                                                                          | `'md'`      | Icon size                     |

Additional SVG props (like `aria-label`, `role`, `className`) are passed through to the underlying SVG element.

## Color Variants

| Value       | Token                    | Use Case                        |
| ----------- | ------------------------ | ------------------------------- |
| `primary`   | `--color-icon-primary`   | Default icon color              |
| `secondary` | `--color-icon-secondary` | De-emphasized icons             |
| `tertiary`  | `--color-icon-tertiary`  | Subtle, background icons        |
| `disabled`  | `--color-icon-disabled`  | Disabled state                  |
| `accent`    | `--color-accent`         | Interactive, actionable icons   |
| `positive`  | `--color-positive`       | Success, confirmation           |
| `negative`  | `--color-negative`       | Error, destructive actions      |
| `warning`   | `--color-warning`        | Caution, attention              |
| `inherit`   | `currentColor`           | Inherits from parent text color |

## Size Variants

| Value | Dimensions | Use Case                     |
| ----- | ---------- | ---------------------------- |
| `xsm` | 12x12px    | Dense UI, badges, indicators |
| `sm`  | 16x16px    | Inline with text, compact UI |
| `md`  | 20x20px    | Default, buttons, inputs     |
| `lg`  | 24x24px    | Emphasis, standalone icons   |

## Icon Sources

Import icons from Hero Icons:

```tsx
// Outline style (24x24, 1.5px stroke)
import {HomeIcon} from '@heroicons/react/24/outline';

// Solid style (24x24, filled)
import {HomeIcon} from '@heroicons/react/24/solid';
```

Browse available icons at [heroicons.com](https://heroicons.com).

## Files

| File               | Role  | Purpose                     |
| ------------------ | ----- | --------------------------- |
| `index.ts`         | Entry | Exports component and types |
| `XDSIcon.tsx`      | Core  | Component implementation    |
| `XDSIcon.test.tsx` | Test  | Unit tests                  |

## Implementation Notes

- Uses `aria-hidden="true"` by default since icons are typically decorative
- For meaningful icons, set `aria-hidden={false}`, `role="img"`, and `aria-label`
- `flexShrink: 0` prevents icons from shrinking in flex containers
- Colors are applied via the CSS `color` property, which Hero Icons inherit for stroke/fill
