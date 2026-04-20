'use client';

import {useState} from 'react';
import {XDSFormLayout} from '@xds/core/FormLayout';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSSelector} from '@xds/core/Selector';
import {XDSField} from '@xds/core/Field';

export default function FormLayoutMixedControls() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('viewer');

  return (
    <XDSFormLayout>
      <XDSTextInput label="Name" value={name} onChange={setName} />
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
      <XDSField label="Notifications" inputID="notif-group">
        <div
          id="notif-group"
          style={{display: 'flex', flexDirection: 'column', gap: 4}}>
          <label style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <input type="checkbox" defaultChecked /> Email
          </label>
          <label style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <input type="checkbox" /> SMS
          </label>
          <label style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <input type="checkbox" defaultChecked /> Push
          </label>
        </div>
      </XDSField>
    </XDSFormLayout>
  );
}
