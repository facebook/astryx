// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file PageControlTouch.ts
 * @input The control's elements, its page state and its request function;
 *   the gesture system, the animator and the Reduce Motion policy
 * @output usePageControlTouch: PageControl's touch layer, the scrub (and its
 *   jog past the window's edge), the held platter, the window's slide and
 *   the fades
 * @position Internal to PageControl: its one touch module, imported once. A
 *   coarse primary pointer turns it on; with a mouse the control pages by tap
 *   and keys (PageControl.tsx) and nothing here runs
 *
 * SYNC: When modified, update PageControl.tsx, PageControl.test.tsx and
 * __tests__/PageControl.interaction.browser.spec.ts.
 */

import {useEffect, useLayoutEffect, useRef, type RefObject} from 'react';
import {isRtlElement} from '@astryxdesign/core/hooks';
import {
  LongPressGestureRecognizer,
  PanGestureRecognizer,
  TapGestureRecognizer,
  useGestureRecognizer,
} from '@astryxdesign/core/internal/touch';
import {animatorFor} from '@astryxdesign/core/internal/motion';
import {reducedMotionFade} from '@astryxdesign/core/internal/motion';
import {pageControl} from '@astryxdesign/core/internal/motion';
import {
  BOX,
  PITCH,
  clampPage,
  fadeOf,
  indicatorSize,
  jogInterval,
  pageControlLayout,
  scrubTarget,
  tapTarget,
  type ChangeKind,
  type Latest,
} from './pageControlModel';

const PC = pageControl;

/**
 * Under Reduce Motion every opacity change takes the one policy's fade
 * (design:reduced-motion): 200 ms on a coarse pointer, none (at once) on any
 * other; null when motion is not reduced.
 */
function reducedFadeOf(root: Element): string | null {
  const fade = reducedMotionFade(root);
  if (fade == null) {
    return null;
  }
  return fade.duration === 0
    ? 'none'
    : `opacity ${fade.duration / 1000}s ${fade.easing}`;
}

/** What the touch layer reads from the control and writes back. */
export interface PageControlTouch {
  /** The touch presentation is on (a coarse primary pointer). */
  readonly isTouch: boolean;
  readonly rootRef: RefObject<HTMLDivElement | null>;
  readonly stripRef: RefObject<HTMLSpanElement | null>;
  /** The control's state after each render, for gestures and timers. */
  readonly latestRef: RefObject<Latest>;
  /** The page last asked for and what asked (a tap fades faster). */
  readonly requestRef: RefObject<{page: number; kind: ChangeKind} | null>;
  /** Asks the app for a page. */
  readonly request: (page: number, kind: ChangeKind) => void;
  /** Shows or hides the platter and dims the other indicators. */
  readonly setInteracting: (isInteracting: boolean) => void;
  readonly pages: number;
  readonly current: number;
  readonly windowStart: number;
  readonly isInteracting: boolean;
}

/**
 * PageControl's touch layer. Every recognizer and effect here is off unless
 * `isTouch`.
 */
