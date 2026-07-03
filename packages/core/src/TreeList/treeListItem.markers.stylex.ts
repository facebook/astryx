// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file treeListItem.markers.stylex.ts
 * @input Uses StyleX defineMarker
 * @output Exports treeItemScope marker
 * @position Scoped marker; consumed by TreeListItem.tsx
 *
 * SYNC: When modified, update /packages/core/src/TreeList/TreeListItem.tsx
 */

import * as stylex from '@stylexjs/stylex';

/**
 * Scoped marker placed on each treeitem row (`<li role="treeitem">`).
 * Binds the row's `:focus-visible` outline to its OWN treeitem, so focusing
 * a parent treeitem does not leak the focus ring onto descendant rows.
 */
export const treeItemScope: ReturnType<typeof stylex.defineMarker> =
  stylex.defineMarker();
