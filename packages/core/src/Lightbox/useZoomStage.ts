// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useZoomStage.ts
 * @input The zoom core (useZoomCore.ts), the stage element ref, whether the
 *   gestures are on, the current item's key, and callbacks for taps
 *   outside the photo and drags
 * @output Exports `useZoomStage`: Lightbox's gestures, those of a zooming
 *   UIScrollView for every pointer — pinch about the fingers with the pan
 *   riding along, the give past the zoom limits and the eased return, double
 *   tap to the tapped point (Photos' aspect fill), a zoomed pan with
 *   UIScrollView's rubber band and coast, and a press catching a moving
 *   photo — on top of the core, whose API it returns
 * @position Lightbox's gesture module (internal, one import site:
 *   Lightbox.tsx); built on the gesture recognizers (../gestures) and the
 *   core's compositor animator, with the geometry in zoomStage.ts
 *
 * These recognizers take every pointer, a mouse, a pen and a finger alike
 * (spec:AST-094 FR43): the pinch is the fingers' (a ctrl-wheel pinches too;
 * a pen does not), the pan also takes a wheel's or a trackpad's scroll, and
 * the keyboard is the core's. Tracking writes the photo's `translate` and
 * `scale` once per input event (no React render, no layout read after a
 * gesture begins); every release and double tap runs on the compositor as
 * baked keyframes. A press landing on a moving photo takes it from its
 * presentation value.
 *
 * Recognizers on the stage, as UIScrollView arranges its own:
 * - pinch, simultaneous with the pan, so two fingers zoom and move at once
 *   and a finger left down after the pinch keeps panning;
 * - pan (one or two fingers, a mouse's or a pen's drag, or a scroll),
 *   moving a zoomed photo: a scroll view's pan, whose release carries a
 *   scroll view's velocity (the shared filter, spec:AST-100), at rest after
 *   a silent hold;
 * - double tap (a double-click too): zoom in as Photos does (until the
 *   photo fills the stage, the tapped point brought to the centre), or back
 *   to the fitted size;
 * - single tap, which waits for the double tap to fail: a tap that lands
 *   outside the photo is reported (Lightbox closes on it);
 * - a zero-duration press beside them all (UIKit's touch-down idiom): a
 *   press landing on a moving photo stops it where it shows, as a scroll
 *   view stops its deceleration, and a lift with no drag lets it settle.
 * The stage's `touch-action` is the caller's (none while zoom is on), since
 * a disabled recognizer would still claim it.
 *
 * Measured UIKit behaviour this follows (motion/uikit/zoomMedia.ts): zoom =
 * pinch scale 1:1 inside the limits; the content point under the centroid
 * stays under it, past the limits too; no scale momentum after the fingers
 * lift; past a limit the return is one eased animation anchored at the last
 * centroid; a zoomed pan coasts and bounces like a scroll view. A two-finger
 * tap does nothing (UIKit's default).
 *
 * SYNC: When modified, update useZoomCore.ts, zoomStage.ts, Lightbox.tsx and
 * __tests__/LightboxZoom.interaction.browser.spec.ts.
 */

import {useRef, useState, type RefObject} from 'react';
import {LongPressGestureRecognizer} from '../gestures/LongPressGestureRecognizer';
import {PanGestureRecognizer} from '../gestures/PanGestureRecognizer';
import {PinchGestureRecognizer} from '../gestures/PinchGestureRecognizer';
import {TapGestureRecognizer} from '../gestures/TapGestureRecognizer';
import type {Point} from '../gestures/types';
import {useGestureRecognizer} from '../gestures/useGestureRecognizer';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {coast as coastCurves} from '../motion/coast';
import {decayRestDistance} from '../motion/decay';
import {
  doubleTapTarget,
  draggedTransform,
  isZoomed,
  overshootScale,
  pinchScaleFor,
  rawForDragged,
  releaseTarget,
  restRange,
  transformKeepingPoint,
  type StagePoint,
  type ZoomGeometry,
  type ZoomTransform,
} from './zoomStage';
import {
  ZOOM_DRAGGING_ATTRIBUTE,
  type ZoomCore,
  type ZoomStage,
} from './useZoomCore';

export {ZOOM_DRAGGING_ATTRIBUTE, type ZoomStage};

export interface UseZoomStageOptions {
  /** The stage: the photo's clipping parent, which centres it. */
  stageRef: RefObject<HTMLElement | null>;
  /** The gestures are on (zoom is on), for every pointer. */
  isEnabled: boolean;
  /** Changes when another item shows: a gesture in progress ends. */
  itemKey: unknown;
  /** A single tap landed outside the photo. */
  onTapOutside?: () => void;
  /** A pan began (a release over the backdrop must not close). */
  onDragStart?: () => void;
}

interface PinchSession {
  readonly start: ZoomTransform;
  /** The pinch's own scale the start corresponds to (past a limit, more). */
  readonly startPinchScale: number;
  readonly anchor: StagePoint;
  centroid: StagePoint;
}

interface PanSession {
  /** The pointer-travel transform when the session started. */
  readonly raw: ZoomTransform;
  readonly translation: Point;
}

/** Every pointer, a mouse, a pen and a finger (spec:AST-094 FR43). */
const EVERY_POINTER = ['touch', 'pen', 'mouse'] as const;
/** Fingers only: a pinch under a pen stays off (FR43); a ctrl-wheel pinches. */
const PINCH_POINTERS = ['touch'] as const;

export function useZoomStage(
  core: ZoomCore,
  options: UseZoomStageOptions,
): ZoomStage {
  const {
    animator,
    geometryRef,
    targetRef,
    measure,
    toStage,
    current,
    write,
    setTarget,
    setZoomed,
    settleTo,
  } = core;
  const optionsRef = useRef(options);
  useIsomorphicLayoutEffect(() => {
    optionsRef.current = options;
  });
  const pinchRef = useRef<PinchSession | null>(null);
  const panRef = useRef<PanSession | null>(null);
  /** A touch stopped a moving photo; a pan or pinch has since taken over. */
  const caughtRef = useRef(false);
  const draggedSinceCatchRef = useRef(false);

  /**
   * A zoomed pan's release: UIScrollView's coast, bouncing at the edges.
   */
  const coast = (geometry: ZoomGeometry, velocity: Point) => {
    const from = current();
    // Under Reduce Motion too: momentum that continues a throw, and its
    // settle at an edge, is the person's own movement, as scrolling keeps
    // decelerating under iOS Reduce Motion (design:reduced-motion DR2,
    // DEC-2); the animator's policy leaves `decay` alone.
    const range = restRange(geometry, from.scale);
    const vx = range.x.min === range.x.max ? 0 : velocity.x;
    const vy = range.y.min === range.y.max ? 0 : velocity.y;
    const rest = (value: number, v: number, {min, max}: typeof range.x) =>
      Math.min(max, Math.max(min, value + decayRestDistance(v)));
    setTarget({
      x: rest(from.x, vx, range.x),
      y: rest(from.y, vy, range.y),
      scale: from.scale,
    });
    setZoomed(isZoomed(geometry, from));
    animator.decay(
      coastCurves(animator, {x: vx, y: vy}, {bounds: {x: range.x, y: range.y}}),
    );
  };

  // Whether a finger began each gesture, read from its first touch as it
  // begins: under reduced motion a finger's release cross-fades
  // (design:reduced-motion DR2), a mouse's, a trackpad's or a pen's
  // completes at once where the primary pointer is fine (DR3, FR43).
  const fingerRef = useRef({pinch: false, catch: false});
  const [recognizers] = useState(() => {
    const pinch = new PinchGestureRecognizer({
      name: 'Lightbox.zoomPinch',
      allowedPointerTypes: PINCH_POINTERS,
    });
    // A zoomed photo is a scroll view: its coast reads the pan's scroll-view
    // release (`scrollVelocity()`, spec:AST-100), so it coasts as far as
    // UIKit's.
    const pan = new PanGestureRecognizer({
      name: 'Lightbox.zoomPan',
      maximumNumberOfTouches: 2,
      allowedPointerTypes: EVERY_POINTER,
    });
    const doubleTap = new TapGestureRecognizer({
      name: 'lightbox-zoom-double-tap',
      numberOfTapsRequired: 2,
      allowedPointerTypes: EVERY_POINTER,
    });
    const tap = new TapGestureRecognizer({
      name: 'lightbox-zoom-tap',
      allowedPointerTypes: EVERY_POINTER,
    });
    const touchDown = new LongPressGestureRecognizer({
      name: 'lightbox-zoom-touch-down',
      minimumPressDuration: 0,
      allowableMovement: Number.POSITIVE_INFINITY,
      cancelsTouchesInView: false,
      delaysTouchesEnded: false,
      allowedPointerTypes: EVERY_POINTER,
    });
    pinch.recognizeSimultaneouslyWith(pan);
    tap.requireToFail(doubleTap);
    for (const other of [pinch, pan, doubleTap, tap]) {
      touchDown.recognizeSimultaneouslyWith(other);
    }
    return {pinch, pan, doubleTap, tap, touchDown};
  });

  const recognizerOptions = {isEnabled: options.isEnabled, manageStyle: false};

  useGestureRecognizer(
    options.stageRef,
    () => recognizers.pinch,
    pinch => {
      if (pinch.state === 'began') {
        fingerRef.current.pinch =
          pinch.trackedTouches[0]?.pointerType === 'touch';
        const geometry = measure();
        if (geometry == null) {
          return;
        }
        draggedSinceCatchRef.current = true;
        animator.stop();
        const start = current();
        const anchor = toStage(pinch.focalPoint());
        pinchRef.current = {
          start,
          startPinchScale: pinchScaleFor(geometry, start.scale),
          anchor,
          centroid: anchor,
        };
      }
      const session = pinchRef.current;
      const geometry = geometryRef.current;
      if (session == null || geometry == null) {
        return;
      }
      if (pinch.state === 'began' || pinch.state === 'changed') {
        session.centroid = toStage(pinch.focalPoint());
        const shown = overshootScale(
          geometry,
          session.startPinchScale * pinch.scale,
        );
        write(
          transformKeepingPoint(
            geometry,
            session.start,
            session.anchor,
            session.centroid,
            shown,
          ),
        );
        return;
      }
      // Ended (a finger lifted) or cancelled (the browser took the touches).
      pinchRef.current = null;
      const shown = current();
      const target = releaseTarget(geometry, shown, session.centroid);
      if (target !== shown) {
        // Past a limit: UIKit's eased return, anchored at the last centroid.
        // A finger still down rests until it lands again.
        panRef.current = null;
        settleTo(geometry, target, {
          touchRelease: fingerRef.current.pinch,
        });
        return;
      }
      const pan = recognizers.pan;
      if (pan.state === 'began' || pan.state === 'changed') {
        // The finger left down keeps panning from here, without a jump.
        panRef.current = {
          raw: rawForDragged(geometry, shown),
          translation: pan.translation(),
        };
        setZoomed(isZoomed(geometry, shown));
        return;
      }
      coast(geometry, {x: 0, y: 0});
    },
    recognizerOptions,
  );

  useGestureRecognizer(
    options.stageRef,
    () => recognizers.pan,
    pan => {
      const stage = optionsRef.current.stageRef.current;
      if (pan.state === 'began') {
        const geometry = measure();
        if (geometry == null) {
          return;
        }
        draggedSinceCatchRef.current = true;
        animator.stop();
        optionsRef.current.onDragStart?.();
        const shown = current();
        if (isZoomed(geometry, shown)) {
          stage?.setAttribute(ZOOM_DRAGGING_ATTRIBUTE, '');
        }
        // The translation already leaves out the begin threshold's travel,
        // and what the finger moved past it shows at once, as in UIKit.
        panRef.current = {
          raw: rawForDragged(geometry, shown),
          translation: {x: 0, y: 0},
        };
      }
      if (pan.state === 'began' || pan.state === 'changed') {
        const session = panRef.current;
        const geometry = geometryRef.current;
        if (pinchRef.current != null || session == null || geometry == null) {
          return;
        }
        const translation = pan.translation();
        write(
          draggedTransform(geometry, {
            x: session.raw.x + translation.x - session.translation.x,
            y: session.raw.y + translation.y - session.translation.y,
            scale: session.raw.scale,
          }),
        );
        return;
      }
      // Ended or cancelled.
      stage?.removeAttribute(ZOOM_DRAGGING_ATTRIBUTE);
      const session = panRef.current;
      panRef.current = null;
      const geometry = geometryRef.current;
      if (pinchRef.current != null || session == null || geometry == null) {
        return;
      }
      // The release carries the shared filter's velocity at the lift
      // (spec:AST-100): a scroll view's, at rest after a silent hold.
      coast(
        geometry,
        pan.state === 'ended' ? pan.scrollVelocity() : {x: 0, y: 0},
      );
    },
    recognizerOptions,
  );

  useGestureRecognizer(
    options.stageRef,
    () => recognizers.touchDown,
    touchDown => {
      if (touchDown.state === 'began') {
        fingerRef.current.catch =
          touchDown.trackedTouches[0]?.pointerType === 'touch';
        draggedSinceCatchRef.current = false;
        const shown = current();
        const target = targetRef.current;
        const moving =
          Math.abs(shown.x - target.x) > 0.01 ||
          Math.abs(shown.y - target.y) > 0.01 ||
          Math.abs(shown.scale - target.scale) > 0.0001;
        caughtRef.current = moving;
        if (moving) {
          // Stopped where it shows: the presentation value, from the curve.
          animator.stop();
          setTarget(shown);
        }
        return;
      }
      if (touchDown.state === 'changed') {
        return;
      }
      // Lifted (or taken). With no drag since the catch, the photo settles
      // from where it was stopped: back inside the stage, or past a zoom
      // limit back to it.
      const caught = caughtRef.current;
      caughtRef.current = false;
      const geometry = geometryRef.current ?? measure();
      if (!caught || draggedSinceCatchRef.current || geometry == null) {
        return;
      }
      const shown = current();
      const limit = releaseTarget(geometry, shown, {
        x: geometry.width / 2,
        y: geometry.height / 2,
      });
      if (limit !== shown) {
        settleTo(geometry, limit, {
          touchRelease: fingerRef.current.catch,
        });
        return;
      }
      coast(geometry, {x: 0, y: 0});
    },
    recognizerOptions,
  );

  useGestureRecognizer(
    options.stageRef,
    () => recognizers.doubleTap,
    doubleTap => {
      if (doubleTap.state !== 'ended') {
        return;
      }
      const geometry = measure();
      if (geometry == null) {
        return;
      }
      const point = toStage(doubleTap.location());
      settleTo(geometry, doubleTapTarget(geometry, current(), point));
    },
    recognizerOptions,
  );

  useGestureRecognizer(
    options.stageRef,
    () => recognizers.tap,
    tap => {
      if (tap.state !== 'ended') {
        return;
      }
      const geometry = measure();
      if (geometry == null) {
        return;
      }
      const point = toStage(tap.location());
      const {x, y, scale} = current();
      const left = geometry.fit.x + x;
      const top = geometry.fit.y + y;
      const inside =
        point.x >= left &&
        point.x <= left + geometry.fit.width * scale &&
        point.y >= top &&
        point.y <= top + geometry.fit.height * scale;
      if (!inside) {
        optionsRef.current.onTapOutside?.();
      }
    },
    recognizerOptions,
  );

  // Another item: a gesture in progress ends (the core puts the photo back
  // at the fitted size).
  useIsomorphicLayoutEffect(() => {
    pinchRef.current = null;
    panRef.current = null;
  }, [options.itemKey]);

  return core.api;
}
