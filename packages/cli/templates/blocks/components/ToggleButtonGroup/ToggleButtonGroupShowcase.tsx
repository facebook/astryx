// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {
  ToggleButton,
  ToggleButtonGroup,
} from '@xds/core/ToggleButton';
import {VStack} from '@xds/core/Layout';
import {Text} from '@xds/core/Text';

export default function ToggleButtonGroupShowcase() {
  const [view, setView] = useState<string | null>('grid');
  const [filters, setFilters] = useState<string[]>(['active']);

  return (
    <VStack gap={4}>
      <VStack gap={1}>
        <Text type="label" color="secondary">
          Single select
        </Text>
        <ToggleButtonGroup value={view} onChange={setView} label="View mode">
          <ToggleButton value="list" label="List" />
          <ToggleButton value="grid" label="Grid" />
          <ToggleButton value="board" label="Board" />
        </ToggleButtonGroup>
      </VStack>
      <VStack gap={1}>
        <Text type="label" color="secondary">
          Multi select
        </Text>
        <ToggleButtonGroup
          type="multiple"
          value={filters}
          onChange={setFilters}
          label="Status filters">
          <ToggleButton value="active" label="Active" />
          <ToggleButton value="pending" label="Pending" />
          <ToggleButton value="closed" label="Closed" />
        </ToggleButtonGroup>
      </VStack>
    </VStack>
  );
}
