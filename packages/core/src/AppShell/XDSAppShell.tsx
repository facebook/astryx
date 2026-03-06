/**
 * @file XDSAppShell.tsx
 * @input Uses React, XDSLayout, XDSLayoutHeader, XDSLayoutPanel, XDSLayoutContent, StyleX
 * @output Exports XDSAppShell component and XDSAppShellProps type
 * @position Application-level layout shell — the top-level wrapper for any app.
 *   Composes XDSLayout internally to provide header, sideNav, and main content areas.
 *   Use for any app that needs a top nav, side navigation, and scrollable content.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/AppShell/README.md
 * - /packages/core/src/AppShell/index.ts
 * - /packages/core/src/AppShell/XDSAppShell.test.tsx
 * - /apps/storybook/stories/AppShell.stories.tsx
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {colorVars, fontWeightVars, textSizeVars} from '../theme/tokens.stylex';
import {XDSLayout} from '../Layout/XDSLayout';
import {XDSLayoutHeader} from '../Layout/XDSLayoutHeader';
import {XDSLayoutPanel} from '../Layout/XDSLayoutPanel';
import {XDSLayoutContent} from '../Layout/XDSLayoutContent';
import {XDSMobileNav} from '../MobileNav/XDSMobileNav';

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_SIDENAV_WIDTH = 260;

const BREAKPOINT_VALUES: Record<XDSAppShellBreakpoint, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  none: 0,
};

const MAIN_CONTENT_ID = 'xds-app-shell-main';

// =============================================================================
// Types
// =============================================================================

/**
 * SideNav breakpoint options.
 * - `sm`: 640px
 * - `md`: 768px
 * - `lg`: 1024px
 * - `none`: Never auto-collapse
 */
export type XDSAppShellBreakpoint = 'sm' | 'md' | 'lg' | 'none';

export interface XDSAppShellProps {
  /**
   * Background color of the shell.
   * - `wash`: Page-level background — subtle gray in light, near-black in dark
   * - `surface`: Card/panel background — white in light, dark gray in dark
   * @default 'surface'
   */
  background?: 'wash' | 'surface';

  /**
   * Optional banner slot for system-wide announcements.
   * Renders above the top nav and scrolls away with the page in auto mode.
   */
  banner?: ReactNode;

  /**
   * Main content area (rendered as `<main>`).
   */
  children: ReactNode;

  /**
   * Test ID for the root element.
   */
  'data-testid'?: string;

  /**
   * Height behavior:
   * - `fill`: Shell fills viewport, content scrolls internally (default)
   * - `auto`: Shell grows with content, page scrolls as a whole
   * @default 'fill'
   */
  height?: 'fill' | 'auto';

  /**
   * Default collapsed state for uncontrolled usage.
   * @default false
   */
  defaultIsSideNavCollapsed?: boolean;

  /**
   * Whether the side nav is collapsed (controlled).
   */
  isSideNavCollapsed?: boolean;

  /**
   * Mobile navigation — typically an XDSMobileNav.
   *
   * When provided, replaces the default mobile drawer that AppShell renders
   * for sideNav below the breakpoint. The consumer owns the XDSMobileNav
   * element and its open/close state, just like topNav and sideNav.
   *
   * When not provided, AppShell automatically wraps sideNav in an
   * XDSMobileNav for the mobile breakpoint.
   */
  mobileNav?: ReactNode;

  /**
   * Callback when side nav collapsed state changes.
   */
  onSideNavCollapsedChange?: (isCollapsed: boolean) => void;

  /**
   * Side navigation — typically an XDSSideNav.
   */
  sideNav?: ReactNode;

  /**
   * Breakpoint below which side nav auto-collapses.
   * @default 'md'
   */
  sideNavBreakpoint?: XDSAppShellBreakpoint;

  /**
   * Width of side nav when expanded (in pixels).
   * @default 260
   */
  sideNavWidth?: number;

  /**
   * Top navigation — typically an XDSTopNav.
   */
  topNav?: ReactNode;

