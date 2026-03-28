'use client';

/**
 * @file XDSButton.tsx
 * @input Uses React, ButtonHTMLAttributes, ReactNode
 * @output Exports XDSButton component, XDSButtonProps, XDSButtonVariant types
 * @position Core implementation; consumed by index.ts, tested by XDSButton.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Button/Button.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Button/XDSButton.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Button/index.ts (exports if types change)
 * - /apps/storybook/stories/Button.stories.tsx (storybook stories)
 *
 * Last synced props: label, variant, size, isDisabled, isLoading, onClickAction, icon, children, tooltip, endContent, href, as, target, rel
 */

import {useRef, useTransition, type ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  sizeVars,
  spacingVars,
  radiusVars,
  durationVars,
  easeVars,
  fontWeightVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {XDSTooltip} from '../Tooltip/XDSTooltip';
import {XDSSpinner} from '../Spinner';

import {edgeCompensation} from '../Layout/edgeCompensation.stylex';
import {xdsClassName, mergeProps} from '../utils';
import {useXDSLinkComponent} from '../Link/useXDSLinkComponent';
import type {XDSLinkComponentType} from '../Link/types';

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
    '--button-radius': radiusVars['--radius-element'],
    borderRadius: 'var(--button-radius)',
    fontFamily: 'inherit',
    fontSize: typeScaleVars['--text-label-size'],
    lineHeight: typeScaleVars['--text-label-leading'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transitionProperty: 'background-image, transform',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
    transform: {
      default: 'scale(1)',
      ':active': 'scale(0.98)',
    },
  },
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
    backgroundImage: 'none',
    transform: {
      default: 'none',
      ':active': 'none',
    },
  },
  ariaDisabled: {
    backgroundImage: {
      default: 'none',
      ':hover': {
        '@media (hover: hover)': 'none',
      },
      ':active': 'none',
    },
  },
  iconOnly: {
    '--button-icon-only-aspect': '1 / 1',
    aspectRatio: 'var(--button-icon-only-aspect)',
    paddingInline: spacingVars['--spacing-2'],
  },
  endContentWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    color: 'inherit',
  },
  iconWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  contentWrapper: {
    display: 'contents',
  },
  labelText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
  link: {
    textDecoration: 'none',
  },
});

const sizeStyles = stylex.create({
  sm: {
    height: sizeVars['--size-element-sm'],
  },
  md: {
    height: sizeVars['--size-element-md'],
  },
  lg: {
    height: sizeVars['--size-element-lg'],
  },
});

/**
 * Icon size per button size.
 * Matches XDSIcon sizing: sm/md=16px, lg=20px.
 */
const iconSizeStyles = stylex.create({
  sm: {width: 16, height: 16, fontSize: 16},
  md: {width: 16, height: 16, fontSize: 16},
  lg: {width: 20, height: 20, fontSize: 20},
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
    color: colorVars['--color-on-accent'],
    backgroundImage: {
      default: null,
      ':hover': {
        '@media (hover: hover)': `linear-gradient(${colorVars['--color-overlay-hover']}, ${colorVars['--color-overlay-hover']})`,
      },
      ':active': `linear-gradient(${colorVars['--color-overlay-pressed']}, ${colorVars['--color-overlay-pressed']})`,
    },
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    '--button-focus-offset': '3px',
    outlineOffset: {
      default: '0',
      ':focus-visible': 'var(--button-focus-offset)',
    },
  },
  secondary: {
    backgroundColor: colorVars['--color-neutral'],
    color: colorVars['--color-text-primary'],
    backgroundImage: {
      default: null,
      ':hover': {
        '@media (hover: hover)': `linear-gradient(${colorVars['--color-overlay-hover']}, ${colorVars['--color-overlay-hover']})`,
      },
      ':active': `linear-gradient(${colorVars['--color-overlay-pressed']}, ${colorVars['--color-overlay-pressed']})`,
    },
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    '--button-focus-offset': '3px',
    outlineOffset: {
      default: '0',
      ':focus-visible': 'var(--button-focus-offset)',
    },
  },
  ghost: {
    backgroundColor: 'transparent',
    color: colorVars['--color-text-primary'],
    backgroundImage: {
      default: null,
      ':hover': {
        '@media (hover: hover)': `linear-gradient(${colorVars['--color-overlay-hover']}, ${colorVars['--color-overlay-hover']})`,
      },
      ':active': `linear-gradient(${colorVars['--color-overlay-pressed']}, ${colorVars['--color-overlay-pressed']})`,
    },
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    '--button-focus-offset': '3px',
    outlineOffset: {
      default: '0',
      ':focus-visible': 'var(--button-focus-offset)',
    },
  },
  destructive: {
    backgroundColor: colorVars['--color-error'],
    color: colorVars['--color-on-error'],
    backgroundImage: {
      default: null,
      ':hover': {
        '@media (hover: hover)': `linear-gradient(${colorVars['--color-overlay-hover']}, ${colorVars['--color-overlay-hover']})`,
      },
      ':active': `linear-gradient(${colorVars['--color-overlay-pressed']}, ${colorVars['--color-overlay-pressed']})`,
    },
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-error']}`,
    },
    '--button-focus-offset': '3px',
    outlineOffset: {
      default: '0',
      ':focus-visible': 'var(--button-focus-offset)',
    },
  },
});

