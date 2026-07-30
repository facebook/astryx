// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useListInputReorder.ts
 * @input Uses React, useAnnounce from core hooks
 * @output Exports useListInputReorder — ListInput's internal reorder engine
 * @position Internal to ListInput (RFC facebook/astryx#4531: the engine stays
 *   private until a second consumer establishes a reusable hook contract).
 *   Pointer, touch, and keyboard reorder all build the same draft order and
 *   flow through one commit path, so `onCommit` fires exactly once per
 *   completed reorder.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/ListInput/ListInput.tsx (handle wiring)
 * - /packages/lab/src/ListInput/ListInput.test.tsx (reorder behavior tests)
 */

import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {useAnnounce} from '@astryxdesign/core/hooks';
import type {ListInputChange} from './ListInput';

/** Pointer movement (px) below which a press stays a click, not a drag. */
const DRAG_THRESHOLD = 4;

interface ReorderSession<T> {
  key: React.Key;
  /** Index of the grabbed item in the committed value at grab time. */
  fromIndex: number;
  /** Draft order previewed during the session; committed on drop. */
  order: T[];
  mode: 'keyboard' | 'pointer';
  /** The committed value the session started from; an external change cancels. */
  baseValue: T[];
}

interface PointerCandidate<T> {
  key: React.Key;
  pointerId: number;
  startY: number;
  /** Order at pointer-down; the session's base once the drag activates. */
  startOrder: T[];
  /** Row slots captured once at activation (RFC: no continuous measuring). */
  rects: Array<{bottom: number}> | null;
  active: boolean;
}

export interface ListInputHandleProps {
  'aria-pressed': boolean;
  onClick: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  onBlur: () => void;
  onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => void;
}

