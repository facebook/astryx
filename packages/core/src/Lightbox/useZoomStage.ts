// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useZoomStage.ts
 * @input The zoom core (useZoomCore.ts), the stage element ref, the element
 *   the recognizers attach to (the stage, or a gallery's track), whether the
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
 *   moving a zoomed photo. As UIScrollView's, it begins only when the photo
 *   can move that way: with two fingers down, or on a zoomed photo not
 *   already at its edge on the side the drag heads to; any other drag is
 *   left to an outer pager. As a scroll view's, its coast reads the pan's
 *   scroll-view release (`scrollVelocity()`, the shared filter,
 *   spec:AST-100), at rest after a silent hold;
 * - double tap (a double-click too): zoom in as Photos does (until the
 *   photo fills the stage, the tapped point brought to the centre), or back
 *   to the fitted size;
 * - single tap, which waits for the double tap to fail: a tap on the photo
 *   and one beside it are reported (Lightbox toggles its controls on the
 *   first and closes on the second);
 * - a zero-duration press beside them all (UIKit's touch-down idiom): a
 *   press landing on a moving photo stops it where it shows, as a scroll
 *   view stops its deceleration, and a lift with no drag lets it settle. It
 *   only claims a press on a moving photo, so a still one leaves the press
 *   to an outer pager's own catch;
 * - with `dismiss`, a pan (one finger, a mouse's or a pen's drag, or a
 *   scroll) that begins only downward on a photo at its fitted size (Photos'
 *   drag to dismiss): the photo's centre follows the pointer and it shrinks
 *   by the travel (zoomMedia.dismiss); a release moving up or back at the
 *   start springs back on the cancel springs, any other sends it into its
 *   thumbnail when `target` gives one, or else on down, on the dismissal's
 *   springs, and reports it once it has left. A dismissed photo is not
 *   caught.
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
 * SYNC: When modified, update useZoomCore.ts, zoomStage.ts, Lightbox.tsx,
 * __tests__/LightboxZoom.interaction.browser.spec.ts and
 * __tests__/LightboxPaging.interaction.browser.spec.ts.
 */

import {useMemo, useRef, useState, type RefObject} from 'react';
import {LongPressGestureRecognizer} from '../gestures/LongPressGestureRecognizer';
import {PanGestureRecognizer} from '../gestures/PanGestureRecognizer';
import {PinchGestureRecognizer} from '../gestures/PinchGestureRecognizer';
import {TapGestureRecognizer} from '../gestures/TapGestureRecognizer';
import type {Point} from '../gestures/types';
import {useGestureRecognizer} from '../gestures/useGestureRecognizer';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {coast as coastCurves} from '../motion/coast';
import {decayRestDistance} from '../motion/decay';
import {zoomMedia} from '../motion/uikit/zoomMedia';
import {
  IDENTITY,
  dismissCommits,
  dismissExitY,
  dismissTransform,
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
  type ZoomBox,
  type ZoomCore,
  type ZoomStage,
} from './useZoomCore';

export {ZOOM_DRAGGING_ATTRIBUTE, type ZoomStage};

/**
 * Set on the stage while a drag to dismiss moves the photo, until it settles:
 * a stage that only hugs the photo lets the moved photo draw outside it.
 */
export const ZOOM_DISMISSING_ATTRIBUTE = 'data-zoom-dismissing';

export interface UseZoomStageOptions {
  /** The stage: the box the photo is fitted and centred in, clipping it. */
  stageRef: RefObject<HTMLElement | null>;
  /** Where the recognizers attach: the stage by default, a pager's track. */
  surfaceRef?: RefObject<HTMLElement | null>;
  /** The gestures are on (zoom is on), for every pointer. */
  isEnabled: boolean;
  /** Changes when another item shows: a gesture in progress ends. */
  itemKey: unknown;
  /**
   * A pinch, a finger's or a ctrl-wheel's, carried the photo past the fitted
   * size, or back to it, while it goes on (the core's `onZoomedChange`
   * follows once it ends).
   */
  onPinchZoomed?: (isZoomed: boolean) => void;
  /** A single tap landed outside the photo. */
  onTapOutside?: () => void;
  /**
   * A single tap landed on the photo, once a double tap could no longer
   * follow it.
   */
  onTapPhoto?: () => void;
  /** A pan began (a release over the backdrop must not close). */
  onDragStart?: () => void;
  /** Drag to dismiss, as Photos has it; none without. */
  dismiss?: ZoomStageDismiss;
}

/**
 * Photos' drag to dismiss: a one-finger drag that starts downward on a photo
 * at its fitted size carries it (its centre follows the finger, and it
 * shrinks with the travel); the release dismisses or springs back. The owner
 * fades its backdrop and controls by the travel and closes once the photo
 * has left.
 */
export interface ZoomStageDismiss {
  /** Whether a drag can dismiss now (an image, under every pointer). */
  isEnabled: boolean;
  /** Each move of the drag: its downward travel, pt. */
  onDrag: (travel: number) => void;
  /**
   * The release: whether it dismisses (the photo leaves) or springs back,
   * and whether a finger released it. Under reduced motion a finger's
   * release cross-fades (design:reduced-motion DR2); a mouse's, a
   * trackpad's or a pen's follows DR2 on a coarse primary pointer and
   * completes at once otherwise (DR3, spec:AST-094 FR43).
   */
  onRelease: (dismisses: boolean, touch: boolean) => void;
  /** The dismissed photo has left the stage. */
  onDismissed: () => void;
  /**
   * Where a dismissed photo goes, in client px: the box it shrinks into (its
   * thumbnail's), or null to carry on down.
   */
  target?: () => ZoomBox | null;
}

/** The touch layer's additions to the core's API. */
export interface ZoomStageWithTouch extends ZoomStage {
  /** A dismissed photo back at its fitted size at once (the viewer opens again). */
  reset(): void;
}

interface PinchSession {
  readonly start: ZoomTransform;
  /** The pinch's own scale the start corresponds to (past a limit, more). */
  readonly startPinchScale: number;
  readonly anchor: StagePoint;
  centroid: StagePoint;
  /** Whether the pinch has the photo past the fitted size. */
  isZoomed: boolean;
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
): ZoomStageWithTouch {
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
    isMoving,
    isAtEdgeOf,
  } = core;
  const optionsRef = useRef(options);
  useIsomorphicLayoutEffect(() => {
    optionsRef.current = options;
  });
  const pinchRef = useRef<PinchSession | null>(null);
  const panRef = useRef<PanSession | null>(null);
  /** A drag to dismiss in progress: the geometry it started from. */
  const dismissRef = useRef<ZoomGeometry | null>(null);
  /** A dismissed photo is leaving: nothing catches it. */
  const leavingRef = useRef(false);
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

  // UIScrollView's pan begins only when the content can move that way: with
  // two fingers down (a pinch is zooming), or on a zoomed photo that is not
  // already at its edge on the side the drag heads to. Otherwise the drag is
  // left to an outer pager (or to nothing).
  const panShouldBeginRef = useRef<(pan: PanGestureRecognizer) => boolean>(
    () => true,
  );
  panShouldBeginRef.current = pan => {
    if (pan.numberOfTouches > 1) {
      return true;
    }
    const geometry = measure();
    if (geometry == null || !isZoomed(geometry, current())) {
      return false;
    }
    const {x, y} = pan.totalTranslation();
    return !(
      Math.abs(x) >= Math.abs(y) &&
      isAtEdgeOf(geometry, x < 0 ? 'left' : 'right')
    );
  };
  const isMovingRef = useRef(isMoving);
  isMovingRef.current = () => !leavingRef.current && isMoving();

  // A drag to dismiss starts downward on a photo at its fitted size.
  const dismissShouldBeginRef = useRef<(pan: PanGestureRecognizer) => boolean>(
    () => false,
  );
  dismissShouldBeginRef.current = pan => {
    if (optionsRef.current.dismiss?.isEnabled !== true || leavingRef.current) {
      return false;
    }
    // Where the photo is going: one zooming in is not dismissed.
    const geometry = measure();
    if (geometry == null || isZoomed(geometry, targetRef.current)) {
      return false;
    }
    const {x, y} = pan.totalTranslation();
    return y > 0 && y >= Math.abs(x);
  };

  // Whether a finger began each gesture, read from its first touch as it
  // begins: under reduced motion a finger's release cross-fades
  // (design:reduced-motion DR2), a mouse's, a trackpad's or a pen's
  // completes at once where the primary pointer is fine (DR3, FR43).
  const fingerRef = useRef({pinch: false, catch: false, dismiss: false});
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
      shouldBegin: recognizer => panShouldBeginRef.current(recognizer),
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
      // Only a moving photo is caught, so a still one leaves the touch to
      // everyone else (an outer pager's own catch).
      shouldBegin: () => isMovingRef.current(),
    });
    const dismissPan = new PanGestureRecognizer({
      name: 'Lightbox.dismissPan',
      maximumNumberOfTouches: 1,
      allowedPointerTypes: EVERY_POINTER,
      shouldBegin: recognizer => dismissShouldBeginRef.current(recognizer),
    });
    pinch.recognizeSimultaneouslyWith(pan);
    tap.requireToFail(doubleTap);
    for (const other of [pinch, pan, doubleTap, tap, dismissPan]) {
      touchDown.recognizeSimultaneouslyWith(other);
    }
    return {pinch, pan, doubleTap, tap, touchDown, dismissPan};
  });

  const recognizerOptions = {isEnabled: options.isEnabled, manageStyle: false};
  const surfaceRef = options.surfaceRef ?? options.stageRef;

  useGestureRecognizer(
    surfaceRef,
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
          isZoomed: isZoomed(geometry, start),
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
        const next = transformKeepingPoint(
          geometry,
          session.start,
          session.anchor,
          session.centroid,
          shown,
        );
        write(next);
        const zoomed = isZoomed(geometry, next);
        if (zoomed !== session.isZoomed) {
          session.isZoomed = zoomed;
          optionsRef.current.onPinchZoomed?.(zoomed);
        }
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
    surfaceRef,
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
    surfaceRef,
    () => recognizers.touchDown,
    touchDown => {
      if (touchDown.state === 'began') {
        fingerRef.current.catch =
          touchDown.trackedTouches[0]?.pointerType === 'touch';
        // It only begins on a moving photo: stopped where it shows, at the
        // presentation value from the curve.
        draggedSinceCatchRef.current = false;
        caughtRef.current = true;
        const shown = current();
        animator.stop();
        setTarget(shown);
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
    surfaceRef,
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
    surfaceRef,
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
      const onPhoto =
        point.x >= left &&
        point.x <= left + geometry.fit.width * scale &&
        point.y >= top &&
        point.y <= top + geometry.fit.height * scale;
      // Beside the photo, on the stage: not on what surrounds the stage (a
      // gallery page's caption shares the surface).
      const onStage =
        point.x >= 0 &&
        point.x <= geometry.width &&
        point.y >= 0 &&
        point.y <= geometry.height;
      if (onPhoto) {
        optionsRef.current.onTapPhoto?.();
      } else if (onStage) {
        optionsRef.current.onTapOutside?.();
      }
    },
    recognizerOptions,
  );

  useGestureRecognizer(
    surfaceRef,
    () => recognizers.dismissPan,
    pan => {
      const dismiss = optionsRef.current.dismiss;
      if (pan.state === 'began') {
        fingerRef.current.dismiss =
          pan.trackedTouches[0]?.pointerType === 'touch';
        const geometry = measure();
        if (geometry == null || dismiss == null) {
          return;
        }
        animator.stop();
        optionsRef.current.onDragStart?.();
        dismissRef.current = geometry;
        optionsRef.current.stageRef.current?.setAttribute(
          ZOOM_DISMISSING_ATTRIBUTE,
          '',
        );
      }
      const geometry = dismissRef.current;
      if (geometry == null) {
        return;
      }
      const translation = pan.translation();
      if (pan.state === 'began' || pan.state === 'changed') {
        write(dismissTransform(geometry, translation.x, translation.y));
        dismiss?.onDrag(Math.max(0, translation.y));
        return;
      }
      // Ended or cancelled.
      dismissRef.current = null;
      // The release rule and the motion read the shared filter's velocity at
      // the lift (spec:AST-100), at rest after a silent hold.
      const velocity = pan.velocity();
      const dismisses =
        pan.state === 'ended' && dismissCommits(translation.y, velocity.y);
      dismiss?.onRelease(dismisses, fingerRef.current.dismiss);
      const shown = current();
      if (dismisses) {
        leavingRef.current = true;
        const done = (handle: {finished: Promise<boolean>}) =>
          void handle.finished.then(() => {
            if (leavingRef.current) {
              optionsRef.current.dismiss?.onDismissed();
            }
          });
        const box = dismiss?.target?.() ?? null;
        if (box != null) {
          // Into its thumbnail, as Photos does: the photo's width onto the
          // cell's, centred on it, on the dismissal's springs, fading out as
          // the cell's picture fades in over it.
          const origin = core.originRef.current;
          const scale = box.width / geometry.fit.width;
          const to = {
            x: box.x - origin.x - geometry.fit.x,
            y:
              box.y -
              origin.y -
              geometry.fit.y +
              (box.height - geometry.fit.height * scale) / 2,
            scale,
          };
          setTarget(to);
          animator.animate(
            {scale: to.scale, opacity: 0},
            {spring: zoomMedia.dismiss.dismissSizeSpring},
            {crossfadeAs: 'exit', touchRelease: fingerRef.current.dismiss},
          );
          done(
            animator.animate(
              {x: to.x, y: to.y},
              {
                spring: zoomMedia.dismiss.dismissPositionSpring,
                velocity: {x: velocity.x, y: velocity.y},
              },
              {crossfadeAs: 'exit', touchRelease: fingerRef.current.dismiss},
            ),
          );
          return;
        }
        // No thumbnail to return to: straight on down, on the dismissal's
        // position spring, from the release velocity, until it leaves the
        // screen (a stage that only hugs the photo sits above its bottom).
        const stageElement = optionsRef.current.stageRef.current;
        const view = stageElement?.ownerDocument.defaultView;
        const y = dismissExitY(
          geometry,
          shown,
          stageElement != null && view != null
            ? view.innerHeight - stageElement.getBoundingClientRect().top
            : geometry.height,
        );
        setTarget({...shown, y});
        done(
          animator.animate(
            {x: shown.x, y},
            {
              spring: zoomMedia.dismiss.dismissPositionSpring,
              velocity: {x: velocity.x, y: velocity.y},
            },
            {crossfadeAs: 'exit', touchRelease: fingerRef.current.dismiss},
          ),
        );
        return;
      }
      setTarget(IDENTITY);
      const position = animator.animate(
        {x: 0, y: 0},
        {
          spring: zoomMedia.dismiss.cancelPositionSpring,
          velocity: {x: velocity.x, y: velocity.y},
        },
        {touchRelease: fingerRef.current.dismiss},
      );
      const size = animator.animate(
        {scale: 1},
        {spring: zoomMedia.dismiss.cancelSizeSpring},
        {touchRelease: fingerRef.current.dismiss},
      );
      // Back in its box: the stage clips again, unless another drag began.
      void Promise.all([position.finished, size.finished]).then(() => {
        if (dismissRef.current == null && !leavingRef.current) {
          optionsRef.current.stageRef.current?.removeAttribute(
            ZOOM_DISMISSING_ATTRIBUTE,
          );
        }
      });
    },
    {isEnabled: options.dismiss?.isEnabled === true, manageStyle: false},
  );

  // Another item: a gesture in progress ends (the core puts the photo back
  // at the fitted size).
  useIsomorphicLayoutEffect(() => {
    pinchRef.current = null;
    panRef.current = null;
    dismissRef.current = null;
    leavingRef.current = false;
    optionsRef.current.stageRef.current?.removeAttribute(
      ZOOM_DISMISSING_ATTRIBUTE,
    );
  }, [options.itemKey]);

  const api = core.api;
  return useMemo(
    () => ({
      ...api,
      reset: () => {
        if (!leavingRef.current) {
          return;
        }
        leavingRef.current = false;
        dismissRef.current = null;
        animator.stop();
        animator.set({x: 0, y: 0, scale: 1, opacity: 1});
        setTarget(IDENTITY);
        optionsRef.current.stageRef.current?.removeAttribute(
          ZOOM_DISMISSING_ATTRIBUTE,
        );
      },
      rest: () => {
        leavingRef.current = false;
        dismissRef.current = null;
        pinchRef.current = null;
        panRef.current = null;
        api.rest();
      },
    }),
    [animator, api, setTarget],
  );
}
