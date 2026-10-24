// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file PageControl.tsx
 * @input React, StyleX, core's theme tokens and translator, the gesture
 *   system's press recognizer (`@astryxdesign/core/gestures/experimental`),
 *   the compositor animator and the UIKit page-control table
 *   (`@astryxdesign/core/motion/experimental`), pageControlModel.ts for the
 *   math
 * @output Exports PageControl: a row of page indicators, the current one
 *   highlighted, that pages one step per tap and follows a finger scrubbing
 *   across it, like UIPageControl
 * @position Lab component (packages/lab/src/PageControl); the phone
 *   presentation of "which page am I on" under a paging view (a paging
 *   Carousel, onboarding screens), UIPageControl's counterpart
 *
 * WHAT IT DRAWS
 *
 * UIPageControl's measured geometry (uikit/pageControl.ts): 9.67 px
 * indicators 8 px apart, 14 px of padding at each end, 25.67 px tall, never
 * wider than 161.3 px. At most ten indicator slots show, centred on the
 * control. With more pages the row is a window: where pages continue past it,
 * its last two slots on that side shrink (7.33 then 4.31 px), and it moves
 * only when the current page would land in a shrunk slot, 50 ms after the
 * change, every indicator sliding to its new slot and size on UIKit's spring
 * (response 0.15 s, critically damped) through core's animator.
 *
 * The indicators take the theme's primary text colour; the current one is
 * opaque and the others are at 45 %, UIKit's default alphas (themes keep
 * their colour). When the page changes, the old current indicator fades over
 * 0.125 s after a tap and 0.25 s otherwise; the new one lights at once.
 *
 * HOW IT PAGES
 *
 * The app owns the page (`value` + `onChange`). A tap on the trailing side of
 * the current indicator asks for the next page, on the leading side for the
 * previous one (mirrored in RTL), when the finger lifts. A finger that
 * travels 16 px scrubs instead: the page becomes the indicator under it,
 * switching at the midpoint between indicators; past the edge of the
 * content of a windowed control the page keeps stepping on its own, faster
 * the further past (up to 15 pages a second). A finger held on the control
 * for 155 ms, or scrubbing, shows a platter behind the indicators and dims
 * the others to 25 %; both return at the lift.
 *
 * Accessibility: one adjustable element, a `slider` named "Page indicators"
 * whose value reads "Page 3 of 5"; the arrow keys, Home and End change the
 * page, and VoiceOver's swipe up or down adjusts it.
 *
 * IDIOM
 *
 * The scrub, the held platter, the shrinking window and the fades are iOS's
 * (`useTouchIdiom()` is `ios`: a finger on WebKit for iOS or iPadOS).
 * Elsewhere, Android included, the control pages by tap (UIKit's tap rule:
 * up to 45 px of travel) and keys over a row cropped to the control, with
 * instant opacity changes. The motion values are theme roles
 * (`uikit.pageControl`, resolveMotion).
 *
 * SYNC: When modified, update PageControl.doc.mjs, PageControl.test.tsx,
 * pageControlModel.ts and __tests__/PageControl.interaction.browser.spec.ts.
 */

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '@astryxdesign/core';
import {useTranslator} from '@astryxdesign/core/i18n';
import {mergeProps} from '@astryxdesign/core/utils';
import {colorVars, focusVars} from '@astryxdesign/core/theme/tokens.stylex';
import {
  LongPressGestureRecognizer,
  TapGestureRecognizer,
  useTouchIdiom,
  useGestureRecognizer,
} from '@astryxdesign/core/gestures/experimental';
import {
  animatorFor,
  resolveMotion,
  uikit,
} from '@astryxdesign/core/motion/experimental';
import {
  PITCH,
  indicatorSize,
  jogInterval,
  croppedRowOffset,
  pageControlLayout,
  scrubTarget,
  tapTarget,
  windowFor,
} from './pageControlModel';

const PC = uikit.pageControl;
/** An opacity transition of `ms` on the curve's control points. */
const fadeOf = (ms: number, curve: ReadonlyArray<number>) =>
  `opacity ${ms / 1000}s cubic-bezier(${curve.join(', ')})`;
