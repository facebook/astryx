import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSTokenizer} from '@xds/core/Tokenizer';
import type {XDSTokenizerChange} from '@xds/core/Tokenizer';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';

const meta: Meta<typeof XDSTokenizer> = {
  title: 'Core/XDSTokenizer',
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
};

export default meta;
type Story = StoryObj<typeof XDSTokenizer>;

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

function TokenizerExample(
  props: Partial<React.ComponentProps<typeof XDSTokenizer>>,
) {
  const [value, setValue] = useState<XDSSearchableItem[]>([]);
  return (
    <div style={{width: 400}}>
      <XDSTokenizer
        label="Team Members"
        searchSource={userSource}
        value={value}
        onChange={items => setValue(items)}
        placeholder="Search people..."
        {...props}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <TokenizerExample />,
};

export const WithPreselected: Story = {
  render: () => {
    const [value, setValue] = useState([users[0], users[2]]);
    return (
      <div style={{width: 400}}>
        <XDSTokenizer
          label="Team Members"
          searchSource={userSource}
          value={value}
          onChange={items => setValue(items)}
          placeholder="Add more..."
        />
      </div>
    );
  },
  name: 'Pre-selected Items',
};

export const WithClear: Story = {
  render: () => <TokenizerExample hasClear />,
  name: 'With Clear All Button',
};

export const MaxEntries: Story = {
  render: () => <TokenizerExample maxEntries={3} />,
  name: 'Max 3 Entries',
};

export const Required: Story = {
  render: () => <TokenizerExample isRequired />,
};

export const WithDescription: Story = {
  render: () => (
    <TokenizerExample description="Select up to 5 team members for this project" />
  ),
};

export const WithError: Story = {
  render: () => (
    <TokenizerExample
      status={{type: 'error', message: 'At least one member is required'}}
    />
  ),
};

export const Disabled: Story = {
  render: () => {
    const [value] = useState([users[0], users[1]]);
    return (
      <div style={{width: 400}}>
        <XDSTokenizer
          label="Team Members"
          searchSource={userSource}
          value={value}
          onChange={() => {}}
          isDisabled
        />
      </div>
    );
  },
};
