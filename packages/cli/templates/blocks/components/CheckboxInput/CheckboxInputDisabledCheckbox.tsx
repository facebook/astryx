'use client';

import {useState} from 'react';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';

export default function CheckboxInputDisabledCheckbox() {
  const [value, setValue] = useState<boolean | 'indeterminate'>(false);
  return (
    <XDSCheckboxInput
      label="Premium feature"
      description="Upgrade to enable this option"
      value={value}
      onChange={setValue}
      isDisabled
    />
  );
}
