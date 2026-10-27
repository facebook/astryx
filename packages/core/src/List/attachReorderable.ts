// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file attachReorderable.ts
 * @input A reorderable object's options, a container, and its items (each
 *   item's key, element and handle), plus the List reorder's session
 *   (List/listReorderEngine.tsx)
 * @output `attachReorderable`: what `reorderable.attach(container, {items})`
 *   runs, the same drag, reorder mode and announcements as a reorderable
 *   List, on plain elements with no collection component
 * @position Internal to the reorder (spec:AST-103 FR4b): only the engine
 *   imports it, so it ships with createReorderable and nowhere else (FR2)
 *
 * The container's session is the List's: a `ListReorderController` over the
 * items' elements (not the container's children), configured outside React
 * with the shared announcer and the shipped strings. `attach`:
 *
 * - gives each item's handle FR4's role and toggle state (`aria-pressed`)
 *   and the name "Reorder" followed by the item element's accessible name,
 *   and hides the handle of an item `isReorderable` rejects;
 * - listens on the container only (FR5): its pointer drag and, where the
 *   primary pointer is coarse, its touch hold; and the handles' clicks, keys
 *   and blurs through the container, as List does through React;
 * - commits a move when `items()` reports the new order after `onReorder`:
 *   it watches the container's subtree for the change (one MutationObserver)
 *   and runs the session's commit, which announces the move and plays the
 *   drop; an order still unchanged at the end of that task is refused and
 *   announced, as in a List;
 * - and on `detach` removes every listener, observer and element it added
 *   and restores each handle's attributes.
 *
 * Creating or importing the object does no DOM work; `attach` is the first
 * that touches the document, so the object is safe on the server.
 *
 * SYNC: When modified, update List/listReorderEngine.tsx and
 * reorderable/createReorderable.ts.
 */

import type {Key} from 'react';
import {announce} from '../hooks/useAnnounce';
import {getResolve} from '../i18n/resolve';
import {isCoarsePointer, watchCoarsePointer} from '../gestures/coarsePointer';
import {devWarn} from '../utils/devWarning';
import {HANDLE_ATTRIBUTE, type ListReorderOptions} from './listReorderContext';
import {
  ListReorderController,
  messagesFrom,
  mountSession,
  setRowSource,
} from './listReorderEngine';

/** One item of an attached container, in order. */
export interface ReorderableItem<TKey extends Key = string | number> {
  /** The key `onReorder` reports for this item. */
  readonly key: TKey;
  /** The item's element: what moves, and what names its handle. */
  readonly element: HTMLElement;
  /** The element a drag starts from and reorder mode toggles on. */
  readonly handle: HTMLElement;
}

/** What `attach` takes besides the container. */
export interface ReorderableAttachOptions<TKey extends Key = string | number> {
  /** The container's items in their current order, read when needed. */
  readonly items: () => ReadonlyArray<ReorderableItem<TKey>>;
}

/** What `attach` returns. */
export interface ReorderableAttachment {
  /** Removes every listener, observer and element `attach` added. */
  detach(): void;
}

let attachments = 0;

/** Whether `element` takes the focus and Enter/Space without help. */
function isNativeButton(element: HTMLElement): boolean {
  return element instanceof HTMLButtonElement;
}

/**
 * An item element's accessible name, as far as the page states it: its
 * `aria-label`, the text of what its `aria-labelledby` names, or its own
 * text without its handle's.
 */
function accessibleNameOf(element: HTMLElement, handle: HTMLElement): string {
  const label = element.getAttribute('aria-label')?.trim();
  if (label) {
    return label;
  }
  const doc = element.ownerDocument;
  const labelledBy = element
    .getAttribute('aria-labelledby')
    ?.split(/\s+/)
    .map(id => doc.getElementById(id)?.textContent?.trim() ?? '')
    .filter(text => text !== '')
    .join(' ');
  if (labelledBy) {
    return labelledBy;
  }
  let text = '';
  const walker = doc.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node != null; node = walker.nextNode()) {
    if (!handle.contains(node)) {
      text += node.textContent ?? '';
    }
  }
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Attaches `options`' reorder to `container`'s items (spec:AST-103 FR4b).
 */
