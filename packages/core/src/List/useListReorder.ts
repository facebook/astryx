// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useListReorder.ts
 * @input A List's element and `onReorder`, the reorder model
 *   (List/reorderModel.ts), the reorder's touch layer
 *   (List/ListReorderTouch.ts: the hold and UIKit's motion), the row moves
 *   of utils/rowMotion.ts, the shared edge autoscroll
 *   (utils/edgeAutoscroll.ts), the touch presentation
 *   (utils/touchPresentation.ts) and the screen-reader announcer
 * @output `useListReorder` and `ListReorderContext`: the reorder session of a
 *   List whose rows carry reorder handles. A drag from a handle moves the row
 *   with the finger, the rows it passes slide out of its way, the list
 *   autoscrolls near the scroll edges, and the drop springs the row into its
 *   slot and reports the move; the handle's arrow keys move a row one place
 * @position Interaction controller for List; ListReorderHandle drives it
 *   from each row's handle. `useListReorder`, `ListReorderContext` and the
 *   fixed-row attribute are also exported, experimental, from
 *   `@astryxdesign/core/List/experimental` (List/experimental.ts) for lists
 *   whose rows are not ListItems
 *
 * UIKit's edit-mode reorder (iOS 26.2, measured), which this follows: nothing
 * changes when the drag begins (no lift); the row follows the finger one to
 * one, its centre stopping at the scroll view's edges; the rows between its
 * place and its slot slide on the table spring, shorter while autoscrolling;
 * the drop springs it from rest into its slot, the spring's duration scaled
 * by the distance left; autoscroll is a 20 ms timer whose step grows with how
 * far the row's edge is past the scroll edge. With a mouse (the theme's
 * presentation) the same model runs without motion: rows jump to their
 * places.
 *
 * HOW IT RUNS. Everything after the drag begins is imperative: no React
 * render and no layout read until the drop. The begin reads each row's
 * layout once; each move writes one `translate` on the dragged row (the
 * shared per-element animator's `set`), and a slot change starts one spring
 * per displaced row on the compositor. The list root carries
 * `data-astryx-reordering` from the begin until the commit that applies the
 * drop, so the List's update motion (useListUpdateMotion) leaves that commit
 * to the reorder: after it, each row's old layout place is put back with an
 * inverse offset and its running spring continues from where it is
 * (its value and its target move with the layout, its spring and velocity
 * stay), so the drop never restarts.
 * If `onReorder` does not commit a new order by the end of the task, every
 * row springs back to its place. On a touch screen a keyboard move works
 * the same way: the list carries the attribute until the move commits, then
 * every row slides from its old place to its new one on the table spring.
 * What runs only on a touch screen (the hold, the springs) is in
 * ListReorderTouch.ts, imported here alone.
 *
 * SYNC: When modified, update List/List.tsx, List/ListReorderHandle.tsx and
 * List/ListReorderTouch.ts.
 */

import {useMemo, useState, type KeyboardEvent, type RefObject} from 'react';
import {createLayerScopedContext as createContext} from '../Layer/layerScopedContext';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {
  useAnnounce,
  type AnnounceFn,
  type AnnouncePoliteness,
} from '../hooks/useAnnounce';
import {useTranslator, type TranslatorFn} from '../i18n/useTranslator';
import type {LongPressGestureRecognizer} from '../gestures/LongPressGestureRecognizer';
import {reorder} from '../motion/uikit/reorder';
import type {DurationBounce} from '../motion/spring';
import {
  animatorFor,
  isMoving,
  motionNow,
  motionOf,
  releaseMotion,
} from '../utils/rowMotion';
import {edgeAutoscroll, type EdgeAutoscroll} from '../utils/edgeAutoscroll';
import {useTouchPresentation} from '../utils/touchPresentation';
import {attachTouchHold, touchMotion} from './ListReorderTouch';
import {
  autoscrollStep,
  clampTop,
  movableRange,
  offsetsFor,
  proposedSlot,
  settleSpring,
  slideSpring,
  slotTop,
  type ReorderGeometry,
} from './reorderModel';

/** On the list root while a drag session owns its rows. */
export const REORDERING_ATTRIBUTE = 'data-astryx-reordering';
/**
 * On a row that keeps its place: it has no handle and no row moves past it
 * (ListItem `isReorderDisabled` sets it).
 * @experimental
 */
export const FIXED_ROW_ATTRIBUTE = 'data-astryx-reorder-fixed';
/** On each row's reorder handle. */
export const HANDLE_ATTRIBUTE = 'data-astryx-list-reorder';

/** Moves under half a pixel are layout noise. */
const MIN_MOVE_PX = 0.5;

/**
 * Where a row's `y` is on screen at `at`: its shared animator's value, which
 * the drag writes directly (`set`) as well as through springs.
 */
function shownY(element: HTMLElement, at: number): number {
  return animatorFor(element).get('y', at);
}

function rowsOf(list: HTMLElement): HTMLElement[] {
  return Array.from(list.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement,
  );
}

/** The slots a row can move to: between the fixed rows around it. */
function rangeOf(
  rows: ReadonlyArray<HTMLElement>,
  index: number,
): {start: number; end: number} {
  return movableRange(
    rows.map(element => ({
      top: 0,
      height: 0,
      isFixed: element.hasAttribute(FIXED_ROW_ATTRIBUTE),
    })),
    index,
  );
}

/**
 * A move a handle offers without a drag, and the slot it takes the row to.
 * @experimental
 */
export interface ReorderMove {
  readonly kind: 'up' | 'down' | 'top' | 'bottom';
  readonly to: number;
}

/** A row's layout top inside the list (transforms ignored). */
function layoutTop(row: HTMLElement, list: HTMLElement): number {
  const base = row.offsetParent === list ? 0 : list.offsetTop;
  return row.offsetTop - base;
}

function isScrollContainer(element: HTMLElement): boolean {
  const {overflowY} = getComputedStyle(element);
  return (
    (overflowY === 'auto' || overflowY === 'scroll') &&
    element.scrollHeight > element.clientHeight
  );
}

function isTransparent(color: string): boolean {
  return (
    color === '' ||
    color === 'transparent' ||
    /^rgba\(.*,\s*0\)$/.test(color) ||
    /\/\s*0\)$/.test(color)
  );
}

