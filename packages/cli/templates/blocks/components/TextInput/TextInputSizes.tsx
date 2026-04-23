'use client';

import {useState} from 'react';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSStack} from '@xds/core/Layout';

export default function TextInputSizes() {
  const [sm, setSm] = useState('');
  const [md, setMd] = useState('');
  const [lg, setLg] = useState('');

  return (
    <div style={{width: 300}}>
      <XDSStack direction="vertical" gap={3}>
        <XDSTextInput
          label="Small"
          value={sm}
          onChange={setSm}
          placeholder="Enter a value"
          size="sm"
        />
        <XDSTextInput
          label="Medium"
          value={md}
          onChange={setMd}
          placeholder="Enter a value"
          size="md"
        />
        <XDSTextInput
          label="Large"
          value={lg}
          onChange={setLg}
          placeholder="Enter a value"
          size="lg"
        />
      </XDSStack>
    </div>
  );
}