export function usePageControlTouch({
  isTouch,
  rootRef,
  stripRef,
  latestRef,
  requestRef,
  request,
  setInteracting,
  pages,
  current,
  windowStart,
  isInteracting,
}: PageControlTouch): void {
  const geometry = () => {
    const root = rootRef.current;
    if (root == null) {
      return null;
    }
    const rect = root.getBoundingClientRect();
    const isRtl = isRtlElement(root);
    const rowStart =
      (rect.width - pageControlLayout(latestRef.current.pages).rowWidth) / 2;
    const firstCenter = rowStart + PC.indicatorSize / 2;
    /** Px along the row (mirrored in RTL) from the window's first slot's centre. */
    const along = (x: number) =>
      isRtl ? rect.right - firstCenter - x : x - rect.left - firstCenter;
    /** Px past the edge of the content: positive past the end, negative past the start. */
    const past = (x: number) => {
      const start = rect.left + PC.horizontalPadding;
      const end = rect.right - PC.horizontalPadding;
      const beyond = x > end ? x - end : x < start ? x - start : 0;
      return isRtl ? -beyond : beyond;
    };
    return {along, past};
  };

  const gestureRef = useRef({
    startX: 0,
    lastX: 0,
    isScrubbing: false,
    /**
     * The control's geometry, read once when the scrub begins: nothing reads
     * layout while the finger moves.
     */
    geo: null as ReturnType<typeof geometry>,
    interactTimer: 0 as ReturnType<typeof setTimeout> | 0,
    jogTimer: 0 as ReturnType<typeof setTimeout> | 0,
    /** When the finger crossed the edge or the last jog step ran, ms. */
    jogFrom: null as number | null,
    /** When the pending jog step runs, ms. */
    jogDue: 0,
  });

  const stopJog = () => {
    const g = gestureRef.current;
    if (g.jogTimer !== 0) {
      clearTimeout(g.jogTimer);
      g.jogTimer = 0;
    }
    g.jogFrom = null;
  };

  // Past the content's edge of a windowed control the page steps on its own:
  // each step comes 1 / rate after the previous one (or after the finger
  // crossed the edge), the rate read from how far past the finger is now, so
  // moving further brings the next step closer.
  const jog = () => {
    const g = gestureRef.current;
    const geo = g.geo;
    const latest = latestRef.current;
    if (
      geo == null ||
      !g.isScrubbing ||
      !pageControlLayout(latest.pages).isWindowed
    ) {
      stopJog();
      return;
    }
    const beyond = geo.past(g.lastX);
    const direction = Math.sign(beyond);
    const interval =
      direction === 0 ? Infinity : jogInterval(Math.abs(beyond), direction);
    if (!Number.isFinite(interval)) {
      stopJog();
      return;
    }
    const now = performance.now();
    g.jogFrom ??= now;
    const due = g.jogFrom + interval * 1000;
    if (g.jogTimer !== 0) {
      if (Math.abs(due - g.jogDue) < 1) {
        return;
      }
      clearTimeout(g.jogTimer);
    }
    g.jogDue = due;
    g.jogTimer = setTimeout(
      () => {
        g.jogTimer = 0;
        g.jogFrom = performance.now();
        const step = Math.sign(geo.past(g.lastX));
        if (step !== 0) {
          const current = latestRef.current;
          const from = requestRef.current?.page ?? current.current;
          request(clampPage(from + step, current.pages), 'other');
        }
        jog();
      },
      Math.max(0, due - now),
    );
  };

  const scrubTo = (x: number) => {
    const geo = gestureRef.current.geo;
    const latest = latestRef.current;
    if (geo == null) {
      return;
    }
    if (geo.past(x) === 0 || !pageControlLayout(latest.pages).isWindowed) {
      stopJog();
      request(
        scrubTarget(geo.along(x), latest.pages, latest.windowStart),
        'other',
      );
    }
    jog();
  };

  const finish = () => {
    const g = gestureRef.current;
    if (g.interactTimer !== 0) {
      clearTimeout(g.interactTimer);
      g.interactTimer = 0;
    }
    stopJog();
    g.isScrubbing = false;
    g.geo = null;
    setInteracting(false);
  };

  // A finger on the control (spec:AST-094 FR19: decided within 10 px, so a
  // swipe that starts vertical stays the page's scroll):
  // - a horizontal pan, from 10 px, scrubs once the finger is 16 px from
  //   where it landed; a drag that starts vertical fails it;
  // - a finger held still for 155 ms (UIPageControl's interaction delay)
  //   shows the platter and scrubs the same way from there;
  // - a tap steps one page.
  // Whichever begins first holds the touch and fails the others. The scrub's
  // 16 px count from where the finger landed, as UIKit counts them.
  const landingX = (
    recognizer: {trackedTouches: ReadonlyArray<{startX: number}>},
    fallback: number,
  ) => recognizer.trackedTouches[0]?.startX ?? fallback;
  const begin = (startX: number) => {
    const g = gestureRef.current;
    g.startX = startX;
    g.lastX = startX;
    g.isScrubbing = false;
  };
  const track = (x: number) => {
    const g = gestureRef.current;
    g.lastX = x;
    if (
      !g.isScrubbing &&
      Math.abs(x - g.startX) >= PC.scrubStartDistance &&
      latestRef.current.pages > 1
    ) {
      g.isScrubbing = true;
      g.geo = geometry();
      setInteracting(true);
    }
    if (g.isScrubbing) {
      scrubTo(x);
    }
  };
  // A tap, or a pan or hold that lifts before it scrubs: one page toward the
  // finger's side of the current indicator.
  const step = (x: number) => {
    const geo = geometry();
    const latest = latestRef.current;
    if (geo == null || latest.pages < 2) {
      return;
    }
    const slot =
      latest.current -
      (pageControlLayout(latest.pages).isWindowed ? latest.windowStart : 0);
    request(
      tapTarget(
        geo.along(x),
        slot * PITCH,
        latest.current,
        latest.pages,
        false,
      ),
      'tap',
    );
  };
  const lift = (x: number) => {
    if (!gestureRef.current.isScrubbing) {
      step(x);
    }
    finish();
  };

  useGestureRecognizer(
    rootRef,
    () => new PanGestureRecognizer({direction: 'horizontal'}),
    pan => {
      const {x} = pan.location();
      switch (pan.state) {
        case 'began': {
          begin(landingX(pan, x - pan.travelAtBegan.x));
          const g = gestureRef.current;
          g.interactTimer = setTimeout(() => {
            g.interactTimer = 0;
            setInteracting(true);
          }, PC.interactionDelayMs);
          track(x);
          break;
        }
        case 'changed':
          track(x);
          break;
        case 'ended':
          lift(x);
          break;
        case 'cancelled':
        case 'failed':
          finish();
          break;
        default:
          break;
      }
    },
    {isEnabled: isTouch},
  );

  useGestureRecognizer(
    rootRef,
    () =>
      new LongPressGestureRecognizer({
        minimumPressDuration: PC.interactionDelayMs,
      }),
    hold => {
      const {x} = hold.location();
      switch (hold.state) {
        case 'began':
          begin(landingX(hold, x));
          setInteracting(true);
          break;
        case 'changed':
          track(x);
          break;
        case 'ended':
          lift(x);
          break;
        case 'cancelled':
        case 'failed':
          finish();
          break;
        default:
          break;
      }
    },
    {isEnabled: isTouch},
  );

  useGestureRecognizer(
    rootRef,
    () => new TapGestureRecognizer(),
    tap => {
      if (tap.state === 'ended') {
        step(tap.location().x);
      }
    },
    {isEnabled: isTouch},
  );

  // Timers end with the control.
  useEffect(
    () => () => {
      const g = gestureRef.current;
      clearTimeout(g.interactTimer);
      clearTimeout(g.jogTimer);
    },
    [],
  );

  // The window: the strip and every indicator's size, on the animator. A move
  // waits windowSlideDelay, then slides on the windowSlide spring.
  const shownRef = useRef<{windowStart: number; pages: number} | null>(null);
  useLayoutEffect(() => {
    const strip = stripRef.current;
    const root = rootRef.current;
    if (strip == null || root == null) {
      return undefined;
    }
    const isRtl = isRtlElement(root);
    const offsetFor = (start: number) => (isRtl ? 1 : -1) * start * PITCH;
    const dots = Array.from(strip.children) as HTMLElement[];
    const pageOf = (dot: HTMLElement) => Number(dot.dataset.page);
    const scaleFor = (start: number, page: number) =>
      indicatorSize(pages, start, page) / BOX;
    if (!isTouch) {
      shownRef.current = null;
      return undefined;
    }
    const before = shownRef.current;
    shownRef.current = {windowStart, pages};
    if (
      before == null ||
      before.pages !== pages ||
      before.windowStart === windowStart
    ) {
      animatorFor(strip).set({x: offsetFor(windowStart)});
      for (const dot of dots) {
        animatorFor(dot).set({scale: scaleFor(windowStart, pageOf(dot))});
      }
      return undefined;
    }
    // Dots that just mounted start at their size in the old window.
    for (const dot of dots) {
      if (dot.dataset.shown !== 'true') {
        animatorFor(dot).set({
          scale: scaleFor(before.windowStart, pageOf(dot)),
        });
      }
    }
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const timer = setTimeout(() => {
      // The table's measured spring, an internal constant (touch motion
      // stays internal: no theme role).
      const transition = {spring: PC.windowSlide};
      const stripAnimator = animatorFor(strip);
      stripAnimator.animate({x: offsetFor(windowStart)}, transition);
      const shown = Array.from(strip.children) as HTMLElement[];
      if (stripAnimator.reducedMotion() === 'off') {
        for (const dot of shown) {
          animatorFor(dot).animate(
            {scale: scaleFor(windowStart, pageOf(dot))},
            transition,
          );
        }
        return;
      }
      // Under Reduce Motion the strip's cross-fade carries the whole change
      // (design:reduced-motion): the dots take their new sizes while it is
      // transparent, not with fades of their own, which would fight their
      // page opacity.
      const resize = () => {
        for (const dot of shown) {
          animatorFor(dot).set({scale: scaleFor(windowStart, pageOf(dot))});
        }
      };
      const half = (reducedMotionFade(root)?.duration ?? 0) / 2;
      if (half > 0) {
        resizeTimer = setTimeout(resize, half);
      } else {
        resize();
      }
    }, PC.windowSlideDelayMs);
    return () => {
      clearTimeout(timer);
      clearTimeout(resizeTimer);
    };
  }, [windowStart, pages, isTouch]);

  // Mark rendered dots, so a later window move knows which ones are new.
  useLayoutEffect(() => {
    for (const dot of Array.from(
      stripRef.current?.children ?? [],
    ) as HTMLElement[]) {
      dot.dataset.shown = 'true';
    }
  });

  // The old current indicator fades (faster after a tap); every other
  // opacity change is a switch.
  const shownPageRef = useRef(current);
  useLayoutEffect(() => {
    const old = shownPageRef.current;
    shownPageRef.current = current;
    if (old === current) {
      return;
    }
    const kind =
      requestRef.current?.page === current ? requestRef.current.kind : 'other';
    const root = rootRef.current;
    if (!isTouch || root == null) {
      return;
    }
    // Under Reduce Motion every dot takes the policy's fade.
    const reduced = reducedFadeOf(root);
    // The table's measured values: touch motion stays internal.
    const fade = fadeOf(
      kind === 'tap' ? PC.tapFadeOutMs : PC.fadeOutMs,
      PC.fadeOutCurve,
    );
    const switchFade = fadeOf(PC.switchMs, PC.switchCurve);
    for (const dot of Array.from(
      stripRef.current?.children ?? [],
    ) as HTMLElement[]) {
      dot.style.transition =
        reduced ?? (Number(dot.dataset.page) === old ? fade : switchFade);
    }
  }, [current, isTouch]);

  // Under Reduce Motion the platter and the dots' dimming, which show and
  // hide with a finger, take the policy's fade too.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!isTouch || root == null) {
      return;
    }
    const reduced = reducedFadeOf(root);
    if (reduced == null) {
      return;
    }
    // The platter is the root's ::before: its fade is a custom property.
    root.style.setProperty('--_page-control-platter-transition', reduced);
    for (const dot of Array.from(
      stripRef.current?.children ?? [],
    ) as HTMLElement[]) {
      dot.style.transition = reduced;
    }
  }, [isInteracting, isTouch]);
}
