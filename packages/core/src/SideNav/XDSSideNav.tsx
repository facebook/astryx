/**
 * @file XDSSideNav.tsx
 * @input Uses React, HTMLAttributes, ReactNode, StyleX
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

import {useCallback, useState, type ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {colorVars, spacingVars} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';
import {SideNavCollapseContext} from './SideNavCollapseContext';
import {XDSSideNavCollapseButton} from './XDSSideNavCollapseButton';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: 260,
    backgroundColor: 'inherit',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  rootCollapsed: {
    width: 52,
  },
  stickyTop: {
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    zIndex: 1,
    backgroundColor: 'inherit',
    paddingBlockStart: spacingVars['--spacing-2'],
    paddingBlockEnd: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
    gap: spacingVars['--spacing-2'],
  },
  topContent: {},
  scrollable: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingInline: spacingVars['--spacing-2'],
  },
  scrollableNoTop: {
    paddingBlockStart: spacingVars['--spacing-2'],
  },
  scrollableWithTop: {
    paddingBlockStart: spacingVars['--spacing-1'],
  },
  scrollableNoBottom: {
    paddingBlockEnd: spacingVars['--spacing-2'],
  },
  scrollableWithBottom: {
    paddingBlockEnd: spacingVars['--spacing-1'],
  },
  stickyBottom: {
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    marginTop: 'auto',
    position: 'sticky',
    bottom: 0,
    backgroundColor: 'inherit',
    gap: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-2'],
    paddingBlockStart: spacingVars['--spacing-1'],
    paddingBlockEnd: spacingVars['--spacing-2'],
    borderBlockStart: `1px solid ${colorVars['--color-divider']}`,
  },
  footerIcons: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
  footerIconsCollapsed: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  stickyBottomCollapsed: {
    borderBlockStart: 'none',
    paddingBlockStart: 0,
  },
});

// =============================================================================
// Types
// =============================================================================

export interface XDSSideNavProps extends XDSBaseProps<HTMLElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLElement>;
  /**
   * Header area — typically XDSSideNavHeading. Sticky at top.
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
   * ```
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

  /**
   * Enables collapse behavior. When true, provides collapse context to
   * descendant XDSSideNavCollapseButton components and renders a default
   * toggle if no XDSSideNavCollapseButton is placed manually.
   * @default false
   */
  isCollapsible?: boolean;

  /**
   * Initial collapsed state (uncontrolled mode).
   * @default false
   */
  defaultIsCollapsed?: boolean;

  /**
   * Controlled collapsed state.
   */
  isCollapsed?: boolean;

  /**
   * Callback when collapsed state changes.
   */
  onCollapsedChange?: (isCollapsed: boolean) => void;
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
 *   header={<XDSSideNavHeading heading="My App" headingHref="/" />}
 *   topContent={<XDSButton label="Create new" variant="primary" />}>
 *   <XDSSideNavSection heading="Main">
 *     <XDSSideNavItem label="Dashboard" isSelected href="/dashboard" />
 *     <XDSSideNavItem label="Projects" href="/projects" />
 *   </XDSSideNavSection>
 * </XDSSideNav>
 * ```
 */
export function XDSSideNav({
  header,
  topContent,
  children,
  footer,
  footerIcons,
  isCollapsible = false,
  defaultIsCollapsed = false,
  isCollapsed: controlledCollapsed,
  onCollapsedChange,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
  ...props
}: XDSSideNavProps) {
  // Collapse state (controlled + uncontrolled)
  const isControlled = controlledCollapsed !== undefined;
  const [uncontrolledCollapsed, setUncontrolledCollapsed] =
    useState(defaultIsCollapsed);
  const collapsed = isControlled ? controlledCollapsed : uncontrolledCollapsed;

  const toggle = useCallback(() => {
    const newValue = !collapsed;
    if (!isControlled) {
      setUncontrolledCollapsed(newValue);
    }
    onCollapsedChange?.(newValue);
  }, [collapsed, isControlled, onCollapsedChange]);

  const collapseContext = {
    isCollapsed: collapsed,
    toggle,
    isCollapsible,
  };

  const hasStickyTop = !!(header || topContent);
  const hasStickyBottom = !!(footer || footerIcons);

  const content = (
    <nav
      ref={ref}
      role="navigation"
      aria-label="Side navigation"
      data-testid={testId}
      {...mergeProps(
        xdsClassName('side-nav'),
        stylex.props(styles.root, collapsed && styles.rootCollapsed, xstyle),
        className,
        style,
      )}
      {...props}>
      {hasStickyTop && (
        <div {...stylex.props(styles.stickyTop)}>
          {header}
          {!collapsed && topContent && (
            <div {...stylex.props(styles.topContent)}>{topContent}</div>
          )}
        </div>
      )}
      <div
        {...stylex.props(
          styles.scrollable,
          hasStickyTop ? styles.scrollableWithTop : styles.scrollableNoTop,
          hasStickyBottom
            ? styles.scrollableWithBottom
            : styles.scrollableNoBottom,
        )}>
        {children}
      </div>
      {(hasStickyBottom || isCollapsible) && (
        <div
          {...stylex.props(
            styles.stickyBottom,
            collapsed && styles.stickyBottomCollapsed,
          )}>
          {!collapsed && footer}
          <div {...stylex.props(styles.footerRow, collapsed && styles.footerRowCollapsed)}>
            {isCollapsible && <XDSSideNavCollapseButton />}
            {!collapsed && footerIcons && (
              <div {...stylex.props(styles.footerIcons)}>{footerIcons}</div>
            )}
          </div>
        </div>
      )}
    </nav>
  );

  if (isCollapsible) {
    return (
      <SideNavCollapseContext value={collapseContext}>
        {content}
      </SideNavCollapseContext>
    );
  }

  return content;
}

XDSSideNav.displayName = 'XDSSideNav';
