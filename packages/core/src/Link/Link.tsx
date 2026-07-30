// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Link.tsx
 * @input Uses React, AnchorHTMLAttributes, ReactNode
 * @output Exports Link component, LinkProps
 * @position Core implementation; consumed by index.ts, tested by Link.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Link/Link.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Link/Link.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Link/index.ts (exports if types change)
 * - /apps/storybook/stories/Link.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/Link/ (showcase blocks)
 */

import type {ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';

import {
  colorVars,
  durationVars,
  easeVars,
  spacingVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {Icon} from '../Icon';
import {Tooltip} from '../Tooltip';
import {Text} from '../Text';
import {VisuallyHidden} from '../VisuallyHidden';
import type {
  TextType,
  TextSize,
  TextColor,
  TextWeight,
  TextDisplay,
} from '../theme/types';
import {useLinkComponent} from './useLinkComponent';
import type {LinkComponentType} from './types';
import {mergeProps} from '../utils';
import {computeTargetAndRel} from './computeTargetAndRel';
import {useInteractiveRole} from '../hooks/useInteractiveRole';
import {themeProps} from '../utils/themeProps';
import {useTranslator} from '../i18n';

/**
 * Base link styles
 */
const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-0-5'],
    fontFamily: 'inherit',
    fontSize: 'inherit',
    lineHeight: 'inherit',
    fontWeight: 'inherit',
    textDecoration: {
      default: 'none',
      ':hover': {
        '@media (hover: hover)': 'underline',
      },
    },
    cursor: 'pointer',
    transitionProperty: 'color, text-decoration',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '2px',
    },
  },
  /**
   * Reset styles for rendering as a <button> when href is undefined.
   * Strips all native button chrome so it looks identical to a link.
   */
  buttonReset: {
    backgroundColor: 'transparent',
    borderStyle: 'none',
    padding: 0,
    pointerEvents: 'auto',
    position: 'relative',
  },
  hasUnderline: {
    textDecoration: 'underline',
  },
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
    pointerEvents: 'none',
  },
  standalone: {
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
  },
});

/**
 * Link color styles — applied to the <a> element so the underline
 * and icon colors match the text color set by Text.
 */
const linkColorStyles = stylex.create({
  primary: {
    color: {
      default: colorVars['--color-text-primary'],
      ':hover': {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-text-primary']}, ${colorVars['--color-tint-hover']} 15%)`,
      },
    },
  },
  secondary: {
    color: {
      default: colorVars['--color-text-secondary'],
      ':hover': {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-text-secondary']}, ${colorVars['--color-tint-hover']} 15%)`,
      },
    },
  },
  disabled: {
    color: colorVars['--color-text-disabled'],
  },
  placeholder: {
    color: colorVars['--color-text-secondary'],
  },
  accent: {
    color: {
      default: colorVars['--color-text-accent'],
      ':hover': {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-text-accent']}, ${colorVars['--color-tint-hover']} 15%)`,
      },
    },
  },
  inherit: {
    color: 'inherit',
  },
});

export interface LinkProps extends BaseProps<
  HTMLAnchorElement | HTMLButtonElement
> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLAnchorElement | HTMLButtonElement>;
  /**
   * Custom component to render instead of `<a>`.
   * Overrides the provider-level default set by LinkProvider.
   * Must accept href, className, style, and children props.
   * Only used when href is provided.
   */
  as?: LinkComponentType;
  /**
   * Accessible label for the link.
   * Used as aria-label when content is not self-descriptive
   * (e.g. icon-only links). When children are text, this is
   * unnecessary — the link text itself serves as the label.
   */
  label?: string;
  /**
   * Link destination URL.
   * When undefined, renders as a `<button>` with link styling
   * for semantic correctness and accessibility.
   */
  href?: string;
  /**
   * Whether the link should always display an underline.
   * When false, underline only appears on hover.
   * @default false
   */
  hasUnderline?: boolean;
  /**
   * Whether the link is disabled.
   * A disabled link renders as a plain anchor without an href (and without
   * target/rel/onClick), so it cannot be focused or activated — no
   * navigation and no onClick, even via programmatic focus or assistive
   * technology activation.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether the link opens in a new tab with an external link icon.
   * When true, sets target="_blank" and rel="noopener noreferrer".
   * @default false
   */
  isExternalLink?: boolean;
  /**
   * Screen-reader text appended to an external link to announce that it opens
   * in a new tab (the visual icon is decorative). Override for localization.
   * @default '(opens in new tab)'
   */
  newTabLabel?: string;
  /**
   * Where to open the linked document.
   * Overridden to "_blank" when isExternalLink is true.
   */
  target?: string;
  /**
   * Link relationship (e.g. "noopener noreferrer").
   * Automatically includes "noopener noreferrer" when isExternalLink is true.
   */
  rel?: string;
  /**
   * Causes the browser to download the linked URL. A string value
   * specifies the suggested filename.
   */
  download?: string | boolean;
  /**
   * Referrer policy for the link.
   */
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  /**
   * Click handler. Fires before navigation (when href is set),
   * or as the primary action (when href is undefined).
   */
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  /**
   * Tooltip text to display on hover.
   */
  tooltip?: string;
  /**
   * Whether the link is standalone (not inline within text).
   * Applies base font sizing when true.
   * @default false
   */
  isStandalone?: boolean;
  /**
   * Semantic text type for Text. Determines base typography.
   *
   * Use `type="inherit"` for inline links inside an existing `Text` element so
   * the link adopts the surrounding text's size and line-height instead of
   * imposing its own (e.g. a link within a `large` paragraph).
   * @default 'body'
   */
  type?: TextType;
  /**
   * Explicit font size override. Forwarded to Text.
   */
  size?: TextSize;
  /**
   * Font weight override. Forwarded to Text.
   */
  weight?: TextWeight;
  /**
   * Text color. Forwarded to Text.
   * @default 'accent'
   */
  color?: TextColor;
  /**
   * Display type for Text. Forwarded to Text.
   * @default 'inline'
   */
  display?: TextDisplay;
  /**
   * Maximum lines before truncation. Forwarded to Text.
   * @default 0
   */
  maxLines?: number;
  /**
   * Link content (required).
   */
  children: ReactNode;
}

