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
 *   curves are zoomTransition.ts
 *
 * Two portals, as UIKit's `.zoom`: the photo itself (the detail) grows from
 * the source's width to its fitted box and fades in, while a copy of the
 * source's picture (aspect fill in the source's box) grows with it and fades
 * out; closing runs the reverse onto the photo's current box. The backdrop
 * and the controls fade with the progress. The source is hidden while its
 * picture flies, until the last transition holding it ends (a close can
 * interrupt the opening). Under Reduce Motion the animator's default applies
 * (design:reduced-motion): the photo fades in place on a touch screen and
 * shows at once otherwise, no portal flies and the source stays shown. An
 * opening may aim at where the photo is about to rest: a gallery page the
 * pager lands before the first frame (`offset`).
 *
 * SYNC: When modified, update Lightbox.tsx and
 * __tests__/LightboxZoomTransition.interaction.browser.spec.ts.
 */

import {animatorFor, type Animator, type MotionCurve} from '../motion/animator';
import {resolveMotion} from '../motion/resolveMotion';
import {zoomMedia} from '../motion/uikit/zoomMedia';
import {
  zoomCloseProgress,
  zoomElementCurves,
  zoomOpenProgress,
  type Rect,
} from './zoomTransition';
import {firstValues, type ZoomStage} from './useZoomCore';

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

/**
 * Sources hidden by a running transition. A close that interrupts the
 * opening holds the same source while the opening lets go of it, so the
 * source shows again only when the last transition holding it ends, with the
 * visibility it had before the first one.
 */
const hiddenSources = new WeakMap<
  HTMLElement,
  {holders: number; visibility: string}
>();

/**
 * Hides the source while its picture flies (or a dismissed photo lies on
 * it); the returned call lets go.
 */
export function hideSource(source: HTMLElement): () => void {
  const held = hiddenSources.get(source);
  if (held == null) {
    hiddenSources.set(source, {
      holders: 1,
      visibility: source.style.visibility,
    });
    source.style.visibility = 'hidden';
  } else {
    held.holders += 1;
  }
  let released = false;
  return () => {
    const entry = hiddenSources.get(source);
    if (released || entry == null) {
      return;
    }
    released = true;
    entry.holders -= 1;
    if (entry.holders === 0) {
      hiddenSources.delete(source);
      source.style.visibility = entry.visibility;
    }
  };
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
  /**
   * Aborts the transition (the viewer unmounted mid-flight): the source
   * shows again and the portal goes at once.
   */
  signal?: AbortSignal;
  /**
   * How far the photo's page still moves before the first frame, along the
   * pager (px): a gallery opened on a page the pager lands at its new width
   * in the same frame. The opening aims at where the photo will rest.
   * @default 0
   */
  offset?: number;
}

/** Openings in flight, by container: a close turns them around. */
const openings = new WeakMap<
  HTMLElement,
  {
    source: HTMLElement;
    /** Its curves have started (two frames after its presented start). */
    started: boolean;
    /** The portal it plays, which a close turning it around takes over. */
    owned: {portal: HTMLImageElement | null};
  }
>();

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
  signal,
  offset = 0,
}: ZoomFromSourceOptions): Promise<void> | null {
  // A close during the opening turns it around from where it shows, on the
  // opening's geometry, as UIKit's interruptible transition does: an additive
  // retarget keeps the opening's curves going and adds the close's change on
  // top, so whichever frame first shows it, nothing steps back. An opening
  // whose curves have not started yet still shows its first values: the close
  // starts from there.
  const opening = kind === 'close' ? openings.get(container) : undefined;
  const turning = opening?.started === true && opening.source === source;
  const sourceBox = sourceBoxOf(source);
  const measured = stage.fittedBox();
  const fitted =
    measured != null && offset !== 0
      ? {...measured, x: measured.x + offset}
      : measured;
  const detail = kind === 'open' || turning ? fitted : stage.shownBox();
  if (sourceBox == null || fitted == null || detail == null) {
    return null;
  }
  const geometry = {source: sourceBox, detail, align: 'center' as const};
  // The transition's springs: the table's internal constants.
  const close = zoomCloseProgress({
    spring: resolveMotion(container, zoomMedia.transition.closeSpring),
    fadeSpring: resolveMotion(container, zoomMedia.transition.closeFadeSpring),
  });
  const frame =
    kind === 'open'
      ? zoomOpenProgress({
          spring: resolveMotion(container, zoomMedia.transition.openSpring),
        })
      : close.frame;
  const fade = kind === 'open' ? frame : close.fade;
  // Under Reduce Motion the animator turns the zoom into a fade in place
  // (or an instant change): nothing flies out of the source.
  const reduced = animatorFor(container).reducedMotion() !== 'off';
  // The opening starts on a presented frame (spec:AST-094 FR5): opened in
  // the task that shows its dialog, its first frame can come late (WebKit
  // builds the new top layer: 60–180 ms measured in iOS Safari), and curves
  // started before it would skip ahead. Until they start, each element shows
  // its curve's first value.
  const start =
    kind === 'open' && !reduced ? ('presented' as const) : undefined;
  const play = <K extends string>(
    animator: Pick<Animator, 'play'> & Partial<Pick<Animator, 'set'>>,
    curves: Partial<Record<K, MotionCurve>>,
    crossfadeAs?: 'entrance' | 'exit',
  ) => {
    // The stage writes its own first values (ZoomStage.play).
    if (start === 'presented') {
      animator.set?.(firstValues(curves));
    }
    return animator.play(curves, {
      crossfadeAs,
      start,
      additive: turning,
    });
  };
  const handle = play(
    stage,
    zoomElementCurves(geometry, fitted, 'detail', frame, fade),
    kind === 'open' ? 'entrance' : 'exit',
  );
  let portal: HTMLImageElement | null = null;
  if (!reduced) {
    const taken = turning ? (opening?.owned.portal ?? null) : null;
    if (taken != null && taken.isConnected && opening != null) {
      opening.owned.portal = null;
      portal = taken;
    } else {
      portal = showSourcePortal(container, source, sourceBox, src);
    }
    play(
      animatorFor(portal),
      zoomElementCurves(geometry, sourceBox, 'source', frame, fade),
    );
  }
  const opacity: MotionCurve = {
    duration: fade.duration,
    at: t => Math.min(1, Math.max(0, fade.at(t))),
    velocity: t => fade.velocity(t),
  };
  for (const animator of fades) {
    play(animator, {opacity});
  }
  const owned = {portal};
  if (kind === 'open') {
    const entry = {source, started: false, owned};
    openings.set(container, entry);
    void handle.started.then(
      () => {
        entry.started = true;
      },
      () => {},
    );
  } else {
    openings.delete(container);
  }
  // Under Reduce Motion the source stays shown.
  const release = reduced ? null : hideSource(source);
  const end = () => {
    release?.();
    owned.portal?.remove();
    if (openings.get(container)?.owned === owned) {
      openings.delete(container);
    }
  };
  signal?.addEventListener('abort', end, {once: true});
  return handle.finished
    .then(() => undefined)
    .finally(() => {
      signal?.removeEventListener('abort', end);
      end();
    });
}