/**
 * The background a row is drawn on: the nearest opaque background behind
 * the list, else the page's canvas.
 */
function surfaceColor(list: HTMLElement): string {
  for (
    let node: HTMLElement | null = list;
    node != null;
    node = node.parentElement
  ) {
    const color = getComputedStyle(node).backgroundColor;
    if (!isTransparent(color)) {
      return color;
    }
  }
  return 'Canvas';
}

/** The element autoscroll writes to and its visible band in the viewport. */
interface Scroller {
  readonly element: Element;
  readonly top: number;
  readonly bottom: number;
  readonly max: number;
  position: number;
}

function scrollerOf(list: HTMLElement): Scroller {
  for (
    let node = list.parentElement;
    node != null && node !== node.ownerDocument.body;
    node = node.parentElement
  ) {
    if (isScrollContainer(node)) {
      const rect = node.getBoundingClientRect();
      const top = rect.top + node.clientTop;
      return {
        element: node,
        top,
        bottom: top + node.clientHeight,
        max: node.scrollHeight - node.clientHeight,
        position: node.scrollTop,
      };
    }
  }
  const doc = list.ownerDocument;
  const element = doc.scrollingElement ?? doc.documentElement;
  const view = doc.defaultView;
  const height = view?.innerHeight ?? element.clientHeight;
  return {
    element,
    top: 0,
    bottom: height,
    max: Math.max(0, element.scrollHeight - height),
    position: element.scrollTop,
  };
}

/** A drag in progress, from the begin to the drop. */
interface DragSession {
  readonly list: HTMLElement;
  /** The rows in order at the begin. */
  readonly rows: ReadonlyArray<HTMLElement>;
  /** Their layout tops at the begin, for the commit's rebase. */
  readonly tops: ReadonlyArray<number>;
  readonly geometry: ReorderGeometry;
  readonly dragged: number;
  slot: number;
  /** The offset each row is moving to. */
  readonly offsets: number[];
  /** The list's layout origin in the viewport at the begin. */
  readonly origin: number;
  /** The finger's distance from the dragged row's top. */
  readonly grabOffset: number;
  readonly scroller: Scroller;
  /** How far autoscroll has moved the content since the begin. */
  scrolled: number;
  lastY: number;
  /** The edge autoscroll's timer, on UIKit's 20 ms clock. */
  readonly edge: EdgeAutoscroll;
  /** Points per tick of the running autoscroll; 0 when none. */
  step: number;
  /**
   * The slides' spring under the list's theme, read at the begin; null with
   * a mouse, whose rows take their places at once.
   */
  readonly slide: DurationBounce | null;
  /** The dragged row's inline stacking before the drag. */
  readonly restore: RowRestore;
}

/** The inline values a drag overrides until its rows rest. */
interface RowRestore {
  /** The dragged row's stacking and background. */
  readonly zIndex: string;
  readonly backgroundColor: string;
  /** The session's rows, whose identity offsets go once they rest. */
  readonly rows: ReadonlyArray<HTMLElement>;
}

/** A drop reported through `onReorder`, waiting for its commit. */
interface PendingDrop {
  readonly list: HTMLElement;
  readonly rows: ReadonlyArray<HTMLElement>;
  readonly tops: ReadonlyArray<number>;
  readonly dragged: number;
  readonly restore: RowRestore;
}

/**
 * What a move announces: `landed` once the consumer commits it (the row is at
 * `to` in the DOM), `kept` if the consumer keeps the order instead. A screen
 * reader never hears a move that did not happen.
 */
