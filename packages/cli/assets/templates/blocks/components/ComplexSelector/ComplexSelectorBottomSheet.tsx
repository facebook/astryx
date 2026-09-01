// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {ComplexSelector} from '@astryxdesign/core/ComplexSelector';
import {VStack} from '@astryxdesign/core/Layout';

const DENSITIES = ['Comfortable', 'Compact', 'Dense'] as const;
type Density = (typeof DENSITIES)[number];

export default function ComplexSelectorBottomSheet() {
  const [density, setDensity] = useState<Density>('Comfortable');

  return (
    <div style={{width: 320, maxWidth: '100%'}}>
      <ComplexSelector<Density>
        label="Table density"
        value={density}
        onChange={setDensity}
        triggerLabel={density}
        presentation="bottom-sheet">
        {(value, onChange, close) => (
          <VStack gap={2}>
            {DENSITIES.map(option => (
              <Button
                key={option}
                label={option}
                width="full"
                variant={value === option ? 'primary' : 'secondary'}
                onClick={() => {
                  onChange(option);
                  close();
                }}
              />
            ))}
          </VStack>
        )}
      </ComplexSelector>
    </div>
  );
}
