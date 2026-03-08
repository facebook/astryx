/**
 * @file XDSSideNav.tsx
 * @input Uses React forwardRef, HTMLAttributes, ReactNode, StyleX
 * @output Exports XDSSideNav component and XDSSideNavProps
 * @position Core implementation; consumed by index.ts, tested by XDSSideNav.test.tsx
 *
 * Sidebar navigation container with five zones: header + topContent (sticky together),
 * children (scrollable), footer, and footerIcons (sticky bottom).
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/SideNav/SideNav.doc.mjs
 * - /packages/core/src/SideNav/XDSSideNav.test.tsx
 * - /packages/core/src/SideNav/index.ts
 * - /apps/storybook/stories/SideNav.stories.tsx
 */

'use client';

import {forwardRef, type ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {colorVars, spacingVars} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: colorVars['--color-surface'],
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  stickyTop: {
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    zIndex: 1,
    backgroundColor: colorVars['--color-surface'],
  },
  topContent: {
    paddingInline: spacingVars['--spacing-1'],
    paddingBlock: spacingVars['--spacing-1'],
  },
  scrollable: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingInline: spacingVars['--spacing-1'],
    paddingBlock: spacingVars['--spacing-1'],
  },
  stickyBottom: {
    flexShrink: 0,
    marginTop: 'auto',
    position: 'sticky',
    bottom: 0,
    backgroundColor: colorVars['--color-surface'],
  },
  footer: {
    paddingInline: spacingVars['--spacing-1'],
    paddingBlock: spacingVars['--spacing-2'],
  },
  footerIcons: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-1'],
    paddingBlock: spacingVars['--spacing-2'],
    borderBlockStart: `1px solid ${colorVars['--color-divider']}`,
  },
});

// =============================================================================
// Types
// =============================================================================

export interface XDSSideNavProps extends XDSBaseProps<HTMLElement> {
  /**
   * Header area — typically XDSSideNavHeader. Sticky at top.
   */
  header?: ReactNode;
  /**
   * Content pinned below header (e.g., create button, top-level items). Sticky.
   */
  topContent?: ReactNode;
  /**
   * Navigation sections and items. Scrollable.
   */
  children: ReactNode;
  /**
   * Footer area above icon bar (e.g., promo cards).
   */
  footer?: ReactNode;
  /**
   * Footer icon bar (e.g., help, notifications, avatar).
   */
  footerIcons?: ReactNode;
  /**
   * StyleX styles created via `stylex.create()`. Merged with the component's
   * base styles inside a single `stylex.props()` call for optimal deduplication.
   *
   * @example
   * ```tsx
   * const overrides = stylex.create({ root: { marginBottom: 8 } });
   * <Component xstyle={overrides.root} />
   * ```
   */
  xstyle?: StyleXStyles;
  /**
   * CSS class name(s) appended to the root element.
   * If you're using StyleX, prefer `xstyle` for optimal style deduplication.
   */
  className?: string;
  /**
   * Inline styles to apply to the root element. Spread after StyleX
   * inline styles, so these values take priority.
   */
  style?: React.CSSProperties;
  /**
   * Test ID for the root element.
   */
  'data-testid'?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Sidebar navigation container for application pages.
 *
 * Five vertical zones: sticky header + action area at top,
 * scrollable nav content in the middle, and sticky footer + icon bar at bottom.
 *
 * @example
 * ```
 * <XDSSideNav
 *   header={<XDSSideNavHeader title="My App" titleHref="/" />}
 *   topContent={<XDSButton label="Create new" variant="primary" />}
 * >
 *   <XDSSideNavSection title="Main">
 *     <XDSSideNavItem label="Dashboard" isSelected href="/dashboard" />
 *     <XDSSideNavItem label="Projects" href="/projects" />
 *   </XDSSideNavSection>
 * </XDSSideNav>
 * ```
 */
export const XDSSideNav = forwardRef<HTMLElement, XDSSideNavProps>(
  function XDSSideNav(
    {
      header,
      topContent,
      children,
      footer,
      footerIcons,
      xstyle,
      className,
      style,
      'data-testid': testId,
      ...props
    },
    ref,
  ) {
    const hasStickyTop = !!(header || topContent);
    const hasStickyBottom = !!(footer || footerIcons);

    return (
      <nav
        ref={ref}
        role="navigation"
        aria-label="Side navigation"
        data-testid={testId}
        {...mergeProps(
          xdsClassName('side-nav'),
          stylex.props(styles.root, xstyle),
          className,
          style,
        )}
        {...props}>
        {hasStickyTop && (
          <div {...stylex.props(styles.stickyTop)}>
            {header}
            {topContent && (
              <div {...stylex.props(styles.topContent)}>{topContent}</div>
            )}
          </div>
        )}
        <div {...stylex.props(styles.scrollable)}>{children}</div>
        {hasStickyBottom && (
          <div {...stylex.props(styles.stickyBottom)}>
            {footer && <div {...stylex.props(styles.footer)}>{footer}</div>}
            {footerIcons && (
              <div {...stylex.props(styles.footerIcons)}>{footerIcons}</div>
            )}
          </div>
        )}
      </nav>
    );
  },
);

XDSSideNav.displayName = 'XDSSideNav';
