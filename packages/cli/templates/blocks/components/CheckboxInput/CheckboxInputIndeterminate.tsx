'use client';

import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {useState} from 'react';

export default function CheckboxInputIndeterminate() {
  const [value, setValue] = useState<boolean | 'indeterminate'>('indeterminate');
  return (
    <XDSCheckboxInput
      label="Select all items"
      value={value}
      onChange={(checked) => setValue(checked)}
    />
  );
}

export const showcase = {
  aspectRatio: 4 / 3,
  render: CheckboxInputIndeterminate,
};
