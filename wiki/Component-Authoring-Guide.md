# Component Authoring Guide

The practical reference for building new XDS components. Covers file structure, StyleX patterns, token usage, and conventions.

---

## File Structure

Every component lives in its own directory under `/packages/core/src/`:

```
/packages/core/src/Button/
├── XDSButton.tsx              # Main component implementation
├── index.ts                   # Exports
├── README.md                  # Documentation
├── XDSButton.stories.tsx      # Storybook stories
└── XDSButton.test.tsx         # Tests
```

The naming convention is `XDS{ComponentName}` — both for the directory contents and the exported component name:

| Component | Directory | File | Export |
|-----------|-----------|------|--------|
| Button | `Button/` | `XDSButton.tsx` | `XDSButton` |
| Text Input | `TextInput/` | `XDSTextInput.tsx` | `XDSTextInput` |
| Stack | `Stack/` | `XDSStack.tsx` | `XDSStack` |

---

## File Header Convention

Every component file starts with a JSDoc block describing its role:

```tsx
/**
 * XDSButton — Primary interactive element for user actions.
 *
 * @input variant, size, disabled, loading, children
 * @output Styled <button> element with theme-aware variants
 * @position Inline within forms, toolbars, cards, dialogs
 *
 * SYNC: This component consumes ThemeContext for variant overrides.
 */
```

| Tag | Purpose |
|-----|---------|
| `@input` | Props the component accepts |
| `@output` | What the component renders |
| `@position` | Where the component is typically used in a layout |
| `SYNC` | Notes about dependencies or coordination with other parts of the system |

---

## Basic Component Template

```tsx
import {forwardRef, type HTMLAttributes, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorTokens, spacingTokens, radiusTokens} from '../theme/tokens.stylex';

const styles = stylex.create({
  base: {
    // Base styles using tokens
    fontFamily: 'inherit',
    borderWidth: 0,
    cursor: 'pointer',
  },
});

const variants = stylex.create({
  default: {
    backgroundColor: colorTokens.surface,
    color: colorTokens.textPrimary,
  },
  primary: {
    backgroundColor: colorTokens.accent,
    color: 'white',
  },
});

// Derive type from StyleX object
export type MyComponentVariant = keyof typeof variants;

export interface MyComponentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> {
  variant?: MyComponentVariant;
  children: ReactNode;
}

export const XDSMyComponent = forwardRef<HTMLDivElement, MyComponentProps>(
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

XDSMyComponent.displayName = 'XDSMyComponent';
```

### Key elements:

1. **`forwardRef`** — All components forward refs for parent access
2. **`stylex.create`** — Styles are static objects, compiled at build time
3. **Token imports** — Always use tokens, never hardcoded values
4. **`displayName`** — Set explicitly for React DevTools

---

## Type Derivation from StyleX Objects

Derive variant types directly from the StyleX object so types stay in sync with styles automatically:

```tsx
const variants = stylex.create({
  primary: { /* ... */ },
  secondary: { /* ... */ },
  ghost: { /* ... */ },
});

export type ButtonVariant = keyof typeof variants;
// Results in: 'primary' | 'secondary' | 'ghost'
```

When you add or remove a variant from the StyleX object, the type updates automatically. No manual type maintenance needed.

The same pattern works for sizes or any other variant dimension:

```tsx
const sizes = stylex.create({
  sm: { padding: spacingTokens.space1, fontSize: '14px' },
  md: { padding: spacingTokens.space2, fontSize: '16px' },
  lg: { padding: spacingTokens.space3, fontSize: '18px' },
});

export type ButtonSize = keyof typeof sizes;
// Results in: 'sm' | 'md' | 'lg'
```

---

## Token Usage

Always use tokens from `tokens.stylex` instead of hardcoded values:

