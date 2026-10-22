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
 * among its level's rows and how many rows the level had. A level's rows,
 * header and footer come from the caller's current items, so a filter field in
 * a level's header filters that level's rows, and a controlled field shows
 * what was typed. A row is found again by identity, then by `id`, then by a
 * text `label` no other row at that level shares. A row without an `id` whose
 * label no row carries any more (a count in it changed, say) is found at its
 * position, while its level still has as many rows and the row there opens a
 * sub-menu: then it can still be the same row. Otherwise it keeps its last
 * known shape, so a row filtered out of its level, or two rows labelled alike
 * without an `id`, never swap levels.
 */
import type {DropdownMenuItemData, DropdownMenuOption} from './DropdownMenu';
import {opensSubMenu} from './opensSubMenu';

/**
 * A row the sheet opened, as it was then, its place among its level's rows,
 * and how many rows that level had.
 */
export interface SheetPathEntry {
  row: DropdownMenuItemData;
  index: number;
  count: number;
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
  return {row, index: rows.indexOf(row), count: rows.length};
}

function findRow(
  options: ReadonlyArray<DropdownMenuOption>,
  opened: SheetPathEntry,
): DropdownMenuItemData | undefined {
  const rows = levelRows(options);
  const {row: openedRow, index, count} = opened;
  const sameLabel =
    typeof openedRow.label === 'string'
      ? rows.filter(row => row.label === openedRow.label)
      : [];
  const atPosition = rows[index];
  return (
    rows.find(row => row === openedRow) ??
    (openedRow.id != null
      ? rows.find(row => row.id === openedRow.id)
      : undefined) ??
    (sameLabel.length === 1 ? sameLabel[0] : undefined) ??
    (openedRow.id == null &&
    sameLabel.length === 0 &&
    rows.length === count &&
    atPosition != null &&
    opensSubMenu(atPosition, {showsRegions: true})
      ? atPosition
      : undefined)
  );
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
    const live: DropdownMenuItemData | undefined =
      options != null ? findRow(options, opened) : undefined;
    level = live ?? opened.row;
    options = live?.items;
  }
  return level;
}
