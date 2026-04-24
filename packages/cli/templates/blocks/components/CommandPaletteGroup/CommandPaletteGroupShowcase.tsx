'use client';

import {useMemo} from 'react';
import {XDSCommandPalette} from '@xds/core/CommandPalette';
import {createStaticSource} from '@xds/core/Typeahead';

export default function CommandPaletteGroupShowcase() {
  const source = useMemo(
    () =>
      createStaticSource([
        {
          id: 'index',
          label: 'index.tsx',
          auxiliaryData: {group: 'Recent Files'},
        },
        {
          id: 'app',
          label: 'App.tsx',
          auxiliaryData: {group: 'Recent Files'},
        },
        {
          id: 'settings',
          label: 'Open Settings',
          auxiliaryData: {group: 'Commands'},
        },
        {
          id: 'terminal',
          label: 'Toggle Terminal',
          auxiliaryData: {group: 'Commands'},
        },
        {
          id: 'theme',
          label: 'Color Theme',
          auxiliaryData: {group: 'Preferences'},
        },
        {
          id: 'font',
          label: 'Font Size',
          auxiliaryData: {group: 'Preferences'},
        },
      ]),
    [],
  );

  return (
    <XDSCommandPalette
      isOpen
      isInline
      onOpenChange={() => {}}
      searchSource={source}
    />
  );
}
