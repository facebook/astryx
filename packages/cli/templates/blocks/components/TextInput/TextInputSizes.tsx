'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

const SIZES = [
  {size: 'sm' as const, label: 'Zip code', placeholder: '10001'},
  {size: 'md' as const, label: 'City', placeholder: 'New York'},
  {size: 'lg' as const, label: 'Street address', placeholder: '350 Fifth Avenue'},
];

export default function TextInputSizes() {
  const [values, setValues] = useState<Record<string, string>>({});

  return (
    <XDSStack direction="vertical" gap={4}>
      {SIZES.map(({size, label, placeholder}) => (
        <XDSStack key={size} direction="vertical" gap={1}>
          <XDSText type="supporting" color="secondary">
            {size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'}
          </XDSText>
          <XDSTextInput
            label={label}
            value={values[size] ?? ''}
            onChange={(v) => setValues((prev) => ({...prev, [size]: v}))}
            placeholder={placeholder}
            size={size}
          />
        </XDSStack>
      ))}
    </XDSStack>
  );
}
