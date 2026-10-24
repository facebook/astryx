// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useZoomStage.ts
 * @input A stage element ref (clipping, centring the photo), whether zoom is on, the
 *   current item's key, and callbacks for zoom changes and taps outside the
 *   photo
 * @output Exports `useZoomStage`: Lightbox's zoom and pan as a zooming
 *   UIScrollView — pinch about the fingers with the pan riding along, the
 *   give past the zoom limits and the eased return, double tap to the tapped
 *   point (Photos' aspect fill), a zoomed pan with UIScrollView's rubber
 *   band and coast — plus the
 *   callback ref for the photo and an imperative API for the keyboard
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
 * - pan (one or two fingers), moving a zoomed photo;
 * - double tap: zoom in as Photos does (until the photo fills the stage,
 *   the tapped point brought to the centre), or back to the fitted size;
 * - single tap, which waits for the double tap to fail: a tap that lands
 *   outside the photo is reported (Lightbox closes on it);
 * - a zero-duration press beside them all (UIKit's touch-down idiom): a
 *   finger landing on a moving photo stops it where it shows, as a scroll
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
 * SYNC: When modified, update zoomStage.ts, Lightbox.tsx and
 * __tests__/LightboxZoom.interaction.browser.spec.ts.
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
import type {AnimateOptions} from '../motion/animator';
import {decayRestDistance} from '../motion/decay';
import {useAnimator} from '../motion/useAnimator';
import {
  IDENTITY,
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

export interface UseZoomStageOptions {
  /** The stage: the photo's clipping parent, which centres it. */
  stageRef: RefObject<HTMLElement | null>;
  /** Zoom is on (an image item with `hasZoom`). */
  isEnabled: boolean;
  /** Changes when another item shows; the photo returns to the fitted size. */
  itemKey: unknown;
  /** The photo became zoomed or returned to the fitted size. */
  onZoomedChange: (isZoomed: boolean) => void;
  /** A single tap landed outside the photo. */
  onTapOutside?: () => void;
  /** A pan began (a release over the backdrop must not close). */
  onDragStart?: () => void;
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
}

interface PinchSession {
  readonly start: ZoomTransform;
  /** The pinch's own scale the start corresponds to (past a limit, more). */
  readonly startPinchScale: number;
  readonly anchor: StagePoint;
  centroid: StagePoint;
}

interface PanSession {
  /** The finger-travel transform when the session started. */
  readonly raw: ZoomTransform;
  readonly translation: Point;
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

  const [recognizers] = useState(() => {
    const pinch = new PinchGestureRecognizer({name: 'lightbox-zoom-pinch'});
    const pan = new PanGestureRecognizer({
      name: 'lightbox-zoom-pan',
      maximumNumberOfTouches: 2,
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
        settleTo(geometry, target, 'keep');
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
      coast(geometry, pan.state === 'ended' ? pan.velocity() : {x: 0, y: 0});
    },
    recognizerOptions,
  );

  useGestureRecognizer(
    options.stageRef,
    () => recognizers.touchDown,
    touchDown => {
      if (touchDown.state === 'began') {
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
          targetRef.current = shown;
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
        settleTo(geometry, limit, 'keep');
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
      settleTo(
        geometry,
        doubleTapTarget(geometry, current(), point),
        undefined,
      );
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

  // Another item: back to the fitted size before it paints. Lightbox resets
  // its own zoomed state during that render.
  useIsomorphicLayoutEffect(() => {
    animator.stop();
    animator.set({x: 0, y: 0, scale: 1});
    targetRef.current = IDENTITY;
    pinchRef.current = null;
    panRef.current = null;
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
    }),
    [contentRef, measure, settleTo, zoomIn, zoomOut],
  );
}
