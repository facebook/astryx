// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file listItemSlotMotion.tsx
 * @input A ListItem's row element, its List's `animatedLayout` handle (from
 *   List's context) and its start and end content
 * @output `useListItemSlotMotion`: the row reports a change to its start or
 *   end content to the handle (`component:List` FR12): content that appears
 *   enters, content that leaves exits, inert and hidden from assistive
 *   technology, content replaced in the same slot swaps in place
 *   (`spec:AST-105` FR4, FR8), and the row's other content (and the rows
 *   after it, when the row's height changes) glides. A same-size
 *   replacement does not animate; a leaving slot that sets the row's height
 *   hides at once (`holdLayoutExit`). A leaving control that held focus
 *   hands it to the row's focus target without scrolling.
 * @position List internals; ListItem renders the snapshot this returns.
 *   The motion itself is the shared module's (motion/animatedLayout.ts).
 */

import {useCallback, useRef, type ReactNode, type RefObject} from 'react';
import {isValidElement} from 'react';
import type {AnimatedLayout} from '../hooks/useAnimatedLayout';
import {LayoutChangeSnapshot} from '../motion/LayoutChangeSnapshot';
import {
  holdLayoutExit,
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

/**
 * What a slot shows, as an identity that changes only when its content is
 * replaced: the element's type and key (a re-render of the same control, a
 * Checkbox toggling, keeps it), or the text itself. Null for an empty slot.
 */
function identityOf(node: ReactNode): string | null {
  // Item wraps any content but null and undefined in the slot.
  if (node == null) {
    return null;
  }
  if (typeof node === 'boolean') {
    return `bool:${node}`;
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return `text:${node}`;
  }
  if (isValidElement(node)) {
    const {type} = node;
    let id: string;
    if (typeof type === 'string') {
      id = type;
    } else if (typeof type === 'symbol') {
      // Fragment, Suspense and the like: a symbol, never a WeakMap key.
      id = String(type);
    } else {
      const known = typeIds.get(type as object);
      const assigned = known ?? nextTypeId++;
      if (known == null) {
        typeIds.set(type as object, assigned);
      }
      id = `#${assigned}`;
    }
    return `${id}:${node.key ?? ''}`;
  }
  return 'node';
}

/** The slot's live wrapper: never a leaving one, nor a swap's copy (inert). */
function slotOf(row: Element, slot: Slot): HTMLElement | null {
  return row.querySelector<HTMLElement>(
    `:scope > [${SLOT_ATTRIBUTE}="${slot}"]:not([inert])`,
  );
}

interface PendingSlot {
  readonly slot: Slot;
  readonly kind: 'enter' | 'exit' | 'swap';
  /** The leaving or replaced content's wrapper, as it was. */
  readonly element: HTMLElement | null;
  /** The sibling it sat before, to put a leaving wrapper back. */
  readonly next: Node | null;
  readonly swap: LayoutSwap | null;
  readonly hadFocus: boolean;
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
  const identities = {
    start: identityOf(startContent),
    end: identityOf(endContent),
  };
  const nextRef = useRef(identities);
  nextRef.current = identities;
  const shownRef = useRef(identities);
  const pendingRef = useRef<Pending | null>(null);

  const measure = useCallback(() => {
    pendingRef.current = null;
    const row = rowRef.current;
    if (row == null || animatedLayout == null) {
      return;
    }
    const active = row.ownerDocument.activeElement;
    const slots: PendingSlot[] = [];
    for (const slot of SLOTS) {
      const was = shownRef.current[slot];
      const will = nextRef.current[slot];
      if (was === will) {
        continue;
      }
      const element = slotOf(row, slot);
      const kind = was == null ? 'enter' : will == null ? 'exit' : 'swap';
      slots.push({
        slot,
        kind,
        element,
        next: element?.nextSibling ?? null,
        swap:
          kind === 'swap' && element != null
            ? holdLayoutSwap(animatedLayout, element)
            : null,
        hadFocus: element != null && active != null && element.contains(active),
      });
    }
    if (slots.length === 0) {
      return;
    }
    // A leaving or replaced slot reports itself, so its exit is a measured
    // one (holdLayoutExit) and its walk carries the row's other parts and
    // the rows after it. Content that appears has no element yet: it is
    // reported from inside the row's main content (its label), whose walk
    // carries the content itself (the label's ancestor) and the other slot.
    const targets = new Set<Element>();
    for (const {kind, element} of slots) {
      if (kind !== 'enter' && element != null) {
        targets.add(element);
        continue;
      }
      const content = [...row.children].find(
        child =>
          !child.hasAttribute(SLOT_ATTRIBUTE) && child.textContent !== '',
      );
      targets.add(content?.firstElementChild ?? content ?? row);
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
    // A leaving wrapper comes back where it was, for its exit.
    const leaving: HTMLElement[] = [];
    for (const {kind, element, next} of pending.slots) {
      if (kind !== 'exit' || element == null || element.isConnected) {
        continue;
      }
      row.insertBefore(element, next?.parentNode === row ? next : null);
      element.setAttribute('aria-hidden', 'true');
      element.inert = true;
      leaving.push(element);
    }
    for (const change of pending.changes) {
      change.animate();
    }
    for (const element of leaving) {
      if (!holdLayoutExit(animatedLayout, element, () => element.remove())) {
        // An exit the module does not hold (out of view, Reduce Motion with
        // a fine pointer, a slot that sets the row's height): it goes now,
        // before this frame paints.
        element.remove();
      }
    }
    for (const {slot, kind, swap, hadFocus} of pending.slots) {
      const shown = slotOf(row, slot);
      if (kind === 'enter' && shown != null) {
        playLayoutChange(animatedLayout, shown);
      }
      if (kind === 'swap' && swap != null && shown != null) {
        const box = shown.getBoundingClientRect();
        const isSameSize =
          Math.abs(box.width - swap.rect.width) < 0.5 &&
          Math.abs(box.height - swap.rect.height) < 0.5;
        if (!isSameSize) {
          playLayoutSwap(swap, {
            host: row,
            copy: p => ({opacity: 1 - p}),
            incoming: [{element: shown, frames: p => ({opacity: p})}],
          });
        }
      }
      if (hadFocus) {
        focusRow(row);
      }
    }
  });

  return (
    <LayoutChangeSnapshot
      value={`${identities.start ?? ''}|${identities.end ?? ''}`}
      onBeforeChange={measure}
    />
  );
}
