import type {Meta, StoryObj} from '@storybook/react';
import {XDSBanner} from '@xds/core/Banner';
import {XDSButton} from '@xds/core/Button';
import {StarIcon} from '@heroicons/react/24/solid';

const meta: Meta<typeof XDSBanner> = {
  title: 'Core/XDSBanner',
  component: XDSBanner,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['info', 'warning', 'error', 'success'],
      description: 'Status type',
    },
    variant: {
      control: 'select',
      options: ['card', 'section'],
      description: 'Visual variant',
    },
    isDismissable: {
      control: 'boolean',
      description: 'Whether the banner can be dismissed',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSBanner>;

export const Default: Story = {
  args: {
    status: 'info',
    title: 'This is an informational banner',
    description: 'Here is some additional context about this message.',
  },
};

export const Statuses: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
      <XDSBanner
        status="info"
        title="Information"
        description="This is an informational message."
      />
      <XDSBanner
        status="success"
        title="Success"
        description="The operation completed successfully."
      />
      <XDSBanner
        status="warning"
        title="Warning"
        description="Please review before proceeding."
      />
      <XDSBanner
        status="error"
        title="Error"
        description="Something went wrong. Please try again."
      />
    </div>
  ),
};

export const Dismissable: Story = {
  args: {
    status: 'warning',
    title: 'Dismissable banner',
    description: 'Click the close button to dismiss this banner.',
    isDismissable: true,
  },
};

export const WithEndButton: Story = {
  args: {
    status: 'info',
    title: 'New version available',
    description: 'Version 2.0 is ready to install.',
    endButton: <XDSButton variant="secondary" size="sm" label="Update" />,
  },
};

export const CustomIcon: Story = {
  args: {
    status: 'info',
    title: 'Featured content',
    description: 'This banner uses a custom icon.',
    icon: <StarIcon width={20} height={20} />,
  },
};

export const SectionVariant: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
      <XDSBanner
        status="info"
        title="Section banner"
        description="Full-width with no border radius."
        variant="section"
      />
      <XDSBanner
        status="error"
        title="Section error"
        description="Full-width error banner."
        variant="section"
      />
    </div>
  ),
};

export const WithChildren: Story = {
  args: {
    status: 'warning',
    title: 'Action required',
    description: 'Please complete the following steps:',
    children: (
      <ul style={{margin: 0, paddingLeft: '20px'}}>
        <li>Verify your email address</li>
        <li>Complete your profile</li>
        <li>Set up two-factor authentication</li>
      </ul>
    ),
  },
};

export const TitleOnly: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
      <XDSBanner status="info" title="Simple info banner" />
      <XDSBanner status="success" title="Operation complete" />
      <XDSBanner status="warning" title="Check your settings" />
      <XDSBanner status="error" title="Connection lost" />
    </div>
  ),
};
