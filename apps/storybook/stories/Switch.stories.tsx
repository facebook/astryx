import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSSwitch} from '@xds/core/Switch';
import {
  BellIcon,
  MoonIcon,
  ShieldCheckIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline';

const meta: Meta<typeof XDSSwitch> = {
  title: 'Core/XDSSwitch',
  component: XDSSwitch,
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
      control: 'boolean',
      description: 'Whether the switch is on or off',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Whether the switch is disabled',
    },
    isOptional: {
      control: 'boolean',
      description: 'Whether the field is optional',
    },
    isRequired: {
      control: 'boolean',
      description: 'Whether the switch is required',
    },
    labelPosition: {
      control: 'select',
      options: ['start', 'end'],
      description: 'Which side of the switch the label appears on',
    },
    labelSpacing: {
      control: 'select',
      options: ['default', 'spread'],
      description: 'Spacing behavior between label and switch',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSSwitch>;

export const Default: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? false);
    const {value: _, onChange: __, ...restArgs} = args;
    return (
      <XDSSwitch
        {...restArgs}
        value={value}
        onChange={checked => setValue(checked)}
      />
    );
  },
  args: {
    label: 'Enable notifications',
  },
};

export const On: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? true);
    const {value: _, onChange: __, ...restArgs} = args;
    return (
      <XDSSwitch
        {...restArgs}
        value={value}
        onChange={checked => setValue(checked)}
      />
    );
  },
  args: {
    label: 'Notifications enabled',
    value: true,
  },
};

export const WithDescription: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? false);
    const {value: _, onChange: __, ...restArgs} = args;
    return (
      <XDSSwitch
        {...restArgs}
        value={value}
        onChange={checked => setValue(checked)}
      />
    );
  },
  args: {
    label: 'Dark mode',
    description: 'Switch to a darker color scheme for reduced eye strain.',
  },
};

export const WithHiddenLabel: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? false);
    const {value: _, onChange: __, ...restArgs} = args;
    return (
      <XDSSwitch
        {...restArgs}
        value={value}
        onChange={checked => setValue(checked)}
      />
    );
  },
  args: {
    label: 'Toggle row',
    isLabelHidden: true,
  },
};

export const Disabled: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? false);
    const {value: _, onChange: __, ...restArgs} = args;
    return (
      <XDSSwitch
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

export const DisabledOn: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? true);
    const {value: _, onChange: __, ...restArgs} = args;
    return (
      <XDSSwitch
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

export const Required: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? false);
    const {value: _, onChange: __, ...restArgs} = args;
    return (
      <XDSSwitch
        {...restArgs}
        value={value}
        onChange={checked => setValue(checked)}
      />
    );
  },
  args: {
    label: 'Accept terms and conditions',
    isRequired: true,
  },
};

export const Optional: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? false);
    const {value: _, onChange: __, ...restArgs} = args;
    return (
      <XDSSwitch
        {...restArgs}
        value={value}
        onChange={checked => setValue(checked)}
      />
    );
  },
  args: {
    label: 'Subscribe to newsletter',
    isOptional: true,
  },
};

export const WithLabelIcon: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? false);
    const {value: _, onChange: __, ...restArgs} = args;
    return (
      <XDSSwitch
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

export const WithLabelTooltip: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? false);
    const {value: _, onChange: __, ...restArgs} = args;
    return (
      <XDSSwitch
        {...restArgs}
        value={value}
        onChange={checked => setValue(checked)}
      />
    );
  },
  args: {
    label: 'Auto-save',
    labelTooltip: 'Automatically save your changes as you work',
    labelIcon: CloudArrowUpIcon,
  },
};

export const LabelPositionStart: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? false);
    const {value: _, onChange: __, ...restArgs} = args;
    return (
      <XDSSwitch
        {...restArgs}
        value={value}
        onChange={checked => setValue(checked)}
      />
    );
  },
  args: {
    label: 'Enable dark mode',
    labelPosition: 'start',
    labelIcon: MoonIcon,
  },
};

export const LabelSpacingSpread: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? false);
    const {value: _, onChange: __, ...restArgs} = args;
    return (
      <div style={{width: 300, border: '1px solid #ccc', padding: 16}}>
        <XDSSwitch
          {...restArgs}
          value={value}
          onChange={checked => setValue(checked)}
        />
      </div>
    );
  },
  args: {
    label: 'Enable notifications',
    labelPosition: 'start',
    labelSpacing: 'spread',
  },
};

export const AllVariations: Story = {
  render: () => {
    const [value1, setValue1] = useState(false);
    const [value2, setValue2] = useState(true);
    const [value3, setValue3] = useState(false);
    const [value4, setValue4] = useState(true);
    const [value5, setValue5] = useState(false);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '400px',
        }}>
        <XDSSwitch label="Off state" value={value1} onChange={setValue1} />
        <XDSSwitch label="On state" value={value2} onChange={setValue2} />
        <XDSSwitch
          label="Disabled off"
          value={value3}
          onChange={setValue3}
          isDisabled
        />
        <XDSSwitch
          label="Disabled on"
          value={value4}
          onChange={setValue4}
          isDisabled
        />
        <XDSSwitch
          label="With description"
          description="Additional context for this setting"
          value={value5}
          onChange={setValue5}
        />
      </div>
    );
  },
};

export const LabelIconVariations: Story = {
  render: () => {
    const [value1, setValue1] = useState(false);
    const [value2, setValue2] = useState(true);
    const [value3, setValue3] = useState(false);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '400px',
        }}>
        <XDSSwitch
          label="Notifications"
          description="Receive push notifications"
          value={value1}
          onChange={setValue1}
          labelIcon={BellIcon}
        />
        <XDSSwitch
          label="Dark mode"
          description="Use dark color scheme"
          value={value2}
          onChange={setValue2}
          labelIcon={MoonIcon}
        />
        <XDSSwitch
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

export const LabelPositionComparison: Story = {
  render: () => {
    const [value1, setValue1] = useState(false);
    const [value2, setValue2] = useState(false);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '400px',
        }}>
        <XDSSwitch
          label="Label at end (default)"
          value={value1}
          onChange={setValue1}
          labelPosition="end"
        />
        <XDSSwitch
          label="Label at start"
          value={value2}
          onChange={setValue2}
          labelPosition="start"
        />
      </div>
    );
  },
};

export const SpreadSpacingExample: Story = {
  render: () => {
    const [value1, setValue1] = useState(false);
    const [value2, setValue2] = useState(true);
    const [value3, setValue3] = useState(false);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '350px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '16px',
        }}>
        <XDSSwitch
          label="Enable notifications"
          value={value1}
          onChange={setValue1}
          labelPosition="start"
          labelSpacing="spread"
          labelIcon={BellIcon}
        />
        <XDSSwitch
          label="Dark mode"
          value={value2}
          onChange={setValue2}
          labelPosition="start"
          labelSpacing="spread"
          labelIcon={MoonIcon}
        />
        <XDSSwitch
          label="Auto-save"
          value={value3}
          onChange={setValue3}
          labelPosition="start"
          labelSpacing="spread"
          labelIcon={CloudArrowUpIcon}
          labelTooltip="Save changes automatically as you work"
        />
      </div>
    );
  },
};
