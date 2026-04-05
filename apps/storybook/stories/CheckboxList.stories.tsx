import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSCheckboxList, XDSCheckboxListItem} from '@xds/core/CheckboxList';
import {XDSList} from '@xds/core/List';

const meta: Meta<typeof XDSCheckboxList> = {
  title: 'Form/XDSCheckboxList',
  component: XDSCheckboxList,
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
    density: {
      control: 'select',
      options: ['compact', 'balanced', 'spacious'],
      description: 'Spacing density for list items',
    },
    hasDividers: {
      control: 'boolean',
      description: 'Whether to show dividers between items',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Whether all checkbox items are disabled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSCheckboxList>;

export const Default: Story = {
  render: args => {
    const [value, setValue] = useState<string[]>(args.value ?? []);
    const {value: _value, onChange: _onChange, ...restArgs} = args;
    return (
      <XDSCheckboxList {...restArgs} value={value} onChange={setValue}>
        <XDSCheckboxListItem label="Email" value="email" />
        <XDSCheckboxListItem label="SMS" value="sms" />
        <XDSCheckboxListItem label="Push notification" value="push" />
      </XDSCheckboxList>
    );
  },
  args: {
    label: 'Notification preferences',
  },
};

export const WithDescriptions: Story = {
  render: args => {
    const [value, setValue] = useState<string[]>(args.value ?? []);
    const {value: _value, onChange: _onChange, ...restArgs} = args;
    return (
      <XDSCheckboxList {...restArgs} value={value} onChange={setValue}>
        <XDSCheckboxListItem
          label="Email"
          value="email"
          description="Receive notifications via email"
        />
        <XDSCheckboxListItem
          label="SMS"
          value="sms"
          description="Standard messaging rates apply"
        />
        <XDSCheckboxListItem
          label="Push notification"
          value="push"
          description="Instant alerts on your device"
        />
      </XDSCheckboxList>
    );
  },
  args: {
    label: 'Notification preferences',
    description: 'Choose how you would like to be notified',
    hasDividers: true,
  },
};

export const DynamicItems: Story = {
  render: args => {
    const items = [
      {id: 'react', label: 'React'},
      {id: 'vue', label: 'Vue'},
      {id: 'angular', label: 'Angular'},
      {id: 'svelte', label: 'Svelte'},
    ];
    const [value, setValue] = useState<string[]>(['react']);
    const {value: _value, onChange: _onChange, ...restArgs} = args;
    return (
      <XDSCheckboxList {...restArgs} value={value} onChange={setValue}>
        {items.map(item => (
          <XDSCheckboxListItem
            key={item.id}
            label={item.label}
            value={item.id}
          />
        ))}
      </XDSCheckboxList>
    );
  },
  args: {
    label: 'Frameworks',
  },
};

export const StandaloneMode: Story = {
  render: () => {
    const [accepted, setAccepted] = useState(false);
    const [subscribed, setSubscribed] = useState(true);
    const [marketing, setMarketing] = useState(false);
    return (
      <XDSList>
        <XDSCheckboxListItem
          label="Accept terms and conditions"
          isChecked={accepted}
          onCheck={setAccepted}
        />
        <XDSCheckboxListItem
          label="Subscribe to newsletter"
          description="Weekly updates about new features"
          isChecked={subscribed}
          onCheck={setSubscribed}
        />
        <XDSCheckboxListItem
          label="Receive marketing emails"
          isChecked={marketing}
          onCheck={setMarketing}
        />
      </XDSList>
    );
  },
};

export const ReadOnly: Story = {
  render: () => (
    <XDSList>
      <XDSCheckboxListItem label="Completed task" isChecked={true} />
      <XDSCheckboxListItem label="Pending task" isChecked={false} />
      <XDSCheckboxListItem label="In progress" isChecked="indeterminate" />
    </XDSList>
  ),
};

export const SelectAllWithIndeterminate: Story = {
  render: () => {
    const allItems = ['email', 'sms', 'push'];
    const [selected, setSelected] = useState<string[]>(['email']);

    const allChecked = allItems.every(item => selected.includes(item));
    const noneChecked = selected.length === 0;
    const selectAllState = allChecked
      ? true
      : noneChecked
        ? false
        : ('indeterminate' as const);

    const handleSelectAll = () => {
      if (allChecked) {
        setSelected([]);
      } else {
        setSelected([...allItems]);
      }
    };

    return (
      <div>
        <XDSList>
          <XDSCheckboxListItem
            label="Select all"
            isChecked={selectAllState}
            onCheck={handleSelectAll}
          />
        </XDSList>
        <XDSCheckboxList
          label="Notifications"
          isLabelHidden
          value={selected}
          onChange={setSelected}
          hasDividers>
          <XDSCheckboxListItem label="Email" value="email" />
          <XDSCheckboxListItem label="SMS" value="sms" />
          <XDSCheckboxListItem label="Push notification" value="push" />
        </XDSCheckboxList>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: args => {
    const [value, setValue] = useState<string[]>(['email']);
    const {value: _value, onChange: _onChange, ...restArgs} = args;
    return (
      <XDSCheckboxList {...restArgs} value={value} onChange={setValue}>
        <XDSCheckboxListItem label="Email" value="email" />
        <XDSCheckboxListItem label="SMS" value="sms" />
        <XDSCheckboxListItem label="Push notification" value="push" />
      </XDSCheckboxList>
    );
  },
  args: {
    label: 'Notification preferences',
    isDisabled: true,
  },
};

export const DisabledItem: Story = {
  render: args => {
    const [value, setValue] = useState<string[]>([]);
    const {value: _value, onChange: _onChange, ...restArgs} = args;
    return (
      <XDSCheckboxList {...restArgs} value={value} onChange={setValue}>
        <XDSCheckboxListItem label="Email" value="email" />
        <XDSCheckboxListItem label="SMS" value="sms" isDisabled />
        <XDSCheckboxListItem label="Push notification" value="push" />
      </XDSCheckboxList>
    );
  },
  args: {
    label: 'Notification preferences',
  },
};

export const WithErrorStatus: Story = {
  render: args => {
    const [value, setValue] = useState<string[]>([]);
    const {value: _value, onChange: _onChange, ...restArgs} = args;
    return (
      <XDSCheckboxList {...restArgs} value={value} onChange={setValue}>
        <XDSCheckboxListItem label="Email" value="email" />
        <XDSCheckboxListItem label="SMS" value="sms" />
        <XDSCheckboxListItem label="Push notification" value="push" />
      </XDSCheckboxList>
    );
  },
  args: {
    label: 'Notification preferences',
    status: {
      type: 'error',
      message: 'Please select at least one notification method',
    },
  },
};

export const WithEndContent: Story = {
  render: args => {
    const [value, setValue] = useState<string[]>(['free']);
    const {value: _value, onChange: _onChange, ...restArgs} = args;
    return (
      <XDSCheckboxList {...restArgs} value={value} onChange={setValue}>
        <XDSCheckboxListItem
          label="Free tier"
          value="free"
          description="Basic features included"
          endContent={<span style={{color: '#0D8626'}}>$0/mo</span>}
        />
        <XDSCheckboxListItem
          label="Pro tier"
          value="pro"
          description="Advanced features"
          endContent={<span style={{color: '#0064E0'}}>$9/mo</span>}
        />
        <XDSCheckboxListItem
          label="Enterprise"
          value="enterprise"
          description="Custom solutions"
          endContent={<span style={{color: '#5B08D8'}}>Custom</span>}
        />
      </XDSCheckboxList>
    );
  },
  args: {
    label: 'Add-on packages',
    hasDividers: true,
  },
};

export const AllVariations: Story = {
  render: () => {
    const [value1, setValue1] = useState<string[]>([]);
    const [value2, setValue2] = useState<string[]>(['email']);
    const [standalone1, setStandalone1] = useState(false);
    const [standalone2, setStandalone2] = useState(true);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          maxWidth: '400px',
        }}>
        <XDSCheckboxList label="Unselected" value={value1} onChange={setValue1}>
          <XDSCheckboxListItem label="Option A" value="a" />
          <XDSCheckboxListItem label="Option B" value="b" />
        </XDSCheckboxList>
        <XDSCheckboxList
          label="Pre-selected"
          value={value2}
          onChange={setValue2}>
          <XDSCheckboxListItem label="Email" value="email" />
          <XDSCheckboxListItem label="SMS" value="sms" />
        </XDSCheckboxList>
        <XDSCheckboxList
          label="Disabled group"
          value={['a']}
          onChange={() => {}}
          isDisabled>
          <XDSCheckboxListItem label="Option A" value="a" />
          <XDSCheckboxListItem label="Option B" value="b" />
        </XDSCheckboxList>
        <XDSCheckboxList
          label="With descriptions"
          value={value1}
          onChange={setValue1}
          hasDividers>
          <XDSCheckboxListItem
            label="Email"
            value="email"
            description="Delivered to your inbox"
          />
          <XDSCheckboxListItem
            label="SMS"
            value="sms"
            description="Standard rates apply"
          />
        </XDSCheckboxList>
        <XDSCheckboxList
          label="With error"
          value={[]}
          onChange={() => {}}
          status={{
            type: 'error',
            message: 'Please select at least one option',
          }}>
          <XDSCheckboxListItem label="Option A" value="a" />
          <XDSCheckboxListItem label="Option B" value="b" />
        </XDSCheckboxList>
        <div>
          <h4 style={{margin: '0 0 8px'}}>Standalone mode</h4>
          <XDSList>
            <XDSCheckboxListItem
              label="Accept terms"
              isChecked={standalone1}
              onCheck={setStandalone1}
            />
            <XDSCheckboxListItem
              label="Subscribe"
              isChecked={standalone2}
              onCheck={setStandalone2}
            />
          </XDSList>
        </div>
      </div>
    );
  },
};
