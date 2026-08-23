// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TabList.tsx
 * @input Uses React, StyleX, TabListContext, useListFocus, useKeyboardHint,
 *   useScrollOverflow, Icon
 * @output Exports TabList component, TabListProps and TabListOverflow types
 * @position Nav wrapper; provides TabListContext to Tab and TabMenu children.
 *   Owns roving-tabindex keyboard navigation (Arrow/Home/End) across the tab
 *   strip via the shared useListFocus hook so it is a single Tab stop, and
 *   owns horizontal scrolling when the tabs are wider than the strip.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/TabList/TabList.doc.mjs
 * - /packages/core/src/TabList/index.ts
 * - /packages/core/src/TabList/TabList.test.tsx
 * - /packages/cli/assets/templates/blocks/components/TabList/ (showcase blocks)
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  borderVars,
  colorVars,
  durationVars,
  easeVars,
  focusVars,
  radiusVars,
  shadowVars,
  sizeVars,
  spacingVars,
} from '../theme/tokens.stylex';
import type {BaseProps} from '../BaseProps';
import {TabListContext} from './TabListContext';
import type {TabListSize} from './TabListContext';
import {useSize} from '../SizeContext/SizeContext';
import {mergeProps, rtlStyles} from '../utils';
import {useListFocus} from '../hooks/useListFocus';
import {useKeyboardHint} from '../hooks/useKeyboardHint';
import {useScrollOverflow} from '../hooks/useScrollOverflow';
import {isRtlElement} from '../hooks/isRtlElement';
import {Icon} from '../Icon';
import {EDGE_COMP_ATTR} from '../Layout/edgeCompensation.stylex';
import {themeProps} from '../utils/themeProps';
import {observeResize, unobserveResize} from '../utils/sharedResizeObserver';
import {focusOutlineProps} from '../utils/focusOutline.stylex';
import {useTranslator} from '../i18n';

import {useMergedRefs} from '../hooks/useMergedRefs';
/**
 * Selector matching the focusable stops in the tab strip: every Tab
 * (`[data-tab-value]`) and every TabMenu trigger (`[data-tab-menu]`),
 * in DOM order. Disabled stops are filtered out by the handler.
 */
const TAB_STOP_SELECTOR = '[data-tab-value],[data-tab-menu]';

function preventFocus(e: React.MouseEvent) {
  e.preventDefault();
}

/** Fraction of the visible strip an arrow press scrolls. */
const SCROLL_PAGE_RATIO = 0.8;

/**
 * How a strip narrower than its tabs behaves.
 *
 * - `'auto'` — the component picks the strategy. Today that is always
 *   `'scroll'`.
 * - `'scroll'` — the tabs scroll horizontally. Every tab stays a tab.
 * - `'none'` — no overflow handling: tabs keep their intrinsic widths and
 *   spill out of the strip, as they did before overflow existed.
 */
export type TabListOverflow = 'auto' | 'scroll' | 'none';

export interface TabListProps extends Omit<BaseProps<HTMLElement>, 'onChange'> {
  ref?: React.Ref<HTMLElement>;
  /**
   * The currently selected tab value.
   */
  value: string;
  /**
   * Callback fired when a tab is selected.
   */
  onChange: (value: string) => void;
  /**
   * Size of the tab hover targets. Uses the same element size tokens
   * as Button and TextInput (`sm` = 28px, `md` = 32px, `lg` = 36px).
   * @default 'md'
   */
  size?: TabListSize;
  /**
   * Layout mode for tab sizing.
   * - `'hug'` (default): each tab hugs its content width.
   * - `'fill'`: tabs stretch equally to fill the container width.
   * @default 'hug'
   */
  layout?: 'hug' | 'fill';
  /**
   * Whether to show a bottom divider under the tab list.
   * @default false
   */
  hasDivider?: boolean;
  /**
   * What happens when the tabs are wider than the strip.
   *
   * `'auto'` lets the component choose; today it always scrolls. `'scroll'`
   * scrolls the tabs horizontally, with edge fades and — for pointers that
   * can hover — arrow affordances. `'none'` turns overflow handling off and
   * lets the tabs spill out of the strip.
   *
   * The selected tab is always scrolled back into view.
   * @default 'auto'
   */
  overflow?: TabListOverflow;
  /**
   * Tab and TabMenu children.
   */
  children: ReactNode;
}

