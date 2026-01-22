import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSTextArea} from '@xds/core/TextArea';

const meta: Meta<typeof XDSTextArea> = {
  title: 'Core/XDSTextArea',
  component: XDSTextArea,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text (required)',
    },
    isLabelHidden: {
      control: 'boolean',
      description:
        'Visually hide the label (still accessible to screen readers)',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    description: {
      control: 'text',
      description: 'Description text displayed between the label and textarea',
    },
    value: {
      control: 'text',
      description: 'Current textarea value (required)',
    },
    isOptional: {
      control: 'boolean',
      description:
        'Whether the field is optional (mutually exclusive with isRequired)',
    },
    isRequired: {
      control: 'boolean',
      description:
        'Whether the field is required (mutually exclusive with isOptional)',
    },
    rows: {
      control: 'number',
      description: 'Number of visible text rows (default: 3)',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Whether the textarea is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSTextArea>;

export const Default: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <XDSTextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Description',
    placeholder: 'Enter a description...',
  },
};

export const WithDescription: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <XDSTextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Bio',
    description: 'Tell us about yourself in a few sentences.',
    placeholder: 'Write your bio here...',
  },
};

export const WithHiddenLabel: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <XDSTextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Comments',
    isLabelHidden: true,
    placeholder: 'Add a comment...',
  },
};

export const WithValue: Story = {
  render: args => {
    const [value, setValue] = useState(
      args.value ??
        'This is a pre-filled textarea with some content that demonstrates how the component handles existing text.',
    );
    return <XDSTextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Notes',
    value:
      'This is a pre-filled textarea with some content that demonstrates how the component handles existing text.',
  },
};

export const CustomRows: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <XDSTextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Message',
    rows: 6,
    placeholder: 'Write a longer message...',
  },
};

export const AllVariations: Story = {
  render: () => {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('');
    const [value3, setValue3] = useState('Pre-filled content in the textarea.');
    const [value4, setValue4] = useState('');
    const [value5, setValue5] = useState('');
    const [value6, setValue6] = useState('');
    const [value7, setValue7] = useState('');
    const [value8, setValue8] = useState('');
    const [value9, setValue9] = useState('This field is disabled');
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '400px',
        }}>
        <XDSTextArea
          label="Visible label"
          value={value1}
          onChange={setValue1}
          placeholder="Enter text..."
        />
        <XDSTextArea
          label="With description"
          description="Helpful description text"
          value={value4}
          onChange={setValue4}
          placeholder="Enter text..."
        />
        <XDSTextArea
          label="Hidden label"
          isLabelHidden
          value={value2}
          onChange={setValue2}
          placeholder="Hidden label textarea"
        />
        <XDSTextArea label="With value" value={value3} onChange={setValue3} />
        <XDSTextArea
          label="Optional field"
          isOptional
          value={value5}
          onChange={setValue5}
          placeholder="Optional..."
        />
        <XDSTextArea
          label="Required field"
          isRequired
          value={value6}
          onChange={setValue6}
          placeholder="Required..."
        />
        <XDSTextArea
          label="Description with optional"
          description="Additional notes"
          isOptional
          value={value7}
          onChange={setValue7}
          placeholder="Notes..."
        />
        <XDSTextArea
          label="Custom rows (6)"
          rows={6}
          value={value8}
          onChange={setValue8}
          placeholder="Larger textarea..."
        />
        <XDSTextArea
          label="Disabled field"
          isDisabled
          value={value9}
          onChange={setValue9}
        />
      </div>
    );
  },
};

export const OptionalField: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <XDSTextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Additional Notes',
    isOptional: true,
    placeholder: 'Any additional notes...',
  },
};

export const RequiredField: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <XDSTextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Feedback',
    isRequired: true,
    placeholder: 'Please provide your feedback...',
  },
};

export const DescriptionWithOptional: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <XDSTextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Comments',
    description: 'Share any additional thoughts or comments',
    isOptional: true,
    placeholder: 'Your comments here...',
  },
};

export const Disabled: Story = {
  render: args => {
    const [value, setValue] = useState(
      args.value ?? 'This textarea is disabled and cannot be edited.',
    );
    return <XDSTextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Disabled Field',
    isDisabled: true,
    value: 'This textarea is disabled and cannot be edited.',
  },
};
