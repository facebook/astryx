/**
 * @file XDSTopNavTitle.tsx
 * @input Uses React forwardRef, HTMLAttributes, ReactNode
 * @output Exports XDSTopNavTitle component and XDSTopNavTitleProps
 * @position Companion component for XDSTopNav title slot
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TopNav/README.md
 * - /packages/core/src/TopNav/XDSTopNav.test.tsx
 * - /packages/core/src/TopNav/index.ts
 * - /apps/storybook/stories/TopNav.stories.tsx
 */

import {forwardRef, type HTMLAttributes, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  textSizeVars,
  fontWeightVars,
  lineHeightVars,
} from '../theme/tokens.stylex';

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
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  suiteName: {
    fontSize: textSizeVars['--text-xsm'],
    lineHeight: lineHeightVars['--leading-snug'],
    color: colorVars['--color-text-secondary'],
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  titleText: {
    fontSize: textSizeVars['--text-2xl'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: lineHeightVars['--leading-tight'],
    whiteSpace: 'nowrap',
  },
  subtitle: {
    fontSize: textSizeVars['--text-xsm'],
    lineHeight: lineHeightVars['--leading-snug'],
    color: colorVars['--color-text-secondary'],
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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

export interface XDSTopNavTitleProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'style' | 'className' | 'title'
> {
  /**
   * The title text to display (app/product name).
   */
  title?: string;
  /**
   * Text above the title (e.g., suite name).
   * Rendered smaller in secondary color.
   */
  suiteName?: string;
  /**
   * Text below the title (e.g., account or workspace context).
   * Rendered smaller in secondary color.
   */
  subtitle?: string;
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
 * Supports suiteName (above) and subtitle (below) for suite branding
 * or account context.
 *
 * @example
 * ```tsx
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
 * // Suite branding — suiteName above the app name
 * <XDSTopNavTitle
 *   suiteName="Acme Suite"
 *   title="Analytics"
 *   logo={<XDSNavIcon icon={<ChartBarIcon />} />}
 *   href="/"
 * />
 *
 * // With subtitle context
 * <XDSTopNavTitle
 *   title="Dashboard"
 *   subtitle="Business Account"
 *   logo={<XDSNavIcon icon={<HomeIcon />} />}
 * />
 *
 * // Logo only
 * <XDSTopNavTitle logo={<BrandLogo />} href="/" />
 * ```
 */
export const XDSTopNavTitle = forwardRef<HTMLElement, XDSTopNavTitleProps>(
  function XDSTopNavTitle({title, suiteName, subtitle, logo, href, ...props}, ref) {
    const Element = href ? 'a' : 'div';
    const hasTextContent = title || suiteName || subtitle;

    return (
      <Element
        ref={ref as React.Ref<HTMLAnchorElement & HTMLDivElement>}
        href={href}
        {...stylex.props(styles.base, href != null && styles.clickable)}
        {...props}>
        {logo && <span {...stylex.props(styles.logo)}>{logo}</span>}
        {hasTextContent && (
          <span {...stylex.props(styles.textContainer)}>
            {suiteName && (
              <span {...stylex.props(styles.suiteName)}>{suiteName}</span>
            )}
            {title && (
              <span {...stylex.props(styles.titleText)}>{title}</span>
            )}
            {subtitle && (
              <span {...stylex.props(styles.subtitle)}>{subtitle}</span>
            )}
          </span>
        )}
      </Element>
    );
  },
);

XDSTopNavTitle.displayName = 'XDSTopNavTitle';
