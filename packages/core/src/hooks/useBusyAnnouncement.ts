// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useBusyAnnouncement.ts
 * @input Whether the owning control is busy, the words to announce, and a ref
 *   to an element inside the control
 * @output Announces each busy start once: through the shared polite channel,
 *   or through a persistent region inside the open native modal holding the
 *   control
 * @position Core a11y hook for controls that show a decorative busy Spinner
 *
 * A control that owns a task (a field validating, a selector loading its
 * options) shows a Spinner while busy. That Spinner is decorative: it is
 * hidden from assistive technology and carries no live role, and the owning
 * control announces its busy state instead (`spec:AST-086` FR8). A Spinner
 * that mounts as a live region already holding its name is often skipped, and
 * a busy control that also exposes `aria-busy` would otherwise have two owners
 * for the same feedback.
 *
 * The announcement is made once per busy start (`spec:AST-086` FR6): a
 * rerender, a StrictMode effect replay, or a change of words while still busy
 * does not repeat it. Settling re-arms it, so the next busy start speaks again.
 *
 * While a native modal dialog is open, the shared channel on the page body is
 * not exposed to assistive technology. A control inside the open modal
 * announces through one persistent polite region inside that dialog instead
 * (`spec:AST-086` Platform support, FR3): the region is inserted empty, filled
 * on the next frame, cleared shortly after, and stays for the dialog's
 * lifetime so later busy starts update it.
 *
 * SYNC: deliberately NOT exported from /packages/core/src/hooks/index.ts —
 * this is a shared implementation detail of Astryx's busy controls.
 */

import {useEffect, useRef, type RefObject} from 'react';
import {useAnnounce} from './useAnnounce';

const MODAL_REGION_ATTR = 'data-astryx-modal-busy-region';

// Same clip block as useAnnounce's regions, inline so no stylesheet is needed.
const VISUALLY_HIDDEN_CSS =
  'position:absolute;width:1px;height:1px;margin:-1px;padding:0;' +
  'overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;' +
  'pointer-events:none;user-select:none;';

// How long the words stay in the in-modal region, matching useAnnounce.
const CLEAR_DELAY_MS = 2000;

function openModalDialogOf(element: Element | null): HTMLDialogElement | null {
  const dialog = element?.closest('dialog') ?? null;
  if (dialog == null || !dialog.open) {
    return null;
  }
  try {
    return dialog.matches(':modal') ? dialog : null;
  } catch {
    // An engine that rejects `:modal`: treat an open dialog as modal, since
    // Astryx opens its dialogs with showModal().
    return dialog;
  }
}

function modalRegionOf(dialog: HTMLDialogElement): HTMLElement {
  const existing = dialog.querySelector<HTMLElement>(
    `:scope > [${MODAL_REGION_ATTR}]`,
  );
  if (existing != null) {
    return existing;
  }
  const region = document.createElement('div');
  region.setAttribute(MODAL_REGION_ATTR, '');
  region.setAttribute('role', 'status');
  region.setAttribute('aria-live', 'polite');
  region.setAttribute('aria-atomic', 'true');
  region.style.cssText = VISUALLY_HIDDEN_CSS;
  dialog.appendChild(region);
  return region;
}

function announceInModal(dialog: HTMLDialogElement, message: string): void {
  const region = modalRegionOf(dialog);
  region.textContent = '';
  // Written on the next frame so the region is never inserted holding text,
  // and a repeat of the same words is still observed as a change.
  requestAnimationFrame(() => {
    region.textContent = message;
    setTimeout(() => {
      if (region.textContent === message) {
        region.textContent = '';
      }
    }, CLEAR_DELAY_MS);
  });
}

export function useBusyAnnouncement(
  isBusy: boolean,
  message: string,
  elementRef: RefObject<Element | null>,
): void {
  const announce = useAnnounce();
  // Survives StrictMode's effect replay and rerenders, so only a new busy
  // start (busy again after settling) announces again.
  const hasAnnouncedRef = useRef(false);
  useEffect(() => {
    if (!isBusy) {
      hasAnnouncedRef.current = false;
      return;
    }
    if (hasAnnouncedRef.current) {
      return;
    }
    hasAnnouncedRef.current = true;
    const dialog = openModalDialogOf(elementRef.current);
    if (dialog != null) {
      announceInModal(dialog, message);
    } else {
      announce(message, 'polite');
    }
  }, [announce, elementRef, isBusy, message]);
}
