// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useKeyboardLayoutGuide.ts
 * @input React, getKeyboardLayoutGuide
 * @output Exports useKeyboardLayoutGuide: the window's keyboard layout guide,
 *   with a listener called for every keyboard transition while the component
 *   is mounted
 * @position React entry to the keyboard layout guide; exported from the
 *   `@astryxdesign/core/keyboard/experimental` subpath
 *
 * The listener is read through a ref, so passing a new function on each
 * render subscribes nothing new, and a transition never causes a render:
 * move elements from the listener with an animator.
 *
 * SYNC: When modified, update /packages/core/src/keyboard/README.md and
 * /packages/core/src/keyboard/useKeyboardLayoutGuide.doc.mjs
 */

import {useRef} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {
  getKeyboardLayoutGuide,
  type KeyboardLayoutGuide,
} from './keyboardLayoutGuide';
import type {KeyboardTransition} from './keyboardModel';

/**
 * The window's keyboard layout guide (null while rendering on a server), and
 * a listener called with every keyboard transition while the component is
 * mounted.
 *
 * @example
 * ```
 * const {ref, animator} = useAnimator();
 * useKeyboardLayoutGuide(t => {
 *   animator.animate({y: -t.to}, {spring: uikit.springs.keyboard}, {at: t.start, reducedMotion: 'keep'});
 * });
 * ```
 * @experimental
 */
export function useKeyboardLayoutGuide(
  onTransition?: (transition: KeyboardTransition) => void,
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
  return guide;
}
