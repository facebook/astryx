// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {TextInput} from '@xds/core/TextInput';
import {Stack} from '@xds/core/Layout';

export default function TextInputSizes() {
  const [sm, setSm] = useState('');
  const [md, setMd] = useState('');
  const [lg, setLg] = useState('');

  return (
    <div style={{width: 300}}>
      <Stack direction="vertical" gap={3}>
        <TextInput
          label="Small"
          value={sm}
          onChange={setSm}
          placeholder="Enter a value"
          size="sm"
        />
        <TextInput
          label="Medium"
          value={md}
          onChange={setMd}
          placeholder="Enter a value"
          size="md"
        />
        <TextInput
          label="Large"
          value={lg}
          onChange={setLg}
          placeholder="Enter a value"
          size="lg"
        />
      </Stack>
    </div>
  );
}
