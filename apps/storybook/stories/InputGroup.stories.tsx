// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {InputGroup} from '@astryxdesign/core/InputGroup';
import {InputGroupText} from '@astryxdesign/core/InputGroup';
import {TextInput} from '@astryxdesign/core/TextInput';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {TimeInput} from '@astryxdesign/core/TimeInput';
import {Icon} from '@astryxdesign/core/Icon';
import type {ISOTimeString} from '@astryxdesign/core';

const meta: Meta<typeof InputGroup> = {
  title: 'Core/InputGroup',
  component: InputGroup,
  tags: ['autodocs'],
  argTypes: {
    label: {control: 'text', description: 'Label text (required)'},
    isLabelHidden: {control: 'boolean', description: 'Visually hide the label'},
    description: {control: 'text', description: 'Description text'},
    isDisabled: {control: 'boolean', description: 'Disable the group'},
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
      description: 'Input size',
    },
  },
};

export default meta;
type Story = StoryObj<typeof InputGroup>;

export const WithPrefix: Story = {
  render: args => {
    const [value, setValue] = useState('');
    return (
      <InputGroup {...args}>
        <InputGroupText>$</InputGroupText>
        <TextInput
          label="Amount"
          isLabelHidden
          value={value}
          onChange={setValue}
          placeholder="0.00"
        />
      </InputGroup>
    );
  },
  args: {
    label: 'Price',
  },
};

export const WithSuffix: Story = {
  render: args => {
    const [value, setValue] = useState('');
    return (
      <InputGroup {...args}>
        <TextInput
          label="Weight"
          isLabelHidden
          value={value}
          onChange={setValue}
          placeholder="0"
        />
        <InputGroupText>kg</InputGroupText>
      </InputGroup>
    );
  },
  args: {
    label: 'Weight',
  },
};

export const WithPrefixAndSuffix: Story = {
  render: args => {
    const [value, setValue] = useState('');
    return (
      <InputGroup {...args}>
        <InputGroupText>https://</InputGroupText>
        <TextInput
          label="URL"
          isLabelHidden
          value={value}
          onChange={setValue}
          placeholder="example"
        />
        <InputGroupText>.com</InputGroupText>
      </InputGroup>
    );
  },
  args: {
    label: 'Website',
  },
};

export const WithIconPrefix: Story = {
  render: args => {
    const [value, setValue] = useState('');
    return (
      <InputGroup {...args}>
        <InputGroupText>
          <Icon icon="search" size="sm" color="secondary" />
        </InputGroupText>
        <TextInput
          label="Search"
          isLabelHidden
          value={value}
          onChange={setValue}
          placeholder="Search..."
        />
      </InputGroup>
    );
  },
  args: {
    label: 'Search',
    isLabelHidden: true,
  },
};

export const WithNumberInput: Story = {
  render: args => {
    const [value, setValue] = useState<number | undefined>(undefined);
    return (
      <InputGroup {...args}>
        <InputGroupText>$</InputGroupText>
        <NumberInput
          label="Amount"
          isLabelHidden
          value={value}
          onChange={setValue}
          placeholder="0.00"
        />
      </InputGroup>
    );
  },
  args: {
    label: 'Budget',
  },
};

export const WithTimeInput: Story = {
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>(
      '09:00' as ISOTimeString,
    );
    return (
      <InputGroup {...args}>
        <InputGroupText>Starts</InputGroupText>
        <TimeInput
          label="Start time"
          isLabelHidden
          value={value}
          onChange={setValue}
          hourFormat="24h"
          placeholder="09:00"
        />
      </InputGroup>
    );
  },
  args: {
    label: 'Schedule',
    description: 'Use local time',
  },
};

export const WithDescription: Story = {
  render: args => {
    const [value, setValue] = useState('');
    return (
      <InputGroup {...args}>
        <InputGroupText>@</InputGroupText>
        <TextInput
          label="Username"
          isLabelHidden
          value={value}
          onChange={setValue}
          placeholder="username"
        />
      </InputGroup>
    );
  },
  args: {
    label: 'Username',
    description: 'Your public display name',
  },
};

export const WithErrorStatus: Story = {
  render: args => {
    const [value, setValue] = useState('');
    return (
      <InputGroup {...args}>
        <InputGroupText>$</InputGroupText>
        <TextInput
          label="Amount"
          isLabelHidden
          value={value}
          onChange={setValue}
          placeholder="0.00"
        />
      </InputGroup>
    );
  },
  args: {
    label: 'Price',
    status: {type: 'error', message: 'Price is required'},
  },
};

export const SmallSize: Story = {
  render: args => {
    const [value, setValue] = useState('');
    return (
      <InputGroup {...args}>
        <InputGroupText>$</InputGroupText>
        <TextInput
          label="Amount"
          isLabelHidden
          value={value}
          onChange={setValue}
          placeholder="0.00"
        />
      </InputGroup>
    );
  },
  args: {
    label: 'Price',
    size: 'sm',
  },
};

export const FullWidth: Story = {
  render: args => {
    const [value, setValue] = useState('');
    return (
      <div style={{maxWidth: 500}}>
        <InputGroup {...args}>
          <InputGroupText>https://</InputGroupText>
          <TextInput
            label="URL"
            isLabelHidden
            value={value}
            onChange={setValue}
            placeholder="example.com"
          />
        </InputGroup>
      </div>
    );
  },
  args: {
    label: 'Website URL',
  },
};

export const TwoInputs: Story = {
  render: args => {
    const [left, setLeft] = useState('');
    const [right, setRight] = useState('');
    return (
      <InputGroup {...args}>
        <TextInput
          label="Address"
          isLabelHidden
          value={left}
          onChange={setLeft}
          placeholder="Address"
        />
        <InputGroupText>@</InputGroupText>
        <TextInput
          label="Domain"
          isLabelHidden
          value={right}
          onChange={setRight}
          placeholder="Domain"
        />
      </InputGroup>
    );
  },
  args: {
    label: 'Email',
  },
};

export const AllVariations: Story = {
  render: () => {
    const [v1, setV1] = useState('');
    const [v2, setV2] = useState('');
    const [v3, setV3] = useState('');
    const [v4, setV4] = useState('');

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '400px',
        }}>
        <InputGroup label="Price">
          <InputGroupText>$</InputGroupText>
          <TextInput
            label="Amount"
            isLabelHidden
            value={v1}
            onChange={setV1}
            placeholder="0.00"
          />
        </InputGroup>
        <InputGroup label="Website">
          <InputGroupText>https://</InputGroupText>
          <TextInput
            label="URL"
            isLabelHidden
            value={v2}
            onChange={setV2}
            placeholder="example"
          />
          <InputGroupText>.com</InputGroupText>
        </InputGroup>
        <InputGroup label="Weight">
          <TextInput
            label="Weight"
            isLabelHidden
            value={v3}
            onChange={setV3}
            placeholder="0"
          />
          <InputGroupText>kg</InputGroupText>
        </InputGroup>
        <InputGroup
          label="Price"
          status={{type: 'error', message: 'Price is required'}}>
          <InputGroupText>$</InputGroupText>
          <TextInput
            label="Amount"
            isLabelHidden
            value={v4}
            onChange={setV4}
            placeholder="0.00"
          />
        </InputGroup>
      </div>
    );
  },
};
