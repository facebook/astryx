'use client';

import {useState} from 'react';
import {XDSPowerSearch} from '@xds/core/PowerSearch';

const config = {
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
  const [filters, setFilters] = useState([
    {field: 'status', operator: 'is', value: {type: 'enum', value: 'open'}},
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
