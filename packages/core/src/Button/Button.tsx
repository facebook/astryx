/**
 * @file Button.tsx
 * @input Uses React forwardRef, ButtonHTMLAttributes, ReactNode
 * @output Exports Button component, ButtonProps, ButtonVariant types
 * @position Core implementation; consumed by index.ts, tested by Button.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Button/README.md (props table, features, implementation notes)
 * - /packages/core/src/Button/Button.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Button/index.ts (exports if types change)
 * - /apps/storybook/stories/Button.stories.tsx (storybook stories)
 */

import { forwardRef, useContext, type ButtonHTMLAttributes, type ReactNode } from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorTokens,
  spacingTokens,
  radiusTokens,
  transitionTokens,
  typographyTokens,
} from '../theme/tokens.stylex';
import { ThemeContext } from '../theme/ThemeContext';
import type { StyleXStyles } from '../theme/types';

/**
 * Base button styles
 */
const styles = stylex.create({
  base: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingTokens.space2,
    paddingBlock: spacingTokens.space2,
    paddingInline: spacingTokens.space3,
    borderWidth: 0,
    borderStyle: 'none',
    borderRadius: radiusTokens.element,
    fontFamily: typographyTokens.fontFamilyBody,
    fontSize: '0.875rem',
    lineHeight: 1.429,
    fontWeight: 500,
    cursor: 'pointer',
    transitionProperty: 'background-image, transform',
    transitionDuration: transitionTokens.fast,
    ':active': {
      transform: 'scale(0.98)',
    },
  },
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
    ':active': {
      transform: 'none',
    },
  },
});

/**
 * Variant styles using backgroundImage for layered colors
 * Overlay is stacked on top of base color using multiple linear-gradients
 * Focus outline color matches variant (destructive uses negative color)
 */
const variants = stylex.create({
  primary: {
    backgroundColor: colorTokens.accent,
    color: 'white',
    ':hover': {
      backgroundImage: `linear-gradient(${colorTokens.hoverOverlay}, ${colorTokens.hoverOverlay})`,
    },
    ':active': {
      backgroundImage: `linear-gradient(${colorTokens.pressedOverlay}, ${colorTokens.pressedOverlay})`,
    },
    ':focus-visible': {
      outline: `2px solid ${colorTokens.focusOutline}`,
      outlineOffset: '3px',
    },
  },
  secondary: {
    backgroundColor: colorTokens.deemphasized,
    color: colorTokens.textPrimary,
    ':hover': {
      backgroundImage: `linear-gradient(${colorTokens.hoverOverlay}, ${colorTokens.hoverOverlay})`,
    },
    ':active': {
      backgroundImage: `linear-gradient(${colorTokens.pressedOverlay}, ${colorTokens.pressedOverlay})`,
    },
    ':focus-visible': {
      outline: `2px solid ${colorTokens.focusOutline}`,
      outlineOffset: '3px',
    },
  },
  ghost: {
    backgroundColor: 'transparent',
    color: colorTokens.textPrimary,
    ':hover': {
      backgroundImage: `linear-gradient(${colorTokens.hoverOverlay}, ${colorTokens.hoverOverlay})`,
    },
    ':active': {
      backgroundImage: `linear-gradient(${colorTokens.pressedOverlay}, ${colorTokens.pressedOverlay})`,
    },
    ':focus-visible': {
      outline: `2px solid ${colorTokens.focusOutline}`,
      outlineOffset: '3px',
    },
  },
  destructive: {
    backgroundColor: colorTokens.negative,
    color: 'white',
    ':hover': {
      backgroundImage: `linear-gradient(${colorTokens.hoverOverlay}, ${colorTokens.hoverOverlay})`,
    },
    ':active': {
      backgroundImage: `linear-gradient(${colorTokens.pressedOverlay}, ${colorTokens.pressedOverlay})`,
    },
    ':focus-visible': {
      outline: `2px solid ${colorTokens.negative}`,
      outlineOffset: '3px',
    },
  },
});

/**
 * Button variant type derived from the variants StyleX object
 */
export type ButtonVariant = keyof typeof variants;

// =============================================================================
// Module Augmentation - Register Button's variant type with ComponentStyles
// =============================================================================
// This allows themes to provide type-safe variant overrides for Button
// without requiring theme/types.ts to import from Button (avoiding circular deps)

declare module '../theme/types' {
  interface ComponentStyles {
    button?: {
      variants?: Partial<Record<ButtonVariant, StyleXStyles>>;
    };
  }
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The visual style variant of the button.
   * @default 'primary'
   */
  variant?: ButtonVariant;
  /**
   * Whether the button is in a loading state.
   * @default false
   */
  loading?: boolean;
  /**
   * Content to render inside the button.
   */
  children: ReactNode;
}

/**
 * Loading state styles
 */
const loadingStyles = stylex.create({
  loading: {
    position: 'relative',
    color: 'transparent',
  },
  spinner: {
    position: 'absolute',
    width: '1em',
    height: '1em',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'currentColor',
    borderRightColor: 'transparent',
    borderRadius: '50%',
    animationName: stylex.keyframes({
      to: { transform: 'rotate(360deg)' },
    }),
    animationDuration: '0.6s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
  spinnerLight: {
    borderTopColor: 'white',
    borderLeftColor: 'white',
    borderBottomColor: 'white',
    borderRightColor: 'transparent',
  },
  spinnerDark: {
    borderTopColor: colorTokens.textPrimary,
    borderLeftColor: colorTokens.textPrimary,
    borderBottomColor: colorTokens.textPrimary,
    borderRightColor: 'transparent',
  },
});

/**
 * A versatile button component with multiple variants.
 *
 * Styles use XDS theme tokens via StyleX.
 * Wrap your app in <Theme> to apply a theme.
 * Themes can provide component-level variant overrides via theme.components.button.variants
 *
 * @example
 * ```tsx
 * <Button variant="primary">Click me</Button>
 * <Button variant="secondary" loading>Saving...</Button>
 * <Button variant="destructive">Delete</Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', loading = false, disabled, children, ...props }, ref) => {
    const isDisabled = disabled || loading;
    const useLightSpinner = variant === 'primary' || variant === 'destructive';

    // Get theme context for component-level overrides (optional)
    const themeContext = useContext(ThemeContext);
    const themeVariantOverride = themeContext?.theme.components?.button?.variants?.[variant];

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        {...stylex.props(
          styles.base,
          variants[variant],
          themeVariantOverride,
          isDisabled && styles.disabled,
          loading && loadingStyles.loading
        )}
        {...props}
      >
        {loading && (
          <span
            {...stylex.props(
              loadingStyles.spinner,
              useLightSpinner ? loadingStyles.spinnerLight : loadingStyles.spinnerDark
            )}
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
