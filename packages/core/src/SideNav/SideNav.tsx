// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SideNav.tsx
 * @input Uses React, HTMLAttributes, ReactNode, StyleX
 * @output Exports SideNav component and SideNavProps
 * @position Core implementation; consumed by index.ts, tested by SideNav.test.tsx
 *
 * Sidebar navigation container with five zones: header + topContent (sticky together),
 * children (scrollable), footer, and footerIcons (sticky bottom).
 *
 * Supports optional resize via drag handle at the inline-end edge.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/SideNav/SideNav.doc.mjs
 * - /packages/core/src/SideNav/SideNav.test.tsx
 * - /packages/core/src/SideNav/index.ts
 * - /apps/storybook/stories/SideNav.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/SideNav/ (showcase blocks)
 */

import {
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {durationVars, easeVars, spacingVars} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import {
  findExternalCollapseToggle,
  SideNavCollapseContext,
  type SideNavCollapseState,
  type SideNavCollapsibleConfig,
  type SideNavImperativeCollapseHandle,
} from './SideNavCollapseContext';
import {SideNavCollapseButton} from './SideNavCollapseButton';
import {useSideNavRenderMode} from './SideNavRenderContext';
import {MobileNav} from '../MobileNav/MobileNav';
import {useResizable} from '../Resizable/useResizable';
import type {ResizableConfig} from '../Resizable/useResizable';
import {ResizeHandle} from '../Resizable/ResizeHandle';
import {themeProps} from '../utils/themeProps';
import {SizeProvider} from '../SizeContext/SizeContext';
import {useDevWarning} from '../hooks/useDevWarning';
import {devWarn} from '../utils/devWarning';
import {useTranslator} from '../i18n';

import {useMergedRefs} from '../hooks/useMergedRefs';
// =============================================================================
// Constants
// =============================================================================

/** Width below which dragging collapses the sidebar (when collapsible). */
const COLLAPSE_THRESHOLD = 160;

// =============================================================================
// Collapse config
// =============================================================================

interface ResolvedCollapseConfig {
  isCollapsible: boolean;
  defaultIsCollapsed: boolean;
  isCollapsed: boolean | undefined;
  onCollapsedChange: ((isCollapsed: boolean) => void) | undefined;
  /** Dev-warning text when both props address the same state, else null. */
  conflict: string | null;
}

/**
 * `collapsible` and `resizable` can each carry collapse state, so they are
 * normalized here into one config with one owner — two independently
 * initialized copies of the same boolean is what rendered an expanded nav at
 * width 0 in #4790. `resizable` is the superset, so its keys win.
 */
function resolveCollapseConfig(
  collapsible: boolean | SideNavCollapsibleConfig,
  resizable: boolean | ResizableConfig,
): ResolvedCollapseConfig {
  const fromCollapsible = typeof collapsible === 'object' ? collapsible : {};
  const fromResizable = typeof resizable === 'object' ? resizable : {};

  const resizableCarriesCollapse =
    fromResizable.defaultIsCollapsed !== undefined ||
    fromResizable.isCollapsed !== undefined ||
    fromResizable.onCollapseChange !== undefined;

  return {
    isCollapsible: !!collapsible || resizableCarriesCollapse,
    defaultIsCollapsed:
      (resizableCarriesCollapse
        ? fromResizable.defaultIsCollapsed
        : fromCollapsible.defaultIsCollapsed) ?? false,
    isCollapsed: resizableCarriesCollapse
      ? fromResizable.isCollapsed
      : fromCollapsible.isCollapsed,
    onCollapsedChange: resizableCarriesCollapse
      ? fromResizable.onCollapseChange
      : fromCollapsible.onCollapsedChange,
    conflict: describeCollapseConflict(fromCollapsible, fromResizable),
  };
}

/**
 * Names the keys that address the same collapse state on both props, and
 * which one won. Silent for the common non-overlapping combinations —
 * `collapsible: true` alongside a resize config is not a conflict.
 */
function describeCollapseConflict(
  collapsible: SideNavCollapsibleConfig,
  resizable: ResizableConfig,
): string | null {
  const collapsibleKeys = [
    collapsible.defaultIsCollapsed !== undefined && 'defaultIsCollapsed',
    collapsible.isCollapsed !== undefined && 'isCollapsed',
    collapsible.onCollapsedChange !== undefined && 'onCollapsedChange',
  ].filter((key): key is string => key !== false);
  const resizableKeys = [
    resizable.defaultIsCollapsed !== undefined && 'defaultIsCollapsed',
    resizable.isCollapsed !== undefined && 'isCollapsed',
    resizable.onCollapseChange !== undefined && 'onCollapseChange',
  ].filter((key): key is string => key !== false);

  if (collapsibleKeys.length === 0 || resizableKeys.length === 0) {
    return null;
  }

  return (
    `${collapsibleKeys.map(key => `collapsible.${key}`).join(', ')} and ` +
    `${resizableKeys.map(key => `resizable.${key}`).join(', ')} address the ` +
    `same collapse state. resizable wins; the collapsible ` +
    `${collapsibleKeys.length === 1 ? 'value is' : 'values are'} ignored.`
  );
}

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
  // Fully-hidden collapse (`collapsedWidth: 0`) with `isAnimated`: only
  // `transform` animates; `width` is layout-triggering and never tweens
  // (motion convention; MobileNav's drawer is the precedent, RTL flip
  // included). The slide layer carries the expanded content out through the
  // root's overflow clip. The box itself holds its expanded width for exactly
  // the slide, via a width transition on a `step-end` curve, then snaps shut
  // in one reflow. The expanded state declares no width transition, so
  // expanding snaps the box open at once and the layer slides back in.
  // Interrupts are safe: re-expanding mid-slide cancels the pending snap (the
  // width never moved) and the transform reverses from wherever it was, with
  // no JS and no transitionend to race.
  slideLayer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    backgroundColor: 'inherit',
    transform: 'translateX(0)',
    transitionProperty: 'transform',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  slideLayerHidden: {
    transform: {
      default: 'translateX(-100%)',
      ':is([dir="rtl"] *)': 'translateX(100%)',
    },
  },
  rootSlideCollapse: {
    transitionProperty: 'width',
    // Must equal the slide's duration: the box holds until the layer is out.
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    // `step-end` computes no intermediate width: the start value holds for
    // the whole duration and the end value lands in a single jump, so the
    // width is never tweened. A zero duration stays reserved for the
    // reduced-motion query above, as scripts/build-css.test.mjs requires.
    transitionTimingFunction: 'step-end',
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
    paddingBlockStart: 0,
    alignItems: 'center',
  },
  // Drawer footer — pushed to bottom of the scrollable content area
  drawerFooter: {
    display: 'flex',
    flexDirection: 'column',
    marginBlockStart: 'auto',
    gap: spacingVars['--spacing-2'],
    paddingBlockStart: spacingVars['--spacing-2'],
  },
  drawerFooterIcons: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
  // Resizable container — wraps the nav and the drag handle. It passes the
  // surface background through: the nav paints `inherit`, and a transparent
  // wrapper would hand it nothing, leaving the sticky zones see-through.
  resizableContainer: {
    position: 'relative',
    display: 'flex',
    flexShrink: 0,
    height: '100%',
    backgroundColor: 'inherit',
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

/**
 * Cascaded to the icon rows through `SizeContext` so the built-in collapse
 * button and the consumer's `footerIcons` come out one height. An explicit
 * `size` on a child still wins.
 */
const FOOTER_ICON_SIZE = 'sm';

// =============================================================================
// Types
// =============================================================================

export interface SideNavProps extends BaseProps<HTMLElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLElement>;

  /**
   * Imperative collapse handle for SideNavCollapseButton instances rendered
   * outside this SideNav. This intentionally stays separate from `ref`, which
   * continues to expose the root HTMLElement.
   *
   * @deprecated Hand the same controlled `collapsible` config to SideNav and
   * to the outside button instead.
   */
  handleRef?: React.Ref<SideNavImperativeCollapseHandle>;

  /**
   * Header area — typically SideNavHeading. Sticky at top.
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
   * Uses `useResizable` internally and renders `ResizeHandle` in
   * overlay mode. When collapsed, the handle is hidden.
   *
   * - `true` — resizable with defaults (260px initial, 180–480px range)
   * - Object — configured via `ResizableConfig`:
   *   - `defaultWidth` — initial width in pixels (default: 260)
   *   - `minWidth` — minimum width in pixels (default: 180)
   *   - `maxWidth` — maximum width in pixels (default: 480)
   *   - `autoSaveId` — localStorage key for persisting width and collapse state
   *   - `onWidthChange` — called when the width changes
   *   - `defaultIsCollapsed` / `isCollapsed` / `onCollapseChange` — collapse
   *     state, when `resizable` should own it rather than `collapsible`
   *
   * When both props carry collapse state, `resizable` wins and a dev warning
   * names the conflicting keys.
   *
   * @default false
   */
  resizable?: boolean | ResizableConfig;

  /**
   * Enables collapse behavior. The sidebar can be collapsed to a narrow
   * icon-only toolbar.
   *
   * - `true` — enables collapse with default toggle button and uncontrolled state
   * - Object — enables collapse with advanced configuration:
   *   - `defaultIsCollapsed` — start collapsed (uncontrolled)
   *   - `isCollapsed` + `onCollapsedChange` — controlled mode. Pass the same
   *     object to a `SideNavCollapseButton` rendered outside this SideNav
   *   - `hasButton` — render built-in collapse button (default: true)
   *   - `buttonLabel` — accessibility label for the collapse button
   *   - `collapsedWidth` — collapsed width in px. Defaults to the icon rail;
   *     `0` hides the nav entirely (`inert`, with focus parked first on the
   *     outside `SideNavCollapseButton` that shares this nav's state)
   *   - `isAnimated` — slide the content out and back in when collapsing to
   *     `collapsedWidth: 0`; only `transform` animates. Any other width
   *     snaps and warns in development
   *
   * @default false
   */
  collapsible?: boolean | SideNavCollapsibleConfig;
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
 * <SideNav
 *   header={<SideNavHeading heading="My App" headingHref="/" />}
 *   topContent={<Button label="Create new" variant="primary" />}>
 *   <SideNavSection heading="Main">
 *     <SideNavItem label="Dashboard" isSelected href="/dashboard" />
 *     <SideNavItem label="Projects" href="/projects" />
 *   </SideNavSection>
 * </SideNav>
 * ```
 */
export function SideNav({
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
  handleRef,
  ...props
}: SideNavProps) {
  const t = useTranslator();
  // Parse collapsible prop
  const collapsibleConfig = typeof collapsible === 'object' ? collapsible : {};
  const hasCollapseButton = collapsibleConfig.hasButton ?? true;
  const collapsedWidth = collapsibleConfig.collapsedWidth;
  const isAnimated = collapsibleConfig.isAnimated ?? false;

  // Resizable config
  const resizableConfig = typeof resizable === 'object' ? resizable : {};
  const isResizable = !!resizable;

  const collapseConfig = resolveCollapseConfig(collapsible, resizable);
  const {isCollapsible, onCollapsedChange} = collapseConfig;

  useDevWarning(
    'SideNav',
    collapseConfig.conflict ?? '',
    collapseConfig.conflict != null,
  );

  const navRef = useRef<HTMLElement>(null);
  const mergedNavRef = useMergedRefs(ref, navRef);
  const collapseStateRef = useRef<SideNavCollapseState>({
    isCollapsed: false,
    toggle: () => {},
    isCollapsible,
  });

  // useResizable is the sole collapse owner in every SideNav mode. Keeping that
  // owner mounted when resize is toggled preserves the current collapse state.
  const resizableHook = useResizable({
    defaultSize: resizableConfig.defaultWidth ?? 260,
    minSizePx: resizableConfig.minWidth ?? 180,
    maxSizePx: resizableConfig.maxWidth ?? 480,
    collapsible: isCollapsible,
    collapsedSize: COLLAPSE_THRESHOLD,
    autoSaveId: resizableConfig.autoSaveId,
    defaultIsCollapsed: collapseConfig.defaultIsCollapsed,
    isCollapsed: collapseConfig.isCollapsed,
    onSizeChange: resizableConfig.onWidthChange,
    onCollapseChange: onCollapsedChange,
  });

  const collapsed = resizableHook.isCollapsed;

  // Fully-hidden mode (`collapsedWidth: 0`) has no visible collapsed UI, so
  // its content keeps the expanded layout: the rail's icon-only morph would be
  // pointless invisible work, and the slide has to carry the expanded panel
  // out and back in without a re-layout.
  const isHiddenMode = collapsedWidth === 0;
  // The slide exists only for the fully hidden collapse; the rail snaps by
  // design (see `isAnimated`). Asking for motion and getting none must not
  // be silent.
  useDevWarning(
    'SideNav',
    `collapsible.isAnimated only slides a fully hidden collapse ` +
      `(collapsedWidth: 0). With ${
        collapsedWidth == null
          ? 'the default icon rail'
          : `collapsedWidth: ${collapsedWidth}`
      } the collapse snaps. Set collapsedWidth: 0 or drop isAnimated.`,
    isAnimated && !isHiddenMode,
  );
  // A nav collapsed to zero width is invisible but still in the DOM, so its
  // links would keep taking keyboard focus and stay in the a11y tree. `inert`
  // removes both. The icon rail is *visible*, so it stays interactive.
  const isFullyHidden = collapsed && isHiddenMode;
  // Collapsed to something visible: the icon rail's icon-only layout.
  const isRailCollapsed = collapsed && !isHiddenMode;
  const isSlideAnimated = isCollapsible && isAnimated && isHiddenMode;

  // `inert` must never land while focus is inside the nav: an inert ancestor
  // yanks focus to <body> at once, before the slide has shown anything. So the
  // first fully-hidden render leaves inert off, a pre-paint layout effect
  // parks focus deliberately (on a collapse toggle rendered outside the nav
  // when there is one, else an explicit blur), and inert lands in the
  // synchronous follow-up commit, still before paint. Seeding from
  // isFullyHidden keeps inert in server-rendered markup for navs that start
  // collapsed.
  const [isInertApplied, setIsInertApplied] = useState(isFullyHidden);
  if (!isFullyHidden && isInertApplied) {
    // Expanding: drop inert in this same render so links are focusable again.
    setIsInertApplied(false);
  }
  const hasWarnedReleasedFocusRef = useRef(false);
  useLayoutEffect(() => {
    if (!isFullyHidden || isInertApplied) {
      return;
    }
    const nav = navRef.current;
    const active = document.activeElement;
    if (nav != null && active instanceof HTMLElement && nav.contains(active)) {
      // Only a toggle that shares this nav's collapse state; with two navs on
      // the page any other toggle is the wrong control.
      const toggle = findExternalCollapseToggle(nav, {
        onCollapsedChange,
        handleRef,
      });
      if (toggle != null) {
        toggle.focus();
      } else {
        active.blur();
        if (!hasWarnedReleasedFocusRef.current) {
          hasWarnedReleasedFocusRef.current = true;
          devWarn(
            'SideNav',
            'focus was inside the nav as it collapsed to collapsedWidth: 0, ' +
              'and no SideNavCollapseButton outside the nav shares its ' +
              'collapse state, so focus was released to <body>. Hand the ' +
              'same controlled collapsible config (or handleRef) to an ' +
              'outside SideNavCollapseButton to park focus there instead.',
          );
        }
      }
    }
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- inert has to land in the commit right after focus is parked, before paint
    setIsInertApplied(true);
  }, [isFullyHidden, isInertApplied, onCollapsedChange, handleRef]);

  const toggle = useCallback(() => {
    const next = !collapsed;

    // Deprecated `handleRef` path only: an out-of-tree button reads this
    // snapshot while rendering, which can happen before SideNav re-renders.
    collapseStateRef.current = {
      ...collapseStateRef.current,
      isCollapsed: next,
    };

    if (next) {
      resizableHook.collapse();
    } else {
      resizableHook.expand();
    }
  }, [collapsed, resizableHook]);

  const showResizeHandle = isResizable && !collapsed;

  collapseStateRef.current = {
    isCollapsed: collapsed,
    toggle,
    isCollapsible,
  };

  // Children read this for their collapsed (icon-rail) form, which only
  // exists for a *visible* collapsed nav: hidden mode reports expanded so the
  // content keeps its layout while it slides. The deprecated handle's
  // snapshot above keeps the real state; the outside button's label and
  // chevron come from it.
  const collapseContext = {
    isCollapsed: isRailCollapsed,
    toggle,
    isCollapsible,
  };

  useImperativeHandle(
    handleRef,
    () => ({
      getCollapseState: () => collapseStateRef.current,
    }),
    [],
  );

  // Render mode — when inside AppShell mobile layout, render subsets
  const renderMode = useSideNavRenderMode();

  // =========================================================================
  // Topbar mode — heading + footerIcons in a horizontal bar
  // =========================================================================
  if (renderMode === 'topbar') {
    return (
      <div
        data-testid={testId}
        {...mergeProps(
          themeProps('side-nav', {mode: 'topbar'}),
          stylex.props(styles.topbar, xstyle),
          className,
          style,
        )}>
        {header}
        <div {...stylex.props(styles.topbarIcons)}>
          <SizeProvider value={FOOTER_ICON_SIZE}>{footerIcons}</SizeProvider>
        </div>
      </div>
    );
  }

  // =========================================================================
  // Drawer mode — render inside MobileNav with heading as header
  // =========================================================================
  const hasDrawerFooter = !!(footer || footerIcons);

  if (renderMode === 'drawer') {
    return (
      <MobileNav
        header={header}
        data-testid={testId}
        xstyle={xstyle}
        className={className}
        style={style}
        {...props}>
        {topContent}
        {children}
        {hasDrawerFooter && (
          <div {...stylex.props(styles.drawerFooter)}>
            {footer}
            {footerIcons && (
              <div {...stylex.props(styles.drawerFooterIcons)}>
                <SizeProvider value={FOOTER_ICON_SIZE}>
                  {footerIcons}
                </SizeProvider>
              </div>
            )}
          </div>
        )}
      </MobileNav>
    );
  }

  // =========================================================================
  // Drawer-content mode — render just items (no MobileNav wrapper)
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
                <SizeProvider value={FOOTER_ICON_SIZE}>
                  {footerIcons}
                </SizeProvider>
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
  // The built-in collapse button only renders when collapse is enabled and it
  // hasn't been opted out via `collapsible.hasButton: false` (e.g. when the
  // consumer places a SideNavCollapseButton in the header instead).
  const showCollapseButton = isCollapsible && hasCollapseButton;

  // Nav width, in precedence order:
  //   collapsed + explicit collapsedWidth -> that width (0 = fully hidden)
  //   collapsed, no collapsedWidth        -> undefined, so the `rootCollapsed`
  //                                          class supplies the icon rail
  //   expanded + resizable                -> the dragged size
  //   expanded                            -> undefined, so `root` supplies 260
  // The collapsed branch has to win over the resizable one: useResizable
  // already drives its own size to 0 on collapse, but SideNav has always
  // discarded that and let the rail class through. An explicit collapsedWidth
  // is the consumer overriding the rail, so it beats both.
  const hasCollapsedWidth = collapsed && collapsedWidth != null;
  const navWidth = hasCollapsedWidth
    ? collapsedWidth
    : isResizable && !collapsed
      ? resizableHook.size
      : undefined;
  const navStyle: React.CSSProperties | undefined =
    hasCollapsedWidth || isResizable
      ? {...(style ?? {}), width: navWidth}
      : style;

  const zones = (
    <>
      {hasStickyTop && (
        <div
          {...stylex.props(
            styles.stickyTop,
            isRailCollapsed && styles.stickyTopCollapsed,
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
          isRailCollapsed && styles.scrollableCollapsed,
          hasStickyTop ? styles.scrollableWithTop : styles.scrollableNoTop,
          hasStickyBottom
            ? styles.scrollableWithBottom
            : styles.scrollableNoBottom,
        )}>
        {children}
      </div>
      {(hasStickyBottom || showCollapseButton) && (
        <div
          {...stylex.props(
            styles.stickyBottom,
            isRailCollapsed && styles.stickyBottomCollapsed,
          )}>
          {footer}
          <div
            {...stylex.props(
              styles.footerRow,
              isRailCollapsed && styles.footerRowCollapsed,
            )}>
            <SizeProvider value={FOOTER_ICON_SIZE}>
              {showCollapseButton && <SideNavCollapseButton />}
              {footerIcons}
            </SizeProvider>
          </div>
        </div>
      )}
    </>
  );

  const navElement = (
    <nav
      ref={mergedNavRef}
      role="navigation"
      aria-label={t('@astryx.sideNav.label')}
      data-testid={testId}
      inert={(isFullyHidden && isInertApplied) || undefined}
      {...mergeProps(
        themeProps('side-nav'),
        stylex.props(
          styles.root,
          isRailCollapsed && styles.rootCollapsed,
          isSlideAnimated && collapsed && styles.rootSlideCollapse,
          xstyle,
        ),
        className,
        navStyle,
      )}
      {...props}>
      {isSlideAnimated ? (
        // The slab the slide moves; see `slideLayer`.
        <div
          {...stylex.props(
            styles.slideLayer,
            collapsed && styles.slideLayerHidden,
          )}>
          {zones}
        </div>
      ) : (
        zones
      )}
    </nav>
  );

  // Overlay drag handle inside the nav when resizable.
  // Uses ResizeHandle in overlay mode so the handle sits inside
  // the panel's overflow: clip bounds. The wrapper stays while collapsed and
  // only the handle goes: moving the nav out of the wrapper would remount
  // it, detaching whatever had focus inside before it could be parked.
  const content = isResizable ? (
    <div {...stylex.props(styles.resizableContainer)}>
      {navElement}
      {showResizeHandle && (
        <ResizeHandle
          data-testid="astryx-sidenav-resize-handle"
          direction="horizontal"
          position="overlay"
          pillPlacement="end"
          isAlwaysVisible={false}
          resizable={resizableHook.props}
          label={t('@astryx.sideNav.resizeSidebar')}
        />
      )}
    </div>
  ) : (
    navElement
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

SideNav.displayName = 'SideNav';
