// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useLayerKeyboardClearance.ts
 * @input Whether an anchor-mode layer is open, its element, the keyboard
 *   module (its one height, and its layout guide for timing) and the
 *   keyboard notification's duration (UIKit timing)
 * @output Exports `useLayerKeyboardClearance`, which returns the block-size
 *   cap that keeps an open anchored layer clear of the software keyboard (or
 *   null), `keyboardClearanceCap`, `LAYER_ANCHORED_ATTRIBUTE`,
 *   `LAYER_KEYBOARD_CAP_PROPERTY` and `LAYER_KEYBOARD_CLEARANCE_PX`
 * @position Layer runtime, through the layer's touch module: the software
 *   keyboard's part of the viewport caps (spec:AST-059 FR9, FR10;
 *   architecture:layer-runtime INV11)
 *
 * While a software keyboard covers the bottom of the viewport, an anchored
 * layer whose block-end edge would run under it keeps its block-start edge
 * and caps its block size so that edge sits `LAYER_KEYBOARD_CLEARANCE_PX`
 * above the keyboard, as a UIKit popover does on iOS 26.2. The cap is the
 * hook's value: the runtime applies it to each layer through a StyleX
 * functional style on that layer's own element (react-component-runtime
 * INV11), as a custom property that the block-size cap
 * (`layerViewportInset.maxBlockSize`) folds in, so the layer box and every
 * surface inside it capped by that definition shrink together. Every layer
 * sets its own value, so a layer nested in a capped one is not clamped by
 * it; the composing component
 * scrolls what no longer fits, and the field being typed into is kept in
 * view. A layer clear of the keyboard does not change, and a layer whose
 * block-end edge the fallback order holds (placed above its trigger) is left
 * as it is, since a shorter box cannot lift it. The box is read as the
 * fallback order reads it (`settledBox`, spec:AST-059 FR4, FR8): without its
 * entrance transform, so one read serves a layer that is still entering.
 * Only a layer whose committed element carries `LAYER_ANCHORED_ATTRIBUTE`
 * (anchor positioning) is capped (react-component-runtime INV4).
 *
 * A box's height cannot change on the compositor, so the cap changes once,
 * where the keyboard hides the change: a rising keyboard covers the layer's
 * lower part on its way up, and the layer takes its shorter height when the
 * keyboard has arrived (`keyboardNotification.durationMs` after it started); a
 * falling keyboard uncovers it, so the layer takes its full height back as
 * the keyboard starts down. A keyboard that changes at once is followed at
 * once. A change that would move the layer under a press in progress inside
 * it waits for that press's click. A layer opened while a keyboard is up is
 * capped before its first paint. The cap re-renders the layer once per
 * keyboard movement, never per frame. When the runtime replaces the layer
 * element while it is open, the press tracking moves to the new element in
 * the same commit, and the new element's own box is read before it paints
 * (spec:AST-059 FR8). The viewport is read in layout px, the units of the box
 * and of the keyboard's height (`layoutViewportHeight`): WebKit reports
 * `innerHeight` pinch-zoomed.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layer/layerKeyboardClearance.ts
 * - /packages/core/src/Layer/settledBox.ts
 * - /packages/core/src/Layer/useLayerKeyboardClearance.test.tsx
 * - /packages/core/src/Layer/layerViewportInset.stylex.ts
 * - /docs/specs/AST-059-layer-viewport-inset/spec.md
 */

import {useRef, useState, type RefObject} from 'react';
import {flushSync} from 'react-dom';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
// The keyboard module's own files, not its index: the index also re-exports
// BottomSheet's keyboard hook, and an import through it would put that hook's
// on-demand code in every layered component's import.
import {getKeyboardLayoutGuide} from '../keyboard/keyboardLayoutGuide';
import {getKeyboardHeight} from '../keyboard/keyboardHeight';
import {keyboardNotification} from '../motion/uikit/timing';
import {
  keyboardClearanceCap,
  LAYER_ANCHORED_ATTRIBUTE,
  LAYER_KEYBOARD_CLEARANCE_PX,
} from './layerKeyboardClearance';
import {settledBox} from './settledBox';
import {layoutViewportHeight} from '../utils/layoutViewport';

export {
  keyboardClearanceCap,
  LAYER_ANCHORED_ATTRIBUTE,
  LAYER_KEYBOARD_CLEARANCE_PX,
} from './layerKeyboardClearance';

/**
 * The custom property each layer's style sets: the largest block size that
 * keeps the layer clear of the keyboard while it caps the layer, and no
 * limit otherwise (useLayer.tsx's `keyboardCap` style).
 */
export const LAYER_KEYBOARD_CAP_PROPERTY =
  '--astryx-layer-keyboard-max-block-size';

/**
 * How long after a press inside the layer lifts its click may still come (a
 * tap's click follows its lift in the same moment; the margin covers a busy
 * main thread). A cap change the press held back runs then.
 */
const PRESS_CLICK_GRACE_MS = 350;

