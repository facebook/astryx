// Copyright (c) Meta Platforms, Inc. and affiliates.

import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {PowerSearch, PowerSearchMobile} from '@astryxdesign/core/PowerSearch';
import type {
  PowerSearchConfig,
  PowerSearchFilter,
} from '@astryxdesign/core/PowerSearch';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/Stack';

// =============================================================================
// Sample data
// =============================================================================

const statusValues = [
  {value: 'open', label: 'Open'},
  {value: 'in_progress', label: 'In Progress'},
  {value: 'review', label: 'In Review'},
  {value: 'closed', label: 'Closed'},
];

const tagValues = [
  {value: 'bug', label: 'Bug'},
  {value: 'feature', label: 'Feature'},
  {value: 'docs', label: 'Documentation'},
  {value: 'perf', label: 'Performance'},
  {value: 'security', label: 'Security'},
];

const issueConfig: PowerSearchConfig = {
  name: 'IssueSearch',
  fields: [
    {
      key: 'status',
      label: 'Status',
      description: 'Where the issue sits in the workflow',
      operators: [
        {
          key: 'is',
          i18nKey: '@astryx.powersearch.operator.is',
          value: {type: 'enum', values: statusValues},
        },
        {
          key: 'isNot',
          i18nKey: '@astryx.powersearch.operator.isNot',
          value: {type: 'enum', values: statusValues},
        },
      ],
    },
    {
      key: 'title',
      label: 'Title',
      description: 'Free text anywhere in the issue title',
      operators: [
        {
          key: 'contains',
          i18nKey: '@astryx.powersearch.operator.contains',
          value: {type: 'string'},
        },
      ],
    },
    {
      key: 'tags',
      label: 'Tags',
      group: 'Metadata',
      operators: [
        {
          key: 'isAnyOf',
          i18nKey: '@astryx.powersearch.operator.isAnyOf',
          value: {type: 'enum_list', values: tagValues},
        },
      ],
    },
    {
      key: 'points',
      label: 'Story points',
      group: 'Metadata',
      operators: [
        {
          key: 'greaterThan',
          i18nKey: '@astryx.powersearch.operator.greaterThan',
          value: {type: 'integer', minValue: 0, maxValue: 21},
        },
      ],
    },
    {
      key: 'created',
      label: 'Created',
      group: 'Dates',
      operators: [
        {
          key: 'before',
          i18nKey: '@astryx.powersearch.operator.before',
          value: {type: 'date_absolute', isDateOnly: true},
        },
        {
          key: 'after',
          i18nKey: '@astryx.powersearch.operator.after',
          value: {type: 'date_absolute', isDateOnly: true},
        },
      ],
    },
    {
      key: 'unassigned',
      label: 'Unassigned',
      description: 'Nobody has picked it up yet',
      group: 'Metadata',
      operators: [
        {
          key: 'isTrue',
          i18nKey: '@astryx.powersearch.operator.isTrue',
          value: {type: 'empty'},
        },
      ],
    },
  ],
};

// A config long enough that the sheet offers a search box over the field list.
const wideConfig: PowerSearchConfig = {
  name: 'WideSearch',
  fields: [
    ...issueConfig.fields,
    ...[
      'Assignee',
      'Reporter',
      'Component',
      'Milestone',
      'Sprint',
      'Resolution',
    ].map(label => ({
      key: label.toLowerCase(),
      label,
      group: 'People and planning',
      operators: [
        {
          key: 'is',
          i18nKey: '@astryx.powersearch.operator.is',
          value: {type: 'string'} as const,
        },
      ],
    })),
  ],
};

// =============================================================================
// Meta
// =============================================================================

const meta: Meta<typeof PowerSearchMobile> = {
  title: 'Core/PowerSearchMobile',
  component: PowerSearchMobile,
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div style={{width: 390, maxWidth: '100%'}}>
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
    size: {control: 'radio', options: ['sm', 'md', 'lg']},
  },
};

export default meta;
type Story = StoryObj<typeof PowerSearchMobile>;

// =============================================================================
// Stories
// =============================================================================

export const Default: Story = {
  render: args => {
    const [filters, setFilters] = useState<ReadonlyArray<PowerSearchFilter>>(
      [],
    );
    return (
      <PowerSearchMobile
        {...args}
        config={issueConfig}
        filters={filters}
        onChange={setFilters}
      />
    );
  },
};

export const WithFilters: Story = {
  render: args => {
    const [filters, setFilters] = useState<ReadonlyArray<PowerSearchFilter>>([
      {field: 'status', operator: 'is', value: {type: 'enum', value: 'open'}},
      {
        field: 'tags',
        operator: 'isAnyOf',
        value: {type: 'enum_list', value: ['bug', 'perf']},
      },
    ]);
    return (
      <PowerSearchMobile
        {...args}
        config={issueConfig}
        filters={filters}
        onChange={setFilters}
        resultCount={filters.length === 0 ? 248 : 31}
      />
    );
  },
};

/**
 * Past seven or so fields the sheet adds a search box above the list, pinned
 * under the title while the list scrolls.
 */
export const SearchableFieldList: Story = {
  render: args => {
    const [filters, setFilters] = useState<ReadonlyArray<PowerSearchFilter>>(
      [],
    );
    return (
      <PowerSearchMobile
        {...args}
        config={wideConfig}
        filters={filters}
        onChange={setFilters}
      />
    );
  },
};

export const ReadOnly: Story = {
  args: {isReadOnly: true, isLabelHidden: false, label: 'Applied filters'},
  render: args => (
    <PowerSearchMobile
      {...args}
      config={issueConfig}
      filters={[
        {field: 'status', operator: 'is', value: {type: 'enum', value: 'open'}},
      ]}
      onChange={() => {}}
    />
  ),
};

export const Disabled: Story = {
  args: {
    isDisabled: true,
    isLabelHidden: false,
    label: 'Filters',
    disabledMessage: 'Pick a project before filtering',
  },
  render: args => (
    <PowerSearchMobile
      {...args}
      config={issueConfig}
      filters={[]}
      onChange={() => {}}
    />
  ),
};

export const WithStatus: Story = {
  args: {
    isLabelHidden: false,
    label: 'Filters',
    status: {type: 'error', message: 'Add at least one filter'},
  },
  render: args => {
    const [filters, setFilters] = useState<ReadonlyArray<PowerSearchFilter>>(
      [],
    );
    return (
      <PowerSearchMobile
        {...args}
        config={issueConfig}
        filters={filters}
        onChange={setFilters}
      />
    );
  },
};

/**
 * The intended production shape: one call site, one viewport check, both
 * variants fed the same props. Resize the preview across 768px to swap.
 */
export const Responsive: Story = {
  parameters: {controls: {disable: true}},
  render: () => {
    const isTouch = useMediaQuery('(max-width: 768px)');
    const Search = isTouch ? PowerSearchMobile : PowerSearch;
    const [filters, setFilters] = useState<ReadonlyArray<PowerSearchFilter>>(
      [],
    );
    return (
      <VStack gap={2}>
        <Text type="supporting" color="secondary">
          Rendering {isTouch ? 'PowerSearchMobile' : 'PowerSearch'}
        </Text>
        <Search
          config={issueConfig}
          filters={filters}
          onChange={setFilters}
          resultCount={filters.length === 0 ? 248 : 31}
        />
      </VStack>
    );
  },
};
