// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input keyboardLayoutGuide.ts and keyboardModel.ts
 * @output Re-exports the keyboard layout guide: getKeyboardLayoutGuide,
 *   useKeyboardLayoutGuide, measureKeyboardInset, bringsUpKeyboard,
 *   createKeyboardModel and their types
 * @position Entry of the keyboard module. Internal to core: components
 *   import it from `../keyboard`. The `@astryxdesign/core/keyboard/experimental`
 *   subpath (experimental.ts) exposes the guide and its hook to lab
 *   components; nothing is exported from the package entry point
 *
 * SYNC: When modified, update /packages/core/src/keyboard/README.md
 */

export {
  bringsUpKeyboard,
  getKeyboardLayoutGuide,
  measureKeyboardInset,
  type KeyboardLayoutGuide,
} from './keyboardLayoutGuide';
export {useKeyboardLayoutGuide} from './useKeyboardLayoutGuide';
export {
  createKeyboardModel,
  type KeyboardModel,
  type KeyboardModelOptions,
  type KeyboardTransition,
  type KeyboardTransitionKind,
} from './keyboardModel';
