// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {FormLayout} from '@astryxdesign/core/FormLayout';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Selector} from '@astryxdesign/core/Selector';
import {CheckboxList, CheckboxListItem} from '@astryxdesign/core/CheckboxList';

export default function FormLayoutMixedControls() {
  const [name, setName] = useState('Maya Torres');
  const [role, setRole] = useState('editor');
  const [notifications, setNotifications] = useState(['email', 'push']);

  return (
    <FormLayout>
      <TextInput label="Full Name" value={name} onChange={setName} />
      <Selector
        label="Role"
        value={role}
        onChange={v => setRole(v as string)}
        options={[
          {label: 'Viewer', value: 'viewer'},
          {label: 'Editor', value: 'editor'},
          {label: 'Admin', value: 'admin'},
        ]}
      />
      <CheckboxList
        label="Notifications"
        value={notifications}
        onChange={setNotifications}>
        <CheckboxListItem label="Email" value="email" />
        <CheckboxListItem label="SMS" value="sms" />
        <CheckboxListItem label="Push" value="push" />
      </CheckboxList>
    </FormLayout>
  );
}
