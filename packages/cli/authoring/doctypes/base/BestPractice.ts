// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * A single do/don't best practice for a component.
 * Rendered as a table row with a colored "Do" or "Don't" badge
 * in the Guidance column and the description in the Practices column.
 *
 * @example
 * ```
 * {guidance: true, description: 'Convey clear action hierarchy. Each surface should only have 1 primary button.'}
 * {guidance: false, description: 'Overuse primary or special buttons. Overusing colored buttons creates visual confusion.'}
 * ```
 */
export interface BestPractice {
  /** `true` renders a green "Do" badge; `false` renders a red "Don't" badge.  */
  guidance: boolean;
  /** 1-2 short sentences of design guidance. Focus on how a designer
   *  would USE the component, not how it's built.
   *
   *  NEVER start with "Do" or "Don't" — the badge handles that.
   *
   *  Good: `"Convey clear action hierarchy. Each surface should only have 1 primary button."`
   *  Bad:  `"Do use clear action hierarchy."` */
  description: string;
}
