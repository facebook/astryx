// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TabBar.tsx
 * @input React, StyleX, core's theme tokens, list focus and touch
 *   presentation hooks, the UIKit tab-bar table
 *   (`@astryxdesign/core/motion`), useTabBarLens.ts for the
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
 * that neighbours overlap, and the selection lens: a pill under the selected
 * item, which draws its selected look (accent colour, semibold label) itself.
 * While the lens moves under a finger (it slides, or a press lifts it into
 * glass), the selected look rides inside it instead, as on iOS: a copy of
 * the items, counter-translated so it stays over the buttons, so an item
 * half under the lens is half tinted. That copy is mounted only while the
 * lens moves; at rest, and always under a mouse, every item is drawn once.
 * The lens's moving fill, and the glass it lifts into, are opaque and hide
 * the plain items beneath the copy.
 *
 * Layout is CSS: the capsule is a size container and every position is a
 * `calc()` of its width, so the bar is right before hydration and through a
 * resize. Each button spans the capsule from halfway to its neighbours, so
 * a press goes to the nearest item, which is the item UIKit picks.
 *
 * HOW THE LENS MOVES
 *
 * Under a finger (a coarse primary pointer, iOS and Android alike: the
 * touch presentation), useTabBarLens.ts moves it as UITabBar does: a
 * finger landing lifts the lens (it grows into clear glass and magnifies
 * the item under it) while the bar flexes, a dragging finger is chased
 * across the items, and the lift chooses the item nearest the finger; a
 * selection made with the keys slides it on UIKit's spring
 * (`tabBar.lensTravel`). Everything runs on the compositor, keeps its speed
 * when retargeted, and plays each spring as the theme sets its motion role.
 * That motion is TabBar's touch layer (TabBarTouch.ts), its one import site.
 * Under a mouse (a fine pointer) the lens slides on the theme's duration and
 * easing (a CSS transition on `translate`, run by the compositor), the
 * selected look moving to the new tab at once, and no touch code runs. Under
 * Reduce Motion
 * nothing travels (design:reduced-motion, applied by the animator): on a
 * touch screen the lens cross-fades (it fades out where it was and in at the
 * new tab, in 200 ms) and a press scales nothing; under a mouse the lens
 * moves at once.
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
 * screen but for the search circle, which is then the field's cancel button
 * (it calls the field handle's `cancel`); under a finger both sit above the
 * software keyboard, an offset committed at each keyboard report
 * (useTabBarSearch.ts). The field draws its content inside the host
 * TabBarSearchContext hands it.
 *
 * Accessibility: a `tablist` of `tab` buttons (`aria-selected`), one tab stop
 * with the arrow keys, Home and End moving between tabs and Enter or Space
 * choosing one. A badge is part of its tab's name, one message with both
 * ("Library, 3"; `badgeLabel`, or the badge itself). A disabled tab is
 * dimmed, skipped by the keys and never chosen. Collapsed, the bar is one
 * button for assistive technology, as on iOS: the circle, named after the
 * selected tab and collapsed (`aria-expanded`), the tabs inert until it
 * expands; activated from the keys, focus lands on the selected tab.
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
  useState,
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
import {tabBar} from '@astryxdesign/core/motion/uikit';
import {useTouchPresentation} from '@astryxdesign/core/utils/touchPresentation';
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
import {tabBarItemMarker} from './tabBar.stylex';
import {
  accessoryBox,
  accessoryEnd,
  itemWidthCss,
  naturalWidth,
  searchFieldBox,
} from './tabBarModel';
import {useTabBarLens, useTabBarMinimize, useTabBarSearch} from './TabBarTouch';
import {TabBarSearchContext} from './tabBarSearchContext';

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
   * top of the page or activating the circle (a tap, or the keys) expands
   * it. Under a finger only;
   * under a mouse the bar stays expanded.
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
   * field's cancel button under a finger. Without `cancel`, the circle
   * reports `onActiveChange(false)`.
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
    // No page-level stacking rank (AST-027): the lens and the badges order
    // inside the bar's own stacking context.
    isolation: 'isolate',
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
    WebkitTapHighlightColor: 'transparent',
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
  // The Cancel button over the search circle: where the circle sits at the
  // bar's trailing end, round, with its own focus ring.
  searchCancel: (size: string) => ({
    insetInlineEnd: 0,
    width: size,
    height: size,
    borderRadius: radiusVars['--radius-full'],
    outlineStyle: {
      default: 'none',
      ':focus-visible': focusVars['--focus-outline-style'],
    },
    outlineWidth: focusVars['--focus-outline-width'],
    outlineColor: focusVars['--focus-outline-color'],
    outlineOffset: focusVars['--focus-outline-offset'],
  }),
  // The search field's host, inline in the bar's row; active under a
  // finger it sits above the keyboard (`raised`).
  accessoryAside: {
    pointerEvents: 'none',
  },
  // Under a mouse the field takes the accessory's place while searching.
  accessoryHidden: {
    opacity: 0,
  },
  searchHostHidden: {
    opacity: 0,
  },
  searchHost: {
    position: 'absolute',
    pointerEvents: 'none',
  },
  searchHostShown: {
    pointerEvents: 'auto',
  },
  // Under a finger only the field takes touches: its host spans the inline
  // box, over the place the cancel button moves to.
  searchFieldShown: {
    pointerEvents: 'auto',
  },
  // Under a finger the active field and its cancel button sit above the
  // keyboard: an offset committed at each keyboard report, never animated.
  raised: (x: number, y: number) => ({
    translate: `${x}px ${y}px`,
  }),
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
  // The tab buttons' layer: it fades as one when the bar minimizes.
  items: {
    position: 'absolute',
    inset: 0,
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
      // Under a finger the animator moves it (TabBarTouch.ts); under Reduce
      // Motion a touch screen cross-fades it there and a mouse jumps.
      '@media (pointer: coarse)': '0s',
      '@media (prefers-reduced-motion: reduce) and (pointer: coarse)': '0s',
      '@media (prefers-reduced-motion: reduce) and (not (pointer: coarse))':
        '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  // At rest the lens is the pill under the selected item, which draws its
  // own selected look; while it moves it carries the copy over the items.
  lensUnder: {
    zIndex: -1,
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
    // The lifted lens's shadow, outside the clip: the animator fades it in.
    '::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: radiusVars['--radius-full'],
      boxShadow: shadowVars['--shadow-med'],
      opacity: 0,
      // The animator promotes it while it moves (core's animator.ts).
      willChange: 'var(--astryx-motion-will-change-before, auto)',
    },
  },
  lensClip: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    borderRadius: radiusVars['--radius-full'],
    // Opaque: while it moves it hides the plain items under the copy.
    backgroundColor: `color-mix(in srgb, ${colorVars['--color-text-primary']} 9%, ${colorVars['--color-background-popover']})`,
    // The lifted lens: the capsule's own surface with a light rim, opaque so
    // the plain copy under it stays hidden; the animator fades it in.
    '::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: radiusVars['--radius-full'],
      backgroundColor: colorVars['--color-background-popover'],
      boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${colorVars['--color-text-primary']} 10%, transparent)`,
      opacity: 0,
      // The animator promotes it while it moves (core's animator.ts).
      willChange: 'var(--astryx-motion-will-change-before, auto)',
    },
  },
  copyInner: {
    position: 'absolute',
    inset: 0,
  },
  // Mounted only while the lens moves under a finger, where the animator
  // moves it: no transition of its own.
  copyOuter: {
    position: 'absolute',
    width: '100cqw',
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
  // The selected tab's own look at rest: the copy's accent.
  itemSelectedLook: {
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

/**
 * An item's icon and label, in the plain or the selected look; the lens's
 * copy keeps them out of the accessibility tree.
 */
function ItemFace({
  item,
  isSelectedLook,
  isCopy = false,
}: {
  item: TabBarItemProps;
  isSelectedLook: boolean;
  isCopy?: boolean;
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
        aria-hidden={isCopy || undefined}
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

  // UIKit's motion and gestures belong to a finger (a coarse primary pointer,
  // iOS and Android alike); a mouse keeps the theme's motion.
  const isTouch = useTouchPresentation().isTouch;

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
  // Kept in state and adjusted during render as the selection changes (a
  // discarded render leaves no tab behind, as a ref written there would).
  const [lastTabValue, setLastTabValue] = useState<string | null>(null);
  if (!isSearchSelected && selectedIndex >= 0 && lastTabValue !== value) {
    setLastTabValue(value);
  }
  // A section inside More: the circle holds More.
  const isLastInMore =
    hasMore &&
    (lastTabValue === moreValue ||
      overflow.some(item => item.value === lastTabValue));
  const previousIndex = isLastInMore
    ? MAX_TABS - 1
    : items.findIndex(item => item.value === lastTabValue);
  // Under a finger, while searching, the leading circle holds the tab search
  // was chosen from; under a mouse the search tab is selected in place.
  const shownIndex =
    isSearchSelected && isTouch ? Math.max(previousIndex, 0) : selectedIndex;
  const isSearchActive = isSearchSelected && (search?.isActive ?? false);
  const chooseSearch = () => {
    if (search == null) {
      return;
    }
    // Under a mouse the field shows active at once, in the accessory's place.
    const activates = !isTouch || (search.automaticallyActivates ?? true);
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
  // Until when the search tab's glass keeps its minimized size as the bar
  // expands: the search field's Cancel wobbles at that size first.
  const searchGlassHoldRef = useRef(0);
  const minimize = useTabBarMinimize({
    capsuleRef,
    hasSearch,
    // The search tab's collapse is a touch presentation: under a mouse it
    // selects in place.
    isSearching: isSearchSelected && isTouch,
    isEnabled: minimizeBehavior === 'onScrollDown' && isTouch,
    searchGlassHoldRef,
  });
  const searchHostRef = useRef<HTMLDivElement | null>(null);
  const searchMotion = useTabBarSearch({
    capsuleRef,
    hostRef: searchHostRef,
    isSearching: isSearchSelected && isTouch,
    isActive: isSearchActive,
    isTouch,
    glassHoldRef: searchGlassHoldRef,
  });
  const isSearchCancel = isSearchActive && isTouch;
  const circleRef = useRef<HTMLButtonElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const mergedCancelRef = useMergedRefs(cancelRef, searchMotion.cancel);
  const lens = useTabBarLens({
    capsuleRef,
    count,
    selectedIndex: shownIndex,
    isTouch,
    isMinimized: minimize.isCollapsed,
    onLift: index => choose(items[index]),
    isDisabled: index => items[index]?.isDisabled === true,
  });
  const mergedCapsuleRef = useMergedRefs(capsuleRef, listRef, lens.capsule);
  const mergedCircleRef = useMergedRefs(minimize.circleIcon, circleRef);
  const {isCollapsed: isMinimized, expand} = minimize;
  const placement: TabBarAccessoryPlacement = isMinimized
    ? 'inline'
    : 'expanded';
  // What the accessory shows where it is: drawn only when that renders
  // something (`false`, `''` or a function returning `null` draw no capsule).
  const accessoryContent =
    typeof bottomAccessory === 'function'
      ? bottomAccessory(placement)
      : bottomAccessory;
  const hasAccessory =
    accessoryContent != null &&
    typeof accessoryContent !== 'boolean' &&
    accessoryContent !== '';
  const selectedItem = shownIndex >= 0 ? items[shownIndex] : null;
  // The collapsed circle: it expands the bar, or while searching returns to
  // the tab it holds. Activated from the keys (or VoiceOver), focus moves on
  // to the selected tab once the bar has expanded.
  const chooseCircle = () => {
    const hadFocus = document.activeElement === circleRef.current;
    // Expanded, the circle is hidden from assistive technology and holds
    // no tab stop, so focus it had moves on to the tab the bar shows.
    const moveFocusOn = () => {
      if (!hadFocus) {
        return;
      }
      const stop =
        capsuleRef.current?.querySelector<HTMLElement>(
          '[role="tab"][tabindex="0"]',
        ) ??
        document.getElementById(
          `${baseId}-tab-${selectedIndex >= 0 ? selectedIndex : 0}`,
        );
      stop?.focus({preventScroll: true});
    };
    if (isSearchSelected) {
      // Back to the tab search was chosen from (a section inside More, too),
      // or, for a bar mounted on its search tab, to the tab the circle shows.
      const back =
        lastTabValue != null
          ? (allItems.find(item => item.value === lastTabValue) ?? {
              value: lastTabValue,
            })
          : selectedItem;
      if (back != null) {
        flushSync(() => choose(back));
      }
      moveFocusOn();
      return;
    }
    flushSync(expand);
    moveFocusOn();
  };
  // Cancel ends search: through the field's handle when it has one (it
  // clears, blurs and reports), else by blurring the field and reporting, so
  // the keyboard goes as the field moves (spec:AST-099 FR5). Focus on Cancel
  // moves on with it: to the collapsed bar's circle, or to the tab holding
  // the tab stop once the bar expands.
  const cancelSearch = () => {
    if (search == null) {
      return;
    }
    const hadFocus = document.activeElement === cancelRef.current;
    const field = search.fieldRef?.current;
    flushSync(() => {
      if (field?.cancel != null) {
        field.cancel();
      } else {
        field?.blur();
        search.onActiveChange?.(false);
      }
    });
    if (!hadFocus || document.activeElement !== document.body) {
      return;
    }
    const circle = circleRef.current;
    if (circle != null && circle.tabIndex === 0) {
      circle.focus({preventScroll: true});
    } else {
      capsuleRef.current
        ?.querySelector<HTMLElement>('[role="tab"][tabindex="0"]')
        ?.focus({preventScroll: true});
    }
  };
  // Collapsed, the search tab beside the circle stays a tab of its own
  // unless it is the one being searched: the tab list goes inert only when
  // none of its tabs is reachable.
  const isSearchTabReachable = search != null && !(isSearchSelected && isTouch);

  const restIndex = Math.max(shownIndex, 0);
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
        {hasAccessory ? (
          <div
            ref={minimize.accessory}
            data-tab-bar-accessory={placement}
            // While searching, the accessory steps aside for the field.
            inert={isSearchSelected}
            {...stylex.props(
              styles.accessory,
              isSearchSelected && styles.accessoryAside,
              isSearchSelected && !isTouch && styles.accessoryHidden,
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
              {accessoryContent}
            </div>
          </div>
        ) : null}
        <div
          ref={mergedCapsuleRef}
          role="tablist"
          aria-label={label}
          aria-orientation="horizontal"
          // Collapsed (minimized, or while searching), the circle stands for
          // the bar; with no tab left reachable the list goes inert too.
          inert={isMinimized && !isSearchTabReachable}
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
          <div
            ref={minimize.items}
            role="presentation"
            data-tab-bar-items=""
            {...stylex.props(styles.items)}>
            {items.map((item, index) => {
              const isSelected = index === selectedIndex;
              const {start, width, itemStart} = column(index, count);
              return (
                <button
                  key={item.value}
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
                  // A badge is part of the name: one message with both.
                  aria-label={
                    hasBadge(item.badge)
                      ? t('@astryx.tabBar.badgedItem', {
                          label: item.label,
                          badge: item.badgeLabel ?? String(item.badge),
                        })
                      : undefined
                  }
                  data-tab-bar-value={item.value}
                  // Collapsed, the circle stands for the bar (UIKit exposes it
                  // alone to VoiceOver); the tabs return as it expands.
                  inert={isMinimized}
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
                      // At rest the tab draws its selected look; while the lens
                      // moves, the copy inside it does.
                      isSelected &&
                        !lens.isCopyShown &&
                        styles.itemSelectedLook,
                      styles.box(itemStart, ITEM_TOP, itemSize, ITEM_HEIGHT),
                    )}>
                    <ItemFace
                      item={item}
                      isSelectedLook={isSelected && !lens.isCopyShown}
                    />
                  </span>
                </button>
              );
            })}
          </div>
          {search != null ? (
            <button
              type="button"
              role="tab"
              id={`${baseId}-tab-search`}
              aria-selected={isSearchSelected}
              aria-label={search.label}
              tabIndex={isSearchSelected ? 0 : -1}
              // Under a finger, while searching, it is inert: faded out while
              // the field waits inline, and while the field is active the
              // circle that draws the Cancel button (which lies over it,
              // outside the tab list); under a mouse it stays, selected, in
              // place.
              inert={isSearchSelected && isTouch}
              ref={searchMotion.circle}
              data-tab-bar-search={search.value}
              onClick={chooseSearch}
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
                  isSearchSelected && !isSearchCancel && styles.searchSelected,
                  isSearchCancel &&
                    styles.raised(
                      searchMotion.place.shift,
                      searchMotion.place.lift,
                    ),
                ),
              )}>
              <span
                ref={minimize.searchGlass}
                aria-hidden
                {...stylex.props(styles.glass, styles.searchGlass)}
              />
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
                !lens.isCopyShown && styles.lensUnder,
                styles.box(capsuleInset, capsuleInset, itemSize, ITEM_HEIGHT),
                styles.lensRest(lensOffset(restIndex, count)),
              )}>
              <div
                ref={lens.body}
                data-tab-bar-lens-body=""
                {...stylex.props(styles.lensBody)}>
                <div
                  ref={lens.clip}
                  data-tab-bar-lens-clip=""
                  {...stylex.props(styles.lensClip)}>
                  {lens.isCopyShown ? (
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
                              // A disabled tab keeps its disabled paint under
                              // the lens (AST-085 FR6).
                              item.isDisabled === true && styles.itemDisabled,
                              styles.box(
                                `calc(${center(index, count)} - ${size(count)} / 2)`,
                                ITEM_TOP,
                                itemSize,
                                ITEM_HEIGHT,
                              ),
                            )}>
                            <ItemFace
                              item={item}
                              isSelectedLook={item.isDisabled !== true}
                              isCopy
                            />
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
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
          aria-label={
            isMinimized
              ? (selectedItem?.label ?? label ?? t('@astryx.tabList.label'))
              : undefined
          }
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
            ref={searchHostRef}
            role="search"
            aria-label={search.label}
            data-tab-bar-search-field={
              !isTouch ? 'above' : isSearchActive ? 'active' : 'inline'
            }
            inert={!isSearchSelected}
            onKeyDown={event => {
              // Under a mouse Escape leaves the search tab, back to the tab it
              // was chosen from, and the accessory returns.
              if (isTouch || event.key !== 'Escape' || lastTabValue == null) {
                return;
              }
              event.preventDefault();
              const back = lastTabValue;
              flushSync(() => {
                search.onActiveChange?.(false);
                choose({value: back});
              });
              capsuleRef.current
                ?.querySelector<HTMLElement>(
                  '[role="tab"][aria-selected="true"]',
                )
                ?.focus({preventScroll: true});
            }}
            {...stylex.props(
              styles.searchHost,
              isTouch
                ? [
                    styles.accessoryBox(
                      px(INLINE_FIELD.start),
                      // The field's width follows the bar's (its box at width 0 is negative).
                      `calc(100% + ${px(INLINE_FIELD.width)})`,
                      ACCESSORY_HEIGHT,
                    ),
                    styles.accessoryInline(px(INLINE_FIELD.top)),
                    styles.raised(0, searchMotion.place.lift),
                  ]
                : [
                    // Under a mouse, in the accessory's place, at once.
                    styles.accessoryBox('0px', '100%', ACCESSORY_HEIGHT),
                    styles.accessoryAbove(px(tabBar.accessoryGap)),
                    !isSearchSelected && styles.searchHostHidden,
                  ],
              isSearchSelected && !isTouch && styles.searchHostShown,
            )}>
            <div
              ref={isTouch ? searchMotion.field : undefined}
              {...stylex.props(
                styles.searchField,
                isSearchSelected && isTouch && styles.searchFieldShown,
                isTouch && isSearchActive
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
        {search != null && isSearchCancel ? (
          // Active under a finger, the field's Cancel button lies over the
          // search circle, outside the tab list (whose tabs stay inert):
          // concentric with it, as UIKit's is, its glyph drawn by the circle.
          <button
            ref={mergedCancelRef}
            type="button"
            aria-label={t('@astryx.tabBar.cancelSearch')}
            data-tab-bar-search-cancel=""
            onClick={cancelSearch}
            {...stylex.props(
              styles.search,
              styles.searchCancel(SEARCH_SIZE),
              styles.raised(searchMotion.place.shift, searchMotion.place.lift),
            )}
          />
        ) : null}
      </div>
    </div>
  );
}
