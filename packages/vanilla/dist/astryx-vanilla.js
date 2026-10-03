/* Copyright (c) Meta Platforms, Inc. and affiliates. */

(() => {
  'use strict';

  /* global CustomEvent, Element, window */

  let floatingID = 0;

  function elementsMatching(root, selector) {
    const matches = [];
    if (root instanceof Element && root.matches(selector)) matches.push(root);
    if ('querySelectorAll' in root)
      matches.push(...root.querySelectorAll(selector));
    return matches;
  }

  function ensureID(element, prefix) {
    if (!element.id) {
      floatingID += 1;
      element.id = `${prefix}-${floatingID}`;
    }
    return element.id;
  }

  function positionFloating(
    anchor,
    surface,
    placement = 'below',
    alignment = 'start',
  ) {
    const anchorRect = anchor.getBoundingClientRect();
    const surfaceRect = surface.getBoundingClientRect();
    const gap = 8;
    let top = anchorRect.bottom + gap;
    let left = anchorRect.left;

    if (placement === 'above') top = anchorRect.top - surfaceRect.height - gap;
    if (placement === 'start') left = anchorRect.left - surfaceRect.width - gap;
    if (placement === 'end') left = anchorRect.right + gap;

    if (placement === 'above' || placement === 'below') {
      if (alignment === 'center')
        left = anchorRect.left + (anchorRect.width - surfaceRect.width) / 2;
      if (alignment === 'end') left = anchorRect.right - surfaceRect.width;
    } else {
      if (alignment === 'center')
        top = anchorRect.top + (anchorRect.height - surfaceRect.height) / 2;
      if (alignment === 'end') top = anchorRect.bottom - surfaceRect.height;
    }

    const gutter = 8;
    left = Math.max(
      gutter,
      Math.min(left, window.innerWidth - surfaceRect.width - gutter),
    );
    top = Math.max(
      gutter,
      Math.min(top, window.innerHeight - surfaceRect.height - gutter),
    );
    surface.style.left = `${Math.round(left)}px`;
    surface.style.top = `${Math.round(top)}px`;
  }

  function dispatchAstryx(element, type, detail = {}) {
    element.dispatchEvent(
      new CustomEvent(`astryx:${type}`, {bubbles: true, detail}),
    );
  }

  // Copyright (c) Meta Platforms, Inc. and affiliates.
  /**
   * @input Native dialog triggers, including triggers inside enhanced dropdown menus.
   * @output Modal lifecycle, initial focus, and stable focus restoration.
   * @position Progressive enhancement for Vanilla Astryx dialogs.
   */
  /* global Element, HTMLDialogElement, HTMLElement, queueMicrotask */


  const dialogDocuments = new WeakSet();
  const dialogOpeners = new WeakMap();

  function getDialog(doc, value) {
    if (!value) return null;
    const dialog = doc.getElementById(value);
    return dialog instanceof HTMLDialogElement ? dialog : null;
  }

  function focusDialog(dialog) {
    const target = dialog.querySelector(
      '[data-ax-dialog-initial-focus], [autofocus], .ax-dialog__title',
    );
    if (!(target instanceof HTMLElement)) return;
    if (
      !target.hasAttribute('tabindex') &&
      !target.matches('button, input, select, textarea, a[href]')
    ) {
      target.tabIndex = -1;
    }
    target.focus({preventScroll: true});
  }

  function dialogReturnTarget(trigger) {
    const menu = trigger.closest('[data-ax-dropdown-menu]');
    if (!(menu instanceof HTMLElement) || !menu.id) return trigger;

    for (const candidate of trigger.ownerDocument.querySelectorAll(
      '[aria-controls]',
    )) {
      if (
        candidate instanceof HTMLElement &&
        candidate.getAttribute('aria-controls') === menu.id
      ) {
        return candidate;
      }
    }
    return trigger;
  }

  function openDialog(dialog, trigger = null) {
    if (trigger instanceof HTMLElement) {
      dialogOpeners.set(dialog, {
        returnTarget: dialogReturnTarget(trigger),
        trigger,
      });
      trigger.setAttribute('aria-expanded', 'true');
    }
    if (!dialog.open) dialog.showModal();
    queueMicrotask(() => focusDialog(dialog));
    dispatchAstryx(dialog, 'dialog-open');
  }

  function closeDialog(dialog, returnFocus = true) {
    const opener = dialogOpeners.get(dialog);
    if (dialog.open) dialog.close();
    if (opener?.trigger instanceof HTMLElement)
      opener.trigger.setAttribute('aria-expanded', 'false');
    if (returnFocus && opener?.returnTarget?.isConnected)
      opener.returnTarget.focus({preventScroll: true});
    dialogOpeners.delete(dialog);
    dispatchAstryx(dialog, 'dialog-close');
  }

  function enhanceDialogs(root) {
    for (const dialog of elementsMatching(root, 'dialog[data-ax-dialog]')) {
      ensureID(dialog, 'ax-dialog');
    }
    for (const trigger of elementsMatching(root, '[data-ax-dialog-open]')) {
      trigger.setAttribute('aria-haspopup', 'dialog');
      const dialog = getDialog(
        trigger.ownerDocument,
        trigger.dataset.axDialogOpen,
      );
      trigger.setAttribute('aria-expanded', String(Boolean(dialog?.open)));
    }
  }

  function setupDialogs(doc) {
    if (dialogDocuments.has(doc)) return;
    dialogDocuments.add(doc);

    doc.addEventListener('click', event => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const openTrigger = target.closest('[data-ax-dialog-open]');
      if (openTrigger instanceof HTMLElement) {
        const dialog = getDialog(doc, openTrigger.dataset.axDialogOpen);
        if (dialog) {
          event.preventDefault();
          openDialog(dialog, openTrigger);
        }
        return;
      }

      const closeTrigger = target.closest('[data-ax-dialog-close]');
      if (closeTrigger) {
        const dialog = closeTrigger.closest('dialog[data-ax-dialog]');
        if (dialog instanceof HTMLDialogElement) {
          event.preventDefault();
          closeDialog(dialog);
        }
        return;
      }

      if (
        target instanceof HTMLDialogElement &&
        target.matches('[data-ax-dialog]')
      ) {
        closeDialog(target);
      }
    });

    doc.addEventListener(
      'cancel',
      event => {
        const dialog = event.target;
        if (
          !(dialog instanceof HTMLDialogElement) ||
          !dialog.matches('[data-ax-dialog]')
        )
          return;
        if (dialog.hasAttribute('data-ax-dialog-required')) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        closeDialog(dialog);
      },
      true,
    );
  }

  // Copyright (c) Meta Platforms, Inc. and affiliates.
  /* global Element, HTMLElement, Node, window */


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

  function openDropdownMenu(menu, trigger, focus = 'first') {
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

  function closeDropdownMenu(menu, returnFocus = true) {
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

  function enhanceDropdownMenus(root) {
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

  function setupDropdownMenus(doc) {
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

  // Copyright (c) Meta Platforms, Inc. and affiliates.
  /* global Element, HTMLElement */


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

  function activateTab(tab, focus = false) {
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

  function enhanceTabLists(root) {
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

  function setupTabLists(doc) {
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

  // Copyright (c) Meta Platforms, Inc. and affiliates.
  /* global HTMLDetailsElement */


  const collapsibleDocuments = new WeakSet();

  function syncCollapsible(details) {
    details.dataset.axOpen = String(details.open);
    const summary = details.querySelector(':scope > summary');
    if (summary) summary.setAttribute('aria-expanded', String(details.open));
  }

  function enhanceCollapsibles(root) {
    for (const details of elementsMatching(
      root,
      'details[data-ax-collapsible]',
    )) {
      syncCollapsible(details);
    }
  }

  function setupCollapsibles(doc) {
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

  // Copyright (c) Meta Platforms, Inc. and affiliates.
  /* global Element, HTMLElement, Node, clearTimeout, setTimeout */


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

  function showTooltip(wrapper, immediate = false) {
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

  function hideTooltip(wrapper) {
    clearTooltipTimer(wrapper);
    const {surface} = tooltipParts(wrapper);
    if (!(surface instanceof HTMLElement)) return;
    surface.hidden = true;
    surface.dataset.axOpen = 'false';
    dispatchAstryx(surface, 'tooltip-close');
  }

  function enhanceTooltips(root) {
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

  function setupTooltips(doc) {
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

  // Copyright (c) Meta Platforms, Inc. and affiliates.
  /**
   * @input HoverCard trigger/surface markup using data-ax-hover-card hooks.
   * @output Delayed mouse/focus disclosure, Escape dismissal, and focus restoration.
   * @position Progressive enhancement for Vanilla Astryx HoverCard.
   */
  /* global Element, HTMLElement, Node, clearTimeout, setTimeout */


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

  function showHoverCard(wrapper, immediate = false) {
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

  function hideHoverCard(wrapper, {returnFocus = false} = {}) {
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

  function enhanceHoverCards(root) {
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

  function setupHoverCards(doc) {
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

  // Copyright (c) Meta Platforms, Inc. and affiliates.
  /**
   * @input Native dialog lightboxes and data-ax-lightbox trigger/navigation hooks.
   * @output Modal lifecycle, gallery navigation, and stable focus restoration.
   * @position Progressive enhancement for Vanilla Astryx Lightbox.
   */
  /* global Element, HTMLButtonElement, HTMLDialogElement, HTMLElement, queueMicrotask */


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

  function updateLightbox(dialog, requestedIndex = currentIndex(dialog)) {
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

  function openLightbox(dialog, trigger = null, index = 0) {
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

  function closeLightbox(dialog, returnFocus = true) {
    const state = lightboxState.get(dialog);
    if (dialog.open) dialog.close();
    setExpandedForDialog(dialog, false);
    if (returnFocus && state?.trigger?.isConnected) {
      state.trigger.focus({preventScroll: true});
    }
    dispatchAstryx(dialog, 'lightbox-close');
  }

  function enhanceLightboxes(root) {
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

  function setupLightboxes(doc) {
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

  function dismissToast(element) {
    if (!(element instanceof HTMLElement)) return;
    element.dataset.axClosing = 'true';
    const remove = () => element.remove();
    element.addEventListener('animationend', remove, {once: true});
    setTimeout(remove, 250);
  }

  function toast(message, options = {}) {
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

  function setupToasts(doc) {
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

  function enhanceToasts() {}

  // Copyright (c) Meta Platforms, Inc. and affiliates.
  /* global Element, HTMLElement */


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

  function enhanceSideNavs(root) {
    for (const trigger of elementsMatching(root, '[data-ax-side-nav-toggle]')) {
      const id = trigger.dataset.axSideNavToggle;
      const nav = trigger.ownerDocument.getElementById(id);
      if (!(nav instanceof HTMLElement)) continue;
      trigger.setAttribute('aria-controls', id);
      trigger.setAttribute('aria-expanded', String(!nav.hidden));
    }
  }

  function setupSideNavs(doc) {
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

  // Copyright (c) Meta Platforms, Inc. and affiliates.
  /* global Element, HTMLSelectElement, Node, document */


  const themeDocuments = new WeakSet();
  const themes = ['neutral', 'butter', 'y2k'];
  const modes = ['light', 'dark'];

  function setTheme(value, root = document.documentElement) {
    if (themes.includes(value)) root.dataset.astryxTheme = value;
  }

  function setMode(value, root = document.documentElement) {
    if (modes.includes(value)) root.dataset.theme = value;
  }

  function cycle(values, current) {
    return values[(Math.max(0, values.indexOf(current)) + 1) % values.length];
  }

  function enhanceThemeModeSwitchers(root) {
    const doc = root.nodeType === Node.DOCUMENT_NODE ? root : root.ownerDocument;
    for (const select of elementsMatching(root, '[data-ax-theme-switch]'))
      select.value = doc.documentElement.dataset.astryxTheme || 'neutral';
    for (const select of elementsMatching(root, '[data-ax-mode-switch]'))
      select.value = doc.documentElement.dataset.theme || 'light';
  }

  function setupThemeModeSwitchers(doc) {
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

  const initThemeModeSwitchers = setupThemeModeSwitchers;

  // Copyright (c) Meta Platforms, Inc. and affiliates.
  /* global Element, MutationObserver, Node, document */


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

  globalThis.AstryxVanilla = Object.freeze({
    initThemeModeSwitchers,
    setMode,
    setTheme,
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
  });
})();
