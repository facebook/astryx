// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useMemo} from 'react';
import {XDSCommandPalette} from '@xds/core/CommandPalette';
import {XDSText} from '@xds/core/Text';
import {XDSKbd} from '@xds/core/Kbd';
import {createStaticSource} from '@xds/core/Typeahead';
import type {XDSSearchableItem} from '@xds/core/Typeahead';

type RichCommand = XDSSearchableItem<{
  group?: string;
  shortcut?: string;
}>;

const commands: RichCommand[] = [
  {
    id: 'settings',
    label: 'Open Settings',
    auxiliaryData: {group: 'Navigation', shortcut: 'mod+,'},
  },
  {
    id: 'profile',
    label: 'View Profile',
    auxiliaryData: {group: 'Navigation'},
  },
  {
    id: 'new-file',
    label: 'Create New File',
    auxiliaryData: {group: 'Actions', shortcut: 'mod+n'},
  },
  {
    id: 'search',
    label: 'Search Files',
    auxiliaryData: {group: 'Actions', shortcut: 'mod+p'},
  },
];

export default function CommandPaletteRichItems() {
  const source = useMemo(() => createStaticSource(commands), []);

  return (
    <XDSCommandPalette
      isOpen
      isInline
      onOpenChange={() => {}}
      searchSource={source}
      renderItem={(item: RichCommand) => (
        <>
          <XDSText type="body" style={{flex: 1}}>
            {item.label}
          </XDSText>
          {item.auxiliaryData?.shortcut && (
            <XDSKbd keys={item.auxiliaryData.shortcut} />
          )}
        </>
      )}
    />
  );
}
