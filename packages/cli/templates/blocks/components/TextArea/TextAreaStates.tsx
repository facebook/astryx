// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSTextArea} from '@xds/core/TextArea';
import {XDSStack} from '@xds/core/Layout';

export default function TextAreaStates() {
  const [requiredValue, setRequiredValue] = useState('');

  return (
    <XDSStack direction="vertical" gap={4} style={{width: 400}}>
      <XDSTextArea
        label="Required field"
        value={requiredValue}
        onChange={setRequiredValue}
        placeholder="Describe the issue..."
        isRequired
      />
      <XDSTextArea
        label="Disabled field"
        value="This field is read-only and cannot be edited."
        onChange={() => {}}
        isDisabled
      />
      <XDSTextArea
        label="Loading field"
        value=""
        onChange={() => {}}
        placeholder="Generating summary..."
        isLoading
      />
    </XDSStack>
  );
}
