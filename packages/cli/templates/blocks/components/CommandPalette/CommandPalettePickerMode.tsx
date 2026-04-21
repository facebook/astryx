'use client';

import {useState, useMemo} from 'react';
import {XDSCommandPalette} from '@xds/core/CommandPalette';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {createStaticSource} from '@xds/core/Typeahead';

export default function CommandPalettePickerMode() {
  const [isOpen, setIsOpen] = useState(false);
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
    <>
      <XDSButton label={`Theme: ${theme}`} onClick={() => setIsOpen(true)} />
      <XDSCommandPalette
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        searchSource={source}
        value={theme}
        onValueChange={v => {
          setTheme(v);
          setIsOpen(false);
        }}
        renderItem={(item, isSelected) => (
          <span
            style={{display: 'flex', alignItems: 'center', gap: 8, flex: 1}}>
            <span style={{flex: 1}}>{item.label}</span>
            {isSelected && <XDSIcon icon="check" size="sm" />}
          </span>
        )}
      />
    </>
  );
}