/**
 * Extensible variant map for XDSButton.
 *
 * Theme packages can add custom variants via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@xds/core/Button' {
 *   interface XDSButtonVariantMap {
 *     'primary-muted': true;
 *   }
 * }
 * ```
 */
export interface XDSButtonVariantMap {
  primary: true;
  secondary: true;
  ghost: true;
  destructive: true;
}

/**
 * Button variant type derived from XDSButtonVariantMap.
 * Extensible via module augmentation of XDSButtonVariantMap.
 */
export type XDSButtonVariant = keyof XDSButtonVariantMap;

/**
 * Button size type derived from the sizeStyles StyleX object
 */
export type XDSButtonSize = keyof typeof sizeStyles;

export interface XDSButtonProps extends XDSBaseProps<HTMLButtonElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLButtonElement>;
  /** HTML button type attribute. @default 'button' */
  type?: 'button' | 'submit' | 'reset';
  /** HTML name attribute for form submission. */
  name?: string;
  /** HTML value attribute for form submission. */
  value?: string | number | readonly string[];
  /** Associates the button with a form element by ID. */
  form?: string;
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
   * Click handler. For async actions that should show a loading state,
   * use `onClickAction` instead.
   */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
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
   * Content rendered after the label text (badge, icon, chevron, etc.).
   * Ignored for icon-only buttons to preserve square aspect ratio.
   *
   * Wrapped in a container that inherits the button's text color,
   * so child elements match the button variant's color automatically.
   */
  endContent?: ReactNode;
  /**
   * Tooltip text shown on hover.
   */
  tooltip?: string;
  /**
   * When provided, renders the button as a link (`<a>` or custom component).
   * When the button is disabled, still renders as `<button>` regardless of href
   * (disabled links are an accessibility anti-pattern).
   */
  href?: string;
  /**
   * Custom link component to use when `href` is provided.
   * Overrides the provider-level default set by XDSLinkProvider.
   * Useful for Next.js `<Link>` or other router-aware components.
   */
  as?: XDSLinkComponentType;
  /**
   * HTML target attribute for the link. Only applies when `href` is provided.
   */
  target?: string;
  /**
   * HTML rel attribute for the link. Only applies when `href` is provided.
   */
  rel?: string;
}

/**
 * Loading state styles
 */
