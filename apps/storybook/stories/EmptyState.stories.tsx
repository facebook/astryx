import type {Meta, StoryObj} from '@storybook/react';
import {XDSEmptyState} from '@xds/core/EmptyState';

const meta: Meta<typeof XDSEmptyState> = {
  title: 'Core/XDSEmptyState',
  component: XDSEmptyState,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Primary message',
    },
    description: {
      control: 'text',
      description: 'Optional secondary text',
    },
    isCompact: {
      control: 'boolean',
      description: 'Compact variant with reduced spacing',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSEmptyState>;

export const Default: Story = {
  args: {
    title: 'No results found',
    description: 'Try adjusting your search or filters to find what you need.',
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'Nothing here yet',
  },
};

export const WithIcon: Story = {
  args: {
    icon: <span style={{fontSize: '48px'}}>📭</span>,
    title: 'No messages',
    description: "You're all caught up!",
  },
};

export const WithActions: Story = {
  args: {
    icon: <span style={{fontSize: '48px'}}>🔍</span>,
    title: 'No results found',
    description: 'Try adjusting your search or filters.',
    actions: (
      <>
        <button>Clear filters</button>
        <button>Go back</button>
      </>
    ),
  },
};

export const Compact: Story = {
  args: {
    icon: <span style={{fontSize: '32px'}}>📋</span>,
    title: 'No items',
    description: 'Nothing to show here.',
    isCompact: true,
  },
};

export const CompactWithActions: Story = {
  args: {
    title: 'No data',
    description: 'Add some data to get started.',
    actions: (
      <>
        <button>Add item</button>
        <button>Import</button>
      </>
    ),
    isCompact: true,
  },
};

export const FullExample: Story = {
  render: () => (
    <div
      style={{
        border: '1px dashed #ccc',
        borderRadius: '12px',
        maxWidth: '480px',
      }}>
      <XDSEmptyState
        icon={<span style={{fontSize: '48px'}}>📬</span>}
        title="No notifications"
        description="When you receive notifications, they will appear here. Check back later!"
        actions={
          <>
            <button>Refresh</button>
            <button>Settings</button>
          </>
        }
      />
    </div>
  ),
};
