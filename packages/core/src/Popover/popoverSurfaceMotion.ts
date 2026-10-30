// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file popoverSurfaceMotion.ts
 * @input A Popover's layer element, the source it hangs off, the motion
 *   foundation (compositor animator, spring math), the UIKit table and the
 *   layer runtime's exit copy and input hold
 * @output Exports `popoverCollapsedState` (where the popover meets its source
 *   and the shape it grows from), `popoverFrame` (the transform and opacity
 *   at a progress of the spring), `POPOVER_EXIT_COPY_ATTRIBUTE`,
 *   `createPopoverSurfaceMotion` (the touch
 *   presentation's present and dismiss)
 * @position Internal to Popover: under a finger the popover is presented
 *   and dismissed the way UIPopoverPresentationController does it
 *
 * On iOS 26.2 a popover grows out of the point where it meets its source: the
 * bottom centre of the source for a popover below it. Its scale (from
 * `popover.collapsedScale`), its length away from the source (from
 * `popover.collapsedLengthPx` to its own) and its opacity run on one spring,
 * `POPOVER_PRESENT_SPRING`, with the edge that meets the source held in
 * place. The dismissal runs the same path back into that point on
 * `POPOVER_DISMISS_SPRING`.
 *
 * That is the rect morph's `edgeGrowPath` (motion/rectMorph.ts): across the
 * source's edge the scale is s = s₀ + (1 − s₀)·p; along the axis away from
 * the source it is s·f with f = f₀ + (1 − f₀)·p, the length's share of the
 * full length, which is UIKit's box growing while it scales. The morph plays
 * it on the compositor (law M1), and a dismissal during the presentation (or
 * a presentation during the dismissal) continues from the frame on screen,
 * in the same scale and length, with its velocity (M2, M3).
 *
 * Measured for a popover below its source; one above or beside it runs the
 * same motion turned toward its source (M-PO1 confirms it). The point it
 * grows out of is the source's centre on that edge, kept on the popover.
 *
 * The dismissal outlives the popover: the browser hides a popover as it
 * closes, so it plays on the layer runtime's exit copy (`placeLayerExitCopy`),
 * removed when its motion ends.
 *
 * Under Reduce Motion the animator's policy applies (design:reduced-motion):
 * on a coarse pointer the popover neither grows nor springs, it lands at its
 * full size and cross-fades in, and out where it stands, opacity only, in
 * `timing.reducedMotionCrossFadeMs`; on any other pointer it changes at once.
 * UIKit itself fades a popover on its presentation springs, about half a
 * second; the current record caps a touch cross-fade at 200 ms.
 *
 * UIKit ignores every touch while the popover is presented: a tap outside
 * 60 ms in neither dismisses it nor reaches what is under it, and the
 * presentation finishes. The browser's light dismiss cannot be cancelled from
 * an event, so the presentation runs under the layer runtime's own hold
 * (`holdInput`, scope `viewport`), the one the Layer module places for
 * every component whose layer presents under a finger: its shield covers the
 * viewport from inside the layer until the present spring settles, so a tap
 * on it is a tap inside the popover, which the browser leaves open, and a
 * pinch on it still zooms the page.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Popover/popoverSurfaceFrame.ts
 * - /packages/core/src/Popover/popoverSurfaceMotion.test.ts
 * - /packages/core/src/Popover/Popover.tsx
 */

import type {AnimatorOptions, MotionHandle} from '../motion/animator';
import {
  createRectMorph,
  edgeGrowPath,
  type MorphPath,
} from '../motion/rectMorph';
import {
  POPOVER_DISMISS_SPRING,
  POPOVER_PRESENT_SPRING,
} from '../motion/uikit/springs';
import {placeLayerExitCopy} from '../Layer/layerExitCopy';
import {holdInput} from '../Layer/inputHold';
import {
  popoverCollapsedState,
  type PopoverCollapsedState,
  type PopoverSurfaceGeometry,
  type PopoverSurfaceRect,
} from './popoverSurfaceFrame';

export {popoverCollapsedState, popoverFrame} from './popoverSurfaceFrame';
export type {
  PopoverCollapsedState,
  PopoverFrame,
  PopoverSurfaceGeometry,
  PopoverSurfaceRect,
} from './popoverSurfaceFrame';

/** Marks the static copy the dismissal plays on. */
export const POPOVER_EXIT_COPY_ATTRIBUTE = 'data-astryx-popover-exit';

/** The presentation's path: UIKit's edge growth on the surface's box. */
function pathOf(
  surface: PopoverSurfaceRect,
  state: PopoverCollapsedState,
): MorphPath {
  return edgeGrowPath({
    box: {
      x: surface.left,
      y: surface.top,
      width: surface.width,
      height: surface.height,
    },
    origin: {x: state.originX, y: state.originY},
    axis: state.axis,
    collapsedScale: state.scale,
    collapsedLength: state.length,
  });
}

export interface PopoverSurfaceMotion {
  /**
   * The popover has just been shown in its touch presentation: grow it out
   * of its source. `measure` reads the geometry; it runs with the element at
   * its full size. During a dismissal, the popover grows back from where the
   * dismissal has it, about the same point.
   */
  enter(measure: () => PopoverSurfaceGeometry): void;
  /**
   * The popover is closing (its `beforetoggle` to closed, while it is still
   * shown): shrink it back into its source. Does nothing unless the last
   * presentation was a touch one.
   */
  exit(): void;
  /**
   * The popover opened in a presentation that does not use this motion:
   * leave the element exactly as the component styles it.
   */
  reset(): void;
  /** Cancels everything and restores the element. */
  dispose(): void;
}

export function createPopoverSurfaceMotion(
  element: HTMLElement,
  options: Pick<AnimatorOptions, 'now'> = {},
): PopoverSurfaceMotion {
  // The popover's two springs are this component's measured values, not
  // motion roles (touch motion stays internal, spec:AST-094 DEC-11): they
  // play as given, so no table is registered and no other row is bundled.
  const morph = createRectMorph(element, options);
  // The presentation in progress or last played, and the geometry it
  // measured; null while the popover is in a presentation this motion does
  // not drive.
  let collapsed: PopoverCollapsedState | null = null;
  let measured: PopoverSurfaceGeometry | null = null;
  let presentHandle: MotionHandle | null = null;
  let dismissHandle: MotionHandle | null = null;
  // Releases the hold that takes every touch while the presentation runs.
  let holdRelease: (() => void) | null = null;

  const releaseHold = () => {
    holdRelease?.();
    holdRelease = null;
  };

  const reset = () => {
    collapsed = null;
    measured = null;
    presentHandle = null;
    dismissHandle = null;
    releaseHold();
    morph.reset();
    element.style.removeProperty('animation-name');
  };

  const enter = (measure: () => PopoverSurfaceGeometry) => {
    // Presented again during the dismissal: the morph continues from the
    // copy's frame on screen, about the same point.
    const resumed = dismissHandle != null && collapsed != null;
    if (!resumed || measured == null) {
      // At full size for the read: no transform left from the last
      // dismissal, nor the first keyframe of the layer's CSS entrance (which
      // belongs to the pointer presentation). Nothing paints before the
      // present below replaces it.
      element.style.setProperty('animation-name', 'none');
      if (!resumed) {
        morph.reset();
      }
      measured = measure();
      collapsed = popoverCollapsedState(measured);
    }
    // The layer's own CSS entrance belongs to the pointer presentation.
    element.style.setProperty('animation-name', 'none');
    // Under Reduce Motion the animator lands the growth at once and fades
    // the opacity in (design:reduced-motion).
    const handle = morph.present(
      pathOf(measured.surface, collapsed!),
      POPOVER_PRESENT_SPRING,
    );
    dismissHandle = null;
    presentHandle = handle;
    // No touch reaches the page, or dismisses the popover, until it is in.
    releaseHold();
    holdRelease = holdInput(element, {until: handle, scope: 'viewport'});
    void handle.finished.then(() => {
      if (presentHandle === handle) {
        presentHandle = null;
        releaseHold();
      }
    });
  };

  const exit = () => {
    releaseHold();
    const state = collapsed;
    if (state == null || measured == null || dismissHandle != null) {
      return;
    }
    // The surface at full size where it stands: the presentation's own
    // measurement while it runs, the element's box once it has settled.
    let box: PopoverSurfaceRect = measured.surface;
    if (presentHandle == null) {
      // Settled: the element stands as laid out, maybe moved since.
      morph.reset();
      const rect = element.getBoundingClientRect();
      box = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      };
    }
    presentHandle = null;
    // The copy stands where the surface is drawn, the morph's frame included
    // (the layer runtime's shared exit copy, INV14).
    const copy = placeLayerExitCopy(element, POPOVER_EXIT_COPY_ATTRIBUTE);
    if (copy == null) {
      // No top layer for a copy: the close is immediate.
      morph.reset();
      return;
    }
    // Under Reduce Motion the copy fades out where it stands, then lands.
    // The morph takes the copy away when its motion ends.
    const handle = morph.dismiss(pathOf(box, state), POPOVER_DISMISS_SPRING, {
      target: copy,
    });
    dismissHandle = handle;
    void handle.finished.then(() => {
      if (dismissHandle === handle) {
        dismissHandle = null;
      }
    });
  };

  return {
    enter,
    exit,
    reset,
    dispose() {
      reset();
      morph.dispose();
    },
  };
}
