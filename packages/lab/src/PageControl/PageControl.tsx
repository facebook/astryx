// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file PageControl.tsx
 * @input React, StyleX, core's theme tokens and translator, the gesture
 *   system's tap recognizer (`@astryxdesign/core/gestures`), the
 *   UIKit page-control table (`@astryxdesign/core/motion/uikit`),
 *   pageControlModel.ts for the math
 * @output Exports PageControl: a row of page indicators, the current one
 *   highlighted, that pages one step per tap like UIPageControl
 * @position Lab component (packages/lab/src/PageControl); the phone
 *   presentation of "which page am I on" under a paging view (a paging
 *   Carousel, onboarding screens), UIPageControl's counterpart
 *
 * WHAT IT DRAWS
 *
 * UIPageControl's measured geometry (uikit/pageControl.ts): 9.67 px
 * indicators 8 px apart, 14 px of padding at each end, 25.67 px tall, never
 * wider than 161.3 px. Past that the row slides so the current indicator
 * stays in view. The indicators take the theme's primary text colour; the
 * current one is opaque and the others are at 48 % (UIKit's 45 %, raised so
 * they reach 3:1 on the page background; themes keep their colour).
 *
 * HOW IT PAGES
 *
 * A tap on the trailing side of the current indicator asks for the next
 * page, on the leading side for the previous one (mirrored in RTL), when the
 * finger lifts, as UIPageControl reports it. Where the primary pointer is
 * coarse the gesture system's tap recognizer reads the touch; where it is
 * fine the gesture host listens to nothing (`spec:AST-094` FR19, FR24), so a
 * click, a mouse's or a touchscreen finger's, pages by the same rule. The app
 * owns the page (`value` + `onChange`), so the paging view and the control
 * stay in step.
 *
 * Accessibility: one adjustable element, a `slider` named "Page indicators"
 * whose value reads "Page 3 of 5"; the arrow keys, Home and End change the
 * page, and VoiceOver's swipe up or down adjusts it.
 *
 * Not yet: scrubbing (a held finger sliding across the control), the shrinking
 * edge indicators and the sliding of a windowed row, the background platter,
 * and the indicator's transition on a page change wait for their
 * measurements.
 *
 * SYNC: When modified, update PageControl.doc.mjs, PageControl.test.tsx,
 * pageControlModel.ts and __tests__/PageControl.interaction.browser.spec.ts.
 */

import {
  useEffect,
  useMemo,
  useRef,
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
import {isRtlElement} from '@astryxdesign/core/hooks';
import {colorVars, focusVars} from '@astryxdesign/core/theme/tokens.stylex';
import {
  TapGestureRecognizer,
  useGestureRecognizer,
} from '@astryxdesign/core/gestures';
import {UIKIT_TAP, pageControl} from '@astryxdesign/core/motion/uikit';
import {TOUCH_QUERY} from '@astryxdesign/core/utils/touchPresentation';
import {pageControlLayout, tapTarget, windowOffset} from './pageControlModel';

const PC = pageControl;
// Each indicator is a whole-pixel box scaled down to UIKit's 9.67 px. Chromium
// snaps a box's edges to whole CSS pixels when it paints, so a 9.67 px box
// paints 9 or 10 px wide depending on where it falls: every few indicators an
// oval. A 10 px box keeps its shape wherever it falls, and `scale` brings it
// to the measured size around its centre.
const BOX = Math.ceil(PC.indicatorSize);
const DOT_SCALE = PC.indicatorSize / BOX;
// UIKit draws the other indicators at 45 %; at that alpha Core's primary text
// colour on its page background measures 2.97:1, under the 3:1 WCAG 1.4.11
// asks of the only cue for how many pages there are. 48 % gives 3.25:1.
const INACTIVE_ALPHA = Math.max(PC.otherIndicatorAlpha, 0.48);

export interface PageControlProps extends Omit<
  BaseProps<HTMLDivElement>,
  'onChange'
> {
  /** Number of pages. */
  count: number;
  /** The current page, 0-based. */
  value: number;
  /** Called with the page a tap, a key or an assistive technology asks for. */
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
    display: 'inline-flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    overflow: 'hidden',
    flexShrink: 0,
    cursor: 'default',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    outlineStyle: {
      default: 'none',
      ':focus-visible': focusVars['--focus-outline-style'],
    },
    outlineWidth: focusVars['--focus-outline-width'],
    outlineColor: focusVars['--focus-outline-color'],
    outlineOffset: focusVars['--focus-outline-offset'],
  },
  strip: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  // A windowed row shifts toward its logical start by --_page-control-offset.
  windowed: {
    translate: {
      default: 'calc(-1 * var(--_page-control-offset, 0px)) 0',
      ':is([dir="rtl"] *)': 'var(--_page-control-offset, 0px) 0',
    },
  },
  indicator: {
    flexShrink: 0,
    borderRadius: '50%',
    backgroundColor: colorVars['--color-text-primary'],
  },
});

