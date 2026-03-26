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

| Token             | Value | Usage                           |
| ----------------- | ----- | ------------------------------- |
| --size-element-sm | 28px  | Compact controls                |
| --size-element-md | 32px  | Default control size            |
| --size-element-lg | 36px  | Larger, more prominent controls |

## Color Tokens

### Semantic Colors

| Token                      | Usage                                        |
| -------------------------- | -------------------------------------------- |
| --color-accent             | Primary action color                         |
| --color-background-surface | Background surface                           |
| --color-background-body    | Page-level background (app shell, page body) |
| --color-success            | Success states                               |
| --color-error              | Error states                                 |
| --color-warning            | Warning states                               |
| --color-on-accent          | Text/icon on accent background               |
| --color-on-success         | Text/icon on success background              |
| --color-on-error           | Text/icon on error background                |
| --color-on-warning         | Text/icon on warning background              |
| --color-on-dark            | Text/icon on dark media                      |
| --color-on-light           | Text/icon on light media                     |

### Neutral Grays

Three tokens for "gray" backgrounds. Choosing the right one depends on what the element _is_:

| Token                    | Role                           | Use for                                                                                                                    |
| ------------------------ | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| --color-neutral          | Neutral fill for elements      | Buttons (default), badges, tokens, kbd, avatar fallback, pagination dots, status dots, selected nav items, icon containers |
| --color-background-muted | Background for content areas   | Sections, code blocks, table zebra stripes, progress/slider tracks, disabled input fills, featured cards                   |
| --color-overlay-hover    | Translucent hover/active state | Hover on ghost buttons, list item highlights, menu item highlights, table row hover                                        |

**Decision tree:**

1. Is it a **hover/active/highlighted state**? → `--color-overlay-hover`
2. Is it a **container with other content inside** (text, icons, controls)? → `--color-background-muted`
3. Is it a **self-contained element sitting on a surface**? → `--color-neutral`

### Text Colors

| Token                  | Usage          |
| ---------------------- | -------------- |
| --color-text-primary   | Main text      |
| --color-text-secondary | Secondary text |
| --color-text-disabled  | Disabled text  |
| --color-text-accent    | Link text      |

### Icon Colors

| Token                  | Usage           |
| ---------------------- | --------------- |
| --color-icon-accent    | Accent icons    |
| --color-icon-primary   | Main icons      |
| --color-icon-secondary | Secondary icons |
| --color-icon-disabled  | Disabled icons  |

## Radius Tokens

Semantic scale based on a 4dp base unit. Tokens inner through page scale with the theme's `radius` multiplier; none and full are fixed.

| Token              | Value  | Usage                                 | Scales |
| ------------------ | ------ | ------------------------------------- | ------ |
| --radius-none      | 0px    | No radius (dividers, table cells)     | No     |
| --radius-inner     | 4px    | Code blocks, inner content            | Yes    |
| --radius-element   | 8px    | Buttons, inputs, text areas           | Yes    |
| --radius-container | 12px   | Cards, modals, popovers, dropdowns    | Yes    |
| --radius-page      | 28px   | Page sections, large containers       | Yes    |
| --radius-full      | 9999px | Badges, avatars, status dots, toggles | No     |

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

## Border Tokens

| Token          | Value | Usage                              |
| -------------- | ----- | ---------------------------------- |
| --border-width | 1px   | Default border width across the UI |

## Shadow Tokens

| Token                   | Usage                     |
| ----------------------- | ------------------------- |
| --shadow-low            | Subtle lift (cards)       |
| --shadow-low            | Floating elements (menus) |
| --shadow-med            | Hover lift, toasts        |
| --shadow-high           | Dialogs, modals           |
| --shadow-inset-hover    | Input hover ring          |
| --shadow-inset-selected | Input focused/active ring |
| --shadow-inset-success  | Input success ring        |
| --shadow-inset-warning  | Input warning ring        |
| --shadow-inset-error    | Input error ring          |

## Typography Tokens

### Font Families

- `--font-family-body`: System UI font stack
- `--font-family-code`: Monospace font stack
- `--font-family-heading`: System UI font stack

### Text Sizes

Computed from a geometric scale: `round(base × ratio^step)`.
Default: base=14px, ratio=1.2.

| Token            | Step | Default | Usage           |
| ---------------- | ---- | ------- | --------------- |
| --font-size-4xs  | -5   | 6px     | Citation, micro |
| --font-size-3xs  | -4   | 7px     | Micro labels    |
| --font-size-2xs  | -3   | 8px     | Small micro     |
| --font-size-xs   | -2   | 10px    | Extra small     |
| --font-size-sm   | -1   | 12px    | Small text      |
| --font-size-base | 0    | 14px    | Body (anchor)   |
| --font-size-lg   | +1   | 17px    | Large text      |
| --font-size-xl   | +2   | 20px    | Extra large     |
| --font-size-2xl  | +3   | 24px    | 2× large        |
| --font-size-3xl  | +4   | 29px    | 3× large        |
| --font-size-4xl  | +5   | 35px    | 4× large        |

