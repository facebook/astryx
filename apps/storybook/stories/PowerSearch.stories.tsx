import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSPowerSearch} from '@xds/core/PowerSearch';
import type {
  PowerSearchConfig,
  PowerSearchFilter,
  PowerSearchChangeType,
} from '@xds/core/PowerSearch';
import type {XDSSearchSource, XDSSearchableItem} from '@xds/core/Typeahead';
import {XDSButton} from '@xds/core/Button';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';

// =============================================================================
// Sample data
// =============================================================================

const statusValues = [
  {value: 'open', label: 'Open'},
  {value: 'in_progress', label: 'In Progress'},
  {value: 'review', label: 'In Review'},
  {value: 'closed', label: 'Closed'},
  {value: 'blocked', label: 'Blocked'},
];

const priorityValues = [
  {value: 'p0', label: 'P0 - Critical'},
  {value: 'p1', label: 'P1 - High'},
  {value: 'p2', label: 'P2 - Medium'},
  {value: 'p3', label: 'P3 - Low'},
];

const tagValues = [
  {value: 'bug', label: 'Bug'},
  {value: 'feature', label: 'Feature'},
  {value: 'docs', label: 'Documentation'},
  {value: 'perf', label: 'Performance'},
  {value: 'security', label: 'Security'},
  {value: 'ux', label: 'UX'},
  {value: 'infra', label: 'Infrastructure'},
];

const users: XDSSearchableItem[] = [
  {id: 'user-1', label: 'Alice Johnson'},
  {id: 'user-2', label: 'Bob Smith'},
  {id: 'user-3', label: 'Charlie Brown'},
  {id: 'user-4', label: 'Diana Prince'},
  {id: 'user-5', label: 'Eve Williams'},
  {id: 'user-6', label: 'Frank Miller'},
];

const userSource: XDSSearchSource = {
  search: (query: string) =>
    users.filter(u => u.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => users,
};

// =============================================================================
// Configs
// =============================================================================

const basicConfig: PowerSearchConfig = {
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
          value: {type: 'enum', values: statusValues},
        },
        {
          key: 'is_not',
          label: 'is not',
          value: {type: 'enum', values: statusValues},
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
        {
          key: 'is',
          label: 'is',
          value: {type: 'enum', values: priorityValues},
        },
      ],
    },
  ],
};

const fullConfig: PowerSearchConfig = {
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
        {
          key: 'is',
          label: 'is',
          value: {type: 'enum', values: priorityValues},
        },
      ],
    },
    {
      key: 'assignee',
      label: 'Assignee',
      defaultOperator: 'any_of',
      typeaheadAliases: ['owner', 'assigned'],
      operators: [
        {
          key: 'any_of',
          label: 'is any of',
          value: {type: 'entity_list', searchSource: userSource},
        },
        {
          key: 'none_of',
          label: 'is none of',
          value: {type: 'entity_list', searchSource: userSource},
        },
      ],
    },
    {
      key: 'tags',
      label: 'Tags',
      defaultOperator: 'include',
      operators: [
        {
          key: 'include',
          label: 'include',
          value: {type: 'enum_list', values: tagValues},
        },
        {
          key: 'exclude',
          label: 'exclude',
          value: {type: 'enum_list', values: tagValues},
        },
      ],
    },
    {
      key: 'line_count',
      label: 'Line count',
      defaultOperator: 'gt',
      operators: [
        {
          key: 'gt',
          label: 'is greater than',
          value: {
            type: 'integer',
            minValue: 0,
            maxValue: 10000,
            units: 'lines',
          },
        },
        {
          key: 'lt',
          label: 'is less than',
          value: {
            type: 'integer',
            minValue: 0,
            maxValue: 10000,
            units: 'lines',
          },
        },
      ],
    },
    {
      key: 'cost',
      label: 'Cost',
      defaultOperator: 'gt',
      operators: [
        {
          key: 'gt',
          label: '>',
          value: {type: 'float', minValue: 0, maxValue: 100000, units: 'USD'},
        },
        {
          key: 'lt',
          label: '<',
          value: {type: 'float', minValue: 0, maxValue: 100000, units: 'USD'},
        },
      ],
    },
    {
      key: 'created',
      label: 'Created',
      defaultOperator: 'after',
      operators: [
        {
          key: 'after',
          label: 'is after',
          value: {type: 'date_absolute', isDateOnly: true},
        },
        {
          key: 'newer_than',
          label: 'is newer than',
          value: {
            type: 'date_relative',
            isPastAllowed: true,
            isFutureAllowed: false,
          },
        },
      ],
    },
    {
      key: 'ids',
      label: 'ID',
      defaultOperator: 'in',
      operators: [
        {key: 'in', label: 'is any of', value: {type: 'string_list'}},
      ],
    },
    {
      key: 'unread',
      label: 'Unread only',
      defaultOperator: 'yes',
      operators: [{key: 'yes', label: '', value: {type: 'empty'}}],
    },
  ],
};

