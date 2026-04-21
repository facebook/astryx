'use client';

import {XDSCommandPalette} from '@xds/core/CommandPalette';
import {XDSButton} from '@xds/core/Button';
import {createStaticSource} from '@xds/core/Typeahead';

const source = createStaticSource([
  {id: 'home', label: 'Home'},
  {id: 'settings', label: 'Settings'},
  {id: 'profile', label: 'Profile'},
  {id: 'dashboard', label: 'Dashboard'},
  {id: 'help', label: 'Help'},
]);

export default function CommandPaletteShowcase() {
  return (
    <>
      <XDSButton label="Open Command Palette" onClick={() => {}} />
      <XDSCommandPalette
        isOpen={false}
        onOpenChange={() => {}}
        searchSource={source}
      />
    </>
  );
}
