import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSDateInput} from '@xds/core/DateInput';
import type {ISODateString} from '@xds/core/Calendar';
import {XDSLayout, XDSLayoutContent} from '@xds/core/Layout';

const meta: Meta<typeof XDSDateInput> = {
  title: 'Form/XDSDateInput',
  component: XDSDateInput,
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
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the input',
    },
    numberOfMonths: {
      control: 'radio',
      options: [1, 2],
      description: 'Number of months to display in calendar',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSDateInput>;

export const Default: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <XDSDateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Date',
    placeholder: 'Select a date',
  },
};

export const WithValue: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(
      '2026-01-25' as ISODateString,
    );
    return <XDSDateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Event date',
  },
};

export const WithDescription: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <XDSDateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Birthday',
    description: 'Enter your date of birth',
    placeholder: 'Select your birthday',
  },
};

export const WithHiddenLabel: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <XDSDateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Date',
    isLabelHidden: true,
    placeholder: 'Select a date',
  },
};

export const Optional: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <XDSDateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Preferred date',
    isOptional: true,
    placeholder: 'Select a date (optional)',
  },
};

export const Required: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <XDSDateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Start date',
    isRequired: true,
    placeholder: 'Select a start date',
  },
};

export const Disabled: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(
      '2026-01-25' as ISODateString,
    );
    return <XDSDateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Locked date',
    isDisabled: true,
  },
};

export const SmallSize: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <XDSDateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Date',
    size: 'sm',
    placeholder: 'Select a date',
  },
};

export const WithMinMax: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <XDSDateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Booking date',
    min: '2026-01-15' as ISODateString,
    max: '2026-02-15' as ISODateString,
    description: 'Available dates: Jan 15 - Feb 15, 2026',
    placeholder: 'Select a booking date',
  },
};

export const WithMaxDateInLayout: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return (
      <XDSLayout
        height="auto"
        content={
          <XDSLayoutContent>
            <XDSDateInput {...args} value={value} onChange={setValue} />
          </XDSLayoutContent>
        }
      />
    );
  },
  args: {
    label: 'End date',
    max: new Date().toISOString().slice(0, 10) as ISODateString,
    description:
      'Max is today — open the calendar to verify the label does not turn grey when nav buttons are disabled',
    placeholder: 'Select an end date',
  },
};

export const TwoMonthCalendar: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(undefined);
    return <XDSDateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Travel date',
    numberOfMonths: 2,
    placeholder: 'Select a travel date',
  },
};

export const WithErrorStatus: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(
      '2026-01-25' as ISODateString,
    );
    return <XDSDateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Event date',
    status: {
      type: 'error',
      message: 'This date is not available',
    },
  },
};

export const WithWarningStatus: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(
      '2026-01-01' as ISODateString,
    );
    return <XDSDateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Meeting date',
    status: {
      type: 'warning',
      message: 'This is a holiday - are you sure?',
    },
  },
};

export const WithSuccessStatus: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateString | undefined>(
      '2026-02-10' as ISODateString,
    );
    return <XDSDateInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Appointment date',
    status: {
      type: 'success',
      message: 'Date is available',
    },
  },
};

export const AllVariations: Story = {
  render: () => {
    const [value1, setValue1] = useState<ISODateString | undefined>(undefined);
    const [value2, setValue2] = useState<ISODateString | undefined>(
      '2026-01-25' as ISODateString,
    );
    const [value3, setValue3] = useState<ISODateString | undefined>(undefined);
    const [value4, setValue4] = useState<ISODateString | undefined>(undefined);
    const [value5, setValue5] = useState<ISODateString | undefined>(undefined);
    const [value6, setValue6] = useState<ISODateString | undefined>(
      '2026-03-10' as ISODateString,
    );
    const [value7, setValue7] = useState<ISODateString | undefined>(
      '2026-01-25' as ISODateString,
    );

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '300px',
        }}>
        <XDSDateInput
          label="Default"
          value={value1}
          onChange={setValue1}
          placeholder="Select a date"
        />
        <XDSDateInput label="With value" value={value2} onChange={setValue2} />
        <XDSDateInput
          label="With description"
          description="Pick your preferred date"
          value={value3}
          onChange={setValue3}
          placeholder="Select a date"
        />
        <XDSDateInput
          label="Optional field"
          isOptional
          value={value4}
          onChange={setValue4}
          placeholder="Select a date (optional)"
        />
        <XDSDateInput
          label="Required field"
          isRequired
          value={value5}
          onChange={setValue5}
          placeholder="Select a date"
        />
        <XDSDateInput
          label="Disabled"
          isDisabled
          value={value6}
          onChange={setValue6}
        />
        <XDSDateInput
          label="With error"
          value={value7}
          onChange={setValue7}
          status={{
            type: 'error',
            message: 'Invalid date selection',
          }}
        />
      </div>
    );
  },
};

export const Clearable: Story = {
  render: args => {
    const [value, setValue] = useState<string | undefined>('2026-04-06');
    return (
      <XDSDateInput {...args} value={value} onChange={setValue} hasClear />
    );
  },
  args: {
    label: 'Event date',
    placeholder: 'Select a date',
  },
};

export const ClearableWithStatus: Story = {
  render: args => {
    const [value, setValue] = useState<string | undefined>('2026-04-06');
    return (
      <XDSDateInput {...args} value={value} onChange={setValue} hasClear />
    );
  },
  args: {
    label: 'Deadline',
    status: {type: 'error', message: 'Date is in the past'},
  },
};
