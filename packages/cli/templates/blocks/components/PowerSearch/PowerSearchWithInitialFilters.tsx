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
  ],
};

export default function PowerSearchWithInitialFilters() {
  const [filters, setFilters] = useState<ReadonlyArray<PowerSearchFilter>>([
    {field: 'status', operator: 'is', value: {type: 'enum' as const, value: 'open'}},
  ]);

  return (
    <XDSPowerSearch
      config={config}
      filters={filters}
      onChange={(newFilters) => setFilters(newFilters)}
      placeholder="Add filters..."
    />
  );
}
