# /packages/core/src/theme

XDS theme provider and design tokens.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Theme Provider**: Wraps app to provide CSS variables
- **Design Tokens**: Colors, spacing, radius, typography via StyleX
- **Multiple Themes**: defaultTheme, neutralTheme
- **useTheme Hook**: Access current theme in components

## Usage

```tsx
import {Theme, defaultTheme} from '@xds/core';

function App() {
  return (
    <Theme theme={defaultTheme}>
      <YourApp />
    </Theme>
  );
}
```

## Props

| Prop       | Type        | Default | Description                                 |
| ---------- | ----------- | ------- | ------------------------------------------- |
| `theme`    | `XDSTheme`  | —       | Theme object (defaultTheme or neutralTheme) |
| `children` | `ReactNode` | —       | App content                                 |

## Available Themes

- `defaultTheme` - XDS branded colors
- `neutralTheme` - Grayscale palette

## useTheme Hook

Access current theme in components:

```tsx
import {useTheme} from '@xds/core';

const {theme} = useTheme();
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
