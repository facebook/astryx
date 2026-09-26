// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useDrawerDialogPresence.ts
 * @input Controlled open state, modal mode, dialog ref, and rendered-state setter
 * @output Coordinates native dialog presence, exit timing, focus restoration, and unmount cleanup
 * @position Drawer-internal hook; consumed only by Drawer.tsx
 *
 * The drawer has two independent notions of presence:
 * - React's rendered state keeps the panel visible for its CSS exit.
 * - The native <dialog> `open` state keeps it in the top layer.
 *
 * Their close ordering is a browser-visible invariant: the panel must finish
 * its exit, then `dialog.close()` and the React hide must happen in the same
 * task. If the hide lands a frame later, a transformed ancestor becomes the
 * containing block for the now-non-top-layer `position: fixed` panel and it
 * paints back inside the page for one frame.
 *
 * SYNC: When modified, update:
 * - /packages/lab/src/Drawer/Drawer.test.tsx
 * - /.github/scripts/modal-close-visibility.js
 */

import {
  useEffect,
  useRef,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react';
import {flushSync} from 'react-dom';

/** Slack past the computed transition before the backstop gives up waiting. */
const EXIT_BACKSTOP_BUFFER_MS = 50;

/**
 * Hold used when the transition duration cannot be read — an unresolved
 * `var()` outside a real browser. Picking a fixed number would otherwise make
 * an assumption about the consumer's theme.
 */
const EXIT_FALLBACK_MS = 250;

type UseDrawerDialogPresenceOptions = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  isOpen: boolean;
  isModal: boolean;
  setIsRendered: Dispatch<SetStateAction<boolean>>;
};

/**
 * Coordinates the native dialog and React-rendered presence for Drawer.
 *
 * Opening captures the trigger, opens the native dialog, and honours the
 * component's `data-autofocus` contract. Closing waits for the actual
 * transform transition (with a computed-duration backstop), then closes the
 * native dialog and synchronously hides the panel before the browser can paint
 * it outside the top layer. Unmount cleanup closes a dialog left open by React
 * Activity or a removed subtree.
 */
export function useDrawerDialogPresence({
  dialogRef,
  isOpen,
  isModal,
  setIsRendered,
}: UseDrawerDialogPresenceOptions): void {
  // Element focused when the drawer opened — restored on close.
  const triggerElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (isOpen) {
      if (!dialog.open) {
        triggerElementRef.current =
          document.activeElement as HTMLElement | null;
        if (isModal) {
          dialog.showModal();
        } else {
          dialog.show();
        }
        // React's autoFocus calls .focus() during commit, before the dialog is
        // shown, so it silently fails — honour data-autofocus instead (same
        // contract as Dialog).
        dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();
      }
      return;
    }

    if (!dialog.open) {
      return;
    }

    return waitForDrawerExit(dialog, () => {
      dialog.close();
      // flushSync, not a plain setState: React's default scheduling can land
      // the commit after the next paint, and that one frame is exactly the
      // bug — the panel paints outside the top layer. Both happen in this
      // task, so the browser never gets to paint between them.
      flushSync(() => {
        setIsRendered(false);
      });
      // Return focus after close(): a modal dialog makes the rest of the
      // document inert, so focusing the trigger before close() silently fails.
      triggerElementRef.current?.focus();
      triggerElementRef.current = null;
    });
  }, [dialogRef, isModal, isOpen, setIsRendered]);

  // Close the native dialog on unmount if it is still open. When the drawer is
  // mounted inside an <Activity> that flips to mode="hidden", React runs effect
  // cleanups (with stale isOpen) instead of re-running the effect with
  // isOpen=false. Leaving `open` set would skip showModal() on the next open.
  // This is deliberately separate from the open/close effect: putting it in
  // that cleanup would cut off every delayed slide-out.
  useEffect(() => {
    const dialog = dialogRef.current;
    return () => {
      if (dialog?.open) {
        dialog.close();
      }
    };
  }, [dialogRef]);
}

/**
 * Wait for the panel's transform transition, with a computed-duration
 * backstop. Mirrors BottomSheetPanel.waitForTransition: the native event is
 * authoritative, and the timeout only prevents a lost event from stranding an
 * open dialog.
 */
function waitForDrawerExit(
  element: HTMLDialogElement,
  complete: () => void,
): () => void {
  let done = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const finish = () => {
    if (done) {
      return;
    }
    done = true;
    if (timer != null) {
      clearTimeout(timer);
    }
    element.removeEventListener('transitionend', handleTransitionEnd);
    element.removeEventListener('transitioncancel', handleTransitionEnd);
    complete();
  };

  const handleTransitionEnd = (event: TransitionEvent) => {
    if (event.target === element && event.propertyName === 'transform') {
      finish();
    }
  };

  element.addEventListener('transitionend', handleTransitionEnd);
  element.addEventListener('transitioncancel', handleTransitionEnd);

  const transitionMs = readTransformTransitionMs(element);
  timer = setTimeout(
    finish,
    (transitionMs ?? EXIT_FALLBACK_MS) + EXIT_BACKSTOP_BUFFER_MS,
  );

  return () => {
    done = true;
    if (timer != null) {
      clearTimeout(timer);
    }
    element.removeEventListener('transitionend', handleTransitionEnd);
    element.removeEventListener('transitioncancel', handleTransitionEnd);
  };
}

/** Read the transform transition's duration + delay from computed CSS. */
function readTransformTransitionMs(element: HTMLElement): number | null {
  const computed = window.getComputedStyle(element);
  const properties = computed.transitionProperty
    .split(',')
    .map(value => value.trim());
  const durations = parseTimes(computed.transitionDuration);
  const delays = parseTimes(computed.transitionDelay);

  if (
    properties.length === 0 ||
    durations.length === 0 ||
    delays.length === 0 ||
    durations.includes(null) ||
    delays.includes(null)
  ) {
    return null;
  }

  return properties.reduce((longest, property, index) => {
    if (property !== 'transform' && property !== 'all') {
      return longest;
    }
    const duration = durations[index % durations.length];
    const delay = delays[index % delays.length];
    return Math.max(longest, (duration ?? 0) + (delay ?? 0));
  }, 0);
}

function parseTimes(value: string): Array<number | null> {
  return value.split(',').map(part => {
    const trimmed = part.trim();
    const time = Number.parseFloat(trimmed);
    if (!Number.isFinite(time)) {
      return null;
    }
    if (trimmed.endsWith('ms')) {
      return time;
    }
    return trimmed.endsWith('s') ? time * 1000 : null;
  });
}
