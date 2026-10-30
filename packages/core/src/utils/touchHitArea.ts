// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file touchHitArea.ts
 * @input An element ref and whether the element takes taps, the shared touch
 *   hit area (utils/hitArea.ts), the touch target size (`--size-touch-target`,
 *   in px, rem or em, never under 44 px: `spec:AST-094` FR42), read again
 *   when the primary pointer (touchQueries.ts) or the theme (ThemeContext)
 *   changes, and the Web Animations running around the element
 * @output Exports `useTouchHitArea`, which keeps an element's hit insets live
 *   for its invisible layer (`touchHitAreaStyles.layer`,
 *   utils/touchHitArea.stylex.ts), and `touchTargetSize`
 * @position Core-internal hook for the coarse-only 44 px target
 *   (`spec:AST-094` FR42): List rows (ListItem) use it, and so can any
 *   control whose target grows under a finger without growing its box
 *
 * Under a coarse primary pointer the shared utility measures how far the
 * element's hit target may grow toward the touch target without reaching a
 * neighbor's half of the gap, and this writes those insets on the element,
 * where its layer reads them. Under a fine pointer the shared utility starts
 * no observer and writes nothing.
 *
 * Elements move by transform (a list row in an update's slide, a swipe, edit
 * mode's slide, or its neighbors sliding past it), and the shared measurement
 * reads them as they stand in one frame. A measurement that arrives while the
 * element's parent has a finite animation running or held is dropped, and
 * once those animations end the element is watched afresh, so its insets are
 * taken at rest and no frame of a compositor-only motion lays out or paints
 * for them.
 *
 * SYNC: When modified, update utils/touchHitArea.stylex.ts and
 * touchHitArea.test.tsx.
 */

import {use, useEffect, type RefObject} from 'react';
import {ThemeContext} from '../theme/useTheme';
import {MIN_TOUCH_TARGET, watchHitArea, writeHitInsets} from './hitArea';
import {TOUCH_QUERY} from './touchQueries';

/**
 * A length in px, in the units a theme writes a size in: px, rem (the root's
 * font size) or em (the font size of the element the size applies to).
 * Anything else is not a length here (NaN).
 */
function lengthInPx(value: string, element: Element, view: Window): number {
  const match = /^(\d*\.?\d+)(px|rem|em)$/.exec(value);
  if (match == null) {
    return Number.NaN;
  }
  const amount = Number(match[1]);
  if (match[2] === 'px') {
    return amount;
  }
  const reference =
    match[2] === 'rem' ? element.ownerDocument.documentElement : element;
  return amount * Number.parseFloat(view.getComputedStyle(reference).fontSize);
}

/**
 * The touch target size in px: 44 (`spec:AST-094` FR42), or more where the
 * theme sets `--size-touch-target` larger (in px, rem or em), read under a
 * finger only. A smaller value never lowers the target below 44.
 */
export function touchTargetSize(element: Element): number {
  const view = element.ownerDocument.defaultView;
  if (view?.matchMedia?.(TOUCH_QUERY).matches !== true) {
    return MIN_TOUCH_TARGET;
  }
  const value = view
    .getComputedStyle(element)
    .getPropertyValue('--size-touch-target')
    .trim();
  const size = lengthInPx(value, element, view);
  return Number.isFinite(size)
    ? Math.max(MIN_TOUCH_TARGET, size)
    : MIN_TOUCH_TARGET;
}

/**
 * Each live watch's re-watch, run when the primary pointer changes: a theme
 * may set the touch target under a coarse pointer only, so the size is read
 * again then. One pointer-query listener serves every watch, however many
 * rows and controls there are (`spec:AST-094` FR24); it goes with the last.
 */
const rewatches = new Set<() => void>();
let pointerQuery: MediaQueryList | null = null;

function onPointerChange(): void {
  for (const rewatch of [...rewatches]) {
    rewatch();
  }
}

/** Runs `rewatch` on each change of the primary pointer; returns the stop. */
function listenForPointer(view: Window, rewatch: () => void): () => void {
  rewatches.add(rewatch);
  if (pointerQuery == null) {
    pointerQuery = view.matchMedia?.(TOUCH_QUERY) ?? null;
    pointerQuery?.addEventListener('change', onPointerChange);
  }
  return () => {
    rewatches.delete(rewatch);
    if (rewatches.size === 0) {
      pointerQuery?.removeEventListener('change', onPointerChange);
      pointerQuery = null;
    }
  };
}

/**
 * The finite animations running or held in the element's parent, the element
 * included: a row's own motion and its neighbors'. An endless one (a spinner)
 * moves nothing that comes to rest, so it holds nothing.
 */
function settlingAnimations(element: HTMLElement): Animation[] {
  const scope = element.parentElement ?? element;
  if (typeof scope.getAnimations !== 'function') {
    return [];
  }
  return scope.getAnimations({subtree: true}).filter(animation => {
    if (animation.playState !== 'running' && animation.playState !== 'paused') {
      return false;
    }
    const end = animation.effect?.getComputedTiming().endTime;
    return typeof end === 'number' && Number.isFinite(end);
  });
}

/** Watches `element`, taking its insets only at rest; returns the stop. */
function watchAtRest(element: HTMLElement, minSize: number): () => void {
  let stop = (): void => {};
  let isStopped = false;
  let isWaiting = false;
  const watch = (): void => {
    stop = watchHitArea(
      element,
      insets => {
        const moving = settlingAnimations(element);
        if (moving.length === 0) {
          writeHitInsets(element, insets);
          return;
        }
        if (isWaiting) {
          return;
        }
        isWaiting = true;
        void Promise.allSettled(
          moving.map(async animation => animation.finished),
        ).then(() => {
          isWaiting = false;
          if (!isStopped) {
            stop();
            watch();
          }
        });
      },
      {minSize},
    );
  };
  watch();
  return () => {
    isStopped = true;
    stop();
  };
}

/**
 * Keeps `ref`'s element's hit insets live while `enabled` (the element takes
 * taps: interactive, not disabled or read-only). Pair it with
 * `touchHitAreaStyles.layer` on the same element.
 *
 * @example
 * ```
 * const ref = useRef<HTMLLIElement | null>(null);
 * useTouchHitArea(ref, isInteractive && !isDisabled);
 * <li ref={ref} {...stylex.props(isInteractive && touchHitAreaStyles.layer)} />
 * ```
 */
export function useTouchHitArea(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
): void {
  // The touch target is read again when the theme changes (a re-render) and
  // when the primary pointer does (the one shared pointer listener).
  const theme = use(ThemeContext);
  // External system (`architecture:react-component-runtime` INV3): the shared
  // touch hit area (utils/hitArea.ts), which measures the element against its
  // neighbors and writes its insets on it; the cleanup stops the watch.
  useEffect(() => {
    const element = ref.current;
    const view = element?.ownerDocument.defaultView;
    if (!enabled || element == null || view == null) {
      return undefined;
    }
    let stop = watchAtRest(element, touchTargetSize(element));
    const unlisten = listenForPointer(view, () => {
      stop();
      stop = watchAtRest(element, touchTargetSize(element));
    });
    return () => {
      unlisten();
      stop();
    };
  }, [enabled, ref, theme]);
}
