// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file PickerWheel.tsx
 * @input Wheel's props (wheelOptions.ts): option list, selected value and
 *   change callback
 * @output Exports PickerWheel — one picker column that moves like UIPickerView
 * @position Internal component; the Wheel under a finger (Wheel.tsx picks it)
 *
 * This column moves like UIPickerView's and keeps today's look, under a
 * finger on every touch device (one touch model, iOS and Android alike);
 * Wheel.tsx draws today's scrolling column under a mouse or other fine
 * pointer. It is rebuilt on the gesture system and the UIKit constants table
 * rather than on a native scroller, because a native scroll-snap container
 * cannot move like a picker: WebKit gives every
 * scroll-snapping scroller the fast deceleration rate (0.99 a millisecond),
 * a UIPickerView decelerates at the normal rate (0.998) onto a row it picks
 * from its own projection, and a scroller's momentum cannot be caught,
 * measured or proven.
 *
 * - A finger drags the rows through a PanGestureRecognizer: every move
 *   writes the rows' transforms, past an end on UIKit's rubber band, and the
 *   lift reads a scroll view's release velocity, a pan's `scrollVelocity()`.
 * - The lift starts the motion UIKit would (wheelPhysics.ts: a coast onto a
 *   row, a snap, a coast into an end and its bounce, a return from past an
 *   end), baked per row and played on the compositor (wheelMotion.ts), so a
 *   busy main thread neither stops nor jumps it. A finger landing on a moving
 *   wheel stops it where it is on screen.
 * - A tap on a row turns the wheel onto it on the tap spin (0.3 s,
 *   `picker.tapSpin.durationMs`, on `timing.curves.move`). A tap on the
 *   band's row does nothing. An end bounces on `scroll.bounce`. The curve
 *   and the bounce are resolved when their motion starts (internal roles,
 *   motion/resolveMotion.ts).
 * - The value commits when the wheel comes to rest, as UIPickerView's
 *   didSelectRow does. A rest on a disabled row (outside the bounds) is
 *   followed by a turn onto the nearest enabled row, which then commits; a
 *   rest on the committed row commits nothing, even outside the bounds
 *   (component:DateInput FR13).
 * - Each row reaching the band ticks a selection haptic where the browser
 *   can vibrate (not iOS Safari, which cannot play haptics from script).
 * - Under reduced motion (design:reduced-motion DR2) the drag follows the
 *   finger, and the momentum that continues a throw (a release's coast, and
 *   its bounce at an end) plays as is, as scrolling keeps decelerating under
 *   iOS Reduce Motion. Every transition the wheel starts (a slow release's
 *   snap, a return from past an end, the turn on from a disabled row, a tap,
 *   a key, a click, a scroll wheel's snap) lands without
 *   travel: the rows cross-fade onto their row, opacity only, on the
 *   animator's Reduce Motion fade (`reducedMotionFade`).
 *
 * The rows are today's (wheelLook.ts): each option is drawn once, as its own
 * row, tipping and fading toward the column's edges as today's `view()`
 * timeline draws it (only fading, under reduced motion), over today's band.
 * The row under the band is marked as today's column marks it: in render at
 * rest, painted directly on a drag frame, and moved where a motion stops or
 * ends, so the compositor plays a motion with no layout or paint per frame.
 *
 * Accessibility: a listbox, one tab stop, `aria-activedescendant` on the
 * committed row (a value set from outside shows in the same render). Arrow
 * keys and Page Up/Down step to the next enabled row from the one the wheel
 * is heading to; Home and End go to the first and the last enabled row. Each
 * commits at once and turns the wheel there.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/DateInput/PickerWheel.test.tsx
 * - /packages/core/src/DateInput/Wheel.tsx (the switch)
 * - /packages/core/src/DateInput/DateInputTouch.test.tsx
 * - /packages/core/src/DateInput/DateInput.doc.mjs
 * - /packages/core/src/TimeInput/TimeInput.doc.mjs
 */

import {useCallback, useEffect, useId, useMemo, useRef, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {PanGestureRecognizer} from '../gestures/PanGestureRecognizer';
import {TapGestureRecognizer} from '../gestures/TapGestureRecognizer';
import {useGestureRecognizer} from '../gestures/useGestureRecognizer';
import {observeResize} from '../utils/sharedResizeObserver';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {rubberBandInverse} from '../motion/rubberBand';
import {resolveMotion} from '../motion/resolveMotion';
import {picker} from '../motion/uikit/picker';
import {registerScrollTable, scroll} from '../motion/uikit/scroll';
import {registerTimingTable, timing} from '../motion/uikit/timing';
import {
  colorVars,
  fontWeightVars,
  radiusVars,
  spacingVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {useMediaQuery} from '../hooks/useMediaQuery';
import {focusOutlineStyles} from '../utils';
import {lockSelection} from '../gestures/selectionLock';
import {dateInputTouchGeometry, dateInputTouchSizes} from './tokens.stylex';
import {useOwnScrollGesture} from './useOwnScrollGesture';
import {drumGeometry} from './wheelDrum';
import {WHEEL_ROW_PITCH, todayLook} from './wheelLook';
import {WheelMotion, type PlayOptions} from './wheelMotion';
import {reducedMotionFade} from '../motion/reducedMotion';
import {
  dragOffset,
  nearestIndex,
  offsetBounds,
  planRelease,
  snapCurve,
  spinCurve,
  type WheelCurve,
  type WheelLayout,
} from './wheelPhysics';
import {nearestEnabledIndex, type WheelProps} from './wheelOptions';

/** Today's row pitch, px: the touch column draws today's look (wheelLook.ts). */
const ROW_HEIGHT = WHEEL_ROW_PITCH;
/** UIKit's geometry scaled to the row: the rubber band's dimension. */
const GEOMETRY = drumGeometry(ROW_HEIGHT);
/** Today's column, px: six 44 px day rows (`dateInputTouchGeometry.paneBlockSize`). */
const COLUMN_HEIGHT = 6 * 44;
/** Wheel events stop moving the wheel after this long without one, ms. */
const WHEEL_IDLE_MS = 160;

const styles = stylex.create({
  // Today's column (Wheel.tsx): the same box, band and rows, moved by the
  // gesture system and the compositor instead of a native scroller.
  column: {
    position: 'relative',
    flex: '1 1 0',
    minInlineSize: 0,
    blockSize: dateInputTouchGeometry.paneBlockSize,
    overflow: 'hidden',
    outline: 'none',
    // Gives the rows' tip somewhere to recede to, from the column's centre,
    // as today's scroller does.
    perspective: '520px',
    WebkitTapHighlightColor: 'transparent',
  },
  /**
   * Today's selection band: a centred row-height plate behind the rows.
   * Decorative: the committed value is announced by `aria-selected`.
   */
  band: {
    position: 'absolute',
    insetInline: 0,
    insetBlockStart: `calc(50% - (${dateInputTouchSizes.wheelItemSize} / 2))`,
    blockSize: dateInputTouchSizes.wheelItemSize,
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-neutral'],
    pointerEvents: 'none',
  },
  /**
   * The strip: the rows at their places along the wheel, its top on the
   * band's row, translated by minus the wheel's offset. Also what a
   * reduced-motion cross-fade fades.
   */
  strip: {
    position: 'absolute',
    insetInline: 0,
    insetBlockStart: `calc(50% - (${dateInputTouchSizes.wheelItemSize} / 2))`,
    transformStyle: 'preserve-3d',
    pointerEvents: 'none',
  },
  /** One row: an option at its place along the strip, tipped (wheelLook.ts). */
  row: {
    position: 'absolute',
    insetInline: 0,
    blockSize: dateInputTouchSizes.wheelItemSize,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingInline: spacingVars['--spacing-2'],
    boxSizing: 'border-box',
    backfaceVisibility: 'hidden',
    fontSize: typeScaleVars['--text-large-size'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    color: colorVars['--color-text-primary'],
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    userSelect: 'none',
    // No transition on the mark, unlike today's column: a colour or weight
    // that animates lays out and paints every frame on the main thread, and
    // a mark set as a drag lets go would do so through the coast
    // (spec:AST-094 FR5).
  },
  /** The row under the band, as today's column marks it. */
  rowActive: {
    color: colorVars['--color-text-accent'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  rowDisabled: {
    color: colorVars['--color-text-disabled'],
  },
  /** A row at its place along the strip. */
  rowAt: (top: string) => ({insetBlockStart: top}),
});

/**
 * The motion tables the wheel resolves internal roles from: the timing curve
 * and the scroll bounce (the picker's own values are constants). Nothing
 * registers on import (motion/roles.ts) and each register is idempotent, so
 * the wheel calls this right before it resolves a role.
 */
function registerWheelTables(): void {
  registerTimingTable();
  registerScrollTable();
}

/**
 * A turn onto `to` on the picker's tap spin (`picker.tapSpin.durationMs`),
 * on `timing.curves.move` as resolved under `column` when the turn starts.
 */
function turnCurve(
  column: Element | null,
  from: number,
  to: number,
): WheelCurve {
  registerWheelTables();
  return spinCurve(
    from,
    to,
    picker.tapSpin.durationMs / 1000,
    resolveMotion(column, timing.curves.move),
  );
}

/** A transition's options: the player's, and what started it. */
interface MoveOptions extends PlayOptions {
  /** Started by a touch drag's release (design:reduced-motion DR2). */
  touchRelease?: boolean;
  /**
   * The momentum that continues a throw: a coast, and its settle at an edge.
   * It is direct movement, so it plays under reduced motion too
   * (design:reduced-motion DR2), as scrolling keeps decelerating under iOS
   * Reduce Motion.
   */
  momentum?: boolean;
}

interface DragState {
  /** The finger's offset at the pan's start, before any rubber band. */
  readonly start: number;
}

/**
 * One UIPickerView column: the Wheel under a finger.
 *
 * @example
 * ```
 * <PickerWheel label="Month" options={monthOptions} value={month} onChange={setMonth} />
 * ```
 */
export function PickerWheel({
  label,
  options,
  value,
  onChange,
  isActive = true,
}: WheelProps) {
  const id = useId();
  const columnRef = useRef<HTMLDivElement | null>(null);
  const rowsRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const rowCount = options.length;
  const layout = useMemo<WheelLayout>(
    () => ({rowHeight: ROW_HEIGHT, rowCount}),
    [rowCount],
  );
  const [motion] = useState(() => new WheelMotion(layout));
  const selectedIndex = Math.max(
    0,
    options.findIndex(option => option.value === value),
  );
  const dragRef = useRef<DragState | null>(null);
  /** A finger landed on a moving wheel and stopped it. */
  const caughtRef = useRef(false);

  const latestRef = useRef({options, value, onChange, layout});
  useIsomorphicLayoutEffect(() => {
    latestRef.current = {options, value, onChange, layout};
  });

  // The row under the band is marked as today's column marks it. At rest
  // that is the committed row, styled in render; while a finger drags the
  // wheel, the row reaching the band is painted directly, so marking it never
  // re-renders. A motion unmarks every row as it starts and marks the row it
  // stops or ends on: the compositor plays it with no layout or paint per
  // frame (spec:AST-094 FR5), and no mark rides away from the band.
  const paintedRef = useRef<Set<HTMLElement>>(new Set());
  const paintRow = useCallback((position: number | null) => {
    const container = rowsRef.current;
    if (container == null || container.children.length === 0) {
      return;
    }
    const rows = container.children;
    const {options: currentOptions, value: currentValue} = latestRef.current;
    const active = position == null ? null : (rows[position] as HTMLElement);
    const painted = paintedRef.current;
    for (const row of painted) {
      row.style.removeProperty('color');
      row.style.removeProperty('font-weight');
    }
    painted.clear();
    const selected = currentOptions.findIndex(
      option => option.value === currentValue,
    );
    if (rows[selected] != null && rows[selected] !== active) {
      // The committed row's own mark gives way while another row is under
      // the band.
      const row = rows[selected] as HTMLElement;
      row.style.color = currentOptions[selected]?.isDisabled
        ? colorVars['--color-text-disabled']
        : colorVars['--color-text-primary'];
      row.style.fontWeight = fontWeightVars['--font-weight-normal'];
      painted.add(row);
    }
    if (active == null || position == null) {
      return;
    }
    active.style.color = currentOptions[position]?.isDisabled
      ? colorVars['--color-text-disabled']
      : colorVars['--color-text-accent'];
    active.style.fontWeight = fontWeightVars['--font-weight-semibold'];
    painted.add(active);
  }, []);

  // Every transition the wheel starts. Under reduced motion it lands without
  // travel: the rows cross-fade onto their row on the animator's Reduce
  // Motion fade, whatever the curve (design:reduced-motion DR2, DR4). The
  // momentum that continues a throw is not a transition and plays as is.
  const move = useCallback(
    (
      curve: WheelCurve,
      {touchRelease = false, momentum = false, ...options}: MoveOptions = {},
    ) => {
      paintRow(null);
      const fadeTiming = momentum
        ? null
        : reducedMotionFade(columnRef.current, {touchRelease});
      if (fadeTiming == null) {
        motion.play(curve, options);
        return;
      }
      const fade = rowsRef.current == null ? [] : [rowsRef.current];
      motion.crossFade(curve.to, {
        durationMs: fadeTiming.duration,
        easing: fadeTiming.easing,
        fade,
        onEnd: options.onEnd,
      });
    },
    [motion, paintRow],
  );

  // The wheel came to rest at `offset`: commit, or turn on to the row the
  // rest rule names first.
  const arrive = useCallback(
    (offset: number) => {
      const current = latestRef.current;
      const row = nearestIndex(offset, current.layout);
      const committed = current.options.findIndex(
        option => option.value === current.value,
      );
      // Resting on the committed row is not a stop to correct
      // (component:DateInput FR13): a committed value outside the bounds stays
      // until a person moves the wheel off it, as in the scrolling column.
      const resolved =
        row === committed
          ? row
          : nearestEnabledIndex(current.options, row, Math.max(0, committed));
      if (resolved !== row && current.options[resolved] != null) {
        move(turnCurve(columnRef.current, offset, resolved * ROW_HEIGHT), {
          onEnd: (outcome, end) => {
            if (outcome === 'arrived') {
              arrive(end);
            }
          },
        });
        return;
      }
      const option = current.options[row];
      if (
        option != null &&
        !option.isDisabled &&
        option.value !== current.value
      ) {
        current.onChange(option.value);
      }
    },
    [move],
  );

  const onEnd = useCallback(
    (outcome: 'arrived' | 'stopped', offset: number) => {
      if (outcome === 'arrived') {
        arrive(offset);
      }
    },
    [arrive],
  );

  // Hand the rows to the motion engine whenever they are rendered anew.
  useIsomorphicLayoutEffect(() => {
    motion.setLayout(layout);
    const container = rowsRef.current;
    const rows =
      container == null
        ? []
        : Array.from(container.children).filter(
            (child): child is HTMLElement => child instanceof HTMLElement,
          );
    motion.attach(rows, container);
  }, [motion, layout, options]);

  // Today's look, for the column's height: rows tip and fade toward its
  // edges (only fade, under reduced motion). The shared observer measures
  // once at once, then on every resize.
  useIsomorphicLayoutEffect(() => {
    const column = columnRef.current;
    if (column == null) {
      return;
    }
    return observeResize(column, () => {
      const height = column.getBoundingClientRect().height || COLUMN_HEIGHT;
      motion.setLook(todayLook(height, {reducedMotion}));
    });
  }, [motion, reducedMotion]);

  useIsomorphicLayoutEffect(() => {
    motion.onNearestChange(paintRow);
    return () => motion.onNearestChange(null);
  }, [motion, paintRow]);
  // At rest on the committed row, render's own mark takes over again.
  useIsomorphicLayoutEffect(() => {
    if (
      motion.isMoving() ||
      dragRef.current != null ||
      nearestIndex(motion.offset(), layout) !== selectedIndex
    ) {
      return;
    }
    for (const row of paintedRef.current) {
      row.style.removeProperty('color');
      row.style.removeProperty('font-weight');
    }
    paintedRef.current.clear();
  });

  useEffect(() => () => motion.dispose(), [motion]);

  // Park the committed row under the band when the wheel is shown or the
  // value changes from outside (the calendar moved to another month). Never
  // while a finger or a motion owns the wheel.
  useIsomorphicLayoutEffect(() => {
    if (!isActive || dragRef.current != null || motion.isMoving()) {
      return;
    }
    if (Math.abs(motion.offset() - selectedIndex * ROW_HEIGHT) > 0.01) {
      motion.setOffset(selectedIndex * ROW_HEIGHT);
    }
  }, [isActive, selectedIndex, layout, motion]);

  // A hidden wheel keeps no motion running and holds no drag. Hiding it
  // mid-drag ends the pan without calling its listener (the toggle's owner
  // owns that end), so the drag is dropped here, uncommitted: shown again,
  // the wheel parks the committed row.
  useEffect(() => {
    if (!isActive) {
      dragRef.current = null;
      motion.stop();
    }
  }, [isActive, motion]);

  // A finger lands: a moving wheel stops where it is on screen.
  const onTouchDown = useCallback(
    (time: number) => {
      caughtRef.current = motion.isMoving();
      if (caughtRef.current) {
        motion.stop(time);
      }
    },
    [motion],
  );

  const onTouchDownRef = useRef(onTouchDown);
  useIsomorphicLayoutEffect(() => {
    onTouchDownRef.current = onTouchDown;
  });

  const release = useCallback(
    (velocity: number) => {
      registerWheelTables();
      const plan = planRelease(
        motion.offset(),
        velocity,
        latestRef.current.layout,
        resolveMotion(columnRef.current, scroll.bounce),
      );
      move(plan.curve, {
        ticks: true,
        onEnd,
        touchRelease: true,
        momentum: plan.kind === 'coast' || plan.kind === 'edge',
      });
    },
    [motion, move, onEnd],
  );

  const pan = useGestureRecognizer(
    columnRef,
    () =>
      new PanGestureRecognizer({
        name: 'wheel-pan',
        direction: 'vertical',
        // A held finger on the wheel never starts text selection or the
        // callout.
        selectionLock: lockSelection,
        shouldReceiveTouch: (_pan, touch) => {
          onTouchDownRef.current(touch.time);
          return true;
        },
      }),
    recognizer => {
      const {layout: currentLayout} = latestRef.current;
      switch (recognizer.state) {
        case 'began': {
          const shown = motion.isMoving() ? motion.stop() : motion.offset();
          dragRef.current = {start: fingerOffset(shown, currentLayout)};
          motion.resetDrag();
          motion.setOffset(
            dragOffset(
              dragRef.current.start - recognizer.translation().y,
              currentLayout,
            ),
            {ticks: true},
          );
          break;
        }
        case 'changed': {
          const drag = dragRef.current;
          if (drag == null) {
            break;
          }
          motion.setOffset(
            dragOffset(drag.start - recognizer.translation().y, currentLayout),
            {ticks: true},
          );
          break;
        }
        case 'ended': {
          const drag = dragRef.current;
          dragRef.current = null;
          // A scroll view's release velocity (the pan's last two, blended as
          // UIPickerView's); the rows move against the finger.
          release(drag == null ? 0 : -recognizer.scrollVelocity().y);
          break;
        }
        case 'cancelled': {
          dragRef.current = null;
          release(0);
          break;
        }
        case 'possible':
        case 'failed':
          break;
      }
    },
    {isEnabled: isActive},
  );

  // A touch that stopped a moving wheel and lifted without dragging: the
  // wheel eases onto the nearest row, as a release without velocity does.
  useEffect(
    () =>
      pan.addTransitionListener((_pan, _from, to) => {
        // The flag stays up until the next touch lands: the tap recognizer
        // may hear of this lift after the pan does, and must not read it as
        // a tap on a row.
        if (to === 'failed' && caughtRef.current && !motion.isMoving()) {
          release(0);
        }
      }),
    [pan, motion, release],
  );

  useGestureRecognizer(
    columnRef,
    () => new TapGestureRecognizer({name: 'wheel-tap'}),
    recognizer => {
      if (recognizer.state !== 'ended' || caughtRef.current) {
        return;
      }
      const column = columnRef.current;
      if (column == null) {
        return;
      }
      const box = column.getBoundingClientRect();
      const {y} = recognizer.location();
      const offset = motion.offset();
      const currentLayout = latestRef.current.layout;
      const row = rowAtPoint(
        y - (box.top + box.height / 2),
        offset,
        currentLayout,
      );
      if (row == null || row === nearestIndex(offset, currentLayout)) {
        return;
      }
      move(turnCurve(columnRef.current, offset, row * ROW_HEIGHT), {
        onEnd,
      });
    },
    {isEnabled: isActive},
  );

  // Keep the finger: inside a BottomSheet the sheet would otherwise read a
  // downward drag here as swipe-to-dismiss (see useOwnScrollGesture).
  useOwnScrollGesture(columnRef, 'all', {isEnabled: isActive});
  // The pointer that finger also stays here. A sheet arms its pull-down on
  // the body's pointerdown and counts on a native pan to cancel a touch
  // pointer, but this wheel pans through the gesture system, which never
  // cancels it: without this, the sheet follows the first 8 px of a downward
  // drag before the wheel's pan takes over. The gesture host listens in the
  // capture phase, before this.
  useEffect(() => {
    const column = columnRef.current;
    if (column == null || !isActive) {
      return undefined;
    }
    const keep = (event: PointerEvent) => event.stopPropagation();
    column.addEventListener('pointerdown', keep);
    return () => column.removeEventListener('pointerdown', keep);
  }, [isActive]);

  // A mouse wheel or a trackpad turns the rows; the wheel eases onto the
  // nearest row once the events stop.
  useEffect(() => {
    const column = columnRef.current;
    if (column == null || !isActive) {
      return;
    }
    let idle: number | undefined;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const currentLayout = latestRef.current.layout;
      const delta =
        event.deltaMode === 1
          ? event.deltaY * ROW_HEIGHT
          : event.deltaMode === 2
            ? event.deltaY * GEOMETRY.height
            : event.deltaY;
      const {min, max} = offsetBounds(currentLayout);
      const shown = motion.isMoving() ? motion.stop() : motion.offset();
      motion.setOffset(Math.min(max, Math.max(min, shown + delta)), {
        ticks: true,
      });
      window.clearTimeout(idle);
      idle = window.setTimeout(() => {
        const offset = motion.offset();
        const target =
          nearestIndex(offset, latestRef.current.layout) * ROW_HEIGHT;
        move(snapCurve(offset, target, 1), {onEnd});
      }, WHEEL_IDLE_MS);
    };
    column.addEventListener('wheel', onWheel, {passive: false});
    return () => {
      column.removeEventListener('wheel', onWheel);
      window.clearTimeout(idle);
    };
  }, [isActive, motion, move, onEnd]);

  // A key commits `row` at once and turns the wheel there from `offset`.
  const turnTo = useCallback(
    (row: number, offset: number) => {
      const current = latestRef.current;
      const option = current.options[row];
      if (option.value !== current.value) {
        current.onChange(option.value);
      }
      move(turnCurve(columnRef.current, offset, row * ROW_HEIGHT));
    },
    [move],
  );

  const moveBy = useCallback(
    (delta: number) => {
      const current = latestRef.current;
      const count = current.options.length;
      if (count === 0 || delta === 0) {
        return;
      }
      // Keys step from the row the wheel is heading to, not the one it is
      // passing: two quick presses move two rows.
      const heading = motion.target();
      const offset = motion.isMoving() ? motion.stop() : motion.offset();
      const from = nearestIndex(heading, current.layout);
      const isEnabled = (index: number) => {
        const option = current.options[index];
        return option != null && !option.isDisabled;
      };
      const step = Math.sign(delta);
      const next = Math.min(count - 1, Math.max(0, from + delta));
      // The first enabled row from the target onwards; failing that (the
      // target is past the bounds), the enabled row nearest it on the way
      // back, short of the row it started from.
      let found: number | null = null;
      for (let index = next, tries = 0; tries < count; tries++, index += step) {
        if (index < 0 || index >= count) {
          break;
        }
        if (isEnabled(index)) {
          found = index;
          break;
        }
      }
      for (let index = next; found == null && index !== from; index -= step) {
        if (isEnabled(index)) {
          found = index;
        }
      }
      if (found == null) {
        return;
      }
      turnTo(found, offset);
    },
    [motion, turnTo],
  );

  // Home and End: the first and the last enabled row, wherever the wheel is
  // heading.
  const moveToEnd = useCallback(
    (end: 'first' | 'last') => {
      const {options: rows} = latestRef.current;
      const enabled = rows.flatMap((option, index) =>
        option.isDisabled ? [] : [index],
      );
      const row = end === 'first' ? enabled[0] : enabled[enabled.length - 1];
      if (row == null) {
        return;
      }
      const offset = motion.isMoving() ? motion.stop() : motion.offset();
      turnTo(row, offset);
    },
    [motion, turnTo],
  );

  // A click on a row (assistive technology, a keyboard, a test, a mouse the
  // tap recognizer did not take) commits it at once and turns the wheel
  // there, as the arrow keys do. A finger's tap is the tap recognizer's, and
  // the click it would produce is swallowed by the gesture system.
  const activateRow = useCallback(
    (row: number) => {
      const current = latestRef.current;
      const option = current.options[row];
      if (option == null || option.isDisabled) {
        return;
      }
      const offset = motion.isMoving() ? motion.stop() : motion.offset();
      if (option.value !== current.value) {
        current.onChange(option.value);
      }
      move(turnCurve(columnRef.current, offset, row * ROW_HEIGHT));
    },
    [motion, move],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          moveBy(1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          moveBy(-1);
          break;
        case 'PageDown':
          event.preventDefault();
          moveBy(10);
          break;
        case 'PageUp':
          event.preventDefault();
          moveBy(-10);
          break;
        case 'Home':
          event.preventDefault();
          moveToEnd('first');
          break;
        case 'End':
          event.preventDefault();
          moveToEnd('last');
          break;
        default:
          break;
      }
    },
    [moveBy, moveToEnd],
  );

  return (
    <div
      ref={columnRef}
      role="listbox"
      aria-label={label}
      // The committed row: a value set from outside shows in the same render.
      aria-activedescendant={`${id}-${options[selectedIndex]?.value}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      data-wheel=""
      {...stylex.props(styles.column, focusOutlineStyles.focusVisible)}>
      <div aria-hidden="true" {...stylex.props(styles.band)} />
      <div ref={rowsRef} data-wheel-strip="" {...stylex.props(styles.strip)}>
        {options.map((option, index) => (
          <div
            key={option.value}
            id={`${id}-${option.value}`}
            role="option"
            aria-selected={option.value === value}
            aria-disabled={option.isDisabled || undefined}
            data-wheel-row=""
            data-label={option.label}
            onClick={() => activateRow(index)}
            {...stylex.props(
              styles.row,
              styles.rowAt(`${index * ROW_HEIGHT}px`),
              index === selectedIndex && styles.rowActive,
              option.isDisabled && styles.rowDisabled,
            )}>
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
}

PickerWheel.displayName = 'PickerWheel';

/**
 * The row under a point `dy` px below the band's centre, or null past either
 * end of the list. Today's rows tip about their own centres, so each centre
 * stays where the row is laid out.
 */
function rowAtPoint(
  dy: number,
  offset: number,
  layout: WheelLayout,
): number | null {
  const position = Math.round((offset + dy) / layout.rowHeight);
  if (position < 0 || position >= layout.rowCount) {
    return null;
  }
  return position;
}

/**
 * The finger's offset for a shown one: past an end, the travel that the
 * rubber band shows as `shown` (so a drag that starts in a bounce continues
 * without a jump).
 */
function fingerOffset(shown: number, layout: WheelLayout): number {
  const {min, max} = offsetBounds(layout);
  const dimension = GEOMETRY.rubberBandDimension;
  if (shown < min) {
    return min + rubberBandInverse(shown - min, dimension);
  }
  if (shown > max) {
    return max + rubberBandInverse(shown - max, dimension);
  }
  return shown;
}
