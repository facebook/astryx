import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSTypeahead} from '@xds/core/Typeahead';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';

// Sample data
const fruits: XDSSearchableItem[] = [
  {id: '1', label: 'Apple'},
  {id: '2', label: 'Banana'},
  {id: '3', label: 'Cherry'},
  {id: '4', label: 'Date'},
  {id: '5', label: 'Elderberry'},
  {id: '6', label: 'Fig'},
  {id: '7', label: 'Grape'},
  {id: '8', label: 'Honeydew'},
];

const fruitSource: XDSSearchSource = {
  search: (query: string) =>
    fruits.filter(f => f.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => fruits.slice(0, 5),
};

const meta: Meta<typeof XDSTypeahead> = {
  title: 'Form/XDSTypeahead',
  component: XDSTypeahead,
  tags: ['autodocs'],
  argTypes: {
    label: {control: 'text'},
    placeholder: {control: 'text'},
    isDisabled: {control: 'boolean'},
    isRequired: {control: 'boolean'},
    isOptional: {control: 'boolean'},
    hasEntriesOnFocus: {control: 'boolean'},
    hasClear: {control: 'boolean'},
    maxMenuItems: {control: 'number'},
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
type Story = StoryObj<typeof XDSTypeahead>;

export const Default: Story = {
  render: args => {
    const [value, setValue] = useState<XDSSearchableItem | null>(null);
    return (
      <XDSTypeahead
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
