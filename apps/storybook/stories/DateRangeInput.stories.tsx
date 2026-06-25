// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {DateRangeInput} from '@astryxdesign/core/DateRangeInput';
import type {DateRange} from '@astryxdesign/core/DateRangeInput';
import type {ISODateString} from '@astryxdesign/core/Calendar';

function daysAgo(n: number): ISODateString {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10) as ISODateString;
}

function today(): ISODateString {
  return new Date().toISOString().slice(0, 10) as ISODateString;
}

function startOfMonth(): ISODateString {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10) as ISODateString;
}

const defaultPresets = [
  {label: 'Last 1 day', getRange: () => ({start: daysAgo(1), end: today()})},
  {label: 'Last 3 days', getRange: () => ({start: daysAgo(3), end: today()})},
  {label: 'Last 7 days', getRange: () => ({start: daysAgo(7), end: today()})},
  {
    label: 'Last 14 days',
    getRange: () => ({start: daysAgo(14), end: today()}),
  },
  {
    label: 'Last 30 days',
    getRange: () => ({start: daysAgo(30), end: today()}),
  },
  {
    label: 'This month',
    getRange: () => ({start: startOfMonth(), end: today()}),
  },
];

const meta: Meta<typeof DateRangeInput> = {
  title: 'Core/DateRangeInput',
  component: DateRangeInput,
  tags: ['autodocs'],
  argTypes: {
    label: {control: 'text', description: 'Label text (required)'},
    isLabelHidden: {
      control: 'boolean',
      description: 'Visually hide the label',
    },
    placeholder: {control: 'text', description: 'Placeholder text'},
    description: {control: 'text', description: 'Description text'},
    isOptional: {control: 'boolean', description: 'Show optional indicator'},
    isRequired: {control: 'boolean', description: 'Mark as required'},
    isDisabled: {control: 'boolean', description: 'Disable the picker'},
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
    },
    hasClear: {control: 'boolean', description: 'Show clear button'},
    numberOfMonths: {
      control: 'radio',
      options: [1, 2],
      description: 'Calendar months',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DateRangeInput>;

export const Default: Story = {
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Date range',
  },
};

export const WithValue: Story = {
  render: args => {
    const [value, setValue] = useState<DateRange | null>({
      start: '2026-03-10' as ISODateString,
      end: '2026-03-20' as ISODateString,
    });
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Report period',
  },
};

export const WithPresets: Story = {
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Date range',
    presets: defaultPresets,
  },
};

export const WithPresetsAndValue: Story = {
  render: args => {
    const [value, setValue] = useState<DateRange | null>({
      start: daysAgo(7),
      end: today(),
    });
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Analytics period',
    presets: defaultPresets,
  },
};

export const WithDescription: Story = {
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Coverage period',
    description: 'Select the start and end dates for the report',
  },
};

export const WithMinMax: Story = {
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Booking dates',
    min: '2026-03-01' as ISODateString,
    max: '2026-06-30' as ISODateString,
    description: 'Available: Mar 1 – Jun 30, 2026',
  },
};

export const Optional: Story = {
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Filter by date',
    isOptional: true,
  },
};

export const Required: Story = {
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Coverage period',
    isRequired: true,
  },
};

export const Disabled: Story = {
  render: args => {
    const [value, setValue] = useState<DateRange | null>({
      start: '2026-03-10' as ISODateString,
      end: '2026-03-20' as ISODateString,
    });
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Locked range',
    isDisabled: true,
  },
};

export const SizeVariants: Story = {
  render: () => {
    const [sm, setSm] = useState<DateRange | null>(null);
    const [md, setMd] = useState<DateRange | null>(null);
    const [lg, setLg] = useState<DateRange | null>(null);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '340px',
        }}>
        <DateRangeInput
          label="Small (28px)"
          value={sm}
          onChange={setSm}
          size="sm"
        />
        <DateRangeInput
          label="Medium (32px)"
          value={md}
          onChange={setMd}
          size="md"
        />
        <DateRangeInput
          label="Large (36px)"
          value={lg}
          onChange={setLg}
          size="lg"
        />
      </div>
    );
  },
};

export const SingleMonth: Story = {
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Date range',
    numberOfMonths: 1,
  },
};

export const WithErrorStatus: Story = {
  render: args => {
    const [value, setValue] = useState<DateRange | null>(null);
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Date range',
    status: {type: 'error', message: 'Please select a date range'},
  },
};

export const WithWarningStatus: Story = {
  render: args => {
    const [value, setValue] = useState<DateRange | null>({
      start: '2026-03-01' as ISODateString,
      end: '2026-06-30' as ISODateString,
    });
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Date range',
    status: {type: 'warning', message: 'Range exceeds 90 days'},
  },
};

export const NoClear: Story = {
  render: args => {
    const [value, setValue] = useState<DateRange | null>({
      start: '2026-03-10' as ISODateString,
      end: '2026-03-20' as ISODateString,
    });
    return <DateRangeInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Required range',
    hasClear: false,
  },
};

export const AllVariations: Story = {
  render: () => {
    const [v1, setV1] = useState<DateRange | null>(null);
    const [v2, setV2] = useState<DateRange | null>({
      start: '2026-03-10' as ISODateString,
      end: '2026-03-20' as ISODateString,
    });
    const [v3, setV3] = useState<DateRange | null>(null);
    const [v4, setV4] = useState<DateRange | null>({
      start: '2026-03-10' as ISODateString,
      end: '2026-03-20' as ISODateString,
    });
    const [v5, setV5] = useState<DateRange | null>(null);

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '340px',
        }}>
        <DateRangeInput label="Default" value={v1} onChange={setV1} />
        <DateRangeInput label="With value" value={v2} onChange={setV2} />
        <DateRangeInput
          label="With presets"
          value={v3}
          onChange={setV3}
          presets={defaultPresets}
        />
        <DateRangeInput
          label="Disabled"
          isDisabled
          value={v4}
          onChange={setV4}
        />
        <DateRangeInput
          label="With error"
          value={v5}
          onChange={setV5}
          status={{type: 'error', message: 'Date range is required'}}
        />
      </div>
    );
  },
};
