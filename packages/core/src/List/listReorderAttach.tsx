// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file listReorderAttach.tsx
 * @input A reorderable object's options, a container of plain elements and
 *   its `items()`, and List's reorder machinery (List/listReorderEngine.tsx:
 *   the session, its strings and its hint)
 * @output `attachReorder`, the work behind createReorderable's `attach`: the
 *   container's items reorder as a List's rows do, with no collection
 *   component (spec:AST-103 FR4b)
 * @position List internals; reorderable/createReorderable.ts runs it.
 *   Nothing happens until it runs: creating or importing the object does no
 *   DOM work
 *
 * Each reorderable item's handle becomes reorder mode's toggle: a button
 * named "Reorder" and the item's name (its element's accessible name, else
 * its text), pressed while its item is in reorder mode, in the Tab order. The
 * container gets the drag and reorder mode of List's session. A move commits
 * once `items()` reports the new order after `onReorder`: a change to the
 * container's children, or the end of the task. Announcements go to a polite
 * container this attach owns, inside the modal dialog that encloses the
 * container when one does (`spec:AST-086` FR14), in the shipped English
 * catalog (`architecture:internationalization` INV3). `detach` ends a drag or
 * reorder mode calling nothing, removes every listener, observer and element
 * it added, and restores each handle's own attributes.
 *
 * SYNC: When modified, update reorderable/createReorderable.ts and
 * reorderable/createReorderable.doc.mjs.
 */

import {createRoot} from 'react-dom/client';
import {getResolve} from '../i18n/resolve';
import {devWarn} from '../utils/devWarning';
import {HANDLE_ATTRIBUTE, type ListReorderOptions} from './listReorderContext';
import {
  ListReorderController,
  ListReorderModeHint,
  messagesFrom,
  mountSession,
} from './listReorderEngine';

/** One attached item: its key, its element, and the handle that moves it. */
export interface AttachedItem {
  /** The key its moves report; an item without one cannot move. */
  readonly key?: string | number | null;
  readonly element: HTMLElement;
  readonly handle: HTMLElement;
}

/** The handle attributes attach writes, put back as they were by `detach`. */
const HANDLE_ATTRIBUTES = [
  'role',
  'aria-pressed',
  'aria-label',
  'aria-labelledby',
  'aria-describedby',
  'tabindex',
  HANDLE_ATTRIBUTE,
] as const;

/** Visually hidden, read by assistive technology. */
const HIDDEN_STYLE =
  'position:absolute;width:1px;height:1px;margin:-1px;padding:0;' +
  'overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0';

let attachedCount = 0;

/** What an attached item is called: its accessible name, else its text. */
function nameOf(element: HTMLElement): string {
  const label = element.getAttribute('aria-label')?.trim();
  if (label != null && label !== '') {
    return label;
  }
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy != null) {
    const text = labelledBy
      .split(/\s+/)
      .map(id => element.ownerDocument.getElementById(id)?.textContent ?? '')
      .join(' ')
      .trim();
    if (text !== '') {
      return text;
    }
  }
  return element.textContent?.trim() ?? '';
}

/** A native control activates on Enter and Space by itself. */
function isNativeControl(element: HTMLElement): boolean {
  return (
    element instanceof HTMLButtonElement || element instanceof HTMLInputElement
  );
}

/**
 * Attaches `options`' reorder to `container`'s items (spec:AST-103 FR4b);
 * returns its `detach`.
 */
