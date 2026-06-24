// Copyright (c) Meta Platforms, Inc. and affiliates.

import {groupedComponents} from '../generated/groupedComponentRegistry';
import type {
  ComponentItem,
  GroupedEntry,
} from '../generated/groupedComponentRegistry';

export interface ComponentSidebarData {
  componentItems: ComponentItem[];
  utilities: Array<{name: string; displayName: string; href: string}>;
}

/**
 * Single source of truth for the component sidebar. Other navigation surfaces
 * that should mirror the sidebar (for example the command palette) should use
 * this helper instead of independently filtering componentRegistry entries.
 */
export function getComponentSidebarData(): ComponentSidebarData {
  const grouped = groupedComponents['@astryxdesign/core'];
  if (!grouped) {
    return {componentItems: [], utilities: []};
  }
  return {componentItems: grouped.items, utilities: grouped.utilities};
}

export function flattenComponentSidebarEntries(
  {componentItems, utilities}: ComponentSidebarData = getComponentSidebarData(),
): GroupedEntry[] {
  const entries: GroupedEntry[] = [];

  for (const item of componentItems) {
    if (item.type === 'entry') {
      entries.push(item);
    } else {
      entries.push(
        ...item.entries.map(entry => ({
          type: 'entry' as const,
          name: entry.name,
          displayName: entry.displayName,
          href: entry.href,
          description: '',
        })),
      );
    }
  }

  entries.push(
    ...utilities.map(entry => ({
      type: 'entry' as const,
      name: entry.name,
      displayName: entry.displayName,
      href: entry.href,
      description: '',
    })),
  );

  return entries;
}
