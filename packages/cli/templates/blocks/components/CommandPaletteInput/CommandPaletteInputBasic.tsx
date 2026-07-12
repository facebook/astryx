// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useMemo} from 'react';
import {
  CommandPalette,
  CommandPaletteInput,
} from '@astryxdesign/core/CommandPalette';
import {Kbd} from '@astryxdesign/core/Kbd';
import {createStaticSource} from '@astryxdesign/core/Typeahead';

export default function CommandPaletteInputBasic() {
  const source = useMemo(
    () =>
      createStaticSource([
        {id: 'home', label: 'Home'},
        {id: 'settings', label: 'Settings'},
        {id: 'profile', label: 'Profile'},
        {id: 'help', label: 'Help'},
      ]),
    [],
  );

  return (
    <CommandPalette
      isOpen
      isInline
      onOpenChange={() => {}}
      searchSource={source}
      input={
        <CommandPaletteInput
          placeholder="Search commands, files, or actions..."
          endContent={<Kbd keys="mod+k" />}
        />
      }
    />
  );
}