### Type Scale (Semantic Tokens)

Semantic tokens map headings and text types to the raw size scale.
Sizes are `var()` references; line heights are 4px-grid-snapped computed values.

Override the entire scale with `typography.scale: { base, ratio }` in `defineTheme()`.

#### Heading Tokens

| Token                    | Maps to               | Default | Leading |
| ------------------------ | --------------------- | ------- | ------- |
| --text-heading-1-size    | var(--font-size-2xl)  | 24px    |         |
| --text-heading-1-weight  | semibold              |         |         |
| --text-heading-1-leading |                       |         | 1.3333  |
| --text-heading-2-size    | var(--font-size-xl)   | 20px    |         |
| --text-heading-2-weight  | semibold              |         |         |
| --text-heading-2-leading |                       |         | 1.4     |
| --text-heading-3-size    | var(--font-size-lg)   | 17px    |         |
| --text-heading-3-weight  | semibold              |         |         |
| --text-heading-3-leading |                       |         | 1.4118  |
| --text-heading-4-size    | var(--font-size-base) | 14px    |         |
| --text-heading-4-weight  | semibold              |         |         |
| --text-heading-4-leading |                       |         | 1.4286  |
| --text-heading-5-size    | var(--font-size-sm)   | 12px    |         |
| --text-heading-5-weight  | semibold              |         |         |
| --text-heading-5-leading |                       |         | 1.6667  |
| --text-heading-6-size    | var(--font-size-xs)   | 10px    |         |
| --text-heading-6-weight  | semibold              |         |         |
| --text-heading-6-leading |                       |         | 1.6     |

#### Text Type Tokens

| Token                     | Maps to               | Default | Leading | Weight   |
| ------------------------- | --------------------- | ------- | ------- | -------- |
| --text-body-size          | var(--font-size-base) | 14px    |         |          |
| --text-body-weight        |                       |         |         | normal   |
| --text-body-leading       |                       |         | 1.4286  |          |
| --text-large-size         | var(--font-size-lg)   | 17px    |         |          |
| --text-large-weight       |                       |         |         | semibold |
| --text-large-leading      |                       |         | 1.4118  |          |
| --text-label-size         | var(--font-size-base) | 14px    |         |          |
| --text-label-weight       |                       |         |         | medium   |
| --text-label-leading      |                       |         | 1.4286  |          |
| --text-code-size          | var(--font-size-base) | 14px    |         |          |
| --text-code-weight        |                       |         |         | normal   |
| --text-code-leading       |                       |         | 1.4286  |          |
| --text-supporting-size    | var(--font-size-sm)   | 12px    |         |          |
| --text-supporting-weight  |                       |         |         | normal   |
| --text-supporting-leading |                       |         | 1.6667  |          |

#### Display Tokens

| Token                    | Maps to              | Default | Leading |
| ------------------------ | -------------------- | ------- | ------- |
| --text-display-1-size    | var(--font-size-5xl) | 42px    |         |
| --text-display-1-weight  |                      |         | normal  |
| --text-display-1-leading |                      |         | 1.2381  |
| --text-display-2-size    | var(--font-size-4xl) | 35px    |         |
| --text-display-2-weight  |                      |         | normal  |
| --text-display-2-leading |                      |         | 1.2571  |
| --text-display-3-size    | var(--font-size-3xl) | 29px    |         |
| --text-display-3-weight  |                      |         | normal  |
| --text-display-3-leading |                      |         | 1.2414  |

### Font Weights

- `--font-weight-normal`: 400
- `--font-weight-medium`: 500
- `--font-weight-semibold`: 600
- `--font-weight-bold`: 700

### Line Heights (Named Leading) — Deprecated

> **Deprecated.** Use semantic type scale leading tokens instead.
> Components should pair their `fontSize` with the matching semantic leading:
> `--text-body-leading`, `--text-label-leading`, `--text-supporting-leading`, etc.

| Old Token         | Value  | Replacement               |
| ----------------- | ------ | ------------------------- |
| --leading-base    | 1.4286 | --text-body-leading       |
| --leading-snug    | 1.375  | --text-label-leading      |
| --leading-normal  | 1.5    | --text-large-leading      |
| --leading-tight   | 1.25   | --text-heading-1-leading  |
| --leading-relaxed | 1.625  | --text-supporting-leading |

## Usage in StyleX

```tsx
import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars, sizeVars, radiusVars} from '@xds/core';

const styles = stylex.create({
  card: {
    padding: spacingVars['--spacing-4'],
    backgroundColor: colorVars['--color-background-surface'],
    borderRadius: radiusVars['--radius-container'],
  },
  button: {
    height: sizeVars['--size-element-md'],
  },
});
```

Or use CSS custom properties directly:

```tsx
const styles = stylex.create({
  card: {
    padding: 'var(--spacing-4)',
    backgroundColor: 'var(--color-background-surface)',
    borderRadius: 'var(--radius-container)',
  },
});
```
