// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState, useMemo} from 'react';
import {XDSCommandPalette} from '@xds/core/CommandPalette';
import {XDSText} from '@xds/core/Text';
import {XDSIcon} from '@xds/core/Icon';
import {createStaticSource} from '@xds/core/Typeahead';

export default function CommandPalettePickerMode() {
  const [theme, setTheme] = useState('light');
  const source = useMemo(
    () =>
      createStaticSource([
        {id: 'light', label: 'Light'},
        {id: 'dark', label: 'Dark'},
        {id: 'system', label: 'System'},
      ]),
    [],
  );

  return (
    <XDSCommandPalette
      isOpen
      isInline
      onOpenChange={() => {}}
      searchSource={source}
      value={theme}
      onValueChange={setTheme}
      renderItem={(item, isSelected) => (
        <>
          <XDSText type="body" style={{flex: 1}}>
            {item.label}
          </XDSText>
          {isSelected && <XDSIcon icon="check" size="sm" />}
        </>
      )}
    />
  );
}
