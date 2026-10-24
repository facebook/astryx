// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useKeyboardLayoutGuide.ts
 * @input React, getKeyboardLayoutGuide
 * @output Exports useKeyboardLayoutGuide: the window's keyboard layout guide,
 *   with a listener called for every keyboard transition while the component
 *   is mounted, and the field it keeps above the keyboard (`overlayFor`)
 * @position React entry to the keyboard layout guide; exported from the
 *   `@astryxdesign/core/keyboard/experimental` subpath
 *
 * The listener is read through a ref, so passing a new function on each
 * render subscribes nothing new, and a transition never causes a render:
 * move elements from the listener with an animator. `overlayFor` registers
 * the field with the guide's overlayWhileFocused while it is mounted, so on
 * Chrome the page overlays the keyboard while the field has focus.
 *
 * SYNC: When modified, update /packages/core/src/keyboard/README.md and
 * /packages/core/src/keyboard/useKeyboardLayoutGuide.doc.mjs
 */

import {useRef, type RefObject} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {
  getKeyboardLayoutGuide,
  type KeyboardLayoutGuide,
} from './keyboardLayoutGuide';
import type {KeyboardTransition} from './keyboardModel';

/**
 * Options of useKeyboardLayoutGuide.
 * @experimental
 */
export interface UseKeyboardLayoutGuideOptions {
  /**
   * A field that keeps itself above the keyboard. While focus is in it, the
   * page overlays the keyboard on Chrome (`overlayWhileFocused`), so Chrome
   * neither resizes nor pans the page and the field does the moving.
   */
  overlayFor?: RefObject<Element | null>;
}

/**
 * The window's keyboard layout guide (null while rendering on a server), and
 * a listener called with every keyboard transition while the component is
 * mounted.
 *
 * @example
 * ```
 * const {ref, animator} = useAnimator();
 * useKeyboardLayoutGuide(t => rideKeyboard(animator, {y: -t.to}, t), {overlayFor: ref});
 * ```
 * @experimental
 */
export function useKeyboardLayoutGuide(
  onTransition?: (transition: KeyboardTransition) => void,
  {overlayFor}: UseKeyboardLayoutGuideOptions = {},
): KeyboardLayoutGuide | null {
  const listenerRef = useRef(onTransition);
  useIsomorphicLayoutEffect(() => {
    listenerRef.current = onTransition;
  });
  const guide =
    typeof window === 'undefined' ? null : getKeyboardLayoutGuide(window);
  useIsomorphicLayoutEffect(() => {
    if (guide == null) {
      return undefined;
    }
    return guide.subscribe(transition => {
      listenerRef.current?.(transition);
    });
  }, [guide]);
  // The field registered for the overlay, re-registered when the ref's
  // element changes.
  const overlayRef = useRef<{element: Element; release: () => void} | null>(
    null,
  );
  useIsomorphicLayoutEffect(() => {
    const element = overlayFor?.current ?? null;
    if (overlayRef.current?.element === element) {
      return;
    }
    overlayRef.current?.release();
    overlayRef.current =
      guide != null && element != null
        ? {element, release: guide.overlayWhileFocused(element)}
        : null;
  });
  useIsomorphicLayoutEffect(
    () => () => {
      overlayRef.current?.release();
      overlayRef.current = null;
    },
    [],
  );
  return guide;
}
