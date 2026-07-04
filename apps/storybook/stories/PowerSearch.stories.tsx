// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {PowerSearch} from '@astryxdesign/core/PowerSearch';
import type {
  PowerSearchConfig,
  PowerSearchFilter,
} from '@astryxdesign/core/PowerSearch';
import type {SearchSource, SearchableItem} from '@astryxdesign/core/Typeahead';
import {Button} from '@astryxdesign/core/Button';
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

const users: SearchableItem[] = [
  {
    id: 'user-1',
    label: 'Alice Johnson',
    auxiliaryData: {photo: 'https://i.pravatar.cc/150?u=alice'},
  },
  {
    id: 'user-2',
    label: 'Bob Smith',
    auxiliaryData: {photo: 'https://i.pravatar.cc/150?u=bob'},
  },
  {
    id: 'user-3',
    label: 'Charlie Brown',
    auxiliaryData: {photo: 'https://i.pravatar.cc/150?u=charlie'},
  },
  {
    id: 'user-4',
    label: 'Diana Prince',
    auxiliaryData: {photo: 'https://i.pravatar.cc/150?u=diana'},
  },
  {
    id: 'user-5',
    label: 'Eve Williams',
    auxiliaryData: {photo: 'https://i.pravatar.cc/150?u=eve'},
  },
  {
    id: 'user-6',
    label: 'Frank Miller',
    auxiliaryData: {photo: 'https://i.pravatar.cc/150?u=frank'},
  },
];