// =============================================================================
// Meta
// =============================================================================

const meta: Meta<typeof XDSPowerSearch> = {
  title: 'Form/XDSPowerSearch',
  component: XDSPowerSearch,
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div style={{width: 600}}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    placeholder: {control: 'text'},
    isDisabled: {control: 'boolean'},
    isReadOnly: {control: 'boolean'},
    hasClear: {control: 'boolean'},
    maxTokenLength: {control: 'number'},
    popoverSaveButtonLabel: {control: 'text'},
  },
};

export default meta;
type Story = StoryObj<typeof XDSPowerSearch>;

// =============================================================================
// Stories
// =============================================================================

export const Default: Story = {
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([]);
    return (
      <XDSPowerSearch
        {...args}
        config={basicConfig}
        filters={filters}
        onChange={newFilters => setFilters([...newFilters])}
      />
    );
  },
  args: {
    placeholder: 'Search by status, title, priority...',
  },
};

export const WithPresetFilters: Story = {
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([
      {field: 'status', operator: 'is', value: {type: 'enum', value: 'open'}},
      {
        field: 'priority',
        operator: 'is',
        value: {type: 'enum', value: 'p1'},
      },
    ]);
    return (
      <XDSPowerSearch
        {...args}
        config={basicConfig}
        filters={filters}
        onChange={newFilters => setFilters([...newFilters])}
      />
    );
  },
  args: {
    placeholder: 'Add more filters...',
  },
  name: 'Pre-set Filters',
};

export const FullFeatured: Story = {
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([]);
    return (
      <div>
        <XDSPowerSearch
          {...args}
          config={fullConfig}
          filters={filters}
          onChange={(newFilters, changeType, index) => {
            setFilters([...newFilters]);
          }}
        />
        {filters.length > 0 && (
          <pre
            style={{
              marginTop: 16,
              padding: 12,
              backgroundColor: '#f5f5f5',
              borderRadius: 8,
              fontSize: 12,
              overflow: 'auto',
            }}>
            {JSON.stringify(filters, null, 2)}
          </pre>
        )}
      </div>
    );
  },
  args: {
    placeholder: 'Search...',
  },
  decorators: [
    Story => (
      <div style={{width: 700}}>
        <Story />
      </div>
    ),
  ],
  name: 'Full Featured (All Field Types)',
};

export const WithEnumListFilters: Story = {
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([
      {
        field: 'status',
        operator: 'any_of',
        value: {type: 'enum_list', value: ['open', 'in_progress']},
      },
      {
        field: 'tags',
        operator: 'include',
        value: {type: 'enum_list', value: ['bug', 'security']},
      },
    ]);
    return (
      <XDSPowerSearch
        {...args}
        config={fullConfig}
        filters={filters}
        onChange={newFilters => setFilters([...newFilters])}
      />
    );
  },
  args: {
    placeholder: 'Add more filters...',
  },
  decorators: [
    Story => (
      <div style={{width: 700}}>
        <Story />
      </div>
    ),
  ],
  name: 'Multi-value Filters',
};

export const WithEntityFilters: Story = {
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([
      {
        field: 'assignee',
        operator: 'any_of',
        value: {
          type: 'entity_list',
          value: [
            {id: 'user-1', label: 'Alice Johnson'},
            {id: 'user-3', label: 'Charlie Brown'},
          ],
        },
      },
    ]);
    return (
      <XDSPowerSearch
        {...args}
        config={fullConfig}
        filters={filters}
        onChange={newFilters => setFilters([...newFilters])}
      />
    );
  },
  args: {
    placeholder: 'Add more filters...',
  },
  decorators: [
    Story => (
      <div style={{width: 700}}>
        <Story />
      </div>
    ),
  ],
  name: 'Entity Filters',
};

export const WithNumericFilters: Story = {
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([
      {
        field: 'line_count',
        operator: 'gt',
        value: {type: 'integer', value: 100},
      },
      {
        field: 'cost',
        operator: 'lt',
        value: {type: 'float', value: 500.5},
      },
    ]);
    return (
      <XDSPowerSearch
        {...args}
        config={fullConfig}
        filters={filters}
        onChange={newFilters => setFilters([...newFilters])}
      />
    );
  },
  args: {
    placeholder: 'Add more filters...',
  },
  decorators: [
    Story => (
      <div style={{width: 700}}>
        <Story />
      </div>
    ),
  ],
  name: 'Numeric Filters',
};

