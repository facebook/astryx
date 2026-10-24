// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file menuSurfaceMotion.ts
 * @input An anchored menu's popover element, the control it hangs off, the
 *   motion foundation (compositor animator, spring math) and the UIKit table
 * @output Exports `menuCollapsedState` (the transform that shrinks the
 *   surface to UIMenu's collapsed square on its anchor), `menuSpring`,
 *   `menuExitDurationMs` and `createMenuSurfaceMotion` (the touch
 *   presentation's open and close)
 * @position Internal to DropdownMenu: the touch presentation of an anchored
 *   menu opens and closes the way UIMenu does
 *
 * UIMenu on iOS 26.2 grows out of a small square centered on its button and
 * collapses back into it (`menu.collapsedSize`): its width and height run on
 * one spring from that square to the menu's size (`springs.menuOpen`, back on
 * `springs.menuClose`), its center travels on the same spring from the
 * button to the menu's center, and its content fades with the same progress.
 *
 * Here the popover element is scaled about a transform origin chosen so that
 * those three hold exactly: at the start the surface is a `collapsedSize`
 * square centered on the anchor, and at any progress p its size is
 * square + (size − square)·p and its center anchor + (center − anchor)·p.
 * Scale about an origin O moves the center to O + (center − O)·s; with
 * s = s₀ + (1 − s₀)·p, choosing O = (anchor − center·s₀) / (1 − s₀) per axis
 * makes that the straight line from the anchor. Only `scale` and `opacity`
 * move, on the compositor (law M1), through the motion foundation's animator,
 * which also reads the presentation value back so a close during the open
 * (or an open during the close) continues from what is on screen with its
 * velocity (M2, M3).
 *
 * The close outlives the popover: the browser hides a popover the moment it
 * closes (a pick, Escape, or its own light dismiss), so the close plays on a
 * static copy of the surface taken as it closes (the layer runtime's
 * `placeLayerExitCopy`) — same place, same size, same
 * inherited theme — that is `inert`, hidden from assistive technology, takes
 * no pointer events, and is removed when the spring settles. Nothing on the
 * main thread runs per frame while it collapses (a discrete `display`
 * transition would restyle the element every frame).
 *
 * Under Reduce Motion (the web's preference is UIKit's Reduce Motion with
 * Prefer Cross-Fade Transitions) the animator substitutes a cross-fade: the
 * menu lands at its size and fades in, and fades out where it is, on
 * `springs.menuReducedMotion`.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/DropdownMenu/menuSurfaceMotion.test.ts
 * - /packages/core/src/DropdownMenu/DropdownMenu.tsx
 */

import {
  createAnimator,
  type Animator,
  type AnimatorOptions,
  type MotionHandle,
} from '../motion/animator';
import {
  settlingDuration,
  toSpring,
  type SpringDescription,
} from '../motion/spring';
import {menu, springs} from '../motion/uikit';
import {placeLayerExitCopy} from '../Layer/layerExitCopy';

/** A box in viewport px. */
export interface MenuSurfaceRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Where the menu sits and where it grows from, in viewport px. */
export interface MenuSurfaceGeometry {
  /** The popover element's border box once positioned, at full size. */
  surface: MenuSurfaceRect;
  /** The point the menu grows out of: the center of its control. */
  anchor: {x: number; y: number};
}

/** The collapsed transform: scale factors and the origin they act about. */
export interface MenuCollapsedState {
  scaleX: number;
  scaleY: number;
  /** Transform origin, px from the surface's top-left corner. */
  originX: number;
  originY: number;
}

/** Marks the static copy the close plays on. */
export const MENU_EXIT_GHOST_ATTRIBUTE = 'data-astryx-menu-exit';

/**
 * The transform that shows the surface as UIMenu's collapsed square centered
 * on the anchor, about an origin that keeps every later frame of the scale on
 * UIKit's path (see the file header). `null` when the surface is no larger
 * than the square, where there is nothing to grow.
 */
export function menuCollapsedState(
  {surface, anchor}: MenuSurfaceGeometry,
  collapsedSize: number = menu.collapsedSize,
): MenuCollapsedState | null {
  if (surface.width <= collapsedSize || surface.height <= collapsedSize) {
    return null;
  }
  const scaleX = collapsedSize / surface.width;
  const scaleY = collapsedSize / surface.height;
  const anchorX = anchor.x - surface.left;
  const anchorY = anchor.y - surface.top;
  return {
    scaleX,
    scaleY,
    originX: (anchorX - (surface.width / 2) * scaleX) / (1 - scaleX),
    originY: (anchorY - (surface.height / 2) * scaleY) / (1 - scaleY),
  };
}

/**
 * The spring that times the open or the close: UIKit's menu springs, or the
 * cross-fade's under Reduce Motion.
 */
export function menuSpring(
  direction: 'open' | 'close',
  prefersReducedMotion: boolean,
): SpringDescription {
  if (prefersReducedMotion) {
    return springs.menuReducedMotion;
  }
  return direction === 'open' ? springs.menuOpen : springs.menuClose;
}

/** How long the close stays on screen, in ms. */
export function menuExitDurationMs(prefersReducedMotion: boolean): number {
  return Math.ceil(
    settlingDuration(toSpring(menuSpring('close', prefersReducedMotion))) *
      1000,
  );
}

/** Reduce Motion: a cross-fade on the menu's own spring, as UIKit's. */
const REDUCED_MOTION = {crossfade: springs.menuReducedMotion} as const;

export interface MenuSurfaceMotion {
  /**
   * The menu has just opened in its touch presentation: grow it out of its
   * anchor. `measure` reads the geometry; it runs with the element at its
   * full size (layout reads see the scaled box otherwise). During a close,
   * the menu grows back from where the close has it, about the same origin.
   */
  enter(measure: () => MenuSurfaceGeometry): void;
  /**
   * The menu is closing (its `beforetoggle` to closed, while it is still
   * shown): collapse it into its anchor. Does nothing unless the last open
   * was a touch presentation.
   */
  exit(): void;
  /**
   * The menu opened in a presentation that does not use this motion: leave
   * the element exactly as the component styles it.
   */
  reset(): void;
  /** Cancels everything and restores the element. */
  dispose(): void;
}

const MOTION_STYLE_PROPERTIES = [
  'scale',
  'opacity',
  'transform-origin',
  'animation-name',
] as const;

function defaultPrefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function createMenuSurfaceMotion(
  element: HTMLElement,
  options: Pick<AnimatorOptions, 'now' | 'prefersReducedMotion'> = {},
): MenuSurfaceMotion {
  const prefersReducedMotion =
    options.prefersReducedMotion ?? defaultPrefersReducedMotion;
  const animator: Animator = createAnimator(element, {
    now: options.now,
    prefersReducedMotion,
  });
  // The collapsed state of the open in progress or last played; null while
  // the menu is in a presentation this motion does not drive.
  let collapsed: MenuCollapsedState | null = null;
  // The geometry the open measured, and whether its spring is still running
  // (the element's box then includes a scale only the animation knows).
  let measured: MenuSurfaceGeometry | null = null;
  let openHandle: MotionHandle | null = null;
  // The close in progress: its copy and the copy's animator.
  let exiting: {ghost: HTMLElement; animator: Animator} | null = null;

  const endExit = () => {
    if (exiting == null) {
      return;
    }
    exiting.animator.dispose();
    exiting.ghost.remove();
    exiting = null;
  };

  const enter = (measure: () => MenuSurfaceGeometry) => {
    const resumed = exiting != null && collapsed != null ? exiting : null;
    let from: {
      scaleX: number;
      scaleY: number;
      opacity: number;
      velocity: {scaleX: number; scaleY: number; opacity: number};
    } | null = null;
    if (resumed != null) {
      // Reopened during the close: continue from the frame on screen.
      const {animator: closing} = resumed;
      from = {
        scaleX: closing.get('scaleX'),
        scaleY: closing.get('scaleY'),
        opacity: closing.get('opacity'),
        velocity: {
          scaleX: closing.getVelocity('scaleX'),
          scaleY: closing.getVelocity('scaleY'),
          opacity: closing.getVelocity('opacity'),
        },
      };
    }
    endExit();
    if (from == null) {
      // Full size and invisible for the read: the element's box must not
      // include a scale left over from the last close, nor the first
      // keyframe of the layer's CSS entrance (which belongs to the pointer
      // presentation and which WebKit's box reads include). Nothing paints
      // before the open below replaces these values.
      element.style.setProperty('animation-name', 'none');
      animator.set({scaleX: 1, scaleY: 1, opacity: 0});
    }
    // A close in progress keeps its origin, so the open continues from the
    // frame on screen instead of jumping to a new pivot.
    const geometry = from != null && measured != null ? measured : measure();
    const next = from != null ? collapsed : menuCollapsedState(geometry);
    if (next == null) {
      reset();
      return;
    }
    collapsed = next;
    measured = geometry;
    // The layer's own CSS entrance belongs to the pointer presentation.
    element.style.setProperty('animation-name', 'none');
    element.style.setProperty(
      'transform-origin',
      `${next.originX}px ${next.originY}px`,
    );
    if (from == null) {
      animator.set({scaleX: next.scaleX, scaleY: next.scaleY, opacity: 0});
    } else {
      animator.set({
        scaleX: from.scaleX,
        scaleY: from.scaleY,
        opacity: from.opacity,
      });
    }
    const handle = animator.animate(
      {scaleX: 1, scaleY: 1, opacity: 1},
      {
        spring: springs.menuOpen,
        ...(from != null ? {velocity: from.velocity} : null),
      },
      REDUCED_MOTION,
    );
    openHandle = handle;
    void handle.finished.then(() => {
      if (openHandle === handle) {
        openHandle = null;
      }
    });
  };

  const exit = () => {
    const target = collapsed;
    if (target == null || exiting != null) {
      return;
    }
    // The surface at full size where it stands: the open's own measurement
    // while its spring runs, the element's box once it has settled.
    let box: MenuSurfaceRect;
    if (openHandle != null && measured != null) {
      box = measured.surface;
    } else {
      const rect = element.getBoundingClientRect();
      box = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      };
    }
    const presented = {
      scaleX: animator.get('scaleX'),
      scaleY: animator.get('scaleY'),
      opacity: animator.get('opacity'),
    };
    const velocity = {
      scaleX: animator.getVelocity('scaleX'),
      scaleY: animator.getVelocity('scaleY'),
      opacity: animator.getVelocity('opacity'),
    };
    openHandle = null;
    const ghost = placeLayerExitCopy(element, box, MENU_EXIT_GHOST_ATTRIBUTE);
    ghost.style.setProperty(
      'transform-origin',
      `${target.originX}px ${target.originY}px`,
    );
    const closing = createAnimator(ghost, {
      now: options.now,
      prefersReducedMotion,
    });
    closing.set(presented);
    const handle = closing.animate(
      {scaleX: target.scaleX, scaleY: target.scaleY, opacity: 0},
      {spring: springs.menuClose, velocity},
      REDUCED_MOTION,
    );
    exiting = {ghost, animator: closing};
    // The element itself is hidden by the browser now; leave it at rest.
    animator.set({scaleX: 1, scaleY: 1, opacity: 1});
    void handle.finished.then(finished => {
      if (finished && exiting?.ghost === ghost) {
        endExit();
      }
    });
  };

  const reset = () => {
    collapsed = null;
    measured = null;
    openHandle = null;
    endExit();
    animator.set({scaleX: 1, scaleY: 1, opacity: 1});
    for (const property of MOTION_STYLE_PROPERTIES) {
      element.style.removeProperty(property);
    }
  };

  return {
    enter,
    exit,
    reset,
    dispose() {
      reset();
      animator.dispose();
    },
  };
}
