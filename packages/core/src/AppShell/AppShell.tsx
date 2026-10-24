// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import React from 'react';

/**
 * @file AppShell.tsx
 * @input Uses React, Theme-resolved breakpoints, Layout, navigation slots, and StyleX
 * @output Exports AppShell component and AppShellProps with SSR-safe mobile layout;
 *   on a touch screen whose page scrolls, the pinned header is an iOS 26 bar
 *   (no background, the scroll edge effect of hooks/useScrollEdgeEffect)
 * @position Page shell for an application — the top-level wrapper for any app.
 *   Composes Layout internally to provide header, sideNav, and main content areas.
 *   Use for any app that needs a top nav, side navigation, and scrollable content.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/AppShell/AppShell.doc.mjs
 * - /packages/core/src/AppShell/index.ts
 * - /packages/core/src/AppShell/AppShell.test.tsx
 * - /apps/storybook/stories/AppShell.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/AppShell/ (showcase blocks)
 * - /packages/core/src/AppShell/AppShellScrollEdge.test.tsx and
 *   __tests__/AppShellScrollEdge.interaction.browser.spec.ts (the touch bar)
 */

import {
  isValidElement,
  useCallback,
  useEffect,
  useId,
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
import {Layout} from '../Layout/Layout';
import {LayoutHeader} from '../Layout/LayoutHeader';
import {LayoutPanel} from '../Layout/LayoutPanel';
import {LayoutContent} from '../Layout/LayoutContent';
import {MobileNavToggle} from '../MobileNav/MobileNavToggle';
import {MAX_CLOSE_DELAY_MS as MOBILE_NAV_MAX_CLOSE_DELAY_MS} from '../MobileNav/MobileNav';
import {SideNavRenderContext} from '../SideNav/SideNavRenderContext';
import {TopNavRenderContext} from '../TopNav/TopNavRenderContext';
import {TopNavMobileContentContext} from '../TopNav/TopNavMobileContentContext';
import {AppShellMobileContext} from './AppShellMobileContext';
import type {AppShellMobileContextValue} from './AppShellMobileContext';
import type {SpacingStep} from '../utils/types';
import type {BaseProps} from '../BaseProps';
import {mergeProps, isRenderable} from '../utils';
import {focusOutlineProps} from '../utils/focusOutline.stylex';
import {useMediaQuery} from '../hooks/useMediaQuery';
import {useTouchPresentation} from '../utils/touchPresentation';
import {useScrollEdgeEffect} from '../hooks/useScrollEdgeEffect';
import {bars, registerBarsTable} from '../motion/uikit/bars';
import {observeResize} from '../utils/sharedResizeObserver';
import {themeProps} from '../utils/themeProps';
import {useTranslator} from '../i18n';
import {useThemeDefinition} from '../theme/useTheme';
import {
  DEFAULT_WIDTH_BREAKPOINTS,
  type WidthBreakpointName,
} from '../theme/themeAdaptations';
import type {AppShellVariantMap} from './index';

import {useMergedRefs} from '../hooks/useMergedRefs';
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

const MAIN_CONTENT_ID = 'astryx-app-shell-main';

/**
 * Extra time, on top of MobileNav's own worst-case close delay, that
 * AppShell waits before flipping its `Activity` boundary to `'hidden'`.
 *
 * React's `Activity` hides its subtree with `display: none !important`
 * synchronously in the same commit as the mode flip, and re-runs the
 * cleanup of every effect inside it — which would otherwise clear
 * MobileNav's own scheduled `dialog.close()` before it fires, or cut off
 * its slide-out CSS transition before it plays (#5701). Waiting strictly
 * longer than MobileNav's own cap, rather than the same duration, means
 * this never turns into a race decided by browser timer-firing order.
 */
const ACTIVITY_HIDE_BUFFER_MS = 50;

// =============================================================================
// Types
// =============================================================================

/**
 * SideNav breakpoint options. Named points resolve through the nearest Theme;
 * without an active theme they use Astryx's default width-breakpoint map.
 */
export type AppShellBreakpoint = WidthBreakpointName | 'none';

/**
 * Navigation background style:
 * - `wash`: Nav areas use wash background, no dividers
 * - `surface`: Nav areas use surface background, no dividers
 * - `section`: Dividers between nav and content (classic look)
 * - `elevated`: Wash nav background with elevated surface content + border radius
 * @default 'elevated'
 */

/**
 * Navigation background style. Extensible via module augmentation of AppShellVariantMap.
 */
export type AppShellVariant = keyof AppShellVariantMap;

/**
 * Configuration object for mobile navigation behavior.
 * Used when you need to customize the auto mobile nav without replacing it entirely.
 */
export interface MobileNavConfig {
  /**
   * Whether to auto-render the hamburger toggle.
   * When false, use `<MobileNavToggle />` to place it yourself.
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
   * Can be an `<MobileNav>` for full drawer config (title, width, side)
   * or raw children.
   */
  content?: ReactNode;

  /**
   * Named Theme width point below which mobile nav activates. `sm`, `md`,
   * `lg`, `xl`, and `2xl` resolve through the nearest Theme's effective
   * `adaptations.widthBreakpoints`; equality belongs to the wider layout.
   * Use `none` to disable automatic mobile mode.
   * @default 'md'
   */
  breakpoint?: AppShellBreakpoint;

  /**
   * SSR hint: whether the initial render should assume mobile layout.
   * Seeds the breakpoint state so the server-rendered HTML matches
   * the client on mobile devices, avoiding a layout flash. The breakpoint
   * seed is ignored when `breakpoint` is `none`, which is always non-mobile.
   * With `height="adaptive"` it also seeds the touch-pointer assumption of
   * the server render (the page scrolls), whatever the breakpoint.
   *
   * Derive from the User-Agent header or a device-detection cookie
   * in a server component, then pass down.
   *
   * @default false
   */
  defaultIsMobile?: boolean;
}

export interface AppShellProps extends BaseProps<HTMLDivElement> {
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
  variant?: AppShellVariant;

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
   * Override individual sections with `<Section padding={...}>`.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   */
  contentPadding?: SpacingStep;

  /**
   * Height behavior:
   * - `fill`: Shell fills viewport, content scrolls internally (default)
   * - `auto`: Shell grows with content, page scrolls as a whole
   * - `adaptive`: `fill` with a mouse or trackpad, `auto` where the primary
   *   pointer is touch, so phones keep the browser's own page behaviors
   *   (scroll to top from the status bar, a toolbar that minimizes as you
   *   scroll)
   *
   * The root reports which element scrolls in `data-scroll-owner`:
   * `content` (the main region) or `document` (the page).
   * @default 'fill'
   */
  height?: 'fill' | 'auto' | 'adaptive';

  /**
   * Mobile navigation configuration.
   *
   * Accepts three shapes:
   * - **`false`** — Disable mobile nav entirely.
   * - **`MobileNavConfig` object** — Configure auto behavior (toggle, controlled state, custom content).
   * - **`ReactNode`** — Full escape hatch: provide your own `<MobileNav>` (you own everything).
   *
   * When omitted, AppShell automatically generates a mobile drawer with
   * sideNav content (and TopNav items in the future) below the breakpoint.
   *
   * @example
   * ```
   * <AppShell topNav={...} sideNav={...} />
   * <AppShell mobileNav={{ isOpen, onOpenChange }} />
   * <AppShell mobileNav={{ hasToggle: false }}>
   *   <MobileNavToggle />
   * </AppShell>
   * <AppShell mobileNav={<MobileNav header="Menu">...</MobileNav>} />
   * <AppShell mobileNav={false} />
   * ```
   */
  mobileNav?: false | MobileNavConfig | ReactNode;

  /**
   * Side navigation — typically an SideNav.
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
   * ```
   * const SIDEBAR_ROUTES = ['/dashboard', '/settings'];
   * function Layout({ children, sidebar }) {
   *   const hasSidebar = SIDEBAR_ROUTES.some(r => pathname.startsWith(r));
   *   return (
   *     <AppShell
   *       sideNav={hasSidebar ? sidebar : undefined}
   *       mobileNav={hasSidebar ? { breakpoint: 'md' } : false}>
   *       {children}
   *     </AppShell>
   *   );
   * }
   * ```
   */
  sideNav?: ReactNode;

  /**
   * Top navigation — typically an TopNav.
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
    overflow: 'clip',
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
  // Programmatic focus target for the skip link. The main container is only
  // focusable via tabIndex={-1} (never tabbable), so a focus ring around the
  // entire content area would be noise rather than guidance — suppress it.
  mainFocusTarget: {
    outline: {
      default: null,
      ':focus': 'none',
    },
  },

  elevatedBackdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: colorVars['--color-background-surface'],
    borderStartStartRadius: radiusVars['--radius-page'],
    pointerEvents: 'none',
  },
  contentWrapper: {
    display: 'contents',
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
  // Sticky header for auto height mode. The header stays at its local
  // stacking level — Field-owned input surfaces contain their own local
  // z-index layers (AST-027), so no escalated page-level value is needed
  // for the header to paint above scrolled content.
  headerSticky: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    // The local stacking owner for the scroll edge veil's zIndex: -1
    // (spec:AST-027 FR2).
    isolation: 'isolate',
  },
  // iOS 26's bar: under a finger (a coarse primary pointer, one touch model on
  // every touch device), a bar pinned over content that scrolls under it
  // paints no background of its own (UIKit's bar background is empty in every
  // appearance). What separates the content once it has moved under the bar
  // is the scroll edge effect below. A mouse keeps the opaque bar. The key is
  // the resolver's touch query, spelled literally as TOUCH_QUERY (the StyleX
  // build gives an imported at-rule key a different priority layer).
  navAreaWashTouchBar: {
    backgroundColor: {
      default: colorVars['--color-background-body'],
      '@media (pointer: coarse)': 'transparent',
    },
  },
  navAreaSurfaceTouchBar: {
    backgroundColor: {
      default: colorVars['--color-background-surface'],
      '@media (pointer: coarse)': 'transparent',
    },
  },
  // The scroll edge effect: a decorative layer behind the bar's content, as
  // tall as the bar plus `bars.scrollEdgeEffect.softExtentPt` (54.8px). It is
  // a veil of the bar's own colour over the content, never a blur: the mask
  // is `veil.maxAlpha × (1 − Φ((y − edge) / veil.softnessPt))`, its edge
  // `veil.edgeAboveContentBottomPt` (10px) above the bottom of the bar's
  // content (the header's bottom edge), sampled every 6px over ±3σ
  // (AppShellScrollEdge.test.tsx recomputes it from the table).
  // The veil is denser than UIKit's and its edge sits at the header's bottom
  // (maxAlpha 0.95 for 0.85, edge 10px lower), in every theme and mode: the
  // title keeps 4.5:1 over the brightest scrolled content (WCAG 1.4.3).
  // UIKit's values measured 2.58:1 in dark mode; see
  // AppShellScrollEdge.test.tsx.
  // useScrollEdgeEffect fades its opacity in and out on UIKit's springs (a
  // cross-fade of at most 200 ms under Reduce Motion); it starts transparent.
  // Where the browser supports prefers-reduced-transparency (Safari 26.2
  // does not yet), Reduce Transparency makes it an opaque band with a hard
  // edge at the bar's bottom, as UIKit does.
  scrollEdge: {
    display: {
      default: 'none',
      '@media (pointer: coarse)': 'block',
    },
    position: 'absolute',
    insetInline: 0,
    insetBlockStart: 0,
    height: {
      default: 'calc(100% + 54.8px)',
      '@media (prefers-reduced-transparency: reduce)': '100%',
    },
    zIndex: -1,
    pointerEvents: 'none',
    opacity: 0,
    maskImage: {
      default:
        'linear-gradient(to bottom, rgb(0 0 0 / 0.950) calc(100% - 118.8px), rgb(0 0 0 / 0.949) calc(100% - 112.8px), rgb(0 0 0 / 0.948) calc(100% - 106.8px), rgb(0 0 0 / 0.945) calc(100% - 100.8px), rgb(0 0 0 / 0.938) calc(100% - 94.8px), rgb(0 0 0 / 0.922) calc(100% - 88.8px), rgb(0 0 0 / 0.893) calc(100% - 82.8px), rgb(0 0 0 / 0.845) calc(100% - 76.8px), rgb(0 0 0 / 0.772) calc(100% - 70.8px), rgb(0 0 0 / 0.675) calc(100% - 64.8px), rgb(0 0 0 / 0.559) calc(100% - 58.8px), rgb(0 0 0 / 0.433) calc(100% - 52.8px), rgb(0 0 0 / 0.312) calc(100% - 46.8px), rgb(0 0 0 / 0.207) calc(100% - 40.8px), rgb(0 0 0 / 0.127) calc(100% - 34.8px), rgb(0 0 0 / 0.071) calc(100% - 28.8px), rgb(0 0 0 / 0.036) calc(100% - 22.8px), rgb(0 0 0 / 0.017) calc(100% - 16.8px), rgb(0 0 0 / 0.007) calc(100% - 10.8px))',
      '@media (prefers-reduced-transparency: reduce)': 'none',
    },
  },
  scrollEdgeFillBody: {
    backgroundColor: colorVars['--color-background-body'],
  },
  scrollEdgeFillSurface: {
    backgroundColor: colorVars['--color-background-surface'],
  },
  // The box useScrollEdgeEffect observes: `bars.scrollEdgeEffect.switchPt`
  // (10px) tall at the top of the page, where the content meets the pinned
  // bar at rest. It leaves the viewport once the content has moved more than
  // 10px under the bar.
  scrollEdgeSentinel: {
    position: 'absolute',
    insetBlockStart: 0,
    insetInlineStart: 0,
    width: 1,
    height: 10,
    pointerEvents: 'none',
    visibility: 'hidden',
  },
  // Sticky sideNav for auto height mode — sticks within the wrapper.
  // This div replaces the panel as the direct flex child of the middle
  // (horizontal) container, so it needs the same flex properties that
  // LayoutPanel applies: flexShrink: 0 prevents the flex container
  // from collapsing the sidenav, and overflow: clip matches the panel's
  // default so content doesn't bleed horizontally.
  sideNavSticky: {
    flexShrink: 0,
    overflow: 'clip',
    position: 'sticky',
    top: 'var(--_app-shell-header-height, 0px)',
    height: 'calc(100dvh - var(--_app-shell-header-height, 0px))',
    // Ensure children (LayoutPanel → SideNav) fill the sticky container
    display: 'flex',
    flexDirection: 'column',
  },
  // Panel fill for auto mode — panel fills the sticky container vertically
  // and scrolls independently since the page (not the panel) owns the scroll
  panelAutoFill: {
    flex: 1,
    overflow: 'auto',
  },
  // `adaptive` with a fine pointer: the side region's wrapper stays mounted
  // but generates no box.
  sideNavInFill: {
    display: 'contents',
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * Page shell for an application. Provides the structural frame for an app:
 * top navigation, side navigation, and main content area.
 *
 * Slot-based API with `topNav`, `sideNav`, `banner`, and `children`.
 * Supports three height modes (`fill`, `auto` and `adaptive`), responsive side nav
 * collapse, and mobile overlay with backdrop.
 *
 * @example
 * ```
 * <AppShell
 *   topNav={<TopNav label="Navigation" heading={<TopNavHeading heading="My App" />} />}
 *   sideNav={<SideNav>{navSections}</SideNav>}
 *   mobileNav={
 *     <MobileNav isOpen={mobileOpen} onOpenChange={(open) => setMobileOpen(open)} header="My App">
 *       {navSections}
 *     </MobileNav>
 *   }>
 *   <Content />
 * </AppShell>
 * ```
 */
export function AppShell({
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
  ...rest
}: AppShellProps) {
  const t = useTranslator();
  const activeTheme = useThemeDefinition();
  // =========================================================================
  // Parse mobileNav prop — normalize to config, custom element, or disabled
  // =========================================================================
  const mobileNavDisabled = mobileNav === false;
  const mobileNavConfig: MobileNavConfig | null =
    mobileNav != null &&
    mobileNav !== false &&
    typeof mobileNav === 'object' &&
    !isValidElement(mobileNav)
      ? (mobileNav as MobileNavConfig)
      : null;
  const sideNavBreakpoint: AppShellBreakpoint =
    mobileNavConfig?.breakpoint ?? 'md';
  // ReactNode shorthand — user provides <MobileNav> directly as the prop
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
  const activeWidthBreakpoints = activeTheme?.__adaptations?.widthBreakpoints;
  const breakpointQuery =
    sideNavBreakpoint === 'none'
      ? '(width < 0px)'
      : `(width < ${
          activeWidthBreakpoints?.[sideNavBreakpoint] ??
          DEFAULT_WIDTH_BREAKPOINTS[sideNavBreakpoint]
        }px)`;
  const isBelowBreakpoint = useMediaQuery(
    breakpointQuery,
    sideNavBreakpoint === 'none' ? false : mobileNavConfig?.defaultIsMobile,
  );
  const [uncontrolledMobileOpen, setUncontrolledMobileOpen] = useState(false);
  const isMobileNavOpen = mobileNavConfig?.isOpen ?? uncontrolledMobileOpen;

  // Holds the mobile nav's `Activity` boundary visible for a beat after a
  // close, so MobileNav's own close effect gets a real chance to run its
  // slide-out transition and schedule its delayed `dialog.close()` before
  // Activity hides the subtree (#5701). Only the CLOSE is deferred: opening
  // reads `isMobileNavOpen` directly below, so a controlled open is visible in
  // the commit that carries it instead of one effect later.
  const [isMobileNavCloseHeld, setIsMobileNavCloseHeld] =
    useState(isMobileNavOpen);
  // Arm the hold during render, from the open state itself, so no Effect has
  // to copy props into state; the Effect below only owns the release timer.
  if (isMobileNavOpen && !isMobileNavCloseHeld) {
    setIsMobileNavCloseHeld(true);
  }
  useEffect(() => {
    if (!HasActivity || isMobileNavOpen) {
      return;
    }
    const delayMs = window.matchMedia('(prefers-reduced-motion: reduce)')
      .matches
      ? 0
      : MOBILE_NAV_MAX_CLOSE_DELAY_MS + ACTIVITY_HIDE_BUFFER_MS;
    const timeout = setTimeout(() => {
      setIsMobileNavCloseHeld(false);
    }, delayMs);
    return () => clearTimeout(timeout);
  }, [isMobileNavOpen]);
  const isMobileNavActivityVisible = isMobileNavOpen || isMobileNavCloseHeld;

  const mobileNavOnOpenChange = mobileNavConfig?.onOpenChange;
  const setMobileNavOpen = useCallback(
    (open: boolean) => {
      if (!mobileNavIsControlled) {
        setUncontrolledMobileOpen(open);
      }
      mobileNavOnOpenChange?.(open);
    },
    // Depend on the callback itself, not on the config object: the documented
    // usage is an inline `mobileNav={{isOpen, onOpenChange}}` literal, which is
    // a new object every render and would otherwise churn this callback and the
    // context value memo built from it on every render of the shell.
    [mobileNavIsControlled, mobileNavOnOpenChange],
  );

  // Move focus to the main content container when the skip link is activated.
  // Hash navigation alone doesn't reliably move focus in every browser, so
  // focus the target explicitly (it's focusable via tabIndex={-1}).
  const handleSkipLinkClick = useCallback(() => {
    document.getElementById(MAIN_CONTENT_ID)?.focus();
  }, []);

  // `adaptive` resolves through the shared touch resolver: the page scrolls
  // under a finger (a coarse primary pointer). The browser attaches its page
  // behaviors to the document's own scroll (the toolbar or address bar that
  // minimizes as the page scrolls, the pull at the top; on iOS, scroll to top
  // from a status-bar tap), and a scroll region inside a viewport-high shell
  // gets none of them. The SSR hint for mobile layout also seeds it, so a
  // server-rendered phone page starts out scrolling the page.
  const {isTouch} = useTouchPresentation({
    isTouch: mobileNavConfig?.defaultIsMobile ?? false,
  });
  // A `height` outside the union keeps the recorded `auto` minimum height,
  // with no sticky regions, as before `adaptive` existed.
  const isFill = height === 'fill' || (height === 'adaptive' && !isTouch);
  const isAuto = height === 'auto' || (height === 'adaptive' && isTouch);
  const scrollsDocument = !isFill;

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
  // Section normally inherits the shell's surface background. Its auto-height
  // header needs to paint that surface itself while content scrolls beneath it.
  // On a touch screen the pinned header paints nothing (navArea*TouchBar) and
  // the scroll edge effect fades the content under it into that same colour.
  const barFillsWithBody = variant === 'wash' || variant === 'elevated';
  const headerAreaStyle = isAuto
    ? barFillsWithBody
      ? styles.navAreaWashTouchBar
      : styles.navAreaSurfaceTouchBar
    : navAreaStyle;
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
      shellEl.style.setProperty('--_app-shell-header-height', `${height}px`);
    };

    return observeResize(headerEl, () => updateHeight());
  }, [isAuto]);

  // =========================================================================
  // iOS 26's scroll edge effect under the pinned header (touch, page scroll)
  // =========================================================================
  // Under a finger (the resolver's touch presentation above, the same on
  // every touch device) the pinned header is iOS 26's bar; a mouse keeps
  // today's.
  const scrollEdge = useScrollEdgeEffect({
    enabled: isAuto && isTouch,
    springs: bars.scrollEdgeEffect,
    registerSprings: registerBarsTable,
  });
  const scrollEdgeLayer = isAuto ? (
    <div
      aria-hidden="true"
      ref={scrollEdge.layerRef}
      {...stylex.props(
        styles.scrollEdge,
        barFillsWithBody
          ? styles.scrollEdgeFillBody
          : styles.scrollEdgeFillSurface,
      )}
    />
  ) : null;

  // =========================================================================
  // Determine if sideNav should show as overlay (mobile) or inline
  // =========================================================================
  const showSideNavInline = hasSideNav && !isBelowBreakpoint;

  // Mobile nav rendering modes:
  // 1. ReactNode shorthand — user provided <MobileNav> directly
  const shouldRenderMobileNavReactNode = mobileNavReactNode != null;
  // 2. Config with custom content
  const shouldRenderConfigContent =
    mobileNavEnabled && mobileNavConfigContent != null && isBelowBreakpoint;

  // =========================================================================
  // Mobile context — shared with MobileNavToggle and future TopNav mobile
  // =========================================================================
  // Stable id shared by the drawer (applied as its `id`) and the toggle
  // (referenced via `aria-controls`) so screen readers know what it controls.
  const mobileNavId = useId();
  const mobileContextValue = useMemo<AppShellMobileContextValue>(
    () => ({
      isMobile: isBelowBreakpoint,
      isMobileNavOpen,
      mobileNavId,
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
      mobileNavId,
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
      <SideNavRenderContext value="drawer-content">
        {sideNav}
      </SideNavRenderContext>
    ) : null;

  const drawerMobileContentValue = hasSideNav ? (
    // eslint-disable-next-line @eslint-react/no-unstable-context-value -- context transports ReactNode; instability is inherent
    <SideNavRenderContext value="drawer-content">
      {sideNav}
    </SideNavRenderContext>
  ) : null;

  const topNavContent = hasTopNav ? (
    isBelowBreakpoint && !mobileNavDisabled && mobileNavReactNode == null ? (
      <TopNavMobileContentContext value={mobileContentValue}>
        <TopNavRenderContext value="mobile-bar">{topNav}</TopNavRenderContext>
      </TopNavMobileContentContext>
    ) : (
      topNav
    )
  ) : null;

  // The iOS 26 bar draws no hairline on a touch screen; the scroll edge
  // effect separates the content instead.
  const isTouchBar = isAuto && isTouch;
  // A sidenav-only layout below the breakpoint renders its own top bar
  // (autoMobileTopBar below); the scroll edge effect then belongs to it.
  const shouldShowAutoToggle =
    !mobileNavDisabled && mobileNavHasToggle && isBelowBreakpoint;
  const autoMobileTopBarShown =
    shouldShowAutoToggle && !hasTopNav && hasSideNav;
  const headerInner =
    hasTopNav || hasBanner ? (
      <LayoutHeader
        padding={0}
        hasDivider={navHasDividers && hasTopNav && !isTouchBar}>
        {hasBanner && (
          <div {...stylex.props(styles.banner, navAreaStyle)}>{banner}</div>
        )}
        {hasTopNav && topNavContent}
      </LayoutHeader>
    ) : undefined;

  const headerContent = isRenderable(headerInner) ? (
    <div
      ref={headerRef}
      // Top-level banner landmark for the header region (topNav + banner).
      // Safe here: the wrapper is never nested inside main/nav/other landmarks.
      role="banner"
      {...mergeProps(
        themeProps('app-shell-header', {variant}),
        stylex.props(headerAreaStyle, isAuto && styles.headerSticky),
      )}>
      {autoMobileTopBarShown ? null : scrollEdgeLayer}
      {headerInner}
    </div>
  ) : undefined;

  // =========================================================================
  // Build sideNav content
  //
  // In auto mode, the sideNav panel is not internally scrollable (the page
  // scrolls as a whole), but it gets sticky positioning so it stays pinned
  // below the header while the main content scrolls. A wrapper div applies
  // the sticky behavior since LayoutPanel doesn't accept style/className.
  // =========================================================================
  const sideNavPanel = showSideNavInline ? (
    <LayoutPanel
      padding={0}
      hasDivider={navHasDividers}
      isScrollable={isFill}
      {...themeProps('app-shell-sidenav', {variant})}
      xstyle={[
        navAreaStyle,
        isAuto && stickyBgStyle,
        isAuto && styles.panelAutoFill,
      ]}>
      {sideNav}
    </LayoutPanel>
  ) : undefined;

  // Under `adaptive` the wrapper stays in both pointer states and only its
  // style changes, so a pointer change never remounts the side region (a
  // collapsed SideNav stays collapsed). With a fine pointer it generates no
  // box, and the panel lays out as in `fill`.
  const sideNavContent =
    sideNavPanel != null && (isAuto || height === 'adaptive') ? (
      <div
        {...stylex.props(isAuto ? styles.sideNavSticky : styles.sideNavInFill)}>
        {sideNavPanel}
      </div>
    ) : (
      sideNavPanel
    );

  // =========================================================================
  // Build main content
  // =========================================================================
  const shouldElevateWithCorner = isElevated && hasTopNav && showSideNavInline;

  const mainInner = (
    <LayoutContent
      padding={contentPadding ?? 0}
      role="main"
      id={MAIN_CONTENT_ID}
      // Focusable skip-link target (WCAG 2.4.1) — without tabIndex, several
      // browsers won't move focus to the div when the skip link is activated.
      tabIndex={-1}
      isScrollable={isFill}
      xstyle={[contentAreaStyle, styles.mainFocusTarget]}>
      {children}
    </LayoutContent>
  );

  // Keep the parent and mainInner's position stable across breakpoints. Outside
  // the elevated desktop layout, the wrapper generates no layout box.
  const mainContent = (
    <div
      {...stylex.props(
        shouldElevateWithCorner
          ? styles.elevatedContentWrapper
          : styles.contentWrapper,
      )}>
      {shouldElevateWithCorner && (
        <div {...stylex.props(styles.elevatedBackdrop)} />
      )}
      {mainInner}
    </div>
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
  // For sidenav-only layouts with no TopNav, render the sideNav in topbar
  // mode — it shows heading + footer icons horizontally, with the hamburger
  const autoMobileTopBar = autoMobileTopBarShown ? (
    <div
      // Banner landmark for the mobile top bar, so the sidenav-only layout
      // exposes the same landmark structure as the topNav one. Only when
      // there is no headerContent: a banner slot with no topNav renders both,
      // and two sibling banner regions is worse than the one this restores.
      role={headerContent == null ? 'banner' : undefined}
      {...mergeProps(
        themeProps('app-shell-header', {variant}),
        stylex.props(headerAreaStyle, isAuto && styles.headerSticky),
      )}>
      {scrollEdgeLayer}
      <LayoutHeader padding={0} hasDivider={navHasDividers && !isTouchBar}>
        <div
          {...stylex.props(styles.autoMobileTopBar)}
          role="navigation"
          aria-label={t('@astryx.appShell.mobileNavigation')}>
          <SideNavRenderContext value="topbar">{sideNav}</SideNavRenderContext>
          <MobileNavToggle />
        </div>
      </LayoutHeader>
    </div>
  ) : undefined;

  return (
    <AppShellMobileContext value={mobileContextValue}>
      <div
        {...rest}
        ref={useMergedRefs(ref, shellRef)}
        data-testid={dataTestId}
        data-scroll-owner={scrollsDocument ? 'document' : 'content'}
        {...mergeProps(
          themeProps('app-shell', {variant}),
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
        {isAuto && (
          <div
            aria-hidden="true"
            ref={scrollEdge.sentinelRef}
            {...stylex.props(styles.scrollEdgeSentinel)}
          />
        )}
        {/* Skip-to-content link */}
        <a
          href={`#${MAIN_CONTENT_ID}`}
          onClick={handleSkipLinkClick}
          {...focusOutlineProps.focusVisible(styles.skipLink)}
          data-testid="skip-to-content">
          {t('@astryx.appShell.skipToContent')}
        </a>

        <Layout
          height={isFill ? 'fill' : 'auto'}
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
            <ActivityWrapper
              mode={isMobileNavActivityVisible ? 'visible' : 'hidden'}>
              {/* SideNav drawer — always mounted so presence detection works.
                Hidden when TopNav owns the drawer (combined mode passes
                sideNav via TopNav's mobile content context instead). */}
              {hasSideNav && !hasTopNav && (
                <SideNavRenderContext value="drawer">
                  {sideNav}
                </SideNavRenderContext>
              )}
              {hasTopNav && (
                <TopNavMobileContentContext value={drawerMobileContentValue}>
                  <TopNavRenderContext value="drawer">
                    {topNav}
                  </TopNavRenderContext>
                </TopNavMobileContentContext>
              )}
            </ActivityWrapper>
          )}
      </div>
    </AppShellMobileContext>
  );
}

AppShell.displayName = 'AppShell';
