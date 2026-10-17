// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file IconSize.stylex.ts
 * @input Defines the Icon size scale
 * @output Exports shared Icon size types and StyleX styles
 * @position Internal Icon sizing source; consumed by Icon and icon-slot owners
 */

import * as stylex from '@stylexjs/stylex';

/**
 * Icon sizes are expressed in `rem` so they scale with the root font-size.
 * Values are the px-equivalents at a 16px root: 12, 16, 20, and 24px.
 */
const iconSizeValues = {
  xsm: '0.75rem',
  sm: '1rem',
  md: '1.25rem',
  lg: '1.5rem',
} as const;

export type IconSize = keyof typeof iconSizeValues;

/** Size styles for direct SVG icon components. */
export const iconSizeStyles = stylex.create({
  xsm: {
    width: iconSizeValues.xsm,
    height: iconSizeValues.xsm,
  },
  sm: {
    width: iconSizeValues.sm,
    height: iconSizeValues.sm,
  },
  md: {
    width: iconSizeValues.md,
    height: iconSizeValues.md,
  },
  lg: {
    width: iconSizeValues.lg,
    height: iconSizeValues.lg,
  },
});

/**
 * Size styles for icon boxes and string-based registry icons. `fontSize`
 * keeps 1em-based icons in step with the box.
 */
export const iconBoxSizeStyles = stylex.create({
  xsm: {
    width: iconSizeValues.xsm,
    height: iconSizeValues.xsm,
    fontSize: iconSizeValues.xsm,
  },
  sm: {
    width: iconSizeValues.sm,
    height: iconSizeValues.sm,
    fontSize: iconSizeValues.sm,
  },
  md: {
    width: iconSizeValues.md,
    height: iconSizeValues.md,
    fontSize: iconSizeValues.md,
  },
  lg: {
    width: iconSizeValues.lg,
    height: iconSizeValues.lg,
    fontSize: iconSizeValues.lg,
  },
});
