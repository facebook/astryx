// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useZoomCore.ts
 * @input A stage element ref (clipping, centring the photo), whether zoom is
 *   on, whether the touch layer is on, the current item's key, and callbacks
 *   for zoom changes and drags
 * @output Exports `useZoomCore`: Lightbox's zoom stage for every pointer —
 *   the photo's transform, written through the compositor animator; its
 *   geometry; UIScrollView's eased settle; Lightbox's released zoom for the
 *   keyboard and a double-click (2x about the centre and back over a 200 ms
 *   ease-out, from any pointer when the touch layer is off); the keyboard's
 *   pan; and a drag (a mouse's, or any pointer's when the touch layer is
 *   off) that pans a zoomed photo and stops at its edges — plus the
 *   callback ref for
 *   the photo and the imperative API Lightbox calls. The finger paths
 *   (pinch, finger pan, double tap, the catch) are the touch layer,
 *   useZoomStage.ts, which drives this core
 * @position Lightbox's shared zoom stage (internal); the geometry is in
 *   zoomStage.ts
 *
 * A mouse never rubber-bands or coasts: its drag stops at the photo's edges
 * and where it is released. Every zoom step runs on the compositor as baked
 * keyframes (no React render, no layout read after a step begins); a
 * keyboard step continues from where the photo is going (UIKit's model
 * value), so presses during a settle add up. React hears only discrete
 * changes (`onZoomedChange`).
 *
 * SYNC: When modified, update useZoomStage.ts, zoomStage.ts, Lightbox.tsx
 * and __tests__/LightboxZoomModes.interaction.browser.spec.ts.
 */

import {useCallback, useEffect, useMemo, useRef, type RefObject} from 'react';
import type {Point} from '../gestures/types';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import type {Animator} from '../motion/animator';
import {resolveMotion} from '../motion/resolveMotion';
import {registerReducedMotionCrossFade} from '../motion/uikit/timing';
import {zoomMedia} from '../motion/uikit/zoomMedia';
import {useAnimator} from '../motion/useAnimator';
import {observeResize} from '../utils/sharedResizeObserver';
import {
  IDENTITY,
  RELEASED_ZOOM,
  doubleTapScaleFor,
  draggedTransform,
  isZoomed,
  maxScaleFor,
  pannedBy,
  releasedZoomTarget,
  restingTransform,
  settleCurves,
  transformForResize,
  type StagePoint,
  type ZoomGeometry,
  type ZoomTransform,
} from './zoomStage';

/** Set on the stage while a finger or the mouse drags a zoomed photo. */
export const ZOOM_DRAGGING_ATTRIBUTE = 'data-zoom-dragging';

export interface UseZoomCoreOptions {
  /** The stage: the photo's clipping parent, which centres it. */
  stageRef: RefObject<HTMLElement | null>;
  /** Zoom is on (an image item with `hasZoom`). */
  isEnabled: boolean;
  /**
   * The touch layer is on (a coarse primary pointer): fingers and pens are
   * its recognizers'. Off, a double-click from any pointer is the mouse's.
   */
  isTouch: boolean;
  /** Changes when another item shows; the photo returns to the fitted size. */
  itemKey: unknown;
  /** The photo became zoomed or returned to the fitted size. */
  onZoomedChange: (isZoomed: boolean) => void;
  /** A drag began (a release over the backdrop must not close). */
  onDragStart?: () => void;
}

/** What Lightbox calls: the photo's ref and the keyboard's zoom and pan. */
export interface ZoomStage {
  /** Callback ref for the photo element the stage moves and scales. */
  readonly contentRef: (element: HTMLElement | null) => void;
  /** Whether the photo is zoomed now. */
  isZoomed(): boolean;
  /** Keyboard: zoom in 2x about the stage's centre, or out when zoomed. */
  toggle(): void;
  zoomIn(): void;
  zoomOut(): void;
  /** Keyboard: move a zoomed photo by (dx, dy) px, kept inside the stage. */
  panBy(dx: number, dy: number): void;
}

