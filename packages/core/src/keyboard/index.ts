// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input keyboardLayoutGuide.ts and keyboardModel.ts
 * @output Re-exports the keyboard layout guide: getKeyboardLayoutGuide,
 *   keyboardProfileOf, rideKeyboard, measureKeyboardInset, bringsUpKeyboard,
 *   createKeyboardModel, observeKeyboardDismiss and their types
 * @position Entry of the keyboard module. Internal to core: components
 *   import it from `../keyboard`; nothing here is exported from the package
 *   entry point
 *
 * SYNC: When modified, update /packages/core/src/keyboard/README.md
 */

export {
  bringsUpKeyboard,
  getKeyboardLayoutGuide,
  keyboardProfileOf,
  measureKeyboardInset,
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
  type KeyboardModel,
  type KeyboardCurve,
  type KeyboardModelOptions,
  type KeyboardProfile,
  type KeyboardTransition,
  type KeyboardTransitionKind,
} from './keyboardModel';
