// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Imports Card component
 * @output Exports Card, CardProps, CardVariant, CardVariantMap
 * @position Entry point for @astryxdesign/core/Card module
 *
 * SYNC: When modified, update /packages/core/src/Card/Card.doc.mjs
 */

/**
 * Extensible variant map for Card.
 *
 * Theme packages can add custom variants via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@astryxdesign/core/Card' {
 *   interface CardVariantMap {
 *     'brand': true;
 *   }
 * }
 * ```
 *
 * Pair the theme rule's `backgroundColor` with a `color`. SelectableCard draws
 * an added variant's selection ring in `currentColor` — it cannot know what the
 * theme painted — so a fill with no `color` leaves the ring invisible against
 * it. A theme that would rather own the ring can style
 * `.astryx-selectable-card`, which reflects both `variant` and `selected`.
 */
export interface CardVariantMap {
  default: true;
  transparent: true;
  muted: true;
  blue: true;
  cyan: true;
  gray: true;
  green: true;
  orange: true;
  pink: true;
  purple: true;
  red: true;
  teal: true;
  yellow: true;
}

export {Card} from './Card';
export type {CardProps, CardVariant, SizeValue} from './Card';
