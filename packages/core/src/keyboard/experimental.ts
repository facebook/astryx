// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file experimental.ts
 * @input The keyboard layout guide (getKeyboardLayoutGuide,
 *   useKeyboardLayoutGuide), rideKeyboard and their types
 * @output The `@astryxdesign/core/keyboard/experimental` entry point
 * @position Experimental public subpath (spec:AST-017 FR21): outside the
 *   stable compatibility promise, never re-exported from the package root or
 *   an ordinary subpath. Lab components keep content above the software
 *   keyboard with it.
 *
 * Everything here is experimental: it may change or be removed in a patch
 * release. Every declaration it exposes carries `@experimental`. The keyboard
 * constants (`keyboard`) are in the motion subpath's `uikit` namespace.
 *
 * SYNC: When modified, update /packages/core/src/keyboard/experimental.test.ts,
 * /packages/core/src/keyboard/useKeyboardLayoutGuide.doc.mjs and
 * /packages/core/src/keyboard/README.md.
 */

export {getKeyboardLayoutGuide} from './keyboardLayoutGuide';
export type {KeyboardLayoutGuide} from './keyboardLayoutGuide';
export type {
  KeyboardCurve,
  KeyboardProfile,
  KeyboardTransition,
  KeyboardTransitionKind,
} from './keyboardModel';
export {rideKeyboard} from './rideKeyboard';
export {
  useKeyboardLayoutGuide,
  type UseKeyboardLayoutGuideOptions,
} from './useKeyboardLayoutGuide';