/**
 * Click handler for disabled links. The disabled anchor renders without an
 * href, so there is no navigation to block in practice; preventDefault is a
 * defensive guard against synthetic/programmatic clicks.
 */
function preventDefaultClick(event: React.MouseEvent<HTMLAnchorElement>): void {
  event.preventDefault();
}

/**
 * A styled anchor link component.
 *
 * Uses Text internally for typography styling.
 * Wrap your app in <Theme> to apply a theme.
 *
 * @example
 * ```
 * <Link href="/docs">Documentation</Link>
 * <Link href="https://github.com" isExternalLink>GitHub</Link>
 * <Link href="/settings" color="secondary">Settings</Link>
 * <Link href="/privacy" hasUnderline>Privacy Policy</Link>
 * <Link label="Close dialog" href="/home"><Icon icon="x" /></Link>
 * <Text type="large">
 *   Read our <Link href="/terms" type="inherit">terms</Link> first.
 * </Text>
 * ```
 */
export function Link({
  as,
  label,
  href,
  hasUnderline = false,
  isDisabled = false,
  isExternalLink = false,
  newTabLabel: newTabLabelFromProps,
  target: targetFromProps,
  onClick,
  tooltip,
  isStandalone = false,
  type = 'body',
  size,
  weight,
  color = 'accent',
  display = 'inline',
  maxLines = 0,
  children,
  rel: relFromProps,
  xstyle,
  className,
  style,
  ref,
  ...props
}: LinkProps) {
  const t = useTranslator();
  const newTabLabel = newTabLabelFromProps ?? t('@astryx.link.newTab');
  const LinkComponent = useLinkComponent(as);
  const role = useInteractiveRole({href, onClick, isDisabled});
  // Determine target and rel based on isExternalLink
  const {target, rel} = computeTargetAndRel(
    isExternalLink ? '_blank' : targetFromProps,
    relFromProps,
  );

  // When role resolves to 'button' (no href, or context-provided),
  // render as a <button> with link styling for semantic correctness.
  const renderAsButton =
    role === 'button' || (role === 'inert' && href == null);

  const sharedContent = (
    <>
      <Text
        type={type}
        size={size}
        weight={weight}
        color={color}
        display={display}
        maxLines={maxLines}>
        {children}
      </Text>
      {isExternalLink && !renderAsButton && (
        <>
          <Icon icon="externalLink" size="xsm" color="inherit" />
          <VisuallyHidden>{newTabLabel}</VisuallyHidden>
        </>
      )}
    </>
  );

  let linkElement: React.ReactElement;

  if (renderAsButton) {
    linkElement = (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        onClick={onClick}
        aria-label={label || undefined}
        aria-disabled={isDisabled || undefined}
        tabIndex={isDisabled ? -1 : undefined}
        disabled={isDisabled}
        {...mergeProps(
          themeProps('link', {color}),
          stylex.props(
            styles.base,
            styles.buttonReset,
            linkColorStyles[color],
            hasUnderline && styles.hasUnderline,
            isStandalone && styles.standalone,
            isDisabled && styles.disabled,
            xstyle,
          ),
          className,
          style,
        )}
        {...props}>
        {sharedContent}
      </button>
    );
  } else if (isDisabled) {
    // A disabled link renders as a plain <a> with no href: an href-less
    // anchor is not focusable and exposes no link affordance, so programmatic
    // focus + Enter, AT activation commands, and middle-click cannot navigate
    // or fire the consumer onClick. The router LinkComponent is deliberately
    // skipped — a disabled link performs no navigation, and custom router
    // links may require a live href. target/rel are omitted with the href.
    linkElement = (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        onClick={preventDefaultClick}
        aria-label={label || undefined}
        aria-disabled={true}
        tabIndex={-1}
        {...mergeProps(
          themeProps('link', {color}),
          stylex.props(
            styles.base,
            linkColorStyles[color],
            hasUnderline && styles.hasUnderline,
            isStandalone && styles.standalone,
            styles.disabled,
            xstyle,
          ),
          className,
          style,
        )}
        {...props}>
        {sharedContent}
      </a>
    );
  } else {
    linkElement = (
      <LinkComponent
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        aria-label={label || undefined}
        aria-disabled={isDisabled || undefined}
        tabIndex={isDisabled ? -1 : undefined}
        {...mergeProps(
          themeProps('link', {color}),
          stylex.props(
            styles.base,
            linkColorStyles[color],
            hasUnderline && styles.hasUnderline,
            isStandalone && styles.standalone,
            isDisabled && styles.disabled,
            xstyle,
          ),
          className,
          style,
        )}
        {...props}>
        {sharedContent}
      </LinkComponent>
    );
  }

  // Wrap with tooltip if provided
  if (tooltip) {
    return (
      <Tooltip content={tooltip} placement="above">
        {linkElement}
      </Tooltip>
    );
  }

  return linkElement;
}

Link.displayName = 'Link';
