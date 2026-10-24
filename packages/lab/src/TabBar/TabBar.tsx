// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TabBar.tsx
 * @input React, StyleX, core's theme tokens, list focus and touch
 *   presentation hooks, the UIKit tab-bar table
 *   (`@astryxdesign/core/motion/experimental`), useTabBarLens.ts for the
 *   lens's touch motion, useTabBarMinimize.ts and useTabBarSearch.ts for the
 *   bar's collapse and its search tab, and tabBarModel.ts for the geometry
 * @output Exports TabBar (an iOS 26 floating tab bar: a capsule of items
 *   with a selection lens, badges and a reselect signal), TabBarItem (one
 *   tab: its value, label, icon and badge), TabBarSearchTab (the search
 *   tab apart at the trailing end, and its field) and overflowItems (the
 *   tabs a More tab holds, read by TabBarMoreList.tsx)
 * @position Lab component (packages/lab/src/TabBar); the phone presentation
 *   of an app's top-level sections, UITabBarController's counterpart
 *
 * WHAT IT DRAWS
 *
 * A capsule floating above the bottom edge (uikit/tabBar.ts: 62 px tall,
 * 21 px from the sides and the bottom, centred and narrower with two or
 * three tabs), items 54 px tall sharing one width that UIKit derives from
 * the capsule's width and the number of tabs, spread evenly inside it so
 * that neighbours overlap, and the selection lens: a pill over the selected item that shows the
 * selected look (accent colour, semibold label) of whatever is under it.
 * As on iOS, the items are drawn twice. The plain copy is the buttons
 * themselves; the selected copy lives inside the lens, counter-translated so
 * it stays aligned with the buttons, so while the lens slides an item half
 * under it is half tinted. The lens's resting fill, and the glass it lifts
 * into, are opaque and hide the plain copy beneath it.
 *
 * Layout is CSS: the capsule is a size container and every position is a
 * `calc()` of its width, so the bar is right before hydration and through a
 * resize. Each button spans the capsule from halfway to its neighbours, so
 * a press goes to the nearest item, which is the item UIKit picks.
 *
 * HOW THE LENS MOVES
 *
 * Under a mouse (pointer presentation), the lens and the selected copy slide
 * on the theme's duration and easing (CSS transitions on `translate`, run
 * by the compositor). Under a finger (touch presentation, `pointer:
 * coarse`), useTabBarLens.ts moves it as UITabBar does: a finger landing
 * lifts the lens (it grows into clear glass and magnifies the item under
 * it) while the bar flexes, a dragging finger is chased across the items,
 * and the lift chooses the item nearest the finger; a selection made with
 * the keys slides it on UIKit's spring. Everything runs on the compositor
 * and keeps its speed when retargeted. Reduce Motion changes nothing under
 * a finger, as on iOS (`tabBar.reducedMotion`); the pointer presentation
 * follows the theme and drops the slide.
 *
 * SELECTION AND RESELECT
 *
 * The app owns the selection (`value` + `onChange`). Choosing the selected
 * tab again calls `onReselect` instead: on iOS that pops the tab's
 * navigation stack to its root (NavigationStack's `popToRoot`); on iOS 26.2
 * it does not scroll a screen already at its root to the top.
 *
 * Badges appear, change and disappear without animating, as UIKit's do.
 *
 * MORE TAB
 *
 * With more than five tabs the bar shows the first four and a More tab, as
 * UITabBarController does, at the five-tab layout. More is the selected tab
 * while `value` is `moreValue` or any tab past the fourth (the app shows
 * that section inside More's own stack, where TabBarMoreList lists them);
 * More again while it holds a tab is a reselect, back to its list.
 *
 * SEARCH TAB
 *
 * A TabBarSearchTab (UIKit's `UISearchTab`) is a circle as tall as the bar
 * at its trailing end; the other tabs share a capsule narrowed to leave it
 * room. Choosing it selects it like any tab and the bar collapses to the
 * leading circle, which holds the tab it was chosen from (choosing that
 * circle returns there), while the search field shows inline in the bar.
 * The field stays mounted (inert while hidden) so that the tap choosing the
 * tab can, in the same commit, activate the field and focus it, which is
 * what raises the keyboard on iOS. Active, its glass widens to span the
 * screen but for the search circle, which is now the field's cancel button
 * (it calls the field handle's `cancel`), and both rise to sit above the
 * software keyboard (useTabBarSearch.ts); the field draws only its content
 * inside the host TabBarSearchContext hands it.
 *
 * Accessibility: a `tablist` of `tab` buttons (`aria-selected`), one tab stop
 * with the arrow keys, Home and End moving between tabs and Enter or Space
 * choosing one. A badge is part of its tab's name (`badgeLabel`, or the badge
 * itself). A disabled tab is dimmed, skipped by the keys and never chosen.
 * Collapsed, the bar is one button for assistive technology, as on iOS: the
 * circle, named after the selected tab and collapsed (`aria-expanded`), the
 * tabs inert until it expands; activated from the keys, focus lands on the
 * selected tab.
 *
 * SYNC: When modified, update TabBar.doc.mjs, TabBar.test.tsx,
 * TabBarMoreList.tsx, useTabBarLens.ts, useTabBarMinimize.ts,
 * useTabBarSearch.ts, tabBarModel.ts and
 * __tests__/TabBar.interaction.browser.spec.ts.
 */

import {
  Children,
  isValidElement,
  useCallback,
  useId,
  useRef,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import {flushSync} from 'react-dom';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '@astryxdesign/core';
import {useListFocus, useMergedRefs} from '@astryxdesign/core/hooks';
import {useTranslator} from '@astryxdesign/core/i18n';
import {Icon} from '@astryxdesign/core/Icon';
import {useTouchPresentation} from '@astryxdesign/core/gestures/experimental';
import {uikit} from '@astryxdesign/core/motion/experimental';
import {
  colorVars,
  durationVars,
  easeVars,
  focusVars,
  fontWeightVars,
  radiusVars,
  shadowVars,
  typographyVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {mergeProps, themeProps} from '@astryxdesign/core/utils';
import {VisuallyHidden} from '@astryxdesign/core/VisuallyHidden';
import {tabBarItemMarker} from './tabBar.stylex';
import {
  accessoryBox,
  accessoryEnd,
  itemWidthCss,
  naturalWidth,
  searchFieldBox,
} from './tabBarModel';
import {useTabBarLens} from './useTabBarLens';
import {useTabBarMinimize} from './useTabBarMinimize';
import {TabBarSearchContext, useTabBarSearch} from './useTabBarSearch';

const {tabBar} = uikit;

// =============================================================================
// Types
// =============================================================================

export interface TabBarItemProps {
  /** Identifies the tab in `value`, `onChange` and `onReselect`. */
  value: string;
  /** The tab's name, shown under its icon. */
  label: string;
  /** The tab's icon, drawn in the current text colour (an `<Icon />`). */
  icon: ReactNode;
  /** The icon while the tab is selected (a filled variant). Defaults to `icon`. */
  selectedIcon?: ReactNode;
  /**
   * A badge over the icon's top-trailing corner: a count or a short string.
   * Omit it, or pass an empty string, for no badge.
   */
  badge?: string | number;
  /**
   * What assistive technology reads for the badge, after the label
   * ("3 unread"). Defaults to the badge itself.
   */
  badgeLabel?: string;
  /**
   * Shows the tab dimmed and keeps it from being chosen: a tap, the keys and
   * a lift of the lens over it leave the selection as it is.
   */
  isDisabled?: boolean;
}

export interface TabBarProps extends Omit<
  BaseProps<HTMLDivElement>,
  'onChange'
> {
  /** Ref forwarded to the root element. */
  ref?: React.Ref<HTMLDivElement>;
  /** The selected tab's `value`. */
  value: string;
  /** Called with a tab's `value` when a different tab is chosen. */
  onChange: (value: string) => void;
  /**
   * Called with the selected tab's `value` when it is chosen again: pop its
   * navigation stack to the root, as iOS does.
   */
  onReselect?: (value: string) => void;
  /** Names the tab bar for assistive technology. */
  label?: string;
  /**
   * Whether scrolling the page down collapses the bar into a circle holding
   * the selected tab's icon (UIKit's `tabBarMinimizeBehavior`): reaching the
   * top of the page or activating the circle expands it. Under a finger
   * only; a mouse-driven bar stays expanded.
   * @default 'never'
   */
  minimizeBehavior?: 'never' | 'onScrollDown';
  /**
   * A bottom accessory, such as a music player's now-playing bar: a capsule
   * above the bar that moves down inline beside the minimized circle (UIKit's
   * `bottomAccessory`). Pass a function to adapt the content to where it is.
   */
  bottomAccessory?:
    ReactNode | ((placement: TabBarAccessoryPlacement) => ReactNode);
  /**
   * The More tab's value, when there are more than five tabs: the bar shows
   * the first four and a More tab, which `value` selects as this or as any
   * tab past the fourth (UIKit's `moreNavigationController`).
   * @default 'more'
   */
  moreValue?: string;
  /** The tabs: `TabBarItem` elements, in order. */
  children: ReactNode;
}

/** Where the bottom accessory is: above the bar, or inline beside its circle. */
export type TabBarAccessoryPlacement = 'expanded' | 'inline';

/**
 * One tab of a TabBar. It renders nothing on its own: TabBar reads its props
 * and draws the tab (it must be a direct child of TabBar).
 */
export function TabBarItem(_props: TabBarItemProps): null {
  return null;
}

export interface TabBarSearchTabProps {
  /** Identifies the search tab in `value`, `onChange` and `onReselect`. */
  value: string;
  /** The tab's name for assistive technology ("Search"). */
  label: string;
  /** The search glyph, drawn in the current text colour (an `<Icon />`). */
  icon: ReactNode;
  /**
   * The search field, shown in the bar while the search tab is selected. It
   * stays mounted (hidden and inert otherwise), so a tap can focus it.
   */
  children?: ReactNode;
  /** Whether the field is active: raised above the keyboard. */
  isActive?: boolean;
  /** Called when the search tab's tap activates the field. */
  onActiveChange?: (isActive: boolean) => void;
  /**
   * The field's handle: focused by the tap that activates it, and cancelled
   * (`cancel`, when it has one) by the search circle, which is the active
   * field's cancel button. Without `cancel`, the circle reports
   * `onActiveChange(false)`.
   */
  fieldRef?: RefObject<{focus(): void; blur(): void; cancel?(): void} | null>;
  /**
   * Whether choosing the search tab activates its field at once (UIKit's
   * `automaticallyActivatesSearch`); otherwise the field waits inline.
   * @default true
   */
  automaticallyActivates?: boolean;
}

/**
 * The search tab of a TabBar (UIKit's `UISearchTab`): a circle as tall as the
 * bar at its trailing end, apart from the other tabs. Like TabBarItem it
 * renders nothing on its own and must be a direct child of TabBar.
 */
export function TabBarSearchTab(_props: TabBarSearchTabProps): null {
  return null;
}

function readSearch(children: ReactNode): TabBarSearchTabProps | null {
  for (const child of Children.toArray(children)) {
    if (isValidElement(child) && child.type === TabBarSearchTab) {
      return (child as ReactElement<TabBarSearchTabProps>).props;
    }
  }
  return null;
}

function readItems(children: ReactNode): TabBarItemProps[] {
  return Children.toArray(children).flatMap(child =>
    isValidElement(child) && child.type === TabBarItem
      ? [(child as ReactElement<TabBarItemProps>).props]
      : [],
  );
}

/** More than this many tabs and the bar shows the first four and More. */
const MAX_TABS = 5;

/**
 * The tabs past the fourth when there are more than five: the ones a More
 * tab holds.
 */
export function overflowItems(children: ReactNode): TabBarItemProps[] {
  const items = readItems(children);
  return items.length > MAX_TABS ? items.slice(MAX_TABS - 1) : [];
}

function hasBadge(badge: string | number | undefined): boolean {
  return badge != null && badge !== '';
}

// =============================================================================
// Geometry, as CSS on the capsule (a size container: 100cqw is its width)
// =============================================================================

const px = (value: number) => `${value}px`;
const INSET = px(tabBar.itemInset);

/** The items' shared width (and the resting lens's), inside a calc(). */
const size = (count: number) => itemWidthCss(count);

/** The distance between neighbouring items' centres. */
function pitch(count: number): string {
  return count > 1
    ? `((100cqw - ${px(2 * tabBar.itemInset)} - ${size(count)}) / ${count - 1})`
    : '0px';
}

/** An item's centre from the capsule's inline start, inside a calc(). */
function center(index: number, count: number): string {
  return count > 1
    ? `${INSET} + ${size(count)} / 2 + ${pitch(count)} * ${index}`
    : '50cqw';
}

/**
 * An item button's column: from halfway to the previous item to halfway to
 * the next (the capsule's edges for the first and last), and where the item
 * itself starts inside it.
 */
function column(
  index: number,
  count: number,
): {start: string; width: string; itemStart: string} {
  if (count <= 1) {
    return {
      start: '0px',
      width: '100cqw',
      itemStart: `calc(50cqw - ${size(count)} / 2)`,
    };
  }
  const half = `${pitch(count)} / 2`;
  const edgeWidth = `calc(${INSET} + ${size(count)} / 2 + ${half})`;
  if (index === 0) {
    return {start: '0px', width: edgeWidth, itemStart: INSET};
  }
  return {
    start: `calc(${center(index, count)} - ${half})`,
    width: index === count - 1 ? edgeWidth : `calc(${pitch(count)})`,
    itemStart: `calc(${half} - ${size(count)} / 2)`,
  };
}

/** How far the lens's resting place is from the first item. */
function lensOffset(index: number, count: number): string {
  return count > 1 ? `calc(${pitch(count)} * ${index})` : '0px';
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    position: 'fixed',
    insetInline: 0,
    bottom: 0,
    zIndex: 2,
    display: 'flex',
    justifyContent: 'center',
    boxSizing: 'border-box',
    pointerEvents: 'none',
  },
  rootInset: (inset: string) => ({
    paddingInline: inset,
    paddingBottom: inset,
  }),
  // The bar's box: the capsule fills it; the accessory is placed from it.
  bar: {
    position: 'relative',
    flexGrow: 1,
    minWidth: 0,
    pointerEvents: 'none',
  },
  barSize: (height: string, maxWidth: string) => ({height, maxWidth}),
  capsule: {
    position: 'relative',
    width: '100%',
    height: '100%',
    containerType: 'inline-size',
    pointerEvents: 'auto',
    touchAction: 'manipulation',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    WebkitTouchCallout: 'none',
  },
  // Minimized, only the circle takes touches; the page gets the rest.
  capsuleMinimized: {
    pointerEvents: 'none',
  },
  // Beside a search tab: the capsule leaves it room at the trailing end.
  capsuleBesideSearch: (room: string) => ({
    width: `calc(100% - ${room})`,
  }),
  search: {
    position: 'absolute',
    top: 0,
    margin: 0,
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: colorVars['--color-text-primary'],
    font: 'inherit',
    pointerEvents: 'auto',
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',
  },
  searchBox: (start: string, size: string) => ({
    insetInlineStart: start,
    width: size,
    height: size,
  }),
  searchPress: {
    position: 'absolute',
    inset: 0,
  },
  searchGlass: {
    position: 'absolute',
    inset: 0,
    borderRadius: radiusVars['--radius-full'],
    outlineStyle: {
      default: 'none',
      [stylex.when.ancestor(':focus-visible', tabBarItemMarker)]:
        focusVars['--focus-outline-style'],
    },
    outlineWidth: focusVars['--focus-outline-width'],
    outlineColor: focusVars['--focus-outline-color'],
    outlineOffset: focusVars['--focus-outline-offset'],
  },
  searchSelected: {
    color: colorVars['--color-accent'],
  },
  // The search field's host, inline in the bar's row; the field rides the
  // keyboard on it while active.
  accessoryAside: {
    pointerEvents: 'none',
  },
  searchHost: {
    position: 'absolute',
    pointerEvents: 'none',
  },
  searchFieldShown: {
    pointerEvents: 'auto',
  },
  searchField: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  searchFieldBox: (start: string, width: string) => ({
    insetInlineStart: start,
    width,
  }),
  searchFieldContent: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
  },
  // While searching, the leading circle holds the tab the search tab was
  // chosen from, in its plain colour.
  circlePlain: {
    color: colorVars['--color-text-primary'],
  },
  // The capsule's glass, in three pieces that can contract into a circle
  // without distorting its round ends (useTabBarMinimize.ts).
  platter: (half: string) => ({
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    transformOrigin: {
      default: `${half} ${half}`,
      ':is([dir="rtl"] *)': `calc(100% - ${half}) ${half}`,
    },
  }),
  glass: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-background-popover']} 78%, transparent)`,
    backdropFilter: 'blur(16px) saturate(180%)',
    boxShadow: shadowVars['--shadow-med'],
  },
  // Each piece keeps its shadow off the pieces it meets.
  platterStart: (half: string) => ({
    insetInlineStart: 0,
    width: half,
    borderStartStartRadius: half,
    borderEndStartRadius: half,
    clipPath: {
      default: 'inset(-32px 0 -32px -32px)',
      ':is([dir="rtl"] *)': 'inset(-32px -32px -32px 0)',
    },
  }),
  platterMiddle: (half: string) => ({
    insetInlineStart: half,
    insetInlineEnd: half,
    clipPath: 'inset(-32px 0)',
    transformOrigin: {
      default: 'left center',
      ':is([dir="rtl"] *)': 'right center',
    },
  }),
  platterEnd: (half: string) => ({
    insetInlineEnd: 0,
    width: half,
    borderStartEndRadius: half,
    borderEndEndRadius: half,
    clipPath: {
      default: 'inset(-32px -32px -32px 0)',
      ':is([dir="rtl"] *)': 'inset(-32px 0 -32px -32px)',
    },
  }),
  // Above the capsule: inline, it moves down over the contracting glass.
  accessory: {
    position: 'absolute',
    zIndex: 1,
    pointerEvents: 'auto',
  },
  accessoryBox: (start: string, width: string, height: string) => ({
    insetInlineStart: start,
    width,
    height,
  }),
  accessoryAbove: (gap: string) => ({
    bottom: `calc(100% + ${gap})`,
  }),
  accessoryInline: (top: string) => ({
    top,
  }),
  accessoryGlass: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  accessoryContent: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: radiusVars['--radius-full'],
  },
  circle: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radiusVars['--radius-full'],
    color: colorVars['--color-accent'],
    pointerEvents: 'none',
  },
  circleButton: {
    margin: 0,
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    font: 'inherit',
    outlineStyle: {
      default: 'none',
      ':focus-visible': focusVars['--focus-outline-style'],
    },
    outlineWidth: focusVars['--focus-outline-width'],
    outlineColor: focusVars['--focus-outline-color'],
    outlineOffset: focusVars['--focus-outline-offset'],
    WebkitTapHighlightColor: 'transparent',
  },
  circleActive: {
    pointerEvents: 'auto',
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
  },
  itemDisabled: {
    color: colorVars['--color-text-disabled'],
  },
  item: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    margin: 0,
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: colorVars['--color-text-primary'],
    font: 'inherit',
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',
  },
  column: (start: string, width: string) => ({
    insetInlineStart: start,
    width,
  }),
  itemBox: {
    position: 'absolute',
    display: 'block',
    borderRadius: radiusVars['--radius-full'],
    outlineStyle: {
      default: 'none',
      [stylex.when.ancestor(':focus-visible', tabBarItemMarker)]:
        focusVars['--focus-outline-style'],
    },
    outlineWidth: focusVars['--focus-outline-width'],
    outlineColor: focusVars['--focus-outline-color'],
    outlineOffset: focusVars['--focus-outline-offset'],
  },
  box: (start: string, top: string, width: string, height: string) => ({
    insetInlineStart: start,
    top,
    width,
    height,
  }),
  icon: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    insetInline: 0,
    overflow: 'hidden',
    textAlign: 'center',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily: typographyVars['--font-family-body'],
    fontWeight: fontWeightVars['--font-weight-medium'],
  },
  labelGeometry: (top: string, height: string, fontSize: string) => ({
    top,
    height,
    fontSize,
    lineHeight: height,
  }),
  labelSelected: {
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  lens: {
    position: 'absolute',
    pointerEvents: 'none',
    transitionProperty: 'translate',
    transitionDuration: {
      default: durationVars['--duration-medium'],
      // The touch presentation moves the lens on UIKit's spring (animator).
      '@media (pointer: coarse)': '0s',
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  lensRest: (offset: string) => ({
    translate: {
      default: `${offset} 0`,
      ':is([dir="rtl"] *)': `calc(-1 * ${offset}) 0`,
    },
  }),
  lensBody: {
    position: 'absolute',
    inset: 0,
  },
  lensShadow: {
    position: 'absolute',
    inset: 0,
    borderRadius: radiusVars['--radius-full'],
    boxShadow: shadowVars['--shadow-med'],
    opacity: 0,
  },
  lensClip: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    borderRadius: radiusVars['--radius-full'],
  },
  lensGlass: {
    position: 'absolute',
    inset: 0,
    borderRadius: radiusVars['--radius-full'],
    // The lifted lens: the capsule's own surface with a light rim, opaque so
    // the plain copy under it stays hidden.
    backgroundColor: colorVars['--color-background-popover'],
    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${colorVars['--color-text-primary']} 10%, transparent)`,
    opacity: 0,
  },
  lensFill: {
    position: 'absolute',
    inset: 0,
    // Opaque: it hides the plain copy of the item under the lens.
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-text-primary']} 9%, ${colorVars['--color-background-popover']})`,
  },
  copyInner: {
    position: 'absolute',
    inset: 0,
  },
  copyOuter: {
    position: 'absolute',
    width: '100cqw',
    transitionProperty: 'translate',
    transitionDuration: {
      default: durationVars['--duration-medium'],
      '@media (pointer: coarse)': '0s',
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  copyOuterGeometry: (inset: string, height: string) => ({
    insetInlineStart: `calc(-1 * ${inset})`,
    top: `calc(-1 * ${inset})`,
    height,
  }),
  copyRest: (offset: string) => ({
    translate: {
      default: `calc(-1 * ${offset}) 0`,
      ':is([dir="rtl"] *)': `${offset} 0`,
    },
  }),
  copyItem: {
    position: 'absolute',
    color: colorVars['--color-accent'],
  },
  badges: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  badge: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    whiteSpace: 'nowrap',
    fontFamily: typographyVars['--font-family-body'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    fontVariantNumeric: 'tabular-nums',
    backgroundColor: colorVars['--color-error'],
    color: colorVars['--color-on-error'],
  },
  badgeGeometry: (
    start: string,
    top: string,
    height: string,
    paddingInline: string,
    fontSize: string,
  ) => ({
    insetInlineStart: start,
    top,
    height,
    minWidth: height,
    paddingInline,
    borderRadius: `calc(${height} / 2)`,
    fontSize,
    lineHeight: height,
  }),
});

// =============================================================================
// Pieces
// =============================================================================

const ITEM_TOP = px(tabBar.itemInset);
const ITEM_HEIGHT = px(tabBar.itemHeight);
const ICON_START = `calc(50% - ${px(tabBar.iconSize / 2)})`;
const ICON_TOP = px(tabBar.iconCenterY - tabBar.iconSize / 2);
const ICON_SIZE = px(tabBar.iconSize);
const HALF_BAR = px(tabBar.barHeight / 2);
const HALF_ACCESSORY = px(tabBar.accessoryHeight / 2);
const ACCESSORY_HEIGHT = px(tabBar.accessoryHeight);
/** The inline accessory's start and top (its width follows the bar's). */
const INLINE_ACCESSORY = accessoryBox(0, true);
/** The room a search tab takes at the bar's trailing end. */
const SEARCH_ROOM = px(tabBar.barHeight + tabBar.searchGap);
/** The inline search field (its width follows the bar's), and the active one relative to it. */
const INLINE_FIELD = searchFieldBox(0, false);
const ACTIVE_FIELD = searchFieldBox(0, true);
const ACTIVE_FIELD_SHIFT = {
  start: px(ACTIVE_FIELD.start - INLINE_FIELD.start),
  width: px(ACTIVE_FIELD.width - INLINE_FIELD.width),
};
const SEARCH_SIZE = px(tabBar.barHeight);
const SEARCH_ICON_INSET = px((tabBar.barHeight - tabBar.iconSize) / 2);
const CIRCLE_INSET = px((tabBar.barHeight - tabBar.minimizedSize) / 2);
const CIRCLE_SIZE = px(tabBar.minimizedSize);
const CIRCLE_ICON_INSET = px((tabBar.minimizedSize - tabBar.iconSize) / 2);
const LABEL_TOP = px(tabBar.labelTop);
const LABEL_HEIGHT = px(tabBar.labelSize * 1.2);
const LABEL_SIZE = px(tabBar.labelSize);

/** An item's icon and label, in the plain or the selected look. */
function ItemFace({
  item,
  isSelectedLook,
}: {
  item: TabBarItemProps;
  isSelectedLook: boolean;
}) {
  return (
    <>
      <span
        aria-hidden
        {...stylex.props(
          styles.icon,
          styles.box(ICON_START, ICON_TOP, ICON_SIZE, ICON_SIZE),
        )}>
        {isSelectedLook ? (item.selectedIcon ?? item.icon) : item.icon}
      </span>
      <span
        aria-hidden={isSelectedLook || undefined}
        {...stylex.props(
          styles.label,
          styles.labelGeometry(LABEL_TOP, LABEL_HEIGHT, LABEL_SIZE),
          isSelectedLook && styles.labelSelected,
        )}>
        {item.label}
      </span>
    </>
  );
}

// =============================================================================
// TabBar
// =============================================================================

/**
 * The iOS 26 tab bar: the app's top-level sections as a floating capsule at
 * the bottom of the screen, with a selection lens that slides between them.
 *
 * @example
 * ```
 * <TabBar value={tab} onChange={setTab} onReselect={popToRoot} label="Sections">
 *   <TabBarItem value="home" label="Home" icon={<Icon icon={HomeIcon} />} />
 *   <TabBarItem value="inbox" label="Inbox" icon={<Icon icon={InboxIcon} />} badge={3} />
 * </TabBar>
 * ```
 */
export function TabBar({
  value,
  onChange,
  onReselect,
  label,
  minimizeBehavior = 'never',
  bottomAccessory,
  moreValue = 'more',
  children,
  xstyle,
  className,
  style,
  ref,
  ...props
}: TabBarProps) {
  const t = useTranslator();
  const allItems = readItems(children);
  const overflow = overflowItems(children);
  const hasMore = overflow.length > 0;
  // More than five tabs: the first four and a More tab, as on iOS.
  const items: TabBarItemProps[] = hasMore
    ? [
        ...allItems.slice(0, MAX_TABS - 1),
        {
          value: moreValue,
          label: t('@astryx.tabBar.more'),
          icon: <Icon icon="moreHorizontal" size="lg" />,
        },
      ]
    : allItems;
  const search = readSearch(children);
  const hasSearch = search != null;
  const count = items.length;
  // A tab past the fourth is shown inside More: More is the selected tab.
  const isMoreSelected =
    hasMore &&
    (value === moreValue || overflow.some(item => item.value === value));
  const selectedIndex = isMoreSelected
    ? MAX_TABS - 1
    : items.findIndex(item => item.value === value);
  const baseId = useId();

  const {isTouch} = useTouchPresentation();
  const capsuleRef = useRef<HTMLDivElement | null>(null);
  const {listRef, handleKeyDown, handleFocus} = useListFocus<HTMLDivElement>({
    itemSelector: '[role="tab"]',
    orientation: 'horizontal',
    hasRovingTabIndex: true,
  });
  const choose = useCallback(
    (item: {value: string; isDisabled?: boolean}) => {
      if (item.isDisabled === true) {
        return;
      }
      // More again while it holds a tab returns its list, as iOS pops More's
      // navigation stack: a reselect.
      if (
        item.value === value ||
        (item.value === moreValue && isMoreSelected)
      ) {
        onReselect?.(item.value);
      } else {
        onChange(item.value);
      }
    },
    [value, onChange, onReselect, moreValue, isMoreSelected],
  );
  const isSearchSelected = search != null && search.value === value;
  // The tab the search tab was chosen from: the leading circle holds it while
  // searching, and choosing it leaves the search tab.
  const previousValueRef = useRef<string | null>(null);
  if (!isSearchSelected && selectedIndex >= 0) {
    previousValueRef.current = value;
  }
  const previousIndex = items.findIndex(
    item => item.value === previousValueRef.current,
  );
  const shownIndex = isSearchSelected
    ? Math.max(previousIndex, 0)
    : selectedIndex;
  const isSearchActive = isSearchSelected && (search?.isActive ?? false);
  const chooseSearch = () => {
    if (search == null) {
      return;
    }
    // Active, the circle is the field's cancel button.
    if (isSearchActive) {
      const field = search.fieldRef?.current;
      if (field?.cancel != null) {
        field.cancel();
      } else {
        search.onActiveChange?.(false);
      }
      return;
    }
    const activates = search.automaticallyActivates ?? true;
    if (isSearchSelected && (!activates || isSearchActive)) {
      onReselect?.(search.value);
      return;
    }
    // One commit: the field becomes visible and focusable before the focus,
    // inside the tap, which is what lets iOS raise the keyboard.
    flushSync(() => {
      if (!isSearchSelected) {
        onChange(search.value);
      }
      if (activates) {
        search.onActiveChange?.(true);
      }
    });
    if (activates) {
      search.fieldRef?.current?.focus();
    }
  };
  const minimize = useTabBarMinimize({
    capsuleRef,
    count,
    hasSearch,
    isSearching: isSearchSelected,
    isEnabled: minimizeBehavior === 'onScrollDown' && isTouch,
  });
  const searchHostRef = useRef<HTMLDivElement | null>(null);
  const searchMotion = useTabBarSearch({
    capsuleRef,
    hostRef: searchHostRef,
    isSearching: isSearchSelected,
    isActive: isSearchActive,
    isTouch,
  });
  const mergedSearchHostRef = useMergedRefs(searchHostRef, searchMotion.host);
  const cancelPressedRef = useRef(false);
  const releaseCancel = () => {
    if (cancelPressedRef.current) {
      cancelPressedRef.current = false;
      searchMotion.pressCancel(false);
    }
  };
  const circleRef = useRef<HTMLButtonElement | null>(null);
  const lens = useTabBarLens({
    capsuleRef,
    count,
    selectedIndex: shownIndex,
    isTouch,
    isMinimized: minimize.isCollapsed,
    onLift: index => choose(items[index]),
  });
  const mergedCapsuleRef = useMergedRefs(capsuleRef, listRef, lens.capsule);
  const mergedCircleRef = useMergedRefs(minimize.circleIcon, circleRef);
  const {isCollapsed: isMinimized, expand} = minimize;
  const placement: TabBarAccessoryPlacement = isMinimized
    ? 'inline'
    : 'expanded';
  const selectedItem = shownIndex >= 0 ? items[shownIndex] : null;

  const restIndex = Math.max(shownIndex, 0);
  // The collapsed circle: it expands the bar, or while searching returns to
  // the tab it holds. Activated from the keys (or VoiceOver), focus moves on
  // to the selected tab once the bar has expanded.
  const chooseCircle = () => {
    if (isSearchSelected) {
      if (selectedItem != null) {
        choose(selectedItem);
      }
      return;
    }
    const hadFocus = document.activeElement === circleRef.current;
    flushSync(expand);
    if (hadFocus && selectedIndex >= 0) {
      document.getElementById(`${baseId}-tab-${selectedIndex}`)?.focus();
    }
  };
  const capsuleInset = px(tabBar.itemInset);
  const itemSize = `calc(${size(count)})`;

  return (
    <div
      ref={ref}
      {...mergeProps(
        themeProps('tab-bar'),
        stylex.props(
          styles.root,
          styles.rootInset(px(tabBar.barInset)),
          xstyle,
        ),
        className,
        style,
      )}
      {...props}>
      <div
        {...stylex.props(
          styles.bar,
          styles.barSize(
            px(tabBar.barHeight),
            hasSearch ? 'none' : px(naturalWidth(count)),
          ),
        )}>
        {bottomAccessory != null ? (
          <div
            ref={minimize.accessory}
            data-tab-bar-accessory={placement}
            // While searching, the accessory steps aside for the field.
            inert={isSearchSelected}
            {...stylex.props(
              styles.accessory,
              isSearchSelected && styles.accessoryAside,
              isMinimized
                ? [
                    styles.accessoryBox(
                      px(INLINE_ACCESSORY.start),
                      `calc(100% - ${px(INLINE_ACCESSORY.start + accessoryEnd(hasSearch))})`,
                      ACCESSORY_HEIGHT,
                    ),
                    styles.accessoryInline(px(INLINE_ACCESSORY.top)),
                  ]
                : [
                    styles.accessoryBox('0px', '100%', ACCESSORY_HEIGHT),
                    styles.accessoryAbove(px(tabBar.accessoryGap)),
                  ],
            )}>
            <div aria-hidden {...stylex.props(styles.accessoryGlass)}>
              <div
                {...stylex.props(
                  styles.glass,
                  styles.platterStart(HALF_ACCESSORY),
                )}
              />
              <div
                ref={minimize.accessoryMiddle}
                {...stylex.props(
                  styles.glass,
                  styles.platterMiddle(HALF_ACCESSORY),
                )}
              />
              <div
                ref={minimize.accessoryEnd}
                {...stylex.props(
                  styles.glass,
                  styles.platterEnd(HALF_ACCESSORY),
                )}
              />
            </div>
            <div {...stylex.props(styles.accessoryContent)}>
              {typeof bottomAccessory === 'function'
                ? bottomAccessory(placement)
                : bottomAccessory}
            </div>
          </div>
        ) : null}
        <div
          ref={mergedCapsuleRef}
          role="tablist"
          aria-label={label}
          aria-orientation="horizontal"
          data-tab-bar-minimized={isMinimized ? '' : undefined}
          onKeyDown={handleKeyDown}
          onFocus={event => {
            handleFocus(event);
            if (isMinimized) {
              expand();
            }
          }}
          {...stylex.props(
            styles.capsule,
            hasSearch && styles.capsuleBesideSearch(SEARCH_ROOM),
            isMinimized && styles.capsuleMinimized,
          )}>
          <div
            ref={minimize.platter}
            aria-hidden
            data-tab-bar-platter=""
            {...stylex.props(styles.platter(HALF_BAR))}>
            <div
              {...stylex.props(styles.glass, styles.platterStart(HALF_BAR))}
            />
            <div
              ref={minimize.platterMiddle}
              {...stylex.props(styles.glass, styles.platterMiddle(HALF_BAR))}
            />
            <div
              ref={minimize.platterEnd}
              data-tab-bar-platter-end=""
              {...stylex.props(styles.glass, styles.platterEnd(HALF_BAR))}
            />
          </div>
          {items.map((item, index) => {
            const isSelected = index === selectedIndex;
            const {start, width, itemStart} = column(index, count);
            return (
              <button
                key={item.value}
                ref={minimize.item(index)}
                type="button"
                role="tab"
                id={`${baseId}-tab-${index}`}
                aria-selected={isSelected}
                tabIndex={
                  isSelected ||
                  (selectedIndex < 0 && !isSearchSelected && index === 0)
                    ? 0
                    : -1
                }
                aria-disabled={item.isDisabled === true ? true : undefined}
                // Collapsed, the circle stands for the bar (UIKit exposes it
                // alone to VoiceOver); the tabs return as it expands.
                inert={isMinimized}
                data-tab-bar-value={item.value}
                onClick={() => choose(item)}
                {...mergeProps(
                  themeProps('tab-bar-item', {
                    selected: isSelected ? 'selected' : null,
                  }),
                  stylex.props(
                    tabBarItemMarker,
                    styles.item,
                    styles.column(start, width),
                    item.isDisabled === true && styles.itemDisabled,
                  ),
                )}>
                <span
                  {...stylex.props(
                    styles.itemBox,
                    styles.box(itemStart, ITEM_TOP, itemSize, ITEM_HEIGHT),
                  )}>
                  <ItemFace item={item} isSelectedLook={false} />
                </span>
                {hasBadge(item.badge) ? (
                  <VisuallyHidden>
                    {`, ${item.badgeLabel ?? String(item.badge)}`}
                  </VisuallyHidden>
                ) : null}
              </button>
            );
          })}
          {search != null ? (
            <button
              type="button"
              // Active, the circle is the field's cancel button, not a tab.
              role={isSearchActive ? undefined : 'tab'}
              id={`${baseId}-tab-search`}
              aria-selected={isSearchActive ? undefined : isSearchSelected}
              aria-label={
                isSearchActive ? t('@astryx.tabBar.cancelSearch') : search.label
              }
              tabIndex={isSearchSelected ? 0 : -1}
              ref={searchMotion.circle}
              inert={isSearchSelected && !isSearchActive}
              data-tab-bar-search={search.value}
              data-tab-bar-search-cancel={isSearchActive ? '' : undefined}
              onClick={chooseSearch}
              // Active, the cancel button grows under the finger, and
              // shrinks back with a wobble on release, as UIKit's does.
              onPointerDown={() => {
                if (isSearchActive) {
                  cancelPressedRef.current = true;
                  searchMotion.pressCancel(true);
                }
              }}
              onPointerUp={releaseCancel}
              onPointerCancel={releaseCancel}
              onPointerLeave={releaseCancel}
              {...mergeProps(
                themeProps('tab-bar-item', {
                  selected: isSearchSelected ? 'selected' : null,
                }),
                stylex.props(
                  tabBarItemMarker,
                  styles.search,
                  styles.searchBox(
                    `calc(100% + ${px(tabBar.searchGap)})`,
                    SEARCH_SIZE,
                  ),
                  isSearchSelected && styles.searchSelected,
                ),
              )}>
              <span
                ref={searchMotion.press}
                aria-hidden
                data-tab-bar-search-press=""
                {...stylex.props(styles.searchPress)}>
                <span
                  ref={minimize.searchGlass}
                  aria-hidden
                  data-tab-bar-search-glass=""
                  {...stylex.props(styles.glass, styles.searchGlass)}
                />
              </span>
              <span
                ref={searchMotion.searchGlyph}
                aria-hidden
                {...stylex.props(
                  styles.icon,
                  styles.box(
                    SEARCH_ICON_INSET,
                    SEARCH_ICON_INSET,
                    ICON_SIZE,
                    ICON_SIZE,
                  ),
                )}>
                {search.icon}
              </span>
              <span
                ref={searchMotion.cancelGlyph}
                aria-hidden
                {...stylex.props(
                  styles.icon,
                  styles.box(
                    SEARCH_ICON_INSET,
                    SEARCH_ICON_INSET,
                    ICON_SIZE,
                    ICON_SIZE,
                  ),
                )}>
                <Icon icon="close" size="lg" />
              </span>
            </button>
          ) : null}
          {shownIndex >= 0 ? (
            <div
              aria-hidden
              data-tab-bar-lens=""
              {...stylex.props(
                styles.lens,
                styles.box(capsuleInset, capsuleInset, itemSize, ITEM_HEIGHT),
                styles.lensRest(lensOffset(restIndex, count)),
              )}>
              <div
                ref={lens.body}
                data-tab-bar-lens-body=""
                {...stylex.props(styles.lensBody)}>
                <div
                  ref={lens.shadow}
                  data-tab-bar-lens-shadow=""
                  {...stylex.props(styles.lensShadow)}
                />
                <div {...stylex.props(styles.lensClip)}>
                  <div {...stylex.props(styles.lensFill)} />
                  <div
                    ref={lens.glass}
                    data-tab-bar-lens-glass=""
                    {...stylex.props(styles.lensGlass)}
                  />
                  <div
                    ref={lens.copy}
                    data-tab-bar-copy=""
                    {...stylex.props(styles.copyInner)}>
                    <div
                      {...stylex.props(
                        styles.copyOuter,
                        styles.copyOuterGeometry(
                          capsuleInset,
                          px(tabBar.barHeight),
                        ),
                        styles.copyRest(lensOffset(restIndex, count)),
                      )}>
                      {items.map((item, index) => (
                        <span
                          key={item.value}
                          ref={lens.copyItem(index)}
                          data-tab-bar-copy-item={item.value}
                          {...stylex.props(
                            styles.copyItem,
                            styles.box(
                              `calc(${center(index, count)} - ${size(count)} / 2)`,
                              ITEM_TOP,
                              itemSize,
                              ITEM_HEIGHT,
                            ),
                          )}>
                          <ItemFace item={item} isSelectedLook />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          <div
            ref={minimize.badges}
            aria-hidden
            {...stylex.props(styles.badges)}>
            {items.map((item, index) =>
              hasBadge(item.badge) ? (
                <span
                  key={item.value}
                  data-tab-bar-badge={item.value}
                  {...stylex.props(
                    styles.badge,
                    styles.badgeGeometry(
                      `calc(${center(index, count)} + ${px(tabBar.badge.offsetX)})`,
                      px(tabBar.itemInset + tabBar.badge.offsetY),
                      px(tabBar.badge.height),
                      px(tabBar.badge.paddingInline),
                      px(tabBar.badge.fontSize),
                    ),
                  )}>
                  {item.badge}
                </span>
              ) : null,
            )}
          </div>
        </div>
        <button
          ref={mergedCircleRef}
          type="button"
          data-tab-bar-circle=""
          // Collapsed, the circle is the bar's one element for assistive
          // technology, as on iOS: the selected tab, collapsed (while
          // searching, the tab it returns to). Expanded, it is hidden.
          aria-label={isMinimized ? selectedItem?.label : undefined}
          aria-expanded={isMinimized && !isSearchSelected ? false : undefined}
          aria-hidden={isMinimized ? undefined : true}
          tabIndex={isMinimized ? 0 : -1}
          onClick={chooseCircle}
          {...stylex.props(
            styles.circle,
            styles.circleButton,
            styles.box(CIRCLE_INSET, CIRCLE_INSET, CIRCLE_SIZE, CIRCLE_SIZE),
            isMinimized && styles.circleActive,
            isSearchSelected && styles.circlePlain,
          )}>
          {selectedItem != null ? (
            <span
              aria-hidden
              {...stylex.props(
                styles.icon,
                styles.box(
                  CIRCLE_ICON_INSET,
                  CIRCLE_ICON_INSET,
                  ICON_SIZE,
                  ICON_SIZE,
                ),
              )}>
              {selectedItem.selectedIcon ?? selectedItem.icon}
            </span>
          ) : null}
        </button>
        {search != null ? (
          <div
            ref={mergedSearchHostRef}
            data-tab-bar-search-field={isSearchActive ? 'active' : 'inline'}
            inert={!isSearchSelected}
            {...stylex.props(
              styles.searchHost,
              styles.accessoryBox(
                px(INLINE_FIELD.start),
                // The field's width follows the bar's (its box at width 0 is negative).
                `calc(100% + ${px(INLINE_FIELD.width)})`,
                ACCESSORY_HEIGHT,
              ),
              styles.accessoryInline(px(INLINE_FIELD.top)),
            )}>
            <div
              ref={searchMotion.field}
              {...stylex.props(
                styles.searchField,
                // Only the field takes touches: its host spans the inline
                // box, over the place the cancel button rides to.
                isSearchSelected && styles.searchFieldShown,
                isSearchActive
                  ? styles.searchFieldBox(
                      ACTIVE_FIELD_SHIFT.start,
                      `calc(100% + ${ACTIVE_FIELD_SHIFT.width})`,
                    )
                  : styles.searchFieldBox('0px', '100%'),
              )}>
              <div aria-hidden {...stylex.props(styles.accessoryGlass)}>
                <div
                  {...stylex.props(
                    styles.glass,
                    styles.platterStart(HALF_ACCESSORY),
                  )}
                />
                <div
                  ref={searchMotion.fieldMiddle}
                  {...stylex.props(
                    styles.glass,
                    styles.platterMiddle(HALF_ACCESSORY),
                  )}
                />
                <div
                  ref={searchMotion.fieldEnd}
                  {...stylex.props(
                    styles.glass,
                    styles.platterEnd(HALF_ACCESSORY),
                  )}
                />
              </div>
              <div {...stylex.props(styles.searchFieldContent)}>
                <TabBarSearchContext.Provider
                  value={{
                    host: searchHostRef,
                    placement: 'tab',
                    isActive: isSearchActive,
                  }}>
                  {search.children}
                </TabBarSearchContext.Provider>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
