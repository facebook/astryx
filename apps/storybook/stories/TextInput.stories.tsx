import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { XDSTextInput } from '@xds/core/TextInput';

const meta: Meta<typeof XDSTextInput> = {
  title: 'Core/XDSTextInput',
  component: XDSTextInput,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text (required)',
    },
    isLabelHidden: {
      control: 'boolean',
      description: 'Visually hide the label (still accessible to screen readers)',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    value: {
      control: 'text',
      description: 'Current input value (required)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSTextInput>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value ?? '');
    return <XDSTextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Name',
    placeholder: 'Enter your name',
  },
};

export const WithHiddenLabel: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value ?? '');
    return <XDSTextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Search',
    isLabelHidden: true,
    placeholder: 'Search...',
  },
};

export const WithValue: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value ?? 'Hello, world!');
    return <XDSTextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Greeting',
    value: 'Hello, world!',
  },
};

export const AllVariations: Story = {
  render: () => {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('');
    const [value3, setValue3] = useState('Pre-filled value');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '300px' }}>
        <XDSTextInput label="Visible label" value={value1} onChange={setValue1} placeholder="Enter text..." />
        <XDSTextInput label="Hidden label" isLabelHidden value={value2} onChange={setValue2} placeholder="Hidden label input" />
        <XDSTextInput label="With value" value={value3} onChange={setValue3} />
      </div>
    );
  },
};
