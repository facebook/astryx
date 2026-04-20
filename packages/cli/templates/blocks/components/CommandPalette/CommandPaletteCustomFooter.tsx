'use client';

import {useState, useMemo} from 'react';
import {
  XDSCommandPalette,
  XDSCommandPaletteFooter,
} from '@xds/core/CommandPalette';
import {XDSButton} from '@xds/core/Button';
import {createStaticSource} from '@xds/core/Typeahead';

export default function CommandPaletteCustomFooter() {
  const [isOpen, setIsOpen] = useState(false);
  const source = useMemo(
    () =>
      createStaticSource([
        {id: 'home', label: 'Home'},
        {id: 'settings', label: 'Settings'},
      ]),
    [],
  );

  return (
    <>
      <XDSButton label="Open" onClick={() => setIsOpen(true)} />
      <XDSCommandPalette
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        searchSource={source}
        footer={
          <XDSCommandPaletteFooter>
            <span>Pro tip: use ⌘K to open anywhere</span>
          </XDSCommandPaletteFooter>
        }
      />
    </>
  );
}
