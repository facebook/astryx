// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {HStack} from '@astryxdesign/core/Layout';
import {MultiSelector} from '@astryxdesign/core/MultiSelector';

export default function MultiSelectorGhostToolbar() {
  const [columns, setColumns] = useState<string[]>(['Name', 'Email']);
  const [filters, setFilters] = useState<string[]>(['Active']);

  return (
    <HStack align="center" gap={2}>
      <Button label="Refresh" variant="ghost" />
      <MultiSelector
        label="Columns"
        isLabelHidden
        variant="ghost"
        options={['Name', 'Email', 'Role', 'Status', 'Created']}
        value={columns}
        onChange={setColumns}
        triggerDisplay="labels"
        placeholder="Columns"
      />
      <MultiSelector
        label="Status"
        isLabelHidden
        variant="ghost"
        options={['Active', 'Inactive', 'Pending', 'Archived']}
        value={filters}
        onChange={setFilters}
        triggerDisplay="labels"
        placeholder="Status"
        status={{type: 'warning', message: 'Some filters hide archived rows'}}
        statusVariant="tooltip"
      />
      <Button label="Export" variant="ghost" />
    </HStack>
  );
}
