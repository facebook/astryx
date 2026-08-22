// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Icon} from '@astryxdesign/core/Icon';
import {
  Squares2X2Icon,
  ListBulletIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Core/SegmentedControl',
  component: SegmentedControl,
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
    disabledMessage: {
      control: 'text',
      description:
        'Explains why the control is disabled (whole-group state, not per segment). With isDisabled, shows a tooltip on hover/keyboard focus and keeps the control focusable via aria-disabled (selection stays blocked). Use this instead of wrapping a disabled SegmentedControl in Tooltip.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

export const Default: Story = {
  args: {
    size: 'md',
    isDisabled: false,
  },
  render: args => {
    const [value, setValue] = useState('grid');
    return (
      <SegmentedControl
        value={value}
        onChange={setValue}
        label="View mode"
        size={args.size}
        isDisabled={args.isDisabled}>
        <SegmentedControlItem value="grid" label="Grid" />
        <SegmentedControlItem value="list" label="List" />
        <SegmentedControlItem value="table" label="Table" />
      </SegmentedControl>
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
      <SegmentedControl
        value={value}
        onChange={setValue}
        label="View mode"
        size={args.size}>
        <SegmentedControlItem
          value="grid"
          label="Grid"
          icon={<Icon icon={Squares2X2Icon} color="inherit" />}
        />
        <SegmentedControlItem
          value="list"
          label="List"
          icon={<Icon icon={ListBulletIcon} color="inherit" />}
        />
        <SegmentedControlItem
          value="table"
          label="Table"
          icon={<Icon icon={TableCellsIcon} color="inherit" />}
        />
      </SegmentedControl>
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
      <SegmentedControl
        value={value}
        onChange={setValue}
        label="View mode"
        size={args.size}>
        <SegmentedControlItem
          value="grid"
          label="Grid"
          isLabelHidden
          icon={<Icon icon={Squares2X2Icon} color="inherit" />}
        />
        <SegmentedControlItem
          value="list"
          label="List"
          isLabelHidden
          icon={<Icon icon={ListBulletIcon} color="inherit" />}
        />
      </SegmentedControl>
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
          <SegmentedControl
            value={value}
            onChange={setValue}
            label="Time period"
            size="sm">
            <SegmentedControlItem value="day" label="Day" />
            <SegmentedControlItem value="week" label="Week" />
            <SegmentedControlItem value="month" label="Month" />
          </SegmentedControl>
        </div>
        <div>
          <div style={{marginBottom: '8px', fontSize: '12px', color: '#666'}}>
            Medium (default)
          </div>
          <SegmentedControl
            value={value}
            onChange={setValue}
            label="Time period"
            size="md">
            <SegmentedControlItem value="day" label="Day" />
            <SegmentedControlItem value="week" label="Week" />
            <SegmentedControlItem value="month" label="Month" />
          </SegmentedControl>
        </div>
        <div>
          <div style={{marginBottom: '8px', fontSize: '12px', color: '#666'}}>
            Large
          </div>
          <SegmentedControl
            value={value}
            onChange={setValue}
            label="Time period"
            size="lg">
            <SegmentedControlItem value="day" label="Day" />
            <SegmentedControlItem value="week" label="Week" />
            <SegmentedControlItem value="month" label="Month" />
          </SegmentedControl>
        </div>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const [value, setValue] = useState('all');
    return (
      <SegmentedControl
        value={value}
        onChange={setValue}
        label="Filter"
        isDisabled>
        <SegmentedControlItem value="all" label="All" />
        <SegmentedControlItem value="active" label="Active" />
        <SegmentedControlItem value="completed" label="Completed" />
      </SegmentedControl>
    );
  },
};

export const DisabledItem: Story = {
  render: () => {
    const [value, setValue] = useState('hourly');
    return (
      <SegmentedControl
        value={value}
        onChange={setValue}
        label="Data granularity">
        <SegmentedControlItem value="hourly" label="Hourly" />
        <SegmentedControlItem value="daily" label="Daily" />
        <SegmentedControlItem value="weekly" label="Weekly" isDisabled />
      </SegmentedControl>
    );
  },
};

// Disabled with an explanation tooltip. Hover or keyboard-focus the control to
// see why it's disabled — the reason is announced to assistive tech via
// aria-describedby, and the selected segment stays focusable (selection is still
// blocked). disabledMessage applies to the whole-group disabled state. Use it
// instead of wrapping a disabled SegmentedControl in Tooltip: disabled controls
// swallow the pointer events a Tooltip wrapper needs.
export const DisabledWithMessage: Story = {
  render: () => {
    const [value, setValue] = useState('all');
    return (
      <SegmentedControl
        value={value}
        onChange={setValue}
        label="Filter"
        isDisabled
        disabledMessage="Choose a project to filter tasks">
        <SegmentedControlItem value="all" label="All" />
        <SegmentedControlItem value="active" label="Active" />
        <SegmentedControlItem value="completed" label="Completed" />
      </SegmentedControl>
    );
  },
};

// A tab strip whose counts are the point: the viewer scans them to decide where
// to go. The number is aria-hidden and countLabel names it, so the segment
// announces "Needs me, 12 sessions" rather than "Needs me 12".
export const WithCounts: Story = {
  args: {
    size: 'md',
    isDisabled: false,
  },
  render: args => {
    const [value, setValue] = useState('needs-me');
    return (
      <SegmentedControl
        value={value}
        onChange={setValue}
        label="Sessions"
        size={args.size}
        isDisabled={args.isDisabled}>
        <SegmentedControlItem
          value="needs-me"
          label="Needs me"
          count={12}
          countLabel="sessions"
        />
        <SegmentedControlItem
          value="running"
          label="Running"
          count={3}
          countLabel="sessions"
        />
        <SegmentedControlItem
          value="finished"
          label="Recently finished"
          count={148}
          countLabel="sessions"
        />
        <SegmentedControlItem
          value="archived"
          label="Archived"
          count={0}
          countLabel="sessions"
        />
      </SegmentedControl>
    );
  },
};

// Counts survive an icon-only strip: the label hides, the count does not, and
// the accessible name still carries both.
export const IconOnlyWithCounts: Story = {
  args: {
    size: 'md',
  },
  render: args => {
    const [value, setValue] = useState('grid');
    return (
      <SegmentedControl
        value={value}
        onChange={setValue}
        label="View mode"
        size={args.size}>
        <SegmentedControlItem
          value="grid"
          label="Grid"
          isLabelHidden
          icon={<Icon icon={Squares2X2Icon} color="inherit" />}
          count={24}
          countLabel="items"
        />
        <SegmentedControlItem
          value="list"
          label="List"
          isLabelHidden
          icon={<Icon icon={ListBulletIcon} color="inherit" />}
          count={8}
          countLabel="items"
        />
        <SegmentedControlItem
          value="table"
          label="Table"
          isLabelHidden
          icon={<Icon icon={TableCellsIcon} color="inherit" />}
          count={132}
          countLabel="items"
        />
      </SegmentedControl>
    );
  },
};

// layout="fill" divides the width equally; counts must not break that or the
// segments' alignment as the numbers change width.
export const CountsFillLayout: Story = {
  render: () => {
    const [value, setValue] = useState('needs-me');
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
        {[520, 380, 280].map(width => (
          <div key={width} style={{width}}>
            <SegmentedControl
              value={value}
              onChange={setValue}
              label="Sessions"
              layout="fill">
              <SegmentedControlItem
                value="needs-me"
                label="Needs me"
                count={12}
                countLabel="sessions"
              />
              <SegmentedControlItem
                value="running"
                label="Running"
                count={3}
                countLabel="sessions"
              />
              <SegmentedControlItem
                value="finished"
                label="Finished"
                count={148}
                countLabel="sessions"
              />
            </SegmentedControl>
          </div>
        ))}
      </div>
    );
  },
};
