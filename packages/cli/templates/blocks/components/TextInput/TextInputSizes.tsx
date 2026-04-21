'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSStack} from '@xds/core/Layout';

const SIZES = [
  {size: 'sm' as const, label: 'Zip code (small)', placeholder: '10001'},
  {size: 'md' as const, label: 'City (medium)', placeholder: 'New York'},
  {size: 'lg' as const, label: 'Street address (large)', placeholder: '350 Fifth Avenue'},
];

export default function TextInputSizes() {
  const [values, setValues] = useState<Record<string, string>>({});

  return (
    <XDSStack direction="vertical" gap={3}>
      {SIZES.map(({size, label, placeholder}) => (
        <XDSTextInput
          key={size}
          label={label}
          value={values[size] ?? ''}
          onChange={(v) => setValues((prev) => ({...prev, [size]: v}))}
          placeholder={placeholder}
          size={size}
        />
      ))}
    </XDSStack>
  );
}
