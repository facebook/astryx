// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSCarousel.tsx
 * @input Uses React, StyleX, useScrollOverflow, useXDSLayer, XDSButton, XDSIcon, theme tokens
 * @output Exports XDSCarousel component
 * @position Horizontal scroll container with fade-edge overflow indication,
 *   optional prev/next buttons on the top layer, and scroll-snap.
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
import {XDSButton} from '../Button';
import {XDSIcon} from '../Icon';
import {useXDSLayer} from '../Layer';
import {useScrollOverflow} from '../hooks/useScrollOverflow';
import type {XDSBaseProps} from '../XDSBaseProps';
import {xdsClassName, mergeProps, mergeRefs} from '../utils';

export interface XDSCarouselProps extends XDSBaseProps<HTMLDivElement> {
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
   * Enable scroll-snap on items. Each direct child snaps to the start edge.
   * @default false
   */
  hasSnap?: boolean;
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
    overflowX: 'hidden',
  },
  scroller: {
    display: 'flex',
    alignItems: 'center',
    overflowX: 'auto',
    overflowY: 'hidden',
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
    // Entry: 0% = item just touching edge, ~15% = item half in view, ~30% = fully in view
    // Exit mirrors in reverse. Scale down only while partially out of view.
    animationName: stylex.keyframes({
      '0%': {transform: 'scale(0.85)'},
      '15%': {transform: 'scale(1)'},
      '85%': {transform: 'scale(1)'},
      '100%': {transform: 'scale(0.85)'},
    }),
    animationTimeline: 'view(inline)',
    animationRange: 'cover',
    animationFillMode: 'both',
    animationDuration: {
      default: null,
      '@media (prefers-reduced-motion: reduce)': '0ms',
    },
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

// =============================================================================
// Component
// =============================================================================

/**
 * Horizontal scroll container with fade-edge overflow indication and
 * optional navigation buttons.
 *
 * Wraps any content in a scrollable row. When content overflows, gradient
 * fades appear at the edges to signal more items exist. When content overflows, prev/next buttons appear at the edges,
 * rendered on the top layer via XDSLayer so they escape any parent overflow
 * clipping.
 *
 * @example
 * ```
 * <XDSCarousel gap={1}>
 *   <XDSThumbnail src="/a.jpg" alt="A" />
 *   <XDSThumbnail src="/b.jpg" alt="B" />
 *   <XDSThumbnail src="/c.jpg" alt="C" />
 * </XDSCarousel>
 * ```
 */
export function XDSCarousel({
  ref,
  children,
  gap = 1,
  hasButtons = true,
  hasSnap = false,
  'aria-label': ariaLabel = 'Carousel',
  xstyle,
  className,
  style,
  'data-testid': testId,
  ...htmlProps
}: XDSCarouselProps) {
  const scrollElRef = useRef<HTMLElement | null>(null);
  const {scrollRef, overflowStart, overflowEnd} = useScrollOverflow();

  const layer = useXDSLayer({
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
    el.scrollBy({
      left: direction * Math.max(amount, itemWidth),
      behavior: 'smooth',
    });
  }, []);

  const fadeStyle =
    overflowStart && overflowEnd
      ? styles.fadeBoth
      : overflowStart
        ? styles.fadeStart
        : overflowEnd
          ? styles.fadeEnd
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
        xdsClassName('carousel'),
        stylex.props(styles.root, xstyle),
        className,
        style,
      )}
      {...htmlProps}>
      <div
        ref={composedRef}
        {...stylex.props(
          styles.scroller,
          gapStyles[gap],
          hasSnap && styles.snap,
          fadeStyle,
        )}>
        {Children.map(children, child => (
          <div {...stylex.props(styles.item)}>{child}</div>
        ))}
      </div>

      {layer.render(
        <>
          <div
            {...stylex.props(
              styles.buttonPill,
              styles.buttonPillStart,
              !overflowStart && styles.buttonHidden,
            )}>
            <XDSButton
              icon={<XDSIcon icon="chevronLeft" size="xsm" />}
              label="Scroll left"
              variant="ghost"
              size="sm"
              isIconOnly
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
            <XDSButton
              icon={<XDSIcon icon="chevronRight" size="xsm" />}
              label="Scroll right"
              variant="ghost"
              size="sm"
              isIconOnly
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

XDSCarousel.displayName = 'XDSCarousel';
