# Create XDS Theme

Create a new XDS theme using `defineTheme`.

## Theme Name

$ARGUMENTS

## Instructions

Create a new theme package at `packages/themes/{themeName}/`.

### File Structure

```
packages/themes/{themeName}/
├── package.json
└── src/
    └── index.ts
```

### package.json

```json
{
  "name": "@xds/theme-{themeName}",
  "version": "0.0.1",
  "private": false,
  "description": "{Description} theme for XDS",
  "license": "MIT",
  "sideEffects": false,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./theme.css": "./dist/theme.css"
  },
  "files": ["dist", "src"],
  "scripts": {
    "build:theme": "xds build-theme src/index.ts -o dist/theme.css"
  },
  "peerDependencies": {
    "@xds/core": "*"
  },
  "devDependencies": {
    "@xds/cli": "*"
  }
}
```

### Theme File (src/index.ts)

```tsx
import {defineTheme} from '@xds/core/theme';

export const {themeName}Theme = defineTheme({
  name: '{themeName}',

  tokens: {
    // Colors — use [light, dark] tuples for automatic light-dark() conversion
    '--color-accent': ['#YOUR_LIGHT', '#YOUR_DARK'],
    '--color-accent-muted': ['#YOUR_LIGHT33', '#YOUR_DARK3F'],
    '--color-surface': ['#FFFFFF', '#1C1C1C'],
    '--color-wash': ['#F5F5F5', '#121212'],

    // Radius — customize for different feel
    '--radius-3': '12px',
    '--radius-2': '8px',
    '--radius-1': '4px',

    // Typography — font families
    '--font-body': '-apple-system, BlinkMacSystemFont, sans-serif',
    '--font-heading': '-apple-system, BlinkMacSystemFont, sans-serif',
    '--font-code': '"SF Mono", Monaco, Consolas, monospace',

    // Only include tokens you want to override.
    // See packages/core/src/theme/tokens.stylex.ts for all available tokens.
  },

  components: {
    // Component style overrides using CSS class selectors
    // Keys: 'base' for all instances, 'prop:value' for variants
    button: {
      base: { fontWeight: '600' },
      'variant:secondary': { backgroundColor: 'rgba(0,0,0,0.06)' },
    },
    heading: {
      'level:1': {
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-2xl)',
        fontWeight: 'var(--font-weight-semibold)',
        lineHeight: '1.2',
        color: 'var(--color-text-primary)',
        margin: '0',
      },
      // ... levels 2-6
    },
    text: {
      'type:body': {
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-weight-normal)',
        lineHeight: 'var(--leading-base)',
        color: 'var(--color-text-primary)',
        margin: '0',
      },
      // ... other types: large, label, supporting, code
    },
  },

  // Optional: icon registry (import from a separate icons file)
  // icons: myIconRegistry,
});
```

## Key Concepts

### Token Values

- **String**: Used as-is for both light and dark modes
- **[light, dark] tuple**: Converted to CSS `light-dark(light, dark)`

### Component Override Keys

- `base` — styles applied to all instances
- `prop:value` — styles when a visual prop matches (e.g. `variant:secondary`)
- `prop:value+prop:value` — intersection of multiple props (e.g. `variant:editorial+level:1`)

### CSS Output

Component overrides generate scoped CSS:

```css
@scope ([data-xds-theme="{themeName}"]) to ([data-xds-theme]) {
  .xds-button.secondary {
    background-color: ...;
  }
  .xds-heading.level-1 {
    font-size: var(--text-2xl);
  }
}
```

### Distribution

- **Unbuilt**: `XDSTheme` generates CSS and injects `<style>` at runtime
- **Built**: `npx xds theme build` pre-compiles to a CSS file

## Reference

See existing themes for examples:

- `packages/themes/default/src/defaultTheme.ts` — Complete reference theme
- `packages/themes/neutral/src/neutralTheme.ts` — Grayscale theme with Geist font
- `packages/themes/brutalist/src/index.ts` — Minimal showcase theme

## After Creation

1. Add to workspace in root `package.json` if needed
2. Add theme to Storybook preview: `apps/storybook/.storybook/preview.tsx`
3. Test in both light and dark modes
