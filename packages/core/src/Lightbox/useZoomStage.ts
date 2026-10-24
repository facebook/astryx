// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useZoomStage.ts
 * @input A stage element ref (clipping, centring the photo), the element the
 *   recognizers attach to (the stage, or a gallery's track), whether zoom is
 *   on, the current item's key, and callbacks for zoom changes and taps
 *   outside the photo
 * @output Exports `useZoomStage`: Lightbox's zoom and pan as a zooming
 *   UIScrollView — pinch about the fingers with the pan riding along, the
 *   give past the zoom limits and the eased return, double tap to the tapped
 *   point (Photos' aspect fill), a zoomed pan with UIScrollView's rubber
 *   band and coast — plus the callback ref for the photo, an imperative API
 *   for the keyboard, and `isAtEdge` for an outer pager
 * @position Lightbox's zoom driver (internal); built on the gesture
 *   recognizers (../gestures) and the compositor animator (../motion), with
 *   the geometry in zoomStage.ts
 *
 * Finger tracking writes the photo's `translate` and `scale` once per input
 * event through the animator (no React render, no layout read after a
 * gesture begins); every release, double tap and keyboard step runs on the
 * compositor as baked keyframes. A finger landing on a moving photo takes it
 * from its presentation value; a keyboard step continues from where the photo
 * is going (UIKit's model value), so presses during a settle add up. React
 * hears only discrete changes (`onZoomedChange`).
 *
 * Recognizers on the stage, as UIScrollView arranges its own:
 * - pinch, simultaneous with the pan, so two fingers zoom and move at once
 *   and a finger left down after the pinch keeps panning;
 * - pan (one or two fingers), moving a zoomed photo. As UIScrollView's, it
 *   begins only when the photo can move that way: with two fingers down, or
 *   on a zoomed photo not already at its edge on the side the drag heads to;
 *   any other drag is left to an outer pager. Its release reads the scroll
 *   view's release velocity (motion/paging.ts), so a finger held still
 *   before the lift does not coast;
 * - double tap: zoom in as Photos does (until the photo fills the stage,
 *   the tapped point brought to the centre), or back to the fitted size;
 * - single tap, which waits for the double tap to fail: a tap on the photo
 *   and one beside it are reported (Lightbox toggles its controls on the
 *   first and closes on the second);
 * - a zero-duration press beside them all (UIKit's touch-down idiom): a
 *   finger landing on a moving photo stops it where it shows, as a scroll
 *   view stops its deceleration, and a lift with no drag lets it settle. It
 *   only claims a touch on a moving photo, so a still one leaves the touch
 *   to an outer pager's own catch;
 * - with `dismiss`, a one-finger pan for touch and pen that begins only
 *   downward on a photo at its fitted size (Photos' drag to dismiss): the
 *   photo's centre follows the finger and it shrinks by the travel
 *   (zoomMedia.dismiss); a release moving up or back at the start springs
 *   back on the cancel springs, any other sends it on down on the
 *   dismissal's spring (no thumbnail to return to yet) and reports it once
 *   it has left. A dismissed photo is not caught.
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
 * SYNC: When modified, update zoomStage.ts, Lightbox.tsx,
 * __tests__/LightboxZoom.interaction.browser.spec.ts and
 * __tests__/LightboxPaging.interaction.browser.spec.ts.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import {LongPressGestureRecognizer} from '../gestures/LongPressGestureRecognizer';
import {PanGestureRecognizer} from '../gestures/PanGestureRecognizer';
import {PinchGestureRecognizer} from '../gestures/PinchGestureRecognizer';
import {TapGestureRecognizer} from '../gestures/TapGestureRecognizer';
import type {Point} from '../gestures/types';
import {useGestureRecognizer} from '../gestures/useGestureRecognizer';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import type {AnimateOptions, Animator} from '../motion/animator';
import {decayRestDistance} from '../motion/decay';
import {pagingReleaseVelocity} from '../motion/paging';
import {paging} from '../motion/uikit/paging';
import {zoomMedia} from '../motion/uikit/zoomMedia';
import {useAnimator} from '../motion/useAnimator';
import {
  IDENTITY,
  dismissCommits,
  dismissExitY,
  dismissTransform,
  doubleTapScaleFor,
  doubleTapTarget,
  draggedTransform,
  isZoomed,
  maxScaleFor,
  overshootScale,
  pannedBy,
  pinchScaleFor,
  rawForDragged,
  releaseTarget,
  restRange,
  restingTransform,
  settleCurves,
  transformForResize,
  transformKeepingPoint,
  type StagePoint,
  type ZoomGeometry,
  type ZoomTransform,
} from './zoomStage';

/** Set on the stage while a finger or the mouse drags a zoomed photo. */
export const ZOOM_DRAGGING_ATTRIBUTE = 'data-zoom-dragging';

/** A drag's initial direction on screen. */
export type PanDirection = 'left' | 'right';

export interface UseZoomStageOptions {
  /** The stage: the box the photo is fitted and centred in, clipping it. */
  stageRef: RefObject<HTMLElement | null>;
  /**
   * Where the recognizers attach: the stage by default. In a pager, the
   * track (the pager's own pan sits on the stage, and each element has one
   * `touch-action`).
   */
  surfaceRef?: RefObject<HTMLElement | null>;
  /** Zoom is on (an image item with `hasZoom`). */
  isEnabled: boolean;
  /** Changes when another item shows; the photo returns to the fitted size. */
  itemKey: unknown;
  /** The photo became zoomed or returned to the fitted size. */
  onZoomedChange: (isZoomed: boolean) => void;
  /**
   * A pinch carried the photo past the fitted size, or back to it, while the
   * fingers are still down (`onZoomedChange` follows at the lift).
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
  /** Whether a drag can dismiss now (an image on a touch screen). */
  isEnabled: boolean;
  /** Each move of the drag: its downward travel, pt. */
  onDrag: (travel: number) => void;
  /** The release: whether it dismisses (the photo leaves) or springs back. */
  onRelease: (dismisses: boolean) => void;
  /** The dismissed photo has left the stage. */
  onDismissed: () => void;
  /**
   * Where a dismissed photo goes, in client px: the box it shrinks into (its
   * thumbnail's), or null to carry on down.
   */
  target?: () => ZoomBox | null;
}

/** A box in client px. */
export interface ZoomBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ZoomStage {
  /** Callback ref for the photo element the stage moves and scales. */
  readonly contentRef: (element: HTMLElement | null) => void;
  /** Whether the photo is zoomed now. */
  isZoomed(): boolean;
  /** Keyboard: zoom in about the stage's centre, or out when zoomed. */
  toggle(): void;
  zoomIn(): void;
  zoomOut(): void;
  /** Keyboard: move a zoomed photo by (dx, dy) px, kept inside the stage. */
  panBy(dx: number, dy: number): void;
  /**
   * Whether a zoomed photo can no longer move with a drag toward
   * `direction` (its edge on that side is at the stage's): a pager takes
   * such a drag, as an outer paging scroll view does.
   */
  isAtEdge(direction: PanDirection): boolean;
  /** A dismissed photo back at its fitted size at once (the viewer opens again). */
  reset(): void;
  /** The photo's fitted box (its transform's reference), client px. */
  fittedBox(): ZoomBox | null;
  /** Where the photo shows now (its transform applied), client px. */
  shownBox(): ZoomBox | null;
  /** Plays curves on the photo (a transition into or out of the viewer). */
  play: Animator['play'];
  /** The photo at its fitted size, opaque, at once (after a transition). */
  rest(): void;
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
  /** The finger-travel transform when the session started. */
  readonly raw: ZoomTransform;
  readonly translation: Point;
  /** The release reads the pan's last two velocity samples (UIKit's way). */
  last: Point;
  lastMoveTime: number;
  velocity: Point;
  previousVelocity: Point;
}

export function useZoomStage(options: UseZoomStageOptions): ZoomStage {
  const {ref: attachAnimator, animator} = useAnimator();
  const optionsRef = useRef(options);
  useIsomorphicLayoutEffect(() => {
    optionsRef.current = options;
  });
  const contentElementRef = useRef<HTMLElement | null>(null);
  const geometryRef = useRef<ZoomGeometry | null>(null);
  /** Client px of the stage's top-left corner when last measured. */
  const originRef = useRef<Point>({x: 0, y: 0});
  const zoomedRef = useRef(false);
  /** Where the photo is going: the last written value or the settle's end. */
  const targetRef = useRef<ZoomTransform>(IDENTITY);
  const pinchRef = useRef<PinchSession | null>(null);
  const panRef = useRef<PanSession | null>(null);
  /** A drag to dismiss in progress: the geometry it started from. */
  const dismissRef = useRef<ZoomGeometry | null>(null);
  /** The drag to dismiss's last translation and when the finger made it. */
  const dismissLastRef = useRef<Point>({x: 0, y: 0});
  const dismissMoveTimeRef = useRef(0);
  /** A dismissed photo is leaving: nothing catches it. */
  const leavingRef = useRef(false);
  /** A touch stopped a moving photo; a pan or pinch has since taken over. */
  const caughtRef = useRef(false);
  const draggedSinceCatchRef = useRef(false);

  const contentRef = useCallback(
    (element: HTMLElement | null) => {
      contentElementRef.current = element;
      attachAnimator(element);
    },
    [attachAnimator],
  );

  // Layout reads happen here only: when a gesture or a keyboard zoom begins.
  // Sizes are read unrounded (offset sizes round to whole pixels, an error
  // a deep zoom would multiply): the stage's box and the photo's used size.
  // The stage centres the photo, so its fitted box follows from the two.
  const measure = useCallback((): ZoomGeometry | null => {
    const stage = optionsRef.current.stageRef.current;
    const content = contentElementRef.current;
    const view = stage?.ownerDocument.defaultView;
    if (stage == null || content == null || view == null) {
      return null;
    }
    const rect = stage.getBoundingClientRect();
    // The stage has no border or scrollbar: its box is its content box.
    const width = rect.width > 0 ? rect.width : stage.clientWidth;
    const height = rect.height > 0 ? rect.height : stage.clientHeight;
    const used = view.getComputedStyle(content);
    const fitWidth = parseFloat(used.width) || content.offsetWidth;
    const fitHeight = parseFloat(used.height) || content.offsetHeight;
    if (!(width > 0 && height > 0 && fitWidth > 0 && fitHeight > 0)) {
      return null;
    }
    originRef.current = {
      x: rect.left + stage.clientLeft,
      y: rect.top + stage.clientTop,
    };
    const natural =
      content instanceof HTMLImageElement && content.naturalWidth > 0
        ? content.naturalWidth
        : fitWidth;
    const doubleTapScale = doubleTapScaleFor(
      width,
      height,
      fitWidth,
      fitHeight,
    );
    const geometry: ZoomGeometry = {
      width,
      height,
      fit: {
        x: (width - fitWidth) / 2,
        y: (height - fitHeight) / 2,
        width: fitWidth,
        height: fitHeight,
      },
      minScale: 1,
      maxScale: maxScaleFor(
        natural,
        fitWidth,
        view.devicePixelRatio || 1,
        doubleTapScale,
      ),
      doubleTapScale,
    };
    geometryRef.current = geometry;
    return geometry;
  }, []);

  const toStage = (point: Point): StagePoint => ({
    x: point.x - originRef.current.x,
    y: point.y - originRef.current.y,
  });

  const current = useCallback(
    (): ZoomTransform => ({
      x: animator.get('x'),
      y: animator.get('y'),
      scale: animator.get('scale'),
    }),
    [animator],
  );

  const write = useCallback(
    (transform: ZoomTransform) => {
      targetRef.current = transform;
      animator.set({x: transform.x, y: transform.y, scale: transform.scale});
    },
    [animator],
  );

  const setZoomed = useCallback((next: boolean) => {
    if (zoomedRef.current !== next) {
      zoomedRef.current = next;
      optionsRef.current.onZoomedChange(next);
    }
  }, []);

  /** UIScrollView's eased settle (a release past a limit, a zoom to a rect). */
  const settleTo = useCallback(
    (
      geometry: ZoomGeometry,
      target: ZoomTransform,
      reducedMotion: AnimateOptions['reducedMotion'],
    ) => {
      const from = current();
      animator.stop();
      targetRef.current = target;
      setZoomed(isZoomed(geometry, target));
      if (
        from.x === target.x &&
        from.y === target.y &&
        from.scale === target.scale
      ) {
        return;
      }
      const curves = settleCurves(from, target);
      animator.play(
        {x: curves.x, y: curves.y, scale: curves.scale},
        {reducedMotion},
      );
    },
    [animator, current, setZoomed],
  );

  /** A zoomed pan's release: UIScrollView's coast, bouncing at the edges. */
  const coast = useCallback(
    (geometry: ZoomGeometry, velocity: Point) => {
      const from = current();
      const range = restRange(geometry, from.scale);
      const vx = range.x.min === range.x.max ? 0 : velocity.x;
      const vy = range.y.min === range.y.max ? 0 : velocity.y;
      const rest = (value: number, v: number, {min, max}: typeof range.x) =>
        Math.min(max, Math.max(min, value + decayRestDistance(v)));
      targetRef.current = {
        x: rest(from.x, vx, range.x),
        y: rest(from.y, vy, range.y),
        scale: from.scale,
      };
      setZoomed(isZoomed(geometry, from));
      animator.decay({x: vx, y: vy}, {bounds: {x: range.x, y: range.y}});
    },
    [animator, current, setZoomed],
  );

  // UIScrollView's pan begins only when the content can move that way: with
  // two fingers down (a pinch is zooming), or on a zoomed photo that is not
  // already at its edge on the side the drag heads to. Otherwise the drag is
  // left to an outer pager (or to nothing).
  const isMovingRef = useRef<() => boolean>(() => false);
  const panShouldBeginRef = useRef<(pan: PanGestureRecognizer) => boolean>(
    () => true,
  );
  const isAtEdgeOf = useCallback(
    (geometry: ZoomGeometry, direction: PanDirection): boolean => {
      const {x, scale} = targetRef.current;
      const range = restRange(geometry, scale);
      return direction === 'left'
        ? x <= range.x.min + 0.5
        : x >= range.x.max - 0.5;
    },
    [],
  );
  isMovingRef.current = () => {
    if (leavingRef.current) {
      return false;
    }
    const shown = current();
    const target = targetRef.current;
    return (
      Math.abs(shown.x - target.x) > 0.01 ||
      Math.abs(shown.y - target.y) > 0.01 ||
      Math.abs(shown.scale - target.scale) > 0.0001
    );
  };
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

  const [recognizers] = useState(() => {
    const pinch = new PinchGestureRecognizer({name: 'lightbox-zoom-pinch'});
    const pan = new PanGestureRecognizer({
      name: 'lightbox-zoom-pan',
      maximumNumberOfTouches: 2,
      shouldBegin: recognizer => panShouldBeginRef.current(recognizer),
    });
    const doubleTap = new TapGestureRecognizer({
      name: 'lightbox-zoom-double-tap',
      numberOfTapsRequired: 2,
    });
    const tap = new TapGestureRecognizer({name: 'lightbox-zoom-tap'});
    const touchDown = new LongPressGestureRecognizer({
      name: 'lightbox-zoom-touch-down',
      minimumPressDuration: 0,
      allowableMovement: Number.POSITIVE_INFINITY,
      cancelsTouchesInView: false,
      delaysTouchesEnded: false,
      // Only a moving photo is caught, so a still one leaves the touch to
      // everyone else (an outer pager's own catch).
      shouldBegin: () => isMovingRef.current(),
    });
    const dismissPan = new PanGestureRecognizer({
      name: 'lightbox-dismiss-pan',
      maximumNumberOfTouches: 1,
      allowedPointerTypes: ['touch', 'pen'],
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
        settleTo(geometry, target, 'keep');
        return;
      }
      const pan = recognizers.pan;
      if (pan.state === 'began' || pan.state === 'changed') {
        // The finger left down keeps panning from here, without a jump.
        const velocity = pan.velocity();
        panRef.current = {
          raw: rawForDragged(geometry, shown),
          translation: pan.translation(),
          last: pan.translation(),
          lastMoveTime: pan.trackedTouches[0]?.time ?? 0,
          velocity,
          previousVelocity: velocity,
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
        const velocity = pan.velocity();
        panRef.current = {
          raw: rawForDragged(geometry, shown),
          translation: {x: 0, y: 0},
          last: pan.translation(),
          lastMoveTime: pan.trackedTouches[0]?.time ?? 0,
          velocity,
          previousVelocity: velocity,
        };
      }
      if (pan.state === 'began' || pan.state === 'changed') {
        const session = panRef.current;
        const geometry = geometryRef.current;
        if (pinchRef.current != null || session == null || geometry == null) {
          return;
        }
        const translation = pan.translation();
        if (
          translation.x !== session.last.x ||
          translation.y !== session.last.y
        ) {
          session.last = translation;
          session.lastMoveTime =
            pan.trackedTouches[0]?.time ?? session.lastMoveTime;
          session.previousVelocity = session.velocity;
          session.velocity = pan.velocity();
        }
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
      // The scroll view's release velocity: a finger held still before the
      // lift, or a slow release, starts the coast at rest.
      const liftTime =
        pan.trackedTouches[0]?.time ??
        (typeof performance === 'undefined' ? 0 : performance.now());
      const stillFor = Math.max(0, liftTime - session.lastMoveTime);
      const release = (axis: 'x' | 'y') =>
        pagingReleaseVelocity({
          current: session.velocity[axis],
          previous: session.previousVelocity[axis],
          stillFor,
        }).settle;
      coast(
        geometry,
        pan.state === 'ended'
          ? {x: release('x'), y: release('y')}
          : {x: 0, y: 0},
      );
    },
    recognizerOptions,
  );

  useGestureRecognizer(
    surfaceRef,
    () => recognizers.touchDown,
    touchDown => {
      if (touchDown.state === 'began') {
        // It only begins on a moving photo: stopped where it shows, at the
        // presentation value from the curve.
        draggedSinceCatchRef.current = false;
        caughtRef.current = true;
        const shown = current();
        animator.stop();
        targetRef.current = shown;
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
        settleTo(geometry, limit, 'keep');
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
      settleTo(
        geometry,
        doubleTapTarget(geometry, current(), point),
        undefined,
      );
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

  // Another item: back to the fitted size before it paints. Lightbox resets
  // its own zoomed state during that render.
  useGestureRecognizer(
    surfaceRef,
    () => recognizers.dismissPan,
    pan => {
      const dismiss = optionsRef.current.dismiss;
      if (pan.state === 'began') {
        const geometry = measure();
        if (geometry == null || dismiss == null) {
          return;
        }
        animator.stop();
        optionsRef.current.onDragStart?.();
        dismissRef.current = geometry;
        dismissLastRef.current = {x: 0, y: 0};
        dismissMoveTimeRef.current = pan.trackedTouches[0]?.time ?? 0;
      }
      const geometry = dismissRef.current;
      if (geometry == null) {
        return;
      }
      const translation = pan.translation();
      if (pan.state === 'began' || pan.state === 'changed') {
        if (
          translation.x !== dismissLastRef.current.x ||
          translation.y !== dismissLastRef.current.y
        ) {
          dismissLastRef.current = translation;
          dismissMoveTimeRef.current =
            pan.trackedTouches[0]?.time ?? dismissMoveTimeRef.current;
        }
        write(dismissTransform(geometry, translation.x, translation.y));
        dismiss?.onDrag(Math.max(0, translation.y));
        return;
      }
      // Ended or cancelled.
      dismissRef.current = null;
      // The release rule reads the last movement's velocity; the motion
      // starts at rest when the finger was held still before the lift, as a
      // scroll view's release does (`paging.release.stillnessMs`).
      const moving = pan.velocity();
      const dismisses =
        pan.state === 'ended' && dismissCommits(translation.y, moving.y);
      const liftTime =
        pan.trackedTouches[0]?.time ??
        (typeof performance === 'undefined' ? 0 : performance.now());
      const velocity =
        liftTime - dismissMoveTimeRef.current >= paging.release.stillnessMs
          ? {x: 0, y: 0}
          : moving;
      dismiss?.onRelease(dismisses);
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
          const origin = originRef.current;
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
          targetRef.current = to;
          animator.animate(
            {scale: to.scale, opacity: 0},
            {spring: zoomMedia.dismiss.dismissSizeSpring},
            {crossfadeAs: 'exit'},
          );
          done(
            animator.animate(
              {x: to.x, y: to.y},
              {
                spring: zoomMedia.dismiss.dismissPositionSpring,
                velocity: {x: velocity.x, y: velocity.y},
              },
              {crossfadeAs: 'exit'},
            ),
          );
          return;
        }
        // No thumbnail to return to: straight on down, on the dismissal's
        // position spring, from the release velocity.
        const y = dismissExitY(geometry, shown);
        targetRef.current = {...shown, y};
        done(
          animator.animate(
            {x: shown.x, y},
            {
              spring: zoomMedia.dismiss.dismissPositionSpring,
              velocity: {x: velocity.x, y: velocity.y},
            },
            {crossfadeAs: 'exit'},
          ),
        );
        return;
      }
      targetRef.current = IDENTITY;
      animator.animate(
        {x: 0, y: 0},
        {
          spring: zoomMedia.dismiss.cancelPositionSpring,
          velocity: {x: velocity.x, y: velocity.y},
        },
        {reducedMotion: 'keep'},
      );
      animator.animate(
        {scale: 1},
        {spring: zoomMedia.dismiss.cancelSizeSpring},
        {reducedMotion: 'keep'},
      );
    },
    {isEnabled: options.dismiss?.isEnabled === true, manageStyle: false},
  );

  useIsomorphicLayoutEffect(() => {
    animator.stop();
    animator.set({x: 0, y: 0, scale: 1});
    targetRef.current = IDENTITY;
    pinchRef.current = null;
    panRef.current = null;
    dismissRef.current = null;
    leavingRef.current = false;
    zoomedRef.current = false;
    geometryRef.current = null;
  }, [animator, options.itemKey]);

  // A rotation or resize keeps the same photo point centred at the same
  // on-screen size.
  useEffect(() => {
    const stage = options.stageRef.current;
    if (stage == null || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const observer = new ResizeObserver(() => {
      const before = geometryRef.current;
      if (before == null || !zoomedRef.current) {
        return;
      }
      const after = measure();
      if (after == null) {
        return;
      }
      animator.stop();
      const next = transformForResize(before, after, targetRef.current);
      write(next);
      setZoomed(isZoomed(after, next));
    });
    observer.observe(stage);
    return () => observer.disconnect();
    // The stage element is stable for the dialog's lifetime.
  }, [animator, measure, options.stageRef, setZoomed, write]);

  // The keyboard works on where the photo is going, like UIKit's model
  // values: a press during a settle continues from that settle's end.
  const zoomIn = useCallback(() => {
    const geometry = measure();
    if (geometry == null || zoomedRef.current) {
      return;
    }
    const centre = {x: geometry.width / 2, y: geometry.height / 2};
    settleTo(
      geometry,
      doubleTapTarget(geometry, targetRef.current, centre),
      undefined,
    );
  }, [measure, settleTo]);

  const zoomOut = useCallback(() => {
    const geometry = measure();
    if (geometry == null || !zoomedRef.current) {
      return;
    }
    settleTo(
      geometry,
      restingTransform(geometry, {...IDENTITY, scale: geometry.minScale}),
      undefined,
    );
  }, [measure, settleTo]);

  // One object for the component's lifetime: every member is stable.
  return useMemo(
    () => ({
      contentRef,
      isZoomed: () => zoomedRef.current,
      toggle: () => (zoomedRef.current ? zoomOut() : zoomIn()),
      zoomIn,
      zoomOut,
      panBy: (dx: number, dy: number) => {
        const geometry = measure();
        if (geometry == null || !zoomedRef.current) {
          return;
        }
        settleTo(
          geometry,
          pannedBy(geometry, targetRef.current, dx, dy),
          undefined,
        );
      },
      isAtEdge: (direction: PanDirection) => {
        const geometry = geometryRef.current ?? measure();
        if (geometry == null || !zoomedRef.current) {
          return true;
        }
        return isAtEdgeOf(geometry, direction);
      },
      reset: () => {
        if (!leavingRef.current) {
          return;
        }
        leavingRef.current = false;
        dismissRef.current = null;
        animator.stop();
        animator.set({x: 0, y: 0, scale: 1, opacity: 1});
        targetRef.current = IDENTITY;
      },
      fittedBox: () => {
        const geometry = measure();
        if (geometry == null) {
          return null;
        }
        const origin = originRef.current;
        return {
          x: origin.x + geometry.fit.x,
          y: origin.y + geometry.fit.y,
          width: geometry.fit.width,
          height: geometry.fit.height,
        };
      },
      shownBox: () => {
        const geometry = measure();
        if (geometry == null) {
          return null;
        }
        const origin = originRef.current;
        const {x, y, scale} = current();
        return {
          x: origin.x + geometry.fit.x + x,
          y: origin.y + geometry.fit.y + y,
          width: geometry.fit.width * scale,
          height: geometry.fit.height * scale,
        };
      },
      play: (curves, options) => {
        targetRef.current = IDENTITY;
        return animator.play(curves, options);
      },
      rest: () => {
        leavingRef.current = false;
        dismissRef.current = null;
        pinchRef.current = null;
        panRef.current = null;
        animator.stop();
        animator.set({x: 0, y: 0, scale: 1, opacity: 1});
        targetRef.current = IDENTITY;
        setZoomed(false);
      },
    }),
    [
      animator,
      contentRef,
      current,
      isAtEdgeOf,
      measure,
      setZoomed,
      settleTo,
      zoomIn,
      zoomOut,
    ],
  );
}
