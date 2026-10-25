// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from List.tsx, ListItem.tsx and selectionHold.ts
 * @output Exports List, ListItem components and their props/types, and
 *   holdSelection
 * @position Package entry point for List
 *
 * SYNC: When modified, update /packages/core/src/List/List.doc.mjs
 */

export {List} from './List';
export type {ListProps, ListStyle, ListDensity, ListEdge} from './List';
export {ListItem} from './ListItem';
export type {ListItemProps} from './ListItem';
// A list row kept selected while a navigation covers it, deselected as the
// navigation pops (UIKit's push-from-a-row). Exported for @astryxdesign/lab's
// navigation stack, which calls it with the activation that pushed.
export {
  holdSelection,
  type SelectionHold,
  type HoldTiming,
  type HoldTransitionTiming,
  type HoldSpringTiming,
  type HoldCurveTiming,
  type HoldSpring,
  type HoldCurve,
} from './selectionHold';
