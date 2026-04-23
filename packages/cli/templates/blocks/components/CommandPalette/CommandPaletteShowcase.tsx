'use client';

import {useState, useMemo} from 'react';
import {XDSCommandPalette} from '@xds/core/CommandPalette';
import {XDSButton} from '@xds/core/Button';
import {createStaticSource} from '@xds/core/Typeahead';

export default function CommandPaletteShowcase() {
  const [isOpen, setIsOpen] = useState(false);
  const source = useMemo(
    () =>
      createStaticSource([
        {id: 'home', label: 'Home'},
        {id: 'settings', label: 'Settings'},
        {id: 'profile', label: 'Profile'},
        {id: 'dashboard', label: 'Dashboard'},
        {id: 'help', label: 'Help'},
      ]),
    [],
  );

  return (
    <>
      <XDSButton label="Open Command Palette" onClick={() => setIsOpen(true)} />
      <XDSCommandPalette
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        searchSource={source}
      />
    </>
  );
}
