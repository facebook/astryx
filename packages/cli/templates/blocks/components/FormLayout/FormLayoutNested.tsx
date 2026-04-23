'use client';

import {useState} from 'react';
import {XDSFormLayout} from '@xds/core/FormLayout';
import {XDSTextInput} from '@xds/core/TextInput';

export default function FormLayoutNested() {
  const [first, setFirst] = useState('Priya');
  const [last, setLast] = useState('Sharma');
  const [email, setEmail] = useState('priya.sharma@example.com');
  const [city, setCity] = useState('San Francisco');
  const [state, setState] = useState('CA');
  const [zip, setZip] = useState('94105');

  return (
    <XDSFormLayout>
      <XDSFormLayout direction="horizontal">
        <XDSTextInput label="First Name" value={first} onChange={setFirst} />
        <XDSTextInput label="Last Name" value={last} onChange={setLast} />
      </XDSFormLayout>
      <XDSTextInput label="Email" value={email} onChange={setEmail} />
      <XDSFormLayout direction="horizontal">
        <XDSTextInput label="City" value={city} onChange={setCity} />
        <XDSTextInput label="State" value={state} onChange={setState} />
        <XDSTextInput label="ZIP" value={zip} onChange={setZip} />
      </XDSFormLayout>
    </XDSFormLayout>
  );
}
