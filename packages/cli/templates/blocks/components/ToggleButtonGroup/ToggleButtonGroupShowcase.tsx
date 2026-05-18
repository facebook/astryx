// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {
  XDSToggleButton,
  XDSToggleButtonGroup,
} from '@xds/core/ToggleButton';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function ToggleButtonGroupShowcase() {
  const [view, setView] = useState<string | null>('grid');
  const [filters, setFilters] = useState<string[]>(['active']);

  return (
    <XDSVStack gap={4}>
      <XDSVStack gap={1}>
        <XDSText type="label" color="secondary">
          Single select
        </XDSText>
        <XDSToggleButtonGroup value={view} onChange={setView} label="View mode">
          <XDSToggleButton value="list" label="List" />
          <XDSToggleButton value="grid" label="Grid" />
          <XDSToggleButton value="board" label="Board" />
        </XDSToggleButtonGroup>
      </XDSVStack>
      <XDSVStack gap={1}>
        <XDSText type="label" color="secondary">
          Multi select
        </XDSText>
        <XDSToggleButtonGroup
          type="multiple"
          value={filters}
          onChange={setFilters}
          label="Status filters">
          <XDSToggleButton value="active" label="Active" />
          <XDSToggleButton value="pending" label="Pending" />
          <XDSToggleButton value="closed" label="Closed" />
        </XDSToggleButtonGroup>
      </XDSVStack>
    </XDSVStack>
  );
}
