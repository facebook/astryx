// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useMemo} from 'react';
import {
  XDSCommandPalette,
  XDSCommandPaletteFooter,
} from '@xds/core/CommandPalette';
import {XDSText} from '@xds/core/Text';
import {createStaticSource} from '@xds/core/Typeahead';

export default function CommandPaletteCustomFooter() {
  const source = useMemo(
    () =>
      createStaticSource([
        {id: 'home', label: 'Home'},
        {id: 'settings', label: 'Settings'},
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
          <XDSText type="supporting">Pro tip: use ⌘K to open anywhere</XDSText>
        </XDSCommandPaletteFooter>
      }
    />
  );
}
