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

| Token           | Usage                |
| --------------- | -------------------- |
| --color-accent  | Primary action color |
| --color-surface | Background surface   |
| --color-wash    | Secondary background |
| --color-success | Success states       |
| --color-error   | Error states         |
| --color-warning | Warning states       |

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

Numeric scale based on a 4dp base unit. Tokens 1–4 scale with the theme's `radius` multiplier; tokens 0 and rounded are fixed.

| Token            | Value  | Usage                                 | Scales |
| ---------------- | ------ | ------------------------------------- | ------ |
| --radius-0       | 0px    | No radius (dividers, table cells)     | No     |
| --radius-1       | 4px    | Code blocks, inner content            | Yes    |
| --radius-2       | 8px    | Buttons, inputs, text areas           | Yes    |
| --radius-3       | 12px   | Cards, modals, popovers, dropdowns    | Yes    |
| --radius-4       | 16px   | Page sections, large containers       | Yes    |
| --radius-rounded | 9999px | Badges, avatars, status dots, toggles | No     |

### radius (via defineTheme)

Generate all radius tokens from a base unit and multiplier:

```tsx
import {defineTheme} from '@xds/core/theme';

const roundedTheme = defineTheme({
  name: 'rounded',
  radius: {base: 4, multiplier: 1.5},
  // Produces: radius-1=6px, radius-2=12px, radius-3=18px, radius-4=24px
  // radius-0 stays 0px, radius-rounded stays 9999px
});

const sharpTheme = defineTheme({
  name: 'sharp',
  radius: {base: 4, multiplier: 0},
  // All scalable radii become 0px
});
```

| Multiplier  | Effect    | radius-3 becomes |
| ----------- | --------- | ---------------- |
| 0           | Sharp     | 0px              |
| 0.5         | Subtle    | 6px              |
| 1 (default) | Default   | 12px             |
| 1.5         | Rounded   | 18px             |
| 2           | Pill-like | 24px             |

## Shadow Tokens

| Token                          | Usage                     |
| ------------------------------ | ------------------------- |
| --shadow-base                  | Subtle lift (cards)       |
| --shadow-menu                  | Floating elements (menus) |
| --shadow-hover                 | Hover lift, toasts        |
| --shadow-dialog                | Dialogs, modals           |
| --inset-shadow-border-hover    | Input hover ring          |
| --inset-shadow-border-accent   | Input focused/active ring |
| --inset-shadow-border-positive | Input success ring        |
| --inset-shadow-border-warning  | Input warning ring        |
| --inset-shadow-border-negative | Input error ring          |

## Typography Tokens

### Font Families

- `--font-body`: System UI font stack
- `--font-code`: Monospace font stack
- `--font-heading`: System UI font stack

### Text Sizes

Computed from a geometric scale: `round(base × ratio^step)`.
Default: base=14px, ratio=1.2.

| Token       | Step | Default | Usage           |
| ----------- | ---- | ------- | --------------- |
| --text-4xs  | -5   | 6px     | Citation, micro |
| --text-3xs  | -4   | 7px     | Micro labels    |
| --text-2xs  | -3   | 8px     | Small micro     |
| --text-xsm  | -2   | 10px    | Extra small     |
| --text-sm   | -1   | 12px    | Small text      |
| --text-base | 0    | 14px    | Body (anchor)   |
| --text-lg   | +1   | 17px    | Large text      |
| --text-xl   | +2   | 20px    | Extra large     |
| --text-2xl  | +3   | 24px    | 2× large        |
| --text-3xl  | +4   | 29px    | 3× large        |
| --text-4xl  | +5   | 35px    | 4× large        |

### Type Scale (Semantic Tokens)

Semantic tokens map headings and text types to the raw size scale.
Sizes are `var()` references; line heights are 4px-grid-snapped computed values.

Override the entire scale with `typography.scale: { base, ratio }` in `defineTheme()`.

#### Heading Tokens

| Token               | Maps to          | Default | Leading |
| ------------------- | ---------------- | ------- | ------- |
| --heading-1-size    | var(--text-2xl)  | 24px    |         |
| --heading-1-weight  | semibold         |         |         |
| --heading-1-leading |                  |         | 1.3333  |
| --heading-2-size    | var(--text-xl)   | 20px    |         |
| --heading-2-weight  | semibold         |         |         |
| --heading-2-leading |                  |         | 1.4     |
| --heading-3-size    | var(--text-lg)   | 17px    |         |
| --heading-3-weight  | semibold         |         |         |
| --heading-3-leading |                  |         | 1.4118  |
| --heading-4-size    | var(--text-base) | 14px    |         |
| --heading-4-weight  | semibold         |         |         |
| --heading-4-leading |                  |         | 1.4286  |
| --heading-5-size    | var(--text-sm)   | 12px    |         |
| --heading-5-weight  | semibold         |         |         |
| --heading-5-leading |                  |         | 1.6667  |
| --heading-6-size    | var(--text-xsm)  | 10px    |         |
| --heading-6-weight  | semibold         |         |         |
| --heading-6-leading |                  |         | 1.6     |

#### Text Type Tokens

| Token                     | Maps to          | Default | Leading | Weight   |
| ------------------------- | ---------------- | ------- | ------- | -------- |
| --text-body-size          | var(--text-base) | 14px    |         |          |
| --text-body-weight        |                  |         |         | normal   |
| --text-body-leading       |                  |         | 1.4286  |          |
| --text-large-size         | var(--text-lg)   | 17px    |         |          |
| --text-large-weight       |                  |         |         | semibold |
| --text-large-leading      |                  |         | 1.4118  |          |
| --text-label-size         | var(--text-base) | 14px    |         |          |
| --text-label-weight       |                  |         |         | medium   |
| --text-label-leading      |                  |         | 1.4286  |          |
| --text-code-size          | var(--text-base) | 14px    |         |          |
| --text-code-weight        |                  |         |         | normal   |
| --text-code-leading       |                  |         | 1.4286  |          |
| --text-supporting-size    | var(--text-sm)   | 12px    |         |          |
| --text-supporting-weight  |                  |         |         | normal   |
| --text-supporting-leading |                  |         | 1.6667  |          |

### Font Weights

- `--font-weight-normal`: 400
- `--font-weight-medium`: 500
- `--font-weight-semibold`: 600
- `--font-weight-bold`: 700

### Line Heights (Named Leading)

Intent-based ratios for component use. Not modified by `typography.scale`.

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
