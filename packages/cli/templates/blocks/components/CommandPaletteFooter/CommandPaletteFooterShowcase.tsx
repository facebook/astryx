'use client';

import {useMemo} from 'react';
import {
  XDSCommandPalette,
  XDSCommandPaletteFooter,
} from '@xds/core/CommandPalette';
import {XDSText} from '@xds/core/Text';
import {createStaticSource} from '@xds/core/Typeahead';

export default function CommandPaletteFooterShowcase() {
  const source = useMemo(
    () =>
      createStaticSource([
        {id: 'new-file', label: 'New File'},
        {id: 'open-recent', label: 'Open Recent'},
        {id: 'save-all', label: 'Save All'},
      ]),
    [],
  );

  return (
    <XDSCommandPalette
      isOpen
      isInline
      onOpenChange={() => {}}
      searchSource={source}
      footer={
        <XDSCommandPaletteFooter>
          <XDSText type="supporting" color="secondary">
            Tip: Press ⌘K anywhere to open the command palette
          </XDSText>
        </XDSCommandPaletteFooter>
      }
    />
  );
}
