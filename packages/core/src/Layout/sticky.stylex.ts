// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file sticky.stylex.ts
 * @input Uses @stylexjs/stylex, spacing from theme
 * @output StyleX styles for the isSticky / stickyOffset props on layout primitives
 * @position Layout utility; used by Stack (and, in turn, HStack / VStack)
 *
 * SYNC: When modified, update /packages/core/src/Stack/Stack.doc.mjs
 */

import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import type {SpacingStep} from '../utils/types';

/**
 * Base sticky styles.
 *
 * `position: sticky` pins the element to the block-start edge of its nearest
 * scroll container. `alignSelf: flex-start` stops the element from stretching
 * along the cross axis when it is a flex or grid item — a stretched item fills
 * its track and has no room to stick, so this is required for the common
 * "sticky column / rail beside a scrolling sibling" pattern to work.
 *
 * The block-start inset is supplied separately by {@link stickyOffsetStyles}
 * (defaulting to `0`) so `isSticky` alone pins flush to the top edge.
 */
export const stickyStyles = stylex.create({
  sticky: {
    position: 'sticky',
    alignSelf: 'flex-start',
  },
});

/**
 * Block-start inset for a sticky element, keyed by numeric SpacingStep and
 * resolved through the theme spacing tokens (mirrors `paddingStyles`).
 *
 * Uses the logical `insetBlockStart` so the offset tracks writing mode
 * (equivalent to `top` in the default horizontal-tb flow).
 */
export const stickyOffsetStyles = stylex.create({
  0: {insetBlockStart: spacingVars['--spacing-0']},
  0.5: {insetBlockStart: spacingVars['--spacing-0-5']},
  1: {insetBlockStart: spacingVars['--spacing-1']},
  1.5: {insetBlockStart: spacingVars['--spacing-1-5']},
  2: {insetBlockStart: spacingVars['--spacing-2']},
  3: {insetBlockStart: spacingVars['--spacing-3']},
  4: {insetBlockStart: spacingVars['--spacing-4']},
  5: {insetBlockStart: spacingVars['--spacing-5']},
  6: {insetBlockStart: spacingVars['--spacing-6']},
  8: {insetBlockStart: spacingVars['--spacing-8']},
  10: {insetBlockStart: spacingVars['--spacing-10']},
});

export type {SpacingStep};
