// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useMemo} from 'react';
import {
  CommandPalette,
  CommandPaletteList,
  CommandPaletteGroup,
  CommandPaletteItem,
} from '@xds/core/CommandPalette';
import {createStaticSource} from '@xds/core/Typeahead';
import {Stack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

export default function CommandPaletteGroupShowcase() {
  const source = useMemo(
    () =>
      createStaticSource([
        {id: 'index', label: 'index.tsx', auxiliaryData: {group: 'Recent Files'}},
        {id: 'app', label: 'App.tsx', auxiliaryData: {group: 'Recent Files'}},
        {id: 'settings', label: 'Open Settings', auxiliaryData: {group: 'Commands'}},
        {id: 'terminal', label: 'Toggle Terminal', auxiliaryData: {group: 'Commands'}},
        {id: 'theme', label: 'Color Theme', auxiliaryData: {group: 'Preferences'}},
        {id: 'font', label: 'Font Size', auxiliaryData: {group: 'Preferences'}},
      ]),
    [],
  );

  return (
    <Stack direction="vertical" gap={4}>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Data-driven grouping (auxiliaryData.group)
        </Text>
        <CommandPalette
          isOpen
          isInline
          onOpenChange={() => {}}
          searchSource={source}
        />
      </Stack>
      <Stack direction="vertical" gap={1}>
        <Text type="supporting" color="secondary">
          Composed form (CommandPaletteGroup + CommandPaletteItem)
        </Text>
        <CommandPaletteList>
          <CommandPaletteGroup heading="Navigation">
            <CommandPaletteItem value="home" onSelect={() => {}}>
              Home
            </CommandPaletteItem>
            <CommandPaletteItem value="dashboard" onSelect={() => {}}>
              Dashboard
            </CommandPaletteItem>
          </CommandPaletteGroup>
          <CommandPaletteGroup heading="Actions">
            <CommandPaletteItem value="new-file" onSelect={() => {}}>
              New File
            </CommandPaletteItem>
            <CommandPaletteItem value="save" onSelect={() => {}}>
              Save All
            </CommandPaletteItem>
          </CommandPaletteGroup>
        </CommandPaletteList>
      </Stack>
    </Stack>
  );
}
