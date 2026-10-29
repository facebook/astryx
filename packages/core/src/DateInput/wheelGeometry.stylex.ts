// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file wheelGeometry.stylex.ts
 * @input StyleX constants
 * @output Exports wheelGeometry, UIPickerView's geometry in px for the wheels
 *   under a finger, at the default look's row
 * @position Internal touch-picker geometry consumed by PickerWheel.tsx and
 *   WheelGroup.tsx; not a package export (the released DateInput tokens live
 *   in tokens.stylex.ts)
 *
 * SYNC: When modified, update:
 * - /packages/core/src/motion/uikit/picker.ts (the measured values)
 * - /packages/core/src/DateInput/wheelLook.ts (the row pitch)
 * - /packages/core/src/DateInput/DateInputTouch.test.tsx (holds them equal)
 */

import * as stylex from '@stylexjs/stylex';

/**
 * UIPickerView's geometry in px, from the UIKit constants table
 * (motion/uikit/picker.ts, measured on the iOS 26.2 simulator), with the
 * rows and the band at the default look's row: the default look grows no
 * box for touch (spec:AST-094 FR42), so they keep the 28 px they have
 * everywhere, set on UIKit's cylinder. StyleX inlines only literal
 * constants, so the values are repeated here; a test holds them to the
 * table and the row. Under a fine pointer the wheels keep the sizes of
 * tokens.stylex.ts.
 */
export const wheelGeometry = stylex.defineConsts({
  /** The picker's height: picker.geometry.height. */
  pickerHeight: '216px',
  /** Row pitch: the default look's row, WHEEL_ROW_PITCH (AST-094 FR42). */
  rowHeight: '28px',
  /** Half the row pitch, where a row's top sits above the band's centre. */
  rowHalfHeight: '14px',
  /** The cylinder's radius behind each row: −picker.geometry.cylinderRadius. */
  rowOriginDepth: '-97.2px',
  /** The dimmed copies' perspective: picker.geometry.perspective. */
  perspective: '900px',
  /** The band: one row tall (AST-094 FR42), inset by picker.geometry.bandInset. */
  bandHeight: '28px',
  bandInset: '9px',
  /** The band copy's magnification: picker.geometry.bandMagnification. */
  bandMagnification: '1.119',
});
