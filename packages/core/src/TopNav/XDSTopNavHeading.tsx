/**
 * @file XDSTopNavHeading.tsx
 * @input Uses React forwardRef, HTMLAttributes, ReactNode
 * @output Exports XDSTopNavHeading component and XDSTopNavHeadingProps
 * @position Companion component for XDSTopNav heading slot
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TopNav/TopNav.doc.mjs
 * - /packages/core/src/TopNav/XDSTopNav.test.tsx
 * - /packages/core/src/TopNav/index.ts
 * - /apps/storybook/stories/TopNav.stories.tsx
 */

import {forwardRef, type ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  textSizeVars,
  fontWeightVars,
  lineHeightVars,
} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';

/**
 * Heading styles
 */
const styles = stylex.create({
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    textDecoration: 'none',
    color: colorVars['--color-text-primary'],
  },
  headingText: {
    fontSize: textSizeVars['--text-lg'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: lineHeightVars['--leading-tight'],
    whiteSpace: 'nowrap',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  clickable: {
    cursor: 'pointer',
  },
});

export interface XDSTopNavHeadingProps extends XDSBaseProps<HTMLElement> {
  /**
   * The heading text to display.
   */
  heading?: string;
  /**
   * Logo element to display before the heading.
   * Can be an image, XDSNavIcon, or any ReactNode.
   */
  logo?: ReactNode;
  /**
   * URL to navigate to when the heading is clicked.
   * If provided, renders as an anchor element.
   */
  href?: string;
}

/**
 * Heading component for XDSTopNav.
 *
 * Displays a logo and/or heading text, optionally as a clickable link.
 * Use with XDSNavIcon to create a circular icon background.
 *
 * @example
 * ```
 * <XDSTopNavHeading
 *   heading="My App"
 *   logo={<img src="/logo.svg" alt="" width={24} height={24} />}
 *   href="/"
 * />
 * <XDSTopNavHeading
 *   heading="Dashboard"
 *   logo={<XDSNavIcon icon={<HomeIcon />} />}
 * />
 * <XDSTopNavHeading logo={<BrandLogo />} href="/" />
 * ```
 */
export const XDSTopNavHeading = forwardRef<HTMLElement, XDSTopNavHeadingProps>(
  function XDSTopNavHeading(
    {heading, logo, href, xstyle, className, style, ...props},
    ref,
  ) {
    const Element = href ? 'a' : 'div';

    return (
      <Element
        ref={ref as React.Ref<HTMLAnchorElement & HTMLDivElement>}
        href={href}
        {...mergeProps(
          xdsClassName('top-nav-heading'),
          stylex.props(styles.base, href != null && styles.clickable, xstyle),
          className,
          style,
        )}
        {...props}>
        {logo && <span {...stylex.props(styles.logo)}>{logo}</span>}
        {heading && (
          <span {...stylex.props(styles.headingText)}>{heading}</span>
        )}
      </Element>
    );
  },
);

XDSTopNavHeading.displayName = 'XDSTopNavHeading';
