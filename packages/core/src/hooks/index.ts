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

export {hasActiveFocusTrapEscape, useFocusTrap} from './useFocusTrap';
export type {UseFocusTrapOptions, UseFocusTrapReturn} from './useFocusTrap';

/**
 * @deprecated Import from `@astryxdesign/core/utils` instead — this is a pure
 * predicate, not a hook, and the `hooks` barrel is a `'use client'` boundary.
 * Re-exported here for one release so consumers can move; will be removed in
 * an upcoming major.
 */
export {isImeKeyEvent} from '../utils/ime';

export {useAnnounce} from './useAnnounce';
export type {AnnounceFn, AnnouncePoliteness} from './useAnnounce';

export {useClipboard} from './useClipboard';
export type {UseClipboardOptions, UseClipboardReturn} from './useClipboard';

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

export {useHotkeys} from './useHotkeys';
export type {Hotkey} from './useHotkeys';

export {useTypeahead} from './useTypeahead';

export {useKeyboardHint} from './useKeyboardHint';
export type {
  UseKeyboardHintOptions,
  UseKeyboardHintReturn,
  KeyboardHintOrientation,
} from './useKeyboardHint';
export type {UseTypeaheadOptions, UseTypeaheadReturn} from './useTypeahead';

export {useMediaQuery} from './useMediaQuery';

export {useMergedRefs} from './useMergedRefs';

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

export {useInputStatusIcon} from './useInputStatusIcon';
export type {
  UseInputStatusIconOptions,
  UseInputStatusIconReturn,
} from './useInputStatusIcon';

export {useInteractiveRole} from './useInteractiveRole';
export type {
  InteractiveRole,
  UseInteractiveRoleOptions,
} from './useInteractiveRole';

export {useLongPress} from './useLongPress';
export type {UseLongPressOptions, UseLongPressHandlers} from './useLongPress';

export {useDevWarning} from './useDevWarning';
export {useIndicatorFocusRing} from './useIndicatorFocusRing';

export {useContainerReveal} from './useContainerReveal';
export type {
  UseContainerRevealOptions,
  UseContainerRevealReturn,
  ContainerRevealOptions,
  ContentRevealOptions,
} from './useContainerReveal';
