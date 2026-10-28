// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file listItemSlotMotion.tsx
 * @input A ListItem's row element, its List's `animatedLayout` handle (from
 *   List's context) and its start and end content
 * @output `useListItemSlotMotion`: the row reports a change to its start or
 *   end content to the handle (`component:List` FR12): content that appears
 *   enters, content that leaves exits in place as an inert copy hidden from
 *   assistive technology, content replaced in the same slot swaps in place
 *   (`spec:AST-105` FR4, FR8), content that changes size in place is
 *   reported too, and the row's other content (and the rows after it, when
 *   the row's height changes) glides. A change at the same size moves
 *   nothing; a leaving slot that sets the row's height hides at once, and
 *   the rest of the row and the rows after it take their places at once. A
 *   leaving control that held focus hands it to the row's focus target
 *   without scrolling.
 * @position List internals; ListItem renders the snapshot this returns.
 *   The motion itself is the shared module's (motion/animatedLayout.ts).
 */

import {useCallback, useRef, type ReactNode, type RefObject} from 'react';
import {isValidElement} from 'react';
import type {AnimatedLayout} from '../hooks/useAnimatedLayout';
import {LayoutChangeSnapshot} from '../motion/LayoutChangeSnapshot';
import {
  holdLayoutSwap,
  playLayoutChange,
  playLayoutSwap,
  reportLayoutChange,
  type LayoutChange,
  type LayoutSwap,
} from '../motion/animatedLayout';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';

/** On Item's start and end content wrappers: `start` or `end`. */
export const SLOT_ATTRIBUTE = 'data-astryx-item-slot';

type Slot = 'start' | 'end';
const SLOTS: ReadonlyArray<Slot> = ['start', 'end'];

/** A number per component type, so two types never share an identity. */
const typeIds = new WeakMap<object, number>();
let nextTypeId = 1;

function typeIdOf(type: unknown): string {
  if (typeof type === 'string') {
    return type;
  }
  if (typeof type === 'symbol') {
    // Fragment, Suspense and the like: a symbol, never a WeakMap key.
    return String(type);
  }
  if (
    (typeof type === 'object' && type !== null) ||
    typeof type === 'function'
  ) {
    const known = typeIds.get(type);
    if (known != null) {
      return `#${known}`;
    }
    const assigned = nextTypeId++;
    typeIds.set(type, assigned);
    return `#${assigned}`;
  }
  return 'type';
}

/**
 * What a slot shows, as an identity that changes only when its content is
 * replaced: the element's type and key, or the text itself. Null for a slot
 * that shows nothing: null, undefined, or a boolean (`condition &&
 * control`), which Item may still wrap in an empty box.
 */
function identityOf(node: ReactNode): string | null {
  if (node == null || typeof node === 'boolean') {
    return null;
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return `text:${node}`;
  }
  if (isValidElement(node)) {
    return `${typeIdOf(node.type)}:${node.key ?? ''}`;
  }
  return 'node';
}

/**
 * What a slot shows down to its props: its identity, then every prop that is
 * not a function (handlers are new each render), its children included, a
 * few levels deep. A change here may change the slot's size, so the row
 * measures it; one that does not moves nothing.
 */
function contentOf(node: ReactNode, depth = 0): string {
  if (Array.isArray(node)) {
    return `[${node.map(child => contentOf(child as ReactNode, depth)).join(',')}]`;
  }
  const identity = identityOf(node) ?? '';
  if (!isValidElement(node) || depth > 3) {
    return identity;
  }
  const props = node.props as Record<string, unknown>;
  const parts = Object.keys(props)
    .sort()
    .flatMap(name => {
      const value = props[name];
      if (typeof value === 'function') {
        return [];
      }
      if (
        name === 'children' ||
        isValidElement(value) ||
        Array.isArray(value)
      ) {
        return [`${name}=${contentOf(value as ReactNode, depth + 1)}`];
      }
      if (
        value === null ||
        ['string', 'number', 'boolean', 'undefined'].includes(typeof value)
      ) {
        return [`${name}=${String(value)}`];
      }
      // An object or a ref: it has no say in the slot's size we can read.
      return [];
    });
  return `${identity}{${parts.join(';')}}`;
}

/** The slot's live wrapper: never a swap's copy (inert). */
function slotOf(row: Element, slot: Slot): HTMLElement | null {
  return row.querySelector<HTMLElement>(
    `:scope > [${SLOT_ATTRIBUTE}="${slot}"]:not([inert])`,
  );
}

/**
 * Whether a slot is what makes its row as tall as it is: the row's content
 * box is no taller than the slot, and every other part of the row is
 * shorter. Without it, the row would shrink at once when it goes.
 */
function setsRowHeight(slot: HTMLElement, row: HTMLElement): boolean {
  const view = row.ownerDocument.defaultView;
  if (view == null) {
    return false;
  }
  const outer = (box: Element) => {
    const style = view.getComputedStyle(box);
    return (
      box.getBoundingClientRect().height +
      (Number.parseFloat(style.marginBlockStart) || 0) +
      (Number.parseFloat(style.marginBlockEnd) || 0)
    );
  };
  const rowStyle = view.getComputedStyle(row);
  const content =
    row.getBoundingClientRect().height -
    (Number.parseFloat(rowStyle.paddingBlockStart) || 0) -
    (Number.parseFloat(rowStyle.paddingBlockEnd) || 0) -
    (Number.parseFloat(rowStyle.borderBlockStartWidth) || 0) -
    (Number.parseFloat(rowStyle.borderBlockEndWidth) || 0);
  const others = [...row.children].filter(part => {
    if (part === slot) {
      return false;
    }
    const {position} = view.getComputedStyle(part);
    return position !== 'absolute' && position !== 'fixed';
  });
  const tallestOther = Math.max(0, ...others.map(outer));
  return outer(slot) >= content - 0.5 && tallestOther < content - 0.5;
}

type Kind = 'enter' | 'exit' | 'swap' | 'resize';

interface PendingSlot {
  readonly slot: Slot;
  readonly kind: Kind;
  /** The leaving or replaced content as one inert copy, to play out. */
  readonly swap: LayoutSwap | null;
  /** The focused element inside the slot, if any, before the change. */
  readonly focused: Element | null;
}

interface Pending {
  readonly changes: ReadonlyArray<LayoutChange>;
  readonly slots: ReadonlyArray<PendingSlot>;
}

/**
 * The row's focus target: its own button or link (Item's invisible control),
 * or the row itself, which takes focus programmatically for the handoff.
 */
function focusRow(row: HTMLElement): void {
  const target = [...row.children].find(
    child =>
      !child.hasAttribute(SLOT_ATTRIBUTE) &&
      child.matches('button, a[href], [data-astryx-row-link]'),
  );
  if (target instanceof HTMLElement) {
    target.focus({preventScroll: true});
    return;
  }
  if (!row.hasAttribute('tabindex')) {
    row.tabIndex = -1;
    row.addEventListener('blur', () => row.removeAttribute('tabindex'), {
      once: true,
    });
  }
  row.focus({preventScroll: true});
}

/** Inside the row's main content (its label), never a slot. */
function contentTarget(row: HTMLElement): Element {
  const content = [...row.children].find(
    child => !child.hasAttribute(SLOT_ATTRIBUTE) && child.textContent !== '',
  );
  return content?.firstElementChild ?? content ?? row;
}

/**
 * Reports the row's start and end content changes to `animatedLayout`.
 * Returns the snapshot element the row renders, which measures each change
 * in the commit, before the DOM changes.
 */
export function useListItemSlotMotion(
  rowRef: RefObject<HTMLElement | null>,
  animatedLayout: AnimatedLayout | null | undefined,
  startContent: ReactNode,
  endContent: ReactNode,
): ReactNode {
  const shown = {
    start: {
      identity: identityOf(startContent),
      content: contentOf(startContent),
    },
    end: {identity: identityOf(endContent), content: contentOf(endContent)},
  };
  const nextRef = useRef(shown);
  nextRef.current = shown;
  const shownRef = useRef(shown);
  const pendingRef = useRef<Pending | null>(null);

  const measure = useCallback(() => {
    pendingRef.current = null;
    const row = rowRef.current;
    if (row == null || animatedLayout == null) {
      return;
    }
    const active = row.ownerDocument.activeElement;
    const slots: PendingSlot[] = [];
    // What each change is reported from. A replaced or resized slot keeps
    // its wrapper, so it reports itself; content that appears or leaves has
    // no wrapper on one side of the change, so it reports from inside the
    // row's main content, whose walk carries the content itself (as the
    // label's ancestor), the other slot, and the rows after the row.
    const targets = new Set<Element>();
    for (const slot of SLOTS) {
      const was = shownRef.current[slot];
      const will = nextRef.current[slot];
      if (was.content === will.content) {
        continue;
      }
      const element = slotOf(row, slot);
      const kind: Kind =
        was.identity == null
          ? 'enter'
          : will.identity == null
            ? 'exit'
            : was.identity !== will.identity
              ? 'swap'
              : 'resize';
      const focused =
        element != null && active != null && element.contains(active)
          ? active
          : null;
      if (kind === 'exit' && element != null && setsRowHeight(element, row)) {
        // It hides at once, and the row and the rows after it take their
        // places at once: nothing is reported for it.
        slots.push({slot, kind, swap: null, focused});
        continue;
      }
      slots.push({
        slot,
        kind,
        swap:
          (kind === 'exit' || kind === 'swap') && element != null
            ? holdLayoutSwap(animatedLayout, element)
            : null,
        focused,
      });
      targets.add(
        (kind === 'swap' || kind === 'resize') && element != null
          ? element
          : contentTarget(row),
      );
    }
    if (slots.length === 0) {
      return;
    }
    const changes = [...targets].map(target => {
      const change = reportLayoutChange(animatedLayout, () => target);
      change.measureBefore();
      return change;
    });
    pendingRef.current = {changes, slots};
  }, [animatedLayout, rowRef]);

  // External system (`architecture:react-component-runtime` INV3): the
  // shared size-change module's batch for the handle's area, measured before
  // this commit; this plays it.
  useIsomorphicLayoutEffect(() => {
    shownRef.current = nextRef.current;
    const pending = pendingRef.current;
    pendingRef.current = null;
    const row = rowRef.current;
    if (pending == null || row == null || animatedLayout == null) {
      return;
    }
    for (const change of pending.changes) {
      change.animate();
    }
    for (const {slot, kind, swap, focused} of pending.slots) {
      const live = slotOf(row, slot);
      if (kind === 'enter' && live != null) {
        playLayoutChange(animatedLayout, live);
      }
      if (kind === 'exit' && swap != null) {
        // The leaving content plays out where it was, an inert copy over its
        // old box, while the row's other content glides into its space.
        playLayoutSwap(swap, {
          host: row,
          copy: p => ({opacity: 1 - p}),
          incoming: [],
        });
      }
      if (kind === 'swap' && swap != null && live != null) {
        const box = live.getBoundingClientRect();
        const isSameSize =
          Math.abs(box.width - swap.rect.width) < 0.5 &&
          Math.abs(box.height - swap.rect.height) < 0.5;
        if (!isSameSize) {
          playLayoutSwap(swap, {
            host: row,
            copy: p => ({opacity: 1 - p}),
            incoming: [{element: live, frames: p => ({opacity: p})}],
          });
        }
      }
      // Only a control that left hands its focus on: one that stays (a
      // Checkbox toggling, a control resizing) keeps it.
      if (focused != null && !focused.isConnected) {
        focusRow(row);
      }
    }
  });

  return (
    <LayoutChangeSnapshot
      value={`${shown.start.content}|${shown.end.content}`}
      onBeforeChange={measure}
    />
  );
}
