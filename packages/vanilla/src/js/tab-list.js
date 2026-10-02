// Copyright (c) Meta Platforms, Inc. and affiliates.
/* global Element, HTMLElement */

import {dispatchAstryx, elementsMatching} from './utils.js';

const tabDocuments = new WeakSet();

function tabsFor(list) {
  return [...list.querySelectorAll('[role="tab"]')].filter(
    tab => tab instanceof HTMLElement && !tab.hasAttribute('disabled'),
  );
}

function panelFor(tab) {
  const panelID = tab.getAttribute('aria-controls');
  return panelID ? tab.ownerDocument.getElementById(panelID) : null;
}

export function activateTab(tab, focus = false) {
  const list = tab.closest('[data-ax-tab-list], [role="tablist"]');
  if (!list) return;
  for (const candidate of tabsFor(list)) {
    const selected = candidate === tab;
    candidate.setAttribute('aria-selected', String(selected));
    candidate.tabIndex = selected ? 0 : -1;
    candidate.toggleAttribute('data-ax-selected', selected);
    const panel = panelFor(candidate);
    if (panel) panel.hidden = !selected;
  }
  if (focus) tab.focus({preventScroll: true});
  dispatchAstryx(tab, 'tab-change', {value: tab.dataset.axTab || tab.id});
}

export function enhanceTabLists(root) {
  for (const list of elementsMatching(
    root,
    '[data-ax-tab-list], [role="tablist"]',
  )) {
    if (!list.hasAttribute('role')) list.setAttribute('role', 'tablist');
    const tabs = tabsFor(list);
    let selected =
      tabs.find(tab => tab.getAttribute('aria-selected') === 'true') ?? tabs[0];
    for (const tab of tabs) {
      if (!tab.hasAttribute('role')) tab.setAttribute('role', 'tab');
      const panel = panelFor(tab);
      if (panel && !panel.hasAttribute('role'))
        panel.setAttribute('role', 'tabpanel');
    }
    if (selected) activateTab(selected);
  }
}

export function setupTabLists(doc) {
  if (tabDocuments.has(doc)) return;
  tabDocuments.add(doc);

  doc.addEventListener('click', event => {
    const target = event.target;
    const tab =
      target instanceof Element ? target.closest('[role="tab"]') : null;
    if (
      tab instanceof HTMLElement &&
      tab.closest('[data-ax-tab-list], [role="tablist"]')
    )
      activateTab(tab);
  });

  doc.addEventListener('keydown', event => {
    const tab = event.target;
    if (!(tab instanceof HTMLElement) || tab.getAttribute('role') !== 'tab')
      return;
    const list = tab.closest('[data-ax-tab-list], [role="tablist"]');
    if (!list) return;
    const vertical = list.getAttribute('aria-orientation') === 'vertical';
    const previousKey = vertical ? 'ArrowUp' : 'ArrowLeft';
    const nextKey = vertical ? 'ArrowDown' : 'ArrowRight';
    const tabs = tabsFor(list);
    let index = tabs.indexOf(tab);
    if (event.key === previousKey)
      index = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === nextKey) index = (index + 1) % tabs.length;
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = tabs.length - 1;
    else return;
    event.preventDefault();
    activateTab(tabs[index], true);
  });
}
