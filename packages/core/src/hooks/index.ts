// Copyright (c) Meta Platforms, Inc. and affiliates.

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

export {useAnnounce} from './useAnnounce';
export type {AnnounceFn, AnnouncePoliteness} from './useAnnounce';

export {useGridFocus} from './useGridFocus';
export type {UseGridFocusOptions, UseGridFocusReturn} from './useGridFocus';

export {useListFocus} from './useListFocus';
export type {
  UseListFocusOptions,
  UseListFocusReturn,
  ListFocusOrientation,
} from './useListFocus';

export {useTreeFocus} from './useTreeFocus';
export type {UseTreeFocusOptions, UseTreeFocusReturn} from './useTreeFocus';

export {useTypeahead} from './useTypeahead';

export {useKeyboardHint} from './useKeyboardHint';
export type {
  UseKeyboardHintOptions,
  UseKeyboardHintReturn,
  KeyboardHintOrientation,
} from './useKeyboardHint';
export type {UseTypeaheadOptions, UseTypeaheadReturn} from './useTypeahead';

export {useMediaQuery} from './useMediaQuery';

export {useOverflow} from './useOverflow';
export type {UseOverflowOptions, UseOverflowReturn} from './useOverflow';

export {useScrollOverflow} from './useScrollOverflow';
export type {ScrollOverflowState} from './useScrollOverflow';

export {useScrollLock} from './useScrollLock';

export {useEntryAnimation} from './useEntryAnimation';
export type {EntryAnimationPreset} from './useEntryAnimation';

export {useStreamingText} from './useStreamingText';
export type {
  StreamingTextSpeed,
  UseStreamingTextOptions,
} from './useStreamingText';
export {useImageMode} from './useImageMode';
export type {ImageSampleRegion, UseImageModeOptions} from './useImageMode';

export {
  useClickableContainer,
  INTERACTIVE_SELECTORS,
} from './useClickableContainer';
export type {
  UseClickableContainerOptions,
  ClickableContainerResult,
} from './useClickableContainer';

export {useInputContainer} from './useInputContainer';
export type {UseInputContainerOptions} from './useInputContainer';

export {useInteractiveRole} from './useInteractiveRole';
export type {
  InteractiveRole,
  UseInteractiveRoleOptions,
} from './useInteractiveRole';

export {useLongPress} from './useLongPress';
export type {UseLongPressOptions, UseLongPressHandlers} from './useLongPress';
