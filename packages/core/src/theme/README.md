# theme

XDS theme provider and design tokens.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **XDSTheme Provider**: Wraps app to provide CSS variables and icon registry
- **Design Tokens**: Colors, spacing, radius, typography via StyleX
- **Icon Registry**: Themes provide icons to components via context
- **Multiple Themes**: defaultTheme, neutralTheme (from `@xds/theme`)
- **useXDSTheme Hook**: Access current theme in components

## Usage

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

## Props

| Prop       | Type        | Default    | Description                                 |
| ---------- | ----------- | ---------- | ------------------------------------------- |
| `theme`    | `Theme`     | —          | Theme object (defaultTheme or neutralTheme) |
| `mode`     | `ThemeMode` | `'system'` | Color mode: 'system', 'light', or 'dark'    |
| `children` | `ReactNode` | —          | App content                                 |

## Available Themes

From `@xds/theme`:

- `defaultTheme` — XDS branded colors + heroicons
- `neutralTheme` — Grayscale palette + heroicons

## Theme Object

A theme provides:

```ts
interface Theme {
  name: string;
  styles: ThemeStyles; // StyleX CSS variable overrides (all fields optional)
  components?: ComponentStyles; // Component-level style overrides
  icons?: Partial<XDSIconRegistry>; // Icon overrides for XDSIcon semantic names
  raw?: ThemeRaw; // Raw token values for programmatic access
}
```

The optional `raw` field provides actual token values (not CSS variable references) for programmatic access — useful for charting libraries, theme editors, or parsing `light-dark()` values.

All fields in `ThemeStyles` are optional — omitted token groups use the `defineVars` defaults from `tokens.stylex.ts`. This enables partial theme overrides (e.g., only override colors and radius).

### Icons

Themes can provide icons for XDS's 12 semantic icon names. These are used internally by components (CloseButton, Calendar, inputs, etc.) and can also be used directly via `<XDSIcon icon="close" />`.

```ts
import type { XDSIconRegistry } from '@xds/core/Icon';

// Full registry (all 12 icons)
const icons: XDSIconRegistry = {
  close: <XMarkIcon />,
  chevronDown: <ChevronDownIcon />,
  // ... all 12 names
};

// Partial override (only some icons)
const icons: Partial<XDSIconRegistry> = {
  close: <MyCustomCloseIcon />,
  // Others fall back to built-in SVGs
};
```

When no theme is active, components use built-in lightweight SVG fallbacks.

See the [Icon README](../Icon/README.md) for the full list of semantic names.

### Adding icons to a custom theme

```ts
import { MyCloseIcon, MyChevronIcon } from './my-icons';

const myTheme: Theme = {
  name: 'my-brand',
  icons: {
    close: <MyCloseIcon width="1em" height="1em" aria-hidden />,
    chevronDown: <MyChevronIcon width="1em" height="1em" aria-hidden />,
    // ... provide as many or as few as needed
  },
  styles: { /* ... only overridden token groups */ },
};
```

Icons should use `width="1em"` and `height="1em"` so they scale with the `XDSIcon` size prop.

## useXDSTheme Hook

Access current theme in components:

```tsx
import {useXDSTheme} from '@xds/core';

const themeContext = useXDSTheme();
// themeContext?.theme — current Theme object
// themeContext?.mode — current ThemeMode
```

## CSS Variables

Theme provides CSS variables for use in StyleX:

```tsx
const styles = stylex.create({
  card: {
    backgroundColor: 'var(--color-surface)',
    padding: 'var(--spacing-4)',
    borderRadius: 'var(--radius-container)',
  },
});
```

See `.xds-docs/tokens.md` for the full token reference.

## Files

| File               | Role     | Purpose                             |
| ------------------ | -------- | ----------------------------------- |
| `index.ts`         | Entry    | Exports provider, hook, and types   |
| `XDSTheme.tsx`     | Provider | Theme provider with icon registry   |
| `ThemeContext.ts`  | Context  | React context for theme values      |
| `types.ts`         | Types    | Theme, ThemeStyles, ComponentStyles |
| `tokens.stylex.ts` | Tokens   | StyleX CSS variable definitions     |

## For Contributors

### How the icon registry works

1. `XDSTheme` reads `theme.icons` and wraps children in `IconRegistryContext.Provider`
2. `XDSIcon` with a semantic name string calls `useXDSIcon(name)` which checks the context
3. If the theme provides that icon, it's used. Otherwise, the built-in fallback SVG renders.

### Adding a new semantic icon name

1. Add the name to `XDSIconName` in `Icon/IconRegistry.tsx`
2. Add a fallback SVG in `Icon/defaultIcons.tsx`
3. Add the icon to both theme registries (`@xds/theme` default + neutral)
4. Use it in your component: `<XDSIcon icon="newName" />`
5. Update the Icon README's semantic names table
