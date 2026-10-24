// Copyright (c) Meta Platforms, Inc. and affiliates.
'use client';

/**
 * @file useWheelsWarmUp.ts
 * @input Whether the sheet holding the month/year wheels is open, and the
 *   sheet's settle time (a constant pinned to `springs.sheetPresent`)
 * @output Exports `useWheelsWarmUp`: true once the open sheet has settled and
 *   the main thread is idle, for the hidden wheels to be laid out ahead of
 *   the month/year toggle
 * @position Internal hook of TouchDateField.tsx and TouchDateTimeField.tsx,
 *   under a finger; part of the pickers' touch layer (datePickerTouch.ts)
 *
 * Mobile Safari starts an animation only after the commit that creates it
 * reaches the compositor. The month/year toggle's commit used to make the
 * hidden wheels visible, and WebKit then builds a layer for every row on the
 * wheels' cylinders in that same commit (about 150 ms for an unbounded year
 * wheel on the iOS 26.2 simulator). The fade's first frames were lost, so the
 * toggle showed as a jump.
 *
 * So the wheels are laid out before the toggle. Once the sheet has finished
 * presenting (its present spring's settling duration) and the main thread is
 * idle, this turns true, and the hidden wheels panel turns `visible` at
 * opacity 0, still inert and hidden from assistive technology. Its layers
 * then exist when the title is tapped, and the toggle's commit only changes
 * opacity. It turns false again when the sheet closes.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/DateInput/useWheelsWarmUp.test.tsx
 * - /packages/core/src/DateInput/__tests__/MonthYearToggle.interaction.browser.spec.ts
 */

import {useEffect, useState} from 'react';

/**
 * How long the sheet's present motion (`springs.sheetPresent`) takes to
 * settle, in milliseconds. A constant rather than a read of the table, so the
 * pickers ship none of the springs table's other rows; the test pins it to
 * the spring.
 */
export const SHEET_SETTLE_MS = 506;

/** The longest an idle callback may wait before the wheels warm anyway. */
const IDLE_TIMEOUT_MS = 300;

/**
 * True once the sheet has been open for its present motion's settling
 * duration and the main thread has gone idle; false while it is closed.
 *
 * @example
 * ```
 * const isWheelsWarm = useWheelsWarmUp(isSheetOpen && isTouch);
 * ```
 */
export function useWheelsWarmUp(isSheetOpen: boolean): boolean {
  const [isWarm, setIsWarm] = useState(false);
  useEffect(() => {
    if (!isSheetOpen) {
      return undefined;
    }
    let idle: number | null = null;
    const warm = () => {
      setIsWarm(true);
    };
    const timer = window.setTimeout(() => {
      idle =
        typeof window.requestIdleCallback === 'function'
          ? window.requestIdleCallback(warm, {timeout: IDLE_TIMEOUT_MS})
          : window.setTimeout(warm, 0);
    }, SHEET_SETTLE_MS);
    return () => {
      // Cooled for the next opening, which waits for its own settle.
      setIsWarm(false);
      window.clearTimeout(timer);
      if (idle != null) {
        if (typeof window.cancelIdleCallback === 'function') {
          window.cancelIdleCallback(idle);
        } else {
          window.clearTimeout(idle);
        }
      }
    };
  }, [isSheetOpen]);
  return isSheetOpen && isWarm;
}