/**
 * Scrolls the nearest scroll container between `target` and `layer` the
 * least amount that shows `target` inside it.
 */
function keepInView(layer: HTMLElement, target: Element) {
  const view = layer.ownerDocument.defaultView;
  for (
    let box: HTMLElement | null = target.parentElement;
    box != null;
    box = box === layer ? null : box.parentElement
  ) {
    const overflowY = view?.getComputedStyle(box).overflowY;
    if (
      box.scrollHeight > box.clientHeight + 1 &&
      (overflowY === 'auto' || overflowY === 'scroll')
    ) {
      const outer = box.getBoundingClientRect();
      const inner = target.getBoundingClientRect();
      if (inner.bottom > outer.bottom) {
        box.scrollTop += inner.bottom - outer.bottom;
      } else if (inner.top < outer.top) {
        box.scrollTop -= outer.top - inner.top;
      }
      return;
    }
  }
}

/**
 * Keeps an open anchor-mode layer clear of the software keyboard: returns
 * the block size that does it, or null while no cap applies. The caller
 * applies it to the layer's own element (useLayer.tsx's `keyboardCap`).
 * Only a layer whose committed element carries `LAYER_ANCHORED_ATTRIBUTE`
 * (anchor positioning) is capped; other positionings own their geometry.
 */
