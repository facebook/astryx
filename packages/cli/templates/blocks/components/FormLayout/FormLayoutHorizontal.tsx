// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {FormLayout} from '@xds/core/FormLayout';
import {TextInput} from '@xds/core/TextInput';

const styles = stylex.create({
  layout: {width: '100%', maxWidth: 400},
});

export default function FormLayoutHorizontal() {
  const [first, setFirst] = useState('Jordan');
  const [last, setLast] = useState('Rivera');

  return (
    <FormLayout direction="horizontal" xstyle={styles.layout}>
      <TextInput label="First Name" value={first} onChange={setFirst} />
      <TextInput label="Last Name" value={last} onChange={setLast} />
    </FormLayout>
  );
}
