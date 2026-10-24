// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file usePanOutsideDismiss.ts
 * @input Whether a layer is open in its touch presentation, the elements a
 *   touch may start on without counting as outside, and the layer's close
 * @output Exports `usePanOutsideDismiss`: closes a touch-presented layer when
 *   a pan that starts outside it takes the touch
 * @position Layer runtime hook for touch presentations (DropdownMenu's menu,
 *   Popover)
 *
 * On iOS 26.2 a popover or a menu presented by a finger is dismissed by a
 * pan that starts outside it as soon as the pan begins, and the same touch
 * goes on to scroll what is under it; a tap or a hold outside dismisses at the
 * lift. The browser's light dismiss covers the tap and the hold (it acts at
 * the lift) but not the pan: it announces that it took the touch for a
 * scroll with a `pointercancel`, which light dismiss ignores. This hook closes
 * the layer on that `pointercancel` for a touch that went down outside it.
 * A mouse never pans, and a touch that starts inside the layer or on its
 * trigger is the layer's own.
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
  /** The layer and its trigger: a touch that starts in them is not outside. */
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
    const handleDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' && !isInside(event.target)) {
        outside.add(event.pointerId);
      }
    };
    const handleEnd = (event: PointerEvent) => {
      outside.delete(event.pointerId);
    };
    const handleCancel = (event: PointerEvent) => {
      if (outside.delete(event.pointerId)) {
        latestRef.current.onDismiss();
      }
    };
    doc.addEventListener('pointerdown', handleDown, true);
    doc.addEventListener('pointerup', handleEnd, true);
    doc.addEventListener('pointercancel', handleCancel, true);
    return () => {
      doc.removeEventListener('pointerdown', handleDown, true);
      doc.removeEventListener('pointerup', handleEnd, true);
      doc.removeEventListener('pointercancel', handleCancel, true);
    };
  }, [isOpen]);
}