export function attachReorder(
  options: ListReorderOptions,
  container: HTMLElement,
  items: () => ReadonlyArray<AttachedItem>,
): {detach: () => void} {
  const doc = container.ownerDocument;
  const translate = getResolve('en', {});
  attachedCount += 1;
  const hintId = `astryx-reorder-attached-${attachedCount}`;
  const controller = new ListReorderController(
    () => container,
    hintId,
    () => items().map(item => item.element),
  );
  // Inside the modal dialog that encloses the container, where assistive
  // technology still reads (spec:AST-086 FR14); else the document's body.
  const host =
    container.closest<HTMLElement>(
      'dialog[open], [role="dialog"][aria-modal="true"]',
    ) ?? doc.body;
  const live = doc.createElement('div');
  live.setAttribute('role', 'status');
  live.setAttribute('aria-live', 'polite');
  live.setAttribute('style', HIDDEN_STYLE);
  const instructions = doc.createElement('span');
  instructions.id = hintId;
  instructions.hidden = true;
  instructions.textContent = translate('@astryx.list.reorderHint', undefined);
  host.append(live, instructions);
  let announceTimer: ReturnType<typeof setTimeout> | null = null;
  const announce = (message: string) => {
    // Emptied first, so the same text twice is read twice.
    live.textContent = '';
    if (announceTimer != null) {
      clearTimeout(announceTimer);
    }
    announceTimer = setTimeout(() => {
      announceTimer = null;
      live.textContent = message;
    }, 0);
  };
  let commitQueued = false;
  // A move commits once items() reports the new order: right after
  // onReorder returns, or when the container's children change.
  const queueCommit = () => {
    if (commitQueued) {
      return;
    }
    commitQueued = true;
    queueMicrotask(() => {
      commitQueued = false;
      if (!isAttached) {
        return;
      }
      wire();
      controller.commit();
    });
  };
  const sessionOptions: ListReorderOptions = {
    ...options,
    onReorder: move => {
      options.onReorder(move);
      queueCommit();
    },
  };
  const isCoarse =
    doc.defaultView?.matchMedia?.('(pointer: coarse)').matches ?? false;
  controller.configure({
    options: sessionOptions,
    announce,
    messages: messagesFrom(translate),
    presentation: isCoarse ? 'uikit' : 'theme',
  });

  // --- Handles -----------------------------------------------------------

  const wired = new Map<HTMLElement, () => void>();
  let warnedUnnamed = false;
  const wireHandle = (
    handle: HTMLElement,
    key: string | number,
    element: HTMLElement,
  ) => {
    const saved = HANDLE_ATTRIBUTES.map(
      name => [name, handle.getAttribute(name)] as const,
    );
    const savedTouchAction = handle.style.touchAction;
    const name = nameOf(element);
    if (name === '' && !warnedUnnamed) {
      warnedUnnamed = true;
      devWarn(
        'createReorderable',
        '`attach`: an item has no accessible name and no text, so its ' +
          'handle and announcements cannot name it.',
      );
    }
    handle.setAttribute('role', 'button');
    handle.setAttribute('aria-pressed', String(controller.isInMode(handle)));
    handle.setAttribute(
      'aria-label',
      translate('@astryx.list.reorderHandle', {label: name}),
    );
    handle.removeAttribute('aria-labelledby');
    handle.setAttribute('aria-describedby', hintId);
    handle.setAttribute('tabindex', '0');
    handle.setAttribute(HANDLE_ATTRIBUTE, '');
    // Where the primary pointer is coarse the page keeps its pan until the
    // hold claims the finger (a flick scrolls); where it is fine, no pan, so
    // a pen drags the item at once (spec:AST-094 FR18, FR43).
    handle.style.touchAction = isCoarse ? 'manipulation' : 'none';
    const unregister = controller.registerHandle(handle, key, name);
    const onClick = () => {
      if (!controller.takeDrag(handle)) {
        controller.toggleMode(handle);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      // A button's Enter and Space, for a handle that is not one.
      if (
        !isNativeControl(handle) &&
        (event.key === 'Enter' || event.key === ' ') &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey
      ) {
        event.preventDefault();
        controller.toggleMode(handle);
        return;
      }
      controller.keyDown(handle, event);
    };
    const onFocusOut = (event: FocusEvent) => {
      controller.blur(handle, event.relatedTarget);
    };
    handle.addEventListener('click', onClick);
    handle.addEventListener('keydown', onKeyDown);
    handle.addEventListener('focusout', onFocusOut);
    wired.set(handle, () => {
      unregister();
      handle.removeEventListener('click', onClick);
      handle.removeEventListener('keydown', onKeyDown);
      handle.removeEventListener('focusout', onFocusOut);
      for (const [attribute, value] of saved) {
        if (value == null) {
          handle.removeAttribute(attribute);
        } else {
          handle.setAttribute(attribute, value);
        }
      }
      handle.style.touchAction = savedTouchAction;
      if (handle.getAttribute('style') === '') {
        handle.removeAttribute('style');
      }
    });
  };
  // Wires each reorderable item's handle and unwires the handles of items
  // that left or stopped being reorderable.
  const wire = () => {
    const kept = new Set<HTMLElement>();
    for (const {key, element, handle} of items()) {
      if (key == null || sessionOptions.isReorderable?.(key) === false) {
        continue;
      }
      kept.add(handle);
      if (!wired.has(handle)) {
        wireHandle(handle, key, element);
      }
    }
    for (const [handle, unwire] of [...wired]) {
      if (!kept.has(handle)) {
        unwire();
        wired.delete(handle);
      }
    }
  };
  let isAttached = true;
  wire();
  const unsubscribe = controller.subscribeMode(() => {
    for (const handle of wired.keys()) {
      handle.setAttribute('aria-pressed', String(controller.isInMode(handle)));
    }
  });

  // --- Listeners, the hint, `start` ----------------------------------------

  // Every pointer (spec:AST-094 FR43): a mouse, and a pen where the primary
  // pointer is fine, drag at once; a finger, and a pen where it is coarse,
  // hold first.
  const detachMouse = controller.attachMouse(!isCoarse);
  const detachTouch = controller.attachTouch(isCoarse);
  // `start(key)` reaches this container's items (FR4a), the latest attached.
  const unmountSession = mountSession(options, controller);
  const observer = new MutationObserver(queueCommit);
  observer.observe(container, {childList: true});
  // Reorder mode's hint: an element this attach owns, rendered as a List's.
  const hintHost = doc.createElement('div');
  host.append(hintHost);
  const root = createRoot(hintHost);
  root.render(<ListReorderModeHint controller={controller} />);

  return {
    detach: () => {
      if (!isAttached) {
        return;
      }
      isAttached = false;
      controller.dispose();
      observer.disconnect();
      unsubscribe();
      detachMouse();
      detachTouch();
      unmountSession();
      for (const unwire of wired.values()) {
        unwire();
      }
      wired.clear();
      if (announceTimer != null) {
        clearTimeout(announceTimer);
      }
      root.unmount();
      hintHost.remove();
      live.remove();
      instructions.remove();
    },
  };
}
