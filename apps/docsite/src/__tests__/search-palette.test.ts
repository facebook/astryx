// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Search palette data tests.
 *
 * Validates that the global docsite command palette indexes the same component
 * links as the sidebar.
 */

import {describe, it, expect} from 'vitest';
import {components} from '../generated/componentRegistry';
import {packages} from '../generated/packageRegistry';
import {docTopics} from '../generated/docsRegistry';
import {templates} from '../generated/templateRegistry';
import {flattenComponentSidebarEntries} from '../components/componentSidebarData';
import {
  buildSearchPaletteItems,
  getSearchItemKeywords,
} from '../components/searchPaletteData';

function buildItems() {
  return buildSearchPaletteItems({
    components,
    packages,
    docTopics,
    templates,
  });
}

function searchItems(query: string) {
  const lower = query.toLowerCase().trim();
  return buildItems().filter(
    item =>
      item.label.toLowerCase().includes(lower) ||
      getSearchItemKeywords(item).some(kw => kw.toLowerCase().includes(lower)),
  );
}

describe('SearchPalette data', () => {
  it('uses the sidebar entries as the command palette component set', () => {
    const componentIds = buildItems()
      .filter(item => item.auxiliaryData.group === 'Component')
      .map(item => item.id);
    const sidebarIds = flattenComponentSidebarEntries().map(
      entry => entry.href,
    );

    expect(new Set(componentIds).size).toBe(componentIds.length);
    expect(new Set(componentIds)).toEqual(new Set(sidebarIds));
    expect(componentIds).toContain('/components/DropdownMenu');
    expect(componentIds).toContain('/components/DropdownMenuItem');
    expect(componentIds).toContain('/components/CommandPalette');
    expect(componentIds).toContain('/components/Table');
  });

  it('finds Dropdown Menu by spaced display name and PascalCase API name', () => {
    const items = buildItems();
    const dropdown = items.find(item => item.id === '/components/DropdownMenu');
    expect(dropdown?.label).toBe('Dropdown Menu');

    expect(searchItems('dropdown menu').map(item => item.id)).toContain(
      '/components/DropdownMenu',
    );
    expect(searchItems('DropdownMenu').map(item => item.id)).toContain(
      '/components/DropdownMenu',
    );
  });

  it('finds AppShell when searching for app shell with a space', () => {
    const items = buildItems();
    const appShell = items.find(item => item.id === '/components/AppShell');
    expect(appShell?.label).toBe('App Shell');

    expect(searchItems('app shell').map(item => item.id)).toContain(
      '/components/AppShell',
    );
  });
});
