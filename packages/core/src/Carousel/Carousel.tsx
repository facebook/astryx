// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Carousel.tsx
 * @input Uses React, StyleX, useScrollOverflow, useLayer, Button, Icon, theme tokens
 * @output Exports Carousel component
 * @position Horizontal scroll container with fade-edge overflow indication,
 *   optional prev/next buttons on the top layer, scroll-snap, and a 1px
 *   visual bleed allowance for child selection indicators.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Carousel/index.ts (exports)
 * - /apps/storybook/stories/Carousel.stories.tsx
 * - /packages/cli/templates/blocks/components/Carousel/ (showcase blocks)
 */

import {type ReactNode, useRef, useCallback, useEffect, Children} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  spacingVars,
  colorVars,
  shadowVars,
  radiusVars,
  durationVars,
  easeVars,
} from '../theme/tokens.stylex';
import {Button} from '../Button';
import {Icon} from '../Icon';
import {useLayer} from '../Layer';
import {useScrollOverflow} from '../hooks/useScrollOverflow';
import type {BaseProps} from '../BaseProps';
import {mergeProps, mergeRefs} from '../utils';
import type {SpacingStep} from '../utils/types';
import {themeProps} from '../utils/themeProps';

export interface CarouselProps extends BaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  /** Carousel items — rendered in a horizontal scroll container. */
  children: ReactNode;
  /**
   * Gap between items using spacing scale tokens.
   * @default 1
   */
  gap?: 0 | 0.5 | 1 | 1.5 | 2 | 3 | 4;
  /**
   * Show prev/next navigation buttons when content is scrollable.
   * @default true
   */
  hasButtons?: boolean;
  /**
   * Show gradient edge-fade mask when content overflows, signalling that
   * more items exist off-screen. Can be suppressed when items have
   * full-fidelity surfaces that look broken when masked.
   * @default true
   */
  hasEdgeFade?: boolean;
  /**
   * Enable scroll-snap on items. Each direct child snaps to the start edge.
   * @default false
   */
  hasSnap?: boolean;
  /**
   * Inline padding on the scroll container. Applied as padding-inline
   * so the gutter is inside the scrollable area — items can scroll fully
   * into the padded region. Also sets matching scroll-padding so snap
   * points align to the content edge rather than the viewport edge.
   *
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   * @default undefined (no padding)
   */
  padding?: SpacingStep;
  /**
   * Accessible label for the carousel region.
   * @default 'Carousel'
   */
  'aria-label'?: string;
  'data-testid'?: string;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    maxWidth: '100%',
    overflow: 'clip',
    overflowClipMargin: '1px',
  },
  scroller: {
    display: 'flex',
    alignItems: 'center',
    overflowX: 'auto',
    overflowY: 'hidden',
    /* eslint-disable @astryx/no-hardcoded-styles -- 1px bleed for tab indicator; no token at this size */
    paddingBottom: '1px',
    marginBottom: '-1px',
    /* eslint-enable @astryx/no-hardcoded-styles */
    overscrollBehaviorX: 'contain',
    scrollBehavior: {
      default: 'smooth',
      '@media (prefers-reduced-motion: reduce)': 'auto',
    },
    scrollbarWidth: 'none',
    maskImage: 'none',
    transitionProperty: 'mask-image',
    transitionDuration: {
      default: durationVars['--duration-medium'],
      '@media (prefers-reduced-motion: reduce)': '0ms',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  fadeStart: {
    maskImage: `linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 2px, black ${spacingVars['--spacing-1']})`,
  },
  fadeEnd: {
    maskImage: `linear-gradient(to left, transparent 0%, rgba(0,0,0,0.3) 2px, black ${spacingVars['--spacing-1']})`,
  },
  fadeBoth: {
    maskImage: `linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 2px, black ${spacingVars['--spacing-1']}, black calc(100% - ${spacingVars['--spacing-1']}), rgba(0,0,0,0.3) calc(100% - 2px), transparent 100%)`,
  },
  snap: {
    scrollSnapType: 'x mandatory',
  },
  item: {
    scrollSnapAlign: 'start',
    display: 'flex',
    flexShrink: 0,
  },
  // Overlay on top layer — covers the carousel anchor area
  buttonOverlay: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  buttonPill: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colorVars['--color-background-popover'],
    borderRadius: radiusVars['--radius-full'],
    boxShadow: shadowVars['--shadow-med'],
    pointerEvents: 'auto',
    opacity: 1,
    transitionProperty: 'opacity',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  buttonPillStart: {
    transform: 'translateX(-50%)',
  },
  buttonPillEnd: {
    transform: 'translateX(50%)',
  },
  buttonHidden: {
    opacity: 0,
    pointerEvents: 'none' as const,
  },
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/consistent-type-assertions -- CSS custom property requires type widening for StyleX
  buttonRadiusOverride: {
    '--_button-radius': radiusVars['--radius-full'],
  } as Record<string, string>,
});