const SWITCH = fadeOf(PC.switchMs, PC.switchCurve);
/** Slots rendered on each side of the window, so a slide has its dots. */
const RENDER_MARGIN = 3;

export interface PageControlProps extends Omit<
  BaseProps<HTMLDivElement>,
  'onChange'
> {
  /** Number of pages. */
  count: number;
  /** The current page, 0-based. */
  value: number;
  /**
   * Called with the page a tap, a scrub, a key or an assistive technology
   * asks for.
   */
  onChange: (page: number) => void;
  /**
   * Accessible name of the control.
   * @default 'Page indicators' (localized)
   */
  label?: string;
  /**
   * Render nothing when there is only one page.
   * @default false
   */
  hidesForSinglePage?: boolean;
  'data-testid'?: string;
}

const styles = stylex.create({
  root: {
    position: 'relative',
    display: 'inline-block',
    boxSizing: 'border-box',
    flexShrink: 0,
    verticalAlign: 'middle',
    cursor: 'default',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    outlineStyle: {
      default: 'none',
      ':focus-visible': focusVars['--focus-outline-style'],
    },
    outlineWidth: focusVars['--focus-outline-width'],
    outlineColor: focusVars['--focus-outline-color'],
    outlineOffset: focusVars['--focus-outline-offset'],
  },
  cropped: {
    overflow: 'hidden',
  },
  platter: {
    position: 'absolute',
    inset: 0,
    borderRadius: 9999,
    backgroundColor: colorVars['--color-background-muted'],
    pointerEvents: 'none',
  },
  strip: {
    position: 'absolute',
    insetBlock: 0,
    width: 0,
    pointerEvents: 'none',
  },
  indicator: {
    position: 'absolute',
    borderRadius: '50%',
    backgroundColor: colorVars['--color-text-primary'],
  },
});

function clampPage(page: number, count: number): number {
  return Math.max(0, Math.min(count - 1, Math.round(page)));
}

type ChangeKind = 'tap' | 'other';

interface Latest {
  current: number;
  pages: number;
  windowStart: number;
  onChange: (page: number) => void;
}

/**
 * A row of page indicators that pages one step per tap and follows a
 * scrubbing finger, like UIPageControl.
 *
 * @example
 * ```
 * const [page, setPage] = useState(0);
 * <PageControl count={5} value={page} onChange={setPage} />
 * ```
 */