function clampPage(page: number, count: number): number {
  return Math.max(0, Math.min(count - 1, Math.round(page)));
}

/**
 * A row of page indicators that pages one step per tap, like UIPageControl.
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
    // its tap recognizer attaches then.
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

  // Read through a ref: the recognizer is created once.
  const latestRef = useRef({current, pages, onChange});
  useEffect(() => {
    latestRef.current = {current, pages, onChange};
  });

  // A tap or a click at `x` (viewport px): the page beside the current one on
  // that side.
  const pageAt = (x: number) => {
    const root = rootRef.current;
    const strip = stripRef.current;
    const {current: page, pages: total, onChange: change} = latestRef.current;
    const indicator = strip?.children[page];
    if (root == null || indicator == null || total < 2) {
      return;
    }
    const box = indicator.getBoundingClientRect();
    const next = tapTarget(
      x,
      box.left + box.width / 2,
      page,
      total,
      isRtlElement(root),
    );
    if (next !== page) {
      change(next);
    }
  };

  // A coarse primary pointer: the tap recognizer reads the touch.
  useGestureRecognizer(
    rootRef,
    () => new TapGestureRecognizer(),
    recognizer => {
      if (recognizer.state === 'ended') {
        pageAt(recognizer.location().x);
      }
    },
  );

  // A fine primary pointer: the gesture host listens to nothing (FR19, FR24),
  // so the browser's click pages, by UIKit's tap rule: a press that travels
  // more than `UIKIT_TAP.allowableMovement` is a drag and pages nothing. Under
  // a coarse one the recognizer already did, so the click that follows a tap
  // is ignored.
  const pressRef = useRef<{x: number; y: number} | null>(null);
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pressRef.current = {x: event.clientX, y: event.clientY};
  };
  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    const press = pressRef.current;
    pressRef.current = null;
    const view = event.currentTarget.ownerDocument.defaultView;
    if (
      typeof view?.matchMedia === 'function' &&
      view.matchMedia(TOUCH_QUERY).matches
    ) {
      return;
    }
    if (
      press != null &&
      Math.hypot(event.clientX - press.x, event.clientY - press.y) >
        UIKIT_TAP.allowableMovement.value
    ) {
      return;
    }
    pageAt(event.clientX);
  };

  const mergedRef = useMemo(() => mergeRefs(ref, rootRef), [ref]);

  const layout = pageControlLayout(pages);
  const offset = windowOffset(pages, current);
  const stripStyle: CSSProperties & Record<`--${string}`, string> = {
    // The measured pitch between the boxes' left edges, and the half pixel
    // each box overhangs its drawn indicator, so the indicators sit exactly
    // where UIKit draws them.
    gap: PC.indicatorSize + PC.indicatorSpacing - BOX,
    marginInlineStart: -(BOX - PC.indicatorSize) / 2,
    // Keeps the current indicator inside a windowed control.
    '--_page-control-offset': `${offset}px`,
  };

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
    next = clampPage(next, pages);
    if (next !== current) {
      onChange(next);
    }
  };

  return (
    <div
      data-testid={testId}
      {...htmlProps}
      ref={mergedRef}
      {...mergeProps(stylex.props(styles.root, xstyle), className, {
        ...style,
        width: layout.width,
        height: PC.height,
        paddingInline: PC.horizontalPadding,
      })}
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
      // The caller's handlers first: their preventDefault keeps the page.
      onKeyDown={composeEventHandlers(onKeyDownProp, onKeyDown)}
      onClick={composeEventHandlers(onClickProp, onClick)}
      onPointerDown={composeEventHandlers(onPointerDownProp, onPointerDown)}>
      <span
        ref={stripRef}
        aria-hidden="true"
        {...stylex.props(styles.strip, offset !== 0 && styles.windowed)}
        style={stripStyle}>
        {Array.from({length: pages}, (_, page) => (
          <span
            key={page}
            {...stylex.props(styles.indicator)}
            style={{
              width: BOX,
              height: BOX,
              scale: `${DOT_SCALE}`,
              opacity:
                page === current ? PC.currentIndicatorAlpha : INACTIVE_ALPHA,
            }}
          />
        ))}
      </span>
    </div>
  );
}

PageControl.displayName = 'PageControl';
