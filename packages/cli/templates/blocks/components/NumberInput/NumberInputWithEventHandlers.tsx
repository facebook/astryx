'use client';

import {useState} from 'react';
import {XDSNumberInput} from '@xds/core/NumberInput';

export default function NumberInputWithEventHandlers() {
  const [value, setValue] = useState<number | null>(0);

  return (
    <XDSNumberInput
      label="Search"
      value={value}
      onChange={setValue}
      onEnter={() => {}}
      onFocus={() => {}}
      onBlur={() => {}}
    />
  );
}

export const showcase = {
  aspectRatio: 4 / 3,
  render: NumberInputWithEventHandlers,
};
