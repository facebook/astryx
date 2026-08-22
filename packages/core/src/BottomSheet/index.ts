// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input BottomSheet.tsx, BottomSheetSwitcher.tsx, sheetDragSource.ts
 * @output Re-exports the BottomSheet public API
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 */

export {BottomSheet} from './BottomSheet';
export type {
  BottomSheetHeight,
  BottomSheetProps,
  BottomSheetSnapPoint,
} from './BottomSheet';
export {BottomSheetSwitcher} from './BottomSheetSwitcher';
export type {BottomSheetSwitcherProps} from './BottomSheetSwitcher';

// EXPLORATION: the seam a drag-to-open recognizer publishes through.
export {createSheetDragSource} from './sheetDragSource';
export type {
  SheetDragController,
  SheetDragEvent,
  SheetDragPoint,
  SheetDragSnapshot,
  SheetDragSource,
} from './sheetDragSource';
