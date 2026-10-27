// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file PickerWheel.tsx
 * @input Wheel's props (wheelOptions.ts): option list, selected value,
 *   change callback; optionally looping, a rest rule, a ref for
 *   programmatic turns, and its place in a WheelGroup (wheelColumns.ts)
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
 * - A scroll wheel turns the rows by its delta and snaps onto the nearest
 *   row once it stops; a ctrl-wheel, as a trackpad pinch arrives, is left to
 *   the page's zoom (`spec:AST-094` FR43).
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
 * magnified inside it, each label about its own centre, so the band's row
 * stays in line with its column. In a WheelGroup every column is drawn
 * towards the group's centre, and a column given its place (`column`,
 * wheelColumns.ts) takes the part of the group nearest its labels and sets
 * them where UIDatePicker sets its own: close together around the centre.
 *
 * Both drawings mount only a window of rows, as UIPickerView lays out only
 * the cells it shows, so showing a wheel costs the same for 12 rows or 200.
 * The rows are kept imperatively (wheelRows.ts), never in React state: a
 * drag moves the window by recycling rows with style and attribute writes,
 * so no drag frame renders the column (`spec:AST-094` FR9); a motion mounts
 * every row it will show before it plays, and the window settles back
 * around the rest. The listbox's options are separate, plain and complete:
 * one per row, stacked transparent over the band, so assistive technology
 * meets every option and its cursor sits on the band.
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
 * - /packages/core/src/DateInput/wheelColumns.ts (the places it applies)
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
import * as stylex from '@stylexjs/stylex';
import {PanGestureRecognizer} from '../gestures/PanGestureRecognizer';
import {TapGestureRecognizer} from '../gestures/TapGestureRecognizer';
import {useGestureRecognizer} from '../gestures/useGestureRecognizer';
import {observeResize} from '../utils/sharedResizeObserver';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {isRtlElement} from '../hooks/isRtlElement';
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
import {WheelRows, type WheelRange, type WheelRowClasses} from './wheelRows';
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
import type {WheelColumn} from './wheelColumns';
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
  /** A placed column's part of its group (wheelColumns.ts). */
  columnSpan: (basis: string) => ({flex: `0 0 ${basis}`}),
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
  // A placed column's labels: an edge, or their centre, at its place; the
  // drum and the band's copy move to put that point there. An aligned edge
  // keeps the rows' padding from the row's, so the band's magnified label
  // stays inside its clip.
  alignStart: {justifyContent: 'flex-start'},
  alignCenter: {justifyContent: 'center'},
  alignEnd: {justifyContent: 'flex-end'},
  // Both drawings carry their text as generated content, so the listbox's
  // options hold each label once: text searches, find-in-page and assistive
  // technology meet only the options.
  rowLabel: {
    '::before': {
      content: 'attr(data-label)',
    },
  },
  /** The options: every row, plain, stacked transparent over the band. */
  option: {
    position: 'absolute',
    insetInline: 0,
    insetBlockStart: `calc(50% - ${wheelGeometry.bandHeight} / 2)`,
    blockSize: wheelGeometry.bandHeight,
    opacity: 0,
    pointerEvents: 'none',
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
  stripLabel: {
    '::before': {
      content: 'attr(data-label)',
      display: 'inline-block',
      scale: wheelGeometry.bandMagnification,
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
  column: place,
}: WheelProps) {
  const group = useWheelGroup();
  // A column takes its place only inside a WheelGroup.
  const placed = group != null ? place : undefined;
  // The rows' class names (wheelRows.ts draws the rows): a placed column's
  // labels keep their edge or their centre at its place.
  const align = placed?.align;
  const rowClasses = useMemo<WheelRowClasses>(() => {
    const alignment = align != null ? alignStyle(align) : null;
    return {
      row: stylex.props(styles.row, styles.rowLabel, alignment).className ?? '',
      rowDisabled:
        stylex.props(styles.row, styles.rowLabel, alignment, styles.rowDisabled)
          .className ?? '',
      stripRow:
        stylex.props(styles.stripRow, styles.stripLabel, alignment).className ??
        '',
      stripRowDisabled:
        stylex.props(
          styles.stripRow,
          styles.stripLabel,
          alignment,
          styles.rowDisabled,
        ).className ?? '',
    };
  }, [align]);
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
  // The mounted rows: kept and recycled imperatively, never React state.
  const rowsRef = useRef<WheelRows | null>(null);
  const dragRef = useRef<DragState | null>(null);
  /** A finger landed on a moving wheel and stopped it. */
  const caughtRef = useRef(false);

  const latestRef = useRef({options, value, onChange, resolveRest, layout});
  useIsomorphicLayoutEffect(() => {
    latestRef.current = {options, value, onChange, resolveRest, layout};
  });

  // Mount every row that can show while the wheel is in `ranges` (row
  // units), before a drag frame or a motion shows them: recycled rows, no
  // render.
  const showRanges = useCallback(
    (ranges: ReadonlyArray<WheelRange>) => {
      const rows = rowsRef.current;
      if (rows?.show(ranges) === true) {
        motion.attach(rows.drumRows(), stripRef.current);
      }
    },
    [motion],
  );
  const showRows = useCallback(
    (lo: number, hi: number) => showRanges([[lo, hi]]),
    [showRanges],
  );

  // At rest, the window settles back around the rest.
  const settleRows = useCallback(
    (offset: number) => {
      const rows = rowsRef.current;
      if (rows?.settle(offset / latestRef.current.layout.rowHeight) === true) {
        motion.attach(rows.drumRows(), stripRef.current);
      }
    },
    [motion],
  );

  // Every transition the wheel starts: its rows mounted first, the window
  // settled after. Under reduced motion it lands without travel: the rows
  // cross-fade onto their row on the animator's Reduce Motion fade, whatever
  // the curve (design:reduced-motion DR2, DR4), the rows around where it
  // lands mounted with the ones around where it starts, before the fade, so
  // the landing plays on the compositor. The momentum that continues a throw
  // is not a transition and plays as is.
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
        const from = motion.stop() / ROW_HEIGHT;
        const to = curve.to / ROW_HEIGHT;
        showRanges([
          [from, from],
          [to, to],
        ]);
        motion.crossFade(curve.to, {
          durationMs: fadeTiming.duration,
          easing: fadeTiming.easing,
          fade,
          onEnd,
        });
        return;
      }
      const [lo, hi] = curveSpan(curve, ROW_HEIGHT);
      showRows(lo, hi);
      motion.play(curve, {...options, onEnd});
    },
    [motion, showRows, showRanges, settleRows],
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

  // The rows: created with the drum and the strip, drawn again when the
  // options, the layout or their classes change, and handed to the motion
  // engine. A new wheel mounts the window around its committed row.
  useIsomorphicLayoutEffect(() => {
    const drum = drumRef.current;
    const strip = stripRef.current;
    if (drum == null || strip == null) {
      return;
    }
    let rows = rowsRef.current;
    if (rows == null || !rows.owns(drum, strip)) {
      rows = new WheelRows(drum, strip, GEOMETRY);
      rowsRef.current = rows;
    }
    motion.setLayout(layout);
    rows.update(options, layout, rowClasses);
    if (rows.isEmpty()) {
      const latest = latestRef.current;
      const committed = Math.max(
        0,
        latest.options.findIndex(option => option.value === latest.value),
      );
      rows.settle(nearestPosition(committed, motion.target(), layout));
    }
    motion.attach(rows.drumRows(), strip);
  }, [motion, layout, options, rowClasses]);

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

  // Every column draws towards one vanishing point, the group's centre. A
  // placed column moves its drum and the band's copy so its labels' edge or
  // centre sits at its place; the band's copy magnifies each label about its
  // own centre, so the band's row stays in line with its column.
  useIsomorphicLayoutEffect(() => {
    const column = columnRef.current;
    const drum = drumRef.current;
    const bandCopy = bandCopyRef.current;
    if (column == null || drum == null || bandCopy == null) {
      return;
    }
    const layOut = () => {
      const columnBox = column.getBoundingClientRect();
      const groupBox =
        group?.groupRef.current?.getBoundingClientRect() ?? columnBox;
      const centre = groupBox.left + groupBox.width / 2;
      const shift =
        placed != null
          ? placeShift(
              placed,
              columnBox,
              centre,
              isRtlElement(column),
              alignInset(stripRef.current, placed.align),
            )
          : 0;
      const translate = placed != null ? `${shift}px 0` : '';
      drum.style.translate = translate;
      bandCopy.style.translate = translate;
      drum.style.perspectiveOrigin = `${centre - columnBox.left - shift}px 50%`;
    };
    // The shared observer measures once at once, then on every resize.
    const unobserveColumn = observeResize(column, layOut);
    const groupElement = group?.groupRef.current;
    const unobserveGroup =
      groupElement != null ? observeResize(groupElement, layOut) : null;
    return () => {
      unobserveColumn();
      unobserveGroup?.();
    };
  }, [group, isActive, placed]);

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
          showRows(offset / ROW_HEIGHT, offset / ROW_HEIGHT);
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
          showRows(offset / ROW_HEIGHT, offset / ROW_HEIGHT);
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
      // A ctrl-wheel is a pinch (a trackpad pinch arrives as one): it zooms
      // the page and never turns the wheel (`spec:AST-094` FR43).
      if (event.ctrlKey) {
        return;
      }
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
      showRows(next / ROW_HEIGHT, next / ROW_HEIGHT);
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

  return (
    <div
      ref={columnRef}
      {...listboxProps}
      data-wheel=""
      data-wheel-band={group == null ? '' : undefined}
      {...stylex.props(
        styles.column,
        placed != null && styles.columnSpan(spanBasis(placed.span)),
        group == null && styles.standalone,
        // On its own, the column draws the band with its `::before`.
        group == null && wheelGroupStyles.band,
        focusOutlineStyles.focusVisible,
      )}>
      {options.map((option, index) => (
        <div
          key={option.value}
          {...optionProps(option, index)}
          {...stylex.props(styles.option)}>
          {option.label}
        </div>
      ))}
      {/* The rows: drawn and recycled by wheelRows.ts, never by React. */}
      <div
        ref={drumRef}
        aria-hidden="true"
        data-wheel-drum=""
        {...stylex.props(styles.drum)}
      />
      <div
        ref={bandCopyRef}
        aria-hidden="true"
        {...stylex.props(styles.bandCopy)}>
        <div
          ref={stripRef}
          data-wheel-strip=""
          {...stylex.props(styles.strip)}
        />
      </div>
    </div>
  );
}

