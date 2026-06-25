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
   * Semantic text type for Text. Determines base typography.
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
   * @default 'active'
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
 * ```
 */
export function Link({
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
}: LinkProps) {
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
        <Icon icon="externalLink" size="xsm" color="inherit" />
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