/** The core as the touch layer drives it. */
export interface ZoomCore {
  /** The API Lightbox calls (one object for the component's lifetime). */
  readonly api: ZoomStage;
  readonly animator: Animator;
  /** The last measured geometry (null until a step measures it). */
  readonly geometryRef: {current: ZoomGeometry | null};
  /** Where the photo is going: the last written value or the settle's end. */
  readonly targetRef: {current: ZoomTransform};
  readonly zoomedRef: {current: boolean};
  readonly optionsRef: {current: UseZoomCoreOptions};
  /** Reads the stage and the photo (layout): when a step begins. */
  measure(): ZoomGeometry | null;
  /** Client px to stage px, from the last measure. */
  toStage(point: Point): StagePoint;
  /** Where the photo shows now (its presentation value). */
  current(): ZoomTransform;
  /** Shows the photo at `transform` at once. */
  write(transform: ZoomTransform): void;
  /** Where the photo is going, when an animation the core did not start ends there. */
  setTarget(transform: ZoomTransform): void;
  setZoomed(next: boolean): void;
  /**
   * UIScrollView's eased settle (a release past a limit, a zoom to a rect),
   * or with `released` Lightbox's released 200 ms ease-out (the mouse and the
   * keyboard, see RELEASED_ZOOM). Under Reduce Motion the animator's default
   * applies (design:reduced-motion): a fade in place on a touch screen, or
   * for a touch drag's release (`touchRelease`); at once otherwise.
   */
  settleTo(
    geometry: ZoomGeometry,
    target: ZoomTransform,
    options?: {touchRelease?: boolean; released?: boolean},
  ): void;
}

