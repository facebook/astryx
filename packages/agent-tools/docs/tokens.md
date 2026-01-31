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
| --spacing-7   | 32px  | Extra loose      |

Component gap props use `space0`-`space7` which map to these tokens.

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

| Token              | Value  | Usage           |
| ------------------ | ------ | --------------- |
| --radius-rounded   | 9999px | Pills, avatars  |
| --radius-container | 12px   | Cards, modals   |
| --radius-element   | 8px    | Buttons, inputs |
| --radius-content   | 4px    | Small elements  |
| --radius-inner     | 0px    | No radius       |

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

## Usage in StyleX

```tsx
import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars, radiusVars} from '@xds/core';

const styles = stylex.create({
  card: {
    padding: spacingVars['--spacing-4'],
    backgroundColor: colorVars['--color-surface'],
    borderRadius: radiusVars['--radius-container'],
  },
});
```

Or use CSS custom properties directly:

```tsx
const styles = stylex.create({
  card: {
    padding: 'var(--spacing-4)',
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-container)',
  },
});
```
