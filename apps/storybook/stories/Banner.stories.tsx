import type {Meta, StoryObj} from '@storybook/react';
import {XDSBanner} from '@xds/core/Banner';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {ShieldCheckIcon} from '@heroicons/react/24/solid';

const meta: Meta<typeof XDSBanner> = {
  title: 'Core/XDSBanner',
  component: XDSBanner,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['info', 'warning', 'error', 'success'],
      description: 'Status type controlling icon and color',
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

export const Info: Story = {
  args: {
    status: 'info',
    title: 'A new software update is available.',
  },
};

export const Warning: Story = {
  args: {
    status: 'warning',
    title: 'Your trial expires in 3 days.',
  },
};

export const Error: Story = {
  args: {
    status: 'error',
    title: 'There was an error processing your request.',
  },
};

export const Success: Story = {
  args: {
    status: 'success',
    title: 'Your changes have been saved successfully.',
  },
};

export const WithDescription: Story = {
  args: {
    status: 'info',
    title: 'New update available',
    description:
      'A new version of the application is available. Update now to get the latest features and improvements.',
  },
};

export const WithEndButton: Story = {
  args: {
    status: 'info',
    title: 'New update available',
    description: 'Version 2.0 is ready to install.',
    endButton: <XDSButton label="Update now" variant="primary" size="sm" />,
  },
};

export const Dismissable: Story = {
  args: {
    status: 'warning',
    title: 'Your session will expire soon.',
    description: 'Please save your work to avoid losing changes.',
    isDismissable: true,
    onDismiss: () => alert('Dismissed!'),
  },
};

export const SectionVariant: Story = {
  args: {
    status: 'info',
    title: 'System maintenance scheduled',
    description:
      'The system will be undergoing maintenance on Saturday from 2:00 AM to 6:00 AM UTC.',
    variant: 'section',
  },
};

export const WithChildren: Story = {
  args: {
    status: 'error',
    title: 'Multiple errors found',
    description: 'The following issues need to be resolved:',
    children: (
      <ul style={{margin: 0, paddingInlineStart: '20px', fontSize: '13px'}}>
        <li>Email address is invalid</li>
        <li>Password must be at least 8 characters</li>
        <li>Username is already taken</li>
      </ul>
    ),
  },
};

export const AllVariations: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
      <XDSBanner status="info" title="Info banner" />
      <XDSBanner status="warning" title="Warning banner" />
      <XDSBanner status="error" title="Error banner" />
      <XDSBanner status="success" title="Success banner" />
      <XDSBanner
        status="info"
        title="With description"
        description="This is a description with more details."
      />
      <XDSBanner
        status="info"
        title="With custom icon"
        icon={<XDSIcon icon={ShieldCheckIcon} size="md" color="accent" />}
      />
      <XDSBanner
        status="warning"
        title="Dismissable"
        isDismissable
        onDismiss={() => {}}
      />
      <XDSBanner
        status="info"
        title="With end button"
        endButton={
          <XDSButton label="Learn more" variant="secondary" size="sm" />
        }
      />
      <XDSBanner
        status="error"
        title="Section variant"
        description="Full-width with no border-radius."
        variant="section"
      />
    </div>
  ),
};
