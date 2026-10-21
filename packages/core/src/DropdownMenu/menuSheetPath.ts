// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file menuSheetPath.ts
 * @input The menu's live `items` and the bottom sheet's path of opened rows
 * @output `resolveSheetLevel`: the opened level as the caller renders it now
 * @position Internal; used by the DropdownMenu and ContextMenu bottom sheets.
 *
 * The sheet remembers which rows were opened as the items they were when
 * opened. A level's rows, header and footer come from the caller's current
 * items, so a filter field in a level's header filters that level's rows,
 * and a controlled field shows what was typed. A row is found again by
 * identity, then by `id`, then by a text `label` no other row at that level
 * shares; otherwise it keeps its last known shape, so two rows labelled
 * alike without an `id` never swap levels.
 */
import type {DropdownMenuItemData, DropdownMenuOption} from './DropdownMenu';

function findRow(
  options: ReadonlyArray<DropdownMenuOption>,
  opened: DropdownMenuItemData,
): DropdownMenuItemData | undefined {
  const rows: DropdownMenuItemData[] = [];
  for (const option of options) {
    if (!('type' in option)) {
      rows.push(option);
    } else if (option.type === 'section') {
      rows.push(...option.items);
    }
  }
  const sameLabel =
    typeof opened.label === 'string'
      ? rows.filter(row => row.label === opened.label)
      : [];
  return (
    rows.find(row => row === opened) ??
    (opened.id != null ? rows.find(row => row.id === opened.id) : undefined) ??
    (sameLabel.length === 1 ? sameLabel[0] : undefined)
  );
}

/**
 * The last opened row of `path`, read from the current `items`: undefined at
 * the sheet's root.
 */
export function resolveSheetLevel(
  items: ReadonlyArray<DropdownMenuOption>,
  path: ReadonlyArray<DropdownMenuItemData>,
): DropdownMenuItemData | undefined {
  let options: ReadonlyArray<DropdownMenuOption> | undefined = items;
  let level: DropdownMenuItemData | undefined;
  for (const opened of path) {
    const live: DropdownMenuItemData | undefined =
      options != null ? findRow(options, opened) : undefined;
    level = live ?? opened;
    options = live?.items;
  }
  return level;
}
