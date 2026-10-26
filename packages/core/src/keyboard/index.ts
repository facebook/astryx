// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input useMobileKeyboard.ts, keyboardLayoutGuide.ts, keyboardModel.ts and
 *   rideKeyboard.ts
 * @output Re-exports the on-screen keyboard module (the keyboard height, its
 *   reports, the focus refusal, BottomSheet's hook), the keyboard layout
 *   guide (getKeyboardLayoutGuide, keyboardProfileOf, bringsUpKeyboard,
 *   createKeyboardModel) and rideKeyboard, with their types
 * @position Entry of the keyboard module. Internal to core: components
 *   import it from `../keyboard`; nothing here is exported from the package
 *   entry point
 *
 * SYNC: When modified, update /packages/core/src/keyboard/README.md
 */

export {
  claimTapFocus,
  findTextEntryControl,
  getMobileKeyboardHeight,
  isKeyboardMeasurable,
  isTextEntryControl,
  measureKeyboardHeight,
  refuseFocusReveal,
  subscribeMobileKeyboard,
  useKeyboardHeight,
  useMobileKeyboard,
  type ClaimTapFocusOptions,
  type MobileKeyboardEvent,
  type RefuseFocusRevealOptions,
} from './useMobileKeyboard';
export {
  bringsUpKeyboard,
  getKeyboardLayoutGuide,
  keyboardProfileOf,
  type KeyboardLayoutGuide,
} from './keyboardLayoutGuide';
export {rideKeyboard} from './rideKeyboard';
export {
  createKeyboardModel,
  type KeyboardCurve,
  type KeyboardModel,
  type KeyboardModelOptions,
  type KeyboardProfile,
  type KeyboardTransition,
  type KeyboardTransitionKind,
} from './keyboardModel';
