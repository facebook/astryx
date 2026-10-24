// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file datePickerTouch.ts
 * @input The date and time pickers' touch-only pieces
 * @output Re-exports what the DateInput, TimeInput and DateTimeInput bottom
 *   sheets use only under a finger: TimeWheels (the time wheels that follow
 *   UIDatePicker)
 * @position The date and time pickers' touch layer. The sheets import touch
 *   behaviour from here and only here, so a desktop build can replace this one
 *   module.
 *
 * Under a finger (a coarse primary pointer) the sheets follow UIDatePicker;
 * with a mouse they keep today's controls. Everything a mouse never runs is
 * reached through this module.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/TimeInput/TouchTimeField.tsx
 * - /packages/core/src/DateTimeInput/TouchDateTimeField.tsx
 */

export {TimeWheels} from '../TimeInput/TimeWheels';
export type {TimeWheelsProps} from '../TimeInput/TimeWheels';
