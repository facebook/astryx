'use client';

import {useState} from 'react';
import {XDSCommandPalette} from '@xds/core/CommandPalette';
import {createStaticSource} from '@xds/core/Typeahead';
import {XDSButton} from '@xds/core/Button';

const source = createStaticSource([
  {id: 'new-file', label: 'New File', auxiliaryData: {group: 'Files'}},
  {id: 'open-file', label: 'Open File', auxiliaryData: {group: 'Files'}},
  {id: 'preferences', label: 'Preferences', auxiliaryData: {group: 'Settings'}},
  {id: 'shortcuts', label: 'Keyboard Shortcuts', auxiliaryData: {group: 'Settings'}},
]);

export default function CommandPaletteGroupedItems() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <XDSButton label="Open Grouped Palette" onClick={() => setIsOpen(true)} />
      <XDSCommandPalette
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        searchSource={source}
      />
    </>
  );
}
