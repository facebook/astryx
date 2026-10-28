// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file menuPressOnItems.ts
 * @input useMenuPress's menu `onPointerDown` and the menu's item selector
 * @output Exports pressOnItemsOnly: the same handler, run only for a press
 *   that lands on an item
 * @position Internal to core's menus whose content a caller supplies
 *   (NavHeadingMenu, SideNavHeading's and TopNavHeading's menus,
 *   BreadcrumbItem's menu)
 *
 * A menu that holds caller content beside its items (a button, a link list)
 * tracks only presses that land on an item. A press on anything else stays
 * the browser's own, so that content's click runs as it always has
 * (`architecture:interaction-modality` INV4).
 */

import type {PointerEvent as ReactPointerEvent} from 'react';

export function pressOnItemsOnly<E extends HTMLElement>(
  onPointerDown: (event: ReactPointerEvent<E>) => void,
  itemSelector: string,
): (event: ReactPointerEvent<E>) => void {
  return event => {
    const target = event.target;
    if (target instanceof Element && target.closest(itemSelector) != null) {
      onPointerDown(event);
    }
  };
}
