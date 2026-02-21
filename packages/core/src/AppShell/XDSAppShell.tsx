/**
 * @file XDSAppShell.tsx
 * @input Uses React, XDSLayout, XDSLayoutHeader, XDSLayoutPanel, XDSLayoutContent, StyleX
 * @output Exports XDSAppShell component and XDSAppShellProps type
 * @position Application-level layout shell — the top-level wrapper for any app.
 *   Composes XDSLayout internally to provide header, sidebar, and main content areas.
 *   Use for any app that needs a top nav, sidebar navigation, and scrollable content.
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

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_SIDEBAR_WIDTH = 260;

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
 * Sidebar breakpoint options.
 * - `sm`: 640px
 * - `md`: 768px
 * - `lg`: 1024px
 * - `none`: Never auto-collapse
 */
export type XDSAppShellBreakpoint = 'sm' | 'md' | 'lg' | 'none';

export interface XDSAppShellProps {
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
  initialIsSidebarCollapsed?: boolean;

  /**
   * Whether the sidebar is collapsed (controlled).
   */
  isSidebarCollapsed?: boolean;

  /**
   * Callback when sidebar collapsed state changes.
   */
  onSidebarCollapsedChange?: (isCollapsed: boolean) => void;

  /**
   * Sidebar navigation — typically an XDSPageNav.
   */
  pageNav?: ReactNode;

  /**
   * Breakpoint below which sidebar auto-collapses.
   * @default 'md'
   */
  sidebarBreakpoint?: XDSAppShellBreakpoint;

  /**
   * Width of sidebar when expanded (in pixels).
   * @default 260
   */
  sidebarWidth?: number;

  /**
   * Optional top banner slot for system-wide announcements.
   */
  topBanner?: ReactNode;

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
  headerWrapper: {
    flexShrink: 0,
    zIndex: 10,
  },
  headerWrapperSticky: {
    position: 'sticky',
    top: 0,
  },
  bodyRow: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    position: 'relative',
  },
  sidebar: {
    flexShrink: 0,
    overflow: 'auto',
    boxSizing: 'border-box',
    borderInlineEndWidth: 1,
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: colorVars['--color-divider'],
  },
  sidebarSticky: {
    position: 'sticky',
    alignSelf: 'flex-start',
  },
  sidebarFillHeight: {
    height: '100%',
  },
  mainContent: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  mainContentFill: {
    overflow: 'auto',
  },
  // Mobile overlay sidebar
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
  overlaySidebar: {
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
  sidebarWidth: (width: number) => ({
    width,
  }),
  stickyTop: (top: string) => ({
    top,
  }),
  stickyHeight: (height: string) => ({
    height,
  }),
});

// =============================================================================
// Helpers
// =============================================================================

/**
 * Attempts to use the View Transitions API if available, otherwise falls back
 * to running the callback directly.
 */
function withViewTransition(callback: () => void): void {
  if (
    typeof document !== 'undefined' &&
    'startViewTransition' in document &&
    typeof document.startViewTransition === 'function'
  ) {
    document.startViewTransition(callback);
  } else {
    callback();
  }
}

// =============================================================================
// Component
// =============================================================================

/**
 * Application-level layout shell. Provides the structural frame for an app:
 * header, sidebar navigation, and main content area.
 *
 * Composes XDSLayout internally. Replaces internal XDSPage + XDSPageLayout pattern.
 *
 * Features:
 * - Slot-based API: `topNav`, `pageNav`, `topBanner`, `children`
 * - Two height modes: `fill` (100dvh, independent scroll) and `auto` (page scroll, sticky navs)
 * - Sidebar collapse: controlled + uncontrolled patterns
 * - Responsive sidebar collapse via breakpoint
 * - Mobile overlay sidebar with backdrop
 * - Skip-to-content link
 * - Semantic HTML: `<header>`, `<nav>`, `<main>`
 *
 * @example
 * ```tsx
 * // Standard app shell — fill mode, sidebar + header
 * <XDSAppShell
 *   topNav={<XDSTopNav title="My App" />}
 *   pageNav={<XDSPageNav items={navItems} />}
 * >
 *   <DashboardContent />
 * </XDSAppShell>
 *
 * // Header only (no sidebar)
 * <XDSAppShell topNav={<XDSTopNav title="Landing" />}>
 *   <LandingContent />
 * </XDSAppShell>
 *
 * // Auto-height for content-heavy pages
 * <XDSAppShell
 *   topNav={<XDSTopNav title="Docs" />}
 *   pageNav={<XDSPageNav items={docNav} />}
 *   height="auto"
 * >
 *   <LongDocumentContent />
 * </XDSAppShell>
 * ```
 */
