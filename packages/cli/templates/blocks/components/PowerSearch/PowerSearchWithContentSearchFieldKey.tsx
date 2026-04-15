'use client';

import {useState} from 'react';
import {XDSPowerSearch} from '@xds/core/PowerSearch';

const config = {
  name: 'IssueSearch',
  contentSearchFieldKey: 'title',
  fields: [
    {
      key: 'title',
      label: 'Title',
      operators: [
        {key: 'contains', label: 'contains', value: {type: 'string'}},
        {key: 'is', label: 'is', value: {type: 'string'}},
      ],
    },
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

export default function PowerSearchWithContentSearchFieldKey() {
  const [filters, setFilters] = useState([]);

  return (
    // @ts-expect-error migrated example
    // @ts-expect-error migrated example
    <XDSPowerSearch
      // @ts-expect-error migrated example
      config={config}
      filters={filters}
      // @ts-expect-error migrated example
      onChange={(newFilters) => setFilters(newFilters)}
      placeholder="Search issues..."
    />
  );
}
