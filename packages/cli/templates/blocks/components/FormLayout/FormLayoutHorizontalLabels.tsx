'use client';

import {useState} from 'react';
import {XDSFormLayout} from '@xds/core/FormLayout';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSSelector} from '@xds/core/Selector';

export default function FormLayoutHorizontalLabels() {
  const [name, setName] = useState('');
  const [tz, setTz] = useState('UTC');

  const tzs = [
    {label: 'UTC', value: 'UTC'},
    {label: 'US/Eastern', value: 'US/Eastern'},
    {label: 'US/Pacific', value: 'US/Pacific'},
    {label: 'Europe/London', value: 'Europe/London'},
  ];

  return (
    <XDSFormLayout direction="horizontal-labels">
      <XDSTextInput label="Display Name" value={name} onChange={setName} />
      <XDSSelector label="Timezone" value={tz} onChange={setTz} options={tzs} />
    </XDSFormLayout>
  );
}
