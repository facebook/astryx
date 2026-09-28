// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layerPlacement.ts
 * @input Uses `CSS.supports` (guarded) and the LayerPlacement/LayerAlignment types
 * @output The anchor-positioning capability probe and the pure placement math
 *   behind useLayer's measured fallback.
 * @position Internal to Layer; useLayer.tsx is the only consumer.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layer/layerPlacement.test.ts
 * - /packages/core/src/Layer/useLayer.tsx
 * - /packages/core/src/Layer/useLayer.doc.mjs
 */

import type {LayerAlignment, LayerPlacement} from './useLayer';

/**
 * The two CSS halves a layer's placement is made of, and whether the engine
 * implements each.
 */
export interface LayerPositioningSupport {
  /** `position-area`: the side and the alignment. */
  positionArea: boolean;
  /** `position-try-fallbacks`: the flip to the other side when the room is short. */
  positionTryFallbacks: boolean;
}

/**
 * Which path places a layer, exposed on the rendered element as
 * `data-astryx-layer-placement`.
 *
 * - `anchor`: CSS anchor positioning end to end (the primary path).
 * - `anchor-flip`: CSS places the side (`position-area`), JS decides the flip
 *   by measuring, because the engine has no `position-try-fallbacks`.
 * - `measured`: JS measures the anchor and the layer and writes `position:
 *   fixed` coordinates, because the engine has no `position-area`.
 */
export type LayerPlacementPath = 'anchor' | 'anchor-flip' | 'measured';

/**
 * Ask the engine which halves it implements. The values probed are the ones
 * `useLayer` actually emits (the `self-*` keyword family, `flip-block`), so an
 * engine that parses `position-area` but not those keywords is not counted as
 * supporting the primary path.
 *
 * Without a `CSS` object — a server render, a DOM emulator — nothing is
 * painted, so the primary path is reported: it emits the same markup on both
 * sides of hydration and there is nothing to measure.
 */
export function readLayerPositioningSupport(): LayerPositioningSupport {
  if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') {
    return {positionArea: true, positionTryFallbacks: true};
  }
  return {
    positionArea: CSS.supports(
      'position-area',
      'self-block-start span-self-inline-end',
    ),
    positionTryFallbacks: CSS.supports('position-try-fallbacks', 'flip-block'),
  };
}

export function layerPlacementPathFor(
  support: LayerPositioningSupport,
): LayerPlacementPath {
  if (!support.positionArea) {
    return 'measured';
  }
  if (!support.positionTryFallbacks) {
    return 'anchor-flip';
  }
  return 'anchor';
}

export interface LayerRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface LayerSize {
  width: number;
  height: number;
}

