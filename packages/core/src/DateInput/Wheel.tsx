// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Wheel.tsx
 * @input Option list, selected value and change callback
 * @output Exports Wheel — one picker column — ScrollWheel (today's column),
 *   and the shared types of wheelOptions.ts
 * @position Internal component; consumed by MonthYearWheels.tsx,
 *   TouchTimeField.tsx and TouchDateTimeField.tsx
 *
 * Wheel picks its column by the primary pointer (useTouchPresentation): one
 * touch model on every touch device, iOS and Android alike. Under a finger
 * it moves like UIPickerView in today's look: PickerWheel.tsx, the touch
 * layer, imported here alone. Under a mouse or other fine pointer it is the snap-scrolling
 * column below, today's Astryx wheel. A wheel draws only on a sheet, so a caller who
 * pins the fine surface (`presentation="popover"` on its input) gets no
 * sheet and no wheel (architecture:public-component-api INV16).
 *
 * The scrolling column is a scroll container, not a custom gesture surface. Momentum,
 * rubber-banding, and the settle animation are the platform's; all this adds
 * is `scroll-snap-align: center` on each option, half a viewport of padding at
 * each end so the first and last option can reach the middle, and a commit
 * when the scrolling stops.
 *
 * The falloff (rows fading and tipping away from the centre) is a CSS
 * scroll-driven animation on a `view()` timeline — the browser interpolates it
 * against each row's own position in the scrollport, so it stays glued to the
 * finger with no JS in the frame loop. It is guarded by `@supports`, because a
 * browser that does not understand `animation-timeline` would otherwise run
 * the same keyframes on the document timeline and simply play them once.
 *
 * Reduced motion (design:reduced-motion): the wheel's own scrolls (a step
 * from a key or a click, the travel to the nearest enabled row) land without
 * travel, cross-fading on a touch screen and at once otherwise. A finger's
 * scroll and its momentum are the platform's.
 *
 * Accessibility: this is a listbox, not a novel widget. It is one tab stop
 * with arrow/Home/End/PageUp/PageDown keys, `aria-activedescendant` tracking
 * the active row, and every row reachable by tap — none of which depends on
 * the scroll-driven decoration.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/DateInput/PickerWheel.tsx (the touch column)
 * - /packages/core/src/DateInput/wheelOptions.ts
 * - /packages/core/src/DateInput/TouchDateField.tsx
 * - /packages/core/src/DateTimeInput/TouchDateTimeField.tsx
 * - /packages/core/src/DateInput/DateInput.doc.mjs
 * - /packages/core/src/DateInput/DateInputTouch.test.tsx
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  radiusVars,
  fontWeightVars,
  typeScaleVars,
  spacingVars,
  durationVars,
} from '../theme/tokens.stylex';
import {focusOutlineStyles} from '../utils';
import {reducedMotionFade} from '../motion/reducedMotion';
import {useTouchPresentation} from '../utils/touchPresentation';
import {PickerWheel} from './PickerWheel';
import {dateInputTouchSizes, dateInputTouchGeometry} from './tokens.stylex';
import {useOwnScrollGesture} from './useOwnScrollGesture';
import {usePointerDragScroll} from './usePointerDragScroll';
import {useScrollSettle} from './useScrollSettle';
import {useWheelListbox} from './useWheelListbox';
import {nearestEnabledIndex, type WheelProps} from './wheelOptions';

export {
  nearestEnabledIndex,
  type WheelOption,
  type WheelProps,
} from './wheelOptions';

const ITEM_BLOCK_SIZE = dateInputTouchSizes.wheelItemSize;

/**
 * Rows tip away from the centre of the wheel. 0% is a row just entering at the
 * bottom of the scrollport, 50% is a row centred in it, 100% is a row leaving
 * at the top — which is what a `view()` timeline over the `cover` range means,
 * and why this reads as a cylinder rotating under the finger.
 */
