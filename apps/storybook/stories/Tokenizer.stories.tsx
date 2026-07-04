// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Tokenizer} from '@astryxdesign/core/Tokenizer';
import type {SearchableItem, SearchSource} from '@astryxdesign/core/Typeahead';
import {Button} from '@astryxdesign/core/Button';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';

// Sample data
const users: SearchableItem[] = [
  {id: '1', label: 'Alice Johnson'},
  {id: '2', label: 'Bob Smith'},
  {id: '3', label: 'Charlie Brown'},
  {id: '4', label: 'Diana Prince'},
  {id: '5', label: 'Eve Williams'},
  {id: '6', label: 'Frank Miller'},
  {id: '7', label: 'Grace Lee'},
  {id: '8', label: 'Henry Davis'},
];

const userSource: SearchSource = {
  search: (query: string) =>
    users.filter(u => u.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => users.slice(0, 5),
};

const meta: Meta<typeof Tokenizer> = {
  title: 'Core/Tokenizer',
  component: Tokenizer,
  tags: ['autodocs'],
  argTypes: {
    label: {control: 'text'},
    placeholder: {control: 'text'},
    isDisabled: {control: 'boolean'},
    disabledMessage: {
      control: 'text',
      description:
        'Explains why the tokenizer is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the input focusable via aria-disabled (input stays blocked). Use this instead of wrapping a disabled Tokenizer in Tooltip.',
    },
    isRequired: {control: 'boolean'},
    isOptional: {control: 'boolean'},
    hasClear: {control: 'boolean'},
    maxEntries: {control: 'number'},
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
      description: 'Input size',
    },
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
type Story = StoryObj<typeof Tokenizer>;

export const Default: Story = {
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([]);
    return (
      <Tokenizer
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
      <Tokenizer
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
      <Tokenizer
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

export const WithStartIcon: Story = {
  ...Default,
  args: {
    ...Default.args,
    startIcon: MagnifyingGlassIcon,
  },
  name: 'With Start Icon',
};

export const WithStartIconAndTokens: Story = {
  render: args => {
    const [value, setValue] = useState([users[0], users[2]]);
    return (
      <Tokenizer
        {...args}
        searchSource={userSource}
        value={value}
        onChange={items => setValue(items)}
      />
    );
  },
  args: {
    label: 'Team Members',
    startIcon: MagnifyingGlassIcon,
  },
  name: 'With Start Icon and Tokens',
};

export const WithEntriesOnFocus: Story = {
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([]);
    return (
      <Tokenizer
        {...args}
        searchSource={userSource}
        value={value}
        onChange={items => setValue(items)}
        hasEntriesOnFocus
      />
    );
  },
  args: {
    label: 'Team Members',
    placeholder: 'Click to see suggestions...',
  },
  name: 'With Entries On Focus',
};

export const OverflowInline: Story = {
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([
      users[0],
      users[1],
      users[2],
      users[3],
      users[4],
      users[5],
    ]);
    return (
      <div>
        <Tokenizer
          {...args}
          searchSource={userSource}
          value={value}
          onChange={items => setValue(items)}
          tokenOverflowBehavior="unfocusedInline"
        />
        <p style={{marginTop: 8}}>
          This text will shift down when the tokenizer expands on focus.
        </p>
      </div>
    );
  },
  args: {
    label: 'Team Members',
    placeholder: 'Add more...',
  },
  name: 'Overflow Inline',
};

export const OverflowLayer: Story = {
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([
      users[0],
      users[1],
      users[2],
      users[3],
      users[4],
      users[5],
    ]);
    return (
      <div>
        <Tokenizer
          {...args}
          searchSource={userSource}
          value={value}
          onChange={items => setValue(items)}
          tokenOverflowBehavior="unfocusedLayer"
        />
        <p style={{marginTop: 8}}>
          This text should not shift when the tokenizer expands on focus.
        </p>
      </div>
    );
  },
  args: {
    label: 'Team Members',
    placeholder: 'Add more...',
  },
  name: 'Overflow Layer',
};

export const WithEndContent: Story = {
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([users[0], users[2]]);
    return (
      <Tokenizer
        {...args}
        searchSource={userSource}
        value={value}
        onChange={items => setValue(items)}
        endContent={<Button label="Apply" variant="primary" size="sm" />}
      />
    );
  },
  args: {
    label: 'Team Members',
  },
  name: 'With End Content',
};

// Empty source for free-text-only tokenizers
const emptySource: SearchSource = {
  search: () => [],
  bootstrap: () => [],
};

export const Creatable: Story = {
  render: args => {
    const [tags, setTags] = useState<SearchableItem[]>([]);
    return (
      <div>
        <Tokenizer
          {...args}
          searchSource={emptySource}
          value={tags}
          onChange={(items, _change) => {
            setTags(items);
          }}
          hasCreate
          placeholder="Type a tag and press Enter..."
        />
        <p style={{marginTop: 8, fontSize: 14, color: '#666'}}>
          {tags.length} tag{tags.length !== 1 ? 's' : ''} added
        </p>
      </div>
    );
  },
  args: {
    label: 'Tags',
  },
  name: 'Creatable (Free Text)',
};

export const SizeVariants: Story = {
  render: () => {
    const [sm, setSm] = useState<SearchableItem[]>([]);
    const [md, setMd] = useState<SearchableItem[]>([users[0], users[2]]);
    const [lg, setLg] = useState<SearchableItem[]>([]);
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        <Tokenizer
          label="Small (28px)"
          searchSource={userSource}
          value={sm}
          onChange={items => setSm(items)}
          placeholder="Small size"
          size="sm"
          hasClear
        />
        <Tokenizer
          label="Medium (32px)"
          searchSource={userSource}
          value={md}
          onChange={items => setMd(items)}
          placeholder="Medium size (default)"
          size="md"
          hasClear
        />
        <Tokenizer
          label="Large (36px)"
          searchSource={userSource}
          value={lg}
          onChange={items => setLg(items)}
          placeholder="Large size"
          size="lg"
          hasClear
        />
      </div>
    );
  },
};

export const CreatableWithSearch: Story = {
  render: args => {
    const [value, setValue] = useState<SearchableItem[]>([]);
    return (
      <Tokenizer
        {...args}
        searchSource={userSource}
        value={value}
        onChange={(items, _change) => {
          setValue(items);
        }}
        hasCreate
        hasEntriesOnFocus
        placeholder="Search or type a new name..."
      />
    );
  },
  args: {
    label: 'Team Members',
  },
  name: 'Creatable + Search',
};

// Disabled with an explanation tooltip. Hover or keyboard-focus the input to see
// why it's disabled — the reason is announced to assistive tech via
// aria-describedby, and the input stays focusable (input is still blocked). Use
// disabledMessage instead of wrapping a disabled Tokenizer in Tooltip: disabled
// controls swallow the pointer events a Tooltip wrapper needs.
export const DisabledWithMessage: Story = {
  render: args => {
    const [value] = useState([users[0], users[1]]);
    return (
      <Tokenizer
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
    disabledMessage: 'You need edit access to change members',
  },
};