interface PendingAnnouncement {
  readonly row: HTMLElement;
  readonly to: number;
  readonly landed: string;
  readonly kept: string;
  readonly politeness: AnnouncePoliteness | undefined;
}

/** A keyboard move waiting for its commit: the rows and their places before it. */
interface PendingKeyMove {
  readonly list: HTMLElement;
  readonly rows: ReadonlyArray<HTMLElement>;
  readonly tops: ReadonlyArray<number>;
}

/** The strings the controller announces, from the translator. */
interface ReorderMessages {
  position: (position: number, total: number) => string;
  pickedUp: (position: number, total: number) => string;
  dropped: (position: number, total: number) => string;
  cancelled: (position: number, total: number) => string;
}

function messagesFrom(t: TranslatorFn): ReorderMessages {
  return {
    position: (position, total) =>
      t('@astryx.list.reorderPosition', {position, total}),
    pickedUp: (position, total) =>
      t('@astryx.list.reorderPickedUp', {position, total}),
    dropped: (position, total) =>
      t('@astryx.list.reorderDropped', {position, total}),
    cancelled: (position, total) =>
      t('@astryx.list.reorderCancelled', {position, total}),
  };
}

/**
 * What a gesture listener hands the controller.
 * @experimental
 */
export interface ReorderGestureEvent {
  readonly state: 'began' | 'changed' | 'ended' | 'cancelled';
  /** The finger's (or pointer's) y in the viewport. */
  readonly y: number;
}

/**
 * The reorder session of one List. One instance per List; every handle in it
 * reports its gestures and keys here. Reached through `ListReorderContextValue`
 * by `ListReorderHandle` only: its members are not an API and may change.
 * @experimental
 */
/** A long press's state as a reorder gesture's; null while it waits. */
function gestureStateOf(
  recognizer: LongPressGestureRecognizer,
): ReorderGestureEvent['state'] | null {
  switch (recognizer.state) {
    case 'began':
    case 'changed':
    case 'ended':
    case 'cancelled':
      return recognizer.state;
    case 'failed':
      return 'cancelled';
    case 'possible':
      return null;
  }
}

