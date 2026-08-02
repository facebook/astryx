// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useMemo} from 'react';
import {
  CommandPalette,
  CommandPaletteFooter,
} from '@astryxdesign/core/CommandPalette';
import {Text} from '@astryxdesign/core/Text';
import {createStaticSource} from '@astryxdesign/core/Typeahead';

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
    <CommandPalette
      isOpen
      isInline
      onOpenChange={() => {}}
      searchSource={source}
      footer={
        <CommandPaletteFooter>
          <Text type="supporting" color="secondary">
            Tip: Press ⌘K anywhere to open the command palette
          </Text>
        </CommandPaletteFooter>
      }
    />
  );
}
