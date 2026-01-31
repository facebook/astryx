# /packages/core/src/theme

XDS theme provider and design tokens.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **XDSTheme Provider**: Wraps app to provide CSS variables
- **Design Tokens**: Colors, spacing, radius, typography via StyleX
- **Multiple Themes**: defaultTheme, neutralTheme
- **useXDSTheme Hook**: Access current theme in components

## Usage

```tsx
import {XDSTheme, defaultTheme} from '@xds/core';

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

- `defaultTheme` - XDS branded colors
- `neutralTheme` - Grayscale palette

## useXDSTheme Hook

Access current theme in components:

```tsx
import {useXDSTheme} from '@xds/core';

const {theme, mode} = useXDSTheme();
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
