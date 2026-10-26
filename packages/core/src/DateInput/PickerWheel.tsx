// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file PickerWheel.tsx
 * @input Wheel's props (wheelOptions.ts): option list, selected value,
 *   change callback; optionally looping, a rest rule, and a ref for
 *   programmatic turns
 * @output Exports PickerWheel — one UIPickerView column
 * @position Internal component; the Wheel under a finger (Wheel.tsx picks
 *   it and loads it lazily), drawn standalone or inside a WheelGroup
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
 * - A tap on a row turns the wheel onto it on the tap spin (0.3 s, the
 *   theme's `picker.tapSpin.durationMs` on `timing.curves.move`). A
 *   tap on the band's row does nothing. An end bounces on the theme's
 *   `scroll.bounce`. Each role is resolved when its motion starts.
 * - The value commits when the wheel comes to rest, as UIPickerView's
 *   didSelectRow does. A row `resolveRest` moves away from (by default, a
 *   disabled one: outside the bounds) is followed by a turn onto the row it
 *   names, which then commits.
 * - Each row reaching the band ticks a selection haptic where the browser
 *   can vibrate (not iOS Safari, which cannot play haptics from script).
 * - Under reduced motion (design:reduced-motion) every transition the wheel
 *   starts (a release's coast, snap or bounce, the turn on from a disabled
 *   row, a tap, a key, a click, `spinTo`, a scroll wheel's snap) lands
 *   without travel: the rows cross-fade onto their row, opacity only, on the
 *   animator's Reduce Motion fade (`reducedMotionFade`, DR2: this column
 *   draws under a finger). The drag itself follows the finger.
 *
 * The rows are drawn twice, as UIKit draws them: dimmed on a cylinder seen
 * in perspective above and below the band (wheelDrum.ts), and flat and
 * magnified inside it.
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

import {
  useCallback,
  useEffect,
  useId,
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
import {rubberBandInverse} from '../motion/rubberBand';
import {resolveMotion} from '../motion/resolveMotion';
import {picker, registerPickerTable} from '../motion/uikit/picker';
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
import {useOwnScrollGesture} from './useOwnScrollGesture';
import {PARKED_ANGLE, drumGeometry, rowAtPoint} from './wheelDrum';
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
  // The band copy's text is generated content, so the listbox holds each
  // label once: text searches, find-in-page and assistive technology meet
  // only the options.
  stripLabel: {
    display: 'inline-block',
    scale: wheelGeometry.bandMagnification,
    '::before': {
      content: 'attr(data-label)',
    },
  },
});

/**
 * The motion tables the wheel resolves theme roles from: the picker's tap
 * spin, the timing curve and the scroll bounce. Nothing registers on import
 * (motion/roles.ts) and each register is idempotent, so the wheel calls this
 * right before it resolves a role.
 */
function registerWheelTables(): void {
  registerPickerTable();
  registerTimingTable();
  registerScrollTable();
}

/**
 * A turn onto `to` on the tap spin: `spin`'s duration and curve, or the
 * theme's `picker.tapSpin.durationMs` and `timing.curves.move` under
 * `column`, resolved as the turn starts.
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
    spin.duration ?? resolveMotion(column, picker.tapSpin, 'durationMs') / 1000,
    spin.curve ?? resolveMotion(column, timing.curves.move),
  );
}

/** A transition's options: the player's, and whether a finger's release started it. */
interface MoveOptions extends PlayOptions {
  /** Started by a touch drag's release (design:reduced-motion DR3). */
  touchRelease?: boolean;
}

