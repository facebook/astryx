# StyleX Patterns and Challenges

Notes on StyleX usage patterns discovered while building XDS components.

## The `xstyle` Prop Pattern

When components need configurable styles, use the `xstyle` prop with `StyleXStyles` type. This ensures consumers use StyleX instead of inline styles, maintaining compile-time optimization and consistency.

### Implementation

```tsx
import type {StyleXStyles} from '@stylexjs/stylex';

export interface MyComponentProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'style' | 'className'
> {
  // Component-specific props...

  /** StyleX styles to apply to the component. */
  xstyle?: StyleXStyles;

  children?: ReactNode;
}

export const MyComponent = forwardRef<HTMLElement, MyComponentProps>(
  function MyComponent({xstyle, children, ...props}, ref) {
    const stylexProps = stylex.props(styles.base, xstyle);

    return (
      <div ref={ref} {...stylexProps} {...props}>
        {children}
      </div>
    );
  },
);
```

### Key Points

1. **Omit `style` and `className`**: Use `Omit<HTMLAttributes<HTMLElement>, 'style' | 'className'>` to prevent inline styles and ensure StyleX usage.

2. **Merge styles correctly**: Pass `xstyle` as the last argument to `stylex.props()` so consumer styles can override component defaults.

3. **Constrained vs. freeform styles**:
   - **Higher-level components** (e.g., Button, Card): Prefer constrained APIs with specific props (`variant`, `size`) over open `xstyle`. This enforces design consistency.
   - **Primitive/layout components** (e.g., Stack, Box): It's acceptable to allow freeform `xstyle` since these are building blocks that need flexibility.

### Usage Example

```tsx
import * as stylex from '@stylexjs/stylex';
import { colorTokens } from '@xds/core';

const customStyles = stylex.create({
  highlight: {
    backgroundColor: colorTokens.wash,
    borderRadius: radiusTokens.element,
  },
});

// Consumer usage
<XDSHStack gap="space2" xstyle={customStyles.highlight}>
  <Item />
  <Item />
</XDSHStack>

// Multiple styles via array
<XDSVStack xstyle={[styles.container, styles.padded]}>
  <Content />
</XDSVStack>
```

## Compile-Time Requirement

StyleX requires all styles to be compiled at build time via the Babel plugin. You cannot use `stylex.create()` at runtime (e.g., in Storybook's preview.tsx).

**Solution**: Have the consuming app handle the build for proper style deduping, merging, and bundling.

## Theme Variables with light-dark()

StyleX works well with CSS `light-dark()` function for automatic dark mode support:

```tsx
const colorTheme = stylex.createTheme(colorTokens, {
  accent: 'light-dark(#0064E0, #2694FE)',
  surface: 'light-dark(#FFFFFF, #1C1C1C)',
});
```

The Theme provider sets `color-scheme` property to control which value is used:

```tsx
const wrapperStyles = stylex.create({
  light: {colorScheme: 'light'},
  dark: {colorScheme: 'dark'},
  system: {colorScheme: 'light dark'},
});
```

## Public CSS Variables

To expose StyleX tokens as predictable CSS variables for non-StyleX consumers, use the `--` key syntax with `defineVars`.

```tsx
export const publicVariables = {
  all: {
    '--xds-accent': colorTokens.accent,
    '--xds-surface': colorTokens.surface,
    // ... map all tokens
  },
};

export const allTokens = stylex.defineVars(publicVariables.all);
```

Use in `stylex.create` calls or apply a theme using `stylex.createTheme()`:

```tsx
// Use in stylex.create() calls:
const styles = stylex.create({
  container: {
    backgroundColor: allTokens['--xds-surface'],
    borderColor: allTokens['--xds-accent'],
  },
});

// Or create a theme override with stylex.createTheme():
const customTheme = stylex.createTheme(allTokens, {
  '--xds-accent': '#ff0000',
  '--xds-surface': '#ffffff',
});
```

Consumers can then use `var(--xds-surface)` in plain CSS or inline styles.
