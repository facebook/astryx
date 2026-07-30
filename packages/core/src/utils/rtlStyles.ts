// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file rtlStyles.ts
 * @input None
 * @output Shared StyleX style that horizontally mirrors an element under RTL
 * @position Core utility; applied to directional-icon wrappers in Calendar,
 *   Lightbox, and the Table expand/disclosure plugins
 *
 * `mirror` flips its element on the horizontal axis only when an ancestor
 * carries `dir="rtl"`. Using `scaleX(-1)` (not `scale(-1, -1)`) keeps the
 * vertical axis intact, and applying it OUTSIDE any state-driven rotation lets
 * it compose correctly — e.g. a Table disclosure chevron still rotates to point
 * down when expanded under RTL. The `:is([dir="rtl"] *)` selector matches the
 * MobileNav drawer convention; a bare `direction: rtl` alone won't trigger it.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/utils/index.ts
 */

import * as stylex from '@stylexjs/stylex';

export const rtlStyles = stylex.create({
  mirror: {
    transform: {default: null, ':is([dir="rtl"] *)': 'scaleX(-1)'},
  },
});
