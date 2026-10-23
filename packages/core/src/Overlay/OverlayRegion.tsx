// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file OverlayRegion.tsx
 * @input `position`: a preset place or open placement in 0–1 fractions
 * @output Exports OverlayRegion, resolveOverlayRegionAxis, and position types
 * @position Overlay subcomponent; rendered inside a fill Overlay's content
 *
 * Places one piece of content over an Overlay's surface: a caption drawn into
 * an image, a badge in a corner, a tag on a face. Presets reuse Overlay's own
 * places (`fill`, `top`, `bottom`) plus the center and the logical corners;
 * open placement puts the region's top-left corner at fractions of the media,
 * measured physically. Placement is plain CSS on the given values, so it
 * follows the surface through every resize with no measurement. Moving a
 * region is the caller's job: pass a new `position`.
 *
 * Regions belong to fill overlays. Inside a top or bottom strip a region is
 * not placed: its content flows with the strip, and a dev warning fires.
 */

import {use, type ReactNode, type Ref} from 'react';
import * as stylex from '@stylexjs/stylex';
import {mergeProps} from '../utils';
import {useDevWarning} from '../hooks/useDevWarning';
import {spacingVars} from '../theme/tokens.stylex';
import type {BaseProps} from '../BaseProps';
import {overlayRegionMarker} from './overlay.markers.stylex';
import {OverlayPositionContext} from './OverlayScrim';

/** A preset place for a region. `start`/`end` follow the writing direction. */
export type OverlayRegionPreset =
  | 'fill'
  | 'top'
  | 'bottom'
  | 'center'
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end';

/**
 * Open placement in 0–1 fractions of the surface, measured from its top-left
 * corner in every writing direction (media does not mirror).
 */
export interface OverlayRegionPlacement {
  /** The region's left edge, as a fraction of the surface's width. */
  x: number;
  /** The region's top edge, as a fraction of the surface's height. */
  y: number;
  /**
   * The region's width, extending right. A sized region stays inside the
   * surface on this axis. Omit to fit the content.
   */
  width?: number;
  /**
   * The region's height, extending down. A sized region stays inside the
   * surface on this axis. Omit to fit the content.
   */
  height?: number;
}

export type OverlayRegionPosition =
  OverlayRegionPreset | OverlayRegionPlacement;

export interface OverlayRegionProps extends Pick<
  BaseProps<HTMLDivElement>,
  'xstyle' | 'className' | 'style'
> {
  /** Ref forwarded to the region element. */
  ref?: Ref<HTMLDivElement>;
  /** Where the region sits: a preset place, or open placement in fractions. */
  position: OverlayRegionPosition;
  /** Content placed at the position. */
  children?: ReactNode;
}

/** One open-placement axis, resolved to fractions of the surface. */
export interface OverlayRegionAxis {
  /** Where the region's left or top edge sits. */
  start: number;
  /** The region's size, or `null` when it fits its content. */
  size: number | null;
}

