// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file usePopoverSurfaceMotion.ts
 * @input React, the shared touch resolver and popoverSurfaceMotion
 * @output Exports `usePopoverSurfaceMotion`: the call Popover makes as it
 *   opens, which presents the popover the UIKit way under a finger and
 *   leaves the layer's own entrance to a mouse
 * @position Internal to Popover; glue between the component and
 *   popoverSurfaceMotion.ts
 *
 * The decision is taken as the popover opens, from the shared touch resolver:
 * under a finger (a coarse primary pointer, on any touch device) the popover
 * grows out of its source and, when it closes (its `beforetoggle` to closed,
 * while it is still shown), shrinks back into it. A fine primary pointer keeps
 * the layer's entrance and the theme's motion tokens (spec:AST-094 FR31).
 * The motion is created for
 * the popover element the first time it opens and follows it if the element
 * is replaced.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Popover/Popover.tsx
 * - /packages/core/src/Popover/Popover.test.tsx
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import {createPresentationHold} from '../Layer/presentationHold';
import {TOUCH_QUERY} from '../utils/touchPresentation';
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

/**
 * Returns `present(layer, source)`, to call as the popover opens (right after
 * the browser shows it, before it paints).
 */
export function usePopoverSurfaceMotion(): (
  layer: HTMLElement | null,
  source: HTMLElement | null,
) => void {
  const motionRef = useRef<{
    element: HTMLElement;
    motion: PopoverSurfaceMotion;
    detach: () => void;
  } | null>(null);
  // Whether the presentation in progress is the touch one, held from the
  // open until its close begins (Layer/presentationHold).
  const [touchHold] = useState(() => createPresentationHold<boolean>());

  const motionFor = useCallback(
    (element: HTMLElement) => {
      const current = motionRef.current;
      if (current?.element === element) {
        return current.motion;
      }
      current?.detach();
      const motion = createPopoverSurfaceMotion(element);
      const handleBeforeToggle = (event: Event) => {
        if (
          (event as ToggleEvent).newState === 'closed' &&
          touchHold.current() === true
        ) {
          motion.exit();
        }
        if ((event as ToggleEvent).newState === 'closed') {
          touchHold.release();
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
    },
    [touchHold],
  );

  // Releases what the motion holds on the popover element when the
  // component unmounts: its `beforetoggle` listener, its compositor
  // animations and any exit copy still on screen.
  useEffect(
    () => () => {
      motionRef.current?.detach();
      motionRef.current = null;
    },
    [],
  );

  return useCallback(
    (layer: HTMLElement | null, source: HTMLElement | null) => {
      if (layer == null) {
        return;
      }
      const view = layer.ownerDocument.defaultView;
      const isTouch =
        source != null &&
        typeof view?.matchMedia === 'function' &&
        view.matchMedia(TOUCH_QUERY).matches;
      touchHold.take(isTouch);
      if (!isTouch || source == null) {
        // A fine pointer animates nothing here, so nothing is created for
        // it: no `beforetoggle` listener that outlives the open, and no
        // compositor promotion or its timer (spec:AST-094 FR24). A motion
        // this layer already has (the pointer changed, or a touch
        // presentation is on screen) is released with its listener.
        motionRef.current?.detach();
        motionRef.current = null;
        return;
      }
      motionFor(layer).enter(() => ({
        surface: boxOf(layer),
        source: boxOf(source),
      }));
    },
    [motionFor],
  );
}
