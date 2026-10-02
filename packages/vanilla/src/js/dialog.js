// Copyright (c) Meta Platforms, Inc. and affiliates.
/* global Element, HTMLDialogElement, HTMLElement, queueMicrotask */

import {dispatchAstryx, elementsMatching, ensureID} from './utils.js';

const dialogDocuments = new WeakSet();
const dialogOpeners = new WeakMap();

function getDialog(doc, value) {
  if (!value) return null;
  const dialog = doc.getElementById(value);
  return dialog instanceof HTMLDialogElement ? dialog : null;
}

function focusDialog(dialog) {
  const target = dialog.querySelector(
    '[data-ax-dialog-initial-focus], [autofocus], .ax-dialog__title',
  );
  if (!(target instanceof HTMLElement)) return;
  if (
    !target.hasAttribute('tabindex') &&
    !target.matches('button, input, select, textarea, a[href]')
  ) {
    target.tabIndex = -1;
  }
  target.focus({preventScroll: true});
}

export function openDialog(dialog, trigger = null) {
  if (trigger instanceof HTMLElement) {
    dialogOpeners.set(dialog, trigger);
    trigger.setAttribute('aria-expanded', 'true');
  }
  if (!dialog.open) dialog.showModal();
  queueMicrotask(() => focusDialog(dialog));
  dispatchAstryx(dialog, 'dialog-open');
}

export function closeDialog(dialog, returnFocus = true) {
  const trigger = dialogOpeners.get(dialog);
  if (dialog.open) dialog.close();
  if (trigger instanceof HTMLElement)
    trigger.setAttribute('aria-expanded', 'false');
  if (returnFocus && trigger?.isConnected) trigger.focus({preventScroll: true});
  dialogOpeners.delete(dialog);
  dispatchAstryx(dialog, 'dialog-close');
}

export function enhanceDialogs(root) {
  for (const dialog of elementsMatching(root, 'dialog[data-ax-dialog]')) {
    ensureID(dialog, 'ax-dialog');
  }
  for (const trigger of elementsMatching(root, '[data-ax-dialog-open]')) {
    trigger.setAttribute('aria-haspopup', 'dialog');
    const dialog = getDialog(
      trigger.ownerDocument,
      trigger.dataset.axDialogOpen,
    );
    trigger.setAttribute('aria-expanded', String(Boolean(dialog?.open)));
  }
}

export function setupDialogs(doc) {
  if (dialogDocuments.has(doc)) return;
  dialogDocuments.add(doc);

  doc.addEventListener('click', event => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const openTrigger = target.closest('[data-ax-dialog-open]');
    if (openTrigger instanceof HTMLElement) {
      const dialog = getDialog(doc, openTrigger.dataset.axDialogOpen);
      if (dialog) {
        event.preventDefault();
        openDialog(dialog, openTrigger);
      }
      return;
    }

    const closeTrigger = target.closest('[data-ax-dialog-close]');
    if (closeTrigger) {
      const dialog = closeTrigger.closest('dialog[data-ax-dialog]');
      if (dialog instanceof HTMLDialogElement) {
        event.preventDefault();
        closeDialog(dialog);
      }
      return;
    }

    if (
      target instanceof HTMLDialogElement &&
      target.matches('[data-ax-dialog]')
    ) {
      closeDialog(target);
    }
  });

  doc.addEventListener(
    'cancel',
    event => {
      const dialog = event.target;
      if (
        !(dialog instanceof HTMLDialogElement) ||
        !dialog.matches('[data-ax-dialog]')
      )
        return;
      if (dialog.hasAttribute('data-ax-dialog-required')) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      closeDialog(dialog);
    },
    true,
  );
}
