/**
 * @file XDSButton.tsx
 * @input Uses React, forwardRef, ButtonHTMLAttributes, ReactNode
 * @output Exports XDSButton component, XDSButtonProps, XDSButtonVariant types
 * @position Core implementation; consumed by index.ts, tested by XDSButton.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Button/README.md (props table, features, implementation notes)
 * - /packages/core/src/Button/XDSButton.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Button/index.ts (exports if types change)
 * - /apps/storybook/stories/Button.stories.tsx (storybook stories)
 *
 * Last synced props: label, variant, size, isDisabled, isLoading, onClickAction, icon, children, tooltip, endSlot
 */

'use client';

import {
  forwardRef,
  useContext,
  useTransition,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
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
import {XDSTooltip} from '../Layer/XDSTooltip';
import {XDSSpinner} from '../Spinner';
import type {XDSIconProps} from '../Icon/XDSIcon';
import type {XDSBadgeProps} from '../Badge/XDSBadge';
import {edgeCompensation} from '../Layout/edgeCompensation.stylex';

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
  endSlotWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    color: 'inherit',
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
      ':hover': {
        '@media (hover: hover)': `linear-gradient(${colorVars['--color-hover-overlay']}, ${colorVars['--color-hover-overlay']})`,
      },
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
      ':hover': {
        '@media (hover: hover)': `linear-gradient(${colorVars['--color-hover-overlay']}, ${colorVars['--color-hover-overlay']})`,
      },
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
      ':hover': {
        '@media (hover: hover)': `linear-gradient(${colorVars['--color-hover-overlay']}, ${colorVars['--color-hover-overlay']})`,
      },
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
      ':hover': {
        '@media (hover: hover)': `linear-gradient(${colorVars['--color-hover-overlay']}, ${colorVars['--color-hover-overlay']})`,
      },
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
   * @default false
   */
  isLoading?: boolean;
  /**
   * Async click action. Shows loading state while pending.
   */
  onClickAction?: (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => void | Promise<void>;
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
   * Content rendered after the label text.
   * Only accepts `<XDSIcon>` or `<XDSBadge>` elements.
   * Ignored for icon-only buttons to preserve square aspect ratio.
   *
   * The endSlot is wrapped in a container that inherits the button's text
   * color, so `<XDSIcon>` elements will match the button variant's color
   * (e.g., white on primary/destructive) without needing an explicit
   * `color` prop.
   */
  endSlot?: ReactElement<XDSIconProps> | ReactElement<XDSBadgeProps>;
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
});

/**
 * Edge compensation: publish the component's own inline padding so the
 * compensation formula can read it. This is separate from the base padding
 * styles so themes can override button padding independently and
 * compensation stays in sync.
 */
const edgeCompStyles = stylex.create({
  paddingInline2: {
    '--component-padding-inline': spacingVars['--spacing-2'],
  },
  paddingInline3: {
    '--component-padding-inline': spacingVars['--spacing-3'],
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
 * ```
 * <XDSButton label="Click me" />
 * <XDSButton label="Primary action" variant="primary" />
 * <XDSButton label="Delete" variant="destructive" />
 *
 * // Icon-only (square) — pass icon without children
 * <XDSButton label="Settings" icon={<GearIcon />} variant="ghost" />
 * <XDSButton label="Pick emoji" icon={<span>🚀</span>} variant="ghost" size="sm" />
 *
 * // Icon + visible label
 * <XDSButton label="Edit" icon={<PencilIcon />}>Edit</XDSButton>
 *
 * // With endSlot (badge or icon)
 * <XDSButton label="Messages" endSlot={<XDSBadge>3</XDSBadge>} />
 * <XDSButton label="Edit" icon={<PencilIcon />} endSlot={<XDSBadge>New</XDSBadge>}>Edit</XDSButton>
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
      icon,
      children,
      endSlot,
      tooltip,
      ...props
    },
    ref,
  ): ReactElement => {
    const [isPending, startTransition] = useTransition();
    const isLoadingState = isLoading || isPending;
    const buttonDisabled = isDisabled || isLoadingState;
    const useLightSpinner = variant === 'primary' || variant === 'destructive';
    const isIconOnly = icon != null && children == null;

    // Get theme context for component-level overrides (optional)
    const themeContext = useContext(ThemeContext);
    const themeVariantOverride =
      themeContext?.theme.components?.button?.variants?.[variant];

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onClickAction) {
        e.preventDefault();
        startTransition(async () => {
          await onClickAction(e);
        });
      }
      props.onClick?.(e);
    };

    // Ghost buttons opt into edge compensation — they self-adjust margins
    // when placed at container edges (e.g., TopNav endContent).
    // The component publishes its own inline padding via --component-padding-inline
    // so the compensation formula stays theme-safe.
    const isFlat = variant === 'ghost';
    const edgeCompStyle = isFlat ? edgeCompensation.self : null;
    const edgePaddingSignal = isFlat
      ? isIconOnly
        ? edgeCompStyles.paddingInline2
        : edgeCompStyles.paddingInline3
      : null;

    const button = (
      <button
        ref={ref}
        disabled={buttonDisabled}
        aria-label={isIconOnly ? label : undefined}
        aria-busy={isLoadingState || undefined}
        {...stylex.props(
          styles.base,
          sizeStyles[size],
          variants[variant],
          themeVariantOverride,
          isIconOnly && styles.iconOnly,
          buttonDisabled && styles.disabled,
          isLoadingState && loadingStyles.loading,
          edgePaddingSignal,
          edgeCompStyle,
        )}
        {...props}
        onClick={handleClick}>
        {isLoadingState && (
          <span
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <XDSSpinner
              size="sm"
              shade={useLightSpinner ? 'onMedia' : 'default'}
            />
          </span>
        )}
        {icon}
        {children ?? (isIconOnly ? null : label)}
        {!isIconOnly && endSlot && (
          <span {...stylex.props(styles.endSlotWrapper)}>{endSlot}</span>
        )}
      </button>
    );

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