/**
 * A scroll container clips at its padding box, and two things a tab paints sit
 * outside its own box: the focus ring (offset + width) and the selected
 * indicator, which `--_tab-indicator-bottom` pushes further down when a
 * divider rail is reserved. The strip pads by that much and takes the padding
 * straight back off with a negative margin, so nothing is clipped and the
 * strip occupies exactly the space it did before.
 */
const RING_BLEED = `calc(${focusVars['--focus-outline-width']} + ${focusVars['--focus-outline-offset']})`;
const INDICATOR_BLEED = 'calc(-1 * var(--_tab-indicator-bottom, -1px))';
const BLOCK_END_BLEED = `max(${RING_BLEED}, ${INDICATOR_BLEED})`;

/** How far the edge fade runs; wide enough to sit under an arrow. */
const FADE_WIDTH = spacingVars['--spacing-8'];

/**
 * Where the fade turns fully opaque, and — the same distance, for the same
 * reason — how far a revealed stop is kept clear of the edge. Declared as
 * scroll-padding so the browser's own focus scrolling uses it too, and read
 * back from the computed style so the arithmetic below has one source of
 * truth with the CSS.
 */
const SCROLL_EDGE_INSET = `calc(${RING_BLEED} + ${FADE_WIDTH})`;

/**
 * The fade reaches transparent at the strip's *own* edge, not at the bleed
 * edge — otherwise the scroll container paints tabs `RING_BLEED` past the
 * TabList's box, past a divider rail, and past the scroll arrow that caps
 * that edge. Masking the bleed costs nothing: only a faded edge is masked,
 * and a stop at a faded edge never holds focus, so the bleed is still there
 * when the ring needs it.
 */
const FADE_FROM_START = `linear-gradient(to right, transparent ${RING_BLEED}, black ${SCROLL_EDGE_INSET})`;
const FADE_FROM_END = `linear-gradient(to left, transparent ${RING_BLEED}, black ${SCROLL_EDGE_INSET})`;

