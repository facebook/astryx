// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layerSlideRules.ts
 * @input A layer's placement and alignment
 * @output The `@position-try` rules for its slide options and their names
 * @position Layer runtime geometry; the slide of spec:AST-059 FR4
 *
 * The slide is a position option whose area spans the whole alignment axis,
 * so a layer wider than the room beside its trigger on both sides still
 * reaches the side of the trigger that has room on the placement axis. A
 * plain `<position-area>` fallback would keep the base margins and insets,
 * which belong to an edge-aligned layer: the alignment-axis gutter on one
 * edge only, and the clearance/gutter pair of the base side on the placement
 * axis. Each slide option therefore carries its own declarations — the
 * gutter on both alignment-axis edges, and the clearance facing the anchor
 * with the gutter on the far edge of the side it lands on.
 *
 * The rules are static — the anchor clearance travels through a custom
 * property — so one style sheet per document carries all of them. It is
 * installed from a layout effect, before the layer's first paint, rather than
 * through StyleX, whose `positionTry()` output is malformed in the pinned
 * release. The sheet lives in the document head, not beside or inside the
 * layer: a sibling would change what a parent's last child is, and text
 * inside a role-bearing layer would name it to assistive technology.
 */

import type {LayerAlignment, LayerPlacement} from './useLayer';
import {layerViewportInset} from './layerViewportInset.stylex';

/** The custom property a layer writes its anchor clearance to. */
export const LAYER_CLEARANCE_PROPERTY = '--_astryx-layer-clearance';

type Side = 'same' | 'opposite';

export function slideRuleName(
  placement: LayerPlacement,
  alignment: LayerAlignment,
  side: Side,
): string {
  return `--astryx-layer-slide-${placement}-${alignment}-${side}`;
}

const CLEARANCE = `var(${LAYER_CLEARANCE_PROPERTY}, 0px)`;

/** Two declarations: the `env()`-less fallback first, then the full value. */
function pair(property: string, fallback: string, value: string): string {
  return `${property}:${fallback};${property}:${value};`;
}

function blockGutter(property: string): string {
  return pair(
    property,
    layerViewportInset.gutterBlockFallback,
    layerViewportInset.gutterBlock,
  );
}

function inlineGutter(property: string): string {
  return pair(
    property,
    layerViewportInset.gutterInlineFallback,
    layerViewportInset.gutterInline,
  );
}

const OPPOSITE: Record<LayerPlacement, LayerPlacement> = {
  above: 'below',
  below: 'above',
  start: 'end',
  end: 'start',
};

function areaFor(placement: LayerPlacement): string {
  switch (placement) {
    case 'above':
      return 'self-block-start span-all';
    case 'below':
      return 'self-block-end span-all';
    case 'start':
      return 'self-inline-start span-all';
    case 'end':
      return 'self-inline-end span-all';
  }
}

/** The placement-axis margins for a layer resting on `placement`'s side. */
function placementMargins(placement: LayerPlacement): string {
  switch (placement) {
    case 'above':
      return `margin-block-end:${CLEARANCE};${blockGutter('margin-block-start')}`;
    case 'below':
      return `margin-block-start:${CLEARANCE};${blockGutter('margin-block-end')}`;
    case 'start':
      return `margin-inline-end:${CLEARANCE};${inlineGutter('margin-inline-start')}`;
    case 'end':
      return `margin-inline-start:${CLEARANCE};${inlineGutter('margin-inline-end')}`;
  }
}

/** The alignment-axis gutter on both edges, with the base inset reset. */
function alignmentMargins(placement: LayerPlacement): string {
  return placement === 'above' || placement === 'below'
    ? `${inlineGutter('margin-inline-start')}${inlineGutter('margin-inline-end')}inset-inline-start:0;inset-inline-end:0;`
    : `${blockGutter('margin-block-start')}${blockGutter('margin-block-end')}inset-block-start:0;inset-block-end:0;`;
}

function rule(
  placement: LayerPlacement,
  alignment: LayerAlignment,
  side: Side,
): string {
  const landing = side === 'same' ? placement : OPPOSITE[placement];
  return `@position-try ${slideRuleName(placement, alignment, side)}{position-area:${areaFor(landing)};${placementMargins(landing)}${alignmentMargins(landing)}}`;
}

const PLACEMENTS: ReadonlyArray<LayerPlacement> = [
  'above',
  'below',
  'start',
  'end',
];
const ALIGNMENTS: ReadonlyArray<LayerAlignment> = ['start', 'center', 'end'];

/** Every slide rule, for every placement and alignment. */
export function slideRulesCss(): string {
  return PLACEMENTS.flatMap(placement =>
    ALIGNMENTS.flatMap(alignment => [
      rule(placement, alignment, 'same'),
      rule(placement, alignment, 'opposite'),
    ]),
  ).join('');
}

export const SLIDE_RULES_ID = 'astryx-layer-slide-rules';

/**
 * Install the slide rules in a document once. Idempotent; a second layer, or
 * a layer in another document (an iframe), finds or adds its own sheet.
 */
export function ensureSlideRules(doc: Document): void {
  if (doc.getElementById(SLIDE_RULES_ID)) {
    return;
  }
  const style = doc.createElement('style');
  style.id = SLIDE_RULES_ID;
  style.textContent = slideRulesCss();
  doc.head.appendChild(style);
}
