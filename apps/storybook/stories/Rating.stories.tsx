// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Rating} from '@astryxdesign/core/Rating';

const meta: Meta<typeof Rating> = {
  title: 'Core/Rating',
  component: Rating,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Accessible label (required)',
    },
    isLabelHidden: {
      control: 'boolean',
      description: 'Visually hide the label (still accessible)',
    },
    value: {
      control: 'number',
      description: 'Controlled value',
    },
    max: {
      control: 'number',
      description: 'Number of icons',
    },
    hasHalfIcons: {
      control: 'boolean',
      description: 'Allow half-icon increments when interactive',
    },
    isReadOnly: {
      control: 'boolean',
      description: 'Read-only display without interaction',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    isClearable: {
      control: 'boolean',
      description: 'Selecting the current value again clears to 0',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Icon size',
    },
    color: {
      control: 'select',
      options: ['warning', 'accent', 'neutral'],
      description: 'Color of the filled icons',
    },
    hasValueLabel: {
      control: 'boolean',
      description: 'Show the current value as text next to the icons',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Rating>;

export const Default: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? 3);
    const {value: _value, onChange: _onChange, ...restArgs} = args;
    return <Rating {...restArgs} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Rate this article',
  },
};

export const HalfStars: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? 2.5);
    const {value: _value, onChange: _onChange, ...restArgs} = args;
    return <Rating {...restArgs} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Rate with half stars',
    hasHalfIcons: true,
    hasValueLabel: true,
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Average score',
    value: 4.3,
    isReadOnly: true,
    hasHalfIcons: true,
    hasValueLabel: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <Rating label="Small" defaultValue={3} size="sm" />
      <Rating label="Medium" defaultValue={3} size="md" />
      <Rating label="Large" defaultValue={3} size="lg" />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <Rating label="Warning" defaultValue={4} color="warning" />
      <Rating label="Accent" defaultValue={4} color="accent" />
      <Rating label="Neutral" defaultValue={4} color="neutral" />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    label: 'Rating unavailable',
    value: 3,
    isDisabled: true,
  },
};

export const WithHiddenLabel: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? 3);
    const {value: _value, onChange: _onChange, ...restArgs} = args;
    return <Rating {...restArgs} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Rate this item',
    isLabelHidden: true,
  },
};
