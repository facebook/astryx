// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file WheelGroup.tsx
 * @input Wheel columns as children
 * @output Exports WheelGroup — UIPickerView's frame around picker columns: one
 *   selection band across every column, the picker's height, and the one
 *   vanishing point all columns are drawn towards
 * @position Internal component; wraps the Wheels in MonthYearWheels.tsx,
 *   TouchTimeField.tsx and TouchDateTimeField.tsx
 *
 * The frame is UIPickerView's, so it draws only where the Wheels are
 * UIPickerView's columns: under a finger, on every touch device
 * (useTouchPresentation). Under a mouse or other fine pointer it renders its
 * children as they are: today's scrolling columns, laid out by their
 * container. Under a finger the frame takes its owner's layout (`xstyle`),
 * so the owner draws no wrapper of its own around it (spec:AST-017 FR60).
 *
 * UIPickerView draws one band under all its columns (inset from the picker's
 * sides) and centres every column's table on the picker, so the dimmed rows
 * of a side column lean towards the picker's centre, not their own. A Wheel
 * inside a WheelGroup reads the group's box for that centre; a Wheel on its
 * own draws its own band and uses its own centre. The band is the frame's
 * (or the lone column's) `::before`, marked `data-wheel-band`.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/DateInput/PickerWheel.tsx
 * - /packages/core/src/DateInput/PickerWheel.test.tsx
 */

import {
  createContext,
  use,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {colorVars, radiusVars} from '../theme/tokens.stylex';
import {useTouchPresentation} from '../utils/touchPresentation';
import {wheelGeometry} from './wheelGeometry.stylex';

const styles = stylex.create({
  // UIPickerView's 216 px, centred in its container.
  group: {
    position: 'relative',
    alignSelf: 'center',
    display: 'flex',
    inlineSize: '100%',
    minInlineSize: 0,
    blockSize: wheelGeometry.pickerHeight,
  },
  /**
   * UIPickerView's band: one capsule across every column, inset from the
   * picker's sides, behind the rows. Decoration, so the frame's own
   * `::before` draws it (minimal DOM, INV7). Its fill is the theme's neutral.
   * @source measured: UIKit lab (injected host app), iOS 26.2 simulator,
   *   iPhone 17 Pro, the band UIView of a `.time` `.wheels` UIDatePicker: its
   *   edge sits within 0.6 pt of a circle of radius h / 2 (a capsule, the
   *   continuous curve), Oct 24 2026. UIKit fills it with
   *   quaternarySystemFill; the theme's neutral stands in for it.
   */
  band: {
    '::before': {
      content: '""',
      position: 'absolute',
      insetInline: wheelGeometry.bandInset,
      insetBlockStart: `calc(50% - ${wheelGeometry.bandHeight} / 2)`,
      blockSize: wheelGeometry.bandHeight,
      borderRadius: radiusVars['--radius-full'],
      backgroundColor: colorVars['--color-neutral'],
      pointerEvents: 'none',
    },
  },
});

interface WheelGroupContextValue {
  /** The group's element: its centre is every column's vanishing point. */
  readonly groupRef: RefObject<HTMLDivElement | null>;
  /**
   * Whether the element is attached. A Wheel's own layout effects run
   * before the group's ref is attached, so this flips once it is and the
   * Wheel re-places its vanishing point (the element itself stays out of
   * React state).
   */
  readonly isMounted: boolean;
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
  /** The owner's layout, on the frame under a finger. */
  xstyle?: StyleXStyles;
}

/**
 * Picker columns in one frame, as UIPickerView draws them (under a finger;
 * under a fine pointer, the columns alone).
 *
 * @example
 * ```
 * <WheelGroup>
 *   <Wheel label="Hour" options={hours} value={hour} onChange={setHour} />
 *   <Wheel label="Minute" options={minutes} value={minute} onChange={setMinute} isLooping />
 * </WheelGroup>
 * ```
 */
export function WheelGroup({children, xstyle}: WheelGroupProps) {
  const groupRef = useRef<HTMLDivElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const attachGroup = useCallback((node: HTMLDivElement | null) => {
    groupRef.current = node;
    setIsMounted(node != null);
  }, []);
  const value = useMemo(() => ({groupRef, isMounted}), [isMounted]);
  // The frame is the touch column's alone.
  const {isTouch} = useTouchPresentation();
  if (!isTouch) {
    return <>{children}</>;
  }
  return (
    <WheelGroupContext value={value}>
      <div
        ref={attachGroup}
        data-wheel-band=""
        {...stylex.props(styles.group, styles.band, xstyle)}>
        {children}
      </div>
    </WheelGroupContext>
  );
}

WheelGroup.displayName = 'WheelGroup';

export {styles as wheelGroupStyles};
