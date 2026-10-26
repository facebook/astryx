// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file holdEntranceInput.ts
 * @input A layer root whose entrance (a CSS animation or transition) has just
 *   started, and the touch query
 * @output holdEntranceInput: under a finger, pointer input held away from the
 *   layer until its entrance has played
 * @position The entrance hold of the layers that enter through CSS (Dialog,
 *   Drawer), on the Layer module's one input hold (inputHold.ts)
 *
 * spec:AST-094 FR35: under a finger, a tap or a drag that lands while a
 * presentation is still entering reaches nothing, and the presentation
 * finishes entering and stays open. The hold's `viewport` scope keeps keys and
 * assistive technology live and the content in the accessibility tree, and a
 * pinch still zooms the page. A mouse keeps today's behavior: nothing is held
 * where the primary pointer is fine, read as the layer opens.
 *
 * The entrance is read from the layer's own animations as it opens:
 * `getAnimations()` flushes styles, so a CSS animation or an `@starting-style`
 * transition the open has just started is in the list. A theme's duration,
 * Reduce Motion's shorter entrance and a canceled entrance (a close mid-way)
 * all end the hold when they end, and an animation without an end (a spinner
 * inside) is no entrance.
 *
 * SYNC: When modified, update holdEntranceInput.test.ts and its callers
 * (Dialog.tsx, Drawer/useDrawerDialogPresence.ts).
 */

import {TOUCH_QUERY} from '../utils/touchQueries';
import {holdInput} from './inputHold';

/**
 * Under a finger, holds pointer input away from `layer` until the entrance it
 * is playing ends. Returns the release, or `null` when nothing is held: a fine
 * pointer, or no entrance running.
 */
export function holdEntranceInput(layer: Element): (() => void) | null {
  if (typeof layer.getAnimations !== 'function') {
    return null;
  }
  const entrance = layer.getAnimations().filter(isEntrance);
  if (entrance.length === 0) {
    return null;
  }
  // The pointer is read only once an entrance runs: it decides nothing else
  // here, and a layer that opens without one asks nothing.
  const view = layer.ownerDocument.defaultView;
  if (
    view == null ||
    typeof view.matchMedia !== 'function' ||
    !view.matchMedia(TOUCH_QUERY).matches
  ) {
    return null;
  }
  return holdInput(layer, {
    until: Promise.all(entrance.map(async animation => animation.finished)),
    scope: 'viewport',
  });
}

/** A running animation that ends on its own: an entrance, not a spin. */
function isEntrance(animation: Animation): boolean {
  if (animation.playState !== 'running') {
    return false;
  }
  const end = animation.effect?.getComputedTiming().endTime;
  return typeof end === 'number' && Number.isFinite(end);
}