export function PageControl({
  count,
  value,
  onChange,
  label,
  hidesForSinglePage = false,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ...htmlProps
}: PageControlProps) {
  const t = useTranslator();
  const rootRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLSpanElement>(null);
  const pages = Math.max(0, Math.floor(count));
  const current = pages === 0 ? 0 : clampPage(value, pages);
  const layout = pageControlLayout(pages);
  // iOS's scrub, held platter, shrinking window and fades belong to the iOS
  // idiom (a finger on iPhone or iPad); elsewhere, Android included, the
  // control pages by tap and keys over a cropped row, without them.
  const isIos = useTouchIdiom() === 'ios';

  // The window moves only when the current page would land in a shrunk
  // slot, so it depends on where it was: state, adjusted during render.
  const [windowStart, setWindowStart] = useState(() =>
    windowFor(pages, 0, current),
  );
  const nextWindowStart = isIos
    ? windowFor(pages, windowStart, current)
    : windowStart;
  if (nextWindowStart !== windowStart) {
    setWindowStart(nextWindowStart);
  }

  const [isInteracting, setInteracting] = useState(false);

  // Read by the gesture and its timers, which outlive a render.
  const latestRef = useRef<Latest>({
    current,
    pages,
    windowStart,
    onChange,
  });
  useEffect(() => {
    latestRef.current = {current, pages, windowStart, onChange};
  });

  // What asked for the page the control shows next: a tap fades the old
  // indicator faster than anything else.
  const requestRef = useRef<{page: number; kind: ChangeKind} | null>(null);
  const request = (page: number, kind: ChangeKind) => {
    const latest = latestRef.current;
    if (page === latest.current || page === requestRef.current?.page) {
      return;
    }
    requestRef.current = {page, kind};
    latest.onChange(page);
  };

  const geometry = () => {
    const root = rootRef.current;
    if (root == null) {
      return null;
    }
    const rect = root.getBoundingClientRect();
    const isRtl = getComputedStyle(root).direction === 'rtl';
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
    const geo = geometry();
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
    const interval = jogInterval(Math.abs(beyond));
    if (direction === 0 || !Number.isFinite(interval)) {
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
    const geo = geometry();
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
    setInteracting(false);
  };

  useGestureRecognizer(
    rootRef,
    () =>
      new LongPressGestureRecognizer({
        minimumPressDuration: 0,
        allowableMovement: Infinity,
      }),
    recognizer => {
      const g = gestureRef.current;
      const {x} = recognizer.location();
      switch (recognizer.state) {
        case 'began':
          g.startX = x;
          g.lastX = x;
          g.isScrubbing = false;
          g.interactTimer = setTimeout(() => {
            g.interactTimer = 0;
            setInteracting(true);
          }, PC.interactionDelayMs);
          break;
        case 'changed':
          g.lastX = x;
          if (
            !g.isScrubbing &&
            Math.abs(x - g.startX) >= PC.scrubStartDistance &&
            latestRef.current.pages > 1
          ) {
            g.isScrubbing = true;
            setInteracting(true);
          }
          if (g.isScrubbing) {
            scrubTo(x);
          }
          break;
        case 'ended': {
          if (!g.isScrubbing) {
            const geo = geometry();
            const latest = latestRef.current;
            if (geo != null && latest.pages > 1) {
              const slot =
                latest.current -
                (pageControlLayout(latest.pages).isWindowed
                  ? latest.windowStart
                  : 0);
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
            }
          }
          finish();
          break;
        }
        case 'cancelled':
        case 'failed':
          finish();
          break;
        default:
          break;
      }
    },
    {isEnabled: isIos},
  );

  // Outside iOS: a tap steps one page toward its side of the current
  // indicator when the finger lifts; a drag is not a tap and pages nothing.
  useGestureRecognizer(
    rootRef,
    () => new TapGestureRecognizer(),
    recognizer => {
      if (recognizer.state !== 'ended') {
        return;
      }
      const root = rootRef.current;
      const latest = latestRef.current;
      const dot = stripRef.current?.querySelector(
        `[data-page="${latest.current}"]`,
      );
      if (root == null || dot == null || latest.pages < 2) {
        return;
      }
      const box = dot.getBoundingClientRect();
      request(
        tapTarget(
          recognizer.location().x,
          box.left + box.width / 2,
          latest.current,
          latest.pages,
          getComputedStyle(root).direction === 'rtl',
        ),
        'tap',
      );
    },
    {isEnabled: !isIos},
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
    const isRtl = getComputedStyle(root).direction === 'rtl';
    const offsetFor = (start: number) => (isRtl ? 1 : -1) * start * PITCH;
    const dots = Array.from(strip.children) as HTMLElement[];
    const pageOf = (dot: HTMLElement) => Number(dot.dataset.page);
    const scaleFor = (start: number, page: number) =>
      indicatorSize(pages, start, page) / PC.indicatorSize;
    if (!isIos) {
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
    const timer = setTimeout(
      () => {
        // A table spring: the animator plays the theme's value of the role.
        const transition = {spring: PC.windowSlide};
        animatorFor(strip).animate({x: offsetFor(windowStart)}, transition, {
          reducedMotion: 'keep',
        });
        for (const dot of Array.from(strip.children) as HTMLElement[]) {
          animatorFor(dot).animate(
            {scale: scaleFor(windowStart, pageOf(dot))},
            transition,
            {reducedMotion: 'keep'},
          );
        }
      },
      resolveMotion(root, PC, 'windowSlideDelayMs'),
    );
    return () => clearTimeout(timer);
  }, [windowStart, pages, isIos]);

  // Outside iOS: the cropped row, every page at full size, shifted at once to
  // keep the current indicator in view.
  useLayoutEffect(() => {
    const strip = stripRef.current;
    const root = rootRef.current;
    if (isIos || strip == null || root == null) {
      return;
    }
    const isRtl = getComputedStyle(root).direction === 'rtl';
    animatorFor(strip).set({
      x: (isRtl ? 1 : -1) * croppedRowOffset(pages, current),
    });
    for (const dot of Array.from(strip.children) as HTMLElement[]) {
      animatorFor(dot).set({scale: 1});
    }
  }, [isIos, pages, current]);

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
    requestRef.current = null;
    const root = rootRef.current;
    if (!isIos || root == null) {
      return;
    }
    // The theme's values of the roles (the table's when it sets none).
    const fade = fadeOf(
      resolveMotion(root, PC, kind === 'tap' ? 'tapFadeOutMs' : 'fadeOutMs'),
      resolveMotion(root, PC, 'fadeOutCurve'),
    );
    const switchFade = fadeOf(
      resolveMotion(root, PC, 'switchMs'),
      resolveMotion(root, PC, 'switchCurve'),
    );
    for (const dot of Array.from(
      stripRef.current?.children ?? [],
    ) as HTMLElement[]) {
      dot.style.transition =
        Number(dot.dataset.page) === old ? fade : switchFade;
    }
  }, [current, isIos]);

  if (pages === 0 || (hidesForSinglePage && pages === 1)) {
    return null;
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const isRtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
        next = current + (isRtl ? -1 : 1);
        break;
      case 'ArrowLeft':
        next = current + (isRtl ? 1 : -1);
        break;
      case 'ArrowUp':
        next = current + 1;
        break;
      case 'ArrowDown':
        next = current - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = pages - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    request(clampPage(next, pages), 'other');
  };

  const isWindow = isIos && layout.isWindowed;
  const first = isWindow ? Math.max(0, windowStart - RENDER_MARGIN) : 0;
  const last = isWindow
    ? Math.min(pages, windowStart + layout.slots + RENDER_MARGIN)
    : pages;
  // iOS centres its slots on the control; the cropped row starts inside the
  // padding.
  const fullRow = pages * PITCH - PC.indicatorSpacing;
  const stripStart = isIos
    ? (layout.width - layout.rowWidth) / 2
    : (layout.width -
        Math.min(fullRow, layout.width - 2 * PC.horizontalPadding)) /
      2;
  const transition = isIos ? SWITCH : 'none';
  const otherAlpha = isInteracting
    ? PC.interactingOtherIndicatorAlpha
    : PC.otherIndicatorAlpha;
  const top = (PC.height - PC.indicatorSize) / 2;

  return (
    <div
      ref={rootRef}
      data-testid={testId}
      data-interacting={isInteracting || undefined}
      {...htmlProps}
      {...mergeProps(
        stylex.props(styles.root, !isIos && styles.cropped, xstyle),
        className,
        {
          ...style,
          width: layout.width,
          height: PC.height,
        },
      )}
      role="slider"
      tabIndex={0}
      aria-label={label ?? t('@astryx.pagination.pageIndicators')}
      aria-orientation="horizontal"
      aria-valuemin={1}
      aria-valuemax={pages}
      aria-valuenow={current + 1}
      aria-valuetext={t('@astryx.pagination.pageOfTotal', {
        current: current + 1,
        total: pages,
      })}
      onKeyDown={onKeyDown}>
      <span
        aria-hidden="true"
        {...stylex.props(styles.platter)}
        style={{opacity: isInteracting ? 1 : 0, transition}}
      />
      <span
        ref={stripRef}
        aria-hidden="true"
        {...stylex.props(styles.strip)}
        style={{insetInlineStart: stripStart}}>
        {Array.from({length: last - first}, (_, i) => {
          const page = first + i;
          return (
            <span
              key={page}
              data-page={page}
              {...stylex.props(styles.indicator)}
              style={{
                insetInlineStart: page * PITCH,
                top,
                width: PC.indicatorSize,
                height: PC.indicatorSize,
                opacity:
                  page === current ? PC.currentIndicatorAlpha : otherAlpha,
                transition,
              }}
            />
          );
        })}
      </span>
    </div>
  );
}

PageControl.displayName = 'PageControl';
