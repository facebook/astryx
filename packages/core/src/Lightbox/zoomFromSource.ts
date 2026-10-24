// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file zoomFromSource.ts
 * @input The viewer's container, its zoom stage, a source element (the
 *   thumbnail a photo came from) and the viewer's fading layers
 * @output Exports `zoomFromSource` (UIKit's zoom transition between a source
 *   element and the viewer's photo, opening or closing, on the compositor),
 *   `sourceBoxOf` and `showSourcePortal`
 * @position Lightbox's transition driver (internal); the geometry and the
 *   curves are motion/zoomTransition.ts
 *
 * Two portals, as UIKit's `.zoom`: the photo itself (the detail) grows from
 * the source's width to its fitted box and fades in, while a copy of the
 * source's picture (aspect fill in the source's box) grows with it and fades
 * out; closing runs the reverse onto the photo's current box. The backdrop
 * and the controls fade with the progress. The source is hidden while its
 * picture flies. Under Reduce Motion the photo cross-fades in place and no
 * portal flies (motion/zoomTransition.ts `ZOOM_REDUCED_MOTION`).
 *
 * SYNC: When modified, update Lightbox.tsx and
 * __tests__/LightboxZoomTransition.interaction.browser.spec.ts.
 */

import {animatorFor, type Animator, type MotionCurve} from '../motion/animator';
import {
  ZOOM_REDUCED_MOTION,
  zoomCloseProgress,
  zoomElementCurves,
  zoomOpenProgress,
  type Rect,
} from '../motion/zoomTransition';
import type {ZoomStage} from './useZoomStage';

/** The source's box in client px, or null when it is gone or off screen. */
export function sourceBoxOf(source: HTMLElement | null): Rect | null {
  if (source == null || !source.isConnected) {
    return null;
  }
  const rect = source.getBoundingClientRect();
  const view = source.ownerDocument.defaultView;
  if (
    rect.width <= 0 ||
    rect.height <= 0 ||
    (view != null &&
      (rect.bottom < 0 ||
        rect.right < 0 ||
        rect.top > view.innerHeight ||
        rect.left > view.innerWidth))
  ) {
    return null;
  }
  return {x: rect.left, y: rect.top, width: rect.width, height: rect.height};
}

/** The picture a source shows: an image's own, or the first one inside it. */
function pictureOf(source: HTMLElement, fallback: string): string {
  const image =
    source instanceof HTMLImageElement ? source : source.querySelector('img');
  return image?.currentSrc || image?.src || fallback;
}

/**
 * Shows the source's picture in its box in the viewer, under the photo
 * (aspect fill, its corners): the portal a closing transition lands on and a
 * dismissed photo shrinks into. Returns it; the caller removes it.
 */
export function showSourcePortal(
  container: HTMLElement,
  source: HTMLElement,
  box: Rect,
  fallbackSrc: string,
): HTMLImageElement {
  const portal = container.ownerDocument.createElement('img');
  portal.src = pictureOf(source, fallbackSrc);
  portal.alt = '';
  portal.setAttribute('aria-hidden', 'true');
  portal.setAttribute('data-lightbox-portal', '');
  const origin = container.getBoundingClientRect();
  const view = container.ownerDocument.defaultView;
  const radius = view?.getComputedStyle(source).borderRadius ?? '0px';
  Object.assign(portal.style, {
    position: 'absolute',
    left: `${box.x - origin.left}px`,
    top: `${box.y - origin.top}px`,
    width: `${box.width}px`,
    height: `${box.height}px`,
    margin: '0',
    objectFit: 'cover',
    borderRadius: radius,
    transformOrigin: '0 0',
    pointerEvents: 'none',
    // Under the photo, as UIKit stacks the source's portal under the
    // detail's: the photo fading in covers the picture fading out.
    zIndex: '-1',
  });
  container.appendChild(portal);
  return portal;
}

function prefersReducedMotion(view: Window | null): boolean {
  return (
    view != null &&
    typeof view.matchMedia === 'function' &&
    view.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export interface ZoomFromSourceOptions {
  kind: 'open' | 'close';
  source: HTMLElement;
  container: HTMLElement;
  stage: ZoomStage;
  /** The backdrop's and the controls' animators: they fade with it. */
  fades: Animator[];
  /** The photo's own picture, for a source that shows none. */
  src: string;
}

/**
 * Runs the zoom transition; resolves once the photo is at rest (open) or in
 * the source (close). Null when there is nothing to zoom from or into (no
 * source box, or no photo laid out): the caller opens or closes at once.
 */
export function zoomFromSource({
  kind,
  source,
  container,
  stage,
  fades,
  src,
}: ZoomFromSourceOptions): Promise<void> | null {
  const sourceBox = sourceBoxOf(source);
  const fitted = stage.fittedBox();
  const detail = kind === 'open' ? fitted : stage.shownBox();
  if (sourceBox == null || fitted == null || detail == null) {
    return null;
  }
  const geometry = {source: sourceBox, detail, align: 'center' as const};
  const close = zoomCloseProgress();
  const frame = kind === 'open' ? zoomOpenProgress() : close.frame;
  const fade = kind === 'open' ? frame : close.fade;
  const reduced = prefersReducedMotion(container.ownerDocument.defaultView);
  const handle = stage.play(
    zoomElementCurves(geometry, fitted, 'detail', frame, fade),
    kind === 'open'
      ? ZOOM_REDUCED_MOTION.detail
      : {...ZOOM_REDUCED_MOTION.detail, crossfadeAs: 'exit'},
  );
  let portal: HTMLImageElement | null = null;
  if (!reduced) {
    portal = showSourcePortal(container, source, sourceBox, src);
    animatorFor(portal).play(
      zoomElementCurves(geometry, sourceBox, 'source', frame, fade),
      {reducedMotion: 'keep'},
    );
  }
  const opacity: MotionCurve = {
    duration: fade.duration,
    at: t => Math.min(1, Math.max(0, fade.at(t))),
    velocity: t => fade.velocity(t),
  };
  for (const animator of fades) {
    animator.play({opacity}, {reducedMotion: 'keep'});
  }
  const visibility = source.style.visibility;
  source.style.visibility = 'hidden';
  return handle.finished
    .then(() => undefined)
    .finally(() => {
      source.style.visibility = visibility;
      portal?.remove();
    });
}
