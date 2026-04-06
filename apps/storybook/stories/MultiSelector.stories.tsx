import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import {XDSMultiSelector} from '@xds/core/MultiSelector';

const meta: Meta<typeof XDSMultiSelector> = {
  title: 'Form/XDSMultiSelector',
  component: XDSMultiSelector,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    Story => (
      <div style={{width: 300}}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    label: {control: 'text'},
    isLabelHidden: {control: 'boolean'},
    description: {control: 'text'},
    placeholder: {control: 'text'},
    size: {control: 'radio', options: ['sm', 'md', 'lg']},
    triggerDisplay: {
      control: 'radio',
      options: ['count', 'labels', 'badges'],
    },
    isDisabled: {control: 'boolean'},
    isOptional: {control: 'boolean'},
    isRequired: {control: 'boolean'},
    hasSelectAll: {control: 'boolean'},
    hasSearch: {control: 'boolean'},
  },
};

export default meta;
type Story = StoryObj<typeof XDSMultiSelector>;

// Basic with strings
export const Default: Story = {
  render: args => {
    const [value, setValue] = useState<string[]>(['Role', 'Created']);
    return (
      <XDSMultiSelector
        {...args}
        label={args.label ?? 'Columns'}
        options={args.options ?? ['Name', 'Email', 'Role', 'Status', 'Created']}
        value={value}
        onChange={setValue}
      />
    );
  },
  args: {
    placeholder: 'Select columns...',
  },
};

// With sections
export const Sections: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <XDSMultiSelector
        label="Permissions"
        options={[
          {
            type: 'section',
            title: 'Read',
            options: [
              {value: 'read_posts', label: 'Read posts'},
              {value: 'read_comments', label: 'Read comments'},
              {value: 'read_users', label: 'Read users'},
            ],
          },
          {
            type: 'section',
            title: 'Write',
            options: [
              {value: 'write_posts', label: 'Write posts'},
              {value: 'write_comments', label: 'Write comments'},
            ],
          },
        ]}
        value={value}
        onChange={setValue}
        placeholder="Select permissions..."
      />
    );
  },
  decorators: [Story => <Story />],
};

// With Select All
export const SelectAll: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <XDSMultiSelector
        label="Columns"
        options={['Name', 'Email', 'Role', 'Status', 'Created', 'Updated']}
        value={value}
        onChange={setValue}
        hasSelectAll
        placeholder="Select columns..."
      />
    );
  },
  decorators: [Story => <Story />],
};

// Searchable
export const Searchable: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <XDSMultiSelector
        label="Countries"
        options={[
          'United States',
          'United Kingdom',
          'Canada',
          'Australia',
          'Germany',
          'France',
          'Japan',
          'Brazil',
          'India',
          'Mexico',
        ]}
        value={value}
        onChange={setValue}
        hasSearch
        hasSelectAll
        placeholder="Select countries..."
      />
    );
  },
  decorators: [Story => <Story />],
};

// Trigger display modes
export const TriggerModes: Story = {
  render: () => {
    const [value1, setValue1] = useState<string[]>(['Name', 'Email']);
    const [value2, setValue2] = useState<string[]>(['Name', 'Email', 'Role']);
    const [value3, setValue3] = useState<string[]>([
      'Name',
      'Email',
      'Role',
      'Status',
      'Created',
    ]);
    return (
      <div
        style={{display: 'flex', flexDirection: 'column', gap: 16, width: 300}}>
        <XDSMultiSelector
          label="Count (default)"
          options={['Name', 'Email', 'Role', 'Status', 'Created']}
          value={value1}
          onChange={setValue1}
          triggerDisplay="count"
        />
        <XDSMultiSelector
          label="Labels"
          options={['Name', 'Email', 'Role', 'Status', 'Created']}
          value={value2}
          onChange={setValue2}
          triggerDisplay="labels"
        />
        <XDSMultiSelector
          label="Badges"
          options={['Name', 'Email', 'Role', 'Status', 'Created']}
          value={value3}
          onChange={setValue3}
          triggerDisplay="badges"
          maxBadges={3}
        />
      </div>
    );
  },
  decorators: [Story => <Story />],
};

// Disabled items
export const DisabledItems: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(['admin']);
    return (
      <XDSMultiSelector
        label="Roles"
        options={[
          {value: 'admin', label: 'Admin', disabled: true},
          {value: 'editor', label: 'Editor'},
          {value: 'viewer', label: 'Viewer'},
          {value: 'guest', label: 'Guest'},
        ]}
        value={value}
        onChange={setValue}
        hasSelectAll
        placeholder="Select roles..."
      />
    );
  },
  decorators: [Story => <Story />],
};

