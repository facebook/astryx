// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file listLayoutUpdates.ts
 * @input A List's element, its `animatedLayout` handle and the one
 *   size-change module (motion/animatedLayout.ts)
 * @output `useListLayoutUpdates`: reports each row inserted, removed or moved
 *   between two renders to the handle (`component:List` FR12); the row
 *   attributes it reads and writes; `keepPresentation`, for a row leaving
 *   the list
 * @position Internal; List calls it with its `animatedLayout` prop
 *
 * How it runs, through the one size-change module
 * (`architecture:react-component-runtime` INV12):
 * - Before a commit that changes the list's rows (LayoutChangeSnapshot calls
 *   `measure`, before React changes the DOM), it reports the list itself, so
 *   the content after it glides and any row inside it can exit, and its first
 *   and last rows. The module's walk takes the siblings on both sides of a
 *   change, so each of those two carries the other and every row between
 *   them from its old place: a row inserted above the first, or a row moved
 *   to the top, included. (A one-row list has one such row, which an insert
 *   above it moves at once.)
 * - After the commit, rows are matched by their `itemKey`
 *   (`spec:AST-103` DEC-4). A row that left comes back where it was and
 *   exits: in place, giving up its space, inert and hidden from assistive
 *   technology, concealing upward (`holdLayoutExit`), then it goes. A row
 *   that appeared enters (`playLayoutChange`). The rows that stay glide. All
 *   of it plays on the shared motion role and starts in the same frame
 *   (`spec:AST-105` FR3, FR4).
 * - A row that slides up across rows moving down rides above them for its
 *   glide, the list's surface behind it (`TRAVELLING_ATTRIBUTE`, painted by
 *   ListItem), as an opaque UIKit cell passes over its neighbours.
 * - Every pointer; Reduce Motion follows the module's policy.
 * - Without a handle nothing is measured, and the list changes at once
 *   (`spec:AST-105` FR2), as does a list whose rows a reorder is dragging. A
 *   row without an `itemKey` has no identity to match: its own insertion,
 *   removal or move changes at once, though it glides like any content when
 *   a keyed row's change moves it.
 *
 * SYNC: When modified, update List/List.tsx, List/ListItem.tsx and
 * List/__tests__/ListUpdates.interaction.browser.spec.ts.
 */

import {useCallback, useRef, type RefObject} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {
  holdLayoutExit,
  playLayoutChange,
  reportLayoutChange,
  type AnimatedLayout,
  type LayoutChange,
} from '../motion/animatedLayout';

/** A row's item key, which ListItem writes from its `itemKey`. */
export const ITEM_KEY_ATTRIBUTE = 'data-astryx-item-key';

/**
 * Written on a row that glides up across rows moving down, for the length of
 * its glide: it rides above them with the list's surface behind it
 * (List/ListItem.tsx). Rows here have no background of their own.
 */
export const TRAVELLING_ATTRIBUTE = 'data-astryx-travelling';

/** Marks a row put back for its exit: not a row any more. */
export const LEAVING_ATTRIBUTE = 'data-astryx-leaving';

/**
 * The lists under an animated layout handle at their last commit, so a row
 * leaving one keeps what it showed on screen for its exit
 * (`keepPresentation`) without reading the list's props.
 */
const animatedLists = new WeakSet<Element>();

/** Whether `row` is in a list under an animated layout handle. */
export function isInAnimatedList(row: Element): boolean {
  const list = row.parentElement;
  return list != null && animatedLists.has(list);
}

/** A list root a reorder is dragging: its rows are the reorder's. */
const REORDERING_ATTRIBUTE = 'data-astryx-reordering';

/** Moves under half a pixel are layout noise, not updates. */
const MIN_MOVE_PX = 0.5;

/** A row before the commit: where it was. */
interface RowBefore {
  readonly element: HTMLElement;
  readonly top: number;
}

/** What `measure` saw, for the layout effect of the same commit. */
interface Measured {
  readonly rows: ReadonlyMap<string, RowBefore>;
  readonly order: ReadonlyArray<string>;
  readonly changes: ReadonlyArray<LayoutChange>;
  /** Rows whose translation moved onto their children for the commit. */
  readonly settled: ReadonlyArray<Settled>;
}

/**
 * The list's rows that have an item key, by it, in order. A row without one
 * has no identity to match across renders: its own insertion, removal or
 * move is never reported, and changes at once.
 */
function keyedRows(list: HTMLElement): Map<string, HTMLElement> {
  const rows = new Map<string, HTMLElement>();
  for (const child of list.children) {
    if (
      !(child instanceof HTMLElement) ||
      child.hasAttribute(LEAVING_ATTRIBUTE)
    ) {
      continue;
    }
    const key = child.getAttribute(ITEM_KEY_ATTRIBUTE);
    if (key != null) {
      rows.set(key, child);
    }
  }
  return rows;
}

/**
 * The inline styles a leaving row and its parts showed as they left (a
 * swipe's travel), written by `keepPresentation`, until the row comes back
 * for its exit.
 */
const keptStyles = new WeakMap<
  HTMLElement,
  ReadonlyArray<readonly [HTMLElement | SVGElement, string]>
