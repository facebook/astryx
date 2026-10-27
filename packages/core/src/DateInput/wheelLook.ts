// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file wheelLook.ts
 * @input The default look's row height (spec:AST-094 FR42)
 * @output WHEEL_ROW_PITCH: the touch column's row pitch, px
 * @position Internal constant; read by PickerWheel.tsx and by the sheets'
 *   tests and proofs to measure drags in rows
 *
 * Under a finger the touch column draws UIPickerView's cylinder (wheelDrum.ts)
 * with one row every 28 px, the row the default look has everywhere: it grows
 * no box for touch (spec:AST-094 FR42, DEC-20).
 *
 * SYNC: When modified, update:
 * - /packages/core/src/DateInput/wheelGeometry.stylex.ts (rowHeight, bandHeight)
 */

/** The touch column's row pitch: the default look's row height, px. */
export const WHEEL_ROW_PITCH = 28;
