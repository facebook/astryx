// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useZoomCore.ts
 * @input A stage element ref (clipping, centring the photo), the element the
 *   gestures attach to (the stage, or a gallery's track), whether zoom is
 *   on, the current item's key, and the zoom-change callback
 * @output Exports `useZoomCore`: Lightbox's zoom stage for every pointer —
 *   the photo's transform, written through the compositor animator; its
 *   geometry; UIScrollView's eased settle; Lightbox's released zoom for the
 *   keyboard (2x about the centre and back over a 200 ms ease-out) and the
 *   keyboard's pan — plus the callback ref for the photo and the imperative
 *   API Lightbox calls (with `isAtEdge` for an outer pager). The pointer
 *   paths (pinch and ctrl-wheel, pan and wheel, double tap, the catch) are
 *   useZoomStage.ts's, for a mouse, a pen and a finger alike (spec:AST-094
 *   FR43), and drive this core
 * @position Lightbox's shared zoom stage (internal); the geometry is in
 *   zoomStage.ts
 *
 * Every zoom step runs on the compositor as baked
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
import {createRectMorph, type RectMorph} from '../motion/rectMorph';
import {resolveMotion} from '../motion/resolveMotion';
import {registerReducedMotionCrossFade} from '../motion/uikit/timing';
import {zoomMedia} from '../motion/uikit/zoomMedia';
import {useAnimator} from '../motion/useAnimator';
import {observeResize} from '../utils/sharedResizeObserver';
import {
  IDENTITY,
  RELEASED_ZOOM,
  doubleTapScaleFor,
  isZoomed,
  maxScaleFor,
  pannedBy,
  releasedZoomTarget,
  restRange,
  restingTransform,
  settleCurves,
  transformForResize,
  type StagePoint,
  type ZoomGeometry,
  type ZoomTransform,
} from './zoomStage';

/** Set on the stage while a finger or the mouse drags a zoomed photo. */
export const ZOOM_DRAGGING_ATTRIBUTE = 'data-zoom-dragging';

/** A drag's initial direction on screen. */
export type PanDirection = 'left' | 'right';

export interface UseZoomCoreOptions {
  /** The stage: the box the photo is fitted and centred in, clipping it. */
  stageRef: RefObject<HTMLElement | null>;
  /**
   * Where the gestures attach and what the resize observer watches: the
   * stage by default. In a pager, the track (the pager's own pan sits on
   * the stage, each element has one `touch-action`, and every page shares
   * the track's size).
   */
  surfaceRef?: RefObject<HTMLElement | null>;
  /** Zoom is on (an image item with `hasZoom`). */
  isEnabled: boolean;
  /** Changes when another item shows; the photo returns to the fitted size. */
  itemKey: unknown;
  /** The photo became zoomed or returned to the fitted size. */
  onZoomedChange: (isZoomed: boolean) => void;
}

/** A box in client px. */
export interface ZoomBox {
  x: number;
  y: number;
  width: number;
  height: number;
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
  /**
   * Whether a zoomed photo can no longer move with a drag toward
   * `direction` (its edge on that side is at the stage's): a pager takes
   * such a drag, as an outer paging scroll view does.
   */
  isAtEdge(direction: PanDirection): boolean;
  /** The photo's fitted box (its transform's reference), client px. */
  fittedBox(): ZoomBox | null;
  /** Where the photo shows now (its transform applied), client px. */
  shownBox(): ZoomBox | null;
  /**
   * The photo's rect morph (architecture:layer-runtime INV15's shared morph)
   * on the stage's own animator, so the zoom transition and pinch, pan and
   * settle share one set of channels; the photo with it. Null before a photo
   * attaches.
   */
  morph(): {morph: RectMorph; photo: HTMLElement} | null;
  /** The photo at its fitted size, opaque, at once (after a transition). */
  rest(): void;
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
  /** Client px of the stage's top-left corner when last measured. */
  readonly originRef: {current: Point};
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
  /** Whether the photo is moving (shown away from where it is going). */
  isMoving(): boolean;
  /** Whether a zoomed photo's edge toward `direction` is at the stage's. */
  isAtEdgeOf(geometry: ZoomGeometry, direction: PanDirection): boolean;
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

  // The photo's rect morph, on the stage's animator (`morph`).
  const morphRef = useRef<{photo: HTMLElement; morph: RectMorph} | null>(null);
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

  const isMoving = useCallback((): boolean => {
    const shown = current();
    const target = targetRef.current;
    return (
      Math.abs(shown.x - target.x) > 0.01 ||
      Math.abs(shown.y - target.y) > 0.01 ||
      Math.abs(shown.scale - target.scale) > 0.0001
    );
  }, [current]);

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
  // on-screen size (the shared resize observer). It watches the surface: in
  // a gallery the stage moves to each current page, while the track, whose
  // size every page shares, stays.
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
  // The surface mounts with the viewer's first media, which can come after
  // the viewer (a gallery mounted closed while its photos load), so the
  // subscription follows the element, and zoom turning on or off, after every
  // render rather than the one there at mount.
  const surfaceRef = options.surfaceRef ?? options.stageRef;
  const isEnabled = options.isEnabled;
  const resizeRef = useRef<{surface: HTMLElement; stop: () => void} | null>(
    null,
  );
  const onResizeRef = useRef(onResize);
  useIsomorphicLayoutEffect(() => {
    onResizeRef.current = onResize;
    const surface = isEnabled ? surfaceRef.current : null;
    if ((resizeRef.current?.surface ?? null) === surface) {
      return;
    }
    resizeRef.current?.stop();
    resizeRef.current =
      surface == null
        ? null
        : {surface, stop: observeResize(surface, () => onResizeRef.current())};
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
      isAtEdge: (direction: PanDirection) => {
        const geometry = geometryRef.current ?? measure();
        if (geometry == null || !zoomedRef.current) {
          return true;
        }
        return isAtEdgeOf(geometry, direction);
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
      morph: () => {
        const photo = contentElementRef.current;
        if (photo == null) {
          return null;
        }
        // One morph per photo element (paging shows another).
        if (morphRef.current?.photo !== photo) {
          morphRef.current = {photo, morph: createRectMorph(photo, {animator})};
        }
        // A transition takes the photo over and leaves it at its fitted size.
        targetRef.current = IDENTITY;
        return morphRef.current;
      },
      rest: () => {
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

  // One object for the component's lifetime: every member is stable.
  return useMemo(
    () => ({
      api,
      animator,
      geometryRef,
      targetRef,
      zoomedRef,
      optionsRef,
      originRef,
      measure,
      toStage,
      current,
      write,
      setTarget,
      setZoomed,
      isMoving,
      isAtEdgeOf,
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
      isMoving,
      isAtEdgeOf,
      settleTo,
    ],
  );
}
