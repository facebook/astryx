// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file isRenderable.ts
 * @input A ReactNode value
 * @output Boolean indicating whether the value will produce DOM output
 * @position Utility for checking if a React slot prop has meaningful content.
 *
 * React treats null, undefined, true, false, and '' as empty — they render
 * nothing. This utility checks if a ReactNode is NOT one of those values,
 * meaning it will produce actual DOM output when rendered.
 *
 * Use this instead of `prop != null` when checking if a slot has content,
 * since boolean/empty-string props also render nothing.
 */

import type {ReactNode} from 'react';

/**
 * Returns true if a ReactNode value will produce DOM output when rendered.
 * Returns false for null, undefined, true, false, and empty string.
 *
 * @example
 * ```tsx
 * const hasSideNav = isRenderable(sideNav);
 * const hasTopNav = isRenderable(topNav);
 * ```
 */
export function isRenderable(node: ReactNode): boolean {
  return node != null && typeof node !== 'boolean' && node !== '';
}
