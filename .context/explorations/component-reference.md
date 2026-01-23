# XDS Component Reference

Patterns and techniques for building XDS components with StyleX.

## Component Architecture

### File Structure

```
/packages/core/src/{ComponentName}/
├── {ComponentName}.tsx       # Main component implementation
├── index.ts                  # Exports
├── README.md                 # Documentation
├── {ComponentName}.stories.tsx   # Storybook stories
└── {ComponentName}.test.tsx      # Tests
```

### Basic Component Template

```tsx
import {forwardRef, type HTMLAttributes, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorTokens, spacingTokens} from '../theme/tokens.stylex';

const styles = stylex.create({
  base: {
    // Base styles using tokens
  },
});

const variants = stylex.create({
  default: {
    /* ... */
  },
  // Add more variants as needed
});

// Derive type from StyleX object
export type ComponentVariant = keyof typeof variants;

export interface ComponentProps extends HTMLAttributes<HTMLElement> {
  variant?: ComponentVariant;
  children: ReactNode;
}

export const Component = forwardRef<HTMLElement, ComponentProps>(
  ({variant = 'default', children, ...props}, ref) => {
    return (
      <div
        ref={ref}
        {...stylex.props(styles.base, variants[variant])}
        {...props}>
        {children}
      </div>
    );
  },
);

Component.displayName = 'Component';
```

## Type Derivation Pattern

Derive variant types from StyleX objects to keep types in sync with styles:

```tsx
const variants = stylex.create({
  primary: {
    /* ... */
  },
  secondary: {
    /* ... */
  },
  ghost: {
    /* ... */
  },
});

export type ButtonVariant = keyof typeof variants;
// Results in: 'primary' | 'secondary' | 'ghost'
```

When you add or remove a variant from the StyleX object, the type automatically updates.

## StyleX Patterns

### Using Tokens

Always use tokens from `tokens.stylex` instead of hardcoded values:

```tsx
import {
  colorTokens,
  spacingTokens,
  radiusTokens,
  transitionTokens,
  typographyTokens,
} from '../theme/tokens.stylex';

const styles = stylex.create({
  base: {
    backgroundColor: colorTokens.surface,
    padding: spacingTokens.space3,
    borderRadius: radiusTokens.element,
    fontFamily: typographyTokens.fontFamilyBody,
    transitionDuration: transitionTokens.fast,
  },
});
```

### Conditional Styles

Apply styles conditionally using `stylex.props`:

```tsx
{...stylex.props(
  styles.base,
  variants[variant],
  isDisabled && styles.disabled,
  isLoading && styles.loading
)}
```

### Pseudo-selectors

StyleX supports common pseudo-selectors:

```tsx
const styles = stylex.create({
  interactive: {
    backgroundColor: {
      default: null,
      ':hover': colorTokens.hoverOverlay,
      ':active': colorTokens.pressedOverlay,
    },
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorTokens.focusOutline}`,
    },
    outlineOffset: {
      default: null,
      ':focus-visible': '3px',
    },
  },
});
```

### Animations

Use `stylex.keyframes` for animations:

```tsx
const styles = stylex.create({
  spinner: {
    animationName: stylex.keyframes({
      to: {transform: 'rotate(360deg)'},
    }),
    animationDuration: '0.6s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
});
```

## Advanced Patterns

### Overlay Hover/Active States

For interactive elements where you want hover/active colors to layer on top of the base background (not replace it), use `backgroundImage`:

```tsx
const variants = stylex.create({
  primary: {
    backgroundColor: colorTokens.accent,
    backgroundImage: {
      default: null,
      ':hover': `linear-gradient(${colorTokens.hoverOverlay}, ${colorTokens.hoverOverlay})`,
      ':active': `linear-gradient(${colorTokens.pressedOverlay}, ${colorTokens.pressedOverlay})`,
    },
  },
});
```

This works because `background-image` renders on top of `background-color`.

### Variant-Specific Focus Colors

Some components need different focus outline colors per variant:

```tsx
const variants = stylex.create({
  primary: {
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorTokens.focusOutline}`,
    },
    outlineOffset: {
      default: null,
      ':focus-visible': '3px',
    },
  },
  destructive: {
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorTokens.negative}`,
    },
    outlineOffset: {
      default: null,
      ':focus-visible': '3px',
    },
  },
});
```

### Loading States

Pattern for components with loading indicators:

```tsx
const loadingStyles = stylex.create({
  loading: {
    position: 'relative',
    color: 'transparent', // Hide text while loading
  },
  spinner: {
    position: 'absolute',
    // Spinner styles...
  },
});

// In component:
{...stylex.props(
  styles.base,
  loading && loadingStyles.loading
)}
{loading && <span {...stylex.props(loadingStyles.spinner)} />}
```

## Known StyleX Limitations

See `.context/explorations/stylex-patterns.md` for detailed notes:

1. **No runtime `stylex.create()`** - All styles must be compiled at build time
2. **Combined pseudo-selectors don't work** - `:hover::after` is not supported
3. **Use `backgroundImage` for overlays** - Instead of `::after` pseudo-elements

## Token Reference

Available tokens from `tokens.stylex`:

| Category           | Tokens                                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `colorTokens`      | accent, surface, textPrimary, textSecondary, hoverOverlay, pressedOverlay, focusOutline, negative, positive, etc. |
| `spacingTokens`    | space0, space0_5, space1, space2, space3, space4, space5, space6, space7                                          |
| `radiusTokens`     | rounded, container, element, content                                                                              |
| `transitionTokens` | fast, normal                                                                                                      |
| `typographyTokens` | fontFamilyBody, fontFamilyCode, fontFamilyHeading                                                                 |

## Example: Button Component

See `/packages/core/src/Button/Button.tsx` for a complete implementation demonstrating:

- Multiple variants (primary, secondary, ghost, destructive)
- Loading state with spinner
- Overlay hover/active states
- Variant-specific focus colors
- Type derivation from StyleX object
