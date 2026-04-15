'use client';

import {useState} from 'react';
import {XDSPowerSearch} from '@xds/core/PowerSearch';
import type {PowerSearchConfig, PowerSearchFilter} from '@xds/core/PowerSearch';

const config: PowerSearchConfig = {
  name: 'TaskSearch',
  fields: [
    {
      key: 'status',
      label: 'Status',
      operators: [
        {
          key: 'is',
          label: 'is',
          value: {
            type: 'enum',
            values: [
              {value: 'open', label: 'Open'},
              {value: 'closed', label: 'Closed'},
            ],
          },
        },
      ],
    },
    {
      key: 'title',
      label: 'Title',
      operators: [
        {
          key: 'contains',
          label: 'contains',
          value: {type: 'string'},
        },
      ],
    },
  ],
};

export default function PowerSearchBasicWithEnumFilters() {
  const [filters, setFilters] = useState<ReadonlyArray<PowerSearchFilter>>([]);

  return (
    <XDSPowerSearch
      config={config}
      filters={filters}
      onChange={(newFilters) => setFilters(newFilters)}
    />
  );
}
