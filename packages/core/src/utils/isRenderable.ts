// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file isRenderable.ts
 * @input A ReactNode value
 * @output Boolean indicating whether the value will produce DOM output
 * @position Utility for checking if a React slot prop has meaningful content.
 *
 * React treats null, undefined, true, false, '' and an empty array as empty —
 * they render nothing. This utility checks if a ReactNode is NOT one of those
 * values, meaning it will produce actual DOM output when rendered.
 *
 * Use this instead of `prop != null` when checking if a slot has content,
 * since boolean/empty-string props also render nothing.
 */

import type {ReactNode} from 'react';

/**
 * Returns true if a ReactNode value will produce DOM output when rendered.
 * Returns false for null, undefined, true, false, empty string, and an empty
 * array — `items.map(...)` over an empty list renders nothing, so a slot fed
 * that way must not draw its wrapper (divider, separator, container).
 *
 * @example
 * ```tsx
 * const hasSideNav = isRenderable(sideNav);
 * const hasTopNav = isRenderable(topNav);
 * ```
 */
export function isRenderable(node: ReactNode): boolean {
  if (Array.isArray(node)) {
    return node.length > 0;
  }
  return node != null && typeof node !== 'boolean' && node !== '';
}