>();

/**
 * Writes what the Web Animations running on `row` and its parts present (a
 * swipe's travel, on the compositor) as inline styles, and keeps them. A
 * removed row is detached from the document, which drops those animations;
 * its exit puts it back, showing what was on screen when it left. ListItem
 * calls it as it unmounts, while it is still in the document. Animations on
 * pseudo-elements, or that cannot write their values, are left alone.
 */
export function keepPresentation(row: HTMLElement): void {
  if (typeof row.getAnimations !== 'function') {
    return;
  }
  for (const animation of row.getAnimations({subtree: true})) {
    try {
      animation.commitStyles();
    } catch {
      // A pseudo-element's or an unrendered target's animation: nothing to
      // keep.
    }
  }
  // The parts' owners clean up after the row does and may reset what was
  // just written (a swipe gives its row back its own translation): keep it.
  const styled: (readonly [HTMLElement | SVGElement, string])[] = [];
  for (const part of [
    row,
    ...row.querySelectorAll<HTMLElement | SVGElement>('*'),
  ]) {
    if (part.style.length > 0) {
      styled.push([part, part.style.cssText]);
    }
  }
  keptStyles.set(row, styled);
}

/**
 * Puts a row that left back where it was, for its exit, before `anchor` (the
 * nearest later row in the list), showing what it showed as it left. The
 * exit makes it inert; until then it is marked as leaving and hidden from
 * assistive technology, so no later commit counts it as a row.
 */
function putBack(
  element: HTMLElement,
  list: HTMLElement,
  anchor: HTMLElement | null,
): void {
  element.setAttribute(LEAVING_ATTRIBUTE, '');
  element.setAttribute('aria-hidden', 'true');
  list.insertBefore(element, anchor);
  // Back in the document, its parts' animations would apply again over what
  // they showed as it left: stop them, and show what was on screen.
  if (typeof element.getAnimations === 'function') {
    for (const animation of element.getAnimations({subtree: true})) {
      animation.cancel();
    }
  }
  for (const [part, cssText] of keptStyles.get(element) ?? []) {
    part.style.cssText = cssText;
  }
  keptStyles.delete(element);
}

/** A row whose own translation moved onto its children, and what it replaced. */
interface Settled {
  readonly row: HTMLElement;
  readonly prior: ReadonlyArray<
    readonly [HTMLElement | SVGElement, string, string]
  >;
}

/**
 * Moves a row's own translation (a swipe's) onto its children, so the row's
 * box lies where the row lies in the list while it shows the same thing.
 * Done for every translated row as a change is measured, and undone after
 * the commit for each row that stays: a row that leaves then exits on its
 * own box, in view, its exit's clip keeping the action the swipe uncovered
 * and cutting the content the swipe carried away, and the box is the same
 * before and after the commit, so nothing glides it. (With the translation
 * on the row, a row a swipe carried out of the list's box would lie out of
 * view, and its exit would clip the action.) Only a translation moves.
 * Returns what to undo, or null when the row has no translation of its own.
 */
function settleTranslation(row: HTMLElement): Settled | null {
  const view = row.ownerDocument.defaultView;
  if (view == null || typeof view.DOMMatrix !== 'function') {
    return null;
  }
  const transform = view.getComputedStyle(row).transform;
  if (transform === '' || transform === 'none') {
    return null;
  }
  const own = new view.DOMMatrix(transform);
  if (
    !own.is2D ||
    own.a !== 1 ||
    own.b !== 0 ||
    own.c !== 0 ||
    own.d !== 1 ||
    (own.e === 0 && own.f === 0)
  ) {
    return null;
  }
  const children = [...row.children].filter(
    (child): child is HTMLElement | SVGElement =>
      child instanceof view.HTMLElement || child instanceof view.SVGElement,
  );
  // Every transform is read before any is written. A translation composes
  // the same way whatever a child's transform origin.
  const transforms = children.map(
    child => view.getComputedStyle(child).transform,
  );
  const prior = [row, ...children].map(
    element =>
      [
        element,
        element.style.getPropertyValue('transform'),
        element.style.getPropertyPriority('transform'),
      ] as const,
  );
  row.style.setProperty('transform', 'none');
  children.forEach((child, index) => {
    const current = transforms[index];
    const shift = new view.DOMMatrix().translate(own.e, own.f);
    const moved =
      current === '' || current === 'none'
        ? shift
        : shift.multiply(new view.DOMMatrix(current));
    child.style.setProperty('transform', moved.toString());
  });
  return {row, prior};
}

/** Puts back what `settleTranslation` replaced on a row that stays. */
function unsettle({prior}: Settled): void {
  for (const [element, value, priority] of prior) {
    if (value === '') {
      element.style.removeProperty('transform');
    } else {
      element.style.setProperty('transform', value, priority);
    }
  }
}

/**
 * Marks each row that glides up across a row gliding down, for the length of
 * its glide (read once the module has started the glides, after the
 * commit's layout effects).
 */
