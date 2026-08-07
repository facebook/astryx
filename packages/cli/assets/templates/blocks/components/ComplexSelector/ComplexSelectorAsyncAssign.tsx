// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {
  ComplexSelector,
  type ComplexSelectorStatus,
} from '@astryxdesign/core/ComplexSelector';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';

const REVIEWERS = [
  {
    value: 'sarah-chen',
    label: 'Sarah Chen',
    description: 'Design systems · 2 open reviews',
  },
  {
    value: 'marcus-webb',
    label: 'Marcus Webb',
    description: 'Accessibility · 5 open reviews',
  },
  {
    value: 'priya-raman',
    label: 'Priya Raman',
    description: 'Platform · 1 open review',
  },
];

export default function ComplexSelectorAsyncAssign() {
  const [reviewer, setReviewer] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const selected = REVIEWERS.find(option => option.value === reviewer);

  let status: ComplexSelectorStatus | undefined;
  if (selected == null) {
    status = {type: 'error', message: 'Every draft needs a reviewer'};
  } else if (isSaved) {
    status = {type: 'success', message: `Assigned to ${selected.label}`};
  }

  return (
    <ComplexSelector
      label="Reviewer"
      description="Assignments save as soon as you pick someone"
      width={320}
      isRequired
      value={reviewer}
      onChange={value => {
        setReviewer(value);
        setIsSaved(false);
      }}
      changeAction={async () => {
        await new Promise(resolve => {
          setTimeout(resolve, 900);
        });
        setIsSaved(true);
      }}
      placeholder="Unassigned"
      triggerLabel={selected?.label}
      status={status}>
      {(value, onChange, close) => (
        <RadioList
          label="Reviewer"
          isLabelHidden
          value={value}
          onChange={nextValue => {
            onChange(nextValue);
            close();
          }}>
          {REVIEWERS.map(option => (
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
