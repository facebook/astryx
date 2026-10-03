// Copyright (c) Meta Platforms, Inc. and affiliates.
/* global Element, MutationObserver, Node, document */

import {dispatchAstryx} from './utils.js';
import {
  closeDialog,
  enhanceDialogs,
  openDialog,
  setupDialogs,
} from './dialog.js';
import {
  closeDropdownMenu,
  enhanceDropdownMenus,
  openDropdownMenu,
  setupDropdownMenus,
} from './dropdown-menu.js';
import {activateTab, enhanceTabLists, setupTabLists} from './tab-list.js';
import {enhanceCollapsibles, setupCollapsibles} from './collapsible.js';
import {
  enhanceTooltips,
  hideTooltip,
  setupTooltips,
  showTooltip,
} from './tooltip.js';
import {
  enhanceHoverCards,
  hideHoverCard,
  setupHoverCards,
  showHoverCard,
} from './hover-card.js';
import {
  closeLightbox,
  enhanceLightboxes,
  openLightbox,
  setupLightboxes,
  updateLightbox,
} from './lightbox.js';
import {dismissToast, enhanceToasts, setupToasts, toast} from './toast.js';
import {enhanceSideNavs, setupSideNavs} from './side-nav.js';
import {
  enhanceThemeModeSwitchers,
  initThemeModeSwitchers,
  setMode,
  setTheme,
  setupThemeModeSwitchers,
} from './theme-mode.js';

const documentObservers = new WeakMap();

function enhanceRoot(root) {
  enhanceDialogs(root);
  enhanceDropdownMenus(root);
  enhanceTabLists(root);
  enhanceCollapsibles(root);
  enhanceTooltips(root);
  enhanceHoverCards(root);
  enhanceLightboxes(root);
  enhanceToasts(root);
  enhanceSideNavs(root);
  enhanceThemeModeSwitchers(root);
}

function exposeGlobalAPI(target = globalThis) {
  const existing =
    target.astryx && typeof target.astryx === 'object' ? target.astryx : {};
  target.astryx = Object.assign(existing, {
    init: initializeAstryx,
    setMode,
    setTheme,
    toast,
  });
}

function initializeAstryx(root = document) {
  const doc = root.nodeType === Node.DOCUMENT_NODE ? root : root.ownerDocument;
  if (!doc) return;

  setupDialogs(doc);
  setupDropdownMenus(doc);
  setupTabLists(doc);
  setupCollapsibles(doc);
  setupTooltips(doc);
  setupHoverCards(doc);
  setupLightboxes(doc);
  setupToasts(doc);
  setupSideNavs(doc);
  setupThemeModeSwitchers(doc);
  enhanceRoot(root);
  exposeGlobalAPI(doc.defaultView ?? globalThis);

  if (!documentObservers.has(doc)) {
    const observer = new MutationObserver(records => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node instanceof Element) enhanceRoot(node);
        }
      }
    });
    observer.observe(doc.documentElement, {childList: true, subtree: true});
    documentObservers.set(doc, observer);
  }

  dispatchAstryx(doc.documentElement, 'ready');
}

if (typeof document !== 'undefined') initializeAstryx();

export {initThemeModeSwitchers, setMode, setTheme};
export {
  activateTab,
  closeDialog,
  closeDropdownMenu,
  closeLightbox,
  dismissToast,
  hideHoverCard,
  hideTooltip,
  initializeAstryx,
  openDialog,
  openDropdownMenu,
  openLightbox,
  showHoverCard,
  showTooltip,
  toast,
  updateLightbox,
};