const userSource: SearchSource = {
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

const meta: Meta<typeof PowerSearch> = {
  title: 'Core/PowerSearch',
  component: PowerSearch,
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
    disabledMessage: {
      control: 'text',
      description:
        'Explains why the search is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the input focusable via aria-disabled (input stays blocked). Use this instead of wrapping a disabled PowerSearch in Tooltip.',
    },
    isReadOnly: {control: 'boolean'},
    hasClear: {control: 'boolean'},
    maxTokenLength: {control: 'number'},
    popoverSaveButtonLabel: {control: 'text'},
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
      description: 'Search input size',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PowerSearch>;

// =============================================================================
// Stories
// =============================================================================

export const Default: Story = {
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([]);
    return (
      <PowerSearch
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
      <PowerSearch
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
        <PowerSearch
          {...args}
          config={fullConfig}
          filters={filters}
          onChange={(newFilters, _changeType, _index) => {
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
      <PowerSearch
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
      <PowerSearch
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
      <PowerSearch
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
      <PowerSearch
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
      <PowerSearch
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
      <PowerSearch
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
      <PowerSearch
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
      <PowerSearch
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
      <PowerSearch
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
      <PowerSearch
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
        <PowerSearch
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
        <PowerSearch
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

const contentSearchConfig: PowerSearchConfig = {
  name: 'ContentSearch',
  contentSearchFieldKey: 'title',
  fields: [
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

export const WithContentSearchFieldKey: Story = {
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([]);
    return (
      <div>
        <PowerSearch
          {...args}
          config={contentSearchConfig}
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
    placeholder: 'Type to search by title, or pick a field...',
  },
  name: 'Content Search Field Key',
};

export const SizeVariants: Story = {
  render: () => {
    const [smFilters, setSmFilters] = useState<PowerSearchFilter[]>([
      {field: 'status', operator: 'is', value: {type: 'enum', value: 'open'}},
    ]);
    const [mdFilters, setMdFilters] = useState<PowerSearchFilter[]>([
      {field: 'status', operator: 'is', value: {type: 'enum', value: 'open'}},
    ]);
    const [lgFilters, setLgFilters] = useState<PowerSearchFilter[]>([
      {field: 'status', operator: 'is', value: {type: 'enum', value: 'open'}},
    ]);
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        <PowerSearch
          label="Small (28px)"
          config={basicConfig}
          filters={smFilters}
          onChange={newFilters => setSmFilters([...newFilters])}
          placeholder="Small size"
          size="sm"
        />
        <PowerSearch
          label="Medium (32px)"
          config={basicConfig}
          filters={mdFilters}
          onChange={newFilters => setMdFilters([...newFilters])}
          placeholder="Medium size (default)"
          size="md"
        />
        <PowerSearch
          label="Large (36px)"
          config={basicConfig}
          filters={lgFilters}
          onChange={newFilters => setLgFilters([...newFilters])}
          placeholder="Large size"
          size="lg"
        />
      </div>
    );
  },
};

export const WithStartIcon: Story = {
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([]);
    return (
      <PowerSearch
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
      <PowerSearch
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
      <PowerSearch
        {...args}
        config={basicConfig}
        filters={filters}
        onChange={newFilters => setFilters([...newFilters])}
        resultCount={42}
        endContent={
          <Button
            label="Save"
            variant="primary"
            size="sm"
            style={{height: '20px'}}
          />
        }
      />
    );
  },
  args: {
    label: 'Search',
    isLabelHidden: true,
    placeholder: 'Search...',
    size: 'lg',
  },
  name: 'With End Content and Result Count',
};

const overflowFilters: PowerSearchFilter[] = [
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
];

export const OverflowInline: Story = {
  render: args => {
    const [filters, setFilters] =
      useState<PowerSearchFilter[]>(overflowFilters);
    return (
      <div>
        <PowerSearch
          {...args}
          config={fullConfig}
          filters={filters}
          onChange={newFilters => setFilters([...newFilters])}
          tokenOverflowBehavior="unfocusedInline"
        />
        <p style={{marginTop: 8}}>
          This text will shift down when the search bar expands on focus.
        </p>
      </div>
    );
  },
  args: {
    placeholder: 'Add more filters...',
  },
  name: 'Overflow Inline',
};

export const OverflowLayer: Story = {
  render: args => {
    const [filters, setFilters] =
      useState<PowerSearchFilter[]>(overflowFilters);
    return (
      <div>
        <PowerSearch
          {...args}
          config={fullConfig}
          filters={filters}
          onChange={newFilters => setFilters([...newFilters])}
          tokenOverflowBehavior="unfocusedLayer"
        />
        <p style={{marginTop: 8}}>
          This text should not shift when the search bar expands on focus.
        </p>
      </div>
    );
  },
  args: {
    placeholder: 'Add more filters...',
  },
  name: 'Overflow Layer',
};

// =============================================================================
// Custom Components Map
// =============================================================================

import type {
  PowerSearchComponents,
  PowerSearchTokenProps,
  PowerSearchEditorProps,
} from '@astryxdesign/core/PowerSearch';
import {Token} from '@astryxdesign/core/Token';
import {HStack} from '@astryxdesign/core/Stack';

function StatusToken({
  filter,
  field,
  operator,
  maxLength: _maxLength,
  onClick,
  onRemove,
  isDisabled,
}: PowerSearchTokenProps) {
  const value = filter.value.type === 'enum' ? filter.value.value : '?';
  const colors: Record<string, string> = {
    open: '#22c55e',
    in_progress: '#3b82f6',
    review: '#a855f7',
    closed: '#6b7280',
    blocked: '#ef4444',
  };
  return (
    <Token
      label={`${field.label}: ${operator.label}`}
      endContent={
        <span style={{fontWeight: 600, color: colors[value] ?? 'inherit'}}>
          {value}
        </span>
      }
      onClick={
        onClick
          ? (e: React.MouseEvent) => {
              e.stopPropagation();
              onClick();
            }
          : undefined
      }
      onRemove={onRemove}
      isDisabled={isDisabled}
    />
  );
}

function CustomIntegerEditor({
  config: _config,
  filter,
  mode: _mode,
  onSave,
  onCancel,
  saveButtonLabel: _saveButtonLabel,
  isReadOnly,
}: PowerSearchEditorProps) {
  const current = filter.value?.type === 'integer' ? filter.value.value : 50;
  return (
    <div style={{padding: 16}}>
      <p style={{margin: '0 0 12px', fontSize: 13}}>
        Custom range editor for integer fields:
      </p>
      <HStack gap={2} vAlign="center">
        <input
          type="range"
          min={0}
          max={1000}
          value={current}
          onChange={e => {
            if (filter.operator == null) {
              return;
            }
            onSave({
              field: filter.field,
              operator: filter.operator,
              value: {type: 'integer', value: Number(e.target.value)},
            });
          }}
          style={{flex: 1}}
          disabled={isReadOnly}
        />
        <span style={{fontSize: 12, whiteSpace: 'nowrap'}}>{current}</span>
      </HStack>
      <div
        style={{
          marginTop: 12,
          display: 'flex',
          gap: 8,
          justifyContent: 'flex-end',
        }}>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

const customComponents: PowerSearchComponents = {
  enum: {Token: StatusToken},
  integer: {Editor: CustomIntegerEditor},
};

export const WithCustomComponents: Story = {
  render: args => {
    const [filters, setFilters] = useState<PowerSearchFilter[]>([
      {field: 'status', operator: 'is', value: {type: 'enum', value: 'open'}},
      {
        field: 'line_count',
        operator: 'gt',
        value: {type: 'integer', value: 200},
      },
    ]);
    return (
      <div>
        <PowerSearch
          {...args}
          config={fullConfig}
          filters={filters}
          onChange={newFilters => setFilters([...newFilters])}
          components={customComponents}
        />
        <p style={{marginTop: 16, fontSize: 13, color: '#666'}}>
          <strong>Custom overrides:</strong> Status tokens show colored text
          (custom Token). Integer fields use a range slider editor (custom
          Editor).
        </p>
      </div>
    );
  },
  args: {placeholder: 'Search with custom components...'},
  decorators: [
    Story => (
      <div style={{width: 700}}>
        <Story />
      </div>
    ),
  ],
  name: 'Custom Components Map',
};

// Disabled with an explanation tooltip. Hover or keyboard-focus the input to see
// why it's disabled — the reason is announced to assistive tech via
// aria-describedby, and the input stays focusable (input is still blocked). Use
// disabledMessage instead of wrapping a disabled PowerSearch in Tooltip:
// disabled controls swallow the pointer events a Tooltip wrapper needs.
export const DisabledWithMessage: Story = {
  render: args => {
    const filters: PowerSearchFilter[] = [
      {field: 'status', operator: 'is', value: {type: 'enum', value: 'open'}},
    ];
    return (
      <PowerSearch
        {...args}
        config={basicConfig}
        filters={filters}
        onChange={() => {}}
        isDisabled
        disabledMessage="You need edit access to search"
      />
    );
  },
  args: {
    placeholder: 'Search...',
  },
};