export class ListReorderController {
  onReorder: ((fromIndex: number, toIndex: number) => void) | undefined;
  announce: AnnounceFn = () => {};
  messages: ReorderMessages | null = null;
  /** Whether rows move on springs (`'uikit'`) or jump (`'theme'`). */
  presentation: 'uikit' | 'theme' = 'theme';
  private session: DragSession | null = null;
  private pending: PendingDrop | null = null;
  private fallback: ReturnType<typeof setTimeout> | null = null;
  /** The row a keyboard pick-up started from, and its place then. */
  private lifted: {row: HTMLElement; origin: number} | null = null;
  /** The row whose handle keeps focus across the commit of a key move. */
  private focusRow: HTMLElement | null = null;
  /** A move's announcement, waiting for its commit. */
  private announcement: PendingAnnouncement | null = null;
  private announcementFallback: ReturnType<typeof setTimeout> | null = null;
  /** A keyboard move whose rows slide once it commits (on a touch screen). */
  private keyMove: PendingKeyMove | null = null;
  private keyFallback: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly getList: () => HTMLElement | null) {}

  /** The List's latest callback, announcer, strings and presentation. */
  configure(options: {
    onReorder: ((fromIndex: number, toIndex: number) => void) | undefined;
    announce: AnnounceFn;
    messages: ReorderMessages;
    presentation: 'uikit' | 'theme';
  }): void {
    this.onReorder = options.onReorder;
    this.announce = options.announce;
    this.messages = options.messages;
    this.presentation = options.presentation;
  }

  private get animates(): boolean {
    return this.presentation === 'uikit';
  }

  // --- Pointer drags ---------------------------------------------------

  /** A handle's gesture: begin, track, drop or cancel the drag. */
  gesture(row: HTMLElement | null, event: ReorderGestureEvent): void {
    switch (event.state) {
      case 'began':
        if (row != null) {
          this.begin(row, event.y);
        }
        break;
      case 'changed':
        this.track(event.y);
        break;
      case 'ended':
        this.drop();
        break;
      case 'cancelled':
        this.cancel();
        break;
    }
  }

  /**
   * A handle's long press (a finger's hold, or a mouse at once) moved:
   * `onDrag` runs once the row follows it.
   */
  recognized(
    handle: HTMLElement | null,
    recognizer: LongPressGestureRecognizer,
    onDrag?: () => void,
  ): void {
    const state = gestureStateOf(recognizer);
    if (state == null) {
      return;
    }
    if (state === 'changed') {
      onDrag?.();
    }
    this.gesture(this.rowOf(handle), {state, y: recognizer.location().y});
  }

  /** Lets a finger held still on `handle` pick up its row. Returns the detach. */
  attachTouch(handle: HTMLElement, onDrag?: () => void): () => void {
    return attachTouchHold(handle, recognizer =>
      this.recognized(handle, recognizer, onDrag),
    );
  }

  private begin(row: HTMLElement, y: number): void {
    const list = this.getList();
    if (list == null || this.session != null) {
      return;
    }
    // A drop still waiting for its commit is settled where it is.
    this.flushPending();
    const rows = rowsOf(list);
    const dragged = rows.indexOf(row);
    if (dragged < 0 || row.hasAttribute(FIXED_ROW_ATTRIBUTE)) {
      return;
    }
    const at = motionNow();
    const tops = rows.map(element => layoutTop(element, list));
    const heights = rows.map(element => element.offsetHeight);
    const geometry: ReorderGeometry = {
      rows: rows.map((element, index) => ({
        top: tops[index],
        height: heights[index],
        isFixed: element.hasAttribute(FIXED_ROW_ATTRIBUTE),
      })),
      gap: rows.length > 1 ? Math.max(0, tops[1] - tops[0] - heights[0]) : 0,
    };
    // The list's layout origin in the viewport, from the dragged row's box
    // without the offset it may still be moving by.
    const shown = shownY(row, at);
    const origin = row.getBoundingClientRect().top - shown - tops[dragged];
    const scroller = scrollerOf(list);
    // Every row gets an identity offset for the session: a row's first offset
    // would otherwise change how it paints in the middle of the drag (a
    // layout and a paint); with one in place, neither a move nor a slide lays
    // out or paints. (`will-change` would make each slide's start repaint its
    // row.) The dragged row goes above its neighbours.
    const restore: RowRestore = {
      zIndex: row.style.zIndex,
      backgroundColor: row.style.backgroundColor,
      rows,
    };
    // Opaque, as a table cell is: the rows it passes stay under it. A row
    // without its own background takes the surface's behind the list.
    const background = isTransparent(getComputedStyle(row).backgroundColor)
      ? surfaceColor(list)
      : null;
    for (const element of rows) {
      if (element.style.translate === '') {
        element.style.translate = '0px 0px';
      }
    }
    row.style.zIndex = '1';
    if (background != null) {
      row.style.backgroundColor = background;
    }
    list.setAttribute(REORDERING_ATTRIBUTE, '');
    const session: DragSession = {
      list,
      rows,
      tops,
      geometry,
      dragged,
      slot: dragged,
      offsets: rows.map((element, index) =>
        index === dragged ? 0 : shownY(element, at),
      ),
      origin,
      grabOffset: y - (origin + tops[dragged] + shown),
      scroller,
      scrolled: 0,
      lastY: y,
      edge: edgeAutoscroll({
        intervalMs: reorder.autoscroll.tickMs,
        // UIKit's run-loop timer: a late fire (engines fire a 20 ms interval
        // every 20 to 25 ms) catches up one tick, a longer stall is skipped.
        catchUp: true,
        now: motionNow,
        step: () => this.edgeStep(session),
        apply: delta => this.scrollBy(session, delta),
      }),
      step: 0,
      slide: this.animates ? touchMotion.slideBase(list) : null,
      restore,
    };
    this.session = session;
    // Rows still sliding from an earlier drag go to their places.
    this.moveTo(dragged, true);
    this.track(y);
  }

  /** The dragged row's top in the viewport for the finger at `y`. */
  private draggedTop(session: DragSession, y: number): number {
    const {geometry, dragged, scroller} = session;
    const row = geometry.rows[dragged];
    const first = geometry.rows[0];
    const last = geometry.rows[geometry.rows.length - 1];
    const origin = session.origin - session.scrolled;
    return clampTop(y - session.grabOffset, row.height, {
      scrollTop: scroller.top,
      scrollBottom: scroller.bottom,
      listTop: origin + first.top,
      listBottom: origin + last.top + last.height,
    });
  }

  private track(y: number): void {
    const session = this.session;
    if (session == null) {
      return;
    }
    session.lastY = y;
    const {geometry, dragged} = session;
    const row = geometry.rows[dragged];
    const origin = session.origin - session.scrolled;
    const top = this.draggedTop(session, y);
    animatorFor(session.rows[dragged]).set({y: top - (origin + row.top)});
    const slot = proposedSlot(geometry, dragged, top + row.height / 2 - origin);
    if (slot !== session.slot) {
      this.moveTo(slot, false);
    }
    this.autoscroll(top, row.height);
  }

  /** Slides the rows the dragged row displaces at `slot` to their places. */
  private moveTo(slot: number, force: boolean): void {
    const session = this.session;
    if (session == null) {
      return;
    }
    session.slot = slot;
    const offsets = offsetsFor(session.geometry, session.dragged, slot);
    const at = motionNow();
    const spring =
      session.slide == null ? null : slideSpring(session.step, session.slide);
    for (const [index, offset] of offsets.entries()) {
      if (
        index === session.dragged ||
        (!force && offset === session.offsets[index])
      ) {
        continue;
      }
      const element = session.rows[index];
      session.offsets[index] = offset;
      if (force && Math.abs(shownY(element, at) - offset) < MIN_MOVE_PX) {
        continue;
      }
      if (spring != null) {
        touchMotion.slide(element, offset, spring, at);
      } else {
        animatorFor(element).set({y: offset});
      }
    }
    // A pointer drag announces its drop, not each place it passes: a live
    // region's text change is a layout, and the drag runs on the compositor.
  }

  /**
   * Points per tick for the dragged row at `top`: positive down, negative
   * up, 0 when neither edge is near or the content cannot move that way.
   */
  private stepFor(session: DragSession, top: number, height: number): number {
    const {scroller} = session;
    let step = 0;
    if (scroller.position < scroller.max) {
      step = autoscrollStep(top + height - scroller.bottom);
    }
    if (step === 0 && scroller.position > 0) {
      step = -autoscrollStep(scroller.top - top);
    }
    return step;
  }

  /** Starts or stops the edge autoscroll for the row at `top`. */
  private autoscroll(top: number, height: number): void {
    const session = this.session;
    if (session == null) {
      return;
    }
    session.step = Math.abs(this.stepFor(session, top, height));
    session.edge.update();
  }

  /** The autoscroll's next step for the finger where it last was. */
  private edgeStep(session: DragSession): number {
    if (this.session !== session) {
      return 0;
    }
    const {geometry, dragged} = session;
    const top = this.draggedTop(session, session.lastY);
    return this.stepFor(session, top, geometry.rows[dragged].height);
  }

  /**
   * One autoscroll step: the content moves by `delta` (inside its range) and
   * the row stays under the finger. Returns how far the content moved.
   */
  private scrollBy(session: DragSession, delta: number): number {
    if (this.session !== session) {
      return 0;
    }
    const {scroller} = session;
    const next = Math.min(scroller.max, Math.max(0, scroller.position + delta));
    const moved = next - scroller.position;
    if (moved === 0) {
      return 0;
    }
    scroller.element.scrollTop = next;
    session.scrolled += moved;
    scroller.position = next;
    this.track(session.lastY);
    return moved;
  }

  private stopAutoscroll(session: DragSession): void {
    session.edge.stop();
    session.step = 0;
  }

  /** The drop: the row springs into its slot and the move is reported. */
  private drop(): void {
    const session = this.session;
    if (session == null) {
      return;
    }
    this.session = null;
    this.stopAutoscroll(session);
    const {geometry, dragged, slot, rows, list} = session;
    const element = rows[dragged];
    const target =
      slotTop(geometry, dragged, slot) - geometry.rows[dragged].top;
    const at = motionNow();
    if (this.animates) {
      const distance = target - shownY(element, at);
      touchMotion.settle(
        element,
        target,
        settleSpring(distance, geometry.rows[dragged].height),
        at,
      );
    } else {
      animatorFor(element).set({y: target});
    }
    const dropped = this.messages?.dropped(slot + 1, rows.length) ?? '';
    if (slot === dragged || this.onReorder == null) {
      this.announce(dropped, 'polite');
      list.removeAttribute(REORDERING_ATTRIBUTE);
      this.restWhenDone(element, session.restore);
      return;
    }
    this.announceWhenCommitted({
      row: element,
      to: slot,
      landed: dropped,
      kept: this.messages?.cancelled(dragged + 1, rows.length) ?? '',
      politeness: 'polite',
    });
    this.pending = {
      list,
      rows,
      tops: session.tops,
      dragged,
      restore: session.restore,
    };
    this.onReorder(dragged, slot);
    // A consumer that does not apply the move by the end of the task gets
    // its rows back where they were.
    this.fallback = setTimeout(() => {
      this.fallback = null;
      this.refuse();
    }, 0);
  }

  /** The browser took the touch (a pinch, a scroll): every row goes home. */
  cancel(): void {
    const session = this.session;
    if (session == null) {
      return;
    }
    this.session = null;
    this.stopAutoscroll(session);
    this.springBack(
      session.list,
      session.rows,
      session.dragged,
      session.restore,
    );
    this.announce(
      this.messages?.cancelled(session.dragged + 1, session.rows.length) ?? '',
    );
  }

  private springBack(
    list: HTMLElement,
    rows: ReadonlyArray<HTMLElement>,
    dragged: number,
    restore: RowRestore,
  ): void {
    const at = motionNow();
    for (const [index, element] of rows.entries()) {
      const value = shownY(element, at);
      if (Math.abs(value) < MIN_MOVE_PX && !isMoving(element)) {
        continue;
      }
      if (!this.animates) {
        animatorFor(element).set({y: 0});
        releaseMotion(element, 'translate');
        continue;
      }
      const spring =
        index === dragged
          ? settleSpring(value, element.offsetHeight)
          : slideSpring(0, touchMotion.slideBase(list));
      touchMotion.home(element, spring, at, index === dragged);
    }
    list.removeAttribute(REORDERING_ATTRIBUTE);
    this.restWhenDone(rows[dragged], restore);
  }

  /** `onReorder` applied no new order: the rows return to their places. */
  private refuse(): void {
    const pending = this.pending;
    if (pending == null) {
      return;
    }
    const current = rowsOf(pending.list);
    if (!sameOrder(current, pending.rows)) {
      // The commit came but its layout effect has not run yet.
      return;
    }
    this.pending = null;
    this.springBack(
      pending.list,
      pending.rows,
      pending.dragged,
      pending.restore,
    );
  }

  /** Clears the dragged row's stacking once its motion has come to rest. */
  private restWhenDone(element: HTMLElement, restore: RowRestore): void {
    const settle = () => {
      if (this.session?.rows[this.session.dragged] === element) {
        return;
      }
      const running = motionOf(element, 'y');
      if (running != null) {
        // The drop's spring, or the rebase that continues it.
        void running.handle.finished.then(settle);
        return;
      }
      element.style.zIndex = restore.zIndex;
      element.style.backgroundColor = restore.backgroundColor;
      // Identity offsets go; a row still moving keeps its own.
      for (const row of restore.rows) {
        releaseMotion(row, 'translate');
      }
    };
    settle();
  }

  private flushPending(): void {
    if (this.pending == null) {
      return;
    }
    if (this.fallback != null) {
      clearTimeout(this.fallback);
      this.fallback = null;
    }
    this.refuse();
    this.pending = null;
  }

  // --- Commits ---------------------------------------------------------

  /**
   * After every List commit (a layout effect, after the List's update
   * motion): a drop's new order is applied, so each row's old place is put
   * back and its running spring continues to the new one.
   */
  commit(): void {
    const list = this.getList();
    if (list == null) {
      return;
    }
    const session = this.session;
    if (session != null && !sameOrder(rowsOf(list), session.rows)) {
      // The rows changed under the drag.
      this.cancel();
    }
    const pending = this.pending;
    if (pending != null && !sameOrder(rowsOf(list), pending.rows)) {
      this.pending = null;
      if (this.fallback != null) {
        clearTimeout(this.fallback);
        this.fallback = null;
      }
      this.rebase(pending);
    }
    const announcement = this.announcement;
    if (
      announcement != null &&
      rowsOf(list).indexOf(announcement.row) === announcement.to
    ) {
      this.announcement = null;
      if (this.announcementFallback != null) {
        clearTimeout(this.announcementFallback);
        this.announcementFallback = null;
      }
      this.announce(announcement.landed, announcement.politeness);
    }
    const keyMove = this.keyMove;
    if (keyMove != null && !sameOrder(rowsOf(list), keyMove.rows)) {
      this.keyMove = null;
      if (this.keyFallback != null) {
        clearTimeout(this.keyFallback);
        this.keyFallback = null;
      }
      this.slideByKey(keyMove);
    }
    this.restoreFocus();
  }

  /** A keyboard move landed: every row slides from its old place to its new one. */
  private slideByKey(move: PendingKeyMove): void {
    const {list} = move;
    const at = motionNow();
    for (const [index, element] of move.rows.entries()) {
      if (element.parentElement !== list) {
        continue;
      }
      const shift = move.tops[index] - layoutTop(element, list);
      if (Math.abs(shift) < MIN_MOVE_PX) {
        continue;
      }
      // A row still sliding from the previous key goes on from where it is
      // shown, as a drop's rows do.
      touchMotion.follow(
        element,
        shift,
        slideSpring(0, touchMotion.slideBase(list)),
        at,
      );
    }
    list.removeAttribute(REORDERING_ATTRIBUTE);
  }

  private rebase(pending: PendingDrop): void {
    const {list} = pending;
    const at = motionNow();
    for (const [index, element] of pending.rows.entries()) {
      if (element.parentElement !== list) {
        continue;
      }
      const shift = pending.tops[index] - layoutTop(element, list);
      const value = shownY(element, at);
      if (Math.abs(value + shift) < MIN_MOVE_PX && !isMoving(element)) {
        animatorFor(element).set({y: 0});
        releaseMotion(element, 'translate');
        continue;
      }
      if (Math.abs(shift) < MIN_MOVE_PX) {
        continue;
      }
      if (this.animates) {
        // Every row's place after the drop is its new layout place, so each
        // running spring (the drop's settle, a row's slide) goes on to 0 from
        // the shifted value.
        touchMotion.follow(
          element,
          shift,
          slideSpring(0, touchMotion.slideBase(list)),
          at,
        );
      } else {
        animatorFor(element).set({y: 0});
        releaseMotion(element, 'translate');
      }
    }
    list.removeAttribute(REORDERING_ATTRIBUTE);
    this.restWhenDone(pending.rows[pending.dragged], pending.restore);
  }

  /**
   * The row that holds `element` (a handle): the list's child that contains
   * it, whatever its tag. Null outside the list.
   */
  rowOf(element: Element | null): HTMLElement | null {
    const list = this.getList();
    let node = element;
    while (node != null && node.parentElement !== list) {
      node = node.parentElement;
    }
    return list != null && node instanceof HTMLElement ? node : null;
  }

  /** The 1-based place of the row that holds `element`, or null. */
  positionOf(element: Element | null): number | null {
    const list = this.getList();
    const row = this.rowOf(element);
    return list == null || row == null ? null : rowsOf(list).indexOf(row) + 1;
  }

  // --- Moves without a drag -------------------------------------------

  /**
   * The moves a row's handle offers without a drag (WCAG 2.5.7): up, down,
   * to the top and to the bottom of its group, each only when it moves the
   * row. Empty for a row that cannot move.
   */
  movesFor(row: HTMLElement | null): ReadonlyArray<ReorderMove> {
    const list = this.getList();
    if (row == null || list == null) {
      return [];
    }
    const rows = rowsOf(list);
    const index = rows.indexOf(row);
    if (index < 0 || row.hasAttribute(FIXED_ROW_ATTRIBUTE)) {
      return [];
    }
    const {start, end} = rangeOf(rows, index);
    const moves: ReorderMove[] = [];
    if (index > start) {
      moves.push({kind: 'up', to: index - 1}, {kind: 'top', to: start});
    }
    if (index < end) {
      moves.push({kind: 'down', to: index + 1}, {kind: 'bottom', to: end});
    }
    return moves;
  }

  /** Moves a row as its keys would: announced once it lands. */
  moveRow(row: HTMLElement | null, to: number): void {
    const list = this.getList();
    if (row == null || list == null || this.session != null) {
      return;
    }
    const rows = rowsOf(list);
    const index = rows.indexOf(row);
    const {start, end} = rangeOf(rows, index);
    if (index < 0 || to < start || to > end || to === index) {
      return;
    }
    this.focusRow = row;
    this.announceWhenCommitted({
      row,
      to,
      landed: this.messages?.position(to + 1, rows.length) ?? '',
      kept: this.messages?.cancelled(index + 1, rows.length) ?? '',
      politeness: undefined,
    });
    this.moveByKey(list, rows, index, to);
  }

  // --- Keys ------------------------------------------------------------

  /** A handle's key: arrows, Home and End move the row; Space picks it up. */
  keyDown(row: HTMLElement | null, event: KeyboardEvent): void {
    const list = this.getList();
    if (row == null || list == null || this.session != null) {
      return;
    }
    // A modified key is a browser or assistive-technology shortcut.
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    const rows = rowsOf(list);
    const index = rows.indexOf(row);
    if (index < 0) {
      return;
    }
    const range = rangeOf(rows, index);
    const total = rows.length;
    let to: number;
    switch (event.key) {
      case 'ArrowUp':
        to = index - 1;
        break;
      case 'ArrowDown':
        to = index + 1;
        break;
      case 'Home':
        to = range.start;
        break;
      case 'End':
        to = range.end;
        break;
      case ' ':
      case 'Enter': {
        event.preventDefault();
        if (this.lifted?.row === row) {
          this.lifted = null;
          this.announce(this.messages?.dropped(index + 1, total) ?? '');
        } else {
          this.lifted = {row, origin: index};
          this.announce(this.messages?.pickedUp(index + 1, total) ?? '');
        }
        return;
      }
      case 'Escape': {
        const lifted = this.lifted;
        if (lifted?.row !== row) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        this.lifted = null;
        const cancelled =
          this.messages?.cancelled(lifted.origin + 1, total) ?? '';
        if (lifted.origin === index) {
          this.announce(cancelled);
          return;
        }
        this.focusRow = row;
        this.announceWhenCommitted({
          row,
          to: lifted.origin,
          landed: cancelled,
          kept: this.messages?.position(index + 1, total) ?? '',
          politeness: undefined,
        });
        this.moveByKey(list, rows, index, lifted.origin);
        return;
      }
      default:
        return;
    }
    event.preventDefault();
    this.moveRow(row, to);
  }

  /**
   * Announces a move once it commits; if the consumer keeps the order by the
   * end of the task, announces that the row stayed instead.
   */
  private announceWhenCommitted(announcement: PendingAnnouncement): void {
    this.announcement = announcement;
    if (this.announcementFallback != null) {
      clearTimeout(this.announcementFallback);
    }
    this.announcementFallback = setTimeout(() => {
      this.announcementFallback = null;
      const pending = this.announcement;
      if (pending != null) {
        this.announcement = null;
        this.announce(pending.kept, pending.politeness);
      }
    }, 0);
  }

  /**
   * A key moves a row. On a touch screen its rows then slide to their new
   * places on the table spring, as a UIKit table moves a row, in any list on this controller
   * (a List, or ListInput's records); the list carries `data-astryx-reordering`
   * until the move commits, so the List's update motion leaves it to us.
   */
  private moveByKey(
    list: HTMLElement,
    rows: ReadonlyArray<HTMLElement>,
    from: number,
    to: number,
  ): void {
    if (this.animates && this.onReorder != null) {
      this.keyMove = {
        list,
        rows,
        tops: rows.map(element => layoutTop(element, list)),
      };
      list.setAttribute(REORDERING_ATTRIBUTE, '');
      if (this.keyFallback != null) {
        clearTimeout(this.keyFallback);
      }
      // The consumer kept the order: nothing slides.
      this.keyFallback = setTimeout(() => {
        this.keyFallback = null;
        if (this.keyMove != null) {
          this.keyMove = null;
          if (this.session == null && this.pending == null) {
            list.removeAttribute(REORDERING_ATTRIBUTE);
          }
        }
      }, 0);
    }
    this.onReorder?.(from, to);
  }

  /** A row's handle lost focus: a keyboard pick-up ends where it is. */
  blur(row: HTMLElement | null): void {
    if (this.lifted?.row === row) {
      this.lifted = null;
    }
  }

  private restoreFocus(): void {
    const row = this.focusRow;
    if (row == null) {
      return;
    }
    this.focusRow = null;
    const handle = row.querySelector<HTMLElement>(`[${HANDLE_ATTRIBUTE}]`);
    if (handle != null && row.ownerDocument.activeElement !== handle) {
      handle.focus({preventScroll: true});
    }
  }

  /** The List unmounted: timers stop, nothing is left half-moved. */
  dispose(): void {
    const session = this.session;
    if (session != null) {
      this.stopAutoscroll(session);
      this.session = null;
    }
    if (this.fallback != null) {
      clearTimeout(this.fallback);
      this.fallback = null;
    }
    this.pending = null;
    if (this.keyFallback != null) {
      clearTimeout(this.keyFallback);
      this.keyFallback = null;
    }
    this.keyMove = null;
    if (this.announcementFallback != null) {
      clearTimeout(this.announcementFallback);
      this.announcementFallback = null;
    }
    this.announcement = null;
  }
}

