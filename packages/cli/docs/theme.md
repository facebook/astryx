# XDS Theme System

## Quick Start

```tsx
import {XDSTheme} from '@xds/core';
import {defaultTheme} from '@xds/theme/default';

function App() {
  return (
    <XDSTheme theme={defaultTheme}>
      <YourApp />
    </XDSTheme>
  );
}
```

## Available Themes

| Theme   | Import                                            | Description                           |
| ------- | ------------------------------------------------- | ------------------------------------- |
| Default | `import {defaultTheme} from '@xds/theme/default'` | Blue accent, system fonts, light/dark |
| Neutral | `import {neutralTheme} from '@xds/theme/neutral'` | Grayscale, shadcn-inspired            |

Run `npx xds theme --list` to see themes in your project.

## XDSTheme Props

| Prop       | Type                            | Default    | Description                                   |
| ---------- | ------------------------------- | ---------- | --------------------------------------------- |
| `theme`    | `Theme`                         | —          | Theme object (required)                       |
| `mode`     | `'system' \| 'light' \| 'dark'` | `'system'` | Color mode. `'system'` follows OS preference. |
| `children` | `ReactNode`                     | —          | App content                                   |

## Creating a Custom Theme

### Scaffold with CLI (recommended)

```bash
npx xds theme
```

Interactive wizard that generates a `.stylex.ts` theme file with your brand colors.

### Manual creation

A theme is an object with `name` and `styles`. Only override token groups that differ from the defaults — omitted groups automatically use the `defineVars` defaults from `@xds/core`.

```tsx
import * as stylex from '@stylexjs/stylex';
import type {ThemeType as Theme} from '@xds/core/theme';
import {colorVars, colorDefaults} from '@xds/core/theme/tokens.stylex';

// 1. Define your color overrides
const colorOverrides = {
  '--color-accent': 'light-dark(#7B61FF, #9B85FF)',
  '--color-surface': 'light-dark(#FFFFFF, #1A1A2E)',
  // ... all ~60 color tokens (see npx xds docs tokens)
} as const;

// 2. Create StyleX theme override
const colorTheme = stylex.createTheme(
  colorVars,
  colorOverrides as unknown as typeof colorDefaults,
);

// 3. Export the theme — only include overridden groups
export const myTheme: Theme = {
  name: 'my-theme',
  styles: {
    colors: colorTheme,
    // spacing, radius, etc. omitted — uses defaults
  },
  raw: {
    colors: colorOverrides,
    // Include raw values for programmatic access (charting libs, theme editors)
  },
};
```

**Token groups** (all optional in `styles`):
colors, spacing, size, radius, elevation, transition, typography, textSize, lineHeight, fontWeight

Omitted groups use the `defineVars` defaults from `tokens.stylex.ts`.

### ⚠️ Static Analysis Constraint

StyleX's Babel plugin requires that **all values passed to `stylex.createTheme()` are inline object literals** — not variable references, spread expressions, or function return values. This is a compile-time constraint.

```tsx
// ❌ BROKEN — StyleX cannot statically analyze variable references
const sharedSpacing = {
  '--spacing-1': '4px',
  '--spacing-2': '8px',
};
const spacingTheme = stylex.createTheme(spacingVars, sharedSpacing);
// Error: "Only static values are allowed inside of a createTheme() call"

// ❌ BROKEN — spread also fails
const spacingTheme = stylex.createTheme(spacingVars, {...sharedSpacing});

// ✅ WORKS — inline object literal
const spacingTheme = stylex.createTheme(spacingVars, {
  '--spacing-1': '4px',
  '--spacing-2': '8px',
});
```

### Partial overrides

You only need to create `stylex.createTheme()` calls for token groups you want to change. For example, if your theme only changes colors and radius:

```tsx
export const myTheme: Theme = {
  name: 'my-theme',
  styles: {
    colors: colorTheme,
    radius: radiusTheme,
    // All other groups (spacing, size, elevation, transition,
    // typography, textSize, lineHeight, fontWeight) use defaults
  },
};
```

### defineTheme (recommended for new themes)

`defineTheme` is a higher-level API that wraps the raw `stylex.createTheme` pattern. It supports scale configs that generate tokens from parameters.

```tsx
import {defineTheme} from '@xds/core/theme';

const myTheme = defineTheme({
  name: 'my-theme',

  // Type scale — generates heading and text tokens from base size + ratio
  typeScale: { base: 14, ratio: 1.2 },

  // Radius scale — generates radius tokens from base unit + multiplier
  radiusScale: { base: 4, multiplier: 1 },

  // Explicit token overrides (highest precedence — overrides scale values)
  tokens: {
    '--color-accent': ['#7B61FF', '#9B85FF'],
  },

  // Component-level style overrides
  components: {
    button: {
      'variant:primary': { color: 'white' },
    },
  },
});
```

