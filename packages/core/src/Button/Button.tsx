// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Button.tsx
 * @input Uses React, ButtonHTMLAttributes, ReactNode
 * @output Exports Button component, ButtonProps, ButtonVariant types
 * @position Core implementation; consumed by index.ts, tested by Button.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Button/Button.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Button/Button.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Button/index.ts (exports if types change)
 * - /apps/storybook/stories/Button.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/Button/ (showcase blocks)
 *
 * Last synced props: label, variant, size, isDisabled, isLoading, clickAction, icon, isIconOnly, children, tooltip, endContent, href, as, target, rel
 */

import {useRef, useTransition, type ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  sizeVars,
  spacingVars,
  radiusVars,
  borderVars,
  durationVars,
  easeVars,
  fontWeightVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {Tooltip} from '../Tooltip/Tooltip';
import {Spinner} from '../Spinner';

import {EDGE_COMP_ATTR} from '../Layout/edgeCompensation.stylex';
import {useSize} from '../SizeContext/SizeContext';
import {useButtonGroup} from '../ButtonGroup/ButtonGroupContext';
import {mergeProps} from '../utils';
import {useLinkComponent} from '../Link/useLinkComponent';
import type {LinkComponentType} from '../Link/types';
import {themeProps} from '../utils/themeProps';

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

    borderRadius: `var(--_button-radius, ${radiusVars['--radius-element']})`,
    fontFamily: 'inherit',
    fontSize: typeScaleVars['--text-label-size'],
    lineHeight: typeScaleVars['--text-label-leading'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transitionProperty:
      'background-image, background-color, color, opacity, transform',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  pressable: {
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
    paddingInline: 0,
    paddingBlock: 0,
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
 * Matches Icon sizing: sm/md=16px, lg=20px.
 * fontSize is set so emoji and text-based icons scale correctly.
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
 * Extensible variant map for Button.
 *
 * Theme packages can add custom variants via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@astryxdesign/core/Button' {
 *   interface ButtonVariantMap {
 *     'primary-muted': true;
 *   }
 * }
 * ```
 */
export interface ButtonVariantMap {
  primary: true;
  secondary: true;
  ghost: true;
  destructive: true;
}

/**
 * Button variant type derived from ButtonVariantMap.
 * Extensible via module augmentation of ButtonVariantMap.
 */
export type ButtonVariant = keyof ButtonVariantMap;

/**
 * Button size type derived from the sizeStyles StyleX object
 */
export type ButtonSize = keyof typeof sizeStyles;

export interface ButtonProps extends BaseProps<HTMLButtonElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLButtonElement>;
  /** HTML button type attribute. @default 'button' */
  type?: 'button' | 'submit' | 'reset';
  /** HTML name attribute for form submission. */
  name?: string;
  /** HTML value attribute for form submission. */
  value?: string | number | ReadonlyArray<string>;
  /** Associates the button with a form element by ID. */
  form?: string;
  /**
   * Accessible label for the button (required for accessibility).
   * Rendered as visible text by default. When `isIconOnly` is true,
   * used as aria-label instead.
   */
  label: string;
  /**
   * The visual style variant of the button.
   * @default 'secondary'
   */
  variant?: ButtonVariant;
  /**
   * The size of the button.
   * @default 'md'
   */
  size?: ButtonSize;
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
   * use `clickAction` instead.
   */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /**
   * Async click action. Shows loading state while pending.
   */
  clickAction?: (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => void | Promise<void>;
  /**
   * Icon element rendered before the label text.
   */
  icon?: ReactNode;
  /**
   * When true, renders as a square icon-only button with `label` as aria-label.
   * Requires `icon` to be provided.
   * @default false
   */
  isIconOnly?: boolean;
  /**
   * Optional visible content. When provided, rendered instead of `label` as the
   * visible text (label still serves as the accessible name via aria-label).
   */
  children?: ReactNode;
  /**
   * Content rendered after the label text (badge, icon, chevron, etc.).
   * Ignored when `isIconOnly` is true to preserve square aspect ratio.
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
   * Overrides the provider-level default set by LinkProvider.
   * Useful for Next.js `<Link>` or other router-aware components.
   */
  as?: LinkComponentType;
  /**
   * HTML target attribute for the link. Only applies when `href` is provided.
   */
  target?: string;
  /**
   * HTML rel attribute for the link. Only applies when `href` is provided.
   */
  rel?: string;
}

const loadingStyles = stylex.create({
  // Hide the button's own content while the spinner overlay is shown. Applied
  // to the content wrapper (not the button) so the button keeps its variant
  // foreground color, which the spinner inherits via shade="inherit" (#2717).
  hiddenContent: {
    color: 'transparent',
  },
  spinnerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'grid',
    placeItems: 'center',
  },
});

const groupStyles = stylex.create({
  horizontal: {
    borderStartStartRadius: {
      default: 0,
      ':first-child': radiusVars['--radius-element'],
    },
    borderEndStartRadius: {
      default: 0,
      ':first-child': radiusVars['--radius-element'],
    },
    borderStartEndRadius: {
      default: 0,
      ':last-child': radiusVars['--radius-element'],
    },
    borderEndEndRadius: {
      default: 0,
      ':last-child': radiusVars['--radius-element'],
    },
    borderInlineStartWidth: {
      default: borderVars['--border-width'],
      ':first-child': 0,
    },
    borderInlineStartStyle: {
      default: 'solid' as const,
      ':first-child': 'none' as const,
    },
    borderInlineStartColor: colorVars['--color-border'],
  },
  vertical: {
    borderStartStartRadius: {
      default: 0,
      ':first-child': radiusVars['--radius-element'],
    },
    borderStartEndRadius: {
      default: 0,
      ':first-child': radiusVars['--radius-element'],
    },
    borderEndStartRadius: {
      default: 0,
      ':last-child': radiusVars['--radius-element'],
    },
    borderEndEndRadius: {
      default: 0,
      ':last-child': radiusVars['--radius-element'],
    },
    borderBlockStartWidth: {
      default: borderVars['--border-width'],
      ':first-child': 0,
    },
    borderBlockStartStyle: {
      default: 'solid' as const,
      ':first-child': 'none' as const,
    },
    borderBlockStartColor: colorVars['--color-border'],
  },
  onSolidHorizontal: {
    borderInlineStartColor: colorVars['--color-on-accent'],
  },
  onSolidVertical: {
    borderBlockStartColor: colorVars['--color-on-accent'],
  },
});

/**
 * A versatile button component with multiple variants.
 *
 * Styles use Astryx theme tokens via StyleX.
 * Wrap your app in <Theme> to apply a theme.
 * Themes can provide component-level variant overrides via theme.components.button.variants
 *
 * When `href` is provided (and the button is not disabled), renders as an `<a>`
 * element (or custom link component) with full button styling, enabling native
 * browser behaviors like right-click → open in new tab and Cmd+Click.
 *
 * @example
 * ```
 * <Button label="Click me" />
 * <Button label="Primary action" variant="primary" />
 * <Button label="Delete" variant="destructive" />
 * <Button label="Settings" icon={<GearIcon />} variant="ghost" isIconOnly />
 * <Button label="Pick emoji" icon={<span>🚀</span>} variant="ghost" size="sm" isIconOnly />
 * <Button label="Edit" icon={<PencilIcon />} />
 * <Button label="Messages" endContent={<Badge label={3} />} />
 * <Button label="Edit" icon={<PencilIcon />} endContent={<Badge label="New" />} />
 * <Button label="Visit site" href="https://example.com" variant="primary" />
 * <Button label="Open in new tab" href="https://example.com" target="_blank" rel="noopener noreferrer" />
 * ```
 */
export function Button({
  label,
  variant = 'secondary',
  size: sizeProp,
  type = 'button',
  isDisabled = false,
  isLoading = false,
  clickAction,
  icon,
  isIconOnly = false,
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
}: ButtonProps): ReactNode {
  const size = useSize(sizeProp, 'md');
  const buttonGroup = useButtonGroup();

  const [isPending, startTransition] = useTransition();
  // clickAction is fire-once (submit/save/pay), so a same-tick double-click must
  // dedupe — which neither isPending nor useOptimistic do. Hence the ref guard.
  const actionInFlightRef = useRef(false);
  const isLoadingState = isLoading || isPending;
  const groupDisabled = buttonGroup?.isDisabled ?? false;
  const buttonDisabled = isDisabled || groupDisabled || isLoadingState;
  // isIconOnly prop is the source of truth for icon-only rendering.
  // When false (default), label is always rendered as visible text.

  const LinkComponent = useLinkComponent(as);

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
    if (clickAction && !e.defaultPrevented) {
      actionInFlightRef.current = true;
      startTransition(async () => {
        try {
          await clickAction(e);
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

  // Ghost buttons are edge-compensatable — containers detect this attribute
  // via :has() and pull their own slot margins to align flush at edges.
  const isFlat = variant === 'ghost';
  const edgeCompAttr = isFlat ? {[EDGE_COMP_ATTR]: ''} : null;

  // Shared StyleX props for both button and link rendering
  const sharedStylexProps = stylex.props(
    styles.base,
    sizeStyles[size],
    variants[variant],
    isIconOnly && styles.iconOnly,
    buttonDisabled && styles.disabled,
    useAriaDisabled && styles.ariaDisabled,
    renderAsLink && styles.link,
    !buttonGroup && styles.pressable,
    buttonGroup &&
      (buttonGroup.orientation === 'horizontal'
        ? groupStyles.horizontal
        : groupStyles.vertical),
    buttonGroup &&
      (variant === 'primary' || variant === 'destructive') &&
      (buttonGroup.orientation === 'horizontal'
        ? groupStyles.onSolidHorizontal
        : groupStyles.onSolidVertical),
    xstyle,
  );

  const sharedMergedProps = mergeProps(
    themeProps('button', {variant, size}),
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
          <Spinner size="sm" shade="inherit" />
        </span>
      )}
      <span
        {...stylex.props(
          styles.contentWrapper,
          isLoadingState && loadingStyles.hiddenContent,
        )}
        aria-hidden={isLoadingState || undefined}>
        {icon && (
          <span {...stylex.props(styles.iconWrapper, iconSizeStyles[size])}>
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

  // aria-label is set when:
  // 1. Icon-only mode (label is the only accessible name)
  // 2. Loading state on non-icon-only (announce the button's purpose)
  // 3. Children differ from label (children are visible, label is accessible name)
  const needsAriaLabel =
    (isIconOnly && label !== '') ||
    (isLoadingState && !isIconOnly) ||
    (children != null && children !== label);
  const ariaLabelProp = needsAriaLabel ? {'aria-label': label} : null;

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
        {...edgeCompAttr}
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
        {...edgeCompAttr}
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
      <Tooltip content={tooltip} placement="above">
        {element}
      </Tooltip>
    );
  }

  return element;
}

Button.displayName = 'Button';
