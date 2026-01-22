import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { XDSCheckboxInput } from '@xds/core/CheckboxInput';

const meta: Meta<typeof XDSCheckboxInput> = {
  title: 'Core/XDSCheckboxInput',
  component: XDSCheckboxInput,
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
    description: {
      control: 'text',
      description: 'Description text displayed below the label',
    },
    value: {
      control: 'select',
      options: [true, false, 'indeterminate'],
      description: 'Whether the checkbox is checked, unchecked, or indeterminate',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSCheckboxInput>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? false);
    return <XDSCheckboxInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Accept terms and conditions',
  },
};

export const Checked: Story = {
  render: (args) => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? true);
    return <XDSCheckboxInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'I agree to the terms',
    value: true,
  },
};

export const WithDescription: Story = {
  render: (args) => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? false);
    return <XDSCheckboxInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Subscribe to newsletter',
    description: 'Receive weekly updates about new features and announcements.',
  },
};

export const WithHiddenLabel: Story = {
  render: (args) => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? false);
    return <XDSCheckboxInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Select row',
    isLabelHidden: true,
  },
};

export const Indeterminate: Story = {
  render: (args) => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? 'indeterminate');
    return <XDSCheckboxInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Select all items',
    description: 'Some items are selected',
    value: 'indeterminate',
  },
};

export const Disabled: Story = {
  render: (args) => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? false);
    return <XDSCheckboxInput {...args} value={value} onChange={setValue} />;
  },
  args: {
    label: 'Premium feature',
    description: 'Upgrade to enable this option',
    isDisabled: true,
  },
};

export const DisabledChecked: Story = {
  render: (args) => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(args.value ?? true);
    return <XDSCheckboxInput {...args} value={value} onChange={setValue} />;
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
    const [value3, setValue3] = useState<boolean | 'indeterminate'>('indeterminate');
    const [value4, setValue4] = useState<boolean | 'indeterminate'>(false);
    const [value5, setValue5] = useState<boolean | 'indeterminate'>(true);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
        <XDSCheckboxInput
          label="Unchecked"
          value={value1}
          onChange={setValue1}
        />
        <XDSCheckboxInput
          label="Checked"
          value={value2}
          onChange={setValue2}
        />
        <XDSCheckboxInput
          label="Indeterminate"
          description="Some items are selected"
          value={value3}
          onChange={setValue3}
        />
        <XDSCheckboxInput
          label="Disabled unchecked"
          value={value4}
          onChange={setValue4}
          isDisabled
        />
        <XDSCheckboxInput
          label="Disabled checked"
          value={value5}
          onChange={setValue5}
          isDisabled
        />
      </div>
    );
  },
};
