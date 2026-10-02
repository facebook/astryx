// Copyright (c) Meta Platforms, Inc. and affiliates.
/* global Element, HTMLElement */

import {dispatchAstryx, elementsMatching} from './utils.js';

const sideNavDocuments = new WeakSet();

function syncSideNav(doc, id, collapsed) {
  const nav = doc.getElementById(id);
  if (!(nav instanceof HTMLElement)) return;
  nav.hidden = collapsed;
  nav.toggleAttribute('data-ax-collapsed', collapsed);
  nav.setAttribute('aria-hidden', String(collapsed));
  for (const trigger of doc.querySelectorAll(
    `[data-ax-side-nav-toggle="${id}"]`,
  )) {
    trigger.setAttribute('aria-controls', id);
    trigger.setAttribute('aria-expanded', String(!collapsed));
  }
  dispatchAstryx(nav, 'side-nav-toggle', {collapsed});
}

export function enhanceSideNavs(root) {
  for (const trigger of elementsMatching(root, '[data-ax-side-nav-toggle]')) {
    const id = trigger.dataset.axSideNavToggle;
    const nav = trigger.ownerDocument.getElementById(id);
    if (!(nav instanceof HTMLElement)) continue;
    trigger.setAttribute('aria-controls', id);
    trigger.setAttribute('aria-expanded', String(!nav.hidden));
  }
}

export function setupSideNavs(doc) {
  if (sideNavDocuments.has(doc)) return;
  sideNavDocuments.add(doc);
  doc.addEventListener('click', event => {
    const trigger =
      event.target instanceof Element
        ? event.target.closest('[data-ax-side-nav-toggle]')
        : null;
    if (!(trigger instanceof HTMLElement)) return;
    const nav = doc.getElementById(trigger.dataset.axSideNavToggle);
    if (nav instanceof HTMLElement) syncSideNav(doc, nav.id, !nav.hidden);
  });
}
