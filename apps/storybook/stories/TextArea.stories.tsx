import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSTextArea, type XDSTextAreaStatus} from '@xds/core/TextArea';
import {
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';

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
    status: {
      control: 'object',
      description:
        'Status indicator with type (warning/error/success) and optional message',
    },
    labelTooltip: {
      control: 'text',
      description:
        'Tooltip text to display in an info icon at the end of the label',
    },
    hasSpellCheck: {
      control: 'boolean',
      description: 'Whether to enable browser spell checking (default: true)',
    },
    maxLength: {
      control: 'number',
      description:
        'Maximum number of characters allowed. Displays a counter when set.',
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
        'This is a pre-filled textarea with some content that demonstrates how the component handles existing text.'
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
      args.value ?? 'This textarea is disabled and cannot be edited.'
    );
    return <XDSTextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Disabled Field',
    isDisabled: true,
    value: 'This textarea is disabled and cannot be edited.',
  },
};

export const WithStartIcon: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <XDSTextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Notes',
    placeholder: 'Enter your notes...',
    startIcon: DocumentTextIcon,
  },
};

export const StartIconVariations: Story = {
  render: () => {
    const [notes, setNotes] = useState('');
    const [message, setMessage] = useState('');
    const [draft, setDraft] = useState('');
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '400px',
        }}>
        <XDSTextArea
          label="Notes"
          value={notes}
          onChange={setNotes}
          placeholder="Enter your notes..."
          startIcon={DocumentTextIcon}
        />
        <XDSTextArea
          label="Message"
          value={message}
          onChange={setMessage}
          placeholder="Type your message..."
          startIcon={ChatBubbleLeftIcon}
        />
        <XDSTextArea
          label="Draft"
          value={draft}
          onChange={setDraft}
          placeholder="Write your draft..."
          startIcon={PencilSquareIcon}
        />
      </div>
    );
  },
};

export const ErrorStatus: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? 'Too short');
    return <XDSTextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Description',
    placeholder: 'Enter a description...',
    status: {
      type: 'error',
      message: 'Description must be at least 50 characters',
    },
  },
};

export const WarningStatus: Story = {
  render: args => {
    const [value, setValue] = useState(
      args.value ?? 'This content may contain issues'
    );
    return <XDSTextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Content',
    placeholder: 'Enter content...',
    status: {
      type: 'warning',
      message: 'Content may need review before publishing',
    },
  },
};

export const SuccessStatus: Story = {
  render: args => {
    const [value, setValue] = useState(
      args.value ?? 'This is a valid description that meets all requirements.'
    );
    return <XDSTextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Description',
    placeholder: 'Enter a description...',
    status: {type: 'success', message: 'Description looks good!'},
  },
};

export const StatusWithoutMessage: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? 'Invalid content');
    return <XDSTextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Field',
    placeholder: 'Enter value',
    status: {type: 'error'},
  },
};

export const StatusVariations: Story = {
  render: () => {
    const [error, setError] = useState('Too short');
    const [warning, setWarning] = useState('This may need review');
    const [success, setSuccess] = useState(
      'This description meets all the requirements perfectly.'
    );
    const [errorNoMsg, setErrorNoMsg] = useState('Invalid');
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '400px',
        }}>
        <XDSTextArea
          label="Error with message"
          value={error}
          onChange={setError}
          status={{type: 'error', message: 'Must be at least 50 characters'}}
        />
        <XDSTextArea
          label="Warning with message"
          value={warning}
          onChange={setWarning}
          status={{type: 'warning', message: 'Content may need review'}}
        />
        <XDSTextArea
          label="Success with message"
          value={success}
          onChange={setSuccess}
          status={{type: 'success', message: 'Description is valid'}}
        />
        <XDSTextArea
          label="Error without message"
          value={errorNoMsg}
          onChange={setErrorNoMsg}
          status={{type: 'error'}}
        />
      </div>
    );
  },
};

export const WithTooltip: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <XDSTextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'API Documentation',
    placeholder: 'Describe your API endpoint...',
    labelTooltip:
      'Provide a detailed description of what this API endpoint does, including expected inputs and outputs.',
  },
};

export const TooltipWithOptional: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <XDSTextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Additional Notes',
    placeholder: 'Any additional information...',
    labelTooltip:
      'Include any extra details that might be helpful for reviewers.',
    isOptional: true,
  },
};

export const CombinedFeatures: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div style={{maxWidth: '400px'}}>
        <XDSTextArea
          label="Detailed Description"
          description="Provide a comprehensive description of your project"
          value={value}
          onChange={setValue}
          placeholder="Enter description..."
          startIcon={DocumentTextIcon}
          labelTooltip="This description will be visible to all team members"
          isRequired
          status={
            value.length > 0 && value.length < 20
              ? {type: 'warning', message: 'Consider adding more detail'}
              : value.length >= 20
              ? {type: 'success', message: 'Description looks good!'}
              : undefined
          }
        />
      </div>
    );
  },
};

export const WithMaxLength: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    return <XDSTextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Bio',
    placeholder: 'Tell us about yourself...',
    maxLength: 150,
  },
};

export const MaxLengthWithValue: Story = {
  render: args => {
    const [value, setValue] = useState(
      args.value ??
        'This is a pre-filled bio that demonstrates the character counter.'
    );
    return <XDSTextArea {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Bio',
    maxLength: 100,
  },
};

export const MaxLengthVariations: Story = {
  render: () => {
    const [short, setShort] = useState('');
    const [medium, setMedium] = useState('Some text here');
    const [long, setLong] = useState(
      'This is a longer text that approaches the maximum length limit.'
    );
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '400px',
        }}>
        <XDSTextArea
          label="Short limit"
          value={short}
          onChange={setShort}
          placeholder="Max 50 characters"
          maxLength={50}
        />
        <XDSTextArea
          label="Medium limit"
          value={medium}
          onChange={setMedium}
          placeholder="Max 100 characters"
          maxLength={100}
        />
        <XDSTextArea
          label="Long limit"
          value={long}
          onChange={setLong}
          placeholder="Max 200 characters"
          maxLength={200}
        />
      </div>
    );
  },
};