**Scale configs:**

| Config | What it generates | Parameters |
| --- | --- | --- |
| `typeScale` | `--heading-*-size/weight/leading`, `--text-*-size/weight/leading` | `base` (px), `ratio`, `weights?` |
| `radiusScale` | `--radius-0` through `--radius-4`, `--radius-rounded` | `base` (px), `multiplier` (0–2) |

Explicit `tokens` overrides always take precedence over scale-generated values.

## Light/Dark Mode

### Automatic (recommended)

Use `light-dark()` in token values:

```tsx
'--color-accent': 'light-dark(#0064E0, #2694FE)',
//                            ^light     ^dark
```

Then use `mode="system"` (default) on XDSTheme — it follows OS preference.

### Toggle with a button

```tsx
const [mode, setMode] = useState<'light' | 'dark'>('light');

<XDSTheme theme={myTheme} mode={mode}>
  <XDSButton
    label={mode === 'light' ? 'Switch to Dark' : 'Switch to Light'}
    onClick={() => setMode(m => (m === 'light' ? 'dark' : 'light'))}
  />
</XDSTheme>;
```

### Dark-only or light-only theme

Set `mode` explicitly and use single values (not `light-dark()`):

```tsx
<XDSTheme theme={darkTheme} mode="dark">
```

## Nesting Themes

Wrap different sections in separate `<XDSTheme>` providers:

```tsx
<XDSTheme theme={lightTheme} mode="light">
  <XDSLayout
    header={<XDSLayoutHeader>...</XDSLayoutHeader>}
    start={
      <XDSTheme theme={darkTheme} mode="dark">
        <XDSLayoutPanel>{/* Dark sidebar */}</XDSLayoutPanel>
      </XDSTheme>
    }
    content={<XDSLayoutContent>{/* Light content */}</XDSLayoutContent>}
  />
</XDSTheme>
```

## Page Background

**Important:** `XDSTheme` uses `display: contents` — it doesn't create a visual box.
To apply the theme's background color, add it to a wrapper element via StyleX:

```tsx
const styles = stylex.create({
  page: {
    backgroundColor: 'var(--color-wash)',
    minHeight: '100vh',
  },
});

<XDSTheme theme={myTheme}>
  <div {...stylex.props(styles.page)}>
    <XDSLayout>...</XDSLayout>
  </div>
</XDSTheme>;
```

## Component Style Overrides

Themes can override individual component styles via the `components` field.

### How it works

1. Components register their themeable properties via module augmentation:

```tsx
// Inside XDSCard.tsx
declare module '../theme/types' {
  interface ComponentStyles {
    card?: {
      container?: ThemeStyleXStyles;
      content?: ThemeStyleXStyles;
    };
  }
}
```

2. Your theme provides StyleX overrides:

```tsx
const cardOverrides = stylex.create({
  container: {
    borderRadius: '20px',
    background:
      'linear-gradient(135deg, var(--color-accent), var(--color-positive))',
    padding: '2px', // gradient border width
  },
  content: {
    backgroundColor: 'var(--color-card)',
    borderRadius: '18px', // inner radius = outer - padding
  },
});

export const myTheme: Theme = {
  name: 'my-theme',
  styles: {
    colors: colorTheme,
  },
  components: {
    card: {
      container: cardOverrides.container,
      content: cardOverrides.content,
    },
  } as Theme['components'],
};
```

### Available component overrides

| Component | Key       | Slots                                                                      | What to customize                      |
| --------- | --------- | -------------------------------------------------------------------------- | -------------------------------------- |
| Button    | `button`  | `variants` (by variant name)                                               | Background, border, shadow per variant |
| Card      | `card`    | `container`, `content`                                                     | Border, radius, shadow, background     |
| Heading   | `heading` | `styles` (h1-h6), `editorialStyles` (h1-h6)                                | Font, size, weight, color per level    |
| Text      | `text`    | `styles` (body, large, label, supporting, code)                            | Font, size, weight, color per type     |
| Prose     | `prose`   | `base`, `styles` (p, ul, ol, li, blockquote, code, pre, hr, strong, em, a) | Prose element styling                  |

Run `npx xds --detail compact component <Name>` to see a component's themeable slots.

### The `as Theme['components']` cast

The `components` field requires a type assertion because `ComponentStyles` is augmented by individual components via `declare module`. The theme package doesn't import those components, so the augmentations aren't visible at compile time. The cast is safe — types are enforced at the consumer site.

## useXDSTheme Hook

Access the current theme in any component:

```tsx
import {useXDSTheme} from '@xds/core';

function MyComponent() {
  const ctx = useXDSTheme();
  // ctx.theme — the Theme object
  // ctx.mode — 'system' | 'light' | 'dark'
  return null;
}
```

**Note:** This is read-only. To change the theme/mode, manage state at the app level and pass it to `<XDSTheme>`.
