'use client';

import {useState} from 'react';
import {XDSSelector} from '@xds/core/Selector';
import {XDSCenter} from '@xds/core/Center';

export default function SelectorClearable() {
  const [value, setValue] = useState<string | null>('engineering');
  return (
    <XDSCenter width={250}>
      <XDSSelector
        label="Department"
        options={[
          {value: 'engineering', label: 'Engineering'},
          {value: 'design', label: 'Design'},
          {value: 'marketing', label: 'Marketing'},
          {value: 'sales', label: 'Sales'},
        ]}
        value={value}
        onChange={setValue}
        placeholder="Choose a department..."
        hasClear
      />
    </XDSCenter>
  );
}
