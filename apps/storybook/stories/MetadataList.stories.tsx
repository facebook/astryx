import type {Meta, StoryObj} from '@storybook/react';
import {XDSMetadataList, XDSMetadataListItem} from '@xds/core/MetadataList';
import {XDSIcon} from '@xds/core/Icon';
import {XDSToken} from '@xds/core/Token';
import {
  InformationCircleIcon,
  CalendarIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

const meta: Meta<typeof XDSMetadataList> = {
  title: 'Core/XDSMetadataList',
  component: XDSMetadataList,
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: 'select',
      options: ['single', 'multi', 2, 3],
      description: 'Column layout mode',
    },
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
      description: 'Layout orientation',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSMetadataList>;

export const Basic: Story = {
  render: args => (
    <XDSMetadataList {...args}>
      <XDSMetadataListItem label="Name">XDSMetadataList</XDSMetadataListItem>
      <XDSMetadataListItem label="Status">Active</XDSMetadataListItem>
      <XDSMetadataListItem label="Owner">Joey</XDSMetadataListItem>
    </XDSMetadataList>
  ),
};

export const MultiColumn: Story = {
  render: args => (
    <XDSMetadataList columns="multi" {...args}>
      <XDSMetadataListItem label="Name">XDSMetadataList</XDSMetadataListItem>
      <XDSMetadataListItem label="Status">Active</XDSMetadataListItem>
      <XDSMetadataListItem label="Owner">Joey</XDSMetadataListItem>
      <XDSMetadataListItem label="Created">Jan 15, 2026</XDSMetadataListItem>
      <XDSMetadataListItem label="Tags">
        <span style={{display: 'flex', gap: 4}}>
          <XDSToken label="component" />
          <XDSToken label="xds" />
        </span>
      </XDSMetadataListItem>
      <XDSMetadataListItem label="Priority">Tier 1</XDSMetadataListItem>
    </XDSMetadataList>
  ),
};

export const WithTitle: Story = {
  render: args => (
    <XDSMetadataList
      title={<strong>Component Details</strong>}
      columns="multi"
      {...args}>
      <XDSMetadataListItem label="Name">XDSMetadataList</XDSMetadataListItem>
      <XDSMetadataListItem label="Status">Active</XDSMetadataListItem>
      <XDSMetadataListItem label="Owner">Joey</XDSMetadataListItem>
      <XDSMetadataListItem label="Created">Jan 15, 2026</XDSMetadataListItem>
    </XDSMetadataList>
  ),
};

export const Horizontal: Story = {
  render: args => (
    <XDSMetadataList orientation="horizontal" {...args}>
      <XDSMetadataListItem label="Status">Active</XDSMetadataListItem>
      <XDSMetadataListItem label="Type">Premium</XDSMetadataListItem>
      <XDSMetadataListItem label="Owner">Joey</XDSMetadataListItem>
      <XDSMetadataListItem label="Created">Jan 15, 2026</XDSMetadataListItem>
    </XDSMetadataList>
  ),
};

export const StackedLabelsSingleColumn: Story = {
  render: args => (
    <XDSMetadataList label={{position: 'top'}} {...args}>
      <XDSMetadataListItem label="Name">XDSMetadataList</XDSMetadataListItem>
      <XDSMetadataListItem label="Status">Active</XDSMetadataListItem>
      <XDSMetadataListItem label="Owner">Joey</XDSMetadataListItem>
      <XDSMetadataListItem label="Tags">
        <span style={{display: 'flex', gap: 4}}>
          <XDSToken label="component" />
          <XDSToken label="xds" />
        </span>
      </XDSMetadataListItem>
    </XDSMetadataList>
  ),
};

export const ShowMore: Story = {
  render: args => (
    <XDSMetadataList maxNumOfItems={3} {...args}>
      <XDSMetadataListItem label="Name">XDSMetadataList</XDSMetadataListItem>
      <XDSMetadataListItem label="Status">Active</XDSMetadataListItem>
      <XDSMetadataListItem label="Owner">Joey</XDSMetadataListItem>
      <XDSMetadataListItem label="Created">Jan 15, 2026</XDSMetadataListItem>
      <XDSMetadataListItem label="Updated">Mar 26, 2026</XDSMetadataListItem>
      <XDSMetadataListItem label="Priority">Tier 1</XDSMetadataListItem>
    </XDSMetadataList>
  ),
};

export const TwoColumns: Story = {
  render: args => (
    <XDSMetadataList columns={2} {...args}>
      <XDSMetadataListItem label="Name">XDSMetadataList</XDSMetadataListItem>
      <XDSMetadataListItem label="Status">Active</XDSMetadataListItem>
      <XDSMetadataListItem label="Owner">Joey</XDSMetadataListItem>
      <XDSMetadataListItem label="Priority">Tier 1</XDSMetadataListItem>
    </XDSMetadataList>
  ),
};

export const CustomLabelWidth: Story = {
  render: args => (
    <XDSMetadataList label={{position: 'start', width: 200}} {...args}>
      <XDSMetadataListItem label="Full Name">
        XDSMetadataList Component
      </XDSMetadataListItem>
      <XDSMetadataListItem label="Current Status">Active</XDSMetadataListItem>
      <XDSMetadataListItem label="Primary Owner">Joey</XDSMetadataListItem>
    </XDSMetadataList>
  ),
};

export const MultiColumnSideLabels: Story = {
  render: args => (
    <XDSMetadataList columns="multi" label={{position: 'start'}} {...args}>
      <XDSMetadataListItem label="Name">XDSMetadataList</XDSMetadataListItem>
      <XDSMetadataListItem label="Status">Active</XDSMetadataListItem>
      <XDSMetadataListItem label="Owner">Joey</XDSMetadataListItem>
      <XDSMetadataListItem label="Created">Jan 15, 2026</XDSMetadataListItem>
    </XDSMetadataList>
  ),
};

export const WithIcons: Story = {
  render: args => (
    <XDSMetadataList columns="multi" {...args}>
      <XDSMetadataListItem
        label="Information"
        icon={<XDSIcon icon={InformationCircleIcon} size="sm" />}>
        Important details about this component
      </XDSMetadataListItem>
      <XDSMetadataListItem
        label="Created"
        icon={<XDSIcon icon={CalendarIcon} size="sm" />}>
        January 1, 2023
      </XDSMetadataListItem>
      <XDSMetadataListItem
        label="Tags"
        icon={<XDSIcon icon={TagIcon} size="sm" />}>
        <span style={{display: 'flex', gap: 4}}>
          <XDSToken label="component" />
          <XDSToken label="xds" />
        </span>
      </XDSMetadataListItem>
    </XDSMetadataList>
  ),
};
