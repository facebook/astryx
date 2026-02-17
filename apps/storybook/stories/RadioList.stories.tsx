import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';

const meta: Meta<typeof XDSRadioList> = {
  title: 'Core/XDSRadioList',
  component: XDSRadioList,
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
      control: 'text',
      description: 'The currently selected value',
    },
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
      description: 'Layout direction of the radio items',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Whether all radio items are disabled',
    },
    isRequired: {
      control: 'boolean',
      description: 'Whether the radio group is required',
    },
    isOptional: {
      control: 'boolean',
      description: 'Whether the field is optional',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSRadioList>;

export const Default: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    const {value: _value, onChange: _onChange, ...restArgs} = args;
    return (
      <XDSRadioList {...restArgs} value={value} onChange={setValue}>
        <XDSRadioListItem label="Email" value="email" />
        <XDSRadioListItem label="SMS" value="sms" />
        <XDSRadioListItem label="Push notification" value="push" />
      </XDSRadioList>
    );
  },
  args: {
    label: 'Notification preference',
  },
};

export const WithDescription: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    const {value: _value, onChange: _onChange, ...restArgs} = args;
    return (
      <XDSRadioList {...restArgs} value={value} onChange={setValue}>
        <XDSRadioListItem
          label="Email"
          value="email"
          description="Receive notifications via email"
        />
        <XDSRadioListItem
          label="SMS"
          value="sms"
          description="Standard messaging rates apply"
        />
        <XDSRadioListItem
          label="Push notification"
          value="push"
          description="Instant alerts on your device"
        />
      </XDSRadioList>
    );
  },
  args: {
    label: 'Notification preference',
    description: 'Choose how you would like to be notified',
  },
};

export const Horizontal: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    const {value: _value, onChange: _onChange, ...restArgs} = args;
    return (
      <XDSRadioList {...restArgs} value={value} onChange={setValue}>
        <XDSRadioListItem label="Small" value="sm" />
        <XDSRadioListItem label="Medium" value="md" />
        <XDSRadioListItem label="Large" value="lg" />
      </XDSRadioList>
    );
  },
  args: {
    label: 'Size',
    orientation: 'horizontal',
  },
};

export const Disabled: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? 'email');
    const {value: _value, onChange: _onChange, ...restArgs} = args;
    return (
      <XDSRadioList {...restArgs} value={value} onChange={setValue}>
        <XDSRadioListItem label="Email" value="email" />
        <XDSRadioListItem label="SMS" value="sms" />
        <XDSRadioListItem label="Push notification" value="push" />
      </XDSRadioList>
    );
  },
  args: {
    label: 'Notification preference',
    isDisabled: true,
  },
};

export const DisabledItem: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    const {value: _value, onChange: _onChange, ...restArgs} = args;
    return (
      <XDSRadioList {...restArgs} value={value} onChange={setValue}>
        <XDSRadioListItem label="Email" value="email" />
        <XDSRadioListItem label="SMS" value="sms" isDisabled />
        <XDSRadioListItem label="Push notification" value="push" />
      </XDSRadioList>
    );
  },
  args: {
    label: 'Notification preference',
  },
};

export const Required: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    const {value: _value, onChange: _onChange, ...restArgs} = args;
    return (
      <XDSRadioList {...restArgs} value={value} onChange={setValue}>
        <XDSRadioListItem label="Email" value="email" />
        <XDSRadioListItem label="SMS" value="sms" />
        <XDSRadioListItem label="Push notification" value="push" />
      </XDSRadioList>
    );
  },
  args: {
    label: 'Notification preference',
    isRequired: true,
  },
};

export const Optional: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    const {value: _value, onChange: _onChange, ...restArgs} = args;
    return (
      <XDSRadioList {...restArgs} value={value} onChange={setValue}>
        <XDSRadioListItem label="Email" value="email" />
        <XDSRadioListItem label="SMS" value="sms" />
        <XDSRadioListItem label="Push notification" value="push" />
      </XDSRadioList>
    );
  },
  args: {
    label: 'Notification preference',
    isOptional: true,
  },
};

