import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSDateTimePicker} from '@xds/core/DateTimePicker';
import type {ISODateTimeString} from '@xds/core/DateTimePicker';

const meta: Meta<typeof XDSDateTimePicker> = {
  title: 'Core/Inputs/DateTimePicker',
  component: XDSDateTimePicker,
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
      options: ['sm', 'md'],
      description: 'Size of the input',
    },
    hourFormat: {
      control: 'radio',
      options: ['12h', '24h'],
      description: 'Hour format for display',
    },
    hasSeconds: {
      control: 'boolean',
      description: 'Whether to include seconds in the time',
    },
    hasClear: {
      control: 'boolean',
      description: 'Whether to show a clear button',
    },
    numberOfMonths: {
      control: 'radio',
      options: [1, 2],
      description: 'Number of months to display in calendar',
    },
    timeIncrement: {
      control: 'number',
      description: 'Minutes to increment/decrement with arrow keys',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSDateTimePicker>;

export const Default: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      undefined,
    );
    return <XDSDateTimePicker {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Meeting time',
    placeholder: 'Select a date',
  },
};

export const WithValue: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      '2026-03-15T14:30' as ISODateTimeString,
    );
    return <XDSDateTimePicker {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Event time',
  },
};

export const TwentyFourHourFormat: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      '2026-03-15T14:30' as ISODateTimeString,
    );
    return <XDSDateTimePicker {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Appointment',
    hourFormat: '24h',
  },
};

export const WithSeconds: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      '2026-03-15T14:30:45' as ISODateTimeString,
    );
    return <XDSDateTimePicker {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Log timestamp',
    hasSeconds: true,
  },
};

export const WithDescription: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      undefined,
    );
    return <XDSDateTimePicker {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Deadline',
    description: 'When is this task due?',
    placeholder: 'Select deadline',
  },
};

export const WithClearButton: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      '2026-03-15T09:00' as ISODateTimeString,
    );
    return <XDSDateTimePicker {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Start time',
    hasClear: true,
  },
};

export const WithMinMax: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      undefined,
    );
    return <XDSDateTimePicker {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Appointment',
    min: '2026-03-15T09:00' as ISODateTimeString,
    max: '2026-03-15T17:00' as ISODateTimeString,
    description: 'Available: Mar 15, 9 AM - 5 PM',
  },
};

export const WithTimeIncrement: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      '2026-03-15T09:00' as ISODateTimeString,
    );
    return <XDSDateTimePicker {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Time slot',
    timeIncrement: 15,
    description: 'Use arrow keys to change by 15 minutes',
  },
};

export const Optional: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      undefined,
    );
    return <XDSDateTimePicker {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Preferred time',
    isOptional: true,
    placeholder: 'Select a date (optional)',
  },
};

export const Required: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      undefined,
    );
    return <XDSDateTimePicker {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Start time',
    isRequired: true,
  },
};

export const Disabled: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      '2026-03-15T10:00' as ISODateTimeString,
    );
    return <XDSDateTimePicker {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Locked time',
    isDisabled: true,
  },
};

export const SmallSize: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      undefined,
    );
    return <XDSDateTimePicker {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Time',
    size: 'sm',
  },
};

export const TwoMonthCalendar: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      undefined,
    );
    return <XDSDateTimePicker {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Travel departure',
    numberOfMonths: 2,
  },
};

export const WithErrorStatus: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      '2026-03-15T14:30' as ISODateTimeString,
    );
    return <XDSDateTimePicker {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Event time',
    status: {
      type: 'error',
      message: 'This time slot is not available',
    },
  },
};

export const WithWarningStatus: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      '2026-03-15T07:00' as ISODateTimeString,
    );
    return <XDSDateTimePicker {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Meeting time',
    status: {
      type: 'warning',
      message: 'Early morning meeting - are you sure?',
    },
  },
};

export const WithSuccessStatus: Story = {
  render: args => {
    const [value, setValue] = useState<ISODateTimeString | undefined>(
      '2026-03-15T10:00' as ISODateTimeString,
    );
    return <XDSDateTimePicker {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Scheduled time',
    status: {
      type: 'success',
      message: 'Time slot is available',
    },
  },
};

export const AllVariations: Story = {
  render: () => {
    const [value1, setValue1] = useState<ISODateTimeString | undefined>(
      undefined,
    );
    const [value2, setValue2] = useState<ISODateTimeString | undefined>(
      '2026-03-15T14:30' as ISODateTimeString,
    );
    const [value3, setValue3] = useState<ISODateTimeString | undefined>(
      '2026-03-15T14:30' as ISODateTimeString,
    );
    const [value4, setValue4] = useState<ISODateTimeString | undefined>(
      undefined,
    );
    const [value5, setValue5] = useState<ISODateTimeString | undefined>(
      '2026-03-15T10:00' as ISODateTimeString,
    );
    const [value6, setValue6] = useState<ISODateTimeString | undefined>(
      '2026-03-15T22:00' as ISODateTimeString,
    );

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '460px',
        }}>
        <XDSDateTimePicker
          label="Default"
          value={value1}
          onChange={setValue1}
          placeholder="Select a date"
        />
        <XDSDateTimePicker
          label="With value (12h)"
          value={value2}
          onChange={setValue2}
        />
        <XDSDateTimePicker
          label="24-hour format"
          value={value3}
          onChange={setValue3}
          hourFormat="24h"
        />
        <XDSDateTimePicker
          label="With description"
          description="Pick your preferred datetime"
          value={value4}
          onChange={setValue4}
        />
        <XDSDateTimePicker
          label="Disabled"
          isDisabled
          value={value5}
          onChange={setValue5}
        />
        <XDSDateTimePicker
          label="With error"
          value={value6}
          onChange={setValue6}
          status={{
            type: 'error',
            message: 'Invalid datetime selection',
          }}
        />
      </div>
    );
  },
};
