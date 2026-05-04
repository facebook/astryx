'use client';

import {useState} from 'react';
import {XDSPowerSearch} from '@xds/core/PowerSearch';
import type {PowerSearchConfig, PowerSearchFilter} from '@xds/core/PowerSearch';

const config: PowerSearchConfig = {
  name: 'BasicSearch',
  fields: [
    {
      key: 'status',
      label: 'Status',
      defaultOperator: 'is',
      operators: [
        {
          key: 'is',
          label: 'is',
          value: {
            type: 'enum',
            values: [
              {value: 'open', label: 'Open'},
              {value: 'in_progress', label: 'In Progress'},
              {value: 'closed', label: 'Closed'},
            ],
          },
        },
      ],
    },
    {
      key: 'title',
      label: 'Title',
      defaultOperator: 'contains',
      operators: [
        {key: 'contains', label: 'contains', value: {type: 'string'}},
      ],
    },
  ],
};

const initialFilters: PowerSearchFilter[] = [
  {field: 'status', operator: 'is', value: {type: 'enum', value: 'open'}},
  {
    field: 'title',
    operator: 'contains',
    value: {type: 'string', value: 'dashboard'},
  },
];

export default function PowerSearchShowcase() {
  const [filters, setFilters] = useState<PowerSearchFilter[]>(initialFilters);

  return (
    <XDSPowerSearch
      style={{width: 400}}
      config={config}
      filters={filters}
      onChange={newFilters => setFilters([...newFilters])}
      placeholder="Search by status, title..."
    />
  );
}