const styles = stylex.create({
  nav: {
    display: 'flex',
    alignItems: 'stretch',
    gap: spacingVars['--spacing-0-5'],
    maxWidth: '100%',
    minWidth: 0,
    position: 'relative',
  },
  fill: {
    width: '100%',
  },
  divider: {
    borderBottomWidth: borderVars['--border-width'],
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-border'],
    // Reserve a gap between the tabs and the divider rail so the hover pill
    // (which fills the tab height) no longer touches the underline, and an
    // adjacent same-size Button aligns to the tabs rather than butting the
    // rail. The tabs keep their element-size height; this padding grows the
    // strip. `--_tab-indicator-bottom` drops the selected indicator through
    // the reserved gap (+ the 1px border) so it still sits on the rail.
    paddingBlockEnd: spacingVars['--spacing-1'],
    '--_tab-indicator-bottom': `calc(-1 * (${spacingVars['--spacing-1']} + ${borderVars['--border-width']}))`,
  },
  strip: {
    display: 'flex',
    alignItems: 'stretch',
    // Inherited rather than restated so an `xstyle` gap override on the
    // TabList still reaches the tabs.
    gap: 'inherit',
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    // Content-height, not stretched: the bleed padding below is inside the
    // strip's own height, and a stretched height would push the tabs out of
    // the scrollport.
    alignSelf: 'flex-start',
  },
  stripScroll: {
    overflowX: 'auto',
    overflowY: 'hidden',
    overscrollBehaviorX: 'contain',
    scrollPaddingInline: SCROLL_EDGE_INSET,
    scrollbarWidth: 'none',
    scrollBehavior: {
      default: 'smooth',
      '@media (prefers-reduced-motion: reduce)': 'auto',
    },
    paddingBlockStart: RING_BLEED,
    marginBlockStart: `calc(-1 * (${RING_BLEED}))`,
    paddingBlockEnd: BLOCK_END_BLEED,
    marginBlockEnd: `calc(-1 * (${BLOCK_END_BLEED}))`,
    paddingInline: RING_BLEED,
    marginInline: `calc(-1 * (${RING_BLEED}))`,
    maskImage: 'none',
    transitionProperty: 'mask-image',
    transitionDuration: {
      default: durationVars['--duration-medium'],
      '@media (prefers-reduced-motion: reduce)': '0ms',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  fadeStart: {
    maskImage: {
      default: FADE_FROM_START,
      ':is([dir="rtl"] *)': FADE_FROM_END,
    },
  },
  fadeEnd: {
    maskImage: {
      default: FADE_FROM_END,
      ':is([dir="rtl"] *)': FADE_FROM_START,
    },
  },
  fadeBoth: {
    maskImage: `linear-gradient(to right, transparent ${RING_BLEED}, black ${SCROLL_EDGE_INSET}, black calc(100% - ${SCROLL_EDGE_INSET}), transparent calc(100% - ${RING_BLEED}))`,
  },
  arrow: {
    position: 'absolute',
    insetBlockStart: 0,
    // A pointer-only affordance: keyboard and assistive-technology users move
    // through the strip with the arrow keys, which scrolls the focused tab
    // into view on its own.
    display: {
      default: 'none',
      '@media (hover: hover)': 'flex',
    },
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    borderWidth: 0,
    borderStyle: 'none',
    borderRadius: radiusVars['--radius-full'],
    // Opaque, because it sits over the tabs it scrolls: the strip's edge fade
    // thins the content underneath but does not clear it.
    backgroundColor: colorVars['--color-background-popover'],
    boxShadow: shadowVars['--shadow-low'],
    color: {
      default: colorVars['--color-text-secondary'],
      ':hover:where(:not(:disabled,[aria-disabled="true"]))':
        colorVars['--color-text-primary'],
    },
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
  },
  arrowStart: {
    insetInlineStart: 0,
  },
  arrowEnd: {
    insetInlineEnd: 0,
  },
});

const arrowSizeStyles = stylex.create({
  sm: {
    width: sizeVars['--size-element-sm'],
    height: sizeVars['--size-element-sm'],
  },
  md: {
    width: sizeVars['--size-element-md'],
    height: sizeVars['--size-element-md'],
  },
  lg: {
    width: sizeVars['--size-element-lg'],
    height: sizeVars['--size-element-lg'],
  },
});

/**
 * Tab navigation wrapper. Provides context for value/onChange/size
 * to Tab and TabMenu children.
 *
 * @example
 * ```
 * <TabList value={activeTab} onChange={setActiveTab}>
 *   <Tab value="home" label="Home" />
 *   <Tab value="settings" label="Settings" />
 *   <TabMenu label="More">
 *     <Tab value="analytics" label="Analytics" />
 *     <Tab value="reports" label="Reports" />
 *   </TabMenu>
 * </TabList>
 * ```
 */
export function TabList({
  ref,
  value,
  onChange,
  size: sizeProp,
  layout = 'hug',
  hasDivider = false,
  overflow = 'auto',
  xstyle,
  className,
  style,
  children,
  onKeyDown: onKeyDownProp,
  onFocus: onFocusProp,
  onBlur: onBlurProp,
  'aria-label': ariaLabelFromProps,
  'aria-orientation': _ariaOrientation,
  [EDGE_COMP_ATTR]: _edgeCompAttr,
  ...restProps
}: TabListProps) {
  const t = useTranslator();
  const ariaLabel = ariaLabelFromProps ?? t('@astryx.tabList.label');
  const size = useSize(sizeProp, 'md');
  const hasScroll = overflow !== 'none';

  // Roving-tabindex keyboard navigation across the tab strip via the shared
  // hook. `orientation: 'both'` accepts both arrow axes per the WAI-ARIA APG
  // allowance for tab strips (ArrowRight/ArrowDown advance, ArrowLeft/ArrowUp
  // retreat). We do not set `aria-orientation` on the `<nav>`: that attribute
  // is invalid on the navigation role and triggers an axe `aria-allowed-attr`
  // violation.
  //
  // `hasRovingTabIndex` makes the hook own the single tab stop: it stamps
  // tabindex 0/-1, repairs the stop on mount and as stops mount/unmount or
  // toggle disabled, and -- via `handleFocus` on the nav -- keeps the stop in
  // sync after clicks or programmatic focus. Individual Tabs still render
  // `tabIndex={isSelected ? 0 : -1}` (see Tab.tsx) as the initial source of
  // truth; the hook's repair preserves an existing tab stop and only promotes
  // the first enabled stop when none is tabbable.
  const {listRef, handleKeyDown, handleFocus} = useListFocus<HTMLElement>({
    itemSelector: TAB_STOP_SELECTOR,
    orientation: 'both',
    hasRovingTabIndex: true,
  });

  const {
    hintElement,
    onKeyDown: onHintKeyDown,
    onFocus: onHintFocus,
    onBlur: onHintBlur,
  } = useKeyboardHint();

  const {scrollRef, overflowStart, overflowEnd} = useScrollOverflow();
  const stripRef = useRef<HTMLDivElement | null>(null);

  const attachStrip = useCallback(
    (el: HTMLDivElement | null) => {
      stripRef.current = el;
      scrollRef(hasScroll ? el : null);
    },
    [hasScroll, scrollRef],
  );

  const revealStop = useCallback(
    (stop: HTMLElement | null) => {
      const strip = stripRef.current;
      if (!hasScroll || !strip || !stop) {
        return;
      }
      const stripBox = strip.getBoundingClientRect();
      const stopBox = stop.getBoundingClientRect();
      const inset = parseFloat(getComputedStyle(strip).scrollPaddingLeft) || 0;
      const pastEnd = stopBox.right - (stripBox.right - inset);
      const pastStart = stopBox.left - (stripBox.left + inset);
      const delta = pastEnd > 0 ? pastEnd : pastStart < 0 ? pastStart : 0;
      if (delta !== 0) {
        // Not an animation: the strip has to arrive already showing the right
        // tab, so this overrides the CSS smooth behaviour arrow presses use.
        strip.scrollBy({left: delta, behavior: 'instant'});
      }
    },
    [hasScroll],
  );

  const revealSelectedTab = useCallback(() => {
    const strip = stripRef.current;
    if (!strip) {
      return;
    }
    revealStop(
      Array.from(strip.querySelectorAll<HTMLElement>('[data-tab-value]')).find(
        el => el.dataset.tabValue === value,
      ) ?? null,
    );
  }, [revealStop, value]);

  // The tab you are on has to be visible. Selection can move without focus —
  // on mount, or when the host sets `value` itself — and neither scrolls the
  // strip the way clicking or arrowing to a tab does.
  useEffect(() => {
    revealSelectedTab();
  }, [revealSelectedTab]);

  // ...and it has to stay visible when the strip is what moved. A strip that
  // fitted at one width can hide the selected tab at a narrower one, and no
  // prop changes when that happens.
  //
  // The wrapper is observed rather than the strip because the shared observer
  // keeps one callback per element and `useScrollOverflow` already holds the
  // strip's.
  const revealSelectedTabRef = useRef(revealSelectedTab);
  useEffect(() => {
    revealSelectedTabRef.current = revealSelectedTab;
  }, [revealSelectedTab]);

  useEffect(() => {
    const root = listRef.current;
    if (!hasScroll || !root) {
      return;
    }
    const onResize = () => revealSelectedTabRef.current();
    observeResize(root, onResize);
    return () => unobserveResize(root);
  }, [hasScroll, listRef]);

  const scrollByPage = useCallback((direction: -1 | 1) => {
    const strip = stripRef.current;
    if (!strip) {
      return;
    }
    // Under RTL the scroll axis is inverted, so flip the physical delta.
    const rtlSign = isRtlElement(strip) ? -1 : 1;
    strip.scrollBy({
      left: rtlSign * direction * strip.clientWidth * SCROLL_PAGE_RATIO,
    });
  }, []);

  const scrollToStart = useCallback(() => scrollByPage(-1), [scrollByPage]);
  const scrollToEnd = useCallback(() => scrollByPage(1), [scrollByPage]);

  const contextValue = useMemo(
    () => ({value, onChange, size, layout}),
    [value, onChange, size, layout],
  );

  const handleRootKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      onKeyDownProp?.(e);
      if (e.defaultPrevented) {
        return;
      }
      onHintKeyDown(e);
      handleKeyDown(e);
    },
    [onKeyDownProp, onHintKeyDown, handleKeyDown],
  );

  const handleRootFocus = useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      onFocusProp?.(e);
      if (e.defaultPrevented) {
        return;
      }
      onHintFocus(e);
      handleFocus(e);
      // The browser scrolls a focused element into view only when it is
      // entirely outside the scrollport, so arrowing onto a half-visible stop
      // leaves it cut off under the fade. Finish the job it started.
      revealStop(e.target.closest(TAB_STOP_SELECTOR));
    },
    [onFocusProp, onHintFocus, handleFocus, revealStop],
  );

  const handleRootBlur = useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      onBlurProp?.(e);
      if (e.defaultPrevented) {
        return;
      }
      onHintBlur(e);
    },
    [onBlurProp, onHintBlur],
  );

  const fadeStyle = !hasScroll
    ? null
    : overflowStart && overflowEnd
      ? styles.fadeBoth
      : overflowStart
        ? styles.fadeStart
        : overflowEnd
          ? styles.fadeEnd
          : null;

  return (
    <TabListContext value={contextValue}>
      <nav
        ref={useMergedRefs(ref, listRef)}
        {...restProps}
        aria-label={ariaLabel}
        onKeyDown={handleRootKeyDown}
        onFocus={handleRootFocus}
        onBlur={handleRootBlur}
        {...{[EDGE_COMP_ATTR]: ''}}
        {...mergeProps(
          themeProps('tab-list', {size}),
          stylex.props(
            styles.nav,
            layout === 'fill' && styles.fill,
            hasDivider && styles.divider,
            xstyle,
          ),
          className,
          style,
        )}>
        <div
          ref={attachStrip}
          {...mergeProps(
            themeProps('tab-strip'),
            stylex.props(
              styles.strip,
              hasScroll && styles.stripScroll,
              fadeStyle,
            ),
          )}>
          {children}
        </div>
        {hasScroll && overflowStart && (
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            // Nothing hidden from assistive technology should end up holding
            // focus, and a click would put it here.
            onMouseDown={preventFocus}
            onClick={scrollToStart}
            {...mergeProps(
              themeProps('tab-scroll-button'),
              focusOutlineProps.focusVisible(
                styles.arrow,
                styles.arrowStart,
                arrowSizeStyles[size],
              ),
            )}>
            <Icon
              icon="chevronLeft"
              size="sm"
              color="inherit"
              xstyle={rtlStyles.mirror}
            />
          </button>
        )}
        {hasScroll && overflowEnd && (
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onMouseDown={preventFocus}
            onClick={scrollToEnd}
            {...mergeProps(
              themeProps('tab-scroll-button'),
              focusOutlineProps.focusVisible(
                styles.arrow,
                styles.arrowEnd,
                arrowSizeStyles[size],
              ),
            )}>
            <Icon
              icon="chevronRight"
              size="sm"
              color="inherit"
              xstyle={rtlStyles.mirror}
            />
          </button>
        )}
        {hintElement}
      </nav>
    </TabListContext>
  );
}

TabList.displayName = 'TabList';
