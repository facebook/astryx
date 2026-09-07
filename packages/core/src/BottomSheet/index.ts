// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input BottomSheet.tsx, BottomSheetStack.tsx, BottomSheetSwitcher.tsx
 * @output Re-exports the BottomSheet public API
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 */

export {BottomSheet} from './BottomSheet';
export type {
  BottomSheetHeight,
  BottomSheetProps,
  BottomSheetSnapPoint,
} from './BottomSheet';
export {BottomSheetStack} from './BottomSheetStack';
export type {BottomSheetStackProps} from './BottomSheetStack';
export {BottomSheetSwitcher} from './BottomSheetSwitcher';
export type {BottomSheetSwitcherProps} from './BottomSheetSwitcher';
