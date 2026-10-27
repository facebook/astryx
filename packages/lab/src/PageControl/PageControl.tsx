// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file PageControl.tsx
 * @input React, StyleX, core's theme tokens and translator, the touch
 *   presentation and the writing-direction read
 *   (`@astryxdesign/core/internal/touch`), the compositor animator and the
 *   UIKit page-control table (`@astryxdesign/core/internal/motion`),
 *   PageControlTouch.ts for the touch layer, pageControlModel.ts for the math
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
 * opaque and the others are at 48 %: UIKit's 45 %, raised to the 3:1
 * contrast the only page-count cue needs (themes keep their colour). When the
 * page changes, the old current indicator fades over 0.125 s after a tap and
 * 0.25 s otherwise; the new one lights at once.
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
 * for 155 ms (UIPageControl's own interaction delay, measured), or
 * scrubbing, shows a platter behind the indicators, the held look painted
 * with the system pressed overlay (design:user-states DR1), and dims the
 * others to 25 %; both return at the lift.
 *
 * Accessibility: one adjustable element, a `slider` named "Page indicators"
 * whose value reads "Page 3 of 5"; the arrow keys, Home and End change the
 * page, and VoiceOver's swipe up or down adjusts it.
 *
 * TOUCH
 *
 * The scrub, the held platter, the shrinking window and the fades are the
 * touch presentation: a coarse primary pointer, on every touch device
 * (`useTouchPresentation`; one touch model, no platform idiom). With a mouse
 * or a trackpad the control pages by tap (UIKit's tap rule: up to 45 px of
 * travel) and keys over a row cropped to the control, with instant opacity
 * changes. The motion values are the `pageControl` table's measured
 * constants: touch motion stays internal (no theme role).
 *
 * The touch presentation lives in PageControlTouch.ts, imported once here.
 *
 * SYNC: When modified, update PageControl.doc.mjs, PageControl.test.tsx,
 * PageControlTouch.ts, pageControlModel.ts and
 * __tests__/PageControl.interaction.browser.spec.ts.
 */

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type Ref,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '@astryxdesign/core';
import {useTranslator} from '@astryxdesign/core/i18n';
import {
  composeEventHandlers,
  mergeProps,
  mergeRefs,
} from '@astryxdesign/core/utils';
import {isRtlElement} from '@astryxdesign/core/internal/touch';
import {colorVars, focusVars} from '@astryxdesign/core/theme/tokens.stylex';
import {useTouchPresentation} from '@astryxdesign/core/internal/touch';
import {animatorFor} from '@astryxdesign/core/internal/motion';
import {UIKIT_TAP, pageControl} from '@astryxdesign/core/internal/motion';
import {usePageControlTouch} from './PageControlTouch';
import {
  BOX,
  PITCH,
  SWITCH,
  clampPage,
  croppedRowOffset,
  indicatorSize,
  pageControlLayout,
  tapTarget,
  windowFor,
  type ChangeKind,
  type Latest,
} from './pageControlModel';

const PC = pageControl;
/** A 10 px box scaled to the 9.67 px indicator (see BOX). */
const DOT_SCALE = PC.indicatorSize / BOX;
// UIKit draws the other indicators at 45 %; at that alpha Core's primary text
// colour on its page background measures 2.97:1, under the 3:1 WCAG 1.4.11
// asks of the only cue for how many pages there are. 48 % gives 3.25:1.
const INACTIVE_ALPHA = Math.max(PC.otherIndicatorAlpha, 0.48);
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
  /** The slider element. */
  ref?: Ref<HTMLDivElement>;
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
  // The held look: a held or scrubbing finger's platter paints the system
  // pressed overlay (design:user-states DR1), on the root under
  // `data-interacting`: no element of its own.
  platter: {
    '::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      backgroundColor: colorVars['--color-overlay-pressed'],
      pointerEvents: 'none',
      opacity: 0,
      transition: 'var(--_page-control-platter-transition, none)',
    },
  },
  platterShown: {
    '::before': {
      opacity: 1,
    },
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
  // The resting offset and sizes the markup carries (custom properties the
  // render sets); the animator's inline translate and scale override them.
  restingStrip: {
    translate: {
      default: 'calc(-1 * var(--_page-control-rest, 0px)) 0',
      ':is([dir="rtl"] *)': 'var(--_page-control-rest, 0px) 0',
    },
  },
  restingDot: {
    scale: 'var(--_page-control-scale, 1)',
  },
});

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
export function PageControl(props: PageControlProps) {
  const pages = Math.max(0, Math.floor(props.count));
  if (pages === 0 || (props.hidesForSinglePage === true && pages === 1)) {
    // Nothing to show. The row mounts with its element when pages arrive, so
    // its recognizers attach then.
    return null;
  }
  return <PageControlRow {...props} />;
}

