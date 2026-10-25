// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useGestureRecognizer.ts
 * @input An element ref, a recognizer factory and a gesture listener
 * @output Exports useGestureRecognizer (usePressTracker lives in
 *   usePressTracker.ts, so a gesture-only component never imports the press
 *   tracker)
 * @position React face of packages/core/src/gestures
 *
 * The recognizer is created once and keeps its identity for the life of the
 * component, so relationships set up at creation (`requireToFail`,
 * `recognizeSimultaneouslyWith`) hold. The listener is read through a ref:
 * passing a new function each render re-attaches nothing, and a gesture
 * costs no React render at all — the listener runs inside the input event
 * and writes to the DOM itself. The recognizer attaches in a layout effect,
 * so its `touch-action` is in place before the browser can see a finger, and
 * re-attaches on any commit that finds another element behind the ref. After
 * unmount neither hook calls the consumer back.
 *
 * SYNC: When modified, update useGestureRecognizer.test.tsx and README.md.
 */

import {useEffect, useMemo, useRef, useState, type RefObject} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {getGestureHost} from './GestureHost';
import type {GestureRecognizer} from './GestureRecognizer';
import {useAttachedElement, useIsUnmountedRef} from './useAttachedElement';

/** @experimental */
export interface UseGestureRecognizerOptions {
  /**
   * Live toggle. Turning it off mid-gesture ends the gesture without calling
   * the listener: the handler that turned it off owns that end. A handler
   * that wants UIKit's `.cancelled` calls `recognizer.setEnabled(false)`
   * itself, which reports it at once. @default true
   */
  isEnabled?: boolean;
  /** Let the host set touch-action (and long-press callout) styles. @default true */
  manageStyle?: boolean;
}

/**
 * Attach a recognizer to the element behind `ref`.
 *
 * @example
 * ```
 * const pan = useGestureRecognizer(
 *   ref,
 *   () => new PanGestureRecognizer({direction: 'vertical'}),
 *   recognizer => {
 *     ref.current.style.transform = `translateY(${recognizer.translation().y}px)`;
 *   },
 * );
 * ```
 * @experimental
 */
export function useGestureRecognizer<R extends GestureRecognizer>(
  ref: RefObject<Element | null>,
  create: () => R,
  onGesture?: (recognizer: R) => void,
  options: UseGestureRecognizerOptions = {},
): R {
  const [recognizer] = useState(create);
  const onGestureRef = useRef(onGesture);
  useIsomorphicLayoutEffect(() => {
    onGestureRef.current = onGesture;
  });
  const {isEnabled = true, manageStyle = true} = options;
  const isUnmountedRef = useIsUnmountedRef();
  // True while the isEnabled sync below runs: the listener stays quiet.
  const isSyncingRef = useRef(false);

  // Synchronizes the consumer's listener with the recognizer (an external
  // object): it runs inside input events, never during a render or an
  // Effect, and goes quiet once the component unmounts.
  useEffect(
    () =>
      recognizer.addListener(current => {
        if (!isUnmountedRef.current && !isSyncingRef.current) {
          onGestureRef.current?.(current);
        }
      }),
    [recognizer, isUnmountedRef],
  );

  // Synchronizes the document's gesture host with the element behind `ref`,
  // whichever element that is at this commit: a node rendered later, or
  // swapped behind the same ref, is attached then.
  useAttachedElement(
    ref,
    element =>
      getGestureHost(element.ownerDocument).attach(element, recognizer, {
        manageStyle,
      }),
    [recognizer, manageStyle],
  );

  // Synchronizes the recognizer's `isEnabled` (UIKit's setter) with the
  // prop. Turning it off mid-gesture ends the gesture, but this Effect calls
  // no consumer callback (architecture:react-component-runtime INV2): the
  // handler that turned it off owns the end, or calls
  // `recognizer.setEnabled(false)` itself to hear `cancelled` from that
  // handler, and then this has nothing left to do.
  useIsomorphicLayoutEffect(() => {
    isSyncingRef.current = true;
    try {
      recognizer.setEnabled(isEnabled);
    } finally {
      isSyncingRef.current = false;
    }
  }, [recognizer, isEnabled]);

  return recognizer;
}