export const WithDateFilters: Story = {
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([
      {
        field: 'created',
        operator: 'after',
        value: {
          type: 'date_absolute',
          unixSeconds: Math.floor(new Date('2025-01-15').getTime() / 1000),
        },
      },
    ]);
    return (
      <XDSPowerSearch
        {...args}
        config={fullConfig}
        filters={filters}
        onChange={newFilters => setFilters([...newFilters])}
      />
    );
  },
  args: {
    placeholder: 'Add more filters...',
  },
  decorators: [
    Story => (
      <div style={{width: 700}}>
        <Story />
      </div>
    ),
  ],
  name: 'Date Filters',
};

export const WithEmptyFilter: Story = {
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([
      {field: 'unread', operator: 'yes', value: {type: 'empty'}},
    ]);
    return (
      <XDSPowerSearch
        {...args}
        config={fullConfig}
        filters={filters}
        onChange={newFilters => setFilters([...newFilters])}
      />
    );
  },
  args: {
    placeholder: 'Add more filters...',
  },
  decorators: [
    Story => (
      <div style={{width: 700}}>
        <Story />
      </div>
    ),
  ],
  name: 'Boolean / Empty Filters',
};

export const ReadOnly: Story = {
  render: args => {
    const filters: PowerSearchFilter[] = [
      {field: 'status', operator: 'is', value: {type: 'enum', value: 'open'}},
      {
        field: 'priority',
        operator: 'is',
        value: {type: 'enum', value: 'p0'},
      },
    ];
    return (
      <XDSPowerSearch
        {...args}
        config={basicConfig}
        filters={filters}
        onChange={() => {}}
        isReadOnly
      />
    );
  },
  args: {
    placeholder: 'Search...',
  },
  name: 'Read Only',
};

export const Disabled: Story = {
  render: args => {
    const filters: PowerSearchFilter[] = [
      {field: 'status', operator: 'is', value: {type: 'enum', value: 'open'}},
    ];
    return (
      <XDSPowerSearch
        {...args}
        config={basicConfig}
        filters={filters}
        onChange={() => {}}
        isDisabled
      />
    );
  },
  args: {
    placeholder: 'Search...',
  },
};

export const WithError: Story = {
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([]);
    return (
      <XDSPowerSearch
        {...args}
        config={basicConfig}
        filters={filters}
        onChange={newFilters => setFilters([...newFilters])}
        status={{type: 'error', message: 'Invalid filter combination'}}
      />
    );
  },
  args: {
    placeholder: 'Search...',
  },
  name: 'With Error Status',
};

export const WithWarning: Story = {
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([
      {
        field: 'title',
        operator: 'contains',
        value: {type: 'string', value: 'test'},
      },
    ]);
    return (
      <XDSPowerSearch
        {...args}
        config={basicConfig}
        filters={filters}
        onChange={newFilters => setFilters([...newFilters])}
        status={{type: 'warning', message: 'Broad search may be slow'}}
      />
    );
  },
  args: {
    placeholder: 'Search...',
  },
  name: 'With Warning Status',
};

export const ManyFilters: Story = {
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([
      {
        field: 'status',
        operator: 'any_of',
        value: {type: 'enum_list', value: ['open', 'in_progress']},
      },
      {field: 'priority', operator: 'is', value: {type: 'enum', value: 'p1'}},
      {
        field: 'title',
        operator: 'contains',
        value: {type: 'string', value: 'login'},
      },
      {
        field: 'assignee',
        operator: 'any_of',
        value: {
          type: 'entity_list',
          value: [{id: 'user-1', label: 'Alice Johnson'}],
        },
      },
      {
        field: 'tags',
        operator: 'include',
        value: {type: 'enum_list', value: ['bug']},
      },
      {
        field: 'line_count',
        operator: 'gt',
        value: {type: 'integer', value: 50},
      },
      {
        field: 'created',
        operator: 'after',
        value: {
          type: 'date_absolute',
          unixSeconds: Math.floor(new Date('2025-06-01').getTime() / 1000),
        },
      },
    ]);
    return (
      <XDSPowerSearch
        {...args}
        config={fullConfig}
        filters={filters}
        onChange={newFilters => setFilters([...newFilters])}
      />
    );
  },
  args: {
    placeholder: 'Add more filters...',
  },
  decorators: [
    Story => (
      <div style={{width: 800}}>
        <Story />
      </div>
    ),
  ],
  name: 'Many Filters',
};

