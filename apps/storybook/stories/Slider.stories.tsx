// Copyright (c) Meta Platforms, Inc. and affiliates.

/* eslint-disable @typescript-eslint/no-explicit-any */
import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Slider} from '@astryxdesign/core/Slider';

const meta: Meta<typeof Slider> = {
  title: 'Core/Slider',
  component: Slider,
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
    isDisabled: {
      control: 'boolean',
      description: 'Whether the slider is disabled',
    },
    disabledMessage: {
      control: 'text',
      description:
        'Explains why the slider is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the thumb focusable via aria-disabled (value changes stay blocked). Use this instead of wrapping a disabled Slider in Tooltip.',
    },
    min: {
      control: 'number',
      description: 'Minimum value',
    },
    max: {
      control: 'number',
      description: 'Maximum value',
    },
    step: {
      control: 'number',
      description: 'Step increment',
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Slider orientation',
    },
    valueDisplay: {
      control: 'select',
      options: ['tooltip', 'text', 'none'],
      description: 'How the value is displayed',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  render: args => {
    const [value, setValue] = useState(50);
    return <Slider {...(args as any)} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Volume',
  },
};

export const Range: Story = {
  render: args => {
    const [value, setValue] = useState<[number, number]>([20, 80]);
    return <Slider {...(args as any)} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Price range',
  },
};

export const WithMarks: Story = {
  render: args => {
    const [value, setValue] = useState(50);
    return <Slider {...(args as any)} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Volume',
    marks: [
      {value: 0, label: '0'},
      {value: 25, label: '25'},
      {value: 50, label: '50'},
      {value: 75, label: '75'},
      {value: 100, label: '100'},
    ],
  },
};

export const CustomStep: Story = {
  render: args => {
    const [value, setValue] = useState(50);
    return (
      <Slider
        {...(args as any)}
        value={value}
        onChange={setValue}
        valueDisplay="text"
      />
    );
  },
  args: {
    label: 'Quantity',
    min: 0,
    max: 100,
    step: 10,
  },
};

export const WithFormatValue: Story = {
  render: args => {
    const [value, setValue] = useState(72);
    return (
      <Slider
        {...(args as any)}
        value={value}
        onChange={setValue}
        valueDisplay="text"
      />
    );
  },
  args: {
    label: 'Temperature',
    min: 60,
    max: 90,
    step: 1,
    formatValue: (v: number) => `${v}°F`,
  },
};

export const Disabled: Story = {
  render: args => {
    return <Slider {...(args as any)} />;
  },
  args: {
    label: 'Volume',
    value: 50,
    isDisabled: true,
  },
};

export const VerticalOrientation: Story = {
  render: args => {
    const [value, setValue] = useState(50);
    return (
      <div style={{height: 200}}>
        <Slider {...(args as any)} value={value} onChange={setValue} />
      </div>
    );
  },
  args: {
    label: 'Volume',
    orientation: 'vertical',
  },
};

export const WithStatus: Story = {
  render: () => {
    const [value1, setValue1] = useState(95);
    const [value2, setValue2] = useState(50);
    const [value3, setValue3] = useState(75);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          maxWidth: '400px',
        }}>
        <Slider
          label="CPU Usage"
          value={value1}
          onChange={setValue1}
          status={{type: 'error', message: 'CPU usage is critically high'}}
        />
        <Slider
          label="Memory"
          value={value2}
          onChange={setValue2}
          status={{type: 'warning', message: 'Memory usage is moderate'}}
        />
        <Slider
          label="Disk"
          value={value3}
          onChange={setValue3}
          status={{type: 'success', message: 'Disk usage is healthy'}}
        />
      </div>
    );
  },
};

export const AllVariations: Story = {
  render: () => {
    const [v1, setV1] = useState(50);
    const [v2, setV2] = useState<[number, number]>([20, 80]);
    const [v3, setV3] = useState(30);
    const [v4, setV4] = useState(72);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          maxWidth: '400px',
        }}>
        <Slider label="Default slider" value={v1} onChange={setV1} />
        <Slider label="Range slider" value={v2} onChange={setV2} />
        <Slider
          label="With marks"
          value={v3}
          onChange={setV3}
          marks={[
            {value: 0, label: '0%'},
            {value: 50, label: '50%'},
            {value: 100, label: '100%'},
          ]}
        />
        <Slider
          label="With text display"
          value={v4}
          onChange={setV4}
          formatValue={v => `${v}°F`}
          valueDisplay="text"
          min={60}
          max={90}
        />
        <Slider label="Disabled" value={50} isDisabled />
        <Slider
          label="No value display"
          value={v1}
          onChange={setV1}
          valueDisplay="none"
        />
      </div>
    );
  },
};

// Disabled with an explanation tooltip. Hover or keyboard-focus the thumb to see
// why it's disabled — the reason is announced to assistive tech via
// aria-describedby, and the thumb stays focusable (value changes are still
// blocked). Use disabledMessage instead of wrapping a disabled Slider in
// Tooltip: disabled controls swallow the pointer events a Tooltip wrapper needs.
export const DisabledWithMessage: Story = {
  render: args => {
    return <Slider {...(args as any)} />;
  },
  args: {
    label: 'Volume',
    value: 50,
    isDisabled: true,
    disabledMessage: 'Volume is locked while sharing your screen',
  },
};
