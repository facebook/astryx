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

export {useStreamingText} from './useStreamingText';
export type {
  StreamingTextSpeed,
  UseStreamingTextOptions,
} from './useStreamingText';
export {useImageMode} from './useImageMode';
export type {ImageSampleRegion, UseImageModeOptions} from './useImageMode';

export {useClickableContainer} from './useClickableContainer';
export type {
  UseClickableContainerOptions,
  ClickableContainerResult,
} from './useClickableContainer';

export {useInputContainer} from './useInputContainer';
export type {UseInputContainerOptions} from './useInputContainer';

export {useInteractiveRole} from './useInteractiveRole';
export type {
  InteractiveRole,
  UseXDSInteractiveRoleOptions,
} from './useInteractiveRole';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  useClickableContainer as useXDSClickableContainer,
  useEntryAnimation as useXDSEntryAnimation,
  useFocusTrap as useXDSFocusTrap,
  useGridFocus as useXDSGridFocus,
  useImageMode as useXDSImageMode,
  useInputContainer as useXDSInputContainer,
  useInteractiveRole as useXDSInteractiveRole,
  useListFocus as useXDSListFocus,
  useMediaQuery as useXDSMediaQuery,
  useOverflow as useXDSOverflow,
  useScrollLock as useXDSScrollLock,
  useScrollOverflow as useXDSScrollOverflow,
  useStreamingText as useXDSStreamingText,
} from '.';
export type {
  ClickableContainerResult as XDSClickableContainerResult,
  EntryAnimationPreset as XDSEntryAnimationPreset,
  ImageSampleRegion as XDSImageSampleRegion,
  InteractiveRole as XDSInteractiveRole,
  ScrollOverflowState as XDSScrollOverflowState,
  StreamingTextSpeed as XDSStreamingTextSpeed,
  UseClickableContainerOptions as XDSUseClickableContainerOptions,
  UseFocusTrapOptions as XDSUseFocusTrapOptions,
  UseFocusTrapReturn as XDSUseFocusTrapReturn,
  UseGridFocusOptions as XDSUseGridFocusOptions,
  UseGridFocusReturn as XDSUseGridFocusReturn,
  UseImageModeOptions as XDSUseImageModeOptions,
  UseInputContainerOptions as XDSUseInputContainerOptions,
  UseListFocusOptions as XDSUseListFocusOptions,
  UseListFocusReturn as XDSUseListFocusReturn,
  UseOverflowOptions as XDSUseOverflowOptions,
  UseOverflowReturn as XDSUseOverflowReturn,
  UseStreamingTextOptions as XDSUseStreamingTextOptions,
  UseXDSInteractiveRoleOptions as XDSUseXDSInteractiveRoleOptions,
} from '.';
// <compat-aliases:end>