```tsx
import {
  colorTokens,
  spacingTokens,
  radiusTokens,
  transitionTokens,
  typographyTokens,
  elevationTokens,
} from '../theme/tokens.stylex';

const styles = stylex.create({
  base: {
    backgroundColor: colorTokens.surface,
    padding: spacingTokens.space3,
    borderRadius: radiusTokens.element,
    fontFamily: typographyTokens.fontFamilyBody,
    transitionDuration: transitionTokens.fast,
    boxShadow: elevationTokens.base,
  },
});
```

### Token Reference

| Category | Tokens | Examples |
|----------|--------|----------|
| `colorTokens` | Semantic colors, text, icons, status, overlays, dividers | `accent`, `surface`, `textPrimary`, `textSecondary`, `hoverOverlay`, `pressedOverlay`, `focusOutline`, `negative`, `positive` |
| `spacingTokens` | Consistent spacing scale | `space0` (0px), `space0_5` (2px), `space1` (4px), `space2` (8px), `space3` (12px), `space4` (16px), `space5` (20px), `space6` (24px), `space7` (28px) |
| `radiusTokens` | Border radius for different contexts | `rounded`, `container`, `element`, `content` |
| `elevationTokens` | Box shadows | `base`, `thumb`, `dialog`, `hover`, `menu` |
| `transitionTokens` | Animation durations | `fast` (0.15s), `normal` (0.2s) |
| `typographyTokens` | Font families | `fontFamilyBody`, `fontFamilyCode`, `fontFamilyHeading` |

---

## The `xstyle` Prop Pattern

For components that need consumer-provided styles, use the `xstyle` prop. This ensures consumers use StyleX (maintaining compile-time optimization) instead of inline styles.

### Implementation

```tsx
import type {StyleXStyles} from '@stylexjs/stylex';

export interface MyComponentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'style' | 'className'> {
  /** StyleX styles to apply to the component. */
  xstyle?: StyleXStyles;
  children?: ReactNode;
}

export const XDSMyComponent = forwardRef<HTMLDivElement, MyComponentProps>(
  function XDSMyComponent({xstyle, children, ...props}, ref) {
    return (
      <div ref={ref} {...stylex.props(styles.base, xstyle)} {...props}>
        {children}
      </div>
    );
  },
);
```

### Key Points

1. **Omit `style` and `className`** — Use `Omit<HTMLAttributes<HTMLElement>, 'style' | 'className'>` to prevent inline styles and ensure StyleX usage.

2. **Merge order matters** — Pass `xstyle` as the last argument to `stylex.props()` so consumer styles override component defaults.

3. **Constrained vs. freeform**:
   - **Higher-level components** (Button, Card): Prefer constrained APIs with specific props (`variant`, `size`) over open `xstyle`. Enforces design consistency.
   - **Primitive/layout components** (Stack, Box): Allow freeform `xstyle` since these are building blocks that need flexibility.

### Consumer Usage

```tsx
import * as stylex from '@stylexjs/stylex';
import {colorTokens, radiusTokens} from '@xds/core';

const customStyles = stylex.create({
  highlight: {
    backgroundColor: colorTokens.wash,
    borderRadius: radiusTokens.element,
  },
});

// Single style
<XDSHStack gap="space2" xstyle={customStyles.highlight}>
  <Item />
</XDSHStack>

// Multiple styles via array
<XDSVStack xstyle={[styles.container, styles.padded]}>
  <Content />
</XDSVStack>
```

---

## Conditional Styles

Apply styles conditionally using `stylex.props`:

```tsx
{...stylex.props(
  styles.base,
  variants[variant],
  sizes[size],
  isDisabled && styles.disabled,
  isLoading && styles.loading,
  xstyle,  // Consumer override last
)}
```

StyleX merges these left-to-right. Later styles override earlier ones for the same property. `false`/`undefined` values are safely ignored.

---

## Pseudo-Selectors

StyleX supports pseudo-selectors via nested objects with `default` for the base state:

```tsx
const styles = stylex.create({
  interactive: {
    backgroundColor: {
      default: colorTokens.surface,
      ':hover': colorTokens.surfaceHover,
      ':active': colorTokens.surfaceActive,
    },
    outline: {
      default: 'none',
      ':focus-visible': `2px solid ${colorTokens.focusOutline}`,
    },
    outlineOffset: {
      default: null,
      ':focus-visible': '3px',
    },
  },
});
```

