// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input reorderable/createReorderable.ts
 * @output The public reorder API (spec:AST-103): `createReorderable` and its
 *   types
 * @position Public entry point, re-exported from the package root
 */

export {
  createReorderable,
  type Reorderable,
  type ReorderableOptions,
  type ReorderMove,
  type ReorderableItem,
  type ReorderableAttachOptions,
  type ReorderableAttachment,
} from './createReorderable';
