'use client';

/**
 * @file index.ts
 * @input Imports hooks from individual files
 * @output Exports all hooks
 * @position Hook entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header
 */

export {useFocusTrap} from './useFocusTrap';
export type {UseFocusTrapOptions, UseFocusTrapReturn} from './useFocusTrap';

export {useGridFocus} from './useGridFocus';
export type {UseGridFocusOptions, UseGridFocusReturn} from './useGridFocus';

export {useListFocus} from './useListFocus';
export type {UseListFocusOptions, UseListFocusReturn} from './useListFocus';

export {useMediaQuery} from './useMediaQuery';

export {useOverflow} from './useOverflow';
export type {UseOverflowOptions, UseOverflowReturn} from './useOverflow';