### Hover Guards for Touch Devices

**All `:hover` styles MUST use `@media (hover: hover)` guards** to prevent "sticky hover" on mobile/touch devices:

```tsx
const styles = stylex.create({
  interactive: {
    backgroundColor: {
      default: null,
      ':hover': {
        '@media (hover: hover)': colorTokens.hoverOverlay,
      },
      ':active': colorTokens.pressedOverlay,  // No guard needed for :active
    },
  },
});
```

- `:hover` — Always wrap in `@media (hover: hover)`
- `:active` — No guard needed (press feedback is good on touch)
- `:focus-visible` — No guard needed (keyboard focus must always work)

---

## Overlay Hover/Active Pattern

For interactive elements where hover/active colors should layer on top of the base background (not replace it), use `backgroundImage`:

```tsx
const variants = stylex.create({
  primary: {
    backgroundColor: colorTokens.accent,
    backgroundImage: {
      default: null,
      ':hover': {
        '@media (hover: hover)': `linear-gradient(${colorTokens.hoverOverlay}, ${colorTokens.hoverOverlay})`,
      },
      ':active': `linear-gradient(${colorTokens.pressedOverlay}, ${colorTokens.pressedOverlay})`,
    },
  },
});
```

**Why this works**: CSS `background-image` renders on top of `background-color`. By using a solid-color `linear-gradient` as the overlay, you get a semi-transparent tint over whatever the base color is — without needing a pseudo-element.

**Why not `::after`?** StyleX doesn't support combined pseudo-selectors like `:hover::after`, so this `backgroundImage` trick is the standard XDS pattern.

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

---

## Loading State Pattern

Pattern for components with loading indicators:

```tsx
const loadingStyles = stylex.create({
  loading: {
    position: 'relative',
    color: 'transparent', // Hide text while loading
  },
  spinnerContainer: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    animationName: stylex.keyframes({
      to: {transform: 'rotate(360deg)'},
    }),
    animationDuration: '0.6s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
});

// In component JSX:
<button
  ref={ref}
  {...stylex.props(
    styles.base,
    variants[variant],
    loading && loadingStyles.loading,
  )}
  disabled={disabled || loading}
  {...props}>
  {children}
  {loading && (
    <span {...stylex.props(loadingStyles.spinnerContainer)}>
      <Spinner {...stylex.props(loadingStyles.spinner)} />
    </span>
  )}
</button>
```

The key trick: set `color: 'transparent'` on the loading state to hide the text content while keeping the button's dimensions stable, then absolutely position the spinner on top.

---

## Animations

Use `stylex.keyframes` for animations. Define them inline within `stylex.create`:

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
  fadeIn: {
    animationName: stylex.keyframes({
      from: {opacity: 0},
      to: {opacity: 1},
    }),
    animationDuration: transitionTokens.normal,
    animationTimingFunction: 'ease-out',
  },
  slideDown: {
    animationName: stylex.keyframes({
      from: {
        opacity: 0,
        transform: 'translateY(-8px)',
      },
      to: {
        opacity: 1,
        transform: 'translateY(0)',
      },
    }),
    animationDuration: transitionTokens.normal,
    animationTimingFunction: 'ease-out',
  },
});
```

Use transition tokens (`transitionTokens.fast`, `transitionTokens.normal`) for durations to stay consistent with the theme.

---

## Theme Integration

### Module Augmentation

Components register their variant types with the theme system using TypeScript module augmentation:

```tsx
import type {StyleXStyles} from '../theme/types';

// Register this component's variants with the theme type
declare module '../theme/types' {
  interface ComponentStyles {
    button?: {
      variants?: Partial<Record<ButtonVariant, StyleXStyles>>;
    };
  }
}
```

This allows themes to provide variant overrides without circular imports.

### Consuming Theme Overrides

```tsx
import {useContext} from 'react';
import {ThemeContext} from '../theme/ThemeContext';

