import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';
import {XDSIcon} from '@xds/core/Icon';
import {
  Squares2X2Icon,
  ListBulletIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';

const meta: Meta<typeof XDSSegmentedControl> = {
  title: 'Inputs/XDSSegmentedControl',
  component: XDSSegmentedControl,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant for the control',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Whether the entire control is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSSegmentedControl>;

export const Default: Story = {
  args: {
    size: 'md',
    isDisabled: false,
  },
  render: args => {
    const [value, setValue] = useState('grid');
    return (
      <XDSSegmentedControl
        value={value}
        onChange={setValue}
        label="View mode"
        size={args.size}
        isDisabled={args.isDisabled}>
        <XDSSegmentedControlItem value="grid" label="Grid" />
        <XDSSegmentedControlItem value="list" label="List" />
        <XDSSegmentedControlItem value="table" label="Table" />
      </XDSSegmentedControl>
    );
  },
};

export const WithIcons: Story = {
  args: {
    size: 'md',
  },
  render: args => {
    const [value, setValue] = useState('grid');
    return (
      <XDSSegmentedControl
        value={value}
        onChange={setValue}
        label="View mode"
        size={args.size}>
        <XDSSegmentedControlItem
          value="grid"
          label="Grid"
          icon={<XDSIcon icon={Squares2X2Icon} color="inherit" />}
        />
        <XDSSegmentedControlItem
          value="list"
          label="List"
          icon={<XDSIcon icon={ListBulletIcon} color="inherit" />}
        />
        <XDSSegmentedControlItem
          value="table"
          label="Table"
          icon={<XDSIcon icon={TableCellsIcon} color="inherit" />}
        />
      </XDSSegmentedControl>
    );
  },
};

export const IconOnly: Story = {
  args: {
    size: 'sm',
  },
  render: args => {
    const [value, setValue] = useState('grid');
    return (
      <XDSSegmentedControl
        value={value}
        onChange={setValue}
        label="View mode"
        size={args.size}>
        <XDSSegmentedControlItem
          value="grid"
          label="Grid"
          isLabelHidden
          icon={<XDSIcon icon={Squares2X2Icon} color="inherit" />}
        />
        <XDSSegmentedControlItem
          value="list"
          label="List"
          isLabelHidden
          icon={<XDSIcon icon={ListBulletIcon} color="inherit" />}
        />
      </XDSSegmentedControl>
    );
  },
};

export const SizeVariants: Story = {
  render: () => {
    const [value, setValue] = useState('day');
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
        <div>
          <div style={{marginBottom: '8px', fontSize: '12px', color: '#666'}}>
            Small
          </div>
          <XDSSegmentedControl
            value={value}
            onChange={setValue}
            label="Time period"
            size="sm">
            <XDSSegmentedControlItem value="day" label="Day" />
            <XDSSegmentedControlItem value="week" label="Week" />
            <XDSSegmentedControlItem value="month" label="Month" />
          </XDSSegmentedControl>
        </div>
        <div>
          <div style={{marginBottom: '8px', fontSize: '12px', color: '#666'}}>
            Medium (default)
          </div>
          <XDSSegmentedControl
            value={value}
            onChange={setValue}
            label="Time period"
            size="md">
            <XDSSegmentedControlItem value="day" label="Day" />
            <XDSSegmentedControlItem value="week" label="Week" />
            <XDSSegmentedControlItem value="month" label="Month" />
          </XDSSegmentedControl>
        </div>
        <div>
          <div style={{marginBottom: '8px', fontSize: '12px', color: '#666'}}>
            Large
          </div>
          <XDSSegmentedControl
            value={value}
            onChange={setValue}
            label="Time period"
            size="lg">
            <XDSSegmentedControlItem value="day" label="Day" />
            <XDSSegmentedControlItem value="week" label="Week" />
            <XDSSegmentedControlItem value="month" label="Month" />
          </XDSSegmentedControl>
        </div>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const [value, setValue] = useState('all');
    return (
      <XDSSegmentedControl
        value={value}
        onChange={setValue}
        label="Filter"
        isDisabled>
        <XDSSegmentedControlItem value="all" label="All" />
        <XDSSegmentedControlItem value="active" label="Active" />
        <XDSSegmentedControlItem value="completed" label="Completed" />
      </XDSSegmentedControl>
    );
  },
};

export const DisabledItem: Story = {
  render: () => {
    const [value, setValue] = useState('hourly');
    return (
      <XDSSegmentedControl
        value={value}
        onChange={setValue}
        label="Data granularity">
        <XDSSegmentedControlItem value="hourly" label="Hourly" />
        <XDSSegmentedControlItem value="daily" label="Daily" />
        <XDSSegmentedControlItem value="weekly" label="Weekly" isDisabled />
      </XDSSegmentedControl>
    );
  },
};
