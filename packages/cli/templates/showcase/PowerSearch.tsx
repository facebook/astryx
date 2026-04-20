import {XDSPowerSearch} from '@xds/core/PowerSearch';
import type {PowerSearchConfig} from '@xds/core/PowerSearch';

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

export default function PowerSearchShowcase() {
  return (
    <XDSPowerSearch
      config={config}
      filters={[]}
      onChange={() => {}}
      placeholder="Search by status, title..."
    />
  );
}