function arrayMove<T>(items: T[], from: number, to: number): T[] {
  const next = items.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

function slotIndexForY(rects: Array<{bottom: number}>, y: number): number {
  for (let i = 0; i < rects.length; i++) {
    if (y < rects[i].bottom) {
      return i;
    }
  }
  return rects.length - 1;
}

/**
 * ListInput's reorder engine. Keyboard (grab / arrow-move / drop / cancel)
 * and pointer or touch drag both preview through a draft order and commit
 * through the same single path. Position changes are announced in the polite
 * live region; focus stays with the moved row's handle.
 */
export function useListInputReorder<T>(options: {
  value: T[];
  getItemKey: (item: T) => React.Key;
  itemName: string;
  isEnabled: boolean;
  getRowElement: (key: React.Key) => HTMLTableRowElement | null;
  onCommit: (next: T[], change: ListInputChange<T>) => void;
}): {
  displayedItems: T[];
  grabbedKey: React.Key | null;
  getHandleProps: (key: React.Key) => ListInputHandleProps;
} {
  const {value, getItemKey, itemName, isEnabled, getRowElement, onCommit} =
    options;
  const announce = useAnnounce();

  const [session, setSession] = useState<ReorderSession<T> | null>(null);
  const sessionRef = useRef(session);
  const candidateRef = useRef<PointerCandidate<T> | null>(null);
  const detachWindowListenersRef = useRef<(() => void) | null>(null);
  /** True while a pointer drag should swallow the click that follows it. */
  const suppressClickRef = useRef(false);
  /** Handle to refocus after a keyed row move (some browsers blur on move). */
  const pendingRefocusRef = useRef<React.Key | null>(null);

  const updateSession = useCallback(
    (next: ReorderSession<T> | null) => {
      sessionRef.current = next;
      setSession(next);
    },
    [setSession],
  );

  const indexOfKey = useCallback(
    (items: T[], key: React.Key) =>
      items.findIndex(item => getItemKey(item) === key),
    [getItemKey],
  );

  const getHandleElement = useCallback(
    (key: React.Key): HTMLButtonElement | null =>
      getRowElement(key)?.querySelector<HTMLButtonElement>(
        'button[data-listinput-handle]',
      ) ?? null,
    [getRowElement],
  );

  const commitSession = useCallback(() => {
    const active = sessionRef.current;
    if (!active) {
      return;
    }
    const toIndex = indexOfKey(active.order, active.key);
    updateSession(null);
    if (toIndex !== active.fromIndex) {
      onCommit(active.order, {
        type: 'reorder',
        item: active.order[toIndex],
        key: active.key,
        fromIndex: active.fromIndex,
        toIndex,
      });
    }
    announce(`Dropped at position ${toIndex + 1} of ${active.order.length}.`);
    pendingRefocusRef.current = active.key;
  }, [announce, indexOfKey, onCommit, updateSession]);

  const cancelSession = useCallback(
    (shouldAnnounce: boolean) => {
      if (!sessionRef.current) {
        return;
      }
      const key = sessionRef.current.key;
      updateSession(null);
      if (shouldAnnounce) {
        announce('Reorder canceled.');
      }
      pendingRefocusRef.current = key;
    },
    [announce, updateSession],
  );

  const detachPointerTracking = useCallback(() => {
    detachWindowListenersRef.current?.();
    detachWindowListenersRef.current = null;
    candidateRef.current = null;
  }, []);

  // An external value change invalidates the session's base — cancel silently.
  useEffect(() => {
    const active = sessionRef.current;
    if (active && active.baseValue !== value) {
      updateSession(null);
    }
  }, [value, updateSession]);

  // Losing reorderability mid-session (disabled, loading, read-only) cancels.
  useEffect(() => {
    if (!isEnabled && sessionRef.current) {
      updateSession(null);
      detachPointerTracking();
    }
  }, [isEnabled, updateSession, detachPointerTracking]);

  // Keep focus on the moved row's handle: a keyed row move preserves the DOM
  // node but some browsers drop focus when a focused element is re-inserted.
  useLayoutEffect(() => {
    const key = pendingRefocusRef.current;
    if (key == null) {
      return;
    }
    pendingRefocusRef.current = null;
    const handle = getHandleElement(key);
    if (handle && document.activeElement !== handle) {
      handle.focus();
    }
  });

  useEffect(() => detachPointerTracking, [detachPointerTracking]);

  const handleClick = useCallback(
    (key: React.Key) => {
      if (!isEnabled) {
        return;
      }
      if (suppressClickRef.current) {
        suppressClickRef.current = false;
        return;
      }
      const active = sessionRef.current;
      if (active?.key === key) {
        commitSession();
        return;
      }
      const fromIndex = indexOfKey(value, key);
      if (fromIndex === -1) {
        return;
      }
      updateSession({
        key,
        fromIndex,
        order: value,
        mode: 'keyboard',
        baseValue: value,
      });
      announce(
        `Grabbed ${itemName} ${fromIndex + 1} of ${value.length}. ` +
          'Use the arrow keys to move, space to drop, escape to cancel.',
      );
    },
    [
      announce,
      commitSession,
      indexOfKey,
      isEnabled,
      itemName,
      updateSession,
      value,
    ],
  );

  const handleKeyDown = useCallback(
    (key: React.Key, event: React.KeyboardEvent<HTMLButtonElement>) => {
      const active = sessionRef.current;
      if (!active || active.key !== key || active.mode !== 'keyboard') {
        return;
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        // Space and Enter stay untouched so the native button click commits.
        event.preventDefault();
        const from = indexOfKey(active.order, key);
        const to = event.key === 'ArrowDown' ? from + 1 : from - 1;
        if (to < 0 || to >= active.order.length) {
          return;
        }
        const order = arrayMove(active.order, from, to);
        updateSession({...active, order});
        announce(`Moved to position ${to + 1} of ${order.length}.`);
        pendingRefocusRef.current = key;
      } else if (event.key === 'Escape') {
        // Swallowed so a containing dialog or popover stays open.
        event.preventDefault();
        event.stopPropagation();
        cancelSession(true);
      }
    },
    [announce, cancelSession, indexOfKey, updateSession],
  );

  const handleBlur = useCallback(
    (key: React.Key) => {
      const active = sessionRef.current;
      if (!active || active.key !== key || active.mode !== 'keyboard') {
        return;
      }
      // A keyed row move can momentarily blur the handle; the refocus effect
      // restores it before this settles. Only cancel if focus truly left.
      setTimeout(() => {
        const current = sessionRef.current;
        if (!current || current.key !== key) {
          return;
        }
        const handle = getHandleElement(key);
        if (!handle || document.activeElement !== handle) {
          cancelSession(true);
        }
      }, 0);
    },
    [cancelSession, getHandleElement],
  );

  const handlePointerDown = useCallback(
    (key: React.Key, event: React.PointerEvent<HTMLButtonElement>) => {
      if (!isEnabled || event.button > 0 || candidateRef.current) {
        return;
      }
      const candidate: PointerCandidate<T> = {
        key,
        pointerId: event.pointerId,
        startY: event.clientY,
        startOrder: value,
        rects: null,
        active: false,
      };
      candidateRef.current = candidate;

      const onPointerMove = (moveEvent: PointerEvent) => {
        const current = candidateRef.current;
        if (!current || moveEvent.pointerId !== current.pointerId) {
          return;
        }
        let active = sessionRef.current;
        if (!current.active) {
          if (Math.abs(moveEvent.clientY - current.startY) < DRAG_THRESHOLD) {
            return;
          }
          current.active = true;
          suppressClickRef.current = true;
          // Capture row slots once, from the pre-drag order (RFC: read row
          // rectangles during the interaction, never measure continuously).
          current.rects = current.startOrder.map(item => ({
            bottom:
              getRowElement(getItemKey(item))?.getBoundingClientRect().bottom ??
              0,
          }));
          active = {
            key: current.key,
            fromIndex: indexOfKey(current.startOrder, current.key),
            order: current.startOrder,
            mode: 'pointer',
            baseValue: current.startOrder,
          };
          updateSession(active);
        }
        if (!active || active.mode !== 'pointer' || !current.rects) {
          return;
        }
        const from = indexOfKey(active.order, current.key);
        const to = slotIndexForY(current.rects, moveEvent.clientY);
        if (to !== from) {
          updateSession({...active, order: arrayMove(active.order, from, to)});
        }
      };

      const onPointerEnd = (endEvent: PointerEvent) => {
        const current = candidateRef.current;
        if (!current || endEvent.pointerId !== current.pointerId) {
          return;
        }
        const wasActive = current.active;
        const canceled = endEvent.type === 'pointercancel';
        detachPointerTracking();
        if (!wasActive) {
          return;
        }
        if (canceled) {
          cancelSession(true);
        } else {
          commitSession();
        }
      };

      const onWindowKeyDown = (keyEvent: KeyboardEvent) => {
        if (keyEvent.key === 'Escape' && candidateRef.current?.active) {
          detachPointerTracking();
          cancelSession(true);
        }
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerEnd);
      window.addEventListener('pointercancel', onPointerEnd);
      window.addEventListener('keydown', onWindowKeyDown);
      detachWindowListenersRef.current = () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerEnd);
        window.removeEventListener('pointercancel', onPointerEnd);
        window.removeEventListener('keydown', onWindowKeyDown);
      };
    },
    [
      cancelSession,
      commitSession,
      detachPointerTracking,
      getItemKey,
      getRowElement,
      indexOfKey,
      isEnabled,
      updateSession,
      value,
    ],
  );

  const getHandleProps = useCallback(
    (key: React.Key): ListInputHandleProps => ({
      'aria-pressed': session?.key === key,
      onClick: () => handleClick(key),
      onKeyDown: event => handleKeyDown(key, event),
      onBlur: () => handleBlur(key),
      onPointerDown: event => handlePointerDown(key, event),
    }),
    [handleBlur, handleClick, handleKeyDown, handlePointerDown, session],
  );

  return {
    displayedItems: session?.order ?? value,
    grabbedKey: session?.key ?? null,
    getHandleProps,
  };
}
