// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSFormLayout} from '@xds/core/FormLayout';
import {XDSTextInput} from '@xds/core/TextInput';

const styles = stylex.create({
  layout: {width: '100%', maxWidth: 400},
});

export default function FormLayoutHorizontal() {
  const [first, setFirst] = useState('Jordan');
  const [last, setLast] = useState('Rivera');

  return (
    <XDSFormLayout direction="horizontal" xstyle={styles.layout}>
      <XDSTextInput label="First Name" value={first} onChange={setFirst} />
      <XDSTextInput label="Last Name" value={last} onChange={setLast} />
    </XDSFormLayout>
  );
}
