// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useMemo} from 'react';
import {CommandPalette} from '@xds/core/CommandPalette';
import {createStaticSource} from '@xds/core/Typeahead';

export default function CommandPaletteAutoGrouped() {
  const source = useMemo(
    () =>
      createStaticSource([
        {id: 'home', label: 'Home', auxiliaryData: {group: 'Navigation'}},
        {
          id: 'settings',
          label: 'Settings',
          auxiliaryData: {group: 'Navigation'},
        },
        {id: 'new-file', label: 'New File', auxiliaryData: {group: 'Actions'}},
        {id: 'save', label: 'Save', auxiliaryData: {group: 'Actions'}},
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