function sameOrder(
  a: ReadonlyArray<HTMLElement>,
  b: ReadonlyArray<HTMLElement>,
): boolean {
  return (
    a.length === b.length && a.every((element, index) => element === b[index])
  );
}

/**
 * A list's reorder session, as `useListReorder` returns it; opaque. Provide
 * it to the rows through `ListReorderContext`.
 * @experimental
 */
export interface ListReorderContextValue {
  readonly controller: ListReorderController;
  /** The id of the list's reorder instructions, for each handle. */
  readonly hintId: string;
}

/**
 * Hands a list's reorder session to the `ListReorderHandle` in each of its
 * rows. Provide `useListReorder`'s value.
 * @experimental
 */
export const ListReorderContext = createContext<ListReorderContextValue | null>(
  null,
);
ListReorderContext.displayName = 'ListReorderContext';

/**
 * The reorder session of a list: null without `onReorder`. The rows are the
 * direct children of the element behind `listRef`, each with a
 * `ListReorderHandle` unless it keeps its place (the fixed-row attribute).
 * Provide the value through `ListReorderContext`, and give the element with
 * id `hintId` the instructions (`@astryx.list.reorderHint`). `onReorder`
 * receives the move and must commit the new order, rows keyed by item, in the
 * same task. List calls it after `useListUpdateMotion`, so its commit effect
 * runs after that pass.
 * @experimental
 */
export function useListReorder(
  listRef: RefObject<HTMLElement | null>,
  onReorder: ((fromIndex: number, toIndex: number) => void) | undefined,
  hintId: string,
): ListReorderContextValue | null {
  const [controller] = useState(
    () => new ListReorderController(() => listRef.current),
  );
  const announce = useAnnounce();
  const t = useTranslator();
  // UIKit's motion under a finger (one touch model on every touch device);
  // with a mouse, rows take their places at once.
  const motion = useTouchPresentation().isTouch ? 'uikit' : 'theme';
  useIsomorphicLayoutEffect(() => {
    controller.configure({
      onReorder,
      announce,
      messages: messagesFrom(t),
      presentation: motion,
    });
  });
  // After every commit: apply a drop's new order (see `commit`).
  useIsomorphicLayoutEffect(() => {
    controller.commit();
  });
  useIsomorphicLayoutEffect(() => () => controller.dispose(), [controller]);
  const isEnabled = onReorder != null;
  return useMemo(
    () => (isEnabled ? {controller, hintId} : null),
    [controller, hintId, isEnabled],
  );
}