export const WithErrorStatus: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    const {value: _value, onChange: _onChange, ...restArgs} = args;
    return (
      <XDSRadioList {...restArgs} value={value} onChange={setValue}>
        <XDSRadioListItem label="Email" value="email" />
        <XDSRadioListItem label="SMS" value="sms" />
        <XDSRadioListItem label="Push notification" value="push" />
      </XDSRadioList>
    );
  },
  args: {
    label: 'Notification preference',
    isRequired: true,
    status: {type: 'error', message: 'Please select a notification method'},
  },
};

export const WithStartContent: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    const {value: _value, onChange: _onChange, ...restArgs} = args;
    return (
      <XDSRadioList {...restArgs} value={value} onChange={setValue}>
        <XDSRadioListItem
          label="Email"
          value="email"
          startContent={<span>📧</span>}
        />
        <XDSRadioListItem
          label="SMS"
          value="sms"
          startContent={<span>💬</span>}
        />
        <XDSRadioListItem
          label="Push notification"
          value="push"
          startContent={<span>🔔</span>}
        />
      </XDSRadioList>
    );
  },
  args: {
    label: 'Notification preference',
  },
};

export const WithEndContent: Story = {
  render: args => {
    const [value, setValue] = useState(args.value ?? '');
    const {value: _value, onChange: _onChange, ...restArgs} = args;
    return (
      <XDSRadioList {...restArgs} value={value} onChange={setValue}>
        <XDSRadioListItem
          label="Free"
          value="free"
          endContent={<span style={{color: '#0D8626'}}>$0/mo</span>}
        />
        <XDSRadioListItem
          label="Pro"
          value="pro"
          endContent={<span style={{color: '#0064E0'}}>$9/mo</span>}
        />
        <XDSRadioListItem
          label="Enterprise"
          value="enterprise"
          endContent={<span style={{color: '#5B08D8'}}>Custom</span>}
        />
      </XDSRadioList>
    );
  },
  args: {
    label: 'Plan',
  },
};

export const AllVariations: Story = {
  render: () => {
    const [value1, setValue1] = useState('');
    const [value2, setValue2] = useState('email');
    const [value3, setValue3] = useState('');
    const [value4, setValue4] = useState('sm');
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          maxWidth: '400px',
        }}>
        <XDSRadioList label="Unselected" value={value1} onChange={setValue1}>
          <XDSRadioListItem label="Option A" value="a" />
          <XDSRadioListItem label="Option B" value="b" />
        </XDSRadioList>
        <XDSRadioList label="Pre-selected" value={value2} onChange={setValue2}>
          <XDSRadioListItem label="Email" value="email" />
          <XDSRadioListItem label="SMS" value="sms" />
        </XDSRadioList>
        <XDSRadioList
          label="Disabled group"
          value=""
          onChange={() => {}}
          isDisabled>
          <XDSRadioListItem label="Option A" value="a" />
          <XDSRadioListItem label="Option B" value="b" />
        </XDSRadioList>
        <XDSRadioList
          label="With descriptions"
          value={value3}
          onChange={setValue3}>
          <XDSRadioListItem
            label="Email"
            value="email"
            description="Delivered to your inbox"
          />
          <XDSRadioListItem
            label="SMS"
            value="sms"
            description="Standard rates apply"
          />
        </XDSRadioList>
        <XDSRadioList
          label="Horizontal"
          value={value4}
          onChange={setValue4}
          orientation="horizontal">
          <XDSRadioListItem label="S" value="sm" />
          <XDSRadioListItem label="M" value="md" />
          <XDSRadioListItem label="L" value="lg" />
        </XDSRadioList>
        <XDSRadioList
          label="With error"
          value=""
          onChange={() => {}}
          isRequired
          status={{
            type: 'error',
            message: 'Please select an option',
          }}>
          <XDSRadioListItem label="Option A" value="a" />
          <XDSRadioListItem label="Option B" value="b" />
        </XDSRadioList>
      </div>
    );
  },
};
