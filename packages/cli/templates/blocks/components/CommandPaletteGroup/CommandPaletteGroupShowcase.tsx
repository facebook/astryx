'use client';

import {useMemo} from 'react';
import {
  XDSCommandPalette,
  XDSCommandPaletteList,
  XDSCommandPaletteGroup,
  XDSCommandPaletteItem,
} from '@xds/core/CommandPalette';
import {createStaticSource} from '@xds/core/Typeahead';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

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
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Data-driven grouping (auxiliaryData.group)
        </XDSText>
        <XDSCommandPalette
          isOpen
          isInline
          onOpenChange={() => {}}
          searchSource={source}
        />
      </XDSStack>

      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Composed form (XDSCommandPaletteGroup + XDSCommandPaletteItem)
        </XDSText>
        <XDSCommandPaletteList>
          <XDSCommandPaletteGroup heading="Navigation">
            <XDSCommandPaletteItem value="home" onSelect={() => {}}>
              Home
            </XDSCommandPaletteItem>
            <XDSCommandPaletteItem value="dashboard" onSelect={() => {}}>
              Dashboard
            </XDSCommandPaletteItem>
          </XDSCommandPaletteGroup>
          <XDSCommandPaletteGroup heading="Actions">
            <XDSCommandPaletteItem value="new-file" onSelect={() => {}}>
              New File
            </XDSCommandPaletteItem>
            <XDSCommandPaletteItem value="save" onSelect={() => {}}>
              Save All
            </XDSCommandPaletteItem>
          </XDSCommandPaletteGroup>
        </XDSCommandPaletteList>
      </XDSStack>
    </XDSStack>
  );
}
