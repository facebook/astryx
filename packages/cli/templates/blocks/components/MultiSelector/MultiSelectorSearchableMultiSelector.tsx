'use client';

import {useState} from 'react';
import {XDSMultiSelector} from '@xds/core/MultiSelector';

const countries = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'Brazil',
  'India',
  'Mexico',
];

export default function MultiSelectorSearchableMultiSelector() {
  const [value, setValue] = useState<string[]>([]);
  return (
    <div style={{width: 300}}>
      <XDSMultiSelector
        label="Countries"
        options={countries}
        value={value}
        onChange={setValue}
        hasSearch
        hasSelectAll
        placeholder="Select countries..."
      />
    </div>
  );
}
