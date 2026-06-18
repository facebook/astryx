// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {TextArea} from '@xds/core/TextArea';
import {Stack} from '@xds/core/Layout';

export default function TextAreaStates() {
  const [requiredValue, setRequiredValue] = useState('');

  return (
    <Stack direction="vertical" gap={4} style={{width: 400}}>
      <TextArea
        label="Required field"
        value={requiredValue}
        onChange={setRequiredValue}
        placeholder="Describe the issue..."
        isRequired
      />
      <TextArea
        label="Disabled field"
        value="This field is read-only and cannot be edited."
        onChange={() => {}}
        isDisabled
      />
      <TextArea
        label="Loading field"
        value=""
        onChange={() => {}}
        placeholder="Generating summary..."
        isLoading
      />
    </Stack>
  );
}
