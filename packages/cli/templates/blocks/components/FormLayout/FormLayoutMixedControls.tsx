'use client';

import {useState} from 'react';
import {XDSFormLayout} from '@xds/core/FormLayout';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSSelector} from '@xds/core/Selector';
import {XDSCheckboxList, XDSCheckboxListItem} from '@xds/core/CheckboxList';

export default function FormLayoutMixedControls() {
  const [name, setName] = useState('Maya Torres');
  const [role, setRole] = useState('editor');
  const [notifications, setNotifications] = useState(['email', 'push']);

  return (
    <XDSFormLayout>
      <XDSTextInput label="Full Name" value={name} onChange={setName} />
      <XDSSelector
        label="Role"
        value={role}
        onChange={v => setRole(v as string)}
        options={[
          {label: 'Viewer', value: 'viewer'},
          {label: 'Editor', value: 'editor'},
          {label: 'Admin', value: 'admin'},
        ]}
      />
      <XDSCheckboxList
        label="Notifications"
        value={notifications}
        onChange={setNotifications}>
        <XDSCheckboxListItem label="Email" value="email" />
        <XDSCheckboxListItem label="SMS" value="sms" />
        <XDSCheckboxListItem label="Push" value="push" />
      </XDSCheckboxList>
    </XDSFormLayout>
  );
}
