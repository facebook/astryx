// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file usePopoverKeyboardAvoidance.ts
 * @input Whether the popover is open, its surface, the keyboard layout guide
 *   and the UIKit table
 * @output Exports `usePopoverKeyboardAvoidance`: keeps an open popover clear
 *   of the software keyboard
 * @position Internal to Popover
 *
 * On iOS 26.2 a popover that would run under the software keyboard shrinks,
 * its edge on its source held in place, so that its far edge stays
 * `popover.keyboardClearancePx` above the keyboard; its content scrolls in
 * the shorter box, and it grows back when the keyboard goes down. A popover
 * clear of the keyboard does not move. Without this, the keyboard covers the
 * bottom of a tall popover and whatever sits there (a Save button) cannot be
 * reached until the keyboard is dismissed.
 *
 * UIKit animates the popover's bounds with the keyboard. A box's height
 * cannot change on the compositor, so the height changes once, where the
 * keyboard hides the difference: a rising keyboard covers the popover's lower
 * part as it comes up, and the popover takes its shorter height when the
 * keyboard has arrived (`timing.keyboardNotificationMs` after it started);
 * a falling keyboard uncovers it, so the popover takes its full height back
 * as the keyboard starts down. A keyboard that changes at once (another
 * keyboard type) is followed at once.
 *
 * The keyboard's position comes from the keyboard layout guide (the visual
 * viewport, dated back to where the keyboard really is). The field being
 * typed into is kept in view inside the shorter box.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Popover/usePopoverKeyboardAvoidance.test.tsx
 * - /packages/core/src/Popover/Popover.tsx
 */

import {useEffect, type RefObject} from 'react';
import {getKeyboardLayoutGuide} from '../keyboard';
import {popover, timing} from '../motion/uikit';

/**
 * The surface's height that keeps it `popover.keyboardClearancePx` above a
 * keyboard covering `inset` px of the layout viewport's bottom, or null when
 * the surface (at its own height) is already clear of it.
 */
export function keyboardAvoidingHeight(
  surface: {top: number; bottom: number},
  viewportHeight: number,
  inset: number,
): number | null {
  if (inset <= 0) {
    return null;
  }
  const limit = viewportHeight - inset - popover.keyboardClearancePx;
  if (surface.bottom <= limit) {
    return null;
  }
  return Math.max(0, limit - surface.top);
}

/**
 * The surface's box at rest, in viewport px: its layout box under the layer
 * that positions it, without the scale a presentation in progress applies to
 * that layer (a popover can open while the keyboard is up).
 */
function restingBox(surface: HTMLElement): {top: number; bottom: number} {
  const layer = surface.offsetParent;
  const view = surface.ownerDocument.defaultView;
  if (!(layer instanceof HTMLElement) || view == null) {
    const rect = surface.getBoundingClientRect();
    return {top: rect.top, bottom: rect.bottom};
  }
  const rect = layer.getBoundingClientRect();
  const style = view.getComputedStyle(layer);
  const [sx = 1, sy = sx] =
    style.scale === '' || style.scale === 'none'
      ? []
      : style.scale.split(' ').map(Number);
  const originY = parseFloat(style.transformOrigin.split(' ')[1] ?? '0') || 0;
  const layerTop = rect.top - originY * (1 - sy);
  const top = layerTop + surface.offsetTop;
  return {top, bottom: top + surface.offsetHeight};
}

/** Scrolls `box` the least amount that shows `target` inside it. */
function keepInView(box: HTMLElement, target: Element) {
  const outer = box.getBoundingClientRect();
  const inner = target.getBoundingClientRect();
  if (inner.bottom > outer.bottom) {
    box.scrollTop += inner.bottom - outer.bottom;
  } else if (inner.top < outer.top) {
    box.scrollTop -= outer.top - inner.top;
  }
}

export function usePopoverKeyboardAvoidance(
  isOpen: boolean,
  surfaceRef: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    const surface = surfaceRef.current;
    const win = surface?.ownerDocument.defaultView;
    if (!isOpen || surface == null || win == null) {
      return;
    }
    const {style} = surface;
    let isDisposed = false;
    const guide = getKeyboardLayoutGuide(win);
    const restore = () => {
      style.removeProperty('max-block-size');
      style.removeProperty('overflow-y');
    };
    const avoid = (inset: number) => {
      // Measured at the popover's own height, as the layer places it.
      restore();
      const height = keyboardAvoidingHeight(
        restingBox(surface),
        win.innerHeight,
        inset,
      );
      if (height == null) {
        return;
      }
      style.setProperty('max-block-size', `${height}px`);
      style.setProperty('overflow-y', 'auto');
      const focused = surface.ownerDocument.activeElement;
      if (focused != null && focused !== surface && surface.contains(focused)) {
        keepInView(surface, focused);
      }
      // Measured during the popover's entrance, the box is only close: an
      // engine may or may not report the entrance's transform. Measure again
      // once the entrance is over, against the keyboard of that moment.
      const layer = surface.offsetParent;
      if (
        layer instanceof HTMLElement &&
        typeof layer.getAnimations === 'function'
      ) {
        const entrance = layer
          .getAnimations()
          .filter(animation => animation.playState !== 'finished');
        if (entrance.length > 0) {
          void Promise.all(
            entrance.map(async animation =>
              animation.finished.catch(() => undefined),
            ),
          ).then(() => {
            if (!isDisposed) {
              avoid(guide.inset);
            }
          });
        }
      }
    };

    let pending: number | null = null;
    const cancelPending = () => {
      if (pending != null) {
        win.clearTimeout(pending);
        pending = null;
      }
    };
    const unsubscribe = guide.subscribe(transition => {
      cancelPending();
      if (transition.animated && transition.to > transition.from) {
        // Rising: the keyboard covers the difference on its way up.
        const arrival = transition.start + timing.keyboardNotificationMs;
        pending = win.setTimeout(
          () => {
            pending = null;
            avoid(transition.to);
          },
          Math.max(0, arrival - win.performance.now()),
        );
        return;
      }
      // Falling (it uncovers the full height as it goes) or at once.
      avoid(transition.to);
    });
    // Opened while a keyboard is up.
    if (guide.inset > 0) {
      avoid(guide.inset);
    }
    return () => {
      isDisposed = true;
      unsubscribe();
      cancelPending();
      restore();
    };
  }, [isOpen, surfaceRef]);
}
