// Copyright (c) Meta Platforms, Inc. and affiliates.
/**
 * @input Native dialog lightboxes and data-ax-lightbox trigger/navigation hooks.
 * @output Modal lifecycle, gallery navigation, and stable focus restoration.
 * @position Progressive enhancement for Vanilla Astryx Lightbox.
 */
/* global Element, HTMLButtonElement, HTMLDialogElement, HTMLElement, queueMicrotask */

import {dispatchAstryx, elementsMatching, ensureID} from './utils.js';

const lightboxDocuments = new WeakSet();
const lightboxState = new WeakMap();

function getLightbox(doc, value) {
  if (!value) return null;
  const dialog = doc.getElementById(value);
  return dialog instanceof HTMLDialogElement ? dialog : null;
}

function getItems(dialog) {
  return [...dialog.querySelectorAll('[data-ax-lightbox-item]')].filter(
    item => item instanceof HTMLElement,
  );
}

function currentIndex(dialog) {
  return lightboxState.get(dialog)?.index ?? 0;
}

function setExpandedForDialog(dialog, expanded) {
  if (!dialog.id) return;
  for (const trigger of dialog.ownerDocument.querySelectorAll(
    '[data-ax-lightbox-open]',
  )) {
    if (
      trigger instanceof HTMLElement &&
      trigger.dataset.axLightboxOpen === dialog.id
    ) {
      trigger.setAttribute('aria-expanded', String(expanded));
    }
  }
}

export function updateLightbox(dialog, requestedIndex = currentIndex(dialog)) {
  const items = getItems(dialog);
  const index = Math.max(
    0,
    Math.min(requestedIndex, Math.max(0, items.length - 1)),
  );
  const state = lightboxState.get(dialog) ?? {index: 0, trigger: null};
  state.index = index;
  lightboxState.set(dialog, state);

  items.forEach((item, itemIndex) => {
    item.hidden = itemIndex !== index;
  });

  const previous = dialog.querySelector('[data-ax-lightbox-previous]');
  const next = dialog.querySelector('[data-ax-lightbox-next]');
  if (previous instanceof HTMLButtonElement) previous.disabled = index <= 0;
  if (next instanceof HTMLButtonElement)
    next.disabled = index >= items.length - 1;

  const counter = dialog.querySelector('[data-ax-lightbox-counter]');
  if (counter instanceof HTMLElement) {
    counter.textContent =
      items.length > 0 ? `${index + 1} / ${items.length}` : '';
  }
  dispatchAstryx(dialog, 'lightbox-change', {index, total: items.length});
}

export function openLightbox(dialog, trigger = null, index = 0) {
  const state = lightboxState.get(dialog) ?? {index: 0, trigger: null};
  if (trigger instanceof HTMLElement) state.trigger = trigger;
  state.index = index;
  lightboxState.set(dialog, state);
  updateLightbox(dialog, index);
  setExpandedForDialog(dialog, true);
  if (!dialog.open) dialog.showModal();
  queueMicrotask(() => {
    const close = dialog.querySelector('[data-ax-lightbox-close]');
    if (close instanceof HTMLElement) close.focus({preventScroll: true});
  });
  dispatchAstryx(dialog, 'lightbox-open', {index: currentIndex(dialog)});
}

export function closeLightbox(dialog, returnFocus = true) {
  const state = lightboxState.get(dialog);
  if (dialog.open) dialog.close();
  setExpandedForDialog(dialog, false);
  if (returnFocus && state?.trigger?.isConnected) {
    state.trigger.focus({preventScroll: true});
  }
  dispatchAstryx(dialog, 'lightbox-close');
}

export function enhanceLightboxes(root) {
  for (const dialog of elementsMatching(root, 'dialog[data-ax-lightbox]')) {
    ensureID(dialog, 'ax-lightbox');
    updateLightbox(dialog, currentIndex(dialog));
  }
  for (const trigger of elementsMatching(root, '[data-ax-lightbox-open]')) {
    const dialog = getLightbox(
      trigger.ownerDocument,
      trigger.dataset.axLightboxOpen,
    );
    trigger.setAttribute('aria-haspopup', 'dialog');
    if (dialog) trigger.setAttribute('aria-controls', dialog.id);
    trigger.setAttribute('aria-expanded', String(Boolean(dialog?.open)));
  }
}

export function setupLightboxes(doc) {
  if (lightboxDocuments.has(doc)) return;
  lightboxDocuments.add(doc);

  doc.addEventListener('click', event => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const openTrigger = target.closest('[data-ax-lightbox-open]');
    if (openTrigger instanceof HTMLElement) {
      const dialog = getLightbox(doc, openTrigger.dataset.axLightboxOpen);
      if (dialog) {
        event.preventDefault();
        const index = Number(openTrigger.dataset.axLightboxIndex ?? 0);
        openLightbox(dialog, openTrigger, Number.isFinite(index) ? index : 0);
      }
      return;
    }

    const closeTrigger = target.closest('[data-ax-lightbox-close]');
    if (closeTrigger) {
      const dialog = closeTrigger.closest('dialog[data-ax-lightbox]');
      if (dialog instanceof HTMLDialogElement) {
        event.preventDefault();
        closeLightbox(dialog);
      }
      return;
    }

    const previous = target.closest('[data-ax-lightbox-previous]');
    if (previous) {
      const dialog = previous.closest('dialog[data-ax-lightbox]');
      if (dialog instanceof HTMLDialogElement) {
        event.preventDefault();
        updateLightbox(dialog, currentIndex(dialog) - 1);
      }
      return;
    }

    const next = target.closest('[data-ax-lightbox-next]');
    if (next) {
      const dialog = next.closest('dialog[data-ax-lightbox]');
      if (dialog instanceof HTMLDialogElement) {
        event.preventDefault();
        updateLightbox(dialog, currentIndex(dialog) + 1);
      }
      return;
    }

    if (target.matches('[data-ax-lightbox-backdrop]')) {
      const dialog = target.closest('dialog[data-ax-lightbox]');
      if (dialog instanceof HTMLDialogElement) closeLightbox(dialog);
    }
  });

  doc.addEventListener(
    'cancel',
    event => {
      const dialog = event.target;
      if (
        !(dialog instanceof HTMLDialogElement) ||
        !dialog.matches('[data-ax-lightbox]')
      )
        return;
      event.preventDefault();
      closeLightbox(dialog);
    },
    true,
  );

  doc.addEventListener('keydown', event => {
    const dialog =
      event.target instanceof Element
        ? event.target.closest('dialog[data-ax-lightbox]')
        : null;
    if (!(dialog instanceof HTMLDialogElement) || !dialog.open) return;
    if (
      event.target instanceof Element &&
      event.target.matches('input, textarea, select, video')
    ) {
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      updateLightbox(dialog, currentIndex(dialog) - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      updateLightbox(dialog, currentIndex(dialog) + 1);
    }
  });
}