function PageControlRow({
  count,
  value,
  onChange,
  label,
  hidesForSinglePage: _hidesForSinglePage,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
  onKeyDown: onKeyDownProp,
  onClick: onClickProp,
  onPointerDown: onPointerDownProp,
  ...htmlProps
}: PageControlProps) {
  const t = useTranslator();
  const rootRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLSpanElement>(null);
  const pages = Math.max(0, Math.floor(count));
  const current = pages === 0 ? 0 : clampPage(value, pages);
  const layout = pageControlLayout(pages);
  // The scrub, held platter, shrinking window and fades are the touch
  // presentation (a finger, on any touch device); with a mouse the control
  // pages by tap and keys over a cropped row, without them.
  const {isTouch} = useTouchPresentation();

  // The window moves only when the current page would land in a shrunk
  // slot, so it depends on where it was: state, adjusted during render.
  const [windowStart, setWindowStart] = useState(() =>
    windowFor(pages, 0, current),
  );
  const nextWindowStart = isTouch
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
    const pending = {page, kind};
    requestRef.current = pending;
    latest.onChange(page);
    // An app that keeps its value never renders the page: once it has had
    // its chance to (the next task), the request lapses, so asking again
    // calls onChange again.
    setTimeout(() => {
      if (requestRef.current === pending) {
        requestRef.current = null;
      }
    }, 0);
  };

  // The touch layer (PageControlTouch.ts): the scrub, the held platter, the
  // window's slide and the fades, on under a finger.
  usePageControlTouch({
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
  });

  // With a mouse (a fine primary pointer, where the gesture host listens to
  // nothing: spec:AST-094 FR19, FR24): the browser's click steps one page
  // toward its side of the current indicator, by UIKit's tap rule, so a
  // press that travels more than `UIKIT_TAP.allowableMovement` is a drag and
  // pages nothing. Under a finger the touch layer reads the tap, and the click
  // that follows it is ignored.
  const pressRef = useRef<{x: number; y: number} | null>(null);
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pressRef.current = {x: event.clientX, y: event.clientY};
  };
  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    const press = pressRef.current;
    pressRef.current = null;
    const root = rootRef.current;
    const latest = latestRef.current;
    if (isTouch || root == null || latest.pages < 2) {
      return;
    }
    if (
      press != null &&
      Math.hypot(event.clientX - press.x, event.clientY - press.y) >
        UIKIT_TAP.allowableMovement.value
    ) {
      return;
    }
    const dot = stripRef.current?.querySelector(
      `[data-page="${latest.current}"]`,
    );
    if (dot == null) {
      return;
    }
    const box = dot.getBoundingClientRect();
    request(
      tapTarget(
        event.clientX,
        box.left + box.width / 2,
        latest.current,
        latest.pages,
        isRtlElement(root),
      ),
      'tap',
    );
  };

  // With a mouse: the cropped row, every page at full size, shifted at once to
  // keep the current indicator in view.
  useLayoutEffect(() => {
    const strip = stripRef.current;
    const root = rootRef.current;
    if (isTouch || strip == null || root == null) {
      return;
    }
    const isRtl = isRtlElement(root);
    animatorFor(strip).set({
      x: (isRtl ? 1 : -1) * croppedRowOffset(pages, current),
    });
    for (const dot of Array.from(strip.children) as HTMLElement[]) {
      animatorFor(dot).set({scale: DOT_SCALE});
    }
  }, [isTouch, pages, current]);

  // A shown page consumes its request (the touch layer read its kind first).
  const consumedPageRef = useRef(current);
  useLayoutEffect(() => {
    if (consumedPageRef.current !== current) {
      consumedPageRef.current = current;
      requestRef.current = null;
    }
  }, [current]);

  const mergedRef = useMemo(() => mergeRefs(ref, rootRef), [ref]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const isRtl = isRtlElement(event.currentTarget);
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

  const isWindow = isTouch && layout.isWindowed;
  const first = isWindow ? Math.max(0, windowStart - RENDER_MARGIN) : 0;
  const last = isWindow
    ? Math.min(pages, windowStart + layout.slots + RENDER_MARGIN)
    : pages;
  // Under a finger the slots centre on the control; the cropped row starts inside the
  // padding.
  const fullRow = pages * PITCH - PC.indicatorSpacing;
  const stripStart = isTouch
    ? (layout.width - layout.rowWidth) / 2
    : (layout.width -
        Math.min(fullRow, layout.width - 2 * PC.horizontalPadding)) /
      2;
  const transition = isTouch ? SWITCH : 'none';
  const otherAlpha = isInteracting
    ? PC.interactingOtherIndicatorAlpha
    : INACTIVE_ALPHA;
  // The resting window, also in the markup: before the animator takes the
  // strip and the dots (its inline values win), a server-rendered control
  // already shows its current indicator.
  const restOffset = isTouch
    ? windowStart * PITCH
    : croppedRowOffset(pages, current);
  const stripStyle: CSSProperties & Record<`--${string}`, string> = {
    insetInlineStart: stripStart,
    '--_page-control-rest': `${restOffset}px`,
  };
  const top = (PC.height - BOX) / 2;

  return (
    <div
      data-testid={testId}
      data-interacting={isInteracting || undefined}
      {...htmlProps}
      ref={mergedRef}
      {...mergeProps(
        stylex.props(
          styles.root,
          !isTouch && styles.cropped,
          isTouch && styles.platter,
          isTouch && isInteracting && styles.platterShown,
          xstyle,
        ),
        className,
        {
          ...style,
          width: layout.width,
          height: PC.height,
          ['--_page-control-platter-transition' as string]: transition,
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
      // The caller's handler first: its preventDefault keeps the page.
      onKeyDown={composeEventHandlers(onKeyDownProp, onKeyDown)}
      onClick={composeEventHandlers(onClickProp, onClick)}
      onPointerDown={composeEventHandlers(onPointerDownProp, onPointerDown)}>
      <span
        ref={stripRef}
        aria-hidden="true"
        {...stylex.props(styles.strip, styles.restingStrip)}
        style={stripStyle}>
        {Array.from({length: last - first}, (_, i) => {
          const page = first + i;
          return (
            <span
              key={page}
              data-page={page}
              {...stylex.props(styles.indicator, styles.restingDot)}
              style={{
                // The box overhangs its drawn indicator by half a pixel.
                insetInlineStart: page * PITCH - (BOX - PC.indicatorSize) / 2,
                top,
                width: BOX,
                height: BOX,
                ['--_page-control-scale' as string]: String(
                  isTouch
                    ? indicatorSize(pages, windowStart, page) / BOX
                    : DOT_SCALE,
                ),
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
