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

export {useScrollOverflow} from './useScrollOverflow';
export type {ScrollOverflowState} from './useScrollOverflow';

export {useScrollLock} from './useScrollLock';

export {useEntryAnimation} from './useEntryAnimation';
export type {EntryAnimationPreset} from './useEntryAnimation';

export {useXDSStreamingText} from './useXDSStreamingText';
export type {
  StreamingTextSpeed,
  UseStreamingTextOptions,
} from './useXDSStreamingText';
export {useImageMode} from './useImageMode';
export type {ImageSampleRegion, UseImageModeOptions} from './useImageMode';

export {useClickableContainer} from './useClickableContainer';
export type {
  UseClickableContainerOptions,
  ClickableContainerResult,
} from './useClickableContainer';

export {useInputContainer} from './useInputContainer';
export type {UseInputContainerOptions} from './useInputContainer';
