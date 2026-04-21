'use client';

import {useState, useMemo} from 'react';
import {XDSCommandPalette} from '@xds/core/CommandPalette';
import {XDSButton} from '@xds/core/Button';
import {createStaticSource} from '@xds/core/Typeahead';
import type {XDSSearchableItem} from '@xds/core/Typeahead';

type RichCommand = XDSSearchableItem<{
  group?: string;
  shortcut?: string;
}>;

const commands: RichCommand[] = [
  {
    id: 'dashboard',
    label: 'Go to Dashboard',
    auxiliaryData: {group: 'Navigation'},
  },
  {
    id: 'settings',
    label: 'Open Settings',
    auxiliaryData: {group: 'Navigation', shortcut: '⌘,'},
  },
  {
    id: 'profile',
    label: 'View Profile',
    auxiliaryData: {group: 'Navigation'},
  },
  {
    id: 'dark-mode',
    label: 'Toggle Dark Mode',
    auxiliaryData: {group: 'Actions'},
  },
  {
    id: 'new-file',
    label: 'Create New File',
    auxiliaryData: {group: 'Actions', shortcut: '⌘N'},
  },
  {
    id: 'search',
    label: 'Search Files',
    auxiliaryData: {group: 'Actions', shortcut: '⌘P'},
  },
];

export default function CommandPaletteRichItems() {
  const [isOpen, setIsOpen] = useState(false);
  const source = useMemo(() => createStaticSource(commands), []);

  return (
    <>
      <XDSButton label="Open Rich Palette" onClick={() => setIsOpen(true)} />
      <XDSCommandPalette
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        searchSource={source}
        renderItem={(item: RichCommand) => (
          <span
            style={{display: 'flex', alignItems: 'center', gap: 8, flex: 1}}>
            <span style={{flex: 1}}>{item.label}</span>
            {item.auxiliaryData?.shortcut && (
              <span style={{fontSize: 12, opacity: 0.5}}>
                {item.auxiliaryData.shortcut}
              </span>
            )}
          </span>
        )}
      />
    </>
  );
}
