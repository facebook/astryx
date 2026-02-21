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
   * Initial collapsed state for uncontrolled usage.
   * @default false
   */
  initialIsSideNavCollapsed?: boolean;

  /**
   * Whether the side nav is collapsed (controlled).
   */
  isSideNavCollapsed?: boolean;

  /**
   * Callback when side nav collapsed state changes.
   */
  onSideNavCollapsedChange?: (isCollapsed: boolean) => void;

  /**
   * Side navigation — typically an XDSPageNav.
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
  rootFill: {
    height: '100dvh',
    overflow: 'hidden',
  },
  rootAuto: {
    minHeight: '100dvh',
  },
  skipLink: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: '8px 16px',
    backgroundColor: colorVars['--color-surface'],
    color: colorVars['--color-accent-text'],
    zIndex: 9999,
    textDecoration: 'none',
    fontWeight: fontWeightVars['--font-weight-semibold'],
    fontSize: textSizeVars['--text-base'],
    // Visually hidden by default
    transform: 'translateY(-100%)',
    // Show on focus
    ':focus': {
      transform: 'translateY(0)',
    },
  },
  banner: {
    flexShrink: 0,
  },
  // Mobile overlay sideNav
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    display: 'flex',
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: colorVars['--color-overlay'],
    zIndex: 100,
  },
  overlaySideNav: {
    position: 'relative',
    zIndex: 101,
    backgroundColor: colorVars['--color-surface'],
    overflow: 'auto',
    height: '100%',
    borderInlineEndWidth: 1,
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: colorVars['--color-divider'],
  },
  hidden: {
    display: 'none',
  },
});

const dynamicStyles = stylex.create({
  sideNavWidth: (width: number) => ({
    width,
  }),
});

// =============================================================================
// Component
// =============================================================================

/**
 * Application-level layout shell. Provides the structural frame for an app:
 * header, side navigation, and main content area.
 *
 * Composes XDSLayout internally. Replaces internal XDSPage + XDSPageLayout pattern.
 *
 * Features:
 * - Slot-based API: `topNav`, `sideNav`, `banner`, `children`
 * - Two height modes: `fill` (100dvh, independent scroll) and `auto` (page scroll, sticky navs)
 * - SideNav collapse: controlled + uncontrolled patterns
 * - Responsive sideNav collapse via breakpoint
 * - Mobile overlay sideNav with backdrop
 * - Skip-to-content link
 * - Semantic HTML: `<header>`, `<nav>`, `<main>`
 *
 * @example
 * ```tsx
 * // Standard app shell — fill mode, sideNav + header
 * <XDSAppShell
 *   topNav={<XDSTopNav title="My App" />}
 *   sideNav={<XDSPageNav items={navItems} />}
 * >
 *   <DashboardContent />
 * </XDSAppShell>
 *
 * // Header only (no sideNav)
 * <XDSAppShell topNav={<XDSTopNav title="Landing" />}>
 *   <LandingContent />
 * </XDSAppShell>
 *
 * // Auto-height for content-heavy pages
 * <XDSAppShell
 *   topNav={<XDSTopNav title="Docs" />}
 *   sideNav={<XDSPageNav items={docNav} />}
 *   height="auto"
 * >
 *   <LongDocumentContent />
 * </XDSAppShell>
 * ```
 */
export const XDSAppShell = forwardRef<HTMLDivElement, XDSAppShellProps>(
  function XDSAppShell(
    {
      banner,
      children,
      'data-testid': dataTestId,
      height = 'fill',
      initialIsSideNavCollapsed = false,
      isSideNavCollapsed: controlledCollapsed,
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
      initialIsSideNavCollapsed,
    );
    const isCollapsed = isControlled
      ? controlledCollapsed
      : uncontrolledCollapsed;

    // Track whether we're below the breakpoint
    const [isBelowBreakpoint, setIsBelowBreakpoint] = useState(false);

    const isFill = height === 'fill';
    const hasSideNav = sideNav != null;
    const hasTopNav = topNav != null;
    const hasBanner = banner != null;

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
    // Close mobile sideNav on Escape
    // =========================================================================
    useEffect(() => {
      if (!isBelowBreakpoint || isCollapsed) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          handleToggleCollapse();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBelowBreakpoint, isCollapsed, handleToggleCollapse]);

    // =========================================================================
    // Determine if sideNav should show as overlay (mobile) or inline
    // =========================================================================
    const showSideNavInline = hasSideNav && !isCollapsed && !isBelowBreakpoint;
    const showSideNavOverlay = hasSideNav && !isCollapsed && isBelowBreakpoint;

    // =========================================================================
    // Build header content (topNav + banner)
    // =========================================================================
    const headerContent =
      hasTopNav || hasBanner ? (
        <XDSLayoutHeader isFullBleed hasDivider={hasTopNav}>
          {hasBanner && <div {...stylex.props(styles.banner)}>{banner}</div>}
          {hasTopNav && topNav}
        </XDSLayoutHeader>
      ) : undefined;

    // =========================================================================
    // Build sideNav content
    // =========================================================================
    const sideNavContent = showSideNavInline ? (
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
        ref={ref}
        data-testid={dataTestId}
        {...stylex.props(
          styles.root,
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

        {/* Mobile overlay sideNav */}
        {showSideNavOverlay && (
          <>
            <div
              {...stylex.props(styles.backdrop)}
              onClick={handleToggleCollapse}
              data-testid="sidenav-backdrop"
              aria-hidden="true"
            />
            <nav
              aria-label="Application navigation"
              {...stylex.props(
                styles.overlaySideNav,
                dynamicStyles.sideNavWidth(sideNavWidth),
              )}>
              {sideNav}
            </nav>
          </>
        )}
      </div>
    );
  },
);

XDSAppShell.displayName = 'XDSAppShell';
