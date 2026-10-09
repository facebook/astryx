// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file modalOutlet.ts
 * @input The open Dialog `<dialog>` elements
 * @output Exports useModalOutlet (a modal supplies its outlet),
 *   getActiveModalOutlet, and subscribeModalOutlets (a global host follows
 *   the latest one)
 * @position Private layer infrastructure; spec:AST-003 FR18
 *
 * A native modal makes everything outside it inert and paints over every
 * earlier top-layer element. A passive global host (ToastViewport) therefore
 * has to live in the DOM of the latest open modal to stay visible and
 * operable. The registry is module-level because the top layer is
 * document-wide: a host rendered in a separate React root (the useToast
 * fallback) must see modals rendered by the app. Listeners run synchronously,
 * so a host can leave a modal before React removes it from the document.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Toast/ToastViewport.modalHost.test.tsx
 * - /docs/architecture/layer-runtime.md
 */

import {useEffect, useLayoutEffect, type RefObject} from 'react';

const outlets: HTMLDialogElement[] = [];
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

function addOutlet(element: HTMLDialogElement): void {
  const index = outlets.indexOf(element);
  if (index !== -1) {
    outlets.splice(index, 1);
  }
  outlets.push(element);
  notify();
}

function removeOutlet(element: HTMLDialogElement): void {
  const index = outlets.indexOf(element);
  if (index === -1) {
    return;
  }
  outlets.splice(index, 1);
  notify();
}

/** The latest open native modal, or null when none is open. */
export function getActiveModalOutlet(): HTMLDialogElement | null {
  return outlets[outlets.length - 1] ?? null;
}

/** Call `listener` whenever the latest open native modal may have changed. */
export function subscribeModalOutlets(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Supply `ref`'s `<dialog>` as the passive global outlet while it is an open
 * modal. Call it after the effect that runs `showModal()`, so the modal is
 * already in the top layer when global hosts move into it.
 */
export function useModalOutlet(
  ref: RefObject<HTMLDialogElement | null>,
  isActive: boolean,
): void {
  useEffect(() => {
    const element = ref.current;
    if (!isActive || element == null) {
      return;
    }
    // A native close (a `method="dialog"` form) ends the modal without a
    // render.
    const handleClose = () => {
      removeOutlet(element);
    };
    element.addEventListener('close', handleClose);
    addOutlet(element);
    return () => {
      element.removeEventListener('close', handleClose);
      removeOutlet(element);
    };
  }, [ref, isActive]);

  // Unmounting removes the dialog without a close event, and a passive
  // cleanup runs after React has detached it. A layout cleanup runs before,
  // so hosts leave while still in the document and keep their focus.
  useLayoutEffect(() => {
    const element = ref.current;
    return () => {
      if (element != null) {
        removeOutlet(element);
      }
    };
  }, [ref]);
}
