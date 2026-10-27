// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file listRow.stylex.ts
 * @input Uses StyleX
 * @output Exports `listRowConsts`: the build-time mirror of edit mode's
 *   lengths in motion/uikit/list.ts (`list.metrics`)
 * @position Internal styling utility; ListItem reads `listRowConsts`
 *
 * StyleX evaluates a style at build time and cannot read the constants
 * table, so `listRowConsts` holds the table's `list.metrics` values as CSS
 * lengths, and List.test.tsx fails if they drift.
 *
 * SYNC: When modified, update motion/uikit/list.ts and List.test.tsx.
 */

import * as stylex from '@stylexjs/stylex';

export const listRowConsts = stylex.defineConsts({
  /** `list.metrics.editingIndent`: how far edit mode moves a row's text. */
  editingIndent: '40px',
  /** `list.metrics.editingControlCenter`: an editing control's centre. */
  editingControlCenter: '12px',
});
