// Copyright (c) Meta Platforms, Inc. and affiliates.
/**
 * @input HoverCard trigger/surface markup using data-ax-hover-card hooks.
 * @output Delayed mouse/focus disclosure, Escape dismissal, and focus restoration.
 * @position Progressive enhancement for Vanilla Astryx HoverCard.
 */
/* global Element, HTMLElement, Node, clearTimeout, setTimeout */

import {
  dispatchAstryx,
  elementsMatching,
  ensureID,
  positionFloating,
} from './utils.js';

const hoverCardDocuments = new WeakSet();
const hoverCardTimers = new WeakMap();
const hoverCardOpeners = new WeakMap();
const suppressedFocusOpen = new WeakSet();

function hoverCardParts(wrapper) {
  const surface = wrapper.querySelector('[data-ax-hover-card-content]');
  const trigger =
    wrapper.querySelector('[data-ax-hover-card-trigger]') ??
    [...wrapper.children].find(child => child !== surface);
  return {surface, trigger};
}

function clearHoverCardTimer(wrapper) {
  clearTimeout(hoverCardTimers.get(wrapper));
  hoverCardTimers.delete(wrapper);
}

function supportsExpanded(trigger) {
  return (
    trigger.matches('button, summary, select, a[href]') ||
    trigger.hasAttribute('role')
  );
}

export function showHoverCard(wrapper, immediate = false) {
  clearHoverCardTimer(wrapper);
  const {surface, trigger} = hoverCardParts(wrapper);
  if (!(surface instanceof HTMLElement) || !(trigger instanceof HTMLElement))
    return;

  const show = () => {
    hoverCardOpeners.set(surface, trigger);
    surface.hidden = false;
    surface.dataset.axOpen = 'true';
    if (supportsExpanded(trigger))
      trigger.setAttribute('aria-expanded', 'true');
    positionFloating(
      trigger,
      surface,
      surface.dataset.axPlacement || 'above',
      surface.dataset.axAlignment || 'center',
    );
    dispatchAstryx(surface, 'hover-card-open');
  };

  const delay = immediate ? 0 : Number(wrapper.dataset.axHoverCardDelay ?? 300);
  if (delay <= 0) {
    show();
    return;
  }
  hoverCardTimers.set(wrapper, setTimeout(show, delay));
}

export function hideHoverCard(wrapper, {returnFocus = false} = {}) {
  clearHoverCardTimer(wrapper);
  const {surface, trigger} = hoverCardParts(wrapper);
  if (!(surface instanceof HTMLElement) || !(trigger instanceof HTMLElement))
    return;
  surface.hidden = true;
  surface.dataset.axOpen = 'false';
  if (supportsExpanded(trigger)) trigger.setAttribute('aria-expanded', 'false');
  if (returnFocus && trigger.isConnected) {
    suppressedFocusOpen.add(wrapper);
    trigger.focus({preventScroll: true});
  }
  hoverCardOpeners.delete(surface);
  dispatchAstryx(surface, 'hover-card-close');
}

function scheduleHideHoverCard(wrapper) {
  clearHoverCardTimer(wrapper);
  const delay = Number(wrapper.dataset.axHoverCardHideDelay ?? 200);
  const hide = () => hideHoverCard(wrapper);
  if (delay <= 0) {
    hide();
    return;
  }
  hoverCardTimers.set(wrapper, setTimeout(hide, delay));
}

export function enhanceHoverCards(root) {
  for (const wrapper of elementsMatching(root, '[data-ax-hover-card]')) {
    const {surface, trigger} = hoverCardParts(wrapper);
    if (!(surface instanceof HTMLElement) || !(trigger instanceof HTMLElement))
      continue;
    ensureID(surface, 'ax-hover-card');
    surface.hidden = surface.dataset.axOpen !== 'true';
    if (!surface.hasAttribute('role')) surface.setAttribute('role', 'group');
    trigger.setAttribute('aria-controls', surface.id);
    if (surface.getAttribute('role') === 'dialog') {
      trigger.setAttribute('aria-haspopup', 'dialog');
    } else {
      trigger.setAttribute('aria-describedby', surface.id);
    }
    if (supportsExpanded(trigger)) {
      trigger.setAttribute(
        'aria-expanded',
        String(surface.dataset.axOpen === 'true'),
      );
    }
  }
}

export function setupHoverCards(doc) {
  if (hoverCardDocuments.has(doc)) return;
  hoverCardDocuments.add(doc);

  doc.addEventListener('pointerover', event => {
    const wrapper =
      event.target instanceof Element
        ? event.target.closest('[data-ax-hover-card]')
        : null;
    if (
      wrapper &&
      !(
        event.relatedTarget instanceof Node &&
        wrapper.contains(event.relatedTarget)
      )
    ) {
      showHoverCard(wrapper);
    }
  });

  doc.addEventListener('pointerout', event => {
    const wrapper =
      event.target instanceof Element
        ? event.target.closest('[data-ax-hover-card]')
        : null;
    if (
      wrapper &&
      !(
        event.relatedTarget instanceof Node &&
        wrapper.contains(event.relatedTarget)
      )
    ) {
      scheduleHideHoverCard(wrapper);
    }
  });

  doc.addEventListener('focusin', event => {
    const wrapper =
      event.target instanceof Element
        ? event.target.closest('[data-ax-hover-card]')
        : null;
    if (wrapper && suppressedFocusOpen.delete(wrapper)) return;
    if (wrapper) showHoverCard(wrapper, true);
  });

  doc.addEventListener('focusout', event => {
    const wrapper =
      event.target instanceof Element
        ? event.target.closest('[data-ax-hover-card]')
        : null;
    if (
      wrapper &&
      !(
        event.relatedTarget instanceof Node &&
        wrapper.contains(event.relatedTarget)
      )
    ) {
      scheduleHideHoverCard(wrapper);
    }
  });

  doc.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const openSurfaces = [
      ...doc.querySelectorAll(
        '[data-ax-hover-card-content][data-ax-open="true"]',
      ),
    ];
    const surface =
      openSurfaces.find(candidate => candidate.contains(doc.activeElement)) ??
      openSurfaces.at(-1);
    if (!(surface instanceof HTMLElement)) return;
    const wrapper = surface.closest('[data-ax-hover-card]');
    if (!wrapper) return;
    const returnFocus = surface.contains(doc.activeElement);
    hideHoverCard(wrapper, {returnFocus});
    event.preventDefault();
    event.stopPropagation();
  });
}
