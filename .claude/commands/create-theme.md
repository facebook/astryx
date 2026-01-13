# Create XDS Theme

Create a new XDS theme following established patterns.

## Theme Name

$ARGUMENTS

## Instructions

Create a new theme file at `/packages/core/src/theme/{themeName}Theme.stylex.ts`.

### Theme File Template

```tsx
/**
 * {ThemeName} Theme
 *
 * Description of this theme's visual style.
 *
 * Inspired by: [source if applicable]
 */

import * as stylex from '@stylexjs/stylex';
import {
  colorTokens,
  elevationTokens,
  spacingTokens,
  radiusTokens,
  transitionTokens,
  typographyTokens,
} from './tokens.stylex';
import type { Theme } from './types';

// =============================================================================
// Color Theme
// =============================================================================
// Use light-dark() for automatic light/dark mode switching.
// Format: 'light-dark(lightValue, darkValue)'

const colorTheme = stylex.createTheme(colorTokens, {
  // Core semantic
  accent: 'light-dark(#YOUR_LIGHT, #YOUR_DARK)',
  accentDeemphasized: 'light-dark(#YOUR_LIGHT33, #YOUR_DARK3F)',
  accentText: 'light-dark(#YOUR_LIGHT, #YOUR_DARK)',
  surface: 'light-dark(#FFFFFF, #1C1C1C)',
  wash: 'light-dark(#F5F5F5, #121212)',
  overlay: 'light-dark(#00000066, #00000099)',
  hoverOverlay: 'light-dark(#0000000C, #FFFFFF0C)',
  pressedOverlay: 'light-dark(#00000019, #FFFFFF19)',
  focusOutline: 'light-dark(#YOUR_LIGHT, #YOUR_DARK)',
  deemphasized: 'light-dark(#0000000C, #FFFFFF0C)',

  // Text
  textPrimary: 'light-dark(#171717, #FAFAFA)',
  textSecondary: 'light-dark(#737373, #A3A3A3)',
  textDisabled: 'light-dark(#A3A3A3, #525252)',
  textLink: 'light-dark(#YOUR_LIGHT, #YOUR_DARK)',
  textPlaceholder: 'light-dark(#737373, #A3A3A3)',

  // Icon
  iconPrimary: 'light-dark(#171717, #FAFAFA)',
  iconSecondary: 'light-dark(#737373, #A3A3A3)',
  iconTertiary: 'light-dark(#A3A3A3, #737373)',
  iconDisabled: 'light-dark(#D4D4D4, #525252)',

  // Surface variants
  card: 'light-dark(#FFFFFF, #262626)',
  popover: 'light-dark(#FFFFFF, #262626)',
  navbar: 'light-dark(#FFFFFF, #171717)',

  // Status/Sentiment
  positive: 'light-dark(#22C55E, #22C55E)',
  positiveDeemphasized: 'light-dark(#22C55E33, #22C55E3F)',
  negative: 'light-dark(#EF4444, #EF4444)',
  negativeDeemphasized: 'light-dark(#EF444433, #EF44443F)',
  warning: 'light-dark(#F59E0B, #F59E0B)',
  warningDeemphasized: 'light-dark(#F59E0B33, #F59E0B3F)',
  educational: 'light-dark(#8B5CF6, #8B5CF6)',
  educationalDeemphasized: 'light-dark(#8B5CF633, #8B5CF63F)',

  // Divider
  divider: 'light-dark(#E5E5E5, #404040)',
  dividerHighContrast: 'light-dark(#A3A3A3, #737373)',
  dividerEmphasized: 'light-dark(#D4D4D4, #525252)',

  // Disabled/Effects
  disabledOverlay: 'light-dark(#FFFFFF7F, #1717177F)',
  glimmer: 'light-dark(#E5E5E5, #404040)',
  glimmerHighContrast: 'light-dark(#D4D4D4, #525252)',
  shadowElevation: 'light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.5))',

  // Literal color sets (customize as needed)
  blueBackground: 'light-dark(#3B82F633, #3B82F633)',
  blueBorder: 'light-dark(#3B82F6, #60A5FA)',
  blueIcon: 'light-dark(#3B82F6, #60A5FA)',
  blueText: 'light-dark(#1D4ED8, #93C5FD)',

  // ... add other color sets as needed
});

// =============================================================================
// Elevation Theme
// =============================================================================

const elevationTheme = stylex.createTheme(elevationTokens, {
  base: 'light-dark(0px 0px 1px rgba(0, 0, 0, 0.1), 0px 0px 1px rgba(0, 0, 0, 0.3))',
  thumb: 'light-dark(0 1px 3px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.4))',
  dialog: 'light-dark(0px 2px 2px rgba(0, 0, 0, 0.1), 0px 8px 24px rgba(0, 0, 0, 0.1), 0px 2px 2px rgba(0, 0, 0, 0.2), 0px 8px 24px rgba(0, 0, 0, 0.3))',
  hover: 'light-dark(0px 1px 2px rgba(0, 0, 0, 0.1), 0px 2px 12px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.2), 0px 2px 12px rgba(0, 0, 0, 0.2))',
  menu: 'light-dark(0px 1px 1px rgba(0, 0, 0, 0.1), 0px 2px 8px rgba(0, 0, 0, 0.1), 0px 1px 1px rgba(0, 0, 0, 0.2), 0px 2px 8px rgba(0, 0, 0, 0.2))',
});

// =============================================================================
// Spacing Theme (optional - inherit from default if unchanged)
// =============================================================================

const spacingTheme = stylex.createTheme(spacingTokens, {
  space0: '0px',
  space0_5: '2px',
  space1: '4px',
  space2: '8px',
  space3: '12px',
  space4: '16px',
  space5: '20px',
  space6: '24px',
  space7: '32px',
});

// =============================================================================
// Radius Theme (optional - customize for different feel)
// =============================================================================

const radiusTheme = stylex.createTheme(radiusTokens, {
  rounded: '9999px',
  container: '12px',
  element: '8px',
  content: '4px',
});

// =============================================================================
// Transition Theme
// =============================================================================

const transitionTheme = stylex.createTheme(transitionTokens, {
  fast: '0.15s ease',
  normal: '0.2s ease',
});

// =============================================================================
// Typography Theme
// =============================================================================

const typographyTheme = stylex.createTheme(typographyTokens, {
  fontFamilyBody: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontFamilyCode: '"SF Mono", Monaco, Consolas, monospace',
  fontFamilyHeading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
});

// =============================================================================
// Theme Export
// =============================================================================

export const {themeName}Theme: Theme = {
  name: '{themeName}',
  colorTheme,
  elevationTheme,
  spacingTheme,
  radiusTheme,
  transitionTheme,
  typographyTheme,
};
```

