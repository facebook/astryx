'use client';

/**
 * @file XDSSideNav.tsx
 * @input Uses React, HTMLAttributes, ReactNode, StyleX
 * @output Exports XDSSideNav component and XDSSideNavProps
 * @position Core implementation; consumed by index.ts, tested by XDSSideNav.test.tsx
 *
 * Sidebar navigation container with five zones: header + topContent (sticky together),
 * children (scrollable), footer, and footerIcons (sticky bottom).
 *
 * Supports optional resize via drag handle at the inline-end edge.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/SideNav/SideNav.doc.mjs
 * - /packages/core/src/SideNav/XDSSideNav.test.tsx
 * - /packages/core/src/SideNav/index.ts
 * - /apps/storybook/stories/SideNav.stories.tsx
 */

import {useCallback, useRef, useState, type ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {borderVars, colorVars, durationVars, easeVars, spacingVars} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';
import {XDSSideNavCollapseContext} from './XDSSideNavCollapseContext';
import {XDSSideNavCollapseButton} from './XDSSideNavCollapseButton';
import {useXDSSideNavRenderMode} from './XDSSideNavRenderContext';
import {XDSMobileNav} from '../MobileNav/XDSMobileNav';
import {useXDSResizable} from '../Resizable/useXDSResizable';

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
    width: spacingVars['--spacing-12'],
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
    paddingBlockEnd: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-2'],
    gap: spacingVars['--spacing-2'],
  },
  stickyTopCollapsed: {
    alignItems: 'center',
  },
  topContent: {},
  scrollable: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingInline: spacingVars['--spacing-2'],
  },
  scrollableCollapsed: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
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
    borderBlockStart: `${borderVars['--border-width']} solid ${colorVars['--color-border']}`,
  },
  footerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
  footerRowCollapsed: {
    flexDirection: 'column-reverse',
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
  // Drawer footer — pushed to bottom of the scrollable content area
  drawerFooter: {
    display: 'flex',
    flexDirection: 'column',
    marginBlockStart: 'auto',
    gap: spacingVars['--spacing-2'],
    paddingBlockStart: spacingVars['--spacing-2'],
    borderBlockStart: `${borderVars['--border-width']} solid ${colorVars['--color-border']}`,
  },
  drawerFooterIcons: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
  // Resizable container — wraps the nav and the drag handle
  resizableContainer: {
    position: 'relative',
    display: 'flex',
    flexShrink: 0,
    height: '100%',
  },
  // Drag handle overlay at the inline-end edge (inside the nav bounds)
  dragHandle: {
    position: 'absolute',
    insetInlineEnd: 0,
    top: 0,
    bottom: 0,
    width: 'var(--resize-handle-hit-area, 16px)',
    cursor: 'col-resize',
    zIndex: 2,
    touchAction: 'none',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  dragPill: {
    width: 'var(--resize-handle-width, 3px)',
    height: 'var(--resize-handle-height, 32px)',
    borderRadius: 2,
    backgroundColor: colorVars['--color-border'],
    opacity: 0,
    transitionProperty: 'opacity, background-color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    marginInlineEnd: 'var(--resize-handle-pill-gap, 4px)',
  },
  dragPillVisible: {
    opacity: 1,
  },
  dragPillActive: {
    opacity: 1,
    backgroundColor: colorVars['--color-border-emphasized'],
  },
  // Topbar mode — horizontal layout for mobile top bar
  topbar: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    width: '100%',
    backgroundColor: 'inherit',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  topbarIcons: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    marginInlineStart: 'auto',
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
   * Enables a resize handle at the inline-end edge for resizing the sidebar.
   * Uses the `useXDSResizable` hook internally. When collapsed, the handle
   * is hidden.
   *
   * - `true` — resizable with defaults (260px initial, 180–480px range)
   * - Object — configured:
   *   - `defaultWidth` — initial width in pixels (default: 260)
   *   - `minWidth` — minimum width in pixels (default: 180)
   *   - `maxWidth` — maximum width in pixels (default: 480)
   *   - `autoSaveId` — localStorage key for persisting width
   *   - `onWidthChange` — called when the width changes
   *
   * @default false
   */
  resizable?:
    | boolean
    | {
        defaultWidth?: number;
        minWidth?: number;
        maxWidth?: number;
        autoSaveId?: string;
        onWidthChange?: (width: number) => void;
      };

  /**
   * Enables collapse behavior. The sidebar can be collapsed to a narrow
   * icon-only toolbar.
   *
   * - `true` — enables collapse with default toggle button and uncontrolled state
   * - Object — enables collapse with advanced configuration:
   *   - `defaultIsCollapsed` — start collapsed (uncontrolled)
   *   - `isCollapsed` + `onCollapsedChange` — controlled mode
   *   - `hasButton` — render built-in collapse button (default: true)
   *   - `buttonLabel` — accessibility label for the collapse button
   *
   * @default false
   */
  collapsible?:
    | boolean
    | {
        defaultIsCollapsed?: boolean;
        isCollapsed?: boolean;
        onCollapsedChange?: (isCollapsed: boolean) => void;
        hasButton?: boolean;
        buttonLabel?: string;
      };
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
  collapsible = false,
  resizable = false,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
  ...props
}: XDSSideNavProps) {
  // Parse collapsible prop
  const collapsibleConfig = typeof collapsible === 'object' ? collapsible : {};
  const isCollapsible = !!collapsible;
  const hasCollapseButton = collapsibleConfig.hasButton ?? true;
  const defaultIsCollapsed = collapsibleConfig.defaultIsCollapsed ?? false;
  const controlledCollapsed = collapsibleConfig.isCollapsed;
  const onCollapsedChange = collapsibleConfig.onCollapsedChange;

  // Resizable config
  const resizableConfig = typeof resizable === 'object' ? resizable : {};
  const isResizable = !!resizable;

  // Collapse state (controlled + uncontrolled)
  const isControlled = controlledCollapsed !== undefined;
  const [uncontrolledCollapsed, setUncontrolledCollapsed] =
    useState(defaultIsCollapsed);
  const collapsed = isControlled ? controlledCollapsed : uncontrolledCollapsed;

  const setCollapsedState = useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setUncontrolledCollapsed(value);
      }
      onCollapsedChange?.(value);
    },
    [isControlled, onCollapsedChange],
  );

  const toggle = useCallback(() => {
    setCollapsedState(!collapsed);
  }, [collapsed, setCollapsedState]);

  const collapseContext = {
    isCollapsed: collapsed,
    toggle,
    isCollapsible,
  };

  // =========================================================================
  // Resize — powered by useXDSResizable
  // =========================================================================
  const resizableHook = useXDSResizable({
    defaultSize: resizableConfig.defaultWidth ?? 260,
    minSizePx: resizableConfig.minWidth ?? 180,
    maxSizePx: resizableConfig.maxWidth ?? 480,
    autoSaveId: resizableConfig.autoSaveId,
  });
  const showResizeHandle = isResizable && !collapsed;

  const [isDragHovered, setIsDragHovered] = useState(false);
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const COLLAPSE_THRESHOLD = 160;

  const handleDragPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!isResizable) return;
      e.preventDefault();
      isDraggingRef.current = true;

      const startX = e.clientX;
      const startWidth = navRef.current?.offsetWidth ?? resizableHook.size;
      const min = resizableConfig.minWidth ?? 180;
      const max = resizableConfig.maxWidth ?? 480;
      let wasCollapsed = !!collapsed;

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const onMove = (ev: PointerEvent) => {
        const raw = startWidth + (ev.clientX - startX);
        if (isCollapsible && raw < COLLAPSE_THRESHOLD) {
          if (!wasCollapsed) {
            setCollapsedState(true);
            wasCollapsed = true;
          }
          return;
        }
        if (wasCollapsed && raw >= COLLAPSE_THRESHOLD) {
          setCollapsedState(false);
          wasCollapsed = false;
        }
        const newWidth = Math.min(max, Math.max(min, raw));
        if (navRef.current) navRef.current.style.width = `${newWidth}px`;
      };
      const onUp = (ev: PointerEvent) => {
        isDraggingRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';

        const raw = startWidth + (ev.clientX - startX);
        if (!wasCollapsed) {
          const finalWidth = Math.min(max, Math.max(min, raw));
          resizableHook.resize(finalWidth);
          resizableConfig.onWidthChange?.(finalWidth);
        }
        setIsDragHovered(false);

        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [isResizable, isCollapsible, collapsed, setCollapsedState, resizableHook.size, resizableHook.resize, resizableConfig.minWidth, resizableConfig.maxWidth, resizableConfig.onWidthChange],
  );

  // Render mode — when inside AppShell mobile layout, render subsets
  const renderMode = useXDSSideNavRenderMode();

  // =========================================================================
  // Topbar mode — heading + footerIcons in a horizontal bar
  // =========================================================================
  if (renderMode === 'topbar') {
    return (
      <div
        data-testid={testId}
        {...mergeProps(
          xdsClassName('side-nav', {mode: 'topbar'}),
          stylex.props(styles.topbar, xstyle),
          className,
          style,
        )}>
        {header}
        <div {...stylex.props(styles.topbarIcons)}>{footerIcons}</div>
      </div>
    );
  }

  // =========================================================================
  // Drawer mode — render inside XDSMobileNav with heading as header
  // =========================================================================
  const hasDrawerFooter = !!(footer || footerIcons);

  if (renderMode === 'drawer') {
    return (
      <XDSMobileNav header={header} data-testid={testId}>
        {topContent}
        {children}
        {hasDrawerFooter && (
          <div {...stylex.props(styles.drawerFooter)}>
            {footer}
            {footerIcons && (
              <div {...stylex.props(styles.drawerFooterIcons)}>
                {footerIcons}
              </div>
            )}
          </div>
        )}
      </XDSMobileNav>
    );
  }

  // =========================================================================
  // Drawer-content mode — render just items (no XDSMobileNav wrapper)
  // Used when TopNav owns the drawer and SideNav items are nested inside
  // =========================================================================
  if (renderMode === 'drawer-content') {
    return (
      <>
        {topContent}
        {children}
        {hasDrawerFooter && (
          <div {...stylex.props(styles.drawerFooter)}>
            {footer}
            {footerIcons && (
              <div {...stylex.props(styles.drawerFooterIcons)}>
                {footerIcons}
              </div>
            )}
          </div>
        )}
      </>
    );
  }

  // =========================================================================
  // Default mode — full sidebar
  // =========================================================================
  const hasStickyTop = !!(header || topContent);
  const hasStickyBottom = !!(footer || footerIcons);

  // When resizable, override the nav width via inline style
  const resizableNavStyle: React.CSSProperties | undefined = isResizable
    ? {...(style ?? {}), width: collapsed ? undefined : resizableHook.size}
    : style;

  const navElement = (
    <nav
      ref={(node) => {
        navRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
      }}
      role="navigation"
      aria-label="Side navigation"
      data-testid={testId}
      {...mergeProps(
        xdsClassName('side-nav'),
        stylex.props(styles.root, collapsed && styles.rootCollapsed, xstyle),
        className,
        resizableNavStyle,
      )}
      {...props}>
      {hasStickyTop && (
        <div
          {...stylex.props(
            styles.stickyTop,
            collapsed && styles.stickyTopCollapsed,
          )}>
          {header}
          {topContent && (
            <div {...stylex.props(styles.topContent)}>{topContent}</div>
          )}
        </div>
      )}
      <div
        {...stylex.props(
          styles.scrollable,
          collapsed && styles.scrollableCollapsed,
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
          {footer}
          <div
            {...stylex.props(
              styles.footerRow,
              collapsed && styles.footerRowCollapsed,
            )}>
            {isCollapsible && hasCollapseButton && <XDSSideNavCollapseButton />}
            {footerIcons}
          </div>
        </div>
      )}
    </nav>
  );

  // Overlay drag handle inside the nav when resizable.
  // The handle is absolutely positioned at the inline-end edge so it
  // stays within the panel's overflow: clip bounds (unlike XDSResizeHandle
  // which is designed to sit between panels as a sibling).
  const content = showResizeHandle ? (
    <div {...stylex.props(styles.resizableContainer)}>
      {navElement}
      <div
        data-testid="xds-sidenav-resize-handle"
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={resizableHook.size}
        aria-valuemin={resizableConfig.minWidth ?? 180}
        aria-valuemax={resizableConfig.maxWidth ?? 480}
        aria-label="Resize sidebar"
        {...stylex.props(styles.dragHandle)}
        onPointerDown={handleDragPointerDown}
        onDoubleClick={isCollapsible ? toggle : undefined}
        onPointerEnter={() => setIsDragHovered(true)}
        onPointerLeave={() => {
          if (!isDraggingRef.current) setIsDragHovered(false);
        }}>
        <div
          {...stylex.props(
            styles.dragPill,
            isDragHovered && !isDraggingRef.current && styles.dragPillVisible,
            isDraggingRef.current && styles.dragPillActive,
          )}
        />
      </div>
    </div>
  ) : (
    navElement
  );

  if (isCollapsible) {
    return (
      <XDSSideNavCollapseContext value={collapseContext}>
        {content}
      </XDSSideNavCollapseContext>
    );
  }

  return content;
}

XDSSideNav.displayName = 'XDSSideNav';
