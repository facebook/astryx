// Copyright (c) Meta Platforms, Inc. and affiliates.
/* global Element, HTMLElement, document, setTimeout */

const toastDocuments = new WeakSet();
let toastID = 0;

function ensureToastViewport(doc) {
  let viewport = doc.querySelector('[data-ax-toast-viewport]');
  if (viewport) return viewport;
  viewport = doc.createElement('div');
  viewport.className = 'ax-toast-viewport';
  viewport.dataset.axToastViewport = '';
  viewport.setAttribute('aria-live', 'polite');
  viewport.setAttribute('aria-relevant', 'additions');
  doc.body.append(viewport);
  return viewport;
}

export function dismissToast(element) {
  if (!(element instanceof HTMLElement)) return;
  element.dataset.axClosing = 'true';
  const remove = () => element.remove();
  element.addEventListener('animationend', remove, {once: true});
  setTimeout(remove, 250);
}

export function toast(message, options = {}) {
  const doc = options.document ?? document;
  const viewport = ensureToastViewport(doc);
  toastID += 1;
  const type = options.type === 'error' ? 'error' : 'info';
  const element = doc.createElement('div');
  element.className = `ax-toast ax-toast--${type}`;
  element.dataset.axToastItem = '';
  element.dataset.axToastID = options.id ?? `ax-toast-${toastID}`;
  element.setAttribute('role', type === 'error' ? 'alert' : 'status');

  const body = doc.createElement('span');
  body.className = 'ax-toast__body';
  body.textContent = String(message);
  element.append(body);

  if (options.action?.label) {
    const action = doc.createElement('button');
    action.className = 'ax-toast__action';
    action.type = 'button';
    action.textContent = options.action.label;
    action.addEventListener('click', () => options.action.onClick?.());
    element.append(action);
  }

  const close = doc.createElement('button');
  close.className = 'ax-toast__close';
  close.type = 'button';
  close.dataset.axToastDismiss = '';
  close.setAttribute('aria-label', 'Dismiss notification');
  close.textContent = '×';
  element.append(close);
  viewport.append(element);

  const duration = options.duration ?? (type === 'error' ? 0 : 5000);
  if (duration > 0) setTimeout(() => dismissToast(element), duration);
  return element;
}

export function setupToasts(doc) {
  if (toastDocuments.has(doc)) return;
  toastDocuments.add(doc);
  doc.addEventListener('click', event => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const dismiss = target.closest('[data-ax-toast-dismiss]');
    if (dismiss) {
      dismissToast(dismiss.closest('[data-ax-toast-item]'));
      return;
    }
    const trigger = target.closest('[data-ax-toast]');
    if (trigger) {
      toast(trigger.dataset.axToast || 'Done', {
        document: doc,
        type: trigger.dataset.axToastType,
        duration: Number(trigger.dataset.axToastDuration || 5000),
      });
    }
  });
}

export function enhanceToasts() {}
