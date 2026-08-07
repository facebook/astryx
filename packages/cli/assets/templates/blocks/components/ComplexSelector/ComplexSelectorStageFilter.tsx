// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {CheckboxList, CheckboxListItem} from '@astryxdesign/core/CheckboxList';
import {ComplexSelector} from '@astryxdesign/core/ComplexSelector';
import {VStack} from '@astryxdesign/core/Layout';

const STAGES = [
  {value: 'discovery', label: 'Discovery'},
  {value: 'in-review', label: 'In review'},
  {value: 'approved', label: 'Approved'},
  {value: 'shipped', label: 'Shipped'},
];

export default function ComplexSelectorStageFilter() {
  const [stages, setStages] = useState<string[]>(['in-review', 'approved']);

  return (
    <ComplexSelector<string[]>
      label="Pipeline stages"
      description="Filter the roadmap by delivery stage"
      width={320}
      value={stages}
      onChange={setStages}
      placeholder="All stages"
      triggerLabel={
        stages.length > 0
          ? `${stages.length} of ${STAGES.length} stages`
          : undefined
      }>
      {(value, onChange, close) => (
        <VStack gap={3}>
          <CheckboxList
            label="Pipeline stages"
            isLabelHidden
            value={value}
            onChange={onChange}>
            {STAGES.map(stage => (
              <CheckboxListItem
                key={stage.value}
                label={stage.label}
                value={stage.value}
              />
            ))}
          </CheckboxList>
          <Button label="Apply filters" variant="primary" onClick={close} />
        </VStack>
      )}
    </ComplexSelector>
  );
}
