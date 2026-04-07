import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSNumberInput} from '@xds/core/NumberInput';
import {HashtagIcon, CurrencyDollarIcon} from '@heroicons/react/24/outline';

const meta: Meta<typeof XDSNumberInput> = {
  title: 'Form/XDSNumberInput',
  component: XDSNumberInput,
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
      description: 'Description text displayed between the label and input',
    },
    value: {
      control: 'number',
      description: 'Current input value (number, null, or undefined)',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
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
    isDisabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    status: {
      control: 'object',
      description:
        'Status indicator with type (warning/error/success) and optional message',
    },
    tooltip: {
      control: 'text',
      description:
        'Tooltip text to display in an info icon at the end of the label',
    },
    min: {
      control: 'number',
      description: 'Minimum value allowed',
    },
    max: {
      control: 'number',
      description: 'Maximum value allowed',
    },
    step: {
      control: 'number',
      description: 'Step increment for the input',
    },
    units: {
      control: 'text',
      description:
        'Units text to display at the end of the input (e.g., "%" or "GB")',
    },
    isIntegerOnly: {
      control: 'boolean',
      description: 'Only allow integer values (no floating point)',
    },
    autoComplete: {
      control: 'text',
      description: 'HTML autocomplete attribute',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSNumberInput>;

export const Default: Story = {
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? null);
    return <XDSNumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Quantity',
    placeholder: 'Enter quantity',
  },
};

export const WithDescription: Story = {
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? null);
    return <XDSNumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Age',
    description: 'Enter your age in years',
    placeholder: 'Enter your age',
  },
};

export const WithMinMax: Story = {
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? null);
    return <XDSNumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Rating',
    placeholder: '1-5',
    min: 1,
    max: 5,
    description: 'Rate from 1 to 5',
  },
};

export const WithStep: Story = {
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? null);
    return <XDSNumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Price',
    placeholder: '0.00',
    min: 0,
    step: 0.01,
    startIcon: CurrencyDollarIcon,
  },
};

export const WithUnits: Story = {
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? 50);
    return <XDSNumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Discount',
    placeholder: 'Enter discount',
    min: 0,
    max: 100,
    units: '%',
  },
};

export const WithUnitsGB: Story = {
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? 128);
    return <XDSNumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Storage',
    placeholder: 'Enter storage',
    min: 0,
    units: 'GB',
  },
};

export const IntegerOnly: Story = {
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? null);
    return <XDSNumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Count',
    placeholder: 'Enter count',
    isIntegerOnly: true,
    description: 'Only accepts whole numbers',
  },
};

export const WithValue: Story = {
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? 42);
    return <XDSNumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Quantity',
    value: 42,
  },
};

export const AllVariations: Story = {
  render: () => {
    const [value1, setValue1] = useState<number | null>(null);
    const [value2, setValue2] = useState<number | null>(null);
    const [value3, setValue3] = useState<number | null>(100);
    const [value4, setValue4] = useState<number | null>(null);
    const [value5, setValue5] = useState<number | null>(null);
    const [value6, setValue6] = useState<number | null>(null);
    const [value7, setValue7] = useState<number | null>(null);
    const [value8, setValue8] = useState<number | null>(50);
    const [value9, setValue9] = useState<number | null>(75);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '300px',
        }}>
        <XDSNumberInput
          label="Visible label"
          value={value1}
          onChange={setValue1}
          placeholder="Enter number..."
        />
        <XDSNumberInput
          label="With description"
          description="Helpful description text"
          value={value4}
          onChange={setValue4}
          placeholder="Enter number..."
        />
        <XDSNumberInput
          label="Hidden label"
          isLabelHidden
          value={value2}
          onChange={setValue2}
          placeholder="Hidden label input"
        />
        <XDSNumberInput
          label="With value"
          value={value3}
          onChange={setValue3}
        />
        <XDSNumberInput
          label="Optional field"
          isOptional
          value={value5}
          onChange={setValue5}
          placeholder="Optional..."
        />
        <XDSNumberInput
          label="Required field"
          isRequired
          value={value6}
          onChange={setValue6}
          placeholder="Required..."
        />
        <XDSNumberInput
          label="With min/max"
          description="Enter a value between 1 and 10"
          min={1}
          max={10}
          value={value7}
          onChange={setValue7}
          placeholder="1-10"
        />
        <XDSNumberInput
          label="Disabled field"
          isDisabled
          value={value8}
          onChange={setValue8}
        />
        <XDSNumberInput
          label="With units"
          value={value9}
          onChange={setValue9}
          units="%"
        />
      </div>
    );
  },
};

export const OptionalField: Story = {
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? null);
    return <XDSNumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Phone Extension',
    isOptional: true,
    placeholder: 'Enter extension',
  },
};

