// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file wheelLook.ts
 * @input The UIKit picker table
 * @output WHEEL_ROW_PITCH: the touch column's row pitch, px
 * @position Internal constant; read by the sheets' tests and proofs to
 *   measure drags in rows
 *
 * Under a finger the touch column draws UIPickerView's cylinder (wheelDrum.ts),
 * one row every 32 pt.
 */

import {picker} from '../motion/uikit/picker';

/** The touch column's row pitch: UIPickerView's row height, px. */
export const WHEEL_ROW_PITCH = picker.geometry.rowHeight;