const gapStyles = stylex.create({
  0: {gap: spacingVars['--spacing-0']},
  0.5: {gap: spacingVars['--spacing-0-5']},
  1: {gap: spacingVars['--spacing-1']},
  1.5: {gap: spacingVars['--spacing-1-5']},
  2: {gap: spacingVars['--spacing-2']},
  3: {gap: spacingVars['--spacing-3']},
  4: {gap: spacingVars['--spacing-4']},
});

const paddingStyles = stylex.create({
  0: {
    paddingInline: spacingVars['--spacing-0'],
    scrollPaddingInline: spacingVars['--spacing-0'],
  },
  0.5: {
    paddingInline: spacingVars['--spacing-0-5'],
    scrollPaddingInline: spacingVars['--spacing-0-5'],
  },
  1: {
    paddingInline: spacingVars['--spacing-1'],
    scrollPaddingInline: spacingVars['--spacing-1'],
  },
  1.5: {
    paddingInline: spacingVars['--spacing-1-5'],
    scrollPaddingInline: spacingVars['--spacing-1-5'],
  },
  2: {
    paddingInline: spacingVars['--spacing-2'],
    scrollPaddingInline: spacingVars['--spacing-2'],
  },
  3: {
    paddingInline: spacingVars['--spacing-3'],
    scrollPaddingInline: spacingVars['--spacing-3'],
  },
  4: {
    paddingInline: spacingVars['--spacing-4'],
    scrollPaddingInline: spacingVars['--spacing-4'],
  },
  5: {
    paddingInline: spacingVars['--spacing-5'],
    scrollPaddingInline: spacingVars['--spacing-5'],
  },
  6: {
    paddingInline: spacingVars['--spacing-6'],
    scrollPaddingInline: spacingVars['--spacing-6'],
  },
  8: {
    paddingInline: spacingVars['--spacing-8'],
    scrollPaddingInline: spacingVars['--spacing-8'],
  },
  10: {
    paddingInline: spacingVars['--spacing-10'],
    scrollPaddingInline: spacingVars['--spacing-10'],
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * Horizontal scroll container with fade-edge overflow indication and
 * optional navigation buttons.
 *
 * Wraps any content in a scrollable row. When content overflows, gradient
 * fades appear at the edges to signal more items exist. When content overflows, prev/next buttons appear at the edges,
 * rendered on the top layer via Layer so they escape any parent overflow
 * clipping.
 *
 * @example
 * ```
 * <Carousel gap={1}>
 *   <Thumbnail src="/a.jpg" alt="A" />
 *   <Thumbnail src="/b.jpg" alt="B" />
 *   <Thumbnail src="/c.jpg" alt="C" />
 * </Carousel>
 * ```
 */
export function Carousel({
  ref,
  children,
  gap = 1,
  hasButtons = true,
  hasEdgeFade = true,
  hasSnap = false,
  padding,
  'aria-label': ariaLabel = 'Carousel',
  xstyle,
  className,
  style,
  'data-testid': testId,
  ...htmlProps
}: CarouselProps) {
  const scrollElRef = useRef<HTMLElement | null>(null);
  const {scrollRef, overflowStart, overflowEnd} = useScrollOverflow();

  const layer = useLayer({
    mode: 'context',
    lightDismiss: false,
  });

  useEffect(() => {
    if (hasButtons) {
      layer.show();
    } else {
      layer.hide();
    }
  }, [hasButtons, layer]);

  const composedRef = useCallback(
    (el: HTMLDivElement | null) => {
      scrollElRef.current = el;
      scrollRef(el);
    },
    [scrollRef],
  );

  const scrollBy = useCallback((direction: -1 | 1) => {
    const el = scrollElRef.current;
    if (!el) {
      return;
    }
    const firstChild = el.firstElementChild as HTMLElement | null;
    const itemWidth = firstChild ? firstChild.offsetWidth : 0;
    const amount = el.clientWidth - itemWidth * 0.5;
    // Respect the user's reduced-motion preference — mirrors the CSS
    // scroll-behavior override so button-driven scrolling doesn't animate
    // for users who opted out of motion.
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({
      left: direction * Math.max(amount, itemWidth),
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, []);

  const fadeStyle = hasEdgeFade
    ? overflowStart && overflowEnd
      ? styles.fadeBoth
      : overflowStart
        ? styles.fadeStart
        : overflowEnd
          ? styles.fadeEnd
          : null
    : null;

  const coverStyle: React.CSSProperties = {
    positionArea: 'center',
    width: 'anchor-size(width)',
    height: 'anchor-size(height)',
  };

  return (
    <div
      ref={mergeRefs(ref, layer.ref as React.Ref<HTMLDivElement>)}
      data-testid={testId}
      role="region"
      aria-label={ariaLabel}
      aria-roledescription="carousel"
      {...mergeProps(
        themeProps('carousel'),
        stylex.props(styles.root, xstyle),
        className,
        style,
      )}
      {...htmlProps}>
      <div
        ref={composedRef}
        tabIndex={0}
        {...stylex.props(
          styles.scroller,
          gapStyles[gap],
          padding != null && paddingStyles[padding],
          hasSnap && styles.snap,
          fadeStyle,
        )}>
        {Children.map(children, child => (
          <div {...stylex.props(styles.item)}>{child}</div>
        ))}
      </div>

      {hasButtons &&
        layer.render(
          <>
            <div
              {...stylex.props(
                styles.buttonPill,
                styles.buttonPillStart,
                !overflowStart && styles.buttonHidden,
              )}>
              <Button
                icon={<Icon icon="chevronLeft" size="xsm" />}
                label="Scroll left"
                variant="ghost"
                size="sm"
                isIconOnly
                // Disabled when there's nothing to scroll toward. Keeps the
                // button mounted (stable layout/focus) but removes it from the
                // tab order and a11y tree while it's visually hidden, so
                // keyboard users don't land on an invisible control.
                isDisabled={!overflowStart}
                onClick={() => scrollBy(-1)}
                xstyle={styles.buttonRadiusOverride}
              />
            </div>
            <div
              {...stylex.props(
                styles.buttonPill,
                styles.buttonPillEnd,
                !overflowEnd && styles.buttonHidden,
              )}>
              <Button
                icon={<Icon icon="chevronRight" size="xsm" />}
                label="Scroll right"
                variant="ghost"
                size="sm"
                isIconOnly
                // See "Scroll left" — disabled while visually hidden so the
                // button stays mounted but out of the tab order / a11y tree.
                isDisabled={!overflowEnd}
                onClick={() => scrollBy(1)}
                xstyle={styles.buttonRadiusOverride}
              />
            </div>
          </>,
          {
            placement: 'below',
            alignment: 'center',
            style: coverStyle,
            xstyle: styles.buttonOverlay,
          },
        )}
    </div>
  );
}

Carousel.displayName = 'Carousel';