// Status variants
export const Status: Story = {
  render: () => {
    const [value1, setValue1] = useState<string[]>([]);
    const [value2, setValue2] = useState<string[]>(['Email']);
    const [value3, setValue3] = useState<string[]>(['Name', 'Email']);
    return (
      <div
        style={{display: 'flex', flexDirection: 'column', gap: 16, width: 300}}>
        <XDSMultiSelector
          label="Error"
          options={['Name', 'Email', 'Role']}
          value={value1}
          onChange={setValue1}
          status={{type: 'error', message: 'Please select at least one column'}}
          placeholder="Select..."
        />
        <XDSMultiSelector
          label="Warning"
          options={['Name', 'Email', 'Role']}
          value={value2}
          onChange={setValue2}
          status={{type: 'warning', message: 'Email column has issues'}}
        />
        <XDSMultiSelector
          label="Success"
          options={['Name', 'Email', 'Role']}
          value={value3}
          onChange={setValue3}
          status={{type: 'success'}}
        />
      </div>
    );
  },
  decorators: [Story => <Story />],
};

// Size variants
export const Sizes: Story = {
  render: () => {
    const [value1, setValue1] = useState<string[]>([]);
    const [value2, setValue2] = useState<string[]>([]);
    const [value3, setValue3] = useState<string[]>([]);
    return (
      <div
        style={{display: 'flex', flexDirection: 'column', gap: 16, width: 300}}>
        <XDSMultiSelector
          label="Small"
          size="sm"
          options={['Name', 'Email', 'Role']}
          value={value1}
          onChange={setValue1}
          placeholder="Small (28px)"
        />
        <XDSMultiSelector
          label="Medium"
          size="md"
          options={['Name', 'Email', 'Role']}
          value={value2}
          onChange={setValue2}
          placeholder="Medium (32px)"
        />
        <XDSMultiSelector
          label="Large"
          size="lg"
          options={['Name', 'Email', 'Role']}
          value={value3}
          onChange={setValue3}
          placeholder="Large (36px)"
        />
      </div>
    );
  },
  decorators: [Story => <Story />],
};

// Form composition
export const FormComposition: Story = {
  render: () => {
    const [columns, setColumns] = useState<string[]>(['name', 'email']);
    const [filters, setFilters] = useState<string[]>([]);
    return (
      <div
        style={{display: 'flex', flexDirection: 'column', gap: 16, width: 300}}>
        <XDSMultiSelector
          label="Visible columns"
          description="Choose which columns to display in the table"
          options={[
            {value: 'name', label: 'Name'},
            {value: 'email', label: 'Email'},
            {value: 'role', label: 'Role'},
            {value: 'status', label: 'Status'},
            {value: 'created', label: 'Created at'},
          ]}
          value={columns}
          onChange={setColumns}
          hasSelectAll
          isRequired
          triggerDisplay="labels"
        />
        <XDSMultiSelector
          label="Status filter"
          description="Filter by status"
          options={['Active', 'Inactive', 'Pending', 'Archived']}
          value={filters}
          onChange={setFilters}
          isOptional
          triggerDisplay="badges"
          placeholder="All statuses"
        />
      </div>
    );
  },
  decorators: [Story => <Story />],
};

// Column visibility
export const ColumnVisibility: Story = {
  render: () => {
    const allColumns = [
      {value: 'name', label: 'Name'},
      {value: 'email', label: 'Email'},
      {value: 'role', label: 'Role'},
      {value: 'status', label: 'Status'},
      {value: 'created', label: 'Created'},
      {value: 'updated', label: 'Updated'},
      {value: 'actions', label: 'Actions'},
    ];
    const [visible, setVisible] = useState<string[]>([
      'name',
      'email',
      'role',
      'status',
    ]);
    return (
      <XDSMultiSelector
        label="Columns"
        isLabelHidden
        options={allColumns}
        value={visible}
        onChange={setVisible}
        hasSelectAll
        hasSearch
        triggerDisplay="count"
        placeholder="Columns"
      />
    );
  },
  decorators: [Story => <Story />],
};

export const Clearable: Story = {
  render: args => {
    const [value, setValue] = useState<string[]>(['react', 'typescript']);
    return (
      <XDSMultiSelector
        {...args}
        options={[
          {value: 'react', label: 'React'},
          {value: 'typescript', label: 'TypeScript'},
          {value: 'stylex', label: 'StyleX'},
          {value: 'vitest', label: 'Vitest'},
        ]}
        value={value}
        onChange={setValue}
        hasClear
      />
    );
  },
  args: {
    label: 'Technologies',
    placeholder: 'Select technologies...',
  },
};