function markCrossings(
  before: ReadonlyMap<string, RowBefore>,
  now: ReadonlyMap<string, HTMLElement>,
): void {
  const moves: {element: HTMLElement; from: number; to: number}[] = [];
  for (const [key, element] of now) {
    const row = before.get(key);
    if (row == null) {
      continue;
    }
    const to = element.getBoundingClientRect().top;
    if (Math.abs(to - row.top) >= MIN_MOVE_PX) {
      moves.push({element, from: row.top, to});
    }
  }
  const travelling = moves.filter(
    up =>
      up.to < up.from &&
      moves.some(
        down => down.to > down.from && down.from < up.from && down.to > up.to,
      ),
  );
  if (travelling.length === 0) {
    return;
  }
  for (const {element} of travelling) {
    element.setAttribute(TRAVELLING_ATTRIBUTE, '');
  }
  // After the module's own microtask has started the glides.
  queueMicrotask(() => {
    for (const {element} of travelling) {
      const glide =
        typeof element.getAnimations === 'function'
          ? element.getAnimations().at(-1)
          : undefined;
      if (glide == null) {
        element.removeAttribute(TRAVELLING_ATTRIBUTE);
        continue;
      }
      const end = () => element.removeAttribute(TRAVELLING_ATTRIBUTE);
      glide.finished.then(end, end);
    }
  });
}

/**
 * Reports the list's row changes to `animatedLayout` (`component:List`
 * FR12). Returns the callback that measures them, for LayoutChangeSnapshot
 * to call before each commit; its layout effect plays them after it.
 */
export function useListLayoutUpdates(
  listRef: RefObject<HTMLElement | null>,
  animatedLayout: AnimatedLayout | undefined,
): () => void {
  const measuredRef = useRef<Measured | null>(null);
  const measure = useCallback(() => {
    measuredRef.current = null;
    const list = listRef.current;
    if (
      list == null ||
      animatedLayout == null ||
      list.hasAttribute(REORDERING_ATTRIBUTE)
    ) {
      return;
    }
    const rows = keyedRows(list);
    if (rows.size === 0) {
      return;
    }
    const ordered = [...rows];
    const settled: Settled[] = [];
    for (const [, element] of ordered) {
      const done = settleTranslation(element);
      if (done != null) {
        settled.push(done);
      }
    }
    const before = new Map<string, RowBefore>();
    for (const [key, element] of ordered) {
      before.set(key, {element, top: element.getBoundingClientRect().top});
    }
    // The list (the content after it glides, and any row inside it can
    // exit), and its first and last rows, each of which carries the other
    // and every row between them.
    const targets: HTMLElement[] = [list, ordered[0][1]];
    if (ordered.length > 1) {
      targets.push(ordered[ordered.length - 1][1]);
    }
    const changes = targets.map(target => {
      const change = reportLayoutChange(animatedLayout, () => target);
      change.measureBefore();
      return change;
    });
    measuredRef.current = {
      rows: before,
      order: ordered.map(([key]) => key),
      changes,
      settled,
    };
  }, [animatedLayout, listRef]);

  // External systems (`architecture:react-component-runtime` INV3): the
  // shared size-change module's batch for the handle's area, measured before
  // this commit, which this plays; and the set of lists under a handle, which
  // a leaving row reads as it unmounts.
  useIsomorphicLayoutEffect(() => {
    const measured = measuredRef.current;
    measuredRef.current = null;
    const list = listRef.current;
    if (list != null) {
      if (animatedLayout != null) {
        animatedLists.add(list);
      } else {
        animatedLists.delete(list);
      }
    }
    if (measured == null || list == null || animatedLayout == null) {
      return;
    }
    const now = keyedRows(list);
    // A row that stays shows its translation on itself again; a row that
    // left exits settled (what it kept as it left already holds it).
    for (const done of measured.settled) {
      if (done.row.parentElement === list) {
        unsettle(done);
      }
    }
    const order = [...now.keys()];
    if (
      order.length === measured.order.length &&
      order.every((key, index) => key === measured.order[index])
    ) {
      // The same rows in the same order: nothing to play (the measurement
      // is dropped by the next frame).
      return;
    }
    // Each row that left comes back before the nearest later row in the
    // list: one pass from the end, a row put back being the next one's
    // anchor.
    const leaving: HTMLElement[] = [];
    let anchor: HTMLElement | null = null;
    for (let index = measured.order.length - 1; index >= 0; index--) {
      const key = measured.order[index];
      const staying = now.get(key);
      if (staying != null) {
        anchor = staying;
        continue;
      }
      const row = measured.rows.get(key);
      if (row != null) {
        putBack(row.element, list, anchor);
        leaving.push(row.element);
        anchor = row.element;
      }
    }
    for (const change of measured.changes) {
      change.animate();
    }
    for (const element of leaving) {
      if (!holdLayoutExit(animatedLayout, element, () => element.remove())) {
        // An exit the module does not hold (out of view, Reduce Motion with
        // a fine pointer): the row goes now, before this frame paints.
        element.remove();
      }
    }
    for (const [key, element] of now) {
      if (!measured.rows.has(key)) {
        playLayoutChange(animatedLayout, element);
      }
    }
    markCrossings(measured.rows, now);
  });

  return measure;
}
