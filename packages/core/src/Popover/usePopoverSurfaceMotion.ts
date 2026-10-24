// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file usePopoverSurfaceMotion.ts
 * @input React, the shared touch resolver and popoverSurfaceMotion
 * @output Exports `usePopoverSurfaceMotion`: the call Popover makes as it
 *   opens, which presents the popover the UIKit way in the iOS idiom and
 *   leaves the layer's own entrance to a mouse and to other touch screens,
 *   and whether the popover is under a finger
 * @position Internal to Popover; glue between the component and
 *   popoverSurfaceMotion.ts
 *
 * The decision is taken as the popover opens, from the shared touch resolver's
 * idiom: in the iOS idiom (WebKit on iOS or iPadOS under a finger) the
 * popover grows out of its source and, when it closes (its `beforetoggle` to
 * closed, while it is still shown), shrinks back into it. A mouse, and a
 * finger outside iOS (Android, which has no such popover), keep the layer's
 * entrance and the theme's motion tokens (D-01). The motion is created for
 * the popover element the first time it opens and follows it if the element
 * is replaced.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Popover/Popover.tsx
 * - /packages/core/src/Popover/Popover.test.tsx
 */

import {useCallback, useEffect, useMemo, useRef} from 'react';
import {readTouchPresentation} from '../utils/touchPresentation';
import {
  createPopoverSurfaceMotion,
  type PopoverSurfaceMotion,
  type PopoverSurfaceRect,
} from './popoverSurfaceMotion';

function boxOf(element: Element): PopoverSurfaceRect {
  const rect = element.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

export interface PopoverSurfaceMotionControls {
  /**
   * To call as the popover opens (right after the browser shows it, before
   * it paints): presents it the iOS way or leaves the layer's entrance.
   */
  present: (layer: HTMLElement | null, source: HTMLElement | null) => void;
  /** Whether the open popover is under a finger, on any platform. */
  isTouchPresentation: () => boolean;
}

export function usePopoverSurfaceMotion(): PopoverSurfaceMotionControls {
  const motionRef = useRef<{
    element: HTMLElement;
    motion: PopoverSurfaceMotion;
    detach: () => void;
  } | null>(null);
  // Whether the presentation in progress is the iOS one.
  const isIosPresentationRef = useRef(false);
  // Whether the open popover is under a finger, on any platform: a pan that
  // starts outside it dismisses it (usePanOutsideDismiss).
  const isTouchRef = useRef(false);

  const motionFor = useCallback((element: HTMLElement) => {
    const current = motionRef.current;
    if (current?.element === element) {
      return current.motion;
    }
    current?.detach();
    const motion = createPopoverSurfaceMotion(element);
    const handleBeforeToggle = (event: Event) => {
      if (
        (event as ToggleEvent).newState === 'closed' &&
        isIosPresentationRef.current
      ) {
        motion.exit();
      }
    };
    element.addEventListener('beforetoggle', handleBeforeToggle);
    motionRef.current = {
      element,
      motion,
      detach: () => {
        element.removeEventListener('beforetoggle', handleBeforeToggle);
        motion.dispose();
      },
    };
    return motion;
  }, []);

  useEffect(
    () => () => {
      motionRef.current?.detach();
      motionRef.current = null;
    },
    [],
  );

  const present = useCallback(
    (layer: HTMLElement | null, source: HTMLElement | null) => {
      if (layer == null) {
        return;
      }
      const presentation = readTouchPresentation(
        layer.ownerDocument.defaultView,
      );
      isTouchRef.current = presentation.isTouch;
      const isIos = source != null && presentation.idiom === 'ios';
      isIosPresentationRef.current = isIos;
      const motion = motionFor(layer);
      if (!isIos || source == null) {
        motion.reset();
        return;
      }
      motion.enter(() => ({surface: boxOf(layer), source: boxOf(source)}));
    },
    [motionFor],
  );
  const isTouchPresentation = useCallback(() => isTouchRef.current, []);
  return useMemo(
    () => ({present, isTouchPresentation}),
    [present, isTouchPresentation],
  );
}