/** Room to keep from each viewport edge, in px. */
export interface LayerGutter {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface MeasuredPlacementInput {
  /** The trigger's box, in viewport (client) coordinates. */
  anchorRect: LayerRect;
  /**
   * The layer's margin box. The clearance a caller asks for with `offset`
   * rides in the margins, so positioning the margin box keeps the gap.
   */
  layerSize: LayerSize;
  /** The viewport the coordinates resolve against (`position: fixed`). */
  viewport: LayerSize;
  placement: LayerPlacement;
  alignment: LayerAlignment;
  /** One number for every edge, or a value per edge. */
  gutter: number | LayerGutter;
  /**
   * The layer's inline direction. `start`/`end` are logical, as they are in
   * `position-area`, so RTL mirrors the inline axis.
   * @default 'ltr'
   */
  direction?: 'ltr' | 'rtl';
}

export interface MeasuredPlacement {
  /** `top` of the layer's margin box, viewport px, whole numbers. */
  top: number;
  /** `left` of the layer's margin box, viewport px, whole numbers. */
  left: number;
  /** The side the layer ended up on: the request, or its flip. */
  side: LayerPlacement;
}

type PhysicalSide = 'top' | 'bottom' | 'left' | 'right';

const OPPOSITE: Record<PhysicalSide, PhysicalSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

function toPhysical(placement: LayerPlacement, rtl: boolean): PhysicalSide {
  switch (placement) {
    case 'above':
      return 'top';
    case 'below':
      return 'bottom';
    case 'start':
      return rtl ? 'right' : 'left';
    case 'end':
      return rtl ? 'left' : 'right';
  }
}

function toLogical(side: PhysicalSide, rtl: boolean): LayerPlacement {
  switch (side) {
    case 'top':
      return 'above';
    case 'bottom':
      return 'below';
    case 'left':
      return rtl ? 'end' : 'start';
    case 'right':
      return rtl ? 'start' : 'end';
  }
}

function normalizeGutter(gutter: number | LayerGutter): LayerGutter {
  return typeof gutter === 'number'
    ? {top: gutter, right: gutter, bottom: gutter, left: gutter}
    : gutter;
}

/**
 * Align one axis of the layer against the anchor. `start` lines the layer's
 * start edge up with the anchor's, `end` the end edges, `center` the middles —
 * the same three positions `position-area`'s span keywords produce.
 */
function align(
  anchorStart: number,
  anchorLength: number,
  layerLength: number,
  alignment: LayerAlignment,
  mirrored: boolean,
): number {
  const effective =
    mirrored && alignment !== 'center'
      ? alignment === 'start'
        ? 'end'
        : 'start'
      : alignment;
  switch (effective) {
    case 'start':
      return anchorStart;
    case 'end':
      return anchorStart + anchorLength - layerLength;
    case 'center':
      return anchorStart + (anchorLength - layerLength) / 2;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

/**
 * Where a layer goes when the engine cannot anchor it: the contract CSS anchor
 * positioning gives, computed from measurements.
 *
 * 1. The requested side, when the layer fits in the room that side has
 *    (the gutter excluded).
 * 2. Otherwise the opposite side, when the layer fits there — what
 *    `position-try-fallbacks: flip-block` / `flip-inline` does.
 * 3. Otherwise whichever side has more room. CSS keeps the requested side
 *    here and lets the layer overflow; a measured layer is clamped instead
 *    (step 5), so the roomier side is the one that covers less of the anchor.
 * 4. Alignment along the other axis: start, center or end edges, logical, so
 *    RTL mirrors the inline axis as `position-area`'s self-* keywords do.
 * 5. Clamped to the gutter on both axes. A layer larger than the viewport
 *    sits at the gutter's start edge.
 *
 * Pure: no DOM, so every branch is a table test. The caller hands in the
 * layer's MARGIN box and puts the result on `top`/`left`, which position the
 * margin edge — the `offset` clearance survives that way, as it does a CSS
 * flip.
 */
export function resolveMeasuredPlacement(
  input: MeasuredPlacementInput,
): MeasuredPlacement {
  const {anchorRect: anchor, layerSize: layer, viewport, alignment} = input;
  const rtl = input.direction === 'rtl';
  const gutter = normalizeGutter(input.gutter);

  const room: Record<PhysicalSide, number> = {
    top: anchor.top - gutter.top,
    bottom: viewport.height - gutter.bottom - (anchor.top + anchor.height),
    left: anchor.left - gutter.left,
    right: viewport.width - gutter.right - (anchor.left + anchor.width),
  };

  const requested = toPhysical(input.placement, rtl);
  const opposite = OPPOSITE[requested];
  const blockAxis = requested === 'top' || requested === 'bottom';
  const needed = blockAxis ? layer.height : layer.width;

  let side = requested;
  if (room[requested] < needed) {
    if (room[opposite] >= needed || room[opposite] > room[requested]) {
      side = opposite;
    }
  }

  let top: number;
  let left: number;
  if (blockAxis) {
    top =
      side === 'top' ? anchor.top - layer.height : anchor.top + anchor.height;
    left = align(anchor.left, anchor.width, layer.width, alignment, rtl);
  } else {
    left =
      side === 'left' ? anchor.left - layer.width : anchor.left + anchor.width;
    top = align(anchor.top, anchor.height, layer.height, alignment, false);
  }

  return {
    top: Math.round(
      clamp(top, gutter.top, viewport.height - gutter.bottom - layer.height),
    ),
    left: Math.round(
      clamp(left, gutter.left, viewport.width - gutter.right - layer.width),
    ),
    side: toLogical(side, rtl),
  };
}