const falloff = stylex.keyframes({
  '0%': {
    opacity: 0.3,
    transform: 'rotateX(52deg) scale(0.86)',
  },
  '50%': {
    opacity: 1,
    transform: 'rotateX(0deg) scale(1)',
  },
  '100%': {
    opacity: 0.3,
    transform: 'rotateX(-52deg) scale(0.86)',
  },
});

/** Motion-free equivalent: the depth cue survives as opacity alone. */
const fadeOnly = stylex.keyframes({
  '0%': {opacity: 0.3},
  '50%': {opacity: 1},
  '100%': {opacity: 0.3},
});

const styles = stylex.create({
  column: {
    position: 'relative',
    flex: '1 1 0',
    minWidth: 0,
  },
  scroller: {
    blockSize: dateInputTouchGeometry.paneBlockSize,
    // Load-bearing, and stated rather than inherited from the reset (whose
    // rule is zero-specificity `:where`): with content-box the end padding
    // below would be added to the scrollport instead of sitting inside it,
    // and every snap position would be wrong.
    boxSizing: 'border-box',
    overflowY: 'auto',
    overflowX: 'hidden',
    // Snap every row to the middle of the scrollport, where the selection band
    // sits. `mandatory` (not `proximity`) because a wheel has no valid resting
    // position between two options.
    scrollSnapType: 'y mandatory',
    overscrollBehavior: 'contain',
    // Room for row 0 and row n-1 to reach the centre.
    paddingBlock: dateInputTouchGeometry.wheelEdgePadding,
    // Gives the rotateX falloff somewhere to recede to.
    perspective: '520px',
    transformStyle: 'preserve-3d',
    scrollbarWidth: 'none',
    outline: 'none',
    // Vertical pans scroll the wheel; a two-finger pinch stays the page's, so
    // the page can still zoom over an open picker (WCAG 1.4.4), as it does
    // over the menus and listboxes (`module:DropdownMenu/useMenuPress` FR4).
    touchAction: 'pan-y pinch-zoom',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    blockSize: ITEM_BLOCK_SIZE,
    paddingInline: spacingVars['--spacing-2'],
    scrollSnapAlign: 'center',
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    // Larger than body text, and larger than the calendar's day numbers: on
    // a wheel the value under the band is the whole interface, and the rows
    // above and below are read at a glance while moving.
    fontSize: typeScaleVars['--text-large-size'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    color: colorVars['--color-text-primary'],
    whiteSpace: 'nowrap',
    // NO `overflow: hidden` here. It would make the row itself a scroll
    // container, and `view()` binds to the subject's nearest ancestor scroll
    // container — the falloff would measure the row against itself and sit
    // frozen at 50% forever. Clipping belongs on the inner element.
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    userSelect: 'none',
    transitionProperty: 'color, font-weight',
    transitionDuration: durationVars['--duration-fast'],
  },
  /**
   * The falloff rides an inner element, never the row itself.
   *
   * A snap area is the element's TRANSFORMED border box, so animating the row
   * would move the very positions the scroller is snapping to — the wheel
   * settles a few pixels off, and the offset feeds back into the animation.
   * Transforming a child leaves the row's box, and every snap offset, exact.
   */
  itemInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    inlineSize: '100%',
    blockSize: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    // The wheel look. Held behind @supports so browsers without scroll-driven
    // animations get a plain, fully legible list instead of these keyframes
    // playing themselves out once on the document timeline. Under reduced
    // motion the same timeline drives opacity only — the depth cue survives,
    // the tipping does not.
    animationName: {
      default: null,
      '@supports (animation-timeline: view())': {
        default: falloff,
        '@media (prefers-reduced-motion: reduce)': fadeOnly,
      },
    },
    animationTimeline: 'view(y)',
    animationRange: 'cover 0% cover 100%',
    animationFillMode: 'both',
    animationDuration: 'auto',
    animationTimingFunction: 'linear',
    backfaceVisibility: 'hidden',
  },
  itemActive: {
    color: colorVars['--color-text-accent'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  itemDisabled: {
    color: colorVars['--color-text-disabled'],
    cursor: 'default',
  },
  /**
   * The selection band: a single centred row-height plate behind the options.
   * Purely decorative — the committed value is announced by `aria-selected`.
   */
  band: {
    position: 'absolute',
    insetInline: 0,
    insetBlockStart: `calc(50% - (${ITEM_BLOCK_SIZE} / 2))`,
    blockSize: ITEM_BLOCK_SIZE,
    borderRadius: radiusVars['--radius-element'],
    // `--color-neutral`, not `--color-background-muted`. Muted is 4.7% alpha,
    // which puts the whole plate 17 units of colour away from the sheet
    // behind it — so when the wheels fade in, the band's animation has 17
    // units to happen in while the text beside it travels 412. It did not
    // read as fading, it read as appearing. Neutral is 10%, which doubles the
    // range to 36 and is still quiet enough to sit under text.
    backgroundColor: colorVars['--color-neutral'],
    pointerEvents: 'none',
  },
});

/**
 * One picker column: UIPickerView's motion in today's look under a finger, today's
 * snap-scrolling column under a fine pointer.
 *
 * @example
 * ```
 * <Wheel
 *   label="Month"
 *   options={monthOptions}
 *   value={month}
 *   onChange={setMonth}
 * />
 * ```
 */
export function Wheel(props: WheelProps) {
  // One touch model on every touch device: a finger gets UIPickerView's
  // motion in today's look, a fine pointer today's column.
  const {isTouch} = useTouchPresentation();
  return isTouch ? <PickerWheel {...props} /> : <ScrollWheel {...props} />;
}

Wheel.displayName = 'Wheel';

/**
 * One snap-scrolling picker column: today's wheel, under a fine pointer.
 *
 * @example
 * ```
 * <ScrollWheel
 *   label="Month"
 *   options={monthOptions}
 *   value={month}
 *   onChange={setMonth}
 * />
 * ```
 */
export function ScrollWheel({
  label,
  options,
  value,
  onChange,
  isActive = true,
}: WheelProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const selectedIndex = Math.max(
    0,
    options.findIndex(option => option.value === value),
  );
  // Which row is under the band right now. Tracks the finger during a scroll;
  // `selectedIndex` only catches up when the wheel settles.
  const [activeIndex, setActiveIndex] = useState(selectedIndex);

  // Row height in px, read from layout rather than assumed, so a theme that
  // retunes --date-input-touch-wheel-item-size still lands on the right row.
  const itemBlockSize = useCallback((): number => {
    const first = scrollerRef.current?.firstElementChild;
    return first instanceof HTMLElement && first.offsetHeight > 0
      ? first.offsetHeight
      : 0;
  }, []);

  // What last started a scroll of the wheel: a pointer's type, or 'wheel'
  // for a mouse wheel or trackpad. Under reduced motion the release of a
  // touch drag cross-fades whatever the primary pointer (design:reduced-motion
  // DR2); a key step, a row tap or a trackpad's scroll follows the primary
  // pointer (DR2 on a coarse one, at once otherwise, DR3).
  const lastPointerRef = useRef<string | null>(null);

  // A reduced-motion dip whose rows have not landed yet: its timer and the
  // row it lands on. While one is pending the rows stay put for it, so they
  // never move at full opacity, and a further step retargets it.
  const pendingFadeRef = useRef<{timer: number; top: number} | null>(null);
  // The running dip, so a step during its fade-in starts the next one where
  // the column is.
  const dipRef = useRef<Animation | null>(null);
  useEffect(
    () => () => {
      if (pendingFadeRef.current != null) {
        window.clearTimeout(pendingFadeRef.current.timer);
        pendingFadeRef.current = null;
      }
    },
    [],
  );

  const scrollToIndex = useCallback(
    (
      index: number,
      behavior: ScrollBehavior,
      {touchRelease = false}: {touchRelease?: boolean} = {},
    ) => {
      const scroller = scrollerRef.current;
      const size = itemBlockSize();
      if (scroller == null || size === 0) {
        return;
      }
      const top = index * size;
      // Under reduced motion (design:reduced-motion) the wheel's own scroll
      // lands without travel: a dip on a touch screen or for a touch drag's
      // release, at once otherwise.
      const fadeTiming =
        behavior === 'smooth'
          ? reducedMotionFade(scroller, {touchRelease})
          : null;
      const pending = pendingFadeRef.current;
      if (fadeTiming == null) {
        if (pending != null) {
          window.clearTimeout(pending.timer);
          pendingFadeRef.current = null;
        }
        scroller.scrollTo({top, behavior});
        return;
      }
      if (fadeTiming.duration === 0 || typeof scroller.animate !== 'function') {
        if (pending != null) {
          window.clearTimeout(pending.timer);
          pendingFadeRef.current = null;
        }
        scroller.scrollTo({top, behavior: 'auto'});
        return;
      }
      if (pending != null) {
        // The dip is still fading out: its rows land here instead.
        pending.top = top;
        return;
      }
      const {duration, easing} = fadeTiming;
      // A step while the last dip still fades back in starts this one where
      // the column is, not at full opacity: a leaving element fades out where
      // it is (design:reduced-motion DR2).
      const shown = Number.parseFloat(getComputedStyle(scroller).opacity);
      dipRef.current?.cancel();
      dipRef.current = scroller.animate(
        [
          {opacity: Number.isFinite(shown) ? shown : 1, easing},
          {opacity: 0, easing},
          {opacity: 1},
        ],
        {duration, easing: 'linear'},
      );
      const landing = {top, timer: 0};
      landing.timer = window.setTimeout(() => {
        pendingFadeRef.current = null;
        scroller.scrollTo({top: landing.top, behavior: 'auto'});
      }, duration / 2);
      pendingFadeRef.current = landing;
    },
    [itemBlockSize],
  );

  // Commit on rest. A wheel that stopped on a disabled row (one outside the
  // bounds) travels on to the nearest enabled row, as UIDatePicker does, and
  // that second rest commits it. Resting on the committed row itself is not a
  // stop to correct: the park after the sheet opens settles there with no
  // touch, and a committed value outside the bounds stays until a person
  // moves the wheel.
  //
  // Declared here, above the park effect, because that effect consults the
  // `isAtRestRef` this returns before it repositions anything.
  const {isAtRestRef} = useScrollSettle(
    scrollerRef,
    scroller => {
      const size = itemBlockSize();
      if (size === 0) {
        return;
      }
      const index = Math.min(
        options.length - 1,
        Math.max(0, Math.round(scroller.scrollTop / size)),
      );
      const restIndex =
        index === selectedIndex
          ? index
          : nearestEnabledIndex(options, index, selectedIndex);
      if (restIndex !== index) {
        scrollToIndex(restIndex, 'smooth', {
          touchRelease: lastPointerRef.current === 'touch',
        });
        return;
      }
      const option = options[index];
      if (option != null && !option.isDisabled && option.value !== value) {
        onChange(option.value);
      }
    },
    isActive,
  );

  // Park the committed row under the band whenever the wheel is shown, or the
  // value is changed from outside (the calendar scrolled to another month).
  //
  // NEVER while the wheel is still moving. A scroller that is mid-gesture or
  // still carrying momentum is the user's, and repositioning it does not stop
  // the momentum — on iOS it feeds a cycle where the scroll this causes reads
  // as a new settle, commits the next row along, and parks again. See
  // useScrollSettle. The settle handler re-checks the position afterwards, so
  // a correction that is genuinely needed still happens, just at rest.
  useEffect(() => {
    // Nor while a reduced-motion dip is still to land its rows: they land
    // under it, on this row.
    if (!isActive || !isAtRestRef.current || pendingFadeRef.current != null) {
      return;
    }
    const size = itemBlockSize();
    const scroller = scrollerRef.current;
    if (scroller == null || size === 0) {
      return;
    }
    if (Math.round(scroller.scrollTop / size) !== selectedIndex) {
      scroller.scrollTo({top: selectedIndex * size, behavior: 'auto'});
    }
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- the highlight follows a scroll position, which only exists after layout
    setActiveIndex(selectedIndex);
  }, [isActive, selectedIndex, itemBlockSize, isAtRestRef]);

  // Highlight follows the finger. rAF-throttled: a scroll can fire far more
  // often than the display refreshes, and this only feeds a repaint.
  const frameRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller == null || !isActive) {
      return;
    }
    const onScroll = () => {
      if (frameRef.current != null) {
        return;
      }
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = undefined;
        const size = itemBlockSize();
        if (size === 0) {
          return;
        }
        const index = Math.min(
          options.length - 1,
          Math.max(0, Math.round(scroller.scrollTop / size)),
        );
        setActiveIndex(index);
      });
    };
    scroller.addEventListener('scroll', onScroll, {passive: true});
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = undefined;
      }
    };
  }, [isActive, options.length, itemBlockSize]);

  // Keep the finger. Inside a BottomSheet the sheet would otherwise read a
  // downward drag here as swipe-to-dismiss; see useOwnScrollGesture. Gated on
  // isActive because the hidden panel keeps its layout box.
  // 'all': a wheel scrolls vertically, the same axis the sheet wants, so
  // there is no way to share — it takes every touch that lands on it.
  useOwnScrollGesture(scrollerRef, 'all', {isEnabled: isActive});

  // A mouse cannot drag a scroll container, so without this the wheel ignores
  // the one gesture its shape invites. Touch is untouched — it pans natively,
  // with momentum this could not match. See usePointerDragScroll.
  usePointerDragScroll(scrollerRef, isActive);

  const moveBy = useCallback(
    (delta: number) => {
      const next = Math.min(
        options.length - 1,
        Math.max(0, activeIndex + delta),
      );
      const option = options[next];
      if (option == null || option.isDisabled) {
        return;
      }
      setActiveIndex(next);
      scrollToIndex(next, 'smooth');
      if (option.value !== value) {
        onChange(option.value);
      }
    },
    [activeIndex, options, scrollToIndex, value, onChange],
  );

  // Home and End step to the first and the last row, as any key does: a
  // disabled one stops them.
  const toEnd = useCallback(
    (end: 'first' | 'last') => {
      moveBy(end === 'first' ? -activeIndex : options.length - 1 - activeIndex);
    },
    [moveBy, activeIndex, options.length],
  );

  const activate = useCallback(
    (index: number) => {
      const option = options[index];
      if (option == null || option.isDisabled) {
        return;
      }
      setActiveIndex(index);
      scrollToIndex(index, 'smooth');
      if (option.value !== value) {
        onChange(option.value);
      }
    },
    [options, scrollToIndex, value, onChange],
  );

  const {listboxProps, optionProps} = useWheelListbox({
    label,
    options,
    value,
    activeIndex,
    stepBy: moveBy,
    toEnd,
    activate,
  });

  return (
    <div {...stylex.props(styles.column)}>
      <div aria-hidden="true" {...stylex.props(styles.band)} />
      <div
        ref={scrollerRef}
        {...listboxProps}
        onPointerDown={event => {
          lastPointerRef.current = event.pointerType;
        }}
        onWheel={() => {
          lastPointerRef.current = 'wheel';
        }}
        {...stylex.props(styles.scroller, focusOutlineStyles.focusVisible)}>
        {options.map((option, index) => (
          <div
            key={option.value}
            {...optionProps(option, index)}
            {...stylex.props(
              styles.item,
              index === activeIndex && styles.itemActive,
              option.isDisabled && styles.itemDisabled,
            )}>
            <span {...stylex.props(styles.itemInner)}>{option.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

ScrollWheel.displayName = 'ScrollWheel';