const loadingStyles = stylex.create({
  loading: {
    position: 'relative',
    color: 'transparent',
  },
  spinnerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
 * When `href` is provided (and the button is not disabled), renders as an `<a>`
 * element (or custom link component) with full button styling, enabling native
 * browser behaviors like right-click → open in new tab and Cmd+Click.
 *
 * @example
 * ```
 * <XDSButton label="Click me" />
 * <XDSButton label="Primary action" variant="primary" />
 * <XDSButton label="Delete" variant="destructive" />
 * <XDSButton label="Settings" icon={<GearIcon />} variant="ghost" />
 * <XDSButton label="Pick emoji" icon={<span>🚀</span>} variant="ghost" size="sm" />
 * <XDSButton label="Edit" icon={<PencilIcon />}>Edit</XDSButton>
 * <XDSButton label="Messages" endContent={<XDSBadge label={3} />} />
 * <XDSButton label="Edit" icon={<PencilIcon />} endContent={<XDSBadge label="New" />}>Edit</XDSButton>
 * <XDSButton label="Visit site" href="https://example.com" variant="primary" />
 * <XDSButton label="Open in new tab" href="https://example.com" target="_blank" rel="noopener noreferrer" />
 * ```
 */
export function XDSButton({
  label,
  variant = 'secondary',
  size = 'md',
  type = 'button',
  isDisabled = false,
  isLoading = false,
  onClickAction,
  icon,
  children,
  endContent,
  tooltip,
  href,
  as,
  target,
  rel,
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSButtonProps): ReactNode {
  const [isPending, startTransition] = useTransition();
  const actionInFlightRef = useRef(false);
  const isLoadingState = isLoading || isPending;
  const buttonDisabled = isDisabled || isLoadingState;
  const useLightSpinner = variant === 'primary' || variant === 'destructive';
  const isIconOnly = icon != null && children == null;
  const LinkComponent = useXDSLinkComponent(as);

  // Render as link when href is provided and button is not disabled.
  // Disabled links are an accessibility anti-pattern — fall back to <button>.
  const renderAsLink = href != null && !buttonDisabled;

  // Use aria-disabled when tooltip is present so the button remains focusable
  // for keyboard users to reach the tooltip. Otherwise use native disabled.
  const useAriaDisabled = tooltip != null && buttonDisabled;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (buttonDisabled || actionInFlightRef.current) {
      e.preventDefault();
      return;
    }
    props.onClick?.(e);
    if (onClickAction && !e.defaultPrevented) {
      actionInFlightRef.current = true;
      startTransition(async () => {
        try {
          await onClickAction(e);
        } finally {
          actionInFlightRef.current = false;
        }
      });
    }
  };

  // When aria-disabled, suppress activation keys (Enter/Space) but allow
  // other keys (Escape, arrows) to reach consumer handlers.
  const handleKeyDown = useAriaDisabled
    ? (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
        } else {
          props.onKeyDown?.(e);
        }
      }
    : undefined;

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

  // Shared StyleX props for both button and link rendering
  const sharedStylexProps = stylex.props(
    styles.base,
    sizeStyles[size],
    variants[variant],
    isIconOnly && styles.iconOnly,
    buttonDisabled && styles.disabled,
    useAriaDisabled && styles.ariaDisabled,
    isLoadingState && loadingStyles.loading,
    edgePaddingSignal,
    edgeCompStyle,
    renderAsLink && styles.link,
    xstyle,
  );

  const sharedMergedProps = mergeProps(
    xdsClassName('button', {variant, size}),
    sharedStylexProps,
    className,
    style,
  );

  const buttonContent = (
    <>
      {isLoadingState && (
        <span
          {...stylex.props(loadingStyles.spinnerOverlay)}
          aria-hidden="true">
          <XDSSpinner
            size="sm"
            shade={useLightSpinner ? 'onMedia' : 'default'}
          />
        </span>
      )}
      <span
        {...stylex.props(styles.contentWrapper)}
        aria-hidden={isLoadingState || undefined}>
        {icon && (
          <span
            {...stylex.props(styles.iconWrapper, iconSizeStyles[size])}>
            {icon}
          </span>
        )}
        {isIconOnly ? null : (
          <span {...stylex.props(styles.labelText)}>{children ?? label}</span>
        )}
        {!isIconOnly && endContent && (
          <span {...stylex.props(styles.endContentWrapper)}>{endContent}</span>
        )}
      </span>
      {/* Live region for loading state announcements */}
      <span
        {...stylex.props(styles.visuallyHidden)}
        role="status"
        aria-live="polite">
        {isLoadingState ? 'Loading' : ''}
      </span>
    </>
  );

  const ariaLabelProp =
    (isIconOnly && label !== '') || (isLoadingState && !isIconOnly)
      ? {'aria-label': label}
      : null;

  let element: ReactNode;

  if (renderAsLink) {
    element = (
      <LinkComponent
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel}
        {...sharedMergedProps}
        {...props}
        {...ariaLabelProp}
        onClick={handleClick}>
        {buttonContent}
      </LinkComponent>
    );
  } else {
    element = (
      <button
        ref={ref}
        type={type}
        disabled={useAriaDisabled ? undefined : buttonDisabled}
        {...sharedMergedProps}
        {...props}
        {...ariaLabelProp}
        aria-busy={isLoadingState || undefined}
        aria-disabled={useAriaDisabled || undefined}
        onClick={handleClick}
        {...(handleKeyDown ? {onKeyDown: handleKeyDown} : null)}>
        {buttonContent}
      </button>
    );
  }

  if (tooltip) {
    return (
      <XDSTooltip content={tooltip} placement="above">
        {element}
      </XDSTooltip>
    );
  }

  return element;
}

XDSButton.displayName = 'XDSButton';
