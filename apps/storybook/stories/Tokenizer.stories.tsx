import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSTokenizer} from '@xds/core/Tokenizer';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';

// Sample data
const users: XDSSearchableItem[] = [
  {id: '1', label: 'Alice Johnson'},
  {id: '2', label: 'Bob Smith'},
  {id: '3', label: 'Charlie Brown'},
  {id: '4', label: 'Diana Prince'},
  {id: '5', label: 'Eve Williams'},
  {id: '6', label: 'Frank Miller'},
  {id: '7', label: 'Grace Lee'},
  {id: '8', label: 'Henry Davis'},
];

const userSource: XDSSearchSource = {
  search: (query: string) =>
    users.filter(u => u.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => users.slice(0, 5),
};

const meta: Meta<typeof XDSTokenizer> = {
  title: 'Form/XDSTokenizer',
  component: XDSTokenizer,
  tags: ['autodocs'],
  argTypes: {
    label: {control: 'text'},
    placeholder: {control: 'text'},
    isDisabled: {control: 'boolean'},
    isRequired: {control: 'boolean'},
    isOptional: {control: 'boolean'},
    hasClear: {control: 'boolean'},
    maxEntries: {control: 'number'},
  },
  decorators: [
    Story => (
      <div style={{width: 400}}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof XDSTokenizer>;

export const Default: Story = {
  render: args => {
    const [value, setValue] = useState<XDSSearchableItem[]>([]);
    return (
      <XDSTokenizer
        {...args}
        searchSource={userSource}
        value={value}
        onChange={items => setValue(items)}
      />
    );
  },
  args: {
    label: 'Team Members',
    placeholder: 'Search people...',
  },
};

export const WithPreselected: Story = {
  render: args => {
    const [value, setValue] = useState([users[0], users[2]]);
    return (
      <XDSTokenizer
        {...args}
        searchSource={userSource}
        value={value}
        onChange={items => setValue(items)}
      />
    );
  },
  args: {
    label: 'Team Members',
    placeholder: 'Add more...',
  },
  name: 'Pre-selected Items',
};

export const WithClear: Story = {
  ...Default,
  args: {
    ...Default.args,
    hasClear: true,
  },
  name: 'With Clear All Button',
};

export const MaxEntries: Story = {
  ...Default,
  args: {
    ...Default.args,
    maxEntries: 3,
  },
  name: 'Max 3 Entries',
};

export const Required: Story = {
  ...Default,
  args: {
    ...Default.args,
    isRequired: true,
  },
};

export const WithDescription: Story = {
  ...Default,
  args: {
    ...Default.args,
    description: 'Select up to 5 team members for this project',
  },
};

export const WithError: Story = {
  ...Default,
  args: {
    ...Default.args,
    status: {type: 'error', message: 'At least one member is required'},
  },
};

export const WithWarning: Story = {
  ...Default,
  args: {
    ...Default.args,
    status: {type: 'warning', message: 'Some members may not have access'},
  },
};

export const WithSuccess: Story = {
  ...Default,
  args: {
    ...Default.args,
    status: {type: 'success', message: 'Team is ready!'},
  },
};

export const Disabled: Story = {
  render: args => {
    const [value] = useState([users[0], users[1]]);
    return (
      <XDSTokenizer
        {...args}
        searchSource={userSource}
        value={value}
        onChange={() => {}}
      />
    );
  },
  args: {
    label: 'Team Members',
    isDisabled: true,
  },
};
