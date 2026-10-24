// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file PageControl.tsx
 * @input React, StyleX, core's theme tokens and translator, the gesture
 *   system's tap recognizer (`@astryxdesign/core/gestures/experimental`), the
 *   UIKit page-control table (`@astryxdesign/core/motion/experimental`),
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
 * current one is opaque and the others are at 45 %, UIKit's default alphas
 * (themes keep their colour).
 *
 * HOW IT PAGES
 *
 * A tap on the trailing side of the current indicator asks for the next
 * page, on the leading side for the previous one (mirrored in RTL), when the
 * finger lifts, as UIPageControl reports it. The app owns the page (`value`
 * + `onChange`), so the paging view and the control stay in step.
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

import {useEffect, useRef, type CSSProperties, type KeyboardEvent} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '@astryxdesign/core';
import {useTranslator} from '@astryxdesign/core/i18n';
import {mergeProps} from '@astryxdesign/core/utils';
import {colorVars, focusVars} from '@astryxdesign/core/theme/tokens.stylex';
import {
  TapGestureRecognizer,
  useGestureRecognizer,
} from '@astryxdesign/core/gestures/experimental';
import {uikit} from '@astryxdesign/core/motion/experimental';
import {pageControlLayout, tapTarget, windowOffset} from './pageControlModel';

const PC = uikit.pageControl;

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

  // Read through a ref: the recognizer is created once.
  const latestRef = useRef({current, pages, onChange});
  useEffect(() => {
    latestRef.current = {current, pages, onChange};
  });

  useGestureRecognizer(
    rootRef,
    () => new TapGestureRecognizer(),
    recognizer => {
      if (recognizer.state !== 'ended') {
        return;
      }
      const root = rootRef.current;
      const strip = stripRef.current;
      const {current: page, pages: total, onChange: change} = latestRef.current;
      const indicator = strip?.children[page];
      if (root == null || indicator == null || total < 2) {
        return;
      }
      const box = indicator.getBoundingClientRect();
      const next = tapTarget(
        recognizer.location().x,
        box.left + box.width / 2,
        page,
        total,
        getComputedStyle(root).direction === 'rtl',
      );
      if (next !== page) {
        change(next);
      }
    },
  );

  if (pages === 0 || (hidesForSinglePage && pages === 1)) {
    return null;
  }

  const layout = pageControlLayout(pages);
  const offset = windowOffset(pages, current);
  const stripStyle: CSSProperties & Record<`--${string}`, string> = {
    gap: PC.indicatorSpacing,
    // Keeps the current indicator inside a windowed control.
    '--_page-control-offset': `${offset}px`,
  };

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
    next = clampPage(next, pages);
    if (next !== current) {
      onChange(next);
    }
  };

  return (
    <div
      ref={rootRef}
      data-testid={testId}
      {...htmlProps}
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
      onKeyDown={onKeyDown}>
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
              width: PC.indicatorSize,
              height: PC.indicatorSize,
              opacity:
                page === current
                  ? PC.currentIndicatorAlpha
                  : PC.otherIndicatorAlpha,
            }}
          />
        ))}
      </span>
    </div>
  );
}

PageControl.displayName = 'PageControl';
