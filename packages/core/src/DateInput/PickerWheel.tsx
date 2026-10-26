// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file PickerWheel.tsx
 * @input Wheel's props (wheelOptions.ts): option list, selected value,
 *   change callback; optionally looping, a rest rule, and a ref for
 *   programmatic turns
 * @output Exports PickerWheel — one UIPickerView column
 * @position Internal component; the Wheel under a finger (Wheel.tsx picks
 *   it and imports it statically), drawn standalone or inside a WheelGroup
 *
 * This is UIPickerView's column, its look and motion, drawn under a finger
 * on every touch device (one touch model, iOS and Android alike); Wheel.tsx
 * draws today's scrolling column under a mouse or other fine pointer. It is
 * rebuilt on the gesture system and the UIKit constants table rather than on
 * a native scroller, because a native scroll-snap container cannot move like a picker: WebKit gives every
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
 *   didSelectRow does. A row `resolveRest` moves away from (by default, a
 *   disabled one: outside the bounds) is followed by a turn onto the row it
 *   names, which then commits; a rest on the committed row commits nothing,
 *   even outside the bounds (component:DateInput FR13).
 * - Each row reaching the band ticks a selection haptic where the browser
 *   can vibrate (not iOS Safari, which cannot play haptics from script).
 * - Under reduced motion (design:reduced-motion DR2) the drag follows the
 *   finger, and the momentum that continues a throw (a release's coast, and
 *   its bounce at an end) plays as is, as scrolling keeps decelerating under
 *   iOS Reduce Motion. Every transition the wheel starts (a slow release's
 *   snap, a return from past an end, the turn on from a disabled row, a tap,
 *   a key, a click, `spinTo`, a scroll wheel's snap) lands without
 *   travel: the rows cross-fade onto their row, opacity only, on the
 *   animator's Reduce Motion fade (`reducedMotionFade`).
 *
 * The rows are drawn twice, as UIKit draws them: dimmed on a cylinder seen
 * in perspective above and below the band (wheelDrum.ts), and flat and
 * magnified inside it.
 *
 * Both drawings mount only a window of rows, as UIPickerView lays out only
 * the cells it shows: the cylinder's front half (±90° from the band), the
 * band copy's three rows, and a buffer of two on each side, so showing a
 * wheel costs the same for 12 rows or 200.
 * A motion mounts every row it will show before it plays (its cost follows
 * the distance it travels, not the list), a drag moves the window when the
 * finger nears its edge, and the window settles back around the rest. The
 * listbox's options are separate, plain and complete: one per row, stacked
 * transparent over the band, so assistive technology meets every option and
 * its cursor sits on the band.
 *
 * Accessibility: a listbox, one tab stop, `aria-activedescendant` on the
 * committed row (a value set from outside shows in the same render). Arrow
 * keys and Page Up/Down step to the next enabled row from the one the wheel
 * is heading to; Home and End go to the first and the last enabled row. Each
 * commits at once and turns the wheel there, as a click on an option
 * (assistive technology) does.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/DateInput/PickerWheel.test.tsx
 * - /packages/core/src/DateInput/Wheel.tsx (the switch)
 * - /packages/core/src/DateInput/DateInputTouch.test.tsx
 * - /packages/core/src/DateInput/DateInput.doc.mjs
 * - /packages/core/src/TimeInput/TimeInput.doc.mjs
 */

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {flushSync} from 'react-dom';
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
  spacingVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {focusOutlineStyles} from '../utils';
import {wheelGeometry} from './wheelGeometry.stylex';
import {lockSelection} from '../gestures/selectionLock';
import {useOwnScrollGesture} from './useOwnScrollGesture';
import {useWheelListbox} from './useWheelListbox';
import {drumGeometry, rowAtPoint} from './wheelDrum';
import {WheelMotion, type PlayOptions} from './wheelMotion';
import {reducedMotionFade} from '../motion/reducedMotion';
import {
  dragOffset,
  nearestIndex,
  offsetBounds,
  planRelease,
  snapCurve,
  spinCurve,
  wrapIndex,
  type WheelCurve,
  type WheelLayout,
} from './wheelPhysics';
import {useWheelGroup, wheelGroupStyles} from './WheelGroup';
import {
  nearestEnabledIndex,
  type WheelProps,
  type WheelSpinOptions,
} from './wheelOptions';

/** UIKit's row pitch, px: the wheel's geometry is UIPickerView's. */
const ROW_HEIGHT = picker.geometry.rowHeight;
const GEOMETRY = drumGeometry(ROW_HEIGHT);
/** Wheel events stop moving the wheel after this long without one, ms. */
const WHEEL_IDLE_MS = 160;
/**
 * Rows on each side of the band that can show: the cylinder's front half,
 * ±90° (rows past it are parked out of sight).
 */
const VISIBLE_REACH = Math.ceil(((Math.PI / 2) * GEOMETRY.radius) / ROW_HEIGHT);
/**
 * Rows on each side of the band's centre that the band's copy can show:
 * the band is 34 px tall and a row 32, so the row under it and one each side.
 */
const BAND_REACH = 1;
/**
 * Rows mounted past those that can show, on each side: a drag mounts more as
 * it nears the edge, and every motion mounts its whole span before it plays.
 */
const WINDOW_BUFFER = 2;

const styles = stylex.create({
  column: {
    position: 'relative',
    flex: '1 1 0',
    minInlineSize: 0,
    blockSize: '100%',
    overflow: 'hidden',
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',
  },
  // Outside a WheelGroup: the picker's 216 px, centred in its container.
  standalone: {
    alignSelf: 'center',
    blockSize: wheelGeometry.pickerHeight,
  },
  /**
   * The dimmed copy: the rows on the cylinder, seen in the picker's
   * perspective, with the band cut out of it (the band's copy fills it).
   */
  drum: {
    position: 'absolute',
    inset: 0,
    perspective: wheelGeometry.perspective,
    clipPath: `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, 0 calc(50% - ${wheelGeometry.bandHeight} / 2), 100% calc(50% - ${wheelGeometry.bandHeight} / 2), 100% calc(50% + ${wheelGeometry.bandHeight} / 2), 0 calc(50% + ${wheelGeometry.bandHeight} / 2), 0 calc(50% - ${wheelGeometry.bandHeight} / 2))`,
    pointerEvents: 'none',
  },
  row: {
    position: 'absolute',
    insetInline: 0,
    insetBlockStart: `calc(50% - ${wheelGeometry.rowHalfHeight})`,
    blockSize: wheelGeometry.rowHeight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingInline: spacingVars['--spacing-2'],
    boxSizing: 'border-box',
    transformOrigin: `50% 50% ${wheelGeometry.rowOriginDepth}`,
    backfaceVisibility: 'hidden',
    opacity: wheelGeometry.outerOpacity,
    fontSize: typeScaleVars['--text-large-size'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    color: colorVars['--color-text-primary'],
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  rowDisabled: {
    color: colorVars['--color-text-disabled'],
  },
  // Both drawings carry their text as generated content, so the listbox's
  // options hold each label once: text searches, find-in-page and assistive
  // technology meet only the options.
  rowLabel: {
    '::before': {
      content: 'attr(data-label)',
    },
  },
  /** The options: every row, plain, stacked transparent over the band. */
  options: {
    position: 'absolute',
    insetInline: 0,
    insetBlockStart: `calc(50% - ${wheelGeometry.bandHeight} / 2)`,
    blockSize: wheelGeometry.bandHeight,
    opacity: 0,
    pointerEvents: 'none',
  },
  option: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  /** The band's copy: flat, opaque and magnified, clipped to the band. */
  bandCopy: {
    position: 'absolute',
    inset: 0,
    clipPath: `inset(calc(50% - ${wheelGeometry.bandHeight} / 2) 0)`,
    pointerEvents: 'none',
  },
  strip: {
    position: 'absolute',
    insetInline: 0,
    insetBlockStart: `calc(50% - ${wheelGeometry.rowHalfHeight})`,
  },
  stripRow: {
    position: 'absolute',
    insetInline: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    blockSize: wheelGeometry.rowHeight,
    paddingInline: spacingVars['--spacing-2'],
    boxSizing: 'border-box',
    fontSize: typeScaleVars['--text-large-size'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    color: colorVars['--color-text-primary'],
    whiteSpace: 'nowrap',
  },
  /** A strip row at its position along the wheel. */
  stripRowAt: (top: string) => ({insetBlockStart: top}),
  stripLabel: {
    display: 'inline-block',
    scale: wheelGeometry.bandMagnification,
    '::before': {
      content: 'attr(data-label)',
    },
  },
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
 * A turn onto `to` on the tap spin: `spin`'s duration and curve, or the
 * picker's tap spin (`picker.tapSpin.durationMs`) on `timing.curves.move` as
 * resolved under `column` when the turn starts.
 */
function turnCurve(
  column: Element | null,
  from: number,
  to: number,
  spin: WheelSpinOptions = {},
): WheelCurve {
  registerWheelTables();
  return spinCurve(
    from,
    to,
    spin.duration ?? picker.tapSpin.durationMs / 1000,
    spin.curve ?? resolveMotion(column, timing.curves.move),
  );
}

/** A transition's options: the player's, and whether a finger's release started it. */
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

/**
 * The position (an index along the drum, any integer when looping) of row
 * `row` nearest `offset`.
 */
function nearestPosition(
  row: number,
  offset: number,
  layout: WheelLayout,
): number {
  if (!layout.looping) {
    return row;
  }
  const cycles = Math.round(
    (offset / layout.rowHeight - row) / layout.rowCount,
  );
  return row + cycles * layout.rowCount;
}

/**
 * The mounted rows, as runs of positions along the drum (row units,
 * inclusive): the cylinder's rows, and the band copy's, fewer.
 */
interface RowWindow {
  readonly from: number;
  readonly to: number;
  readonly bandFrom: number;
  readonly bandTo: number;
}

/**
 * Positions `reach` past `lo` to `hi` on each side. A finite wheel's run
 * stops at its rows; a looping wheel's positions run past either end.
 */
function run(
  lo: number,
  hi: number,
  reach: number,
  layout: WheelLayout,
): [number, number] {
  const from = Math.floor(Math.min(lo, hi)) - reach;
  const to = Math.ceil(Math.max(lo, hi)) + reach;
  return layout.looping
    ? [from, to]
    : [Math.max(0, from), Math.min(layout.rowCount - 1, to)];
}

/**
 * The window around positions `lo` to `hi`: every row that can show while
 * the wheel is between them, on the cylinder and in the band, and a buffer.
 */
function windowAround(lo: number, hi: number, layout: WheelLayout): RowWindow {
  const [from, to] = run(lo, hi, VISIBLE_REACH + WINDOW_BUFFER, layout);
  const [bandFrom, bandTo] = run(lo, hi, BAND_REACH + WINDOW_BUFFER, layout);
  return {from, to, bandFrom, bandTo};
}

/** Whether `window` mounts every row that can show between `lo` and `hi`. */
function covers(
  window: RowWindow,
  lo: number,
  hi: number,
  layout: WheelLayout,
): boolean {
  const [from, to] = run(lo, hi, VISIBLE_REACH, layout);
  const [bandFrom, bandTo] = run(lo, hi, BAND_REACH, layout);
  return (
    window.from <= from &&
    window.to >= to &&
    window.bandFrom <= bandFrom &&
    window.bandTo >= bandTo
  );
}

/** The lowest and highest positions a curve passes (row units). */
function curveSpan(curve: WheelCurve, rowHeight: number): [number, number] {
  let lo = Math.min(curve.value(0), curve.to);
  let hi = Math.max(curve.value(0), curve.to);
  const steps = Math.max(8, Math.ceil(curve.duration * 60));
  for (let step = 1; step < steps; step++) {
    const value = curve.value((curve.duration * step) / steps);
    lo = Math.min(lo, value);
    hi = Math.max(hi, value);
  }
  return [lo / rowHeight, hi / rowHeight];
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
  isLooping = false,
  resolveRest,
  ref,
}: WheelProps) {
  const group = useWheelGroup();
  const columnRef = useRef<HTMLDivElement | null>(null);
  const drumRef = useRef<HTMLDivElement | null>(null);
  const bandCopyRef = useRef<HTMLDivElement | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const rowCount = options.length;
  // UIPickerView's looping table loops a list of any length: a minute column
  // every 15 or 30 minutes repeats around the whole cylinder (measured).
  const loops = isLooping && rowCount > 1;
  const layout = useMemo<WheelLayout>(
    () => ({rowHeight: ROW_HEIGHT, rowCount, looping: loops}),
    [rowCount, loops],
  );
  const [motion] = useState(() => new WheelMotion(layout));
  const selectedIndex = Math.max(
    0,
    options.findIndex(option => option.value === value),
  );
  // The mounted rows. `windowRef` runs ahead of the render: it is what the
  // next commit mounts.
  const [rowWindow, setRowWindow] = useState(() =>
    windowAround(selectedIndex, selectedIndex, layout),
  );
  const windowRef = useRef(rowWindow);
  const dragRef = useRef<DragState | null>(null);
  /** A finger landed on a moving wheel and stopped it. */
  const caughtRef = useRef(false);

  const latestRef = useRef({options, value, onChange, resolveRest, layout});
  useIsomorphicLayoutEffect(() => {
    latestRef.current = {options, value, onChange, resolveRest, layout};
  });

  // Mount every row that can show between positions `lo` and `hi`, at once
  // when a motion or a drag frame is about to show them.
  const showRows = useCallback(
    (lo: number, hi: number, {now = false}: {now?: boolean} = {}) => {
      const currentLayout = latestRef.current.layout;
      if (covers(windowRef.current, lo, hi, currentLayout)) {
        return;
      }
      const next = windowAround(lo, hi, currentLayout);
      windowRef.current = next;
      if (now) {
        // A motion's animations are baked per mounted row as it starts, and
        // a drag frame writes the mounted rows: both need the rows now.
        // eslint-disable-next-line @eslint-react/dom-no-flush-sync, @eslint-react/set-state-in-effect -- see above; never called from an effect with `now`
        flushSync(() => setRowWindow(next));
      } else {
        // eslint-disable-next-line @eslint-react/set-state-in-effect -- the window follows the offset, which only exists in the motion engine
        setRowWindow(next);
      }
    },
    [],
  );

  // At rest, the window settles back around the rest.
  const settleRows = useCallback((offset: number) => {
    const currentLayout = latestRef.current.layout;
    const position = offset / currentLayout.rowHeight;
    const next = windowAround(position, position, currentLayout);
    const current = windowRef.current;
    if (
      next.from !== current.from ||
      next.to !== current.to ||
      next.bandFrom !== current.bandFrom ||
      next.bandTo !== current.bandTo
    ) {
      windowRef.current = next;
      setRowWindow(next);
    }
  }, []);

  // Every transition the wheel starts: its rows mounted first, the window
  // settled after. Under reduced motion it lands without travel: the rows
  // cross-fade onto their row on the animator's Reduce Motion fade, whatever
  // the curve (design:reduced-motion DR2, DR4), and the target's rows mount
  // at the fade's midpoint. The momentum that continues a throw is not a
  // transition and plays as is.
  const play = useCallback(
    (
      curve: WheelCurve,
      {touchRelease = false, momentum = false, ...options}: MoveOptions = {},
    ) => {
      const onEnd: PlayOptions['onEnd'] = (outcome, end) => {
        options.onEnd?.(outcome, end);
        if (outcome === 'arrived' && !motion.isMoving()) {
          settleRows(end);
        }
      };
      const fadeTiming = momentum
        ? null
        : reducedMotionFade(columnRef.current, {touchRelease});
      if (fadeTiming != null) {
        const fade = [drumRef.current, bandCopyRef.current].filter(
          (element): element is HTMLDivElement => element != null,
        );
        const position = curve.to / ROW_HEIGHT;
        motion.crossFade(curve.to, {
          durationMs: fadeTiming.duration,
          easing: fadeTiming.easing,
          fade,
          onMidpoint: () => showRows(position, position, {now: true}),
          onEnd,
        });
        return;
      }
      const [lo, hi] = curveSpan(curve, ROW_HEIGHT);
      showRows(lo, hi, {now: true});
      motion.play(curve, {...options, onEnd});
    },
    [motion, showRows, settleRows],
  );

  // The wheel came to rest at `offset`: commit, or turn on to the row the
  // rest rule names first.
  const arrive = useCallback(
    (offset: number) => {
      const current = latestRef.current;
      const position = nearestIndex(offset, current.layout);
      const row = wrapIndex(position, current.options.length);
      const committed = current.options.findIndex(
        option => option.value === current.value,
      );
      // Resting on the committed row is not a stop to correct
      // (component:DateInput FR13): a committed value outside the bounds stays
      // until a person moves the wheel off it, as in the scrolling column.
      const resolved =
        row === committed
          ? row
          : current.resolveRest
            ? current.resolveRest(row)
            : nearestEnabledIndex(current.options, row, Math.max(0, committed));
      if (resolved !== row && current.options[resolved] != null) {
        const target = position + (resolved - row);
        play(turnCurve(columnRef.current, offset, target * ROW_HEIGHT), {
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
    [play],
  );

  const onEnd = useCallback(
    (outcome: 'arrived' | 'stopped', offset: number) => {
      if (outcome === 'arrived') {
        arrive(offset);
      }
    },
    [arrive],
  );

  // Hand the mounted rows to the motion engine whenever they are rendered
  // anew.
  useIsomorphicLayoutEffect(() => {
    motion.setLayout(layout);
    const rows = new Map<number, HTMLElement>();
    for (const child of drumRef.current?.children ?? []) {
      if (child instanceof HTMLElement) {
        rows.set(Number(child.dataset.position ?? child.dataset.index), child);
      }
    }
    motion.attach(rows, stripRef.current);
  }, [motion, layout, options, rowWindow]);

  useEffect(() => () => motion.dispose(), [motion]);

  // Park the committed row under the band when the wheel is shown or the
  // value changes from outside (the calendar moved to another month). Never
  // while a finger or a motion owns the wheel.
  useIsomorphicLayoutEffect(() => {
    if (!isActive || dragRef.current != null || motion.isMoving()) {
      return;
    }
    const position = nearestPosition(selectedIndex, motion.offset(), layout);
    showRows(position, position);
    if (Math.abs(motion.offset() - position * ROW_HEIGHT) > 0.01) {
      motion.setOffset(position * ROW_HEIGHT);
    }
  }, [isActive, selectedIndex, layout, motion, showRows]);

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

  // Every column draws towards one vanishing point, the group's centre, and
  // the band's magnified copy sits that much further from it.
  useIsomorphicLayoutEffect(() => {
    const column = columnRef.current;
    const drum = drumRef.current;
    const bandCopy = bandCopyRef.current;
    if (column == null || drum == null || bandCopy == null) {
      return;
    }
    const place = () => {
      const columnBox = column.getBoundingClientRect();
      const groupBox =
        group?.groupRef.current?.getBoundingClientRect() ?? columnBox;
      const centre = groupBox.left + groupBox.width / 2;
      drum.style.perspectiveOrigin = `${centre - columnBox.left}px 50%`;
      const shift =
        (columnBox.left + columnBox.width / 2 - centre) *
        (picker.geometry.bandMagnification - 1);
      bandCopy.style.translate = `${shift}px 0`;
    };
    // The shared observer measures once at once, then on every resize.
    const unobserveColumn = observeResize(column, place);
    const groupElement = group?.groupRef.current;
    const unobserveGroup =
      groupElement != null ? observeResize(groupElement, place) : null;
    return () => {
      unobserveColumn();
      unobserveGroup?.();
    };
  }, [group, isActive]);

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
      play(plan.curve, {
        ticks: true,
        onEnd,
        touchRelease: true,
        momentum: plan.kind === 'coast' || plan.kind === 'edge',
      });
    },
    [motion, onEnd, play],
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
          const offset = dragOffset(
            dragRef.current.start - recognizer.translation().y,
            currentLayout,
          );
          showRows(offset / ROW_HEIGHT, offset / ROW_HEIGHT, {now: true});
          motion.setOffset(offset, {ticks: true});
          break;
        }
        case 'changed': {
          const drag = dragRef.current;
          if (drag == null) {
            break;
          }
          const offset = dragOffset(
            drag.start - recognizer.translation().y,
            currentLayout,
          );
          showRows(offset / ROW_HEIGHT, offset / ROW_HEIGHT, {now: true});
          motion.setOffset(offset, {ticks: true});
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
      // The tapped copy itself: on a short loop a copy of the row under the
      // band can sit two rows away, and the wheel turns onto it (UIKit).
      const target = rowAtPoint(
        y - (box.top + box.height / 2),
        offset,
        currentLayout,
        GEOMETRY,
      );
      if (target == null || target === nearestIndex(offset, currentLayout)) {
        return;
      }
      play(turnCurve(columnRef.current, offset, target * ROW_HEIGHT), {
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
      const next = Math.min(max, Math.max(min, shown + delta));
      showRows(next / ROW_HEIGHT, next / ROW_HEIGHT, {now: true});
      motion.setOffset(next, {ticks: true});
      window.clearTimeout(idle);
      idle = window.setTimeout(() => {
        const offset = motion.offset();
        const target =
          nearestIndex(offset, latestRef.current.layout) * ROW_HEIGHT;
        play(snapCurve(offset, target, 1), {onEnd});
      }, WHEEL_IDLE_MS);
    };
    column.addEventListener('wheel', onWheel, {passive: false});
    return () => {
      column.removeEventListener('wheel', onWheel);
      window.clearTimeout(idle);
    };
  }, [isActive, motion, onEnd, play, showRows]);

  const spinTo = useCallback(
    async (index: number, spin: WheelSpinOptions = {}): Promise<boolean> =>
      new Promise(resolve => {
        const offset = motion.offset();
        const target = nearestPosition(index, offset, latestRef.current.layout);
        play(turnCurve(columnRef.current, offset, target * ROW_HEIGHT, spin), {
          onEnd: (outcome, end) => {
            if (outcome === 'arrived') {
              arrive(end);
            }
            resolve(outcome === 'arrived');
          },
        });
      }),
    [motion, arrive, play],
  );

  useImperativeHandle(ref, () => ({spinTo}), [spinTo]);

  // A key commits the row at `position` at once and turns the wheel there
  // from `offset`.
  const turnToPosition = useCallback(
    (position: number, offset: number) => {
      const current = latestRef.current;
      const option =
        current.options[
          current.layout.looping
            ? wrapIndex(position, current.options.length)
            : position
        ];
      if (option.value !== current.value) {
        current.onChange(option.value);
      }
      play(turnCurve(columnRef.current, offset, position * ROW_HEIGHT));
    },
    [play],
  );

  // The same onto `row`'s copy nearest where the wheel was heading.
  const turnTo = useCallback(
    (row: number, heading: number, offset: number) => {
      turnToPosition(
        nearestPosition(row, heading, latestRef.current.layout),
        offset,
      );
    },
    [turnToPosition],
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
      const headingPosition = nearestIndex(heading, current.layout);
      const from = wrapIndex(headingPosition, count);
      const looping = Boolean(current.layout.looping);
      const isEnabled = (index: number) => {
        const option =
          current.options[looping ? wrapIndex(index, count) : index];
        return option != null && !option.isDisabled;
      };
      const step = Math.sign(delta);
      let next = from + delta;
      if (!looping) {
        next = Math.min(count - 1, Math.max(0, next));
      }
      // The first enabled row from the target onwards; failing that (the
      // target is past the bounds), the enabled row nearest it on the way
      // back, short of the row it started from.
      let found: number | null = null;
      for (let index = next, tries = 0; tries < count; tries++, index += step) {
        if (!looping && (index < 0 || index >= count)) {
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
      // The step's own direction, even on a loop shorter than the cylinder,
      // where the same row also sits the other way round. A key never turns a
      // whole revolution: a target that folds back onto the row the wheel is
      // heading to stays put, and any other travels less than one turn.
      let travel = found - from;
      if (looping) {
        const ahead = (((travel * step) % count) + count) % count;
        if (ahead === 0) {
          return;
        }
        travel = ahead * step;
      }
      turnToPosition(headingPosition + travel, offset);
    },
    [motion, turnToPosition],
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
      const heading = motion.target();
      const offset = motion.isMoving() ? motion.stop() : motion.offset();
      turnTo(row, heading, offset);
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
      const target = nearestPosition(row, offset, current.layout);
      play(turnCurve(columnRef.current, offset, target * ROW_HEIGHT));
    },
    [motion, play],
  );

  const {listboxProps, optionProps} = useWheelListbox({
    label,
    options,
    value,
    // The committed row: a value set from outside shows in the same render.
    activeIndex: selectedIndex,
    stepBy: moveBy,
    toEnd: moveToEnd,
    activate: activateRow,
  });

  // The mounted rows: each position of the window on the drum (on a looping
  // wheel each copy has its own, so a short list repeats around the
  // cylinder), and each position of the band copy's run on its strip.
  const positions: number[] = [];
  for (let position = rowWindow.from; position <= rowWindow.to; position++) {
    positions.push(position);
  }
  const bandPositions: number[] = [];
  for (
    let position = rowWindow.bandFrom;
    position <= rowWindow.bandTo;
    position++
  ) {
    bandPositions.push(position);
  }
  const rowIndexAt = (position: number) =>
    loops ? wrapIndex(position, rowCount) : position;
  const drumRows = positions.filter(
    position => loops || (position >= 0 && position < rowCount),
  );

  return (
    <div
      ref={columnRef}
      {...listboxProps}
      data-wheel=""
      data-wheel-band={group == null ? '' : undefined}
      {...stylex.props(
        styles.column,
        group == null && styles.standalone,
        // On its own, the column draws the band with its `::before`.
        group == null && wheelGroupStyles.band,
        focusOutlineStyles.focusVisible,
      )}>
      <div role="presentation" {...stylex.props(styles.options)}>
        {options.map((option, index) => (
          <div
            key={option.value}
            {...optionProps(option, index)}
            {...stylex.props(styles.option)}>
            {option.label}
          </div>
        ))}
      </div>
      <div
        ref={drumRef}
        aria-hidden="true"
        data-wheel-drum=""
        {...stylex.props(styles.drum)}>
        {drumRows.map(position => {
          const index = rowIndexAt(position);
          const option = options[index];
          return (
            <div
              key={loops ? position : option.value}
              data-index={index}
              data-position={loops ? position : undefined}
              data-label={option.label}
              {...stylex.props(
                styles.row,
                styles.rowLabel,
                option.isDisabled && styles.rowDisabled,
              )}
            />
          );
        })}
      </div>
      <div
        ref={bandCopyRef}
        aria-hidden="true"
        {...stylex.props(styles.bandCopy)}>
        <div ref={stripRef} data-wheel-strip="" {...stylex.props(styles.strip)}>
          {bandPositions.map(position => {
            const option = options[rowIndexAt(position)];
            if (option == null) {
              return null;
            }
            return (
              <div
                key={position}
                {...stylex.props(
                  styles.stripRow,
                  styles.stripRowAt(`${position * ROW_HEIGHT}px`),
                  option.isDisabled && styles.rowDisabled,
                )}>
                <span
                  data-label={option.label}
                  {...stylex.props(styles.stripLabel)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

PickerWheel.displayName = 'PickerWheel';

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
