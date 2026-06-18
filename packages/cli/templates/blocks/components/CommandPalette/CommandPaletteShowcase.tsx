// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useMemo} from 'react';
import {CommandPalette} from '@xds/core/CommandPalette';
import {createStaticSource} from '@xds/core/Typeahead';

// Remove isInline for production — command palettes should be modal.
export default function CommandPaletteShowcase() {
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
    <CommandPalette
      isOpen
      isInline
      onOpenChange={() => {}}
      searchSource={source}
    />
  );
}