export function useZoomCore(options: UseZoomCoreOptions): ZoomCore {
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
  const targetRef = useRef<ZoomTransform>(IDENTITY);

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

  const toStage = useCallback(
    (point: Point): StagePoint => ({
      x: point.x - originRef.current.x,
      y: point.y - originRef.current.y,
    }),
    [],
  );

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

  const setTarget = useCallback((transform: ZoomTransform) => {
    targetRef.current = transform;
  }, []);

  const setZoomed = useCallback((next: boolean) => {
    if (zoomedRef.current !== next) {
      zoomedRef.current = next;
      optionsRef.current.onZoomedChange(next);
    }
  }, []);

  const settleTo = useCallback(
    (
      geometry: ZoomGeometry,
      target: ZoomTransform,
      {
        touchRelease = false,
        released = false,
      }: {touchRelease?: boolean; released?: boolean} = {},
    ) => {
      const from = current();
      animator.stop();
      // A Reduce Motion cross-fade stopped mid-dip would leave the photo dim
      // (its opacity frozen, and the next dip returning to it): every settle
      // starts from, and so ends at, full opacity.
      if (animator.get('opacity') !== 1) {
        animator.set({opacity: 1});
      }
      targetRef.current = target;
      setZoomed(isZoomed(geometry, target));
      if (
        from.x === target.x &&
        from.y === target.y &&
        from.scale === target.scale
      ) {
        return;
      }
      // The settle's curve is the `timing.curves.move` role (registered
      // once; idempotent); the mouse's and the keyboard's is the released
      // ease-out.
      registerReducedMotionCrossFade();
      const curves = released
        ? settleCurves(from, target, RELEASED_ZOOM.curve, RELEASED_ZOOM.seconds)
        : settleCurves(
            from,
            target,
            resolveMotion(
              optionsRef.current.stageRef.current,
              zoomMedia.settle.curve,
            ),
          );
      animator.play(
        {x: curves.x, y: curves.y, scale: curves.scale},
        {touchRelease},
      );
    },
    [animator, current, setZoomed],
  );

  // The mouse keeps Lightbox's released zoom (spec:AST-017 FR59): a
  // double-click zooms in 2x about the centre or back, and a drag pans a
  // zoomed photo, stopping at its edges (unbounded, it could carry the photo
  // out of view) and where it is released. Both take any pointer when the
  // touch layer is off (a pen or a finger where the primary pointer is fine,
  // interaction-modality INV4); with it on, fingers and pens are its
  // recognizers'.
  const isEnabled = options.isEnabled;
  useEffect(() => {
    const stage = optionsRef.current.stageRef.current;
    if (!isEnabled || stage == null) {
      return undefined;
    }
    let lastPointerType = '';
    let drag: {
      readonly pointerId: number;
      readonly start: Point;
      readonly from: ZoomTransform;
      began: boolean;
    } | null = null;
    const onPointerDown = (event: PointerEvent) => {
      lastPointerType = event.pointerType;
      if (
        (event.pointerType !== 'mouse' && optionsRef.current.isTouch) ||
        event.button !== 0 ||
        !zoomedRef.current ||
        measure() == null
      ) {
        return;
      }
      animator.stop();
      drag = {
        pointerId: event.pointerId,
        start: {x: event.clientX, y: event.clientY},
        from: current(),
        began: false,
      };
    };
    const onPointerMove = (event: PointerEvent) => {
      const geometry = geometryRef.current;
      if (
        drag == null ||
        event.pointerId !== drag.pointerId ||
        geometry == null
      ) {
        return;
      }
      const dx = event.clientX - drag.start.x;
      const dy = event.clientY - drag.start.y;
      if (!drag.began) {
        // A press that has not moved is still a click; the drag, and its
        // grab cursor, begin with the first pixel of travel.
        if (dx === 0 && dy === 0) {
          return;
        }
        drag.began = true;
        stage.setPointerCapture?.(event.pointerId);
        stage.setAttribute(ZOOM_DRAGGING_ATTRIBUTE, '');
        optionsRef.current.onDragStart?.();
      }
      write(
        draggedTransform(
          geometry,
          {x: drag.from.x + dx, y: drag.from.y + dy, scale: drag.from.scale},
          false,
        ),
      );
    };
    const onPointerEnd = (event: PointerEvent) => {
      if (drag == null || event.pointerId !== drag.pointerId) {
        return;
      }
      if (drag.began) {
        stage.removeAttribute(ZOOM_DRAGGING_ATTRIBUTE);
      }
      drag = null;
    };
    const onDoubleClick = () => {
      if (lastPointerType !== 'mouse' && optionsRef.current.isTouch) {
        return;
      }
      const geometry = measure();
      if (geometry == null) {
        return;
      }
      settleTo(geometry, releasedZoomTarget(geometry, current()), {
        released: true,
      });
    };
    stage.addEventListener('pointerdown', onPointerDown);
    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerup', onPointerEnd);
    stage.addEventListener('pointercancel', onPointerEnd);
    stage.addEventListener('dblclick', onDoubleClick);
    return () => {
      stage.removeEventListener('pointerdown', onPointerDown);
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerup', onPointerEnd);
      stage.removeEventListener('pointercancel', onPointerEnd);
      stage.removeEventListener('dblclick', onDoubleClick);
      stage.removeAttribute(ZOOM_DRAGGING_ATTRIBUTE);
    };
  }, [animator, current, isEnabled, measure, settleTo, write]);

  // Another item: back to the fitted size before it paints. Lightbox resets
  // its own zoomed state during that render.
  useIsomorphicLayoutEffect(() => {
    animator.stop();
    animator.set({x: 0, y: 0, scale: 1, opacity: 1});
    targetRef.current = IDENTITY;
    zoomedRef.current = false;
    geometryRef.current = null;
  }, [animator, options.itemKey]);

  // A rotation or resize keeps the same photo point centred at the same
  // on-screen size (the shared resize observer).
  const onResize = useCallback(() => {
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
  }, [animator, measure, setZoomed, write]);
  // The stage mounts with the viewer's first media, which can come after the
  // viewer (a gallery mounted closed while its photos load), so the
  // subscription follows the element after every render rather than the
  // one there at mount.
  const resizeRef = useRef<{stage: HTMLElement; stop: () => void} | null>(null);
  const onResizeRef = useRef(onResize);
  useIsomorphicLayoutEffect(() => {
    onResizeRef.current = onResize;
    const stage = optionsRef.current.stageRef.current;
    if (resizeRef.current?.stage === stage) {
      return;
    }
    resizeRef.current?.stop();
    resizeRef.current =
      stage == null
        ? null
        : {stage, stop: observeResize(stage, () => onResizeRef.current())};
  });
  useEffect(
    () => () => {
      resizeRef.current?.stop();
      resizeRef.current = null;
    },
    [],
  );

  // The keyboard works on where the photo is going, like UIKit's model
  // values: a press during a settle continues from that settle's end.
  const zoomIn = useCallback(() => {
    const geometry = measure();
    if (geometry == null || zoomedRef.current) {
      return;
    }
    settleTo(geometry, releasedZoomTarget(geometry, targetRef.current), {
      released: true,
    });
  }, [measure, settleTo]);

  const zoomOut = useCallback(() => {
    const geometry = measure();
    if (geometry == null || !zoomedRef.current) {
      return;
    }
    settleTo(
      geometry,
      restingTransform(geometry, {...IDENTITY, scale: geometry.minScale}),
      {released: true},
    );
  }, [measure, settleTo]);

  const api = useMemo(
    (): ZoomStage => ({
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
        settleTo(geometry, pannedBy(geometry, targetRef.current, dx, dy), {
          released: true,
        });
      },
    }),
    [contentRef, measure, settleTo, zoomIn, zoomOut],
  );

  // One object for the component's lifetime: every member is stable.
  return useMemo(
    () => ({
      api,
      animator,
      geometryRef,
      targetRef,
      zoomedRef,
      optionsRef,
      measure,
      toStage,
      current,
      write,
      setTarget,
      setZoomed,
      settleTo,
    }),
    [
      api,
      animator,
      measure,
      toStage,
      current,
      write,
      setTarget,
      setZoomed,
      settleTo,
    ],
  );
}