export function useLayerKeyboardClearance(
  isOpen: boolean,
  layerRef: RefObject<HTMLElement | null>,
): number | null {
  const [cap, setCap] = useState<number | null>(null);
  // The cap the layer renders with, read by the measurement between commits.
  const capRef = useRef<number | null>(null);
  // Set while the layer is open: follows the runtime when it replaces the
  // layer element without closing it.
  const resyncRef = useRef<(() => void) | null>(null);

  useIsomorphicLayoutEffect(() => {
    const initial = layerRef.current;
    const win = initial?.ownerDocument.defaultView;
    if (!isOpen || initial == null || win == null) {
      return;
    }
    // The window, for the hoisted press handlers below.
    const view: Window = win;
    let isDisposed = false;
    const guide = getKeyboardLayoutGuide(win);
    // The element the cap and the press tracking are on. The runtime can
    // replace the layer element while it stays open; `sync` moves both to the
    // element the ref holds now.
    let layer: HTMLElement = initial;
    const sync = (): boolean => {
      const next = layerRef.current;
      if (next == null || next === layer) {
        return false;
      }
      layer.removeEventListener('pointerdown', handlePress, true);
      layer = next;
      layer.addEventListener('pointerdown', handlePress, true);
      return true;
    };
    // Renders the layer with `next` and returns once that commit has laid it
    // out, so the measurement after it reads the new box. Runs outside
    // React's own work: keyboard reports, timers, frames and native events.
    const commitCap = (next: number | null) => {
      if (isDisposed || capRef.current === next) {
        return;
      }
      capRef.current = next;
      // eslint-disable-next-line @eslint-react/dom-no-flush-sync -- the box is measured at its new size in the same task, before the frame paints
      flushSync(() => setCap(next));
      sync();
    };
    // Measured at the layer's own size, as the fallback order places it:
    // returns whether the layer is capped.
    const capFor = (inset: number): boolean => {
      commitCap(null);
      if (inset <= 0) {
        return false;
      }
      // In layout px, the box's and the keyboard's units: WebKit reports
      // `innerHeight` in the pinch-zoomed visual viewport's px.
      const viewport = layoutViewportHeight(win);
      const box = settledBox(layer);
      const height = keyboardClearanceCap(box, viewport, inset);
      if (height == null) {
        return false;
      }
      commitCap(height);
      // A layer too tall for the room below its trigger can sit higher, over
      // the trigger, where the viewport fit placed it. Shorter, it goes back
      // below the trigger: cap it again from where it starts now.
      const placed = settledBox(layer);
      if (placed.top > box.top + 1) {
        const again = keyboardClearanceCap(placed, viewport, inset);
        if (again != null) {
          commitCap(again);
        }
      }
      // The cap holds the block-start edge: below its trigger the top stays
      // and the bottom comes up. Placed above its trigger the layer holds its
      // bottom instead, which a shorter box cannot lift: leave it as it is.
      const limit = viewport - inset - LAYER_KEYBOARD_CLEARANCE_PX;
      if (settledBox(layer).bottom > limit + 1) {
        commitCap(null);
        return false;
      }
      return true;
    };

    const avoid = (inset: number) => {
      sync();
      if (!layer.hasAttribute(LAYER_ANCHORED_ATTRIBUTE)) {
        commitCap(null);
        return;
      }
      if (!capFor(inset)) {
        return;
      }
      // The composing component makes its surface a scroll container once it
      // overflows (a frame later, as its observer reports the smaller box):
      // keep the field being typed into in view after that.
      const focused = layer.ownerDocument.activeElement;
      if (focused != null && focused !== layer && layer.contains(focused)) {
        win.requestAnimationFrame(() =>
          win.requestAnimationFrame(() => {
            if (!isDisposed) {
              keepInView(layer, focused);
            }
          }),
        );
      }
    };

    let pending: number | null = null;
    const cancelPending = () => {
      if (pending != null) {
        win.clearTimeout(pending);
        pending = null;
      }
    };
    // A tap in the capped layer can blur the field it leaves (a button takes
    // focus on Android and in Chromium), and the keyboard then starts down:
    // the full height must not come back between the tap's press and its
    // click, or the click lands on whatever moved under the finger. Such a
    // change waits for the click (or a moment, for a press that makes no
    // click). The window's release and click listeners are held only while a
    // press in the layer is live (react-component-runtime INV5).
    const pressed = new Set<number>();
    let deferred: (() => void) | null = null;
    let releaseTimer: number | null = null;
    const follow = () => {
      win.addEventListener('pointerup', handleRelease, true);
      win.addEventListener('pointercancel', handleRelease, true);
      win.addEventListener('click', handleClick, true);
    };
    const unfollow = () => {
      win.removeEventListener('pointerup', handleRelease, true);
      win.removeEventListener('pointercancel', handleRelease, true);
      win.removeEventListener('click', handleClick, true);
    };
    const runDeferred = () => {
      if (releaseTimer != null) {
        win.clearTimeout(releaseTimer);
        releaseTimer = null;
      }
      pressed.clear();
      unfollow();
      const run = deferred;
      deferred = null;
      run?.();
    };
    function handlePress(event: PointerEvent) {
      if (pressed.size === 0) {
        follow();
      }
      pressed.add(event.pointerId);
    }
    function handleRelease(event: PointerEvent) {
      if (!pressed.has(event.pointerId)) {
        return;
      }
      if (event.type === 'pointercancel') {
        runDeferred();
        return;
      }
      if (releaseTimer == null) {
        releaseTimer = view.setTimeout(runDeferred, PRESS_CLICK_GRACE_MS);
      }
    }
    function handleClick() {
      if (pressed.size > 0) {
        runDeferred();
      }
    }
    layer.addEventListener('pointerdown', handlePress, true);
    const unsubscribe = guide.subscribe(transition => {
      cancelPending();
      if (transition.animated && transition.to > transition.from) {
        // Rising: the keyboard covers the difference on its way up.
        const arrival = transition.start + keyboardNotification.durationMs;
        pending = win.setTimeout(
          () => {
            pending = null;
            avoid(transition.to);
          },
          Math.max(0, arrival - win.performance.now()),
        );
        return;
      }
      // Falling (it uncovers the full height as it goes) or at once; after
      // the click of a press in progress inside the layer.
      if (pressed.size > 0) {
        deferred = () => avoid(transition.to);
        return;
      }
      avoid(transition.to);
    });
    // Opened while a keyboard is up: capped in the frame that first paints
    // the layer, before its paint. A read in this commit would see the layer
    // unplaced: Chromium places a just-shown anchored layer in that frame.
    // With no keyboard up nothing is scheduled.
    const opening =
      getKeyboardHeight(win) > 0
        ? win.requestAnimationFrame(() => {
            if (!isDisposed) {
              avoid(getKeyboardHeight(win));
            }
          })
        : null;
    // A layer element the runtime swaps in while the layer is open: the
    // press tracking moves to it in the commit that brings it, and its own
    // box is read before it paints (spec:AST-059 FR8). Like the read at the
    // open, the read waits for the frame that places the element; like a
    // keyboard change, it waits for a press in the layer to make its click,
    // and a rising keyboard's arrival reads it instead (FR10).
    let swapped: number | null = null;
    resyncRef.current = () => {
      if (!sync() || swapped != null || getKeyboardHeight(win) <= 0) {
        return;
      }
      swapped = win.requestAnimationFrame(() => {
        swapped = null;
        if (isDisposed || pending != null) {
          return;
        }
        if (pressed.size > 0) {
          deferred = () => avoid(getKeyboardHeight(win));
          return;
        }
        avoid(getKeyboardHeight(win));
      });
    };
    return () => {
      isDisposed = true;
      resyncRef.current = null;
      if (opening != null) {
        win.cancelAnimationFrame(opening);
      }
      if (swapped != null) {
        win.cancelAnimationFrame(swapped);
      }
      unsubscribe();
      cancelPending();
      if (releaseTimer != null) {
        win.clearTimeout(releaseTimer);
      }
      layer.removeEventListener('pointerdown', handlePress, true);
      win.removeEventListener('pointerup', handleRelease, true);
      win.removeEventListener('pointercancel', handleRelease, true);
      win.removeEventListener('click', handleClick, true);
      // A closed layer reopens at its own size.
      if (capRef.current != null) {
        capRef.current = null;
        setCap(null);
      }
    };
  }, [isOpen, layerRef]);

  // Every commit: the layer element may have been replaced while open.
  useIsomorphicLayoutEffect(() => {
    resyncRef.current?.();
  });

  return isOpen ? cap : null;
}