  /**
   * StyleX overrides for the root element.
   */
  xstyle?: StyleXStyles;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  rootBgWash: {
    backgroundColor: colorVars['--color-wash'],
  },
  rootBgSurface: {
    backgroundColor: colorVars['--color-surface'],
  },
  rootFill: {
    height: '100dvh',
    overflow: 'hidden',
  },
  rootAuto: {
    minHeight: '100dvh',
  },
  skipLink: {
    // Visually hidden by default, visible on focus (keyboard navigation)
    position: {
      default: 'absolute',
      ':focus': 'fixed',
    },
    width: {
      default: '1px',
      ':focus': 'auto',
    },
    height: {
      default: '1px',
      ':focus': 'auto',
    },
    padding: {
      default: 0,
      ':focus': '8px 16px',
    },
    margin: {
      default: '-1px',
      ':focus': 0,
    },
    overflow: {
      default: 'hidden',
      ':focus': 'visible',
    },
    clipPath: {
      default: 'inset(50%)',
      ':focus': 'none',
    },
    whiteSpace: {
      default: 'nowrap',
      ':focus': 'normal',
    },
    borderWidth: 0,
    // Focus styles
    top: {
      default: 0,
      ':focus': '8px',
    },
    insetInlineStart: {
      default: 0,
      ':focus': '8px',
    },
    backgroundColor: colorVars['--color-surface'],
    color: colorVars['--color-accent-text'],
    zIndex: 9999,
    textDecoration: 'none',
    fontWeight: fontWeightVars['--font-weight-semibold'],
    fontSize: textSizeVars['--text-base'],
  },
  banner: {
    flexShrink: 0,
  },
  hidden: {
    display: 'none',
  },
  // Sticky header for auto height mode
  headerSticky: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  // Wrapper for auto height mode — stretches to full content height
  sideNavAutoWrapper: {
    alignSelf: 'stretch',
  },
  // Sticky sideNav for auto height mode — sticks within the wrapper
  sideNavSticky: {
    position: 'sticky',
    top: 'var(--appshell-header-height, 0px)',
    height: 'calc(100vh - var(--appshell-header-height, 0px))',
    overflow: 'auto',
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * Application-level layout shell. Provides the structural frame for an app:
 * top navigation, side navigation, and main content area.
 *
 * Slot-based API with `topNav`, `sideNav`, `banner`, and `children`.
 * Supports two height modes (`fill` and `auto`), responsive side nav
 * collapse, and mobile overlay with backdrop.
 *
 * @example
 * ```
 * <XDSAppShell
 *   topNav={<XDSTopNav label="Navigation" title={<XDSTopNavTitle title="My App" />} />}
 *   sideNav={<XDSSideNav>{navSections}</XDSSideNav>}
 *   mobileNav={
 *     <XDSMobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} title="My App">
 *       {navSections}
 *     </XDSMobileNav>
 *   }
 * >
 *   <Content />
 * </XDSAppShell>
 * ```
 */
export const XDSAppShell = forwardRef<HTMLDivElement, XDSAppShellProps>(
  function XDSAppShell(
    {
      background = 'surface',
      banner,
      children,
      'data-testid': dataTestId,
      height = 'fill',
      defaultIsSideNavCollapsed = false,
      isSideNavCollapsed: controlledCollapsed,
      mobileNav,
      onSideNavCollapsedChange,
      sideNav,
      sideNavBreakpoint = 'md',
      sideNavWidth = DEFAULT_SIDENAV_WIDTH,
      topNav,
      xstyle,
    },
    ref,
  ) {
    // =========================================================================
    // SideNav collapse state (controlled + uncontrolled)
    // =========================================================================
    const isControlled = controlledCollapsed !== undefined;
    const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(
      defaultIsSideNavCollapsed,
    );
    const isCollapsed = isControlled
      ? controlledCollapsed
      : uncontrolledCollapsed;

    // Track whether we're below the breakpoint
    const [isBelowBreakpoint, setIsBelowBreakpoint] = useState(false);

    const isFill = height === 'fill';
    const isAuto = height === 'auto';
    const hasSideNav = sideNav != null;
    const hasMobileNav = mobileNav != null;
    const hasTopNav = topNav != null;
    const hasBanner = banner != null;

    // =========================================================================
    // Header height measurement for sticky sideNav offset (auto mode)
    // =========================================================================
    const headerRef = useRef<HTMLDivElement>(null);
    const shellRef = useRef<HTMLDivElement>(null);

    // Merge forwarded ref with internal shell ref
    const setShellRef = useCallback(
      (node: HTMLDivElement | null) => {
        (shellRef as React.MutableRefObject<HTMLDivElement | null>).current =
          node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [ref],
    );

    useEffect(() => {
      if (!isAuto || !headerRef.current || !shellRef.current) return;

      const headerEl = headerRef.current;
      const shellEl = shellRef.current;

      const updateHeight = () => {
        const height = headerEl.getBoundingClientRect().height;
        shellEl.style.setProperty('--appshell-header-height', `${height}px`);
      };

      updateHeight();

      const observer = new ResizeObserver(updateHeight);
      observer.observe(headerEl);
      return () => observer.disconnect();
    }, [isAuto]);

    // =========================================================================
    // Responsive breakpoint handling
    //
    // Uses matchMedia which is event-driven — the listener only fires when the
    // media query match state actually changes, not on every resize. This is
    // efficient and does not over-trigger.
    // =========================================================================
    useEffect(() => {
      if (sideNavBreakpoint === 'none' || !hasSideNav) return;

      const breakpointPx = BREAKPOINT_VALUES[sideNavBreakpoint];
      const mql = window.matchMedia(`(max-width: ${breakpointPx}px)`);

      const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
        const matches = 'matches' in e ? e.matches : false;
        setIsBelowBreakpoint(matches);
        if (matches) {
          // Auto-collapse below breakpoint
          if (!isControlled) {
            setUncontrolledCollapsed(true);
          }
          onSideNavCollapsedChange?.(true);
        }
      };

      // Check initial state
      handleChange(mql);

      mql.addEventListener('change', handleChange);
      return () => mql.removeEventListener('change', handleChange);
    }, [sideNavBreakpoint, hasSideNav, isControlled, onSideNavCollapsedChange]);

    // =========================================================================
    // Toggle handler — snaps open/closed (no transitions for now)
    // TODO: Add ViewTransitions support with React transition API
    // =========================================================================
    const handleToggleCollapse = useCallback(() => {
      const newValue = !isCollapsed;
      if (!isControlled) {
        setUncontrolledCollapsed(newValue);
      }
      onSideNavCollapsedChange?.(newValue);
    }, [isCollapsed, isControlled, onSideNavCollapsedChange]);

    // =========================================================================
    // Determine if sideNav should show as overlay (mobile) or inline
    // =========================================================================
    const showSideNavInline = hasSideNav && !isCollapsed && !isBelowBreakpoint;
    // Default mobile nav: when no explicit mobileNav is provided, AppShell
    // internally renders an XDSMobileNav wrapping the sideNav content.
    // This shares the same <dialog>-based behavior as explicit mobileNav.
    const useDefaultMobileNav =
      hasSideNav && !hasMobileNav && isBelowBreakpoint;

    // =========================================================================
    // Build header content (topNav + banner)
    //
    // In auto mode, the header wrapper gets sticky positioning so the topNav
    // stays pinned while the page scrolls. The ref is used to measure header
    // height for the sideNav's sticky offset.
    // =========================================================================
    const headerInner =
      hasTopNav || hasBanner ? (
        <XDSLayoutHeader isFullBleed hasDivider={hasTopNav}>
          {hasBanner && <div {...stylex.props(styles.banner)}>{banner}</div>}
          {hasTopNav && topNav}
        </XDSLayoutHeader>
      ) : undefined;

    const headerContent =
      headerInner != null ? (
        <div ref={headerRef} {...stylex.props(isAuto && styles.headerSticky)}>
          {headerInner}
        </div>
      ) : undefined;

    // =========================================================================
    // Build sideNav content
    //
    // In auto mode, the sideNav panel is not internally scrollable (the page
    // scrolls as a whole), but it gets sticky positioning so it stays pinned
    // below the header while the main content scrolls. A wrapper div applies
    // the sticky behavior since XDSLayoutPanel doesn't accept style/className.
    // =========================================================================
    const sideNavPanel = showSideNavInline ? (
      <XDSLayoutPanel
        isFullBleed
        hasDivider
        width={sideNavWidth}
        role="navigation"
        label="Application navigation"
        isScrollable={isFill}>
        {sideNav}
      </XDSLayoutPanel>
    ) : undefined;

    const sideNavContent =
      sideNavPanel != null && isAuto ? (
        <div {...stylex.props(styles.sideNavAutoWrapper)}>
          <div {...stylex.props(styles.sideNavSticky)}>{sideNavPanel}</div>
        </div>
      ) : (
        sideNavPanel
      );

    // =========================================================================
    // Build main content
    // =========================================================================
    const mainContent = (
      <XDSLayoutContent
        isFullBleed
        role="main"
        id={MAIN_CONTENT_ID}
        isScrollable={isFill}>
        {children}
      </XDSLayoutContent>
    );

    // =========================================================================
    // Render
    //
    // TODO: Include root providers (ThemeProvider, ProseProvider, LayerProvider)
    // at the app level once they're available for wrapping.
    // =========================================================================
    return (
      <div
        ref={setShellRef}
        data-testid={dataTestId}
        {...stylex.props(
          styles.root,
          background === 'wash' ? styles.rootBgWash : styles.rootBgSurface,
          isFill ? styles.rootFill : styles.rootAuto,
          xstyle,
        )}>
        {/* Skip-to-content link */}
        <a
          href={`#${MAIN_CONTENT_ID}`}
          {...stylex.props(styles.skipLink)}
          data-testid="skip-to-content">
          Skip to content
        </a>

        <XDSLayout
          height={height}
          isFullBleed
          header={headerContent}
          start={sideNavContent}
          content={mainContent}
        />

        {/* Mobile nav — either explicit mobileNav or default wrapping sideNav */}
        {mobileNav}
        {useDefaultMobileNav && (
          <XDSMobileNav
            isOpen={!isCollapsed}
            onClose={handleToggleCollapse}
            width={sideNavWidth}
            data-testid="sidenav-mobile">
            {sideNav}
          </XDSMobileNav>
        )}
      </div>
    );
  },
);

XDSAppShell.displayName = 'XDSAppShell';
