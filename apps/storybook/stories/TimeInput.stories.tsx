import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSTimeInput} from '@xds/core/TimeInput';
import type {ISOTimeString} from '@xds/core';

const meta: Meta<typeof XDSTimeInput> = {
  title: 'Core/XDSTimeInput',
  component: XDSTimeInput,
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
    increment: {
      control: 'number',
      description: 'Minutes to increment/decrement with arrow keys',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSTimeInput>;

export const Default: Story = {
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>(undefined);
    return <XDSTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Time',
    placeholder: 'Select a time',
  },
};

export const WithValue: Story = {
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>(
      '14:30' as ISOTimeString,
    );
    return <XDSTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Meeting time',
  },
};

export const TwentyFourHourFormat: Story = {
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>(
      '14:30' as ISOTimeString,
    );
    return <XDSTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Time (24h)',
    hourFormat: '24h',
  },
};

export const WithSeconds: Story = {
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>(
      '14:30:45' as ISOTimeString,
    );
    return <XDSTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Precise time',
    hasSeconds: true,
  },
};

export const WithClearButton: Story = {
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>(
      '09:00' as ISOTimeString,
    );
    return <XDSTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Start time',
    hasClear: true,
  },
};

export const WithDescription: Story = {
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>(undefined);
    return <XDSTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Alarm time',
    description: 'When should we wake you up?',
    placeholder: 'Set alarm time',
  },
};

export const WithMinMax: Story = {
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>(undefined);
    return <XDSTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Appointment time',
    min: '09:00' as ISOTimeString,
    max: '17:00' as ISOTimeString,
    description: 'Business hours: 9 AM - 5 PM',
    placeholder: 'Select appointment time',
  },
};

export const WithIncrement: Story = {
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>(
      '09:00' as ISOTimeString,
    );
    return <XDSTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Time slot',
    increment: 15,
    description: 'Use arrow keys to change by 15 minutes',
  },
};

export const Optional: Story = {
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>(undefined);
    return <XDSTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Preferred time',
    isOptional: true,
    placeholder: 'Select a time (optional)',
  },
};

export const Required: Story = {
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>(undefined);
    return <XDSTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Start time',
    isRequired: true,
    placeholder: 'Select a start time',
  },
};

export const Disabled: Story = {
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>(
      '10:00' as ISOTimeString,
    );
    return <XDSTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Locked time',
    isDisabled: true,
  },
};

export const SmallSize: Story = {
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>(undefined);
    return <XDSTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Time',
    size: 'sm',
    placeholder: 'Select a time',
  },
};

export const WithErrorStatus: Story = {
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>(
      '22:00' as ISOTimeString,
    );
    return <XDSTimeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Event time',
    status: {
      type: 'error',
      message: 'Time must be during business hours',
    },
  },
};

export const WithWarningStatus: Story = {
  render: args => {
    const [value, setValue] = useState<ISOTimeString | undefined>(
      '07:00' as ISOTimeString,
    );
    return <XDSTimeInput {...args} value={value} onChange={setValue} />;
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
    const [value, setValue] = useState<ISOTimeString | undefined>(
      '10:00' as ISOTimeString,
    );
    return <XDSTimeInput {...args} value={value} onChange={setValue} />;
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
    const [value1, setValue1] = useState<ISOTimeString | undefined>(undefined);
    const [value2, setValue2] = useState<ISOTimeString | undefined>(
      '14:30' as ISOTimeString,
    );
    const [value3, setValue3] = useState<ISOTimeString | undefined>(
      '09:15:30' as ISOTimeString,
    );
    const [value4, setValue4] = useState<ISOTimeString | undefined>(undefined);
    const [value5, setValue5] = useState<ISOTimeString | undefined>(undefined);
    const [value6, setValue6] = useState<ISOTimeString | undefined>(
      '10:00' as ISOTimeString,
    );
    const [value7, setValue7] = useState<ISOTimeString | undefined>(
      '22:00' as ISOTimeString,
    );

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '300px',
        }}>
        <XDSTimeInput
          label="Default (12h)"
          value={value1}
          onChange={setValue1}
          placeholder="Select a time"
        />
        <XDSTimeInput
          label="24-hour format"
          value={value2}
          onChange={setValue2}
          hourFormat="24h"
        />
        <XDSTimeInput
          label="With seconds"
          value={value3}
          onChange={setValue3}
          hasSeconds
        />
        <XDSTimeInput
          label="With clear button"
          value={value4}
          onChange={setValue4}
          hasClear
          placeholder="Select a time"
        />
        <XDSTimeInput
          label="With description"
          description="Pick your preferred time"
          value={value5}
          onChange={setValue5}
          placeholder="Select a time"
        />
        <XDSTimeInput
          label="Disabled"
          isDisabled
          value={value6}
          onChange={setValue6}
        />
        <XDSTimeInput
          label="With error"
          value={value7}
          onChange={setValue7}
          status={{
            type: 'error',
            message: 'Invalid time selection',
          }}
        />
      </div>
    );
  },
};