function clampFraction(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * Resolves one open-placement axis: clamp both values into 0–1, then keep a
 * sized region wholly inside the surface. A content-sized region starts at
 * its coordinate; keeping it inside would need measuring it.
 */
export function resolveOverlayRegionAxis(
  start: number,
  size: number | undefined,
): OverlayRegionAxis {
  const resolvedStart = Number.isFinite(start) ? clampFraction(start) : 0;
  if (size === undefined || !Number.isFinite(size)) {
    return {start: resolvedStart, size: null};
  }
  const resolvedSize = clampFraction(size);
  return {start: Math.min(resolvedStart, 1 - resolvedSize), size: resolvedSize};
}

// Rounded to 1/10000 of a percent, far below a device pixel on any surface,
// so floating-point noise never reaches the CSS.
const toPercent = (fraction: number) =>
  `${Math.round(fraction * 1_000_000) / 10_000}%`;

// Presets sit inside Overlay's content inset, the scrim's own padding.
const INSET = spacingVars['--spacing-3'];

const styles = stylex.create({
  region: {
    position: 'absolute',
    // Local paint order, isolated by the Overlay container that holds the
    // region: it stays above positioned in-flow overlay content after it.
    zIndex: 1,
    boxSizing: 'border-box',
  },
  fill: {inset: INSET},
  top: {insetInline: INSET, top: INSET},
  bottom: {insetInline: INSET, bottom: INSET},
  // Auto margins center a fit-content box between equal insets, with no
  // translate, so it is direction-neutral and respects the inset.
  center: {
    inset: INSET,
    margin: 'auto',
    inlineSize: 'fit-content',
    blockSize: 'fit-content',
  },
  topStart: {top: INSET, insetInlineStart: INSET},
  topEnd: {top: INSET, insetInlineEnd: INSET},
  bottomStart: {bottom: INSET, insetInlineStart: INSET},
  bottomEnd: {bottom: INSET, insetInlineEnd: INSET},
  open: (left: string, top: string, width: string, height: string) => ({
    // eslint-disable-next-line @astryx/no-physical-properties -- intentional: open placement is media space, measured from the surface's left edge in every direction (design:bidirectionality DR5); a logical inset would mirror the spot on the media under RTL.
    left,
    top,
    width,
    height,
    maxInlineSize: '100%',
    maxBlockSize: '100%',
  }),
  // Inside a strip the region is not placed: its content flows with it.
  unplaced: {position: 'static', zIndex: 'auto'},
});

const presetStyles = {
  fill: styles.fill,
  top: styles.top,
  bottom: styles.bottom,
  center: styles.center,
  'top-start': styles.topStart,
  'top-end': styles.topEnd,
  'bottom-start': styles.bottomStart,
  'bottom-end': styles.bottomEnd,
} as const;

function placementStyle(position: OverlayRegionPosition) {
  if (typeof position === 'string') {
    return presetStyles[position];
  }
  const inline = resolveOverlayRegionAxis(position.x, position.width);
  const block = resolveOverlayRegionAxis(position.y, position.height);
  return styles.open(
    toPercent(inline.start),
    toPercent(block.start),
    inline.size === null ? 'max-content' : toPercent(inline.size),
    block.size === null ? 'auto' : toPercent(block.size),
  );
}

/**
 * OverlayRegion — one piece of content at a preset or fractional position on
 * a fill Overlay's surface.
 *
 * @compositionHint Place inside a fill Overlay's content, usually with
 * `scrim={false}`; render several for several spots on one image.
 *
 * @example
 * ```
 * <Overlay
 *   scrim={false}
 *   content={
 *     <>
 *       <OverlayRegion position="top-start"><Badge label="New" /></OverlayRegion>
 *       <OverlayRegion position={{x: 0.1, y: 0.04, width: 0.8, height: 0.16}}>
 *         <CaptionBox />
 *       </OverlayRegion>
 *     </>
 *   }>
 *   <AspectRatio ratio={4 / 3}>
 *     <img src="photo.jpg" alt="Preview" />
 *   </AspectRatio>
 * </Overlay>
 * ```
 */
export function OverlayRegion({
  position,
  children,
  xstyle,
  className,
  style,
  ref,
}: OverlayRegionProps) {
  const hostPosition = use(OverlayPositionContext);
  const isInStrip = hostPosition === 'top' || hostPosition === 'bottom';
  useDevWarning(
    'OverlayRegion',
    'belongs to an Overlay with position="fill". Inside a top or bottom strip it is not placed: its content flows with the strip.',
    isInStrip,
  );

  return (
    <div
      ref={ref}
      {...mergeProps(
        stylex.props(
          overlayRegionMarker,
          styles.region,
          isInStrip ? styles.unplaced : placementStyle(position),
          xstyle,
        ),
        className,
        style,
      )}>
      {children}
    </div>
  );
}

OverlayRegion.displayName = 'OverlayRegion';
