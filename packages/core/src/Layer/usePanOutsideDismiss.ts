// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file usePanOutsideDismiss.ts
 * @input Whether a layer is open in its touch presentation, the elements a
 *   touch may start on without counting as outside, and the layer's close
 * @output Exports `usePanOutsideDismiss`: closes a touch-presented layer when
 *   a pan that starts outside it takes the touch
 * @position Layer runtime hook for touch presentations (Popover; the rule
 *   DropdownMenu's touch menu follows too)
 *
 * On iOS 26.2 a popover or a menu presented by a finger is dismissed by a
 * pan that starts outside it as soon as the pan begins, and the same touch
 * goes on to scroll what is under it; a tap or a hold outside dismisses at the
 * lift. The browser's light dismiss covers the tap and the hold (it acts at
 * the lift) but not the pan: it announces that it took the touch for a
 * scroll with a `pointercancel`, which light dismiss ignores. This hook closes
 * the layer on that `pointercancel` for a touch that went down outside it.
 * A mouse never pans, and a touch that starts inside the layer, or in an
 * element the caller adds to it (a menu trigger whose press-and-drag picks a
 * row), is the layer's own.
 *
 * While the layer is open only `pointerdown` is listened to; `pointerup` and
 * `pointercancel` are added when a touch goes down outside and removed when no
 * such touch is down (react-component-runtime INV5). The listeners read the
 * latest options through a ref, so a re-render between the press and the
 * browser's cancel keeps the touches already down.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layer/usePanOutsideDismiss.test.tsx
 */

import {useEffect, useRef, type RefObject} from 'react';

export interface UsePanOutsideDismissOptions {
  /** Whether the layer is open. */
  isOpen: boolean;
  /**
   * Whether the open layer is in its touch presentation, read as it opens:
   * only a touch-presented layer is dismissed by a pan.
   */
  isTouchPresentation: () => boolean;
  /**
   * The elements a touch may start in without counting as outside: the layer,
   * and any the caller adds (DropdownMenu's trigger, for its press-and-drag).
   */
  inside: ReadonlyArray<RefObject<Element | null>>;
  /** Closes the layer. */
  onDismiss: () => void;
}

export function usePanOutsideDismiss({
  isOpen,
  isTouchPresentation,
  inside,
  onDismiss,
}: UsePanOutsideDismissOptions): void {
  // Latest values for the document listeners, which outlive the render that
  // armed them.
  const latestRef = useRef({isTouchPresentation, inside, onDismiss});
  useEffect(() => {
    latestRef.current = {isTouchPresentation, inside, onDismiss};
  });

  useEffect(() => {
    if (!isOpen || !latestRef.current.isTouchPresentation()) {
      return;
    }
    const doc =
      latestRef.current.inside.find(ref => ref.current != null)?.current
        ?.ownerDocument ?? document;
    // The touches that went down outside the layer and are still down.
    const outside = new Set<number>();
    const isInside = (target: EventTarget | null) => {
      const node = target instanceof Node ? target : null;
      return (
        node != null &&
        latestRef.current.inside.some(ref => ref.current?.contains(node))
      );
    };
    // The release listeners, only while a touch that went down outside is down.
    const follow = () => {
      doc.addEventListener('pointerup', handleEnd, true);
      doc.addEventListener('pointercancel', handleCancel, true);
    };
    const unfollow = () => {
      if (outside.size === 0) {
        doc.removeEventListener('pointerup', handleEnd, true);
        doc.removeEventListener('pointercancel', handleCancel, true);
      }
    };
    function handleEnd(event: PointerEvent) {
      outside.delete(event.pointerId);
      unfollow();
    }
    function handleCancel(event: PointerEvent) {
      if (outside.delete(event.pointerId)) {
        unfollow();
        latestRef.current.onDismiss();
      }
    }
    const handleDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' && !isInside(event.target)) {
        outside.add(event.pointerId);
        follow();
      }
    };
    doc.addEventListener('pointerdown', handleDown, true);
    return () => {
      doc.removeEventListener('pointerdown', handleDown, true);
      doc.removeEventListener('pointerup', handleEnd, true);
      doc.removeEventListener('pointercancel', handleCancel, true);
    };
  }, [isOpen]);
}
