'use client';

import {useState, useMemo} from 'react';
import {XDSCommandPalette} from '@xds/core/CommandPalette';
import {XDSButton} from '@xds/core/Button';
import {createStaticSource} from '@xds/core/Typeahead';

export default function CommandPaletteAutoGrouped() {
  const [isOpen, setIsOpen] = useState(false);
  const source = useMemo(
    () =>
      createStaticSource([
        {id: 'home', label: 'Home', auxiliaryData: {group: 'Navigation'}},
        {
          id: 'settings',
          label: 'Settings',
          auxiliaryData: {group: 'Navigation'},
        },
        {
          id: 'profile',
          label: 'Profile',
          auxiliaryData: {group: 'Navigation'},
        },
        {
          id: 'new-file',
          label: 'New File',
          auxiliaryData: {group: 'Actions'},
        },
        {id: 'save', label: 'Save', auxiliaryData: {group: 'Actions'}},
        {id: 'export', label: 'Export', auxiliaryData: {group: 'Actions'}},
      ]),
    [],
  );

  return (
    <>
      <XDSButton label="Open Grouped" onClick={() => setIsOpen(true)} />
      <XDSCommandPalette
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        searchSource={source}
      />
    </>
  );
}
