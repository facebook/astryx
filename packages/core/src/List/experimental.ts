// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file experimental.ts
 * @input List's reorder session (useListReorder.ts) and its handle
 *   (ListReorderHandle.tsx)
 * @output The `@astryxdesign/core/List/experimental` entry point: the reorder
 *   session for a list whose rows are not ListItems
 * @position Experimental public subpath (spec:AST-017 FR21): outside the
 *   stable compatibility promise, never re-exported from the package root or
 *   the ordinary `List` subpath. Lab components whose rows hold their own
 *   content (ListInput's records) reorder through it.
 *
 * Everything here is experimental: it may change or be removed in a patch
 * release. Every declaration it exposes carries `@experimental`.
 *
 * SYNC: When modified, update /packages/core/src/List/experimental.test.tsx and
 * /packages/core/src/List/useListReorder.doc.mjs.
 */

export {
  FIXED_ROW_ATTRIBUTE as LIST_REORDER_FIXED_ROW_ATTRIBUTE,
  ListReorderContext,
  useListReorder,
} from './useListReorder';
export type {ListReorderContextValue} from './useListReorder';

export {ListReorderHandle} from './ListReorderHandle';
export type {ListReorderHandleProps} from './ListReorderHandle';
