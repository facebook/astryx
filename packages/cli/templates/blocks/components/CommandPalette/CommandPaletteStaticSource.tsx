'use client';

import {useState} from 'react';
// @ts-expect-error migrated example
import {XDSCommandPalette, createStaticSource} from '@xds/core/CommandPalette';
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

export const showcase = {
  aspectRatio: 4 / 3,
  render: CommandPaletteStaticSource,
};