export const WithOnChangeTracking: Story = {
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([]);
    const [log, setLog] = useState<string[]>([]);
    return (
      <div>
        <XDSPowerSearch
          {...args}
          config={basicConfig}
          filters={filters}
          onChange={(newFilters, changeType, index) => {
            setFilters([...newFilters]);
            setLog(prev => [
              ...prev,
              `${changeType} at index ${index} (${newFilters.length} filters total)`,
            ]);
          }}
        />
        {log.length > 0 && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              backgroundColor: '#f5f5f5',
              borderRadius: 8,
              fontSize: 12,
              maxHeight: 200,
              overflow: 'auto',
            }}>
            <strong>Change log:</strong>
            <ul style={{margin: '4px 0', paddingInlineStart: 20}}>
              {log.map((entry, i) => (
                <li key={i}>{entry}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  },
  args: {
    placeholder: 'Try adding, editing, and removing filters...',
  },
  name: 'Change Tracking',
};

const nestedConfig: PowerSearchConfig = {
  name: 'NestedSearch',
  fields: [
    {
      key: 'status',
      label: 'Status',
      defaultOperator: 'is',
      operators: [
        {
          key: 'is',
          label: 'is',
          value: {type: 'enum', values: statusValues},
        },
        {
          key: 'is_not',
          label: 'is not',
          value: {type: 'enum', values: statusValues},
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
    {
      key: 'priority',
      label: 'Priority',
      defaultOperator: 'is',
      operators: [
        {
          key: 'is',
          label: 'is',
          value: {type: 'enum', values: priorityValues},
        },
      ],
    },
    {
      key: 'or_group',
      label: 'Any of (OR)',
      defaultOperator: 'match_any',
      operators: [
        {key: 'match_any', label: 'match any', value: {type: 'nested'}},
      ],
    },
    {
      key: 'and_group',
      label: 'All of (AND)',
      defaultOperator: 'match_all',
      operators: [
        {key: 'match_all', label: 'match all', value: {type: 'nested'}},
      ],
    },
  ],
};

export const WithNestedFilters: Story = {
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([
      {
        field: 'or_group',
        operator: 'match_any',
        value: {
          type: 'nested',
          value: [
            {
              field: 'status',
              operator: 'is',
              value: {type: 'enum', value: 'open'},
            },
            {
              field: 'status',
              operator: 'is',
              value: {type: 'enum', value: 'in_progress'},
            },
          ],
        },
      },
      {
        field: 'priority',
        operator: 'is',
        value: {type: 'enum', value: 'p0'},
      },
      {
        field: 'and_group',
        operator: 'match_all',
        value: {
          type: 'nested',
          value: [
            {
              field: 'title',
              operator: 'contains',
              value: {type: 'string', value: 'login'},
            },
            {
              field: 'status',
              operator: 'is_not',
              value: {type: 'enum', value: 'closed'},
            },
          ],
        },
      },
    ]);
    return (
      <div>
        <XDSPowerSearch
          {...args}
          config={nestedConfig}
          filters={filters}
          onChange={newFilters => setFilters([...newFilters])}
        />
        {filters.length > 0 && (
          <pre
            style={{
              marginTop: 16,
              padding: 12,
              backgroundColor: '#f5f5f5',
              borderRadius: 8,
              fontSize: 12,
              overflow: 'auto',
            }}>
            {JSON.stringify(filters, null, 2)}
          </pre>
        )}
      </div>
    );
  },
  args: {
    placeholder: 'Add filters...',
  },
  decorators: [
    Story => (
      <div style={{width: 700}}>
        <Story />
      </div>
    ),
  ],
  name: 'Nested Filters',
};

export const WithStartIcon: Story = {
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([]);
    return (
      <XDSPowerSearch
        {...args}
        config={basicConfig}
        filters={filters}
        onChange={newFilters => setFilters([...newFilters])}
        startIcon={MagnifyingGlassIcon}
      />
    );
  },
  args: {
    label: 'Search',
    isLabelHidden: true,
    placeholder: 'Search...',
  },
  name: 'With Start Icon',
};

export const WithResultCount: Story = {
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([
      {field: 'status', operator: 'is', value: {type: 'enum', value: 'open'}},
    ]);
    return (
      <XDSPowerSearch
        {...args}
        config={basicConfig}
        filters={filters}
        onChange={newFilters => setFilters([...newFilters])}
        resultCount={1234}
        startIcon={MagnifyingGlassIcon}
      />
    );
  },
  args: {
    label: 'Search',
    isLabelHidden: true,
    placeholder: 'Search...',
  },
  name: 'With Result Count',
};

export const WithEndContentPowerSearch: Story = {
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([]);
    return (
      <XDSPowerSearch
        {...args}
        config={basicConfig}
        filters={filters}
        onChange={newFilters => setFilters([...newFilters])}
        resultCount={42}
        endContent={<XDSButton label="Save" variant="primary" size="sm" />}
      />
    );
  },
  args: {
    label: 'Search',
    isLabelHidden: true,
    placeholder: 'Search...',
  },
  name: 'With End Content and Result Count',
};
