// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input keyboardHeight.ts, keyboardLayoutGuide.ts, keyboardModel.ts,
 *   rideKeyboard.ts and keyboardDismiss.ts
 * @output Re-exports the on-screen keyboard module (the keyboard height, its
 *   reports, the focus refusal, the reveal-pan watch, BottomSheet's hook),
 *   the keyboard layout guide (getKeyboardLayoutGuide, keyboardProfileOf,
 *   bringsUpKeyboard, createKeyboardModel), rideKeyboard and
 *   observeKeyboardDismiss, with their types
 * @position Entry of the keyboard module. Internal to core: components
 *   import it from `../keyboard`; nothing here is exported from the package
 *   entry point
 *
 * SYNC: When modified, update /packages/core/src/keyboard/README.md
 */

export {
  claimTapFocus,
  findTextEntryControl,
  getKeyboardHeight,
  isKeyboardMeasurable,
  isTextEntryControl,
  measureKeyboardHeight,
  refuseFocusReveal,
  subscribeKeyboardHeight,
  useKeyboardHeight,
  useSheetKeyboard,
  watchRevealPan,
  type ClaimTapFocusOptions,
  type KeyboardHeightEvent,
  type RefuseFocusRevealOptions,
  type RevealPanWatch,
  type WatchRevealPanOptions,
} from './keyboardHeight';
export {
  bringsUpKeyboard,
  getKeyboardLayoutGuide,
  keyboardProfileOf,
  type KeyboardLayoutGuide,
} from './keyboardLayoutGuide';
export {rideKeyboard} from './rideKeyboard';
export {observeKeyboardDismiss} from './keyboardDismiss';
export type {
  KeyboardDismissMode,
  KeyboardDismissOptions,
} from './keyboardDismiss';
export {
  createKeyboardModel,
  type KeyboardCurve,
  type KeyboardModel,
  type KeyboardModelOptions,
  type KeyboardProfile,
  type KeyboardTransition,
  type KeyboardTransitionKind,
} from './keyboardModel';
