// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file menuSheetPath.ts
 * @input The menu's live `items` and the bottom sheet's path of opened rows
 * @output `openSheetLevel`, the path entry for a row the sheet opens, and
 *   `resolveSheetLevel`, the opened level as the caller renders it now
 * @position Internal; used by the DropdownMenu bottom sheet.
 *
 * The sheet remembers each row it opened as the row was then, where it sat
 * among its level's rows, how many rows the level had, and whether its text
 * label was its own there. A level's rows, header and footer come from the
 * caller's current items, so a filter field in a level's header filters that
 * level's rows, and a controlled field shows what was typed. A row is found
 * again by identity; a row with an `id` then by that `id` alone. A row without
 * an `id` is found by its label when the label was its own at its level when
 * it opened and still is, or, when no row carries the label any more (a count
 * in it changed, say), at its position, while its level still has as many
 * rows and the row there opens a sub-menu: then it can still be the same row.
 * Otherwise it keeps the shape it had when it opened (its rows, header and
 * footer then), so a row filtered out of its level never gives way to another,
 * labelled alike or sitting where it sat; so does a row found again that no
 * longer opens a sub-menu (its `items` gone). A controlled field in that
 * open-time header shows the value it had then. Without an `id` the label
 * match reads uniqueness from the rows shown when the level opened, so a row
 * labelled alike that was hidden then (by the menu's own search, say) can
 * still take its place, and a row whose label changes while it shows is found
 * only while its level keeps its row count: such rows need an `id`.
 */
import type {DropdownMenuItemData, DropdownMenuOption} from './DropdownMenu';
import {opensSubMenu} from './opensSubMenu';

/**
 * A row the sheet opened, as it was then, its place among its level's rows,
 * how many rows that level had, and whether no other row there shared its text
 * label.
 */
export interface SheetPathEntry {
  row: DropdownMenuItemData;
  index: number;
  count: number;
  isLabelUnique: boolean;
}

function levelRows(
  options: ReadonlyArray<DropdownMenuOption>,
): DropdownMenuItemData[] {
  const rows: DropdownMenuItemData[] = [];
  for (const option of options) {
    if (!('type' in option)) {
      rows.push(option);
    } else if (option.type === 'section') {
      rows.push(...option.items);
    }
  }
  return rows;
}

/** The path entry for `row`, opened from a level showing `options`. */
export function openSheetLevel(
  options: ReadonlyArray<DropdownMenuOption>,
  row: DropdownMenuItemData,
): SheetPathEntry {
  const rows = levelRows(options);
  return {
    row,
    index: rows.indexOf(row),
    count: rows.length,
    isLabelUnique:
      typeof row.label === 'string' &&
      rows.filter(other => other.label === row.label).length === 1,
  };
}

function findRow(
  options: ReadonlyArray<DropdownMenuOption>,
  opened: SheetPathEntry,
): DropdownMenuItemData | undefined {
  const rows = levelRows(options);
  const {row: openedRow, index, count, isLabelUnique} = opened;
  const same = rows.find(row => row === openedRow);
  if (same != null || openedRow.id != null) {
    return same ?? rows.find(row => row.id === openedRow.id);
  }
  const sameLabel =
    typeof openedRow.label === 'string'
      ? rows.filter(row => row.label === openedRow.label)
      : [];
  if (sameLabel.length > 0) {
    return isLabelUnique && sameLabel.length === 1 ? sameLabel[0] : undefined;
  }
  const atPosition = rows[index];
  return rows.length === count &&
    atPosition != null &&
    opensSubMenu(atPosition, {showsRegions: true})
    ? atPosition
    : undefined;
}

/**
 * The last opened row of `path`, read from the current `items`: undefined at
 * the sheet's root.
 */
export function resolveSheetLevel(
  items: ReadonlyArray<DropdownMenuOption>,
  path: ReadonlyArray<SheetPathEntry>,
): DropdownMenuItemData | undefined {
  let options: ReadonlyArray<DropdownMenuOption> | undefined = items;
  let level: DropdownMenuItemData | undefined;
  for (const opened of path) {
    const found: DropdownMenuItemData | undefined =
      options != null ? findRow(options, opened) : undefined;
    // A row found again that no longer opens a sub-menu is not this level any
    // more: listing the level's parent rows under its heading would mislead.
    const live: DropdownMenuItemData | undefined =
      found != null && opensSubMenu(found, {showsRegions: true})
        ? found
        : undefined;
    level = live ?? opened.row;
    options = live?.items;
  }
  return level;
}
