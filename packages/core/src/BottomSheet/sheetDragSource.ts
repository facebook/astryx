// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file sheetDragSource.ts
 * @input Nothing; a standalone contract module
 * @output Exports SheetDragSource, SheetDragEvent, SheetDragSnapshot types and
 *   createSheetDragSource
 * @position BottomSheet contract; re-exported from the BottomSheet barrel
 *
 * EXPLORATION — not a settled API. See the exploration notes in
 * BottomSheet.tsx.
 *
 * A sheet's own gestures all begin inside the sheet, which means the sheet has
 * to already be on screen. The one gesture that cannot work that way is the
 * one that OPENS it: the finger lands on the page, and the sheet does not
 * exist yet.
 *
 * This is the seam. A recognizer somewhere else on the page decides a gesture
 * is a sheet-open pull, and publishes the pull's coordinates here; a closed
 * sheet subscribed to the source presents itself and rides the same finger up.
 * The sheet never learns where the gesture came from, and the recognizer never
 * learns anything about detents, scrims, or dialogs.
 *
 * Deliberately NOT React state. A drag publishes a coordinate per touchmove
 * (~120/s on a modern phone) and every one of them has to be on screen in the
 * same frame it arrived; routing that through a state update per event would
 * put a render between the finger and the pixels. Subscribers read the live
 * value from `getSnapshot()` and write the DOM directly, the way the sheet's
 * own pointer path already does.
 *
 * `getSnapshot()` is also what makes a mid-gesture subscribe work at all: the
 * sheet's gesture hook does not exist when the drag starts — the drag start is
 * what mounts it — so it cannot have heard the event. It reads the in-flight
 * drag out of the snapshot instead, and picks the gesture up from there.
 */

/** A drag coordinate on the block axis, in client pixels. */
export interface SheetDragPoint {
  /** Client Y of the pointer. */
  y: number;
  /** Event timestamp (ms), used for flick velocity. */
  timeStamp: number;
}

/**
 * What a source publishes. `start` means a recognizer has committed: it has
 * claimed the gesture from the browser and a closed sheet should present
 * itself. `cancel` means the drag went away without a release (the recognizer
 * handed the gesture back, the page was hidden, a second finger landed).
 */
export type SheetDragEvent =
  | ({type: 'start'} & SheetDragPoint)
  | ({type: 'move'} & SheetDragPoint)
  | ({type: 'end'} & SheetDragPoint)
  | {type: 'cancel'};

/** The live drag, or null when no drag is in flight. */
export interface SheetDragSnapshot extends SheetDragPoint {
  /** Where the finger was when the recognizer committed. */
  startY: number;
}

export interface SheetDragSource {
  /** Notified on every published event until the returned function is called. */
  subscribe: (listener: (event: SheetDragEvent) => void) => () => void;
  /** The in-flight drag, for a subscriber that arrived after it started. */
  getSnapshot: () => SheetDragSnapshot | null;
}

/** A source plus the publishing side a recognizer drives. */
export interface SheetDragController extends SheetDragSource {
  start: (point: SheetDragPoint) => void;
  move: (point: SheetDragPoint) => void;
  end: (point: SheetDragPoint) => void;
  cancel: () => void;
}

/**
 * A drag source with nothing attached to it. The caller owns the recognizer —
 * deciding what counts as a sheet-open pull is a policy question this module
 * takes no position on — and calls `start`/`move`/`end`/`cancel` as its
 * gesture proceeds.
 */
export function createSheetDragSource(): SheetDragController {
  const listeners = new Set<(event: SheetDragEvent) => void>();
  let snapshot: SheetDragSnapshot | null = null;

  const emit = (event: SheetDragEvent) => {
    // Copied first: a listener may unsubscribe (or subscribe) in response,
    // and a Set mutated mid-iteration silently skips entries.
    for (const listener of [...listeners]) {
      listener(event);
    }
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      return snapshot;
    },
    start(point) {
      snapshot = {startY: point.y, y: point.y, timeStamp: point.timeStamp};
      emit({type: 'start', ...point});
    },
    move(point) {
      if (snapshot == null) {
        return;
      }
      snapshot = {...snapshot, y: point.y, timeStamp: point.timeStamp};
      emit({type: 'move', ...point});
    },
    end(point) {
      if (snapshot == null) {
        return;
      }
      snapshot = null;
      emit({type: 'end', ...point});
    },
    cancel() {
      if (snapshot == null) {
        return;
      }
      snapshot = null;
      emit({type: 'cancel'});
    },
  };
}
