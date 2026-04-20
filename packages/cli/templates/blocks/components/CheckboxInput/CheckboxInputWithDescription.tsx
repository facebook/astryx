'use client';

import {useState} from 'react';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';

export default function CheckboxInputWithDescription() {
  const [value, setValue] = useState<boolean | 'indeterminate'>(false);
  return (
    <XDSCheckboxInput
      label="Subscribe to newsletter"
      description="Receive weekly updates about new features and announcements."
      value={value}
      onChange={setValue}
    />
  );
}