/** Whether a looping wheel of `rowCount` rows can hide its seam. */
function canLoop(rowCount: number): boolean {
  return (rowCount * ROW_HEIGHT) / 2 > PARKED_ANGLE * GEOMETRY.radius;
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
  const id = useId();
  const group = useWheelGroup();
  const columnRef = useRef<HTMLDivElement | null>(null);
  const drumRef = useRef<HTMLDivElement | null>(null);
  const bandCopyRef = useRef<HTMLDivElement | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const rowCount = options.length;
  const loops = isLooping && canLoop(rowCount);
  const layout = useMemo<WheelLayout>(
    () => ({rowHeight: ROW_HEIGHT, rowCount, looping: loops}),
    [rowCount, loops],
  );
  const [motion] = useState(() => new WheelMotion(layout));
  const selectedIndex = Math.max(
    0,
    options.findIndex(option => option.value === value),
  );
  const dragRef = useRef<DragState | null>(null);
  /** A finger landed on a moving wheel and stopped it. */
  const caughtRef = useRef(false);

  const latestRef = useRef({options, value, onChange, resolveRest, layout});
  useIsomorphicLayoutEffect(() => {
    latestRef.current = {options, value, onChange, resolveRest, layout};
  });

  // Every transition the wheel starts. Under reduced motion it lands without
  // travel: the rows cross-fade onto their row on the animator's Reduce
  // Motion fade, whatever the curve (design:reduced-motion DR2, DR4).
  const move = useCallback(
    (
      curve: WheelCurve,
      {touchRelease = false, ...options}: MoveOptions = {},
    ) => {
      const fadeTiming = reducedMotionFade(columnRef.current, {touchRelease});
      if (fadeTiming == null) {
        motion.play(curve, options);
        return;
      }
      const fade = [drumRef.current, bandCopyRef.current].filter(
        (element): element is HTMLDivElement => element != null,
      );
      motion.crossFade(curve.to, {
        durationMs: fadeTiming.duration,
        easing: fadeTiming.easing,
        fade,
        onEnd: options.onEnd,
      });
    },
    [motion],
  );

  // The wheel came to rest at `offset`: commit, or turn on to the row the
  // rest rule names first.
  const arrive = useCallback(
    (offset: number) => {
      const current = latestRef.current;
      const position = nearestIndex(offset, current.layout);
      const row = wrapIndex(position, current.options.length);
      const committed = Math.max(
        0,
        current.options.findIndex(option => option.value === current.value),
      );
      const resolved = current.resolveRest
        ? current.resolveRest(row)
        : nearestEnabledIndex(current.options, row, committed);
      if (resolved !== row && current.options[resolved] != null) {
        const target = position + (resolved - row);
        move(turnCurve(columnRef.current, offset, target * ROW_HEIGHT), {
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
    const drum = drumRef.current;
    const rows =
      drum == null
        ? []
        : Array.from(drum.children).filter(
            (child): child is HTMLElement => child instanceof HTMLElement,
          );
    motion.attach(rows, stripRef.current);
  }, [motion, layout, options]);

  useEffect(() => () => motion.dispose(), [motion]);

  // Park the committed row under the band when the wheel is shown or the
  // value changes from outside (the calendar moved to another month). Never
  // while a finger or a motion owns the wheel.
  useIsomorphicLayoutEffect(() => {
    if (!isActive || dragRef.current != null || motion.isMoving()) {
      return;
    }
    const position = nearestPosition(selectedIndex, motion.offset(), layout);
    if (Math.abs(motion.offset() - position * ROW_HEIGHT) > 0.01) {
      motion.setOffset(position * ROW_HEIGHT);
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
      move(plan.curve, {ticks: true, onEnd, touchRelease: true});
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
        preventsTextSelection: true,
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
        GEOMETRY,
      );
      const restingRow = wrapIndex(
        nearestIndex(offset, currentLayout),
        currentLayout.rowCount,
      );
      if (row == null || row === restingRow) {
        return;
      }
      const target = nearestPosition(row, offset, currentLayout);
      move(turnCurve(columnRef.current, offset, target * ROW_HEIGHT), {
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

  const spinTo = useCallback(
    async (index: number, spin: WheelSpinOptions = {}): Promise<boolean> =>
      new Promise(resolve => {
        const offset = motion.offset();
        const target = nearestPosition(index, offset, latestRef.current.layout);
        move(turnCurve(columnRef.current, offset, target * ROW_HEIGHT, spin), {
          onEnd: (outcome, end) => {
            if (outcome === 'arrived') {
              arrive(end);
            }
            resolve(outcome === 'arrived');
          },
        });
      }),
    [motion, move, arrive],
  );

  useImperativeHandle(ref, () => ({spinTo}), [spinTo]);

  // A key commits `row` at once and turns the wheel there from `offset`,
  // onto the copy of the row nearest where it was heading.
  const turnTo = useCallback(
    (row: number, heading: number, offset: number) => {
      const current = latestRef.current;
      const option = current.options[row];
      const target = nearestPosition(row, heading, current.layout);
      if (option.value !== current.value) {
        current.onChange(option.value);
      }
      move(turnCurve(columnRef.current, offset, target * ROW_HEIGHT));
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
      const from = wrapIndex(nearestIndex(heading, current.layout), count);
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
      turnTo(looping ? wrapIndex(found, count) : found, heading, offset);
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
      move(turnCurve(columnRef.current, offset, target * ROW_HEIGHT));
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

  const stripCopies = loops ? 3 : 1;

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
      data-wheel-band={group == null ? '' : undefined}
      {...stylex.props(
        styles.column,
        group == null && styles.standalone,
        // On its own, the column draws the band with its `::before`.
        group == null && wheelGroupStyles.band,
        focusOutlineStyles.focusVisible,
      )}>
      <div ref={drumRef} {...stylex.props(styles.drum)}>
        {options.map((option, index) => (
          <div
            key={option.value}
            id={`${id}-${option.value}`}
            role="option"
            aria-selected={option.value === value}
            aria-disabled={option.isDisabled || undefined}
            onClick={() => activateRow(index)}
            {...stylex.props(
              styles.row,
              option.isDisabled && styles.rowDisabled,
            )}>
            {option.label}
          </div>
        ))}
      </div>
      <div
        ref={bandCopyRef}
        aria-hidden="true"
        {...stylex.props(styles.bandCopy)}>
        <div ref={stripRef} data-wheel-strip="" {...stylex.props(styles.strip)}>
          {Array.from({length: stripCopies}, (_, copy) =>
            options.map(option => (
              <div
                key={`${copy}-${option.value}`}
                {...stylex.props(
                  styles.stripRow,
                  option.isDisabled && styles.rowDisabled,
                )}>
                <span
                  data-label={option.label}
                  {...stylex.props(styles.stripLabel)}
                />
              </div>
            )),
          )}
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