### Export from index.ts

Add to `/packages/core/src/theme/index.ts`:

```tsx
export { {themeName}Theme } from './{themeName}Theme.stylex';
```

## Key Concepts

### light-dark() Function

All color values use CSS `light-dark()` for automatic mode switching:

```tsx
accent: 'light-dark(#0064E0, #2694FE)',
//                 ^ light   ^ dark
```

The Theme provider sets `color-scheme` to control which value is used.

### Token Categories

| Category | Purpose |
|----------|---------|
| `colorTokens` | All colors including semantic, text, icon, status, dividers |
| `elevationTokens` | Box shadows for different elevation levels |
| `spacingTokens` | Consistent spacing scale |
| `radiusTokens` | Border radius for different contexts |
| `transitionTokens` | Animation durations |
| `typographyTokens` | Font families |

### Minimal Theme (Extending Default)

If you only need to change colors, you can spread the default theme:

```tsx
import { defaultTheme } from './defaultTheme.stylex';

const colorTheme = stylex.createTheme(colorTokens, {
  // Only override what you need
  accent: 'light-dark(#YOUR_COLOR, #YOUR_DARK)',
  // ...
});

export const myTheme: Theme = {
  ...defaultTheme,
  name: 'myTheme',
  colorTheme,
};
```

## Reference

See existing themes for examples:
- `/packages/core/src/theme/defaultTheme.stylex.ts` - Complete reference theme
- `/packages/core/src/theme/neutralTheme.stylex.ts` - Grayscale theme with custom typography

## After Creation

1. Run `yarn workspace @xds/core build` to verify the build
2. Add theme to Storybook preview for testing: `/apps/storybook/.storybook/preview.tsx`
3. Test in both light and dark modes
