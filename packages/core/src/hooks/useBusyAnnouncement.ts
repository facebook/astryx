// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useBusyAnnouncement.ts
 * @input Whether the task owner is busy, localized words, and an owner element ref
 * @output Once-per-busy-start delivery through the shared polite channel or a
 *   persistent in-dialog region, with pending delivery canceled on cleanup
 * @position Private AST-086 FR3/FR6/FR8 hook shared by busy task owners
 *
 * A composed Spinner is decorative: it is hidden and carries no live role.
 * The task owner announces once per busy start, not per rerender or StrictMode
 * replay. A native dialog retains closed children, so undelivered work waits
 * for it to open rather than consuming the occasion while hidden. Its region
 * is inserted empty and populated on a later frame, outside the inert body
 * channel. Settling re-arms the owner without clearing another owner's text.
 *
 * SYNC: deliberately NOT exported from /packages/core/src/hooks/index.ts —
 * this is a shared implementation detail of Astryx's busy controls.
 */

import {useEffect, useRef, type RefObject} from 'react';
import {useAnnounce} from './useAnnounce';

const REGION_ATTR = 'data-astryx-modal-busy-region';
const VISUALLY_HIDDEN_CSS =
  'position:absolute;width:1px;height:1px;margin:-1px;padding:0;' +
  'overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
const CLEAR_DELAY_MS = 2000; // Matches useAnnounce.

// A dialog shares one region. A newer write cancels the previous pending
// write/clear, and cleanup for an older owner cannot clear the newer message.
const pendingByRegion = new WeakMap<HTMLElement, () => void>();

function announceInModal(
  dialog: HTMLDialogElement,
  message: string,
  onDelivery: () => void,
): () => void {
  let region = dialog.querySelector<HTMLElement>(`:scope > [${REGION_ATTR}]`);
  if (region == null) {
    region = document.createElement('div');
    region.setAttribute(REGION_ATTR, '');
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.style.cssText = VISUALLY_HIDDEN_CSS;
    dialog.appendChild(region);
  }
  const target = region;
  pendingByRegion.get(target)?.();
  target.textContent = '';
  let timer: ReturnType<typeof setTimeout> | undefined;
  const frame = requestAnimationFrame(() => {
    if (!dialog.open) {
      return;
    }
    target.textContent = message;
    onDelivery();
    timer = setTimeout(cancel, CLEAR_DELAY_MS);
  });
  const cancel = () => {
    cancelAnimationFrame(frame);
    clearTimeout(timer);
    if (pendingByRegion.get(target) === cancel) {
      target.textContent = '';
      pendingByRegion.delete(target);
    }
  };
  pendingByRegion.set(target, cancel);
  return cancel;
}

export function useBusyAnnouncement(
  isBusy: boolean,
  message: string,
  elementRef: RefObject<Element | null>,
): void {
  const announce = useAnnounce();
  const hasAnnouncedRef = useRef(false);
  useEffect(() => {
    if (!isBusy) {
      hasAnnouncedRef.current = false;
      return;
    }
    if (hasAnnouncedRef.current) {
      return;
    }
    const dialog = elementRef.current?.closest('dialog');
    let frame: number | undefined;
    let cancelModal: (() => void) | undefined;
    const cancelPending = () => {
      if (frame != null) {
        cancelAnimationFrame(frame);
        frame = undefined;
      }
      cancelModal?.();
      cancelModal = undefined;
    };
    const scheduleWhenOpen = () => {
      if (hasAnnouncedRef.current) {
        return;
      }
      cancelPending();
      if (dialog != null && !dialog.open) {
        return;
      }
      // Dialog calls showModal() in its parent Effect. Preserve the deferred
      // route selection; a closed dialog never falls back to the body channel.
      frame = requestAnimationFrame(() => {
        frame = undefined;
        if (dialog != null) {
          if (!dialog.open) {
            return;
          }
          cancelModal = announceInModal(dialog, message, () => {
            hasAnnouncedRef.current = true;
            observer?.disconnect();
          });
        } else {
          hasAnnouncedRef.current = true;
          announce(message, 'polite');
        }
      });
    };
    // Observe only an undelivered occasion. Once delivered, close/reopen alone
    // is not another busy start. Cleanup also leaves canceled writes eligible
    // for StrictMode replay or a message change before delivery.
    const observer =
      dialog == null ? null : new MutationObserver(scheduleWhenOpen);
    if (dialog != null) {
      observer?.observe(dialog, {attributes: true, attributeFilter: ['open']});
    }
    scheduleWhenOpen();
    return () => {
      observer?.disconnect();
      cancelPending();
    };
  }, [announce, elementRef, isBusy, message]);
}
