'use client';

import {useState} from 'react';
import {XDSMultiSelector} from '@xds/core/MultiSelector';
import {XDSVStack} from '@xds/core/Layout';

export default function MultiSelectorForm() {
  const [columns, setColumns] = useState<string[]>(['name', 'email']);
  const [filters, setFilters] = useState<string[]>([]);
  return (
    <div style={{width: 300}}>
      <XDSVStack gap={4}>
        <XDSMultiSelector
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
        <XDSMultiSelector
          label="Status filter"
          description="Filter by status"
          options={['Active', 'Inactive', 'Pending', 'Archived']}
          value={filters}
          onChange={setFilters}
          isOptional
          triggerDisplay="badges"
          placeholder="All statuses"
        />
      </XDSVStack>
    </div>
  );
}
