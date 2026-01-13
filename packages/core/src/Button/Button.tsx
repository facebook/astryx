import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorTokens,
  spacingTokens,
  radiusTokens,
  transitionTokens,
  typographyTokens,
} from '../theme/tokens.stylex';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The visual style variant of the button.
   * @default 'primary'
   */
  variant?: ButtonVariant;
  /**
   * The size of the button.
   * @default 'md'
   */
  size?: ButtonSize;
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
 * Base button styles
 */
const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingTokens.space2,
    borderWidth: 0,
    borderStyle: 'none',
    borderRadius: radiusTokens.element,
    fontFamily: typographyTokens.fontFamilyBody,
    fontWeight: 500,
    cursor: 'pointer',
    transitionProperty: 'background-color, box-shadow',
    transitionDuration: transitionTokens.fast,
  },
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
  },
  focusVisible: {
    outline: `2px solid ${colorTokens.focusOutline}`,
    outlineOffset: '2px',
  },
});

/**
 * Variant styles
 */
const variants = stylex.create({
  primary: {
    backgroundColor: colorTokens.accent,
    color: 'white',
  },
  primaryHover: {
    filter: 'brightness(1.1)',
  },
  primaryActive: {
    filter: 'brightness(0.95)',
  },
  secondary: {
    backgroundColor: colorTokens.deemphasized,
    color: colorTokens.textPrimary,
  },
  secondaryHover: {
    backgroundColor: colorTokens.hoverOverlay,
  },
  secondaryActive: {
    backgroundColor: colorTokens.pressedOverlay,
  },
  ghost: {
    backgroundColor: 'transparent',
    color: colorTokens.accentText,
  },
  ghostHover: {
    backgroundColor: colorTokens.hoverOverlay,
  },
  ghostActive: {
    backgroundColor: colorTokens.pressedOverlay,
  },
});

/**
 * Size styles
 */
const sizes = stylex.create({
  sm: {
    paddingBlock: spacingTokens.space1,
    paddingInline: spacingTokens.space2,
    fontSize: '0.75rem',
    lineHeight: 1.333,
  },
  md: {
    paddingBlock: spacingTokens.space2,
    paddingInline: spacingTokens.space3,
    fontSize: '0.875rem',
    lineHeight: 1.429,
  },
  lg: {
    paddingBlock: spacingTokens.space3,
    paddingInline: spacingTokens.space4,
    fontSize: '1rem',
    lineHeight: 1.25,
  },
});

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
  spinnerPrimary: {
    borderTopColor: 'white',
    borderLeftColor: 'white',
    borderBottomColor: 'white',
    borderRightColor: 'transparent',
  },
  spinnerSecondary: {
    borderTopColor: colorTokens.textPrimary,
    borderLeftColor: colorTokens.textPrimary,
    borderBottomColor: colorTokens.textPrimary,
    borderRightColor: 'transparent',
  },
});

/**
 * A versatile button component with multiple variants and sizes.
 *
 * Styles use XDS theme tokens via StyleX.
 * Wrap your app in <Theme> to apply a theme.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md">Click me</Button>
 * <Button variant="secondary" loading>Saving...</Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        {...stylex.props(
          styles.base,
          sizes[size],
          variants[variant],
          isDisabled && styles.disabled,
          loading && loadingStyles.loading
        )}
        {...props}
      >
        {loading && (
          <span
            {...stylex.props(
              loadingStyles.spinner,
              variant === 'primary'
                ? loadingStyles.spinnerPrimary
                : loadingStyles.spinnerSecondary
            )}
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