export function attachReorderable<TKey extends Key>(
  options: ListReorderOptions,
  container: HTMLElement,
  {items}: ReorderableAttachOptions<TKey>,
): ReorderableAttachment {
  const doc = container.ownerDocument;
  const view = doc.defaultView;
  if (view == null) {
    return {detach: () => {}};
  }
  attachments += 1;
  const hintId = `astryx-reorder-hint-${attachments}`;
  const locale =
    container.closest<HTMLElement>('[lang]')?.lang ||
    doc.documentElement.lang ||
    'en';
  const t = getResolve(locale, {});
  const controller = new ListReorderController(() => container, hintId);
  const elements = () => items().map(item => item.element);
  const removeRowSource = setRowSource(container, elements);
  const configure = (isCoarse: boolean) =>
    controller.configure({
      options,
      announce,
      messages: messagesFrom(t),
      presentation: isCoarse ? 'uikit' : 'theme',
    });

  // The handles' instructions, which each handle is described by.
  const instructions = doc.createElement('span');
  instructions.id = hintId;
  instructions.hidden = true;
  instructions.textContent = t('@astryx.list.reorderHint', undefined);
  doc.body.append(instructions);

  // Each handle's attributes before `attach` wrote any, and its removal.
  const handles = new Map<
    HTMLElement,
    {restore: Map<string, string | null>; unregister: () => void}
  >();

  const write = (handle: HTMLElement, name: string, value: string | null) => {
    const record = handles.get(handle);
    if (record != null && !record.restore.has(name)) {
      record.restore.set(name, handle.getAttribute(name));
    }
    if (value == null) {
      handle.removeAttribute(name);
    } else {
      handle.setAttribute(name, value);
    }
  };

  const release = (handle: HTMLElement) => {
    const record = handles.get(handle);
    if (record == null) {
      return;
    }
    record.unregister();
    for (const [name, value] of record.restore) {
      if (value == null) {
        handle.removeAttribute(name);
      } else {
        handle.setAttribute(name, value);
      }
    }
    handles.delete(handle);
  };

  const syncPressed = () => {
    for (const handle of handles.keys()) {
      if (!handle.hidden) {
        write(handle, 'aria-pressed', String(controller.isInMode(handle)));
      }
    }
  };

  /** Reads `items()` and brings the handles' records and attributes to it. */
  const sync = () => {
    const current = items();
    const seen = new Set<HTMLElement>();
    for (const [index, {key, element, handle}] of current.entries()) {
      seen.add(handle);
      if (!handles.has(handle)) {
        handles.set(handle, {restore: new Map(), unregister: () => {}});
      }
      const record = handles.get(handle);
      if (record == null) {
        continue;
      }
      record.unregister();
      const name = accessibleNameOf(element, handle);
      if (options.isReorderable?.(key) === false) {
        // A row that stays shows no handle (spec:AST-103 FR1, DEC-2) and
        // still names itself in the announcements beside it.
        record.unregister = controller.registerName(element, name);
        write(handle, 'hidden', '');
        write(handle, HANDLE_ATTRIBUTE, null);
        continue;
      }
      record.unregister = controller.registerHandle(handle, key, name);
      write(handle, 'hidden', null);
      write(handle, HANDLE_ATTRIBUTE, '');
      if (!isNativeButton(handle)) {
        write(handle, 'role', 'button');
        if (handle.tabIndex < 0 || !handle.hasAttribute('tabindex')) {
          write(handle, 'tabindex', '0');
        }
      }
      write(
        handle,
        'aria-label',
        name !== ''
          ? t('@astryx.list.reorderHandle', {label: name})
          : t('@astryx.list.reorderHandleAt', {position: index + 1}),
      );
      write(handle, 'aria-describedby', hintId);
    }
    for (const handle of [...handles.keys()]) {
      if (!seen.has(handle)) {
        release(handle);
      }
    }
    syncPressed();
  };

  configure(isCoarsePointer(view));
  sync();
  if (handles.size === 0) {
    devWarn(
      'createReorderable',
      '`attach` found no items: `items()` returned none, so nothing can move.',
    );
  }

  const handleOf = (target: EventTarget | null): HTMLElement | null => {
    if (!(target instanceof Element)) {
      return null;
    }
    for (const handle of handles.keys()) {
      if (!handle.hidden && handle.contains(target)) {
        return handle;
      }
    }
    return null;
  };

  const onClick = (event: MouseEvent) => {
    const handle = handleOf(event.target);
    if (handle != null && !controller.takeDrag(handle)) {
      controller.toggleMode(handle);
    }
  };
  const onKeyDown = (event: KeyboardEvent) => {
    const handle = handleOf(event.target);
    if (handle == null) {
      return;
    }
    // A handle that is not a button activates on Enter and Space as one
    // does (a button's own activation is its click).
    if (
      !isNativeButton(handle) &&
      (event.key === 'Enter' || event.key === ' ') &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey
    ) {
      event.preventDefault();
      controller.toggleMode(handle);
      return;
    }
    controller.keyDown(
      handle,
      event as unknown as Parameters<ListReorderController['keyDown']>[1],
    );
  };
  const onFocusOut = (event: FocusEvent) => {
    const handle = handleOf(event.target);
    if (handle != null) {
      controller.blur(handle, event.relatedTarget);
    }
  };
  container.addEventListener('click', onClick);
  container.addEventListener('keydown', onKeyDown);
  container.addEventListener('focusout', onFocusOut);

  const unsubscribeMode = controller.subscribeMode(syncPressed);
  const detachMouse = controller.attachMouse();
  let detachTouch = isCoarsePointer(view) ? controller.attachTouch() : null;
  const stopWatchingPointer = watchCoarsePointer(view, isCoarse => {
    configure(isCoarse);
    detachTouch?.();
    detachTouch = isCoarse ? controller.attachTouch() : null;
  });
  const unmount = mountSession(options, controller);

  // A move commits when `items()` reports the new order: the caller moving
  // the elements changes the container's subtree.
  const observer = new view.MutationObserver(() => {
    sync();
    controller.commit();
  });
  observer.observe(container, {childList: true, subtree: true});

  let isAttached = true;
  return {
    detach() {
      if (!isAttached) {
        return;
      }
      isAttached = false;
      observer.disconnect();
      unmount();
      stopWatchingPointer();
      detachTouch?.();
      detachMouse();
      unsubscribeMode();
      container.removeEventListener('click', onClick);
      container.removeEventListener('keydown', onKeyDown);
      container.removeEventListener('focusout', onFocusOut);
      controller.dispose();
      for (const handle of [...handles.keys()]) {
        release(handle);
      }
      removeRowSource();
      instructions.remove();
    },
  };
}
