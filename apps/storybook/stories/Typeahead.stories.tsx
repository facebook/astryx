// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Typeahead} from '@astryxdesign/core/Typeahead';
import type {SearchableItem, SearchSource} from '@astryxdesign/core/Typeahead';
import {MagnifyingGlassIcon} from '@heroicons/react/24/outline';

// Sample data
const fruits: SearchableItem[] = [
  {id: '1', label: 'Apple'},
  {id: '2', label: 'Banana'},
  {id: '3', label: 'Cherry'},
  {id: '4', label: 'Date'},
  {id: '5', label: 'Elderberry'},
  {id: '6', label: 'Fig'},
  {id: '7', label: 'Grape'},
  {id: '8', label: 'Honeydew'},
];

const fruitSource: SearchSource = {
  search: (query: string) =>
    fruits.filter(f => f.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => fruits.slice(0, 5),
};

const meta: Meta<typeof Typeahead> = {
  title: 'Core/Typeahead',
  component: Typeahead,
  tags: ['autodocs'],
  argTypes: {
    label: {control: 'text'},
    placeholder: {control: 'text'},
    isDisabled: {control: 'boolean'},
    disabledMessage: {
      control: 'text',
      description:
        'Explains why the input is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the field focusable via aria-disabled (activation stays blocked). Use this instead of wrapping a disabled Typeahead in Tooltip.',
    },
    isRequired: {control: 'boolean'},
    isOptional: {control: 'boolean'},
    hasEntriesOnFocus: {control: 'boolean'},
    hasClear: {control: 'boolean'},
    maxMenuItems: {control: 'number'},
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
      description: 'Input size',
    },
  },
  decorators: [
    Story => (
      <div style={{width: 320}}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Typeahead>;

export const Default: Story = {
  render: args => {
    const [value, setValue] = useState<SearchableItem | null>(null);
    return (
      <Typeahead
        {...args}
        searchSource={fruitSource}
        value={value}
        onChange={setValue}
      />
    );
  },
  args: {
    label: 'Fruit',
    placeholder: 'Search fruits...',
  },
};

export const WithBootstrap: Story = {
  ...Default,
  args: {
    ...Default.args,
    hasEntriesOnFocus: true,
  },
  name: 'With Bootstrap Results',
};

export const Required: Story = {
  ...Default,
  args: {
    ...Default.args,
    isRequired: true,
  },
};

export const Optional: Story = {
  ...Default,
  args: {
    ...Default.args,
    isOptional: true,
  },
};

export const WithDescription: Story = {
  ...Default,
  args: {
    ...Default.args,
    description: 'Pick your favorite fruit from the list',
  },
};

export const WithError: Story = {
  ...Default,
  args: {
    ...Default.args,
    status: {type: 'error', message: 'Please select a fruit'},
  },
};

export const WithWarning: Story = {
  ...Default,
  args: {
    ...Default.args,
    status: {type: 'warning', message: 'This fruit may be out of season'},
  },
};

export const WithSuccess: Story = {
  ...Default,
  args: {
    ...Default.args,
    status: {type: 'success', message: 'Great choice!'},
  },
};

export const Disabled: Story = {
  ...Default,
  args: {
    ...Default.args,
    isDisabled: true,
  },
};

// Disabled with an explanation tooltip. Hover or keyboard-focus the field to
// see why it's disabled — the reason is announced to assistive tech via
// aria-describedby, and the field stays focusable (activation is still
// blocked). Use disabledMessage instead of wrapping a disabled Typeahead in Tooltip:
// disabled controls swallow the pointer events a Tooltip wrapper needs.
export const DisabledWithMessage: Story = {
  ...Default,
  args: {
    ...Default.args,
    isDisabled: true,
    disabledMessage: 'You need the Editor role to change this',
  },
};

export const NoClear: Story = {
  ...Default,
  args: {
    ...Default.args,
    hasClear: false,
  },
  name: 'Without Clear Button',
};

export const LimitedResults: Story = {
  ...Default,
  args: {
    ...Default.args,
    hasEntriesOnFocus: true,
    maxMenuItems: 3,
  },
  name: 'Max 3 Results',
};

export const SizeVariants: Story = {
  render: () => {
    const [sm, setSm] = useState<SearchableItem | null>(null);
    const [md, setMd] = useState<SearchableItem | null>(null);
    const [lg, setLg] = useState<SearchableItem | null>(null);
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        <Typeahead
          label="Small (28px)"
          searchSource={fruitSource}
          value={sm}
          onChange={setSm}
          placeholder="Small size"
          size="sm"
        />
        <Typeahead
          label="Medium (32px)"
          searchSource={fruitSource}
          value={md}
          onChange={setMd}
          placeholder="Medium size (default)"
          size="md"
        />
        <Typeahead
          label="Large (36px)"
          searchSource={fruitSource}
          value={lg}
          onChange={setLg}
          placeholder="Large size"
          size="lg"
        />
      </div>
    );
  },
};

export const WithStartIcon: Story = {
  ...Default,
  args: {
    ...Default.args,
    startIcon: MagnifyingGlassIcon,
    hasEntriesOnFocus: true,
  },
  name: 'With Start Icon',
};

export const StatusVariantComparison: Story = {
  render: () => {
    const [a, setA] = useState<SearchableItem | null>(null);
    const [b, setB] = useState<SearchableItem | null>(null);
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 24, width: 300}}>
        <Typeahead
          label="Attached (default)"
          searchSource={fruitSource}
          value={a}
          onChange={setA}
          status={{type: 'error', message: 'Please make a selection'}}
        />
        <Typeahead
          label="Detached"
          searchSource={fruitSource}
          value={b}
          onChange={setB}
          status={{type: 'error', message: 'Please make a selection'}}
          statusVariant="detached"
        />
      </div>
    );
  },
};
