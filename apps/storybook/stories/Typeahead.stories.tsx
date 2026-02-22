import React, {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSTypeahead} from '@xds/core/Typeahead';
import type {XDSSearchableItem, XDSSearchSource} from '@xds/core/Typeahead';

const meta: Meta<typeof XDSTypeahead> = {
  title: 'Core/XDSTypeahead',
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
};

export default meta;
type Story = StoryObj<typeof XDSTypeahead>;

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

function TypeaheadExample(
  props: Partial<React.ComponentProps<typeof XDSTypeahead>>,
) {
  const [value, setValue] = useState<XDSSearchableItem | null>(null);
  return (
    <div style={{width: 320}}>
      <XDSTypeahead
        label="Fruit"
        searchSource={fruitSource}
        value={value}
        onChange={setValue}
        placeholder="Search fruits..."
        {...props}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <TypeaheadExample />,
};

export const WithBootstrap: Story = {
  render: () => <TypeaheadExample hasEntriesOnFocus />,
  name: 'With Bootstrap Results',
};

export const Required: Story = {
  render: () => <TypeaheadExample isRequired />,
};

export const Optional: Story = {
  render: () => <TypeaheadExample isOptional />,
};

export const WithDescription: Story = {
  render: () => (
    <TypeaheadExample description="Pick your favorite fruit from the list" />
  ),
};

export const WithError: Story = {
  render: () => (
    <TypeaheadExample
      status={{type: 'error', message: 'Please select a fruit'}}
    />
  ),
};

export const Disabled: Story = {
  render: () => <TypeaheadExample isDisabled />,
};

export const NoClear: Story = {
  render: () => <TypeaheadExample hasClear={false} />,
  name: 'Without Clear Button',
};

export const LimitedResults: Story = {
  render: () => <TypeaheadExample maxMenuItems={3} hasEntriesOnFocus />,
  name: 'Max 3 Results',
};
