# XDS Component Library

> A React design system for building internal tools. Provides form inputs, buttons, layout primitives, and floating UI. All components use the `XDS` prefix (e.g., XDSButton, XDSCard). Use StyleX for custom styling, not inline styles.

XDS is a component library for building internal applications with consistent UI patterns. The library emphasizes composition over configuration, controlled form components, and semantic spacing via CSS variables.

## Key Principles

1. Use XDS components for everything they cover
2. Use StyleX (not inline styles) for layout and styling gaps
3. All components use the `XDS` prefix
4. Form inputs are controlled (value + onChange)
5. Use semantic spacing tokens (space0-space7), not pixel values
6. Use CSS variables for colors (not hardcoded hex values) to support theming

## Component Documentation

Each component has a README.md in its source directory with usage examples, props, and implementation notes.

**Pattern**: For any import like `import { XDSButton } from '@xds/core/Button'`, find docs at `src/Button/README.md`.

| Import Path               | README Location                                                  | Components                                                                    |
| ------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `@xds/core/Button`        | [src/Button/README.md](src/Button/README.md)                     | XDSButton                                                                     |
| `@xds/core/TextInput`     | [src/TextInput/README.md](src/TextInput/README.md)               | XDSTextInput                                                                  |
| `@xds/core/TextArea`      | [src/TextArea/README.md](src/TextArea/README.md)                 | XDSTextArea                                                                   |
| `@xds/core/CheckboxInput` | [src/CheckboxInput/README.md](src/CheckboxInput/README.md)       | XDSCheckboxInput                                                              |
| `@xds/core/Selector`      | [src/Selector/README.md](src/Selector/README.md)                 | XDSSelector                                                                   |
| `@xds/core/Field`         | [src/Field/README.md](src/Field/README.md)                       | XDSField                                                                      |
| `@xds/core/Avatar`        | [src/Avatar/README.md](src/Avatar/README.md)                     | XDSAvatar                                                                     |
| `@xds/core/Skeleton`      | [src/Skeleton/README.md](src/Skeleton/README.md)                 | XDSSkeleton                                                                   |
| `@xds/core/Text`          | [src/Text/README.md](src/Text/README.md)                         | XDSText                                                                       |
| `@xds/core/Icon`          | [src/Icon/README.md](src/Icon/README.md)                         | XDSIcon                                                                       |
| `@xds/core/Layout`        | [src/Layout/README.md](src/Layout/README.md)                     | XDSHStack, XDSVStack, XDSStackItem, XDSCard, XDSSection                       |
| `@xds/core/Layout`        | [src/Layout/XDSLayout/README.md](src/Layout/XDSLayout/README.md) | XDSLayout, XDSLayoutHeader, XDSLayoutContent, XDSLayoutFooter, XDSLayoutPanel |
| `@xds/core/Layer`         | [src/Layer/README.md](src/Layer/README.md)                       | XDSTooltip, XDSHoverCard, XDSMenu                                             |

## Theme

Theme tokens and utilities are documented in [src/theme/README.md](src/theme/README.md) (if available).

```tsx
import {XDSTheme, useXDSTheme, defaultTheme} from '@xds/core';

// Wrap app in theme provider
<XDSTheme theme={defaultTheme}>
  <App />
</XDSTheme>;
```

## Anti-Patterns to Avoid

❌ **Inline styles** - Use StyleX instead

```tsx
// Bad
<div style={{ padding: '16px' }}>

// Good
<div {...stylex.props(styles.container)}>
```

❌ **Hardcoded colors** - Use CSS variables for theming

```tsx
// Bad
<div style={{ color: '#ff0000' }}>

// Good - use theme tokens via StyleX
const styles = stylex.create({
  error: { color: 'var(--color-negative)' }
});
```

## CSS Variables Reference

XDS provides design tokens as CSS variables. Only use these patterns:

| Category      | Pattern                                        | Examples                                                                        |
| ------------- | ---------------------------------------------- | ------------------------------------------------------------------------------- |
| Colors        | `--color-*`                                    | `--color-surface`, `--color-text-primary`, `--color-accent`, `--color-negative` |
| Spacing       | `--spacing-*`                                  | `--spacing-0`, `--spacing-1`, `--spacing-2`, ..., `--spacing-7`                 |
| Radius        | `--radius-*`                                   | `--radius-container`, `--radius-element`, `--radius-content`                    |
| Elevation     | `--elevation-*`                                | `--elevation-base`, `--elevation-dialog`, `--elevation-menu`                    |
| Font families | `--font-body`, `--font-code`, `--font-heading` | (only these three exist)                                                        |
| Text sizes    | `--text-*`                                     | `--text-sm`, `--text-base`, `--text-lg`, `--text-xl`                            |
| Line heights  | `--leading-*`                                  | `--leading-tight`, `--leading-normal`, `--leading-relaxed`                      |
| Font weights  | `--font-weight-*`                              | `--font-weight-normal`, `--font-weight-semibold`, `--font-weight-bold`          |

❌ **Hardcoded spacing** - Use semantic tokens

```tsx
// Bad
<XDSVStack style={{ gap: '8px' }}>

// Good
<XDSVStack gap="space2">
```

## Optional Resources

- [Storybook Examples](../../apps/storybook/): Interactive component demos
- [Source Code](./src/): Component implementations
