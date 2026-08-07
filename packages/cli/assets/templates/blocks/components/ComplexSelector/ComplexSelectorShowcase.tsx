// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {ComplexSelector} from '@astryxdesign/core/ComplexSelector';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';

const VISIBILITY_OPTIONS = [
  {
    value: 'private',
    label: 'Private',
    description: 'Only you can open this project',
  },
  {
    value: 'team',
    label: 'Design systems team',
    description: 'All 14 teammates can edit',
  },
  {
    value: 'company',
    label: 'Everyone at Northwind',
    description: 'Anyone signed in can view',
  },
];

export default function ComplexSelectorShowcase() {
  const [visibility, setVisibility] = useState('team');
  const selected = VISIBILITY_OPTIONS.find(
    option => option.value === visibility,
  );

  return (
    <ComplexSelector
      label="Project visibility"
      description="Who can open this project"
      width={320}
      value={visibility}
      onChange={setVisibility}
      triggerLabel={selected?.label}>
      {(value, onChange, close) => (
        <RadioList
          label="Project visibility"
          isLabelHidden
          value={value}
          onChange={nextValue => {
            onChange(nextValue);
            close();
          }}>
          {VISIBILITY_OPTIONS.map(option => (
            <RadioListItem
              key={option.value}
              label={option.label}
              value={option.value}
              description={option.description}
            />
          ))}
        </RadioList>
      )}
    </ComplexSelector>
  );
}
