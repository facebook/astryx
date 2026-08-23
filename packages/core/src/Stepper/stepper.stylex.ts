// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file stepper.stylex.ts
 * @input StyleX marker system
 * @output stepMarker — a scoped marker applied to each Step's <li>
 * @position Shared StyleX marker consumed by Step for structural selectors
 *
 * Applied to each Step's root `<li>` so the on-track connector segments can
 * key their first/last-node visibility off `stylex.when.ancestor(':first-child'
 * | ':last-child', stepMarker)` — matching only the parent step row, never the
 * outer `<ol>`. This replaces counting children in the parent, so steps behave
 * correctly regardless of how the consumer groups them (arrays, fragments).
 */

import * as stylex from '@stylexjs/stylex';

export const stepMarker: ReturnType<typeof stylex.defineMarker> =
  stylex.defineMarker();
