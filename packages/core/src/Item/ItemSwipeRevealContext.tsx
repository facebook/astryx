// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ItemSwipeRevealContext.tsx
 * @input Uses React createContext and use
 * @output Exports ItemSwipeRevealContext, useItemSwipeReveal and the
 *   ItemSwipeReveal type
 * @position Internal seam between Item's swipe actions and a control Item
 *   renders in its own row (List's edit-mode delete control, in the marker
 *   slot). Not exported from the package entry.
 *
 * UIKit's edit mode reveals a row's trailing actions from a control in the
 * row: the delete control slides the row open exactly as a swipe does. That
 * reveal has to be the row's own swipe (its travel, spring, panel and ways
 * to close), not a copy, and only Item holds the swipe. Publishing it here
 * keeps the wiring internal: a public prop or handle would add API for
 * something no caller decides on its own.
 *
 * `null` wherever the row has no swipe to reveal: on a row without swipe
 * actions, and until the swipe layer's first effect has run. The swipe is there
 * whatever the primary pointer (a finger swipes on every device), so what a
 * control offers under a mouse is the control's own decision.
 */

import {createContext, use} from 'react';

/** A side of a row's swipe actions: leading is toward the inline start. */
export type ItemSwipeSide = 'leading' | 'trailing';

/** The row's swipe, as a control inside the row reaches it. */
export interface ItemSwipeReveal {
  /**
   * The side the row is open on, from the moment it starts opening (a
   * release, or `reveal`) until it starts closing; `null` while closed.
   */
  side: ItemSwipeSide | null;
  /**
   * Open the row on `side` as a swipe opens it: the same travel (the panel's
   * width), the same settle spring and panel, closed afterwards by the same
   * tap on its content, pointer outside, scroll or Escape. A row open on the
   * other side closes first. Does nothing when `side` has no entries, or
   * while a finger holds the row.
   */
  reveal: (side: ItemSwipeSide) => void;
  /** Close the row as a tap outside it does. */
  close: () => void;
}

export const ItemSwipeRevealContext = createContext<ItemSwipeReveal | null>(
  null,
);
ItemSwipeRevealContext.displayName = 'ItemSwipeRevealContext';

/**
 * The swipe of the row this component renders in, or `null` where the row
 * has none to reveal (see the file header).
 */
export function useItemSwipeReveal(): ItemSwipeReveal | null {
  return use(ItemSwipeRevealContext);
}
