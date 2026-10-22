// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file opensSubMenu.ts
 * @input A data-mode menu row
 * @output `opensSubMenu`: whether the row opens a sub-menu rather than acting
 * @position Internal; read by `renderDropdownItems` (the popover) and
 *   `MenuBottomSheetActionList` (the bottom sheet), so both presentations
 *   agree on which rows are sub-menus.
 */
import {isRenderable} from '../utils';
import type {DropdownMenuItemData, DropdownMenuOption} from './DropdownMenu';

/**
 * A row opens a sub-menu when it has nested `items`. With a `header` or
 * `footer` it stays one while `items` is empty, as when a filter in its header
 * matches nothing, so the field keeps focus and what was typed; as the compound
 * `DropdownMenuSubMenu` does. Without either, an empty `items` is a plain row.
 */
export function opensSubMenu(
  item: DropdownMenuItemData,
): item is DropdownMenuItemData & {items: DropdownMenuOption[]} {
  return (
    item.items != null &&
    (item.items.length > 0 ||
      isRenderable(item.header) ||
      isRenderable(item.footer))
  );
}
