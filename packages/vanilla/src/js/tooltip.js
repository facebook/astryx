// Copyright (c) Meta Platforms, Inc. and affiliates.
/* global Element, HTMLElement, Node, clearTimeout, setTimeout */

import {
  dispatchAstryx,
  elementsMatching,
  ensureID,
  positionFloating,
} from './utils.js';

const tooltipDocuments = new WeakSet();
const tooltipTimers = new WeakMap();

function tooltipParts(wrapper) {
  const surface = wrapper.querySelector(
    '[data-ax-tooltip-content], [role="tooltip"]',
  );
  const trigger =
    wrapper.querySelector('[data-ax-tooltip-trigger]') ??
    [...wrapper.children].find(child => child !== surface);
  return {surface, trigger};
}

function clearTooltipTimer(wrapper) {
  clearTimeout(tooltipTimers.get(wrapper));
  tooltipTimers.delete(wrapper);
}

export function showTooltip(wrapper, immediate = false) {
  clearTooltipTimer(wrapper);
  const {surface, trigger} = tooltipParts(wrapper);
  if (!(surface instanceof HTMLElement) || !(trigger instanceof HTMLElement))
    return;
  const show = () => {
    surface.hidden = false;
    surface.dataset.axOpen = 'true';
    positionFloating(
      trigger,
      surface,
      surface.dataset.axPlacement || 'above',
      surface.dataset.axAlignment || 'center',
    );
    dispatchAstryx(surface, 'tooltip-open');
  };
  const delay = immediate ? 0 : Number(wrapper.dataset.axTooltipDelay ?? 200);
  tooltipTimers.set(wrapper, setTimeout(show, Math.max(0, delay)));
}

export function hideTooltip(wrapper) {
  clearTooltipTimer(wrapper);
  const {surface} = tooltipParts(wrapper);
  if (!(surface instanceof HTMLElement)) return;
  surface.hidden = true;
  surface.dataset.axOpen = 'false';
  dispatchAstryx(surface, 'tooltip-close');
}

export function enhanceTooltips(root) {
  for (const wrapper of elementsMatching(root, '[data-ax-tooltip]')) {
    const {surface, trigger} = tooltipParts(wrapper);
    if (!(surface instanceof HTMLElement) || !(trigger instanceof HTMLElement))
      continue;
    ensureID(surface, 'ax-tooltip');
    surface.setAttribute('role', 'tooltip');
    surface.hidden = surface.dataset.axOpen !== 'true';
    trigger.setAttribute('aria-describedby', surface.id);
  }
}

export function setupTooltips(doc) {
  if (tooltipDocuments.has(doc)) return;
  tooltipDocuments.add(doc);

  doc.addEventListener('pointerover', event => {
    const wrapper =
      event.target instanceof Element
        ? event.target.closest('[data-ax-tooltip]')
        : null;
    if (
      wrapper &&
      !(
        event.relatedTarget instanceof Node &&
        wrapper.contains(event.relatedTarget)
      )
    )
      showTooltip(wrapper);
  });
  doc.addEventListener('pointerout', event => {
    const wrapper =
      event.target instanceof Element
        ? event.target.closest('[data-ax-tooltip]')
        : null;
    if (
      wrapper &&
      !(
        event.relatedTarget instanceof Node &&
        wrapper.contains(event.relatedTarget)
      )
    )
      hideTooltip(wrapper);
  });
  doc.addEventListener('focusin', event => {
    const wrapper =
      event.target instanceof Element
        ? event.target.closest('[data-ax-tooltip]')
        : null;
    if (wrapper) showTooltip(wrapper, true);
  });
  doc.addEventListener('focusout', event => {
    const wrapper =
      event.target instanceof Element
        ? event.target.closest('[data-ax-tooltip]')
        : null;
    if (
      wrapper &&
      !(
        event.relatedTarget instanceof Node &&
        wrapper.contains(event.relatedTarget)
      )
    )
      hideTooltip(wrapper);
  });
  doc.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    for (const wrapper of doc.querySelectorAll('[data-ax-tooltip]'))
      hideTooltip(wrapper);
  });
}
