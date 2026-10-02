// Copyright (c) Meta Platforms, Inc. and affiliates.
/* global Element, HTMLElement, Node, window */

import {
  dispatchAstryx,
  elementsMatching,
  ensureID,
  positionFloating,
} from './utils.js';

const menuDocuments = new WeakSet();
const menuTriggers = new WeakMap();

function menuItems(menu) {
  return [
    ...menu.querySelectorAll('[role^="menuitem"], [data-ax-menu-item]'),
  ].filter(
    item =>
      item instanceof HTMLElement &&
      item.getAttribute('aria-disabled') !== 'true' &&
      !item.hasAttribute('disabled'),
  );
}

function isMenuOpen(menu) {
  return menu.dataset.axOpen === 'true';
}

function triggerForMenu(menu) {
  return (
    menuTriggers.get(menu) ??
    menu.ownerDocument.querySelector(`[aria-controls="${menu.id}"]`)
  );
}

export function openDropdownMenu(menu, trigger, focus = 'first') {
  menuTriggers.set(menu, trigger);
  menu.dataset.axOpen = 'true';
  trigger.setAttribute('aria-expanded', 'true');
  if (typeof menu.showPopover === 'function') {
    try {
      menu.showPopover();
    } catch {
      // The data-state fallback remains available when popover state races.
    }
  }
  positionFloating(
    trigger,
    menu,
    menu.dataset.axPlacement || 'below',
    menu.dataset.axAlignment || 'start',
  );
  const items = menuItems(menu);
  const item = focus === 'last' ? items.at(-1) : items[0];
  item?.focus({preventScroll: true});
  dispatchAstryx(menu, 'dropdown-open');
}

export function closeDropdownMenu(menu, returnFocus = true) {
  const trigger = triggerForMenu(menu);
  menu.dataset.axOpen = 'false';
  if (typeof menu.hidePopover === 'function') {
    try {
      menu.hidePopover();
    } catch {
      // The data-state fallback already closed the menu.
    }
  }
  trigger?.setAttribute('aria-expanded', 'false');
  if (returnFocus && trigger?.isConnected) trigger.focus({preventScroll: true});
  dispatchAstryx(menu, 'dropdown-close');
}

function moveMenuFocus(menu, current, delta) {
  const items = menuItems(menu);
  if (!items.length) return;
  const index = Math.max(0, items.indexOf(current));
  items[(index + delta + items.length) % items.length].focus();
}

export function enhanceDropdownMenus(root) {
  for (const menu of elementsMatching(root, '[data-ax-dropdown-menu]')) {
    ensureID(menu, 'ax-dropdown-menu');
    if (!menu.dataset.axOpen) menu.dataset.axOpen = 'false';
    for (const item of menuItems(menu)) {
      if (!item.hasAttribute('role')) item.setAttribute('role', 'menuitem');
      item.tabIndex = -1;
    }
  }
  for (const trigger of elementsMatching(root, '[data-ax-dropdown-trigger]')) {
    const menuID =
      trigger.dataset.axDropdownTrigger ||
      trigger.getAttribute('aria-controls');
    if (!menuID) continue;
    trigger.setAttribute('aria-haspopup', 'menu');
    trigger.setAttribute('aria-controls', menuID);
    const menu = trigger.ownerDocument.getElementById(menuID);
    trigger.setAttribute(
      'aria-expanded',
      String(menu instanceof HTMLElement && isMenuOpen(menu)),
    );
  }
}

export function setupDropdownMenus(doc) {
  if (menuDocuments.has(doc)) return;
  menuDocuments.add(doc);

  doc.addEventListener('click', event => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const trigger = target.closest('[data-ax-dropdown-trigger]');
    if (trigger instanceof HTMLElement) {
      const menu = doc.getElementById(
        trigger.dataset.axDropdownTrigger ||
          trigger.getAttribute('aria-controls'),
      );
      if (menu instanceof HTMLElement) {
        event.preventDefault();
        if (isMenuOpen(menu)) closeDropdownMenu(menu);
        else openDropdownMenu(menu, trigger);
      }
      return;
    }

    const item = target.closest('[role^="menuitem"], [data-ax-menu-item]');
    const menu = item?.closest('[data-ax-dropdown-menu]');
    if (item instanceof HTMLElement && menu instanceof HTMLElement) {
      if (
        item.getAttribute('aria-disabled') === 'true' ||
        item.hasAttribute('disabled')
      ) {
        event.preventDefault();
        return;
      }
      if (!item.hasAttribute('data-ax-menu-keep-open')) closeDropdownMenu(menu);
    }
  });

  doc.addEventListener('keydown', event => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const trigger = target.closest('[data-ax-dropdown-trigger]');
    if (
      trigger instanceof HTMLElement &&
      ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)
    ) {
      const menu = doc.getElementById(
        trigger.dataset.axDropdownTrigger ||
          trigger.getAttribute('aria-controls'),
      );
      if (menu instanceof HTMLElement) {
        event.preventDefault();
        openDropdownMenu(
          menu,
          trigger,
          event.key === 'ArrowUp' ? 'last' : 'first',
        );
      }
      return;
    }

    const menu = target.closest('[data-ax-dropdown-menu]');
    if (!(menu instanceof HTMLElement)) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveMenuFocus(menu, target, event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const items = menuItems(menu);
      (event.key === 'Home' ? items[0] : items.at(-1))?.focus();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeDropdownMenu(menu);
    } else if (event.key === 'Tab') {
      closeDropdownMenu(menu, false);
    }
  });

  doc.addEventListener(
    'pointerdown',
    event => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      for (const menu of doc.querySelectorAll(
        '[data-ax-dropdown-menu][data-ax-open="true"]',
      )) {
        const trigger = triggerForMenu(menu);
        if (!menu.contains(target) && !trigger?.contains(target))
          closeDropdownMenu(menu, false);
      }
    },
    true,
  );

  window.addEventListener('resize', () => {
    for (const menu of doc.querySelectorAll(
      '[data-ax-dropdown-menu][data-ax-open="true"]',
    )) {
      const trigger = triggerForMenu(menu);
      if (trigger)
        positionFloating(
          trigger,
          menu,
          menu.dataset.axPlacement || 'below',
          menu.dataset.axAlignment || 'start',
        );
    }
  });
}
