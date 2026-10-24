// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file WheelGroup.tsx
 * @input Wheel columns as children
 * @output Exports WheelGroup — UIPickerView's frame around picker columns: one
 *   selection band across every column, the picker's height, and the one
 *   vanishing point all columns are drawn towards
 * @position Internal component; the frame of picker Wheels drawn side by side
 *
 * UIPickerView draws one band under all its columns (inset from the picker's
 * sides) and centres every column's table on the picker, so the dimmed rows
 * of a side column lean towards the picker's centre, not their own. A Wheel
 * inside a WheelGroup reads the group's box for that centre; a Wheel on its
 * own draws its own band and uses its own centre.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/DateInput/Wheel.tsx
 * - /packages/core/src/DateInput/Wheel.test.tsx
 */

import {
  createContext,
  use,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, radiusVars} from '../theme/tokens.stylex';
import {wheelGeometry} from './tokens.stylex';

const styles = stylex.create({
  group: {
    position: 'relative',
    display: 'flex',
    inlineSize: '100%',
    minInlineSize: 0,
    blockSize: wheelGeometry.pickerHeight,
  },
  /**
   * UIPickerView's band: one capsule across every column, inset from the
   * picker's sides, behind the rows. Its fill is the theme's neutral.
   */
  band: {
    position: 'absolute',
    insetInline: wheelGeometry.bandInset,
    insetBlockStart: `calc(50% - ${wheelGeometry.bandHeight} / 2)`,
    blockSize: wheelGeometry.bandHeight,
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-neutral'],
    pointerEvents: 'none',
  },
});

interface WheelGroupContextValue {
  /** The group's element: its centre is every column's vanishing point. */
  readonly groupRef: RefObject<HTMLDivElement | null>;
}

const WheelGroupContext = createContext<WheelGroupContextValue | null>(null);
WheelGroupContext.displayName = 'WheelGroupContext';

/** The enclosing WheelGroup, if any. */
export function useWheelGroup(): WheelGroupContextValue | null {
  return use(WheelGroupContext);
}

export interface WheelGroupProps {
  /** The Wheel columns, side by side. */
  children: ReactNode;
}

/**
 * Picker columns in one frame, as UIPickerView draws them.
 *
 * @example
 * ```
 * <WheelGroup>
 *   <Wheel label="Hour" options={hours} value={hour} onChange={setHour} />
 *   <Wheel label="Minute" options={minutes} value={minute} onChange={setMinute} looping />
 * </WheelGroup>
 * ```
 */
export function WheelGroup({children}: WheelGroupProps) {
  const groupRef = useRef<HTMLDivElement | null>(null);
  const value = useMemo(() => ({groupRef}), []);
  return (
    <WheelGroupContext value={value}>
      <div ref={groupRef} {...stylex.props(styles.group)}>
        <div
          aria-hidden="true"
          data-wheel-band=""
          {...stylex.props(styles.band)}
        />
        {children}
      </div>
    </WheelGroupContext>
  );
}

WheelGroup.displayName = 'WheelGroup';

export {styles as wheelGroupStyles};
