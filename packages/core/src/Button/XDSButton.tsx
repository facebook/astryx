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
  useTransition,
  type ButtonHTMLAttributes,
  type ReactNode,
  type MouseEvent,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSTooltip} from '../Layer/XDSTooltip';
import {
  colorVars,
  sizeVars,
  spacingVars,
  radiusVars,
  transitionVars,
  textSizeVars,
  fontWeightVars,
  lineHeightVars,
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
    fontSize: textSizeVars['--text-base'],
    lineHeight: lineHeightVars['--leading-base'],
    fontWeight: fontWeightVars['--font-weight-medium'],
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

const sizeStyles = stylex.create({
  sm: {
    height: sizeVars['--size-sm'],
  },
  md: {
    height: sizeVars['--size-md'],
  },
  lg: {
    height: sizeVars['--size-lg'],
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

/**
 * Button size type derived from the sizeStyles StyleX object
 */
export type XDSButtonSize = keyof typeof sizeStyles;

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
  'children' | 'disabled'
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
   * The size of the button.
   * @default 'md'
   */
  size?: XDSButtonSize;
  /**
   * Whether the button is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether the button is in a loading state.
   * Shows a spinner and prevents re-triggering.
   * @default false
   */
  isLoading?: boolean;
  /**
   * Async action to perform on click. Wrapped in React transition.
   * Replaces onClick when provided - handle any click logic inside this action.
   * Button shows loading state while action is pending.
   * For links (href), navigation occurs after action completes.
   */
  onClickAction?: (
    e: MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  ) => void | Promise<void>;
  /**
   * If provided, renders as an anchor element instead of button.
   * When combined with onClickAction, navigation is deferred until action completes.
   */
  href?: string;
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
  /**
   * Tooltip text shown on hover.
   */
  tooltip?: string;
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
      size = 'md',
      isDisabled = false,
      isLoading = false,
      onClickAction,
      href,
      icon,
      onClick,
      children,
      tooltip,
      ...props
    },
    ref,
  ) => {
    // Track pending state for async actions
    const [isPending, startTransition] = useTransition();
    const isBusy = isLoading || isPending;
    const useLightSpinner = variant === 'primary' || variant === 'destructive';
    const isIconOnly = icon != null && children == null;

    // Get theme context for component-level overrides (optional)
    const themeContext = useContext(ThemeContext);
    const themeVariantOverride =
      themeContext?.theme.components?.button?.variants?.[variant];

    const handleClick = (
      e: MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
    ) => {
      // Don't re-trigger while an action is pending
      if (isBusy) {
        e.preventDefault();
        return;
      }

      // For links with actions, prevent navigation until action completes
      if (href && onClickAction) {
        e.preventDefault();
      }

      if (onClickAction) {
        // Use action - wraps in transition for async support
        startTransition(() => {
          const result = onClickAction(e);
          // For links, navigate after action completes (if async)
          if (href && result instanceof Promise) {
            result.then(() => {
              window.location.href = href;
            });
          } else if (href) {
            window.location.href = href;
          }
        });
      } else if (onClick) {
        onClick(e as MouseEvent<HTMLButtonElement>);
      }
    };

    const buttonContent = (
      <>
        {isBusy && (
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
      </>
    );

    const sharedProps = {
      'aria-label': isIconOnly ? label : undefined,
      'aria-busy': isBusy || undefined,
      'aria-disabled': isDisabled || isBusy || undefined,
      ...stylex.props(
        styles.base,
        sizeStyles[size],
        variants[variant],
        themeVariantOverride,
        isIconOnly && styles.iconOnly,
        (isDisabled || isBusy) && styles.disabled,
        isBusy && loadingStyles.loading,
      ),
    };

    // Render as anchor if href is provided
    let button;
    if (href) {
      button = (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          onClick={handleClick}
          {...sharedProps}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
          {buttonContent}
        </a>
      );
    } else {
      button = (
        <button
          ref={ref}
          disabled={isDisabled}
          onClick={handleClick}
          {...sharedProps}
          {...props}>
          {buttonContent}
        </button>
      );
    }

    if (tooltip) {
      return (
        <XDSTooltip content={tooltip} placement="above">
          {button}
        </XDSTooltip>
      );
    }

    return button;
  },
);

XDSButton.displayName = 'XDSButton';
