// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file opensSubMenu.ts
 * @input A data-mode menu row
 * @output `opensSubMenu`: whether the row opens a sub-menu rather than acting
 * @position Internal; read by `renderDropdownItems` (the popover),
 *   `MenuBottomSheetActionList` (the bottom sheet) and the sheet's level path,
 *   so they agree on which rows are sub-menus.
 */
import {isRenderable} from '../utils';
import type {DropdownMenuItemData, DropdownMenuOption} from './DropdownMenu';

/**
 * A row opens a sub-menu when it has nested `items`. Where the presentation
 * shows a sub-menu's header and footer (`showsRegions`), a row with either
 * stays one while `items` is empty, as when a filter in its header matches
 * nothing, so the field keeps focus and what was typed; as the compound
 * `DropdownMenuSubMenu` does. Elsewhere, and without either, an empty `items`
 * is a plain row.
 */
export function opensSubMenu(
  item: DropdownMenuItemData,
  {showsRegions}: {showsRegions: boolean},
): item is DropdownMenuItemData & {items: DropdownMenuOption[]} {
  return (
    item.items != null &&
    (item.items.length > 0 ||
      (showsRegions &&
        (isRenderable(item.header) || isRenderable(item.footer))))
  );
}
