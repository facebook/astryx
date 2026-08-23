// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {MultiSelector} from '@astryxdesign/core/MultiSelector';
import {VStack} from '@astryxdesign/core/Layout';

export default function MultiSelectorForm() {
  const [columns, setColumns] = useState<string[]>(['name', 'email']);
  const [filters, setFilters] = useState<string[]>([]);
  return (
    <div style={{width: 300}}>
      <VStack gap={4}>
        <MultiSelector
          label="Visible columns"
          description="Choose which columns to display in the table"
          options={[
            {value: 'name', label: 'Name'},
            {value: 'email', label: 'Email'},
            {value: 'role', label: 'Role'},
            {value: 'status', label: 'Status'},
            {value: 'created', label: 'Created at'},
          ]}
          value={columns}
          onChange={setColumns}
          hasSelectAll
          isRequired
          triggerDisplay="labels"
        />
        <MultiSelector
          label="Status filter"
          description="Filter by status"
          options={['Active', 'Inactive', 'Pending', 'Archived']}
          value={filters}
          onChange={setFilters}
          isOptional
          triggerDisplay="badges"
          placeholder="All statuses"
        />
      </VStack>
    </div>
  );
}
