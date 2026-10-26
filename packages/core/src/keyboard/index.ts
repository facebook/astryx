// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input keyboardHeight.ts
 * @output Re-exports the on-screen keyboard module (the keyboard height, its
 *   reports, the focus refusal, the reveal-pan watch, BottomSheet's hook),
 *   with its types
 * @position Entry of the keyboard module. Internal to core: components
 *   import it from `../keyboard`; nothing here is exported from the package
 *   entry point
 *
 * SYNC: When modified, update /packages/core/src/keyboard/README.md
 */

export {
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
  type KeyboardHeightEvent,
  type RefuseFocusRevealOptions,
  type RevealPanWatch,
  type WatchRevealPanOptions,
} from './keyboardHeight';
