// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {
  BellIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const meta: Meta<typeof CheckboxInput> = {
  title: 'Core/CheckboxInput',
  component: CheckboxInput,
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
    description: {
      control: 'text',
      description: 'Description text displayed below the label',
    },
    value: {
      control: 'select',
      options: [true, false, 'indeterminate'],
      description:
        'Whether the checkbox is checked, unchecked, or indeterminate',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled',
    },
    disabledMessage: {
      control: 'text',
      description:
        'Explains why the checkbox is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the checkbox focusable via aria-disabled (toggling stays blocked). Use this instead of wrapping a disabled CheckboxInput in Tooltip.',
    },
    isRequired: {
      control: 'boolean',
      description: 'Whether the checkbox is required',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Size of the checkbox',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CheckboxInput>;

export const Default: Story = {
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(
      args.value ?? false,
    );
    const {value: _, onChange: __, ...restArgs} = args;
    return (
      <CheckboxInput
        {...restArgs}
        value={value}
        onChange={checked => setValue(checked)}
      />
    );
  },
  args: {
    label: 'Accept terms and conditions',
  },
};

export const Checked: Story = {
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(
      args.value ?? true,
    );
    const {value: _, onChange: __, ...restArgs} = args;
    return (
      <CheckboxInput
        {...restArgs}
        value={value}
        onChange={checked => setValue(checked)}
      />
    );
  },
  args: {
    label: 'I agree to the terms',
    value: true,
  },
};

export const WithDescription: Story = {
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(
      args.value ?? false,
    );
    const {value: _, onChange: __, ...restArgs} = args;
    return (
      <CheckboxInput
        {...restArgs}
        value={value}
        onChange={checked => setValue(checked)}
      />
    );
  },
  args: {
    label: 'Subscribe to newsletter',
    description: 'Receive weekly updates about new features and announcements.',
  },
};

export const WithHiddenLabel: Story = {
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(
      args.value ?? false,
    );
    const {value: _, onChange: __, ...restArgs} = args;
    return (
      <CheckboxInput
        {...restArgs}
        value={value}
        onChange={checked => setValue(checked)}
      />
    );
  },
  args: {
    label: 'Select row',
    isLabelHidden: true,
  },
};

export const Indeterminate: Story = {
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(
      args.value ?? 'indeterminate',
    );
    const {value: _, onChange: __, ...restArgs} = args;
    return (
      <CheckboxInput
        {...restArgs}
        value={value}
        onChange={checked => setValue(checked)}
      />
    );
  },
  args: {
    label: 'Select all items',
    description: 'Some items are selected',
    value: 'indeterminate',
  },
};

export const Disabled: Story = {
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(
      args.value ?? false,
    );
    const {value: _, onChange: __, ...restArgs} = args;
    return (
      <CheckboxInput
        {...restArgs}
        value={value}
        onChange={checked => setValue(checked)}
      />
    );
  },
  args: {
    label: 'Premium feature',
    description: 'Upgrade to enable this option',
    isDisabled: true,
  },
};

export const DisabledChecked: Story = {
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(
      args.value ?? true,
    );
    const {value: _, onChange: __, ...restArgs} = args;
    return (
      <CheckboxInput
        {...restArgs}
        value={value}
        onChange={checked => setValue(checked)}
      />
    );
  },
  args: {
    label: 'Feature enabled',
    value: true,
    isDisabled: true,
  },
};

export const AllVariations: Story = {
  render: () => {
    const [value1, setValue1] = useState<boolean | 'indeterminate'>(false);
    const [value2, setValue2] = useState<boolean | 'indeterminate'>(true);
    const [value3, setValue3] = useState<boolean | 'indeterminate'>(
      'indeterminate',
    );
    const [value4, setValue4] = useState<boolean | 'indeterminate'>(false);
    const [value5, setValue5] = useState<boolean | 'indeterminate'>(true);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '400px',
        }}>
        <CheckboxInput label="Unchecked" value={value1} onChange={setValue1} />
        <CheckboxInput label="Checked" value={value2} onChange={setValue2} />
        <CheckboxInput
          label="Indeterminate"
          description="Some items are selected"
          value={value3}
          onChange={setValue3}
        />
        <CheckboxInput
          label="Disabled unchecked"
          value={value4}
          onChange={setValue4}
          isDisabled
        />
        <CheckboxInput
          label="Disabled checked"
          value={value5}
          onChange={setValue5}
          isDisabled
        />
      </div>
    );
  },
};

export const SmallSize: Story = {
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(
      args.value ?? false,
    );
    const {value: _, onChange: __, ...restArgs} = args;
    return (
      <CheckboxInput
        {...restArgs}
        value={value}
        onChange={checked => setValue(checked)}
      />
    );
  },
  args: {
    label: 'Compact checkbox',
    size: 'sm',
  },
};

