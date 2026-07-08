// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useOverlayStack.ts
 * @input Uses React useRef, useEffect
 * @output Exports useOverlayStack hook for coordinated overlay dismissal
 * @position Core hook; used by Sheet/Drawer for Escape ordering across overlay types
 *
 * Module-level LIFO registry for coordinating Escape / scrim-click dismissal
 * across all overlay types (Sheet, Dialog, Popover, etc.). Only the top-most
 * overlay responds to Escape; lower overlays stay inert until the one above
 * closes. Non-modal overlays also get incrementing z-indexes so the
 * last-opened paints on top.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts
 * - /packages/core/src/Sheet/Sheet.tsx (if the API shape changes)
 */

import {useEffect, useRef} from 'react';

// =============================================================================
// Types
// =============================================================================

export type OverlayType = 'sheet' | 'dialog' | 'popover' | 'tooltip';

export interface UseOverlayStackOptions {
  /** Unique ID for this overlay instance. Must be stable across renders. */
  id: string;
  /** Whether the overlay is currently open. */
  isOpen: boolean;
  /** Called when this overlay should close (Escape, scrim click). */
  onClose: () => void;
  /** Overlay type for debugging and future mixed-type coordination. */
  type?: OverlayType;
  /** Base z-index for non-modal overlays. Defaults to 1000. */
  baseZIndex?: number;
}

export interface UseOverlayStackReturn {
  /** Whether this overlay is on top of the stack. */
  isTop: boolean;
  /** Assigned z-index (only meaningful for non-modal overlays). */
  zIndex: number;
}

// =============================================================================
// Module-level registry
// =============================================================================

interface OverlayStackEntry {
  id: string;
  close: () => void;
  type: OverlayType;
}

const stack: OverlayStackEntry[] = [];
let counter = 0;
const DEFAULT_BASE_Z = 1000;

function register(
  id: string,
  close: () => void,
  type: OverlayType,
  baseZIndex: number,
): number {
  stack.push({id, close, type});
  counter += 1;
  return baseZIndex + counter - 1;
}

function unregister(id: string): void {
  const index = stack.findIndex(e => e.id === id);
  if (index !== -1) {
    stack.splice(index, 1);
  }
  if (stack.length === 0) {
    counter = 0;
  }
}

export function isTopOverlay(id: string): boolean {
  return stack[stack.length - 1]?.id === id;
}

// =============================================================================
// Hook
// =============================================================================

export function useOverlayStack({
  id,
  isOpen,
  onClose,
  type = 'sheet',
  baseZIndex = DEFAULT_BASE_Z,
}: UseOverlayStackOptions): UseOverlayStackReturn {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Use a ref to track the z-index so we can return it synchronously.
  // The actual registration happens in an effect.
  const zIndexRef = useRef(DEFAULT_BASE_Z);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const z = register(id, () => onCloseRef.current(), type, baseZIndex);
    zIndexRef.current = z;
    return () => unregister(id);
  }, [isOpen, id, type, baseZIndex]);

  return {
    isTop: isTopOverlay(id),
    zIndex: zIndexRef.current,
  };
}
