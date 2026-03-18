# XDS Design Tokens

All design tokens are defined in `packages/core/src/theme/tokens.stylex.ts`.

## Spacing Tokens

| Token         | Value | Usage            |
| ------------- | ----- | ---------------- |
| --spacing-0   | 0px   | No spacing       |
| --spacing-0-5 | 2px   | Hairline spacing |
| --spacing-1   | 4px   | Tight spacing    |
| --spacing-2   | 8px   | Compact spacing  |
| --spacing-3   | 12px  | Default small    |
| --spacing-4   | 16px  | Default medium   |
| --spacing-5   | 20px  | Comfortable      |
| --spacing-6   | 24px  | Loose            |
| --spacing-7   | 28px  | Semi-loose       |
| --spacing-8   | 32px  | Extra loose      |
| --spacing-9   | 36px  | Spacious         |
| --spacing-10  | 40px  | Extra spacious   |
| --spacing-11  | 44px  | Ultra spacious   |
| --spacing-12  | 48px  | Maximum spacing  |

Component gap props use `space0`-`space12` which map to these tokens.

## Size Tokens

Control heights for consistent sizing across buttons, inputs, and selectors.

| Token     | Value | Usage                           |
| --------- | ----- | ------------------------------- |
| --size-sm | 28px  | Compact controls                |
| --size-md | 32px  | Default control size            |
| --size-lg | 36px  | Larger, more prominent controls |

## Color Tokens

### Semantic Colors

| Token            | Usage                |
| ---------------- | -------------------- |
| --color-accent   | Primary action color |
| --color-surface  | Background surface   |
| --color-wash     | Secondary background |
| --color-positive | Success states       |
| --color-negative | Error states         |
| --color-warning  | Warning states       |

### Text Colors

| Token                  | Usage          |
| ---------------------- | -------------- |
| --color-text-primary   | Main text      |
| --color-text-secondary | Secondary text |
| --color-text-disabled  | Disabled text  |
| --color-text-link      | Link text      |

### Icon Colors

| Token                  | Usage           |
| ---------------------- | --------------- |
| --color-icon-primary   | Main icons      |
| --color-icon-secondary | Secondary icons |
| --color-icon-disabled  | Disabled icons  |

## Radius Tokens

Numeric scale based on a 4dp base unit. Tokens 1–4 scale with the theme's `radiusScale` multiplier; tokens 0 and rounded are fixed.

| Token            | Value  | Usage                                 | Scales |
| ---------------- | ------ | ------------------------------------- | ------ |
| --radius-0       | 0px    | No radius (dividers, table cells)     | No     |
| --radius-1       | 4px    | Code blocks, inner content            | Yes    |
| --radius-2       | 8px    | Buttons, inputs, text areas           | Yes    |
| --radius-3       | 12px   | Cards, modals, popovers, dropdowns    | Yes    |
| --radius-4       | 16px   | Page sections, large containers       | Yes    |
| --radius-rounded | 9999px | Badges, avatars, status dots, toggles | No     |

### radiusScale (via defineTheme)

Generate all radius tokens from a base unit and multiplier:

```tsx
import {defineTheme} from '@xds/core/theme';

const roundedTheme = defineTheme({
  name: 'rounded',
  radiusScale: { base: 4, multiplier: 1.5 },
  // Produces: radius-1=6px, radius-2=12px, radius-3=18px, radius-4=24px
  // radius-0 stays 0px, radius-rounded stays 9999px
});

const sharpTheme = defineTheme({
  name: 'sharp',
  radiusScale: { base: 4, multiplier: 0 },
  // All scalable radii become 0px
});
```

| Multiplier | Effect    | radius-3 becomes |
| ---------- | --------- | ---------------- |
| 0          | Sharp     | 0px              |
| 0.5        | Subtle    | 6px              |
| 1 (default)| Default   | 12px             |
| 1.5        | Rounded   | 18px             |
| 2          | Pill-like | 24px             |

## Elevation Tokens

| Token              | Usage            |
| ------------------ | ---------------- |
| --elevation-base   | Subtle shadow    |
| --elevation-thumb  | Slider thumbs    |
| --elevation-menu   | Dropdowns, menus |
| --elevation-dialog | Modals, dialogs  |
| --elevation-hover  | Hover states     |

## Typography Tokens

### Font Families

- `--font-body`: System UI font stack
- `--font-code`: Monospace font stack
- `--font-heading`: System UI font stack

### Text Sizes

| Token       | Value          |
| ----------- | -------------- |
| --text-4xs  | 8px            |
| --text-3xs  | 10px           |
| --text-2xs  | 11px           |
| --text-xsm  | 12px           |
| --text-sm   | 13px           |
| --text-base | 14px (default) |
| --text-lg   | 16px           |
| --text-xl   | 18px           |
| --text-2xl  | 20px           |
| --text-3xl  | 24px           |
| --text-4xl  | 32px           |

### Font Weights

- `--font-weight-normal`: 400
- `--font-weight-medium`: 500
- `--font-weight-semibold`: 600
- `--font-weight-bold`: 700

### Line Heights (Leading)

| Token             | Value  | Usage                        |
| ----------------- | ------ | ---------------------------- |
| --leading-tight   | 1.25   | Display text, headings       |
| --leading-snug    | 1.375  | Compact body text, headings  |
| --leading-base    | 1.4286 | Body text with --text-base   |
| --leading-normal  | 1.5    | Body text, large body        |
| --leading-relaxed | 1.625  | Editorial body, reading text |

## Usage in StyleX

```tsx
import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars, sizeVars, radiusVars} from '@xds/core';

const styles = stylex.create({
  card: {
    padding: spacingVars['--spacing-4'],
    backgroundColor: colorVars['--color-surface'],
    borderRadius: radiusVars['--radius-3'],
  },
  button: {
    height: sizeVars['--size-md'],
  },
});
```

Or use CSS custom properties directly:

```tsx
const styles = stylex.create({
  card: {
    padding: 'var(--spacing-4)',
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-3)',
  },
});
```
