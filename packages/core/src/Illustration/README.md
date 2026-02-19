# Illustration

Theme-compatible SVG illustration components designed to pair with `XDSEmptyState` (and usable anywhere).

## Components

| Component                    | Use case                        | Visual concept                      |
| ---------------------------- | ------------------------------- | ----------------------------------- |
| `XDSIllustrationNoResults`   | Search with no matches          | Magnifying glass with question mark |
| `XDSIllustrationEmptyInbox`  | Empty message/notification list | Open envelope                       |
| `XDSIllustrationEmptyFolder` | No files/projects/items         | Open folder                         |
| `XDSIllustrationError`       | Something went wrong            | Warning triangle with exclamation   |
| `XDSIllustrationSuccess`     | All done / completed state      | Checkmark in circle with sparkles   |

## Props

| Prop          | Type                   | Default | Description                            |
| ------------- | ---------------------- | ------- | -------------------------------------- |
| `size`        | `'sm' \| 'md' \| 'lg'` | `'md'`  | Size: sm (48px), md (80px), lg (120px) |
| `xstyle`      | `StyleXStyles`         | —       | StyleX overrides                       |
| `data-testid` | `string`               | —       | Test ID                                |

## Usage

```tsx
import {XDSIllustrationNoResults} from '@xds/core/Illustration';

// Standalone
<XDSIllustrationNoResults size="lg" />

// With XDSEmptyState
<XDSEmptyState
  icon={<XDSIllustrationNoResults />}
  title="No results found"
  description="Try adjusting your search or filters."
/>
```

## Design

- **SVG-based** — inline SVGs, not image files
- **Theme-compatible** — uses XDS color tokens (`--color-text-secondary`, `--color-accent`, etc.)
- **Light/dark adaptive** — colors automatically adapt via `light-dark()` tokens
- **Simple line-art style** — clean strokes, minimal fills, works at small sizes
- **Decorative** — all illustrations are `aria-hidden="true"`; the parent provides semantic meaning
- **`forwardRef`** — refs forward to the `<svg>` element

## Color Usage

| Token                    | Purpose                       |
| ------------------------ | ----------------------------- |
| `--color-text-secondary` | Primary strokes (outlines)    |
| `--color-deemphasized`   | Subtle background fills       |
| `--color-accent`         | Accent elements (brand color) |
| `--color-positive`       | Success illustration elements |
| `--color-negative`       | Error illustration elements   |

## File Manifest

| File                             | Purpose                                                       |
| -------------------------------- | ------------------------------------------------------------- |
| `types.ts`                       | Shared `XDSIllustrationProps` and `XDSIllustrationSize` types |
| `XDSIllustrationNoResults.tsx`   | Magnifying glass + question mark                              |
| `XDSIllustrationEmptyInbox.tsx`  | Open envelope                                                 |
| `XDSIllustrationEmptyFolder.tsx` | Open folder                                                   |
| `XDSIllustrationError.tsx`       | Warning triangle                                              |
| `XDSIllustrationSuccess.tsx`     | Checkmark circle with sparkles                                |
| `XDSIllustration.test.tsx`       | Tests for all illustration components                         |
| `index.ts`                       | Barrel export                                                 |
| `README.md`                      | This file                                                     |
