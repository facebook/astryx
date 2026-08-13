// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {FormLayout} from '@astryxdesign/core/FormLayout';
import {TextInput} from '@astryxdesign/core/TextInput';

export default function FormLayoutHorizontal() {
  const [first, setFirst] = useState('Jordan');
  const [last, setLast] = useState('Rivera');

  return (
    <FormLayout direction="horizontal" style={{width: '100%', maxWidth: 400}}>
      <TextInput label="First Name" value={first} onChange={setFirst} />
      <TextInput label="Last Name" value={last} onChange={setLast} />
    </FormLayout>
  );
}