export const RequiredField: Story = {
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? null);
    return <XDSNumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Quantity',
    isRequired: true,
    placeholder: 'Enter quantity',
  },
};

export const Disabled: Story = {
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? 100);
    return <XDSNumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Locked Amount',
    isDisabled: true,
    value: 100,
  },
};

export const WithStartIcon: Story = {
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? null);
    return <XDSNumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Count',
    placeholder: 'Enter count...',
    startIcon: HashtagIcon,
  },
};

export const SizeVariants: Story = {
  render: () => {
    const [sm, setSm] = useState<number | null>(null);
    const [md, setMd] = useState<number | null>(null);
    const [lg, setLg] = useState<number | null>(null);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '300px',
        }}>
        <XDSNumberInput
          label="Small (28px)"
          value={sm}
          onChange={setSm}
          placeholder="Small size"
          size="sm"
        />
        <XDSNumberInput
          label="Medium (32px)"
          value={md}
          onChange={setMd}
          placeholder="Medium size (default)"
          size="md"
        />
        <XDSNumberInput
          label="Large (36px)"
          value={lg}
          onChange={setLg}
          placeholder="Large size"
          size="lg"
        />
      </div>
    );
  },
};

export const ErrorStatus: Story = {
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? -5);
    return <XDSNumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Age',
    placeholder: 'Enter your age',
    min: 0,
    status: {type: 'error', message: 'Age must be a positive number'},
  },
};

export const WarningStatus: Story = {
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? 150);
    return <XDSNumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Age',
    placeholder: 'Enter your age',
    status: {type: 'warning', message: 'This value seems unusually high'},
  },
};

export const SuccessStatus: Story = {
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? 25);
    return <XDSNumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Age',
    placeholder: 'Enter your age',
    status: {type: 'success', message: 'Valid age'},
  },
};

export const StatusVariations: Story = {
  render: () => {
    const [error, setError] = useState<number | null>(-5);
    const [warning, setWarning] = useState<number | null>(150);
    const [success, setSuccess] = useState<number | null>(25);
    const [errorNoMsg, setErrorNoMsg] = useState<number | null>(0);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '300px',
        }}>
        <XDSNumberInput
          label="Error with message"
          value={error}
          onChange={setError}
          status={{type: 'error', message: 'Must be positive'}}
        />
        <XDSNumberInput
          label="Warning with message"
          value={warning}
          onChange={setWarning}
          status={{type: 'warning', message: 'Value seems high'}}
        />
        <XDSNumberInput
          label="Success with message"
          value={success}
          onChange={setSuccess}
          status={{type: 'success', message: 'Looks good'}}
        />
        <XDSNumberInput
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
    const [value, setValue] = useState<number | null>(args.value ?? null);
    return <XDSNumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'API Rate Limit',
    placeholder: 'Enter rate limit',
    tooltip: 'Maximum number of API requests per minute',
  },
};

export const DecimalInput: Story = {
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? null);
    return <XDSNumberInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Price',
    placeholder: '0.00',
    min: 0,
    step: 0.01,
    startIcon: CurrencyDollarIcon,
    description: 'Enter amount in dollars',
  },
};

export const WithEventHandlers: Story = {
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? null);
    const [events, setEvents] = useState<string[]>([]);

    const addEvent = (event: string) => {
      setEvents(prev => [...prev.slice(-4), event]);
    };

    return (
      <div style={{maxWidth: '300px'}}>
        <XDSNumberInput
          {...args}
          value={value}
          onChange={v => {
            setValue(v);
            addEvent(`onChange: ${v}`);
          }}
          onFocus={() => addEvent('onFocus')}
          onBlur={() => addEvent('onBlur')}
          onEnter={() => addEvent('onEnter')}
        />
        <div style={{marginTop: '16px', fontSize: '12px', color: '#666'}}>
          <strong>Events:</strong>
          <ul style={{margin: '4px 0', paddingLeft: '20px'}}>
            {events.map((event, i) => (
              <li key={i}>{event}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  },
  args: {
    label: 'Interactive',
    placeholder: 'Type and press Enter',
    description: 'Events are logged below',
  },
};

export const Clearable: Story = {
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? 42);
    return (
      <XDSNumberInput {...args} value={value} onChange={setValue} hasClear />
    );
  },
  args: {
    label: 'Quantity',
    placeholder: 'Enter a number',
  },
};

export const ClearableWithUnits: Story = {
  render: args => {
    const [value, setValue] = useState<number | null>(args.value ?? 75);
    return (
      <XDSNumberInput {...args} value={value} onChange={setValue} hasClear />
    );
  },
  args: {
    label: 'Progress',
    units: '%',
    min: 0,
    max: 100,
  },
};
