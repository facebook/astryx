// Copyright (c) Meta Platforms, Inc. and affiliates.
/* global Element, HTMLSelectElement, Node, document */

import {elementsMatching} from './utils.js';

const themeDocuments = new WeakSet();
const themes = ['neutral', 'butter', 'y2k'];
const modes = ['light', 'dark'];

export function setTheme(value, root = document.documentElement) {
  if (themes.includes(value)) root.dataset.astryxTheme = value;
}

export function setMode(value, root = document.documentElement) {
  if (modes.includes(value)) root.dataset.theme = value;
}

function cycle(values, current) {
  return values[(Math.max(0, values.indexOf(current)) + 1) % values.length];
}

export function enhanceThemeModeSwitchers(root) {
  const doc = root.nodeType === Node.DOCUMENT_NODE ? root : root.ownerDocument;
  for (const select of elementsMatching(root, '[data-ax-theme-switch]'))
    select.value = doc.documentElement.dataset.astryxTheme || 'neutral';
  for (const select of elementsMatching(root, '[data-ax-mode-switch]'))
    select.value = doc.documentElement.dataset.theme || 'light';
}

export function setupThemeModeSwitchers(doc) {
  if (themeDocuments.has(doc)) return;
  themeDocuments.add(doc);
  doc.addEventListener('change', event => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    if (target.matches('[data-ax-theme-switch]'))
      setTheme(target.value, doc.documentElement);
    if (target.matches('[data-ax-mode-switch]'))
      setMode(target.value, doc.documentElement);
  });
  doc.addEventListener('click', event => {
    const target =
      event.target instanceof Element
        ? event.target.closest('[data-ax-theme-toggle], [data-ax-mode-toggle]')
        : null;
    if (!target) return;
    if (target.matches('[data-ax-theme-toggle]'))
      setTheme(
        cycle(themes, doc.documentElement.dataset.astryxTheme),
        doc.documentElement,
      );
    if (target.matches('[data-ax-mode-toggle]'))
      setMode(
        cycle(modes, doc.documentElement.dataset.theme),
        doc.documentElement,
      );
  });
}

export const initThemeModeSwitchers = setupThemeModeSwitchers;
