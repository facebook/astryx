// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useMemo} from 'react';
import {CommandPalette} from '@astryxdesign/core/CommandPalette';
import {Text} from '@astryxdesign/core/Text';
import {Kbd} from '@astryxdesign/core/Kbd';
import {createStaticSource} from '@astryxdesign/core/Typeahead';
import type {SearchableItem} from '@astryxdesign/core/Typeahead';

type RichCommand = SearchableItem<{
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
    <CommandPalette
      isOpen
      isInline
      onOpenChange={() => {}}
      searchSource={source}
      renderItem={(item: RichCommand) => (
        <>
          <Text type="body" style={{flex: 1}}>
            {item.label}
          </Text>
          {item.auxiliaryData?.shortcut && (
            <Kbd keys={item.auxiliaryData.shortcut} />
          )}
        </>
      )}
    />
  );
}
