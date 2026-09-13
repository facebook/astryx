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
import {
  flattenComponentSidebarEntries,
  getComponentSidebarData,
} from '../components/componentSidebarData';
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
      .filter(item =>
        ['Component', 'Canary component'].includes(item.auxiliaryData.group),
      )
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

  it('includes canary-only component packages with canary metadata', () => {
    const entries = flattenComponentSidebarEntries();
    const items = buildItems();
    const canaryPackages = new Set(
      packages.filter(pkg => pkg.canaryOnly).map(pkg => pkg.name),
    );
    const canaryEntries = entries.filter(entry =>
      canaryPackages.has(entry.packageName),
    );

    expect(canaryEntries.length).toBeGreaterThan(0);
    expect(canaryEntries.every(entry => !entry.isReady)).toBe(true);
    expect(
      canaryEntries.every(entry => {
        const item = items.find(item => item.id === entry.href);
        return (
          item?.auxiliaryData.isReady === false &&
          item.auxiliaryData.group === 'Canary component'
        );
      }),
    ).toBe(true);
    expect(
      entries
        .filter(entry => !canaryPackages.has(entry.packageName))
        .every(entry => entry.isReady),
    ).toBe(true);
  });

  it('keeps ready families unified and groups canary components by package', () => {
    const {componentItems, canaryCategories} = getComponentSidebarData();
    const readyGroups = componentItems.filter(item => item.type === 'group');

    expect(readyGroups.filter(group => group.label === 'Chat')).toHaveLength(1);
    expect(
      readyGroups
        .find(group => group.label === 'Chat')
        ?.entries.every(entry => entry.isReady),
    ).toBe(true);

    expect(canaryCategories.map(category => category.displayName)).toEqual([
      'Charts',
      'Lab',
      'Rich Text',
      'Vega',
    ]);
    const chartEntries = canaryCategories.flatMap(category =>
      category.componentItems.flatMap(item =>
        item.type === 'entry' || item.label !== 'Charts' ? [] : item.entries,
      ),
    );
    expect(chartEntries.map(entry => entry.name)).toEqual(
      expect.arrayContaining(['Chart', 'ChartSwatch', 'ChartBar', 'ChartLine']),
    );
    expect(chartEntries.every(entry => !entry.isReady)).toBe(true);

    const lab = canaryCategories.find(
      category => category.displayName === 'Lab',
    );
    const threeD = lab?.componentItems.find(
      item => item.type === 'group' && item.label === '3D',
    );
    expect(threeD?.displayName).toBe('3D');
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
