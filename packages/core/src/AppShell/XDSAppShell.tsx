// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import React from 'react';

/**
 * @file XDSAppShell.tsx
 * @input Uses React, XDSLayout, XDSLayoutHeader, XDSLayoutPanel, XDSLayoutContent, StyleX
 * @output Exports XDSAppShell component and XDSAppShellProps type
 * @position Application-level layout shell — the top-level wrapper for any app.
 *   Composes XDSLayout internally to provide header, sideNav, and main content areas.
 *   Use for any app that needs a top nav, side navigation, and scrollable content.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/AppShell/AppShell.doc.mjs
 * - /packages/core/src/AppShell/index.ts
 * - /packages/core/src/AppShell/XDSAppShell.test.tsx
 * - /apps/storybook/stories/AppShell.stories.tsx
 * - /packages/cli/templates/blocks/components/AppShell/ (showcase blocks)
 */

import {
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  fontWeightVars,
  radiusVars,
  spacingVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {XDSLayout} from '../Layout/XDSLayout';
import {XDSLayoutHeader} from '../Layout/XDSLayoutHeader';
import {XDSLayoutPanel} from '../Layout/XDSLayoutPanel';
import {XDSLayoutContent} from '../Layout/XDSLayoutContent';
import {XDSMobileNavToggle} from '../MobileNav/XDSMobileNavToggle';
import {XDSSideNavRenderContext} from '../SideNav/XDSSideNavRenderContext';
import {XDSTopNavRenderContext} from '../TopNav/XDSTopNavRenderContext';
import {XDSTopNavMobileContentContext} from '../TopNav/XDSTopNavMobileContentContext';
import {XDSAppShellMobileContext} from './XDSAppShellMobileContext';
import type {XDSAppShellMobileContextValue} from './XDSAppShellMobileContext';
import type {SpacingStep} from '../utils/types';
import type {XDSBaseProps} from '../XDSBaseProps';
import {xdsClassName, mergeProps, mergeRefs, isRenderable} from '../utils';
import {useMediaQuery} from '../hooks/useMediaQuery';
import {observeResize, unobserveResize} from '../utils/sharedResizeObserver';

const HasActivity = typeof React.Activity !== 'undefined';
const ActivityWrapper = HasActivity
  ? ({
      mode,
      children,
    }: {
      mode: 'visible' | 'hidden';
      children: React.ReactNode;
    }) => <React.Activity mode={mode}>{children}</React.Activity>
  : ({children}: {mode: string; children: React.ReactNode}) => <>{children}</>;

// =============================================================================
// Constants
// =============================================================================

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

/**
 * Navigation background style:
 * - `wash`: Nav areas use wash background, no dividers
 * - `surface`: Nav areas use surface background, no dividers
 * - `section`: Dividers between nav and content (classic look)
 * - `elevated`: Wash nav background with elevated surface content + border radius
 * @default 'elevated'
 */
/**
 * Extensible variant map for XDSAppShell.
 *
 * Theme packages can add custom variants via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@xds/core/AppShell' {
 *   interface XDSAppShellVariantMap {
 *     'glass': true;
 *   }
 * }
 * ```
 */
export interface XDSAppShellVariantMap {
  wash: true;
  surface: true;
  section: true;
  elevated: true;
}

/**
 * Navigation background style. Extensible via module augmentation of XDSAppShellVariantMap.
 */
export type XDSAppShellVariant = keyof XDSAppShellVariantMap;

/**
 * Configuration object for mobile navigation behavior.
 * Used when you need to customize the auto mobile nav without replacing it entirely.
 */
export interface XDSMobileNavConfig {
  /**
   * Whether to auto-render the hamburger toggle.
   * When false, use `<XDSMobileNavToggle />` to place it yourself.
   * @default true
   */
  hasToggle?: boolean;

  /**
   * Controlled open state. When provided, AppShell doesn't manage
   * mobile nav state internally.
   */
  isOpen?: boolean;

  /**
   * Callback when the mobile nav drawer open state changes.
   */
  onOpenChange?: (isOpen: boolean) => void;

  /**
   * Custom drawer content. Replaces the auto-generated drawer.
   * Can be an `<XDSMobileNav>` for full drawer config (title, width, side)
   * or raw children.
   */
  content?: ReactNode;

  /**
   * Breakpoint below which mobile nav activates.
   * @default 'md'
   */
  breakpoint?: XDSAppShellBreakpoint;

  /**
   * SSR hint: whether the initial render should assume mobile layout.
   * Seeds the breakpoint state so the server-rendered HTML matches
   * the client on mobile devices, avoiding a layout flash.
   *
   * Derive from the User-Agent header or a device-detection cookie
   * in a server component, then pass down.
   *
   * @default false
   */
  defaultIsMobile?: boolean;
}

export interface XDSAppShellProps extends XDSBaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Navigation background style controlling how nav areas contrast with content.
   * - `wash`: Nav uses wash background, no dividers
   * - `surface`: Nav uses surface background, no dividers
   * - `section`: Dividers between nav and content (classic look)
   * - `elevated`: Wash nav with elevated surface content area + border radius
   * @default 'elevated'
   */
  variant?: XDSAppShellVariant;

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
   * Padding for the main content area using the spacing scale.
   * Set based on the dominant content pattern for the page:
   * - `4` (16px) — standard padding for forms, settings, text-heavy pages
   * - `0` — no padding, for dashboards, maps, tables that need edge-to-edge
   * Override individual sections with `<XDSSection padding={...}>`.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   */
  contentPadding?: SpacingStep;

  /**
   * Height behavior:
   * - `fill`: Shell fills viewport, content scrolls internally (default)
   * - `auto`: Shell grows with content, page scrolls as a whole
   * @default 'fill'
   */
  height?: 'fill' | 'auto';

  /**
   * Mobile navigation configuration.
   *
   * Accepts three shapes:
   * - **`false`** — Disable mobile nav entirely.
   * - **`MobileNavConfig` object** — Configure auto behavior (toggle, controlled state, custom content).
   * - **`ReactNode`** — Full escape hatch: provide your own `<XDSMobileNav>` (you own everything).
   *
   * When omitted, AppShell automatically generates a mobile drawer with
   * sideNav content (and TopNav items in the future) below the breakpoint.
   *
   * @example
   * ```
   * <XDSAppShell topNav={...} sideNav={...} />
   * <XDSAppShell mobileNav={{ isOpen, onOpenChange }} />
   * <XDSAppShell mobileNav={{ hasToggle: false }}>
   *   <XDSMobileNavToggle />
   * </XDSAppShell>
   * <XDSAppShell mobileNav={<XDSMobileNav title="Menu">...</XDSMobileNav>} />
   * <XDSAppShell mobileNav={false} />
   * ```
   */
  mobileNav?: false | XDSMobileNavConfig | ReactNode;

  /**
   * Side navigation — typically an XDSSideNav.
   *
   * Pass `undefined` (or omit) when a page has no side navigation.
   * Do NOT pass a component that renders `null` — AppShell treats any
   * renderable value as "sidenav exists".
   *
   * **Next.js parallel routes:** Conditionally pass the slot based on
   * the current route rather than relying on a `default.tsx` that
   * returns `null`:
   *
   * @example
   * ```tsx
   * const SIDEBAR_ROUTES = ['/dashboard', '/settings'];
   *
   * function Layout({ children, sidebar }) {
   *   const hasSidebar = SIDEBAR_ROUTES.some(r => pathname.startsWith(r));
   *   return (
   *     <XDSAppShell
   *       sideNav={hasSidebar ? sidebar : undefined}
   *       mobileNav={hasSidebar ? { breakpoint: 'md' } : false}
   *     >
   *       {children}
   *     </XDSAppShell>
   *   );
   * }
   * ```
   */
  sideNav?: ReactNode;

  /**
   * Top navigation — typically an XDSTopNav.
   * Same contract as `sideNav` — pass `undefined` when there's no top nav.
   */
  topNav?: ReactNode;
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
  variantWash: {
    backgroundColor: colorVars['--color-background-body'],
  },
  variantSurface: {
    backgroundColor: colorVars['--color-background-surface'],
  },
  variantSection: {
    backgroundColor: colorVars['--color-background-surface'],
  },
  variantElevated: {
    backgroundColor: colorVars['--color-background-body'],
  },
  rootFill: {
    height: '100dvh',
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
    paddingBlock: {
      default: 0,
      ':focus': spacingVars['--spacing-2'],
    },
    paddingInline: {
      default: 0,
      ':focus': spacingVars['--spacing-4'],
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
      ':focus': spacingVars['--spacing-2'],
    },
    insetInlineStart: {
      default: 0,
      ':focus': spacingVars['--spacing-2'],
    },
    backgroundColor: colorVars['--color-background-surface'],
    color: colorVars['--color-text-accent'],
    zIndex: 9999,
    textDecoration: 'none',
    fontWeight: fontWeightVars['--font-weight-semibold'],
    fontSize: typeScaleVars['--text-body-size'],
  },

  elevatedBackdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: colorVars['--color-background-surface'],
    borderStartStartRadius: radiusVars['--radius-page'],
    pointerEvents: 'none',
  },
  elevatedContentWrapper: {
    position: 'relative',
    display: 'flex',
    flex: 1,
    minHeight: 0,
    height: '100%',
  },
  contentBgSurface: {
    backgroundColor: colorVars['--color-background-surface'],
  },
  contentBgWash: {
    backgroundColor: colorVars['--color-background-body'],
  },
  contentBgTransparent: {
    backgroundColor: 'transparent',
    isolation: 'isolate',
  },
  navAreaWash: {
    backgroundColor: colorVars['--color-background-body'],
  },
  navAreaSurface: {
    backgroundColor: colorVars['--color-background-surface'],
  },
  banner: {
    flexShrink: 0,
  },
  hidden: {
    display: 'none',
  },
  autoMobileTopBar: {
    display: 'flex',
    alignItems: 'center',
    height: spacingVars['--spacing-12'],
    paddingInline: spacingVars['--spacing-2'],
  },
  // Sticky header for auto height mode
  headerSticky: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  // Sticky sideNav for auto height mode — sticks within the wrapper.
  // This div replaces the panel as the direct flex child of the middle
  // (horizontal) container, so it needs the same flex properties that
  // XDSLayoutPanel applies: flexShrink: 0 prevents the flex container
  // from collapsing the sidenav, and overflow: clip matches the panel's
  // default so content doesn't bleed horizontally.
  sideNavSticky: {
    flexShrink: 0,
    overflow: 'clip',
    position: 'sticky',
    top: 'var(--appshell-header-height, 0px)',
    height: 'calc(100dvh - var(--appshell-header-height, 0px))',
    // Ensure children (XDSLayoutPanel → XDSSideNav) fill the sticky container
    display: 'flex',
    flexDirection: 'column',
  },
  // Panel fill for auto mode — panel fills the sticky container vertically
  // and scrolls independently since the page (not the panel) owns the scroll
  panelAutoFill: {
    flex: 1,
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
 *   topNav={<XDSTopNav label="Navigation" heading={<XDSTopNavHeading heading="My App" />} />}
 *   sideNav={<XDSSideNav>{navSections}</XDSSideNav>}
 *   mobileNav={
 *     <XDSMobileNav isOpen={mobileOpen} onOpenChange={(open) => setMobileOpen(open)} title="My App">
 *       {navSections}
 *     </XDSMobileNav>
 *   }>
 *   <Content />
 * </XDSAppShell>
 * ```
 */
export function XDSAppShell({
  variant = 'elevated',
  banner,
  children,
  contentPadding,
  'data-testid': dataTestId,
  height = 'fill',
  mobileNav,
  sideNav,
  topNav,
  xstyle,
  className,
  style,
  ref,
}: XDSAppShellProps) {
  // =========================================================================
  // Parse mobileNav prop — normalize to config, custom element, or disabled
  // =========================================================================
  const mobileNavDisabled = mobileNav === false;
  const mobileNavConfig: XDSMobileNavConfig | null =
    mobileNav != null &&
    mobileNav !== false &&
    typeof mobileNav === 'object' &&
    !isValidElement(mobileNav)
      ? (mobileNav as XDSMobileNavConfig)
      : null;
  const sideNavBreakpoint: XDSAppShellBreakpoint =
    mobileNavConfig?.breakpoint ?? 'md';
  // ReactNode shorthand — user provides <XDSMobileNav> directly as the prop
  const mobileNavReactNode: ReactNode | null =
    mobileNav != null &&
    mobileNav !== false &&
    (isValidElement(mobileNav) || typeof mobileNav === 'string')
      ? mobileNav
      : null;
  // Custom content from config object
  const mobileNavConfigContent: ReactNode | null =
    mobileNavConfig?.content ?? null;
  const mobileNavHasToggle = mobileNavConfig?.hasToggle !== false;
  const mobileNavIsControlled = mobileNavConfig?.isOpen !== undefined;

  // =========================================================================
  // Slot presence — checks whether slot containers have rendered DOM content.
  // Refs are attached to wrapper divs around each slot; a MutationObserver
  // checks childNodes to track whether each slot has rendered content.
  // =========================================================================

  // =========================================================================
  // Mobile nav open state (controlled + uncontrolled)
  // =========================================================================
  const breakpointQuery =
    sideNavBreakpoint === 'none'
      ? '(max-width: 0px)'
      : `(max-width: ${BREAKPOINT_VALUES[sideNavBreakpoint]}px)`;
  const isBelowBreakpoint = useMediaQuery(
    breakpointQuery,
    mobileNavConfig?.defaultIsMobile,
  );
  const [uncontrolledMobileOpen, setUncontrolledMobileOpen] = useState(false);
  const isMobileNavOpen = mobileNavConfig?.isOpen ?? uncontrolledMobileOpen;

  const setMobileNavOpen = useCallback(
    (open: boolean) => {
      if (!mobileNavIsControlled) {
        setUncontrolledMobileOpen(open);
      }
      mobileNavConfig?.onOpenChange?.(open);
    },
    [mobileNavIsControlled, mobileNavConfig],
  );

  const isFill = height === 'fill';
  const isAuto = height === 'auto';

  // Nav style derived values
  const hasBanner = isRenderable(banner);
  const hasTopNav = isRenderable(topNav);
  const hasSideNav = isRenderable(sideNav);
  const hasNavContent = hasTopNav || hasSideNav;
  const mobileNavEnabled =
    !mobileNavDisabled && hasNavContent && mobileNavReactNode == null;
  const navHasDividers = variant === 'section';
  const isElevated = variant === 'elevated';
  const navAreaStyle =
    variant === 'wash' || variant === 'elevated'
      ? styles.navAreaWash
      : variant === 'surface'
        ? styles.navAreaSurface
        : undefined;
  const contentAreaStyle =
    variant === 'wash'
      ? styles.contentBgWash
      : variant === 'elevated' && hasTopNav && hasSideNav && !isBelowBreakpoint
        ? styles.contentBgTransparent
        : variant === 'surface' || variant === 'elevated'
          ? styles.contentBgSurface
          : undefined;

  // Background for sticky elements in auto mode — must be opaque so content
  // doesn't show through when scrolling underneath. Uses the nav area bg if
  // set, otherwise falls back to the shell variant bg (always surface for section).
  const stickyBgStyle = navAreaStyle ?? styles.navAreaSurface;

  // =========================================================================
  // Header height measurement for sticky sideNav offset (auto mode)
  // =========================================================================
  const headerRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuto || !headerRef.current || !shellRef.current) {
      return;
    }

    const headerEl = headerRef.current;
    const shellEl = shellRef.current;

    const updateHeight = () => {
      const height = headerEl.getBoundingClientRect().height;
      shellEl.style.setProperty('--appshell-header-height', `${height}px`);
    };

    observeResize(headerEl, () => updateHeight());
    return () => unobserveResize(headerEl);
  }, [isAuto]);

  // =========================================================================
  // Determine if sideNav should show as overlay (mobile) or inline
  // =========================================================================
  const showSideNavInline = hasSideNav && !isBelowBreakpoint;

  // Mobile nav rendering modes:
  // 1. ReactNode shorthand — user provided <XDSMobileNav> directly
  const shouldRenderMobileNavReactNode = mobileNavReactNode != null;
  // 2. Config with custom content
  const shouldRenderConfigContent =
    mobileNavEnabled && mobileNavConfigContent != null && isBelowBreakpoint;

  // =========================================================================
  // Mobile context — shared with XDSMobileNavToggle and future TopNav mobile
  // =========================================================================
  const mobileContextValue = useMemo<XDSAppShellMobileContextValue>(
    () => ({
      isMobile: isBelowBreakpoint,
      isMobileNavOpen,
      toggleMobileNav: () =>
        mobileNavEnabled && setMobileNavOpen(!isMobileNavOpen),
      openMobileNav: () => mobileNavEnabled && setMobileNavOpen(true),
      closeMobileNav: () => setMobileNavOpen(false),
      isMobileNavEnabled: mobileNavEnabled,
      hasAutoToggle: mobileNavHasToggle,
    }),
    [
      isBelowBreakpoint,
      isMobileNavOpen,
      setMobileNavOpen,
      mobileNavEnabled,
      mobileNavHasToggle,
    ],
  );

  // =========================================================================
  // Build header content (topNav + banner)
  //
  // In auto mode, the header wrapper gets sticky positioning so the topNav
  // stays pinned while the page scrolls. The ref is used to measure header
  // height for the sideNav's sticky offset.
  // =========================================================================
  // When below breakpoint, TopNav renders in mobile-bar mode (heading + endContent + toggle).
  // Wrap with mobile content context so TopNav knows there's SideNav content
  // in the drawer and shows the toggle even without its own collapsible items.
  const mobileContentValue =
    hasSideNav && mobileNavHasToggle ? (
      // eslint-disable-next-line @eslint-react/no-unstable-context-value -- context transports ReactNode; instability is inherent
      <XDSSideNavRenderContext value="drawer-content">
        {sideNav}
      </XDSSideNavRenderContext>
    ) : null;

  const drawerMobileContentValue = hasSideNav ? (
    // eslint-disable-next-line @eslint-react/no-unstable-context-value -- context transports ReactNode; instability is inherent
    <XDSSideNavRenderContext value="drawer-content">
      {sideNav}
    </XDSSideNavRenderContext>
  ) : null;

  const topNavContent = hasTopNav ? (
    isBelowBreakpoint && !mobileNavDisabled && mobileNavReactNode == null ? (
      <XDSTopNavMobileContentContext value={mobileContentValue}>
        <XDSTopNavRenderContext value="mobile-bar">
          {topNav}
        </XDSTopNavRenderContext>
      </XDSTopNavMobileContentContext>
    ) : (
      topNav
    )
  ) : null;

  const headerInner =
    hasTopNav || hasBanner ? (
      <XDSLayoutHeader padding={0} hasDivider={navHasDividers && hasTopNav}>
        {hasBanner && (
          <div {...stylex.props(styles.banner, navAreaStyle)}>{banner}</div>
        )}
        {hasTopNav && topNavContent}
      </XDSLayoutHeader>
    ) : undefined;

  const headerContent =
    headerInner != null ? (
      <div
        ref={headerRef}
        {...mergeProps(
          xdsClassName('app-shell-header', {variant}),
          stylex.props(navAreaStyle, isAuto && styles.headerSticky),
        )}>
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
      padding={0}
      hasDivider={navHasDividers}
      isScrollable={isFill}
      className={xdsClassName('app-shell-sidenav', {variant})}
      xstyle={[
        navAreaStyle,
        isAuto && stickyBgStyle,
        isAuto && styles.panelAutoFill,
      ]}>
      {sideNav}
    </XDSLayoutPanel>
  ) : undefined;

  const sideNavContent =
    sideNavPanel != null && isAuto ? (
      <div {...stylex.props(styles.sideNavSticky)}>{sideNavPanel}</div>
    ) : (
      sideNavPanel
    );

  // =========================================================================
  // Build main content
  // =========================================================================
  const shouldElevateWithCorner = isElevated && hasTopNav && showSideNavInline;

  const mainInner = (
    <XDSLayoutContent
      padding={contentPadding ?? 0}
      role="main"
      id={MAIN_CONTENT_ID}
      isScrollable={isFill}
      xstyle={contentAreaStyle}>
      {children}
    </XDSLayoutContent>
  );

  const mainContent = shouldElevateWithCorner ? (
    <div {...stylex.props(styles.elevatedContentWrapper)}>
      <div {...stylex.props(styles.elevatedBackdrop)} />
      {mainInner}
    </div>
  ) : (
    mainInner
  );

  // =========================================================================
  // Render
  //
  // TODO: Include root providers (ThemeProvider, ProseProvider, LayerProvider)
  // at the app level once they're available for wrapping.
  // =========================================================================
  // =========================================================================
  // Build auto mobile nav hamburger for TopNav
  // Injected into the headerContent when mobileNav is enabled and hasToggle
  // =========================================================================
  const shouldShowAutoToggle =
    !mobileNavDisabled && mobileNavHasToggle && isBelowBreakpoint;

  // For sidenav-only layouts with no TopNav, render the sideNav in topbar
  // mode — it shows heading + footer icons horizontally, with the hamburger
  const autoMobileTopBar =
    shouldShowAutoToggle && !hasTopNav && hasSideNav ? (
      <div
        {...mergeProps(
          xdsClassName('app-shell-header', {variant}),
          stylex.props(navAreaStyle, isAuto && styles.headerSticky),
        )}>
        <XDSLayoutHeader padding={0} hasDivider={navHasDividers}>
          <div
            {...stylex.props(styles.autoMobileTopBar)}
            role="navigation"
            aria-label="Mobile navigation">
            <XDSSideNavRenderContext value="topbar">
              {sideNav}
            </XDSSideNavRenderContext>
            <XDSMobileNavToggle />
          </div>
        </XDSLayoutHeader>
      </div>
    ) : undefined;

  return (
    <XDSAppShellMobileContext value={mobileContextValue}>
      <div
        ref={mergeRefs(ref, shellRef)}
        data-testid={dataTestId}
        {...mergeProps(
          xdsClassName('app-shell', {variant}),
          stylex.props(
            styles.root,
            variant === 'wash'
              ? styles.variantWash
              : variant === 'surface'
                ? styles.variantSurface
                : variant === 'section'
                  ? styles.variantSection
                  : styles.variantElevated,
            isFill ? styles.rootFill : styles.rootAuto,
            xstyle,
          ),
          className,
          style,
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
          padding={0}
          header={
            <>
              {headerContent}
              {autoMobileTopBar}
            </>
          }
          start={sideNavContent}
          content={mainContent}
        />

        {/* Mobile nav — always mounted below breakpoint via Activity so DOM
            presence detection works. Hidden until the drawer opens. */}
        {shouldRenderMobileNavReactNode && mobileNavReactNode}
        {shouldRenderConfigContent && mobileNavConfigContent}
        {isBelowBreakpoint &&
          !mobileNavDisabled &&
          mobileNavReactNode == null &&
          !mobileNavConfigContent && (
            <ActivityWrapper mode={isMobileNavOpen ? 'visible' : 'hidden'}>
              {/* SideNav drawer — always mounted so presence detection works.
                Hidden when TopNav owns the drawer (combined mode passes
                sideNav via TopNav's mobile content context instead). */}
              {hasSideNav && !hasTopNav && (
                <XDSSideNavRenderContext value="drawer">
                  {sideNav}
                </XDSSideNavRenderContext>
              )}
              {hasTopNav && (
                <XDSTopNavMobileContentContext value={drawerMobileContentValue}>
                  <XDSTopNavRenderContext value="drawer">
                    {topNav}
                  </XDSTopNavRenderContext>
                </XDSTopNavMobileContentContext>
              )}
            </ActivityWrapper>
          )}
      </div>
    </XDSAppShellMobileContext>
  );
}

XDSAppShell.displayName = 'XDSAppShell';
