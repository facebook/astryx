// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input useMobileKeyboard.ts, keyboardLayoutGuide.ts, keyboardModel.ts and
 *   keyboardDismiss.ts
 * @output Re-exports the on-screen keyboard module (the keyboard height, its
 *   reports, the focus refusal, BottomSheet's hook), the keyboard layout
 *   guide (getKeyboardLayoutGuide, bringsUpKeyboard, createKeyboardModel) and
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
  type KeyboardLayoutGuide,
} from './keyboardLayoutGuide';
export {observeKeyboardDismiss} from './keyboardDismiss';
export type {
  KeyboardDismissMode,
  KeyboardDismissOptions,
} from './keyboardDismiss';
export {
  createKeyboardModel,
  type KeyboardModel,
  type KeyboardModelOptions,
  type KeyboardTransition,
  type KeyboardTransitionKind,
} from './keyboardModel';
