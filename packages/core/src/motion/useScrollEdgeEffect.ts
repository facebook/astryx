// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useScrollEdgeEffect.ts
 * @input React, StyleX, IntersectionObserver, the motion animator, the springs
 *   and their registration from the component that animates with them (a
 *   bar's: the bars domain of the UIKit constants table, registered here
 *   before the first animation), the colour tokens, the touch presentation
 *   resolver (utils/touchPresentation) and the shared finger-scroll reader
 *   (gestures/useFingerScroll)
 * @output Exports `useScrollEdgeEffect`: props for a bar's scroll edge effect
 *   layer (the veil, its shape and colour) and for the sentinel that tells
 *   when content has moved under the bar, with the veil fading in and out on
 *   UIKit's measured springs
 * @position Internal motion module (not exported from the package entry
 *   point) for the iOS 26 look of a bar over scrolling content, under a
 *   finger: AppShell's pinned header uses it, and Lab's NavigationStack
 *   through core's internal motion entry (`@astryxdesign/core/internal/
 *   motion`). With a mouse it observes nothing and the veil stays hidden
 *
 * iOS 26 bars paint no background of their own. Once the content has moved
 * more than `bars.scrollEdgeEffect.switchPt` (10 pt) under the bar, the
 * scroll view's edge effect fades in on `bars.scrollEdgeEffect.appear`, and
 * it fades out on `bars.scrollEdgeEffect.disappear` when the content comes
 * back: a switch on the scroll offset with a timed fade, not a ramp that
 * follows the scroll. Under a finger it is one model on every touch device
 * (the coarse pointer: `useTouchPresentation()` in script, the literal
 * `@media (pointer: coarse)` key in the styles, spelled as the resolver's
 * touch constant).
 *
 * The layer is a veil of one colour over the content, never a blur: its mask
 * is `0.95 × (1 − Φ((y − edge) / veil.softnessPt))`, half strength at `edge`
 * (the bar's bottom edge), sampled every 6px over ±3σ
 * (useScrollEdgeEffect.test.tsx recomputes it). It is denser than UIKit's
 * (`veil.maxAlpha` 0.85, its edge `veil.edgeAboveContentBottomPt` above the
 * bar's bottom) so a bar's title keeps 4.5:1 over the brightest scrolled
 * content (WCAG 1.4.3). Where the browser supports
 * prefers-reduced-transparency, Reduce Transparency makes it an opaque band
 * with a hard edge at the bar's bottom, as UIKit does.
 *
 * The scroll offset is never read per frame. The sentinel is a box exactly
 * `switchPt` tall at the top of the scrolled content, where the content sits
 * at rest. An IntersectionObserver reports when that box leaves its root
 * (the document's viewport for a page that scrolls, or the scroll container
 * from its padding edge, less the `rootInset` a bar overlaying it takes):
 * its bottom edge passes the top of the root exactly when the content has
 * moved more than `switchPt` under the bar. Engines disagree on a scroll
 * container's root rectangle: Chromium takes its padding box, WebKit (iOS
 * 26.2 Safari) its content box, so a container's top padding (a screen whose
 * content starts below an overlaying bar) would put WebKit's switch that far
 * lower. The first report measures where the root's top sits against the
 * container's padding edge and, when they differ, observes again with the
 * difference taken off the margin, so the switch is at the same offset in
 * every engine. A box whose edge only touches the root still
 * intersects, so 10 pt is off and 10.25 pt is on, as measured. Overscroll
 * above the rest offset moves the box down and keeps the effect off. The
 * fade runs on the compositor through the motion animator, so a busy main
 * thread delays when it starts (UIKit decides on the main thread too), never
 * how it plays.
 *
 * The first report puts the effect in place without a fade, so a page that
 * loads scrolled shows it at once. After that the effect fades only when a
 * finger drives the scroll (a finger is down in the scroller, or its
 * momentum is still running: `useFingerScroll`, over the gesture host,
 * which ends at the scroller's `scrollend`). A scroll the program starts
 * (`scrollTo`, a status-bar tap) switches it at once, with no compositing
 * layer. That is a WebKit engine workaround: on iOS 26.2, while a composited
 * layer sits under a sticky header (a running animation, `will-change`, a
 * fixed element), a programmatic scroll back to the top makes WebKit drop
 * the header's items for about two frames (plain-HTML repro: a sticky
 * header over a child layer, `scrollTo` 120 px and back to 0; no layer, no
 * blank frame in 5 takes; `will-change: opacity` on the child, a blank in
 * 5 of 5, with no opacity change at all; the layer dropped in the same task
 * as the scroll, none in 6). A finger's scroll never blanks them. So the
 * layer is composited only while a finger works the scroller: from the
 * finger's landing, so a fade that starts mid-drag finds its layer (on a
 * software rasterizer, creating it as the fade starts costs that frame),
 * until the finger's scroll has ended; the program's switch is written
 * without promotion. Where the browser sends no `scrollend`, the
 * finger-scroll watch ends a finger's scroll 150 ms after its last scroll
 * event, and the promotion is checked again `PROMOTION_RECHECK_MS` (200 ms)
 * after that event, so no fling leaves the layer promoted. The workaround
 * goes once WebKit no longer drops a sticky header's items when the program
 * scrolls over a composited layer: the plain-HTML repro above, re-run on
 * each iOS release, shows when; the program's scroll then fades as UIKit's
 * does. The fade is opacity only; under Reduce Motion the
 * animator plays its own cross-fade (design:reduced-motion DR2). The springs
 * are the bars table's measured `bars.scrollEdgeEffect.appear` and
 * `.disappear`, internal constants: touch motion stays internal until the
 * public motion-token set is decided (`spec:AST-094` FR4, DEC-11).
 *
 * SYNC: When modified, update useScrollEdgeEffect.test.tsx and the callers
 * (AppShell, Lab's NavigationStack).
 */

import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {useCallback, useEffect, useRef, type RefObject} from 'react';
import {getGestureHost} from '../gestures/GestureHost';
import {useFingerScroll} from '../gestures/useFingerScroll';
import {colorVars} from '../theme/tokens.stylex';
import type {SpringDescription} from './spring';
import {useAnimator} from './useAnimator';
import {useTouchPresentation} from '../utils/touchPresentation';

/** No scroller: nothing is watched (a mouse, or the effect is off). */
const NO_SCROLLER: RefObject<Element | null> = {current: null};

/**
 * The private custom property the layer's `will-change` reads: `opacity`
 * while a finger works the scroller (see the file header), unset otherwise.
 * Set inline by this hook only; it is not theme data.
 */
export const SCROLL_EDGE_LAYER_PROMOTION = '--_scroll-edge-will-change';

const PASSIVE_CAPTURE = {capture: true, passive: true} as const;

/**
 * Where the browser sends no `scrollend`, how long after the scroller's last
 * scroll event the layer's promotion is checked again, in ms: past the
 * finger-scroll watch's 150 ms spell (gestures/fingerScroll.ts), after which
 * it reads the finger's scroll as ended, so a fling never leaves the layer
 * promoted.
 */
const PROMOTION_RECHECK_MS = 200;

const styles = stylex.create({
  // Sized by `edge` (dynamicStyles.geometry): it reaches
  // `bars.scrollEdgeEffect.softExtentPt` (54.8px) past the bar's bottom, and
  // the mask's stops are measured from its bottom (the last one 10.8px above
  // it, the half-strength point 54.8px above it, at `edge`).
  layer: {
    display: {
      default: 'none',
      '@media (pointer: coarse)': 'block',
    },
    position: 'absolute',
    insetInline: 0,
    insetBlockStart: 0,
    pointerEvents: 'none',
    opacity: 0,
    // Composited only while a finger works the scroller: the hook sets the
    // private property from the finger's landing until its scroll ends (a composited
    // layer under a sticky bar makes iOS 26.2 drop the bar's items when the
    // program scrolls back to the top; see the file header).
    willChange: 'var(--_scroll-edge-will-change, auto)',
    maskImage: {
      default:
        'linear-gradient(to bottom, rgb(0 0 0 / 0.950) calc(100% - 118.8px), rgb(0 0 0 / 0.949) calc(100% - 112.8px), rgb(0 0 0 / 0.948) calc(100% - 106.8px), rgb(0 0 0 / 0.945) calc(100% - 100.8px), rgb(0 0 0 / 0.938) calc(100% - 94.8px), rgb(0 0 0 / 0.922) calc(100% - 88.8px), rgb(0 0 0 / 0.893) calc(100% - 82.8px), rgb(0 0 0 / 0.845) calc(100% - 76.8px), rgb(0 0 0 / 0.772) calc(100% - 70.8px), rgb(0 0 0 / 0.675) calc(100% - 64.8px), rgb(0 0 0 / 0.559) calc(100% - 58.8px), rgb(0 0 0 / 0.433) calc(100% - 52.8px), rgb(0 0 0 / 0.312) calc(100% - 46.8px), rgb(0 0 0 / 0.207) calc(100% - 40.8px), rgb(0 0 0 / 0.127) calc(100% - 34.8px), rgb(0 0 0 / 0.071) calc(100% - 28.8px), rgb(0 0 0 / 0.036) calc(100% - 22.8px), rgb(0 0 0 / 0.017) calc(100% - 16.8px), rgb(0 0 0 / 0.007) calc(100% - 10.8px))',
      '@media (prefers-reduced-transparency: reduce)': 'none',
    },
  },
  // `bars.scrollEdgeEffect.switchPt` (10px) tall at the top of the scrolled
  // content.
  sentinel: {
    position: 'absolute',
    insetBlockStart: 0,
    insetInlineStart: 0,
    width: 1,
    height: 10,
    pointerEvents: 'none',
    visibility: 'hidden',
  },
});

const dynamicStyles = stylex.create({
  // The layer ends 54.8px below the veil's edge (the soft extent); Reduce
  // Transparency ends the opaque band at the edge, the bar's bottom.
  geometry: (height: string, reducedHeight: string, color: string) => ({
    height: {
      default: height,
      '@media (prefers-reduced-transparency: reduce)': reducedHeight,
    },
    backgroundColor: color,
  }),
});

export interface UseScrollEdgeEffectOptions {
  /**
   * Whether the effect runs. When false, and always with a mouse, the veil
   * stays transparent and nothing is observed.
   * @default true
   */
  readonly enabled?: boolean;
  /**
   * The scroll container whose content passes under the bar. Omit for a
   * page that scrolls (the viewport).
   */
  readonly root?: RefObject<Element | null>;
  /**
   * How far, in px, a bar overlays the top of `root` from its padding edge:
   * `44` under a 44px bar, so the content counts as under the bar once it
   * has passed the bar's bottom edge. The same in every engine, whatever
   * top padding `root` has.
   * @default 0
   */
  readonly rootInset?: number;
  /**
   * The bar's bottom edge, where the veil is half strength, from the top of
   * the layer's containing block, as a CSS length without `calc()`: `100%`
   * inside the bar itself, `44px` under a 44px bar that overlays the screen.
   */
  readonly edge: string;
  /**
   * The veil's colour: the colour behind the bar's content.
   * @default the body background
   */
  readonly color?: string;
  /** Extra styles for the layer, e.g. its stacking order. */
  readonly layerXstyle?: StyleXStyles;
  /**
   * Extra styles for the sentinel, e.g. `insetBlockStart: 'auto'` and
   * `insetInlineStart: 'auto'` to leave it at its static position, the top of
   * the content it starts, with no positioned wrapper of its own.
   */
  readonly sentinelXstyle?: StyleXStyles;
  /**
   * The fades' springs: a bar's are `bars.scrollEdgeEffect.appear` and
   * `.disappear`, measured constants of its component's table. The component that
   * animates with a table imports it (motion/uikit/tableImports.test.ts), so
   * the springs and their registration come from it.
   */
  readonly springs: {
    readonly appear: SpringDescription;
    readonly disappear: SpringDescription;
  };
  /** Registers the springs' table; called before the first fade. */
  readonly registerSprings: () => void;
}

/** Props to spread on an element, ref included. */
interface ElementProps {
  readonly ref: (element: HTMLElement | null) => void;
  readonly 'aria-hidden': true;
  readonly className?: string;
  readonly style?: Readonly<Record<string, string | number>>;
}

export interface UseScrollEdgeEffectResult {
  /**
   * The veil: spread on an empty element positioned at the top of the bar's
   * containing block (the bar itself, or the screen under it), above the
   * content and below the bar's items.
   */
  readonly layerProps: ElementProps;
  /**
   * The sentinel: spread on an empty element at the top of the scrolled
   * content. It is absolutely positioned at the top of its containing block,
   * or, with `sentinelXstyle` setting its insets to `auto`, at its static
   * position (inside the scroll container, which must be its containing
   * block so that it scrolls with the content).
   */
  readonly sentinelProps: ElementProps;
}

/**
 * The iOS 26 scroll edge effect of a bar, under a finger: a veil that fades
 * in once the content has moved more than 10 pt under the bar and out when
 * it comes back.
 *
 * @example
 * ```
 * const edge = useScrollEdgeEffect({
 *   root: scrollerRef,
 *   rootInset: 44,
 *   edge: '44px',
 *   springs: bars.scrollEdgeEffect,
 *   registerSprings: registerBarsTable,
 * });
 * <div {...edge.layerProps} />
 * <div ref={scrollerRef}><div><div {...edge.sentinelProps} /></div>…</div>
 * ```
 */
export function useScrollEdgeEffect({
  enabled = true,
  root,
  rootInset = 0,
  edge,
  color = colorVars['--color-background-body'],
  layerXstyle,
  sentinelXstyle,
  springs,
  registerSprings,
}: UseScrollEdgeEffectOptions): UseScrollEdgeEffectResult {
  // Under a finger: the resolver's touch presentation, the same on every
  // touch device.
  const {isTouch} = useTouchPresentation();
  const isOn = enabled && isTouch;
  const {ref: layerRef, animator} = useAnimator({initial: {opacity: 0}});
  // Whether the scroll now moving is a finger's (the shared gesture host,
  // through useFingerScroll): the page's own scroll is the document's, a
  // container scrolls itself. Watched only while the effect runs, so a
  // mouse costs nothing.
  const isFingerScroll = useFingerScroll(
    !isOn
      ? NO_SCROLLER
      : (root ?? (typeof document === 'undefined' ? NO_SCROLLER : document)),
  );
  // The sentinel is owned through its callback ref, never React state
  // (architecture:react-component-runtime INV1): the ref keeps the node and
  // moves the running observer to a replacement node (INV6); the effect
  // creates the observer once the refs are attached.
  const sentinelElementRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useCallback((element: HTMLElement | null) => {
    const observer = observerRef.current;
    if (observer != null && sentinelElementRef.current != null) {
      observer.unobserve(sentinelElementRef.current);
    }
    sentinelElementRef.current = element;
    if (observer != null && element != null) {
      observer.observe(element);
    }
  }, []);

  useEffect(() => {
    if (!isOn || typeof IntersectionObserver === 'undefined') {
      return;
    }
    // The springs' table registers before the first animation.
    registerSprings();
    const sentinel = sentinelElementRef.current;
    const doc = sentinel?.ownerDocument ?? document;
    const container = root?.current ?? null;
    let isShown: boolean | null = null;
    // How far below the container's padding edge this engine starts the
    // root rectangle (its top padding in WebKit, 0 in Chromium): unknown
    // until the first report of a container; a page has no padding edge.
    let rootOffset: number | null = container == null ? 0 : null;
    let observer: IntersectionObserver;
    const report = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[entries.length - 1];
      if (entry == null) {
        return;
      }
      if (rootOffset == null && container != null) {
        const bounds = entry.rootBounds;
        const paddingEdge =
          container.getBoundingClientRect().top + container.clientTop;
        const offset =
          bounds == null ? 0 : Math.round(bounds.top - rootInset - paddingEdge);
        rootOffset = offset;
        if (offset !== 0) {
          // WebKit: observe again from the padding edge; this report was
          // measured from the content box.
          observer.disconnect();
          observe();
          return;
        }
      }
      const next = !entry.isIntersecting;
      if (next === isShown) {
        return;
      }
      if (isShown != null && isFingerScroll()) {
        animator.animate(
          {opacity: next ? 1 : 0},
          {spring: next ? springs.appear : springs.disappear},
          // Under Reduce Motion the animator plays its own opacity
          // cross-fade on a coarse pointer (design:reduced-motion DR2).
        );
      } else {
        // The first report, or a scroll the program drives: at once, and
        // with no compositing layer. For the program's scroll this is the
        // WebKit workaround in the file header (a layer under a sticky bar as
        // the program scrolls back to the top blanks its items).
        animator.set({opacity: next ? 1 : 0}, {promote: false});
      }
      isShown = next;
    };
    const observe = () => {
      observer = new IntersectionObserver(report, {
        // The sentinel's own document, not the implicit root: inside a
        // frame the implicit root is the top-level viewport, not the
        // frame's.
        root: container ?? doc,
        rootMargin: `${(rootOffset ?? 0) - rootInset}px 0px 0px 0px`,
        threshold: 0,
      });
      observerRef.current = observer;
      const current = sentinelElementRef.current;
      if (current != null) {
        observer.observe(current);
      }
    };
    observe();
    // The layer is composited only while a finger works the scroller (the
    // file header): from its landing until its scroll, momentum included,
    // ends.
    const scroller: Node = container ?? doc;
    const host = getGestureHost(doc);
    const releaseHost = host.retain();
    let isPromoted = false;
    const updatePromotion = () => {
      const layer = animator.element;
      const next = host.isFingerDownIn(scroller) || isFingerScroll();
      if (layer == null || next === isPromoted) {
        return;
      }
      isPromoted = next;
      if (next) {
        layer.style.setProperty(SCROLL_EDGE_LAYER_PROMOTION, 'opacity');
      } else {
        layer.style.removeProperty(SCROLL_EDGE_LAYER_PROMOTION);
      }
    };
    const unsubscribeFingers = host.onFingersChange(updatePromotion);
    // One document listener per effect; this base has no shared input
    // stream. Its `scrollend` drops the layer once the finger's scroll has
    // ended, after the finger-scroll watch has heard the same event. Where
    // the browser sends no `scrollend`, the scroller's scroll events time a
    // re-check PROMOTION_RECHECK_MS after the last one instead.
    const view = doc.defaultView;
    const hasScrollEnd = view != null && 'onscrollend' in view;
    let recheck: ReturnType<typeof setTimeout> | null = null;
    const clearRecheck = () => {
      if (recheck != null) {
        clearTimeout(recheck);
        recheck = null;
      }
    };
    const scrollType = hasScrollEnd ? 'scrollend' : 'scroll';
    const onScrollEvent = hasScrollEnd
      ? () => queueMicrotask(updatePromotion)
      : (event: Event) => {
          const target = event.target === doc ? doc : event.target;
          if (target !== scroller) {
            return;
          }
          clearRecheck();
          recheck = setTimeout(() => {
            recheck = null;
            updatePromotion();
          }, PROMOTION_RECHECK_MS);
        };
    doc.addEventListener(scrollType, onScrollEvent, PASSIVE_CAPTURE);
    return () => {
      observerRef.current = null;
      observer.disconnect();
      unsubscribeFingers();
      doc.removeEventListener(scrollType, onScrollEvent, PASSIVE_CAPTURE);
      clearRecheck();
      releaseHost();
      animator.element?.style.removeProperty(SCROLL_EDGE_LAYER_PROMOTION);
      animator.set({opacity: 0}, {promote: false});
    };
  }, [
    isOn,
    root,
    rootInset,
    animator,
    isFingerScroll,
    springs,
    registerSprings,
  ]);

  return {
    layerProps: {
      ref: layerRef,
      'aria-hidden': true,
      ...stylex.props(
        styles.layer,
        dynamicStyles.geometry(`calc(${edge} + 54.8px)`, edge, color),
        layerXstyle,
      ),
    },
    sentinelProps: {
      ref: sentinelRef,
      'aria-hidden': true,
      ...stylex.props(styles.sentinel, sentinelXstyle),
    },
  };
}
