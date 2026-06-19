// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @input None
 * @output Exports OutlineItem type
 * @position Shared type definitions; consumed by Outline, hooks, and parser utils
 *
 * SYNC: When modified, update /packages/core/src/Outline/Outline.doc.mjs
 */

export interface OutlineItem {
  /** Unique ID, typically matching the target heading's DOM id. */
  id: string;

  /** Display text for the outline item. */
  label: string;

  /** Heading depth from 1 to 6. Controls indentation. */
  level: number;
}
