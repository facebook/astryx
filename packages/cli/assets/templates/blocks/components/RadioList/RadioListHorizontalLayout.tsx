// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';

export default function RadioListHorizontalLayout() {
  const [value, setValue] = useState('md');

  return (
    <RadioList
      label="Size"
      orientation="horizontal"
      value={value}
      onChange={setValue}>
      <RadioListItem label="Small" value="sm" />
      <RadioListItem label="Medium" value="md" />
      <RadioListItem label="Large" value="lg" />
    </RadioList>
  );
}