export const XDSAppShell = forwardRef<HTMLDivElement, XDSAppShellProps>(
  function XDSAppShell(
    {
      children,
      'data-testid': dataTestId,
      height = 'fill',
      initialIsSidebarCollapsed = false,
      isSidebarCollapsed: controlledCollapsed,
      onSidebarCollapsedChange,
      pageNav,
      sidebarBreakpoint = 'md',
      sidebarWidth = DEFAULT_SIDEBAR_WIDTH,
      topBanner,
      topNav,
      xstyle,
    },
    ref,
  ) {
    // =========================================================================
    // Sidebar collapse state (controlled + uncontrolled)
    // =========================================================================
    const isControlled = controlledCollapsed !== undefined;
    const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(
      initialIsSidebarCollapsed,
    );
    const isCollapsed = isControlled
      ? controlledCollapsed
      : uncontrolledCollapsed;

    // Track whether we're below the breakpoint
    const [isBelowBreakpoint, setIsBelowBreakpoint] = useState(false);

    const headerRef = useRef<HTMLDivElement>(null);
    const [headerHeight, setHeaderHeight] = useState(0);

    const isFill = height === 'fill';
    const hasPageNav = pageNav != null;
    const hasTopNav = topNav != null;

    // =========================================================================
    // Responsive breakpoint handling
    // =========================================================================
    useEffect(() => {
      if (sidebarBreakpoint === 'none' || !hasPageNav) return;

      const breakpointPx = BREAKPOINT_VALUES[sidebarBreakpoint];
      const mql = window.matchMedia(`(max-width: ${breakpointPx}px)`);

      const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
        const matches = 'matches' in e ? e.matches : false;
        setIsBelowBreakpoint(matches);
        if (matches) {
          // Auto-collapse below breakpoint
          if (!isControlled) {
            setUncontrolledCollapsed(true);
          }
          onSidebarCollapsedChange?.(true);
        }
      };

      // Check initial state
      handleChange(mql);

      mql.addEventListener('change', handleChange);
      return () => mql.removeEventListener('change', handleChange);
    }, [sidebarBreakpoint, hasPageNav, isControlled, onSidebarCollapsedChange]);

    // =========================================================================
    // Header height measurement (for auto mode sticky offset)
    // =========================================================================
    useEffect(() => {
      if (isFill || !headerRef.current || typeof ResizeObserver === 'undefined')
        return;

      const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
          setHeaderHeight(entry.contentRect.height);
        }
      });

      observer.observe(headerRef.current);
      return () => observer.disconnect();
    }, [isFill]);

    // =========================================================================
    // Toggle handler
    // =========================================================================
    const handleToggleCollapse = useCallback(() => {
      const newValue = !isCollapsed;
      withViewTransition(() => {
        if (!isControlled) {
          setUncontrolledCollapsed(newValue);
        }
        onSidebarCollapsedChange?.(newValue);
      });
    }, [isCollapsed, isControlled, onSidebarCollapsedChange]);

    // =========================================================================
    // Close mobile sidebar on Escape
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
    // Determine if sidebar should show as overlay (mobile) or inline
    // =========================================================================
    const showSidebarInline = hasPageNav && !isCollapsed && !isBelowBreakpoint;
    const showSidebarOverlay = hasPageNav && !isCollapsed && isBelowBreakpoint;

    // Banner height for sticky offset (banner is not sticky, so it scrolls away)
    const bannerRef = useRef<HTMLDivElement>(null);

    // =========================================================================
    // Render
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

        {/* Top banner */}
        {topBanner != null && (
          <div ref={bannerRef} {...stylex.props(styles.banner)}>
            {topBanner}
          </div>
        )}

        {/* Header / TopNav */}
        {hasTopNav && (
          <header
            ref={headerRef}
            {...stylex.props(
              styles.headerWrapper,
              !isFill && styles.headerWrapperSticky,
            )}>
            {topNav}
          </header>
        )}

        {/* Body: sidebar + main content */}
        <div {...stylex.props(styles.bodyRow)}>
          {/* Inline sidebar (desktop, expanded) */}
          {showSidebarInline && (
            <nav
              aria-label="Application navigation"
              {...stylex.props(
                styles.sidebar,
                dynamicStyles.sidebarWidth(sidebarWidth),
                isFill && styles.sidebarFillHeight,
                !isFill && styles.sidebarSticky,
                !isFill &&
                  dynamicStyles.stickyTop(
                    hasTopNav ? `${headerHeight}px` : '0px',
                  ),
                !isFill &&
                  dynamicStyles.stickyHeight(
                    hasTopNav ? `calc(100vh - ${headerHeight}px)` : '100vh',
                  ),
              )}>
              {pageNav}
            </nav>
          )}

          {/* Main content */}
          <main
            id={MAIN_CONTENT_ID}
            role="main"
            {...stylex.props(
              styles.mainContent,
              isFill && styles.mainContentFill,
            )}>
            {children}
          </main>
        </div>

        {/* Mobile overlay sidebar */}
        {showSidebarOverlay && (
          <>
            <div
              {...stylex.props(styles.backdrop)}
              onClick={handleToggleCollapse}
              data-testid="sidebar-backdrop"
              aria-hidden="true"
            />
            <nav
              aria-label="Application navigation"
              {...stylex.props(
                styles.overlaySidebar,
                dynamicStyles.sidebarWidth(sidebarWidth),
              )}>
              {pageNav}
            </nav>
          </>
        )}
      </div>
    );
  },
);

XDSAppShell.displayName = 'XDSAppShell';
