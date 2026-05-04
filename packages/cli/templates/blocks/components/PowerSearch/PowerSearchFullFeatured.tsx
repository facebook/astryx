'use client';

import {useState} from 'react';
import {XDSPowerSearch} from '@xds/core/PowerSearch';
import type {PowerSearchConfig, PowerSearchFilter} from '@xds/core/PowerSearch';
import type {XDSSearchSource, XDSSearchableItem} from '@xds/core/Typeahead';

const statusValues = [
  {value: 'open', label: 'Open'},
  {value: 'in_progress', label: 'In Progress'},
  {value: 'review', label: 'In Review'},
  {value: 'closed', label: 'Closed'},
];
const priorityValues = [
  {value: 'p0', label: 'P0 — Critical'},
  {value: 'p1', label: 'P1 — High'},
  {value: 'p2', label: 'P2 — Medium'},
  {value: 'p3', label: 'P3 — Low'},
];
const users: XDSSearchableItem[] = [
  {id: 'user-1', label: 'Alice Johnson'},
  {id: 'user-2', label: 'Bob Smith'},
  {id: 'user-3', label: 'Charlie Brown'},
  {id: 'user-4', label: 'Diana Prince'},
];
const userSource: XDSSearchSource = {
  search: (q: string) =>
    users.filter(u => u.label.toLowerCase().includes(q.toLowerCase())),
  bootstrap: () => users,
};

const config: PowerSearchConfig = {
  name: 'FullSearch',
  fields: [
    {
      key: 'status',
      label: 'Status',
      defaultOperator: 'any_of',
      operators: [
        {
          key: 'any_of',
          label: 'is any of',
          value: {type: 'enum_list', values: statusValues},
        },
        {
          key: 'none_of',
          label: 'is none of',
          value: {type: 'enum_list', values: statusValues},
        },
      ],
    },
    {
      key: 'title',
      label: 'Title',
      defaultOperator: 'contains',
      operators: [
        {key: 'contains', label: 'contains', value: {type: 'string'}},
        {
          key: 'not_contains',
          label: 'does not contain',
          value: {type: 'string'},
        },
      ],
    },
    {
      key: 'priority',
      label: 'Priority',
      defaultOperator: 'is',
      operators: [
        {key: 'is', label: 'is', value: {type: 'enum', values: priorityValues}},
      ],
    },
    {
      key: 'assignee',
      label: 'Assignee',
      defaultOperator: 'any_of',
      operators: [
        {
          key: 'any_of',
          label: 'is any of',
          value: {type: 'entity_list', searchSource: userSource},
        },
      ],
    },
  ],
};

export default function PowerSearchFullFeatured() {
  const [filters, setFilters] = useState<PowerSearchFilter[]>([]);

  return (
    <XDSPowerSearch
      style={{width: 300}}
      config={config}
      filters={filters}
      onChange={newFilters => setFilters([...newFilters])}
      placeholder="Search..."
    />
  );
}