export const XDSButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({variant = 'primary', children, ...props}, ref) => {
    const themeContext = useContext(ThemeContext);
    const themeVariantOverride =
      themeContext?.theme.components?.button?.variants?.[variant];

    return (
      <button
        ref={ref}
        {...stylex.props(
          styles.base,
          variants[variant],
          themeVariantOverride, // Theme override applied last
        )}
        {...props}>
        {children}
      </button>
    );
  },
);
```

---

## Known StyleX Limitations

1. **No runtime `stylex.create()`** — All styles must be compiled at build time via the Babel plugin. You cannot dynamically create styles at runtime (e.g., in Storybook's `preview.tsx` or based on runtime values).

2. **Combined pseudo-selectors don't work** — `:hover::after` is not supported. Use the `backgroundImage` overlay pattern instead of `::after` pseudo-elements for hover/active effects.

3. **No `stylex.create` in non-compiled files** — The consuming app must handle the build for proper style deduping, merging, and bundling. Library code must be compiled by the consumer's build pipeline.

4. **Shorthand property limitations** — Some CSS shorthands behave differently. Prefer longhand properties (e.g., `paddingTop`, `paddingRight` instead of `padding`) when you need per-side control.

---

## Complete Example: Button

Putting it all together — here's how the patterns combine in a real component:

```tsx
/**
 * XDSButton — Primary interactive element for user actions.
 *
 * @input variant, size, disabled, loading, children
 * @output Styled <button> element with theme-aware variants
 * @position Inline within forms, toolbars, cards, dialogs
 *
 * SYNC: Consumes ThemeContext for variant overrides.
 */

import {forwardRef, useContext, type ButtonHTMLAttributes, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorTokens, spacingTokens, radiusTokens, transitionTokens} from '../theme/tokens.stylex';
import {ThemeContext} from '../theme/ThemeContext';
import type {StyleXStyles} from '../theme/types';

const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingTokens.space2,
    borderWidth: 0,
    borderRadius: radiusTokens.element,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transitionDuration: transitionTokens.fast,
    transitionProperty: 'background-color, transform, outline',
    transform: {
      default: null,
      ':active': 'scale(0.98)',
    },
  },
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
  },
});

const variants = stylex.create({
  primary: {
    backgroundColor: colorTokens.accent,
    color: 'white',
    backgroundImage: {
      default: null,
      ':hover': {
        '@media (hover: hover)': `linear-gradient(${colorTokens.hoverOverlay}, ${colorTokens.hoverOverlay})`,
      },
      ':active': `linear-gradient(${colorTokens.pressedOverlay}, ${colorTokens.pressedOverlay})`,
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
  secondary: { /* ... */ },
  ghost: { /* ... */ },
  destructive: { /* ... */ },
});

const sizes = stylex.create({
  sm: { padding: `${spacingTokens.space1} ${spacingTokens.space2}`, fontSize: '14px' },
  md: { padding: `${spacingTokens.space2} ${spacingTokens.space4}`, fontSize: '16px' },
  lg: { padding: `${spacingTokens.space3} ${spacingTokens.space5}`, fontSize: '18px' },
});

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

declare module '../theme/types' {
  interface ComponentStyles {
    button?: {
      variants?: Partial<Record<ButtonVariant, StyleXStyles>>;
    };
  }
}

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style' | 'className'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

export const XDSButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({variant = 'primary', size = 'md', loading, disabled, children, ...props}, ref) => {
    const themeContext = useContext(ThemeContext);
    const themeVariantOverride =
      themeContext?.theme.components?.button?.variants?.[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        {...stylex.props(
          styles.base,
          variants[variant],
          sizes[size],
          (disabled || loading) && styles.disabled,
          themeVariantOverride,
        )}
        {...props}>
        {children}
      </button>
    );
  },
);

XDSButton.displayName = 'XDSButton';
```

See `/packages/core/src/Button/XDSButton.tsx` for the full production implementation.
