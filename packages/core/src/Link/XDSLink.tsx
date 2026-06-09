// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSLink.tsx
 * @input Uses React, AnchorHTMLAttributes, ReactNode
 * @output Exports XDSLink component, XDSLinkProps
 * @position Core implementation; consumed by index.ts, tested by XDSLink.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Link/Link.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Link/XDSLink.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Link/index.ts (exports if types change)
 * - /apps/storybook/stories/Link.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/Link/ (showcase blocks)
 */

import type {ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import * as stylex from '@stylexjs/stylex';

import {
  colorVars,
  durationVars,
  easeVars,
  spacingVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {XDSIcon} from '../Icon';
import {XDSTooltip} from '../Tooltip';
import {XDSText} from '../Text';
import type {
  XDSTextType,
  XDSTextSize,
  XDSTextColor,
  XDSTextWeight,
  XDSTextDisplay,
} from '../theme/types';
import {useXDSLinkComponent} from './useXDSLinkComponent';
import type {XDSLinkComponentType} from './types';
import {xdsClassName, mergeProps} from '../utils';
import {computeTargetAndRel} from './computeTargetAndRel';

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
 * and icon colors match the text color set by XDSText.
 */
const linkColorStyles = stylex.create({
  primary: {
    color: colorVars['--color-text-primary'],
  },
  secondary: {
    color: colorVars['--color-text-secondary'],
  },
  disabled: {
    color: colorVars['--color-text-disabled'],
  },
  placeholder: {
    color: colorVars['--color-text-secondary'],
  },
  active: {
    color: colorVars['--color-text-accent'],
  },
  inherit: {
    color: 'inherit',
  },
});

export interface XDSLinkProps extends XDSBaseProps<
  HTMLAnchorElement | HTMLButtonElement
> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLAnchorElement | HTMLButtonElement>;
  /**
   * Custom component to render instead of `<a>`.
   * Overrides the provider-level default set by XDSLinkProvider.
   * Must accept href, className, style, and children props.
   * Only used when href is provided.
   */
  as?: XDSLinkComponentType;
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
   * Semantic text type for XDSText. Determines base typography.
   * @default 'body'
   */
  type?: XDSTextType;
  /**
   * Explicit font size override. Forwarded to XDSText.
   */
  size?: XDSTextSize;
  /**
   * Font weight override. Forwarded to XDSText.
   */
  weight?: XDSTextWeight;
  /**
   * Text color. Forwarded to XDSText.
   * @default 'active'
   */
  color?: XDSTextColor;
  /**
   * Display type for XDSText. Forwarded to XDSText.
   * @default 'inline'
   */
  display?: XDSTextDisplay;
  /**
   * Maximum lines before truncation. Forwarded to XDSText.
   * @default 0
   */
  maxLines?: number;
  /**
   * Link content (required).
   */
  children: ReactNode;
}

/**
 * A styled anchor link component.
 *
 * Uses XDSText internally for typography styling.
 * Wrap your app in <Theme> to apply a theme.
 *
 * @example
 * ```
 * <XDSLink href="/docs">Documentation</XDSLink>
 * <XDSLink href="https://github.com" isExternalLink>GitHub</XDSLink>
 * <XDSLink href="/settings" color="secondary">Settings</XDSLink>
 * <XDSLink href="/privacy" hasUnderline>Privacy Policy</XDSLink>
 * <XDSLink label="Close dialog" href="/home"><XDSIcon icon="x" /></XDSLink>
 * ```
 */
export function XDSLink({
  as,
  label,
  href,
  hasUnderline = false,
  isDisabled = false,
  isExternalLink = false,
  target: targetFromProps,
  onClick,
  tooltip,
  isStandalone = false,
  type = 'body',
  size,
  weight,
  color = 'active',
  display = 'inline',
  maxLines = 0,
  children,
  rel: relFromProps,
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSLinkProps) {
  const LinkComponent = useXDSLinkComponent(as);
  // Determine target and rel based on isExternalLink
  const {target, rel} = computeTargetAndRel(
    isExternalLink ? '_blank' : targetFromProps,
    relFromProps,
  );

  // When href is undefined, render as a <button> for semantic correctness
  const renderAsButton = href == null;

  const sharedContent = (
    <>
      <XDSText
        type={type}
        size={size}
        weight={weight}
        color={color}
        display={display}
        maxLines={maxLines}>
        {children}
      </XDSText>
      {isExternalLink && !renderAsButton && (
        <XDSIcon icon="externalLink" size="xsm" color="inherit" />
      )}
    </>
  );

  let linkElement: React.ReactElement;

  if (renderAsButton) {
    linkElement = (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        onClick={
          onClick
        }
        aria-label={label || undefined}
        aria-disabled={isDisabled || undefined}
        tabIndex={isDisabled ? -1 : undefined}
        disabled={isDisabled}
        {...mergeProps(
          xdsClassName('link', {color}),
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
        {...(props)}>
        {sharedContent}
      </button>
    );
  } else {
    linkElement = (
      <LinkComponent
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel}
        onClick={
          onClick
        }
        aria-label={label || undefined}
        aria-disabled={isDisabled || undefined}
        tabIndex={isDisabled ? -1 : undefined}
        {...mergeProps(
          xdsClassName('link', {color}),
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
      <XDSTooltip content={tooltip} placement="above">
        {linkElement}
      </XDSTooltip>
    );
  }

  return linkElement;
}

XDSLink.displayName = 'XDSLink';