PickerWheel.displayName = 'PickerWheel';

/** wheelColumns.ts's pt, at this wheel's rows. */
const PLACE_SCALE = ROW_HEIGHT / picker.geometry.rowHeight;

/** A placed column's flex basis: its span of the group (wheelColumns.ts). */
function spanBasis(span: WheelColumn['span']): string {
  const [from, to] = span.map(edge =>
    edge == null ? null : edge * PLACE_SCALE,
  );
  if (from == null && to == null) {
    return '100%';
  }
  if (from == null) {
    return `calc(50% + ${to}px)`;
  }
  if (to == null) {
    return `calc(50% - ${from}px)`;
  }
  return `${to - from}px`;
}

function alignStyle(align: WheelColumn['align']) {
  if (align === 'start') {
    return styles.alignStart;
  }
  return align === 'end' ? styles.alignEnd : styles.alignCenter;
}

/**
 * An aligned label's distance from its row's edge: the rows' inline padding
 * on that side, read from a band row (0 for centred labels).
 */
function alignInset(
  strip: HTMLElement | null,
  align: WheelColumn['align'],
): number {
  const row = strip?.firstElementChild;
  if (align === 'center' || row == null) {
    return 0;
  }
  const style = getComputedStyle(row);
  const padding =
    align === 'start' ? style.paddingInlineStart : style.paddingInlineEnd;
  return Number.parseFloat(padding) || 0;
}

/**
 * How far a placed column moves its labels (px, physical): from where its
 * rows put them (`inset` inside an edge of the column, or its centre) to its
 * place, mirrored right to left.
 */
function placeShift(
  place: WheelColumn,
  columnBox: DOMRect,
  centre: number,
  rightToLeft: boolean,
  inset: number,
): number {
  const target = centre + (rightToLeft ? -1 : 1) * place.offset * PLACE_SCALE;
  let from = columnBox.left + columnBox.width / 2;
  if (place.align !== 'center') {
    const atLeft = (place.align === 'start') !== rightToLeft;
    from = atLeft ? columnBox.left + inset : columnBox.right - inset;
  }
  return target - from;
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
