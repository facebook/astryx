// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSInputGroup} from '@xds/core/InputGroup';
import {XDSInputGroupText} from '@xds/core/InputGroup';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSNumberInput} from '@xds/core/NumberInput';
import {XDSIcon} from '@xds/core/Icon';

const meta: Meta<typeof XDSInputGroup> = {
  title: 'Core/InputGroup',
  component: XDSInputGroup,
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
type Story = StoryObj<typeof XDSInputGroup>;

export const WithPrefix: Story = {
  render: args => {
    const [value, setValue] = useState('');
    return (
      <XDSInputGroup {...args}>
        <XDSInputGroupText>$</XDSInputGroupText>
        <XDSTextInput
          label="Amount"
          isLabelHidden
          value={value}
          onChange={setValue}
          placeholder="0.00"
        />
      </XDSInputGroup>
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
      <XDSInputGroup {...args}>
        <XDSTextInput
          label="Weight"
          isLabelHidden
          value={value}
          onChange={setValue}
          placeholder="0"
        />
        <XDSInputGroupText>kg</XDSInputGroupText>
      </XDSInputGroup>
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
      <XDSInputGroup {...args}>
        <XDSInputGroupText>https://</XDSInputGroupText>
        <XDSTextInput
          label="URL"
          isLabelHidden
          value={value}
          onChange={setValue}
          placeholder="example"
        />
        <XDSInputGroupText>.com</XDSInputGroupText>
      </XDSInputGroup>
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
      <XDSInputGroup {...args}>
        <XDSInputGroupText>
          <XDSIcon icon="search" size="sm" color="secondary" />
        </XDSInputGroupText>
        <XDSTextInput
          label="Search"
          isLabelHidden
          value={value}
          onChange={setValue}
          placeholder="Search..."
        />
      </XDSInputGroup>
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
      <XDSInputGroup {...args}>
        <XDSInputGroupText>$</XDSInputGroupText>
        <XDSNumberInput
          label="Amount"
          isLabelHidden
          value={value}
          onChange={setValue}
          placeholder="0.00"
        />
      </XDSInputGroup>
    );
  },
  args: {
    label: 'Budget',
  },
};

export const WithDescription: Story = {
  render: args => {
    const [value, setValue] = useState('');
    return (
      <XDSInputGroup {...args}>
        <XDSInputGroupText>@</XDSInputGroupText>
        <XDSTextInput
          label="Username"
          isLabelHidden
          value={value}
          onChange={setValue}
          placeholder="username"
        />
      </XDSInputGroup>
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
      <XDSInputGroup {...args}>
        <XDSInputGroupText>$</XDSInputGroupText>
        <XDSTextInput
          label="Amount"
          isLabelHidden
          value={value}
          onChange={setValue}
          placeholder="0.00"
        />
      </XDSInputGroup>
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
      <XDSInputGroup {...args}>
        <XDSInputGroupText>$</XDSInputGroupText>
        <XDSTextInput
          label="Amount"
          isLabelHidden
          value={value}
          onChange={setValue}
          placeholder="0.00"
        />
      </XDSInputGroup>
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
        <XDSInputGroup {...args}>
          <XDSInputGroupText>https://</XDSInputGroupText>
          <XDSTextInput
            label="URL"
            isLabelHidden
            value={value}
            onChange={setValue}
            placeholder="example.com"
          />
        </XDSInputGroup>
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
      <XDSInputGroup {...args}>
        <XDSTextInput
          label="Address"
          isLabelHidden
          value={left}
          onChange={setLeft}
          placeholder="Address"
        />
        <XDSInputGroupText>@</XDSInputGroupText>
        <XDSTextInput
          label="Domain"
          isLabelHidden
          value={right}
          onChange={setRight}
          placeholder="Domain"
        />
      </XDSInputGroup>
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
        <XDSInputGroup label="Price">
          <XDSInputGroupText>$</XDSInputGroupText>
          <XDSTextInput
            label="Amount"
            isLabelHidden
            value={v1}
            onChange={setV1}
            placeholder="0.00"
          />
        </XDSInputGroup>
        <XDSInputGroup label="Website">
          <XDSInputGroupText>https://</XDSInputGroupText>
          <XDSTextInput
            label="URL"
            isLabelHidden
            value={v2}
            onChange={setV2}
            placeholder="example"
          />
          <XDSInputGroupText>.com</XDSInputGroupText>
        </XDSInputGroup>
        <XDSInputGroup label="Weight">
          <XDSTextInput
            label="Weight"
            isLabelHidden
            value={v3}
            onChange={setV3}
            placeholder="0"
          />
          <XDSInputGroupText>kg</XDSInputGroupText>
        </XDSInputGroup>
        <XDSInputGroup
          label="Price"
          status={{type: 'error', message: 'Price is required'}}>
          <XDSInputGroupText>$</XDSInputGroupText>
          <XDSTextInput
            label="Amount"
            isLabelHidden
            value={v4}
            onChange={setV4}
            placeholder="0.00"
          />
        </XDSInputGroup>
      </div>
    );
  },
};
