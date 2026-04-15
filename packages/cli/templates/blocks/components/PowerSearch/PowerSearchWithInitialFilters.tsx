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
    // @ts-expect-error migrated example
    // @ts-expect-error migrated example
    <XDSPowerSearch
      // @ts-expect-error migrated example
      config={config}
      // @ts-expect-error migrated example
      filters={filters}
      // @ts-expect-error migrated example
      onChange={(newFilters) => setFilters(newFilters)}
      placeholder="Add filters..."
    />
  );
}

export const showcase = {
  aspectRatio: 4 / 3,
  render: PowerSearchWithInitialFilters,
};
