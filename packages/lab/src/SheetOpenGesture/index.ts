// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input useSheetOpenGesture.ts
 * @output Re-exports the SheetOpenGesture exploration API
 * @position Component entry point; re-exported by /packages/lab/src/index.ts
 */

export {useSheetOpenGesture} from './useSheetOpenGesture';
export type {
  SheetOpenGestureOrigin,
  UseSheetOpenGestureOptions,
  UseSheetOpenGestureResult,
} from './useSheetOpenGesture';
