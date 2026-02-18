import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {
  BellIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline';

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
type Story = StoryObj<typeof XDSCheckboxInput>;

export const Default: Story = {
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(
      args.value ?? false,
    );
    const {value: _, onChange: __, ...restArgs} = args;
    return (
      <XDSCheckboxInput
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
      <XDSCheckboxInput
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
      <XDSCheckboxInput
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
      <XDSCheckboxInput
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
      <XDSCheckboxInput
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
      <XDSCheckboxInput
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
      <XDSCheckboxInput
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
        <XDSCheckboxInput
          label="Unchecked"
          value={value1}
          onChange={setValue1}
        />
        <XDSCheckboxInput label="Checked" value={value2} onChange={setValue2} />
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

export const SmallSize: Story = {
  render: args => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(
      args.value ?? false,
    );
    const {value: _, onChange: __, ...restArgs} = args;
    return (
      <XDSCheckboxInput
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
        <XDSCheckboxInput
          label="Medium size (default)"
          value={value1}
          onChange={setValue1}
          size="md"
        />
        <XDSCheckboxInput
          label="Small size"
          value={value2}
          onChange={setValue2}
          size="sm"
        />
        <XDSCheckboxInput
          label="Medium size checked"
          value={value3}
          onChange={setValue3}
          size="md"
        />
        <XDSCheckboxInput
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
      <XDSCheckboxInput
        {...restArgs}
        value={value}
        onChange={checked => setValue(checked)}
      />
    );
  },
  args: {
    label: 'Enable notifications',
    description: 'Receive alerts when important events occur',
    startIcon: BellIcon,
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
        <XDSCheckboxInput
          label="Email notifications"
          description="Receive updates via email"
          value={value1}
          onChange={setValue1}
          startIcon={EnvelopeIcon}
        />
        <XDSCheckboxInput
          label="Push notifications"
          description="Get instant alerts on your device"
          value={value2}
          onChange={setValue2}
          startIcon={BellIcon}
        />
        <XDSCheckboxInput
          label="Two-factor authentication"
          description="Add an extra layer of security"
          value={value3}
          onChange={setValue3}
          startIcon={ShieldCheckIcon}
          isDisabled
        />
      </div>
    );
  },
};

/**
 * Demonstrates async actions using onChangeAction.
 * The checkbox automatically shows loading state while syncing with server.
 */
export const AsyncAction: Story = {
  render: () => {
    const [value, setValue] = useState<boolean | 'indeterminate'>(false);

    // Simulate server sync (e.g., saving preference to API)
    const simulateServerAction = async (checked: boolean) => {
      await new Promise<void>(resolve => {
        setTimeout(() => {
          setValue(checked);
          resolve();
        }, 1500);
      });
    };

    return (
      <XDSVStack gap="space4">
        <XDSText type="body" color="secondary">
          Toggle the checkbox to trigger an async action. The checkbox will show
          a busy state for 1.5 seconds while syncing.
        </XDSText>
        <XDSCheckboxInput
          label="Sync preferences"
          description="Changes are saved automatically to your account"
          value={value}
          onChangeAction={simulateServerAction}
          startIcon={CloudArrowUpIcon}
        />
      </XDSVStack>
    );
  },
};
