/**
 * @file xif-types.ts
 * @description XDS Icon Format (XIF) type definitions — v0.1.0 draft
 *
 * Icons are pure structure — zero visual values. The theme resolves
 * all visual properties (color, weight, rounding, timing).
 *
 * This file defines the SOURCE format types. The resolved/build output
 * uses a simpler pre-computed format (see theme build pipeline).
 */

// =============================================================================
// Personality
// =============================================================================

/**
 * Percentile adjustment parameters for shape personality.
 * All values 0-1. 0 = artist's original. 1 = maximum shift.
 * Adjustments are RELATIVE — they preserve the artist's hierarchy
 * of sharp vs soft, straight vs curved.
 */
export interface XIFPersonality {
  /**
   * Shift corners toward rounded.
   * A sharp 90° corner shifts more than an already-gentle 150° corner.
   * Formula: adjustedR = baseR + (maxR - baseR) × cornerRounding
   */
  cornerRounding?: number;

  /**
   * Shift straight segments toward curved.
   * A straight line gains a bow; an existing curve barely changes.
   * Formula: adjusted = original + (1 - original) × segmentCurvature
   */
  segmentCurvature?: number;

  /**
   * How tightly curves hug their control points.
   * 0 = loose (curves balloon). 0.5 = neutral. 1 = tight (near-straight).
   */
  tension?: number;
}

// =============================================================================
// Animation
// =============================================================================

/**
 * Animation intent for a path element.
 * Declares WHAT animates and in WHAT ORDER — not timing or easing.
 * The theme resolves all visual animation properties.
 */
export interface XIFAnimate {
  /**
   * Semantic animation type.
   * - draw: stroke reveals along path (dasharray/dashoffset)
   * - fade: opacity entrance
   * - scale: grow from center
   * - rotate: continuous spin (loaders)
   * - morph: interpolate between variation states
   */
  type: 'draw' | 'fade' | 'scale' | 'rotate' | 'morph';

  /**
   * Stagger order. Lower numbers animate first.
   * Paths with the same sequence animate simultaneously.
   */
  sequence?: number;
}

// =============================================================================
// Slots (Composition)
// =============================================================================

/**
 * A named position where a sub-icon can be injected.
 * The theme resolves position/size to actual viewBox coordinates.
 */
export interface XIFSlot {
  /** Slot identifier — used in component props */
  name: string;

  /** Semantic position. Theme resolves to coordinates. */
  position:
    | 'center'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | {x: number; y: number}; // normalized 0-1 relative to viewBox

  /**
   * Size of the injected icon relative to parent.
   * 'content' = auto-sized by theme. number = fraction of parent.
   */
  size?: 'content' | number;
}

// =============================================================================
// Path Entry
// =============================================================================

/**
 * A single shape element within an icon.
 * Contains geometry + semantic metadata. Zero visual values.
 */
export interface XIFPath {
  /** SVG element type. Default: 'path' */
  type?:
    | 'path'
    | 'circle'
    | 'rect'
    | 'line'
    | 'polyline'
    | 'ellipse'
    | 'polygon';

  /** SVG geometry attributes (d, cx, cy, r, x, y, width, height, etc.) */
  attrs: Record<string, string | number>;

  /**
   * Rendering behavior across variations.
   * - 'fill': Closed shape — stroked in linear, filled in bold.
   * - 'stroke': Line/detail — always rendered as a stroke.
   * Default: 'fill'
   */
  role?: 'fill' | 'stroke';

  /**
   * Visual hierarchy for twotone/bulk and bold knockouts.
   * - 'primary': Full opacity. In bold, rendered as solid fill.
   * - 'secondary': Reduced opacity in twotone/bulk. Knocked out in bold.
   * Default: 'primary'
   */
  layer?: 'primary' | 'secondary';

  /** Per-path personality overrides (shift from theme/icon defaults) */
  personality?: XIFPersonality;

  /** Animation intent */
  animate?: XIFAnimate;
}

// =============================================================================
// Icon Definition
// =============================================================================

/**
 * Root type for an XDS Icon Format definition.
 * Pure structure — no visual values.
 */
export interface XIFIcon {
  /** Unique identifier */
  name: string;

  /** ViewBox dimensions. Default: '0 0 24 24' */
  viewBox?: string;

  /** Shape elements that compose the icon */
  paths: XIFPath[];

  /**
   * Per-variation geometry overrides.
   * Rendered in DOM alongside default paths; CSS toggles visibility.
   */
  overrides?: {
    bold?: XIFPath[];
    broken?: XIFPath[];
  };

  /** Named slots for sub-icon composition */
  slots?: XIFSlot[];

  /** Icon-level personality overrides */
  personality?: XIFPersonality;

  /** Tags for search and categorization */
  tags?: string[];
}
