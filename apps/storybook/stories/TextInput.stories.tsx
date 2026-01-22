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
    description: {
      control: 'text',
      description: 'Description text displayed between the label and input',
    },
    value: {
      control: 'text',
      description: 'Current input value (required)',
    },
    isOptional: {
      control: 'boolean',
      description: 'Whether the field is optional (mutually exclusive with isRequired)',
    },
    isRequired: {
      control: 'boolean',
      description: 'Whether the field is required (mutually exclusive with isOptional)',
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

export const WithDescription: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value ?? '');
    return <XDSTextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Email',
    description: "We'll never share your email with anyone.",
    placeholder: 'Enter your email',
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
    const [value4, setValue4] = useState('');
    const [value5, setValue5] = useState('');
    const [value6, setValue6] = useState('');
    const [value7, setValue7] = useState('');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '300px' }}>
        <XDSTextInput label="Visible label" value={value1} onChange={setValue1} placeholder="Enter text..." />
        <XDSTextInput label="With description" description="Helpful description text" value={value4} onChange={setValue4} placeholder="Enter text..." />
        <XDSTextInput label="Hidden label" isLabelHidden value={value2} onChange={setValue2} placeholder="Hidden label input" />
        <XDSTextInput label="With value" value={value3} onChange={setValue3} />
        <XDSTextInput label="Optional field" isOptional value={value5} onChange={setValue5} placeholder="Optional..." />
        <XDSTextInput label="Required field" isRequired value={value6} onChange={setValue6} placeholder="Required..." />
        <XDSTextInput label="Description with optional" description="Enter your nickname" isOptional value={value7} onChange={setValue7} placeholder="Nickname..." />
      </div>
    );
  },
};

export const OptionalField: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value ?? '');
    return <XDSTextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Nickname',
    isOptional: true,
    placeholder: 'Enter your nickname',
  },
};

export const RequiredField: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value ?? '');
    return <XDSTextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Username',
    isRequired: true,
    placeholder: 'Enter your username',
  },
};

export const DescriptionWithOptional: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value ?? '');
    return <XDSTextInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Bio',
    description: 'Tell us about yourself',
    isOptional: true,
    placeholder: 'Your bio here...',
  },
};
