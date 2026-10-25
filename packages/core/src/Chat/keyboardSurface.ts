// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file keyboardSurface.ts
 * @input React context
 * @output Exports KeyboardSurfaceContext and focusInKeyboardSurface: whether
 *   a composer sits in ChatLayout's keyboard-aware composer region, and the
 *   focus its routes deliver there
 * @position Internal to Chat: ChatLayout provides it around its composer;
 *   ChatComposer and ChatComposerInput read it. Not exported from the package
 *
 * Inside a keyboard-aware surface every route into the composer's text (a
 * tap, the shell's empty-space tap, a programmatic focus()) is delivered
 * without the browser's reveal, which on iOS scrolls the whole page; the
 * surface keeps the field in view itself (spec:AST-099 FR4). Elsewhere the
 * browser's own focus applies.
 *
 * SYNC: When modified, update ChatLayout.tsx, ChatComposer.tsx and
 * ChatComposerInput.tsx
 */

import {createContext} from 'react';

export const KeyboardSurfaceContext = createContext(false);
KeyboardSurfaceContext.displayName = 'KeyboardSurfaceContext';

/** Focuses `element` the way its surface wants (see the file header). */
export function focusInKeyboardSurface(
  element: HTMLElement,
  isKeyboardSurface: boolean,
): void {
  if (isKeyboardSurface) {
    element.focus({preventScroll: true});
  } else {
    element.focus();
  }
}
