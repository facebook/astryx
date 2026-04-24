'use client';

import {useMemo} from 'react';
import {XDSCommandPalette} from '@xds/core/CommandPalette';
import {XDSText} from '@xds/core/Text';
import {XDSKbd} from '@xds/core/Kbd';
import {createStaticSource} from '@xds/core/Typeahead';
import type {XDSSearchableItem} from '@xds/core/Typeahead';

type CommandItem = XDSSearchableItem<{shortcut?: string}>;

const commands: CommandItem[] = [
  {id: 'save', label: 'Save File', auxiliaryData: {shortcut: 'mod+s'}},
  {id: 'find', label: 'Find in Files', auxiliaryData: {shortcut: 'mod+shift+f'}},
  {id: 'palette', label: 'Command Palette', auxiliaryData: {shortcut: 'mod+shift+p'}},
  {id: 'terminal', label: 'Toggle Terminal', auxiliaryData: {shortcut: 'ctrl+`'}},
  {id: 'sidebar', label: 'Toggle Sidebar', auxiliaryData: {shortcut: 'mod+b'}},
];

export default function CommandPaletteItemShowcase() {
  const source = useMemo(() => createStaticSource(commands), []);

  return (
    <XDSCommandPalette
      isOpen
      isInline
      onOpenChange={() => {}}
      searchSource={source}
      renderItem={(item: CommandItem) => (
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
