// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file keyboardSurface.ts
 * @input React context, the touch query (utils/touchPresentation.ts), where
 *   the keyboard is measured (keyboard/useMobileKeyboard.ts)
 * @output Exports KeyboardSurfaceContext and focusInKeyboardSurface: whether
 *   a composer sits in ChatLayout's keyboard-aware composer region, and the
 *   focus its routes deliver there
 * @position Internal to Chat: ChatLayout provides it around its composer;
 *   ChatComposer and ChatComposerInput read it. Not exported from the package
 *
 * Inside a keyboard-aware surface, under a finger, every route into the
 * composer's text (a tap, the shell's empty-space tap, a programmatic
 * focus()) is delivered without the browser's reveal, which on iOS scrolls
 * the whole page; the surface keeps the field in view itself (spec:AST-099
 * FR4). That holds where the keyboard is measured, a top-level document with
 * a visual viewport: inside an iframe nothing changes (FR7). Under a mouse,
 * and outside a surface, the browser's own focus applies (spec:AST-017
 * FR59): the primary pointer is read at each focus, so a tablet that docks a
 * mouse follows it.
 *
 * SYNC: When modified, update ChatLayout.tsx, ChatComposer.tsx and
 * ChatComposerInput.tsx
 */

import {createContext} from 'react';
import {isKeyboardMeasurable} from '../keyboard/useMobileKeyboard';
import {TOUCH_QUERY} from '../utils/touchPresentation';

export const KeyboardSurfaceContext = createContext(false);
KeyboardSurfaceContext.displayName = 'KeyboardSurfaceContext';

/** Focuses `element` the way its surface wants (see the file header). */
export function focusInKeyboardSurface(
  element: HTMLElement,
  isKeyboardSurface: boolean,
): void {
  if (isKeyboardSurface && isMeasuredTouchScreen(element)) {
    element.focus({preventScroll: true});
  } else {
    element.focus();
  }
}

function isMeasuredTouchScreen(element: HTMLElement): boolean {
  const win = element.ownerDocument.defaultView;
  return (
    win != null &&
    isKeyboardMeasurable(win) &&
    typeof win.matchMedia === 'function' &&
    win.matchMedia(TOUCH_QUERY).matches
  );
}