export const SizeComparison: Story = {
  render: () => {
    const [value1, setValue1] = useState<boolean | 'indeterminate'>(false);
    const [value2, setValue2] = useState<boolean | 'indeterminate'>(false);
    const [value3, setValue3] = useState<boolean | 'indeterminate'>(true);
    const [value4, setValue4] = useState<boolean | 'indeterminate'>(true);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '400px',
        }}>
        <CheckboxInput
          label="Medium size (default)"
          value={value1}
          onChange={setValue1}
          size="md"
        />
        <CheckboxInput
          label="Small size"
          value={value2}
          onChange={setValue2}
          size="sm"
        />
        <CheckboxInput
          label="Medium size checked"
          value={value3}
          onChange={setValue3}
          size="md"
        />
        <CheckboxInput
          label="Small size checked"
          value={value4}
          onChange={setValue4}
          size="sm"
        />
      </div>
    );
  },
};

export const WithStartIcon: Story = {
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(
      args.value ?? false,
    );
    const {value: _, onChange: __, ...restArgs} = args;
    return (
      <CheckboxInput
        {...restArgs}
        value={value}
        onChange={checked => setValue(checked)}
      />
    );
  },
  args: {
    label: 'Enable notifications',
    description: 'Receive alerts when important events occur',
    labelIcon: BellIcon,
  },
};

export const StartIconVariations: Story = {
  render: () => {
    const [value1, setValue1] = useState<boolean | 'indeterminate'>(false);
    const [value2, setValue2] = useState<boolean | 'indeterminate'>(true);
    const [value3, setValue3] = useState<boolean | 'indeterminate'>(false);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '400px',
        }}>
        <CheckboxInput
          label="Email notifications"
          description="Receive updates via email"
          value={value1}
          onChange={setValue1}
          labelIcon={EnvelopeIcon}
        />
        <CheckboxInput
          label="Push notifications"
          description="Get instant alerts on your device"
          value={value2}
          onChange={setValue2}
          labelIcon={BellIcon}
        />
        <CheckboxInput
          label="Two-factor authentication"
          description="Add an extra layer of security"
          value={value3}
          onChange={setValue3}
          labelIcon={ShieldCheckIcon}
          isDisabled
        />
      </div>
    );
  },
};

export const WithErrorStatus: Story = {
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(
      args.value ?? false,
    );
    const {value: _, onChange: __, ...restArgs} = args;
    return (
      <CheckboxInput
        {...restArgs}
        value={value}
        onChange={checked => setValue(checked)}
      />
    );
  },
  args: {
    label: 'Accept terms and conditions',
    status: {type: 'error', message: 'You must accept the terms to continue'},
  },
};

export const WithWarningStatus: Story = {
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(
      args.value ?? true,
    );
    const {value: _, onChange: __, ...restArgs} = args;
    return (
      <CheckboxInput
        {...restArgs}
        value={value}
        onChange={checked => setValue(checked)}
      />
    );
  },
  args: {
    label: 'Share usage data',
    description: 'Help us improve by sharing anonymous usage statistics',
    status: {type: 'warning', message: 'This data may be shared with partners'},
  },
};

export const WithSuccessStatus: Story = {
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(
      args.value ?? true,
    );
    const {value: _, onChange: __, ...restArgs} = args;
    return (
      <CheckboxInput
        {...restArgs}
        value={value}
        onChange={checked => setValue(checked)}
      />
    );
  },
  args: {
    label: 'Email verified',
    status: {type: 'success', message: 'Your email has been verified'},
  },
};

export const StatusVariations: Story = {
  render: () => {
    const [value1, setValue1] = useState<boolean | 'indeterminate'>(false);
    const [value2, setValue2] = useState<boolean | 'indeterminate'>(true);
    const [value3, setValue3] = useState<boolean | 'indeterminate'>(true);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          maxWidth: '400px',
        }}>
        <CheckboxInput
          label="Accept terms and conditions"
          value={value1}
          onChange={setValue1}
          status={{
            type: 'error',
            message: 'You must accept the terms to continue',
          }}
        />
        <CheckboxInput
          label="Share usage data"
          description="Help us improve by sharing anonymous usage statistics"
          value={value2}
          onChange={setValue2}
          status={{
            type: 'warning',
            message: 'This data may be shared with partners',
          }}
        />
        <CheckboxInput
          label="Email verified"
          value={value3}
          onChange={setValue3}
          status={{type: 'success', message: 'Your email has been verified'}}
        />
      </div>
    );
  },
};

// Disabled with an explanation tooltip. Hover or keyboard-focus the checkbox to
// see why it's disabled — the reason is announced to assistive tech via
// aria-describedby, and the checkbox stays focusable (toggling is still
// blocked). Use disabledMessage instead of wrapping a disabled CheckboxInput in
// Tooltip: disabled controls swallow the pointer events a Tooltip wrapper needs.
export const DisabledWithMessage: Story = {
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(
      args.value ?? false,
    );
    const {value: _, onChange: __, ...restArgs} = args;
    return (
      <CheckboxInput
        {...restArgs}
        value={value}
        onChange={checked => setValue(checked)}
      />
    );
  },
  args: {
    label: 'Accept terms',
    isDisabled: true,
    disabledMessage: 'Terms are managed by your administrator',
  },
};
