// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {FormLayout} from '@xds/core/FormLayout';
import {TextInput} from '@xds/core/TextInput';

export default function FormLayoutShowcase() {
  const [first, setFirst] = useState('Priya');
  const [last, setLast] = useState('Sharma');
  const [email, setEmail] = useState('priya.sharma@example.com');
  const [city, setCity] = useState('San Francisco');
  const [state, setState] = useState('CA');
  const [zip, setZip] = useState('94105');

  return (
    <FormLayout>
      <FormLayout direction="horizontal">
        <TextInput label="First Name" value={first} onChange={setFirst} />
        <TextInput label="Last Name" value={last} onChange={setLast} />
      </FormLayout>
      <TextInput label="Email" value={email} onChange={setEmail} />
      <FormLayout direction="horizontal">
        <TextInput label="City" value={city} onChange={setCity} />
        <TextInput label="State" value={state} onChange={setState} />
        <TextInput label="ZIP" value={zip} onChange={setZip} />
      </FormLayout>
    </FormLayout>
  );
}
