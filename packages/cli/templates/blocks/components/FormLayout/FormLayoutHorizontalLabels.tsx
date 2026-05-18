// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSFormLayout} from '@xds/core/FormLayout';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSSelector} from '@xds/core/Selector';
import {XDSTextArea} from '@xds/core/TextArea';

export default function FormLayoutHorizontalLabels() {
  const [displayName, setDisplayName] = useState('Jane Doe');
  const [email, setEmail] = useState('jane@example.com');
  const [timezone, setTimezone] = useState('America/Los_Angeles');
  const [bio, setBio] = useState('');

  return (
    <XDSFormLayout direction="horizontal-labels">
      <XDSTextInput
        label="Display Name"
        value={displayName}
        onChange={setDisplayName}
      />
      <XDSTextInput label="Email" value={email} onChange={setEmail} />
      <XDSSelector
        label="Timezone"
        value={timezone}
        onChange={v => setTimezone(v as string)}
        options={[
          {label: 'Pacific Time', value: 'America/Los_Angeles'},
          {label: 'Eastern Time', value: 'America/New_York'},
          {label: 'UTC', value: 'UTC'},
        ]}
      />
      <XDSTextArea label="Bio" value={bio} onChange={setBio} rows={3} />
    </XDSFormLayout>
  );
}
