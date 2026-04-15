'use client';

import {useState} from 'react';
import {XDSCommandPalette} from '@xds/core/CommandPalette';
import {createStaticSource} from '@xds/core/Typeahead';
import {XDSButton} from '@xds/core/Button';

const source = createStaticSource([
  {id: 'home', label: 'Home'},
  {id: 'settings', label: 'Settings'},
  {id: 'logout', label: 'Sign out'},
]);

export default function CommandPaletteStaticSource() {
  const [isOpen, setIsOpen] = useState(false);

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
