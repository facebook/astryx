// Copyright (c) Meta Platforms, Inc. and affiliates.
/* global HTMLDetailsElement */

import {dispatchAstryx, elementsMatching} from './utils.js';

const collapsibleDocuments = new WeakSet();

function syncCollapsible(details) {
  details.dataset.axOpen = String(details.open);
  const summary = details.querySelector(':scope > summary');
  if (summary) summary.setAttribute('aria-expanded', String(details.open));
}

export function enhanceCollapsibles(root) {
  for (const details of elementsMatching(
    root,
    'details[data-ax-collapsible]',
  )) {
    syncCollapsible(details);
  }
}

export function setupCollapsibles(doc) {
  if (collapsibleDocuments.has(doc)) return;
  collapsibleDocuments.add(doc);
  doc.addEventListener(
    'toggle',
    event => {
      const details = event.target;
      if (
        details instanceof HTMLDetailsElement &&
        details.matches('[data-ax-collapsible]')
      ) {
        syncCollapsible(details);
        dispatchAstryx(details, 'collapsible-toggle', {open: details.open});
      }
    },
    true,
  );
}
