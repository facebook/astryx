/**
 * @file XDSTopNavTitle.tsx
 * @input Uses React forwardRef, HTMLAttributes, ReactNode
 * @output Exports XDSTopNavTitle component and XDSTopNavTitleProps
 * @position Companion component for XDSTopNav title slot
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
 * Title styles
 */
const styles = stylex.create({
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    textDecoration: 'none',
    color: colorVars['--color-text-primary'],
  },
  titleText: {
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

export interface XDSTopNavTitleProps extends XDSBaseProps<HTMLElement> {
  /**
   * The title text to display.
   */
  title?: string;
  /**
   * Logo element to display before the title.
   * Can be an image, XDSNavIcon, or any ReactNode.
   */
  logo?: ReactNode;
  /**
   * URL to navigate to when the title is clicked.
   * If provided, renders as an anchor element.
   */
  href?: string;
}

/**
 * Title component for XDSTopNav.
 *
 * Displays a logo and/or title text, optionally as a clickable link.
 * Use with XDSNavIcon to create a circular icon background.
 *
 * @example
 * ```
 * // Logo with text
 * <XDSTopNavTitle
 *   title="My App"
 *   logo={<img src="/logo.svg" alt="" width={24} height={24} />}
 *   href="/"
 * />
 *
 * // With circular icon
 * <XDSTopNavTitle
 *   title="Dashboard"
 *   logo={<XDSNavIcon icon={<HomeIcon />} />}
 * />
 *
 * // Logo only
 * <XDSTopNavTitle logo={<BrandLogo />} href="/" />
 * ```
 */
export const XDSTopNavTitle = forwardRef<HTMLElement, XDSTopNavTitleProps>(
  function XDSTopNavTitle(
    {title, logo, href, className, style, ...props},
    ref,
  ) {
    const Element = href ? 'a' : 'div';

    return (
      <Element
        ref={ref as React.Ref<HTMLAnchorElement & HTMLDivElement>}
        href={href}
        {...mergeProps(
          xdsClassName('top-nav-title'),
          stylex.props(styles.base, href != null && styles.clickable),
          className,
          style,
        )}
        {...props}>
        {logo && <span {...stylex.props(styles.logo)}>{logo}</span>}
        {title && <span {...stylex.props(styles.titleText)}>{title}</span>}
      </Element>
    );
  },
);

XDSTopNavTitle.displayName = 'XDSTopNavTitle';
