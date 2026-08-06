// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {RadioControl} from '@astryxdesign/core/RadioList';

const meta: Meta<typeof RadioControl> = {
  title: 'Core/RadioControl',
  component: RadioControl,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Accessible name (aria-label) for the control',
    },
    value: {
      control: 'text',
      description: 'Value reported when this radio is selected',
    },
    htmlName: {
      control: 'text',
      description: 'HTML name shared by the radio group',
    },
    isChecked: {
      control: 'boolean',
      description: 'Whether the radio is selected',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Size of the radio control',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Whether the radio is disabled',
    },
    isRequired: {
      control: 'boolean',
      description: 'Whether the radio is required',
    },
    disabledMessage: {
      control: 'text',
      description: 'Reason shown when disabled (keeps the control focusable)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof RadioControl>;

// The control renders only the circle — pair it with your own visible text.
// A radio is selected by choosing it; it is deselected by choosing another in
// the same group (see ControlledGroup), never by clicking it again — so a lone
// radio is not a toggle. This default shows a single selected control.
export const Default: Story = {
  args: {
    label: 'Email',
    htmlName: 'notify',
    value: 'email',
    isChecked: true,
  },
  render: args => <RadioControl {...args} onChange={() => {}} />,
};

export const Sizes: Story = {
  render: () => (
    <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
      <RadioControl
        label="Small"
        htmlName="sizes"
        value="sm"
        size="sm"
        isChecked
        onChange={() => {}}
      />
      <RadioControl
        label="Medium"
        htmlName="sizes"
        value="md"
        size="md"
        isChecked
        onChange={() => {}}
      />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
      <RadioControl
        label="Disabled unchecked"
        htmlName="disabled"
        value="a"
        isChecked={false}
        isDisabled
        onChange={() => {}}
      />
      <RadioControl
        label="Disabled checked"
        htmlName="disabled"
        value="b"
        isChecked
        isDisabled
        onChange={() => {}}
      />
    </div>
  ),
};

// Disabled with a reason: the control stays focusable and surfaces the reason
// on hover / keyboard focus, so it is discoverable by assistive technology.
export const DisabledWithReason: Story = {
  render: () => (
    <RadioControl
      label="Legacy mode"
      htmlName="mode"
      value="legacy"
      isChecked={false}
      isDisabled
      disabledMessage="Locked by your administrator"
      onChange={() => {}}
    />
  ),
};

// Grouping and single-select come from a shared htmlName: selecting one option
// deselects the others. This is the correct way to build a radio group by
// composing the control with your own layout and visible labels.
export const ControlledGroup: Story = {
  render: () => {
    const [value, setValue] = useState('email');
    const options = [
      {label: 'Email', value: 'email'},
      {label: 'SMS', value: 'sms'},
      {label: 'Push', value: 'push'},
    ];
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
        {options.map(opt => (
          <label
            key={opt.value}
            style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <RadioControl
              label={opt.label}
              htmlName="channel"
              value={opt.value}
              isChecked={value === opt.value}
              onChange={setValue}
            />
            {opt.label}
          </label>
        ))}
      </div>
    );
  },
};
