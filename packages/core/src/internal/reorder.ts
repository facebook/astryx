// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file reorder.ts
 * @input A reorderable object made by createReorderable
 * @output `reorderableOptions`: the options a reorderable object was made
 *   with, for a Lab collection that adapts an owner's object (a staged
 *   selector aims the moves at its draft and keeps the owner's
 *   `isReorderable`)
 * @position `@astryxdesign/core/internal/reorder`: an internal entry reserved
 *   for Astryx's own packages, undocumented, outside the public API and its
 *   compatibility promise (spec:AST-017 FR21), versioned in lockstep with
 *   Core, and allowed by lint only in Core and Lab
 *   (architecture:react-component-runtime INV13).
 */

import type {Key} from 'react';
import type {ReorderableInternals} from '../List/listReorderContext';
import type {
  Reorderable,
  ReorderableOptions,
} from '../reorderable/createReorderable';

/** The options `reorderable` was made with by `createReorderable`. */
export function reorderableOptions<TKey extends Key, TTo>(
  reorderable: Reorderable<TKey, TTo>,
): ReorderableOptions<TKey, TTo> {
  return (reorderable as unknown as ReorderableInternals)
    .options as unknown as ReorderableOptions<TKey, TTo>;
}
