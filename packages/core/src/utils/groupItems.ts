// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file groupItems.ts
 * @input Array of SearchableItem with optional auxiliaryData.group
 * @output Grouped structure preserving insertion order
 * @position Shared utility; used by CommandPalette, trigger menu, and
 *   any future component that needs to group search results by category.
 */

import type {SearchableItem} from '../Typeahead/types';

/**
 * A group of items with an optional heading.
 * `heading` is null for ungrouped items.
 */
export interface ItemGroup<T extends SearchableItem = SearchableItem> {
  heading: string | null;
  items: T[];
}

export interface GroupItemsOptions {
  /** Place ungrouped items before named groups instead of after them. */
  ungroupedFirst?: boolean;
}

/**
 * Extract the group string from an item's auxiliaryData.
 */
export function getItemGroup(item: SearchableItem): string | undefined {
  const aux = item.auxiliaryData as Record<string, unknown> | undefined;
  return typeof aux?.group === 'string' ? aux.group : undefined;
}

/**
 * Group items by `auxiliaryData.group`, preserving insertion order of groups.
 * Ungrouped items are collected into a final group with `heading: null`.
 *
 * If no items have a group, returns a single entry with `heading: null`.
 *
 * @example
 * ```
 * const items = [
 *   {id: '1', label: 'Home', auxiliaryData: {group: 'Navigation'}},
 *   {id: '2', label: 'Settings', auxiliaryData: {group: 'Navigation'}},
 *   {id: '3', label: 'Dark mode', auxiliaryData: {group: 'Preferences'}},
 *   {id: '4', label: 'Help'},
 * ];
 *
 * groupItems(items)
 * // [
 * //   {heading: 'Navigation', items: [{id:'1',...}, {id:'2',...}]},
 * //   {heading: 'Preferences', items: [{id:'3',...}]},
 * //   {heading: null, items: [{id:'4',...}]},
 * // ]
 * ```
 */
export function groupItems<T extends SearchableItem>(
  items: T[],
  {ungroupedFirst = false}: GroupItemsOptions = {},
): ItemGroup<T>[] {
  const hasGroups = items.some(item => getItemGroup(item) != null);

  if (!hasGroups) {
    return [{heading: null, items}];
  }

  const groupOrder: string[] = [];
  const groups = new Map<string, T[]>();
  const ungrouped: T[] = [];

  for (const item of items) {
    const group = getItemGroup(item);
    if (group != null) {
      if (!groups.has(group)) {
        groupOrder.push(group);
        groups.set(group, []);
      }
      groups.get(group)?.push(item);
    } else {
      ungrouped.push(item);
    }
  }

  const namedGroups: ItemGroup<T>[] = groupOrder.map(heading => ({
    heading,
    items: groups.get(heading) ?? [],
  }));
  const ungroupedGroup: ItemGroup<T>[] =
    ungrouped.length > 0 ? [{heading: null, items: ungrouped}] : [];

  return ungroupedFirst
    ? [...ungroupedGroup, ...namedGroups]
    : [...namedGroups, ...ungroupedGroup];
}
