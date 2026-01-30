/**
 * @file XDSButton.tsx
 * @input Uses React forwardRef, ButtonHTMLAttributes, ReactNode
 * @output Exports XDSButton component, XDSButtonProps, XDSButtonVariant types
 * @position Core implementation; consumed by index.ts, tested by XDSButton.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Button/README.md (props table, features, implementation notes)
 * - /packages/core/src/Button/XDSButton.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Button/index.ts (exports if types change)
 * - /apps/storybook/stories/Button.stories.tsx (storybook stories)
 */

import {
  forwardRef,
  useContext,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  transitionVars,
} from '../theme/tokens.stylex';
import {ThemeContext} from '../theme/ThemeContext';

/**
 * Base button styles
 * Pseudo-classes are nested within properties per StyleX recommendation:
 * https://stylexjs.com/docs/learn/styling-ui/defining-styles#pseudo-classes
 */
const styles = stylex.create({
  base: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    borderWidth: 0,
    borderStyle: 'none',
    borderRadius: radiusVars['--radius-element'],
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    lineHeight: 1.429,
    fontWeight: 500,
    cursor: 'pointer',
    transitionProperty: 'background-image, transform',
    transitionDuration: transitionVars['--transition-fast'],
    transform: {
      default: 'scale(1)',
      ':active': 'scale(0.98)',
    },
  },
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
    transform: {
      default: null,
      ':active': null,
    },
  },
  iconOnly: {
    aspectRatio: '1 / 1',
    paddingInline: spacingVars['--spacing-2'],
  },
});

/**
 * Variant styles using backgroundImage for layered colors
 * Pseudo-classes are nested within properties per StyleX recommendation
 * Overlay is stacked on top of base color using multiple linear-gradients
 * Focus outline color matches variant (destructive uses negative color)
 */
const variants = stylex.create({
  primary: {
    backgroundColor: colorVars['--color-accent'],
    color: colorVars['--color-text-on-media'],
    backgroundImage: {
      default: null,
      ':hover': `linear-gradient(${colorVars['--color-hover-overlay']}, ${colorVars['--color-hover-overlay']})`,
      ':active': `linear-gradient(${colorVars['--color-pressed-overlay']}, ${colorVars['--color-pressed-overlay']})`,
    },
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-focus-outline']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '3px',
    },
  },
  secondary: {
    backgroundColor: colorVars['--color-deemphasized'],
    color: colorVars['--color-text-primary'],
    backgroundImage: {
      default: null,
      ':hover': `linear-gradient(${colorVars['--color-hover-overlay']}, ${colorVars['--color-hover-overlay']})`,
      ':active': `linear-gradient(${colorVars['--color-pressed-overlay']}, ${colorVars['--color-pressed-overlay']})`,
    },
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-focus-outline']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '3px',
    },
  },
  ghost: {
    backgroundColor: 'transparent',
    color: colorVars['--color-text-primary'],
    backgroundImage: {
      default: null,
      ':hover': `linear-gradient(${colorVars['--color-hover-overlay']}, ${colorVars['--color-hover-overlay']})`,
      ':active': `linear-gradient(${colorVars['--color-pressed-overlay']}, ${colorVars['--color-pressed-overlay']})`,
    },
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-focus-outline']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '3px',
    },
  },
  destructive: {
    backgroundColor: colorVars['--color-negative'],
    color: colorVars['--color-text-on-media'],
    backgroundImage: {
      default: null,
      ':hover': `linear-gradient(${colorVars['--color-hover-overlay']}, ${colorVars['--color-hover-overlay']})`,
      ':active': `linear-gradient(${colorVars['--color-pressed-overlay']}, ${colorVars['--color-pressed-overlay']})`,
    },
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-negative']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '3px',
    },
  },
});

/**
 * Button variant type derived from the variants StyleX object
 */
export type XDSButtonVariant = keyof typeof variants;

// =============================================================================
// Module Augmentation - Register Button's variant type with ComponentStyles
// =============================================================================
// This allows themes to provide type-safe variant overrides for Button
// without requiring theme/types.ts to import from Button (avoiding circular deps)

declare module '../theme/types' {
  interface ComponentStyles {
    button?: {
      variants?: Partial<Record<XDSButtonVariant, StyleXStyles>>;
    };
  }
}

export interface XDSButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  /**
   * Accessible label for the button (required for accessibility).
   * Used as visible text, or as aria-label for icon-only buttons.
   */
  label: string;
  /**
   * The visual style variant of the button.
   * @default 'secondary'
   */
  variant?: XDSButtonVariant;
  /**
   * Whether the button is in a loading state.
   * @default false
   */
  loading?: boolean;
  /**
   * Icon element to render in the button.
   * If provided without children, button becomes icon-only (square).
   */
  icon?: ReactNode;
  /**
   * Optional visible content. If omitted and icon is provided,
   * button becomes icon-only with label used as aria-label.
   */
  children?: ReactNode;
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
      to: {transform: 'rotate(360deg)'},
    }),
    animationDuration: '0.6s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
  spinnerLight: {
    borderTopColor: colorVars['--color-icon-on-media'],
    borderLeftColor: colorVars['--color-icon-on-media'],
    borderBottomColor: colorVars['--color-icon-on-media'],
    borderRightColor: 'transparent',
  },
  spinnerDark: {
    borderTopColor: colorVars['--color-text-primary'],
    borderLeftColor: colorVars['--color-text-primary'],
    borderBottomColor: colorVars['--color-text-primary'],
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
 * <XDSButton label="Click me" />
 * <XDSButton label="Primary action" variant="primary" />
 * <XDSButton label="Delete" variant="destructive" />
 * <XDSButton label="Settings" icon={<GearIcon />} />
 * ```
 */
export const XDSButton = forwardRef<HTMLButtonElement, XDSButtonProps>(
  (
    {
      label,
      variant = 'secondary',
      loading = false,
      icon,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const useLightSpinner = variant === 'primary' || variant === 'destructive';
    const isIconOnly = icon != null && children == null;

    // Get theme context for component-level overrides (optional)
    const themeContext = useContext(ThemeContext);
    const themeVariantOverride =
      themeContext?.theme.components?.button?.variants?.[variant];

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-label={isIconOnly ? label : undefined}
        {...stylex.props(
          styles.base,
          variants[variant],
          themeVariantOverride,
          isIconOnly && styles.iconOnly,
          isDisabled && styles.disabled,
          loading && loadingStyles.loading,
        )}
        {...props}>
        {loading && (
          <span
            {...stylex.props(
              loadingStyles.spinner,
              useLightSpinner
                ? loadingStyles.spinnerLight
                : loadingStyles.spinnerDark,
            )}
          />
        )}
        {icon}
        {children ?? (isIconOnly ? null : label)}
      </button>
    );
  },
);

XDSButton.displayName = 'XDSButton';
