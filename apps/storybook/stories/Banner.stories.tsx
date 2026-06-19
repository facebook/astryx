// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {Banner} from '@xds/core/Banner';
import {Button} from '@xds/core/Button';
import {Icon} from '@xds/core/Icon';
import {ShieldCheckIcon} from '@heroicons/react/24/solid';

const meta: Meta<typeof Banner> = {
  title: 'Core/Banner',
  component: Banner,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['info', 'warning', 'error', 'success'],
      description: 'Status type controlling icon and color',
    },
    container: {
      control: 'select',
      options: ['card', 'section'],
      description: 'Container type',
    },
    isDismissable: {
      control: 'boolean',
      description:
        'Whether the banner can be dismissed (manages its own hidden state)',
    },
    defaultIsExpanded: {
      control: 'boolean',
      description:
        'Whether the content area starts expanded (only relevant when children are provided)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Banner>;

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
    endContent: <Button label="Update now" variant="primary" size="sm" />,
  },
};

export const Dismissable: Story = {
  args: {
    status: 'warning',
    title: 'Your session will expire soon.',
    description: 'Please save your work to avoid losing changes.',
    isDismissable: true,
  },
};

export const DismissableWithCallback: Story = {
  args: {
    status: 'info',
    title: 'This banner dismisses itself and calls onDismiss.',
    isDismissable: true,
    onDismiss: () => console.log('Dismissed!'),
  },
};

export const SectionVariant: Story = {
  args: {
    status: 'info',
    title: 'System maintenance scheduled',
    description:
      'The system will be undergoing maintenance on Saturday from 2:00 AM to 6:00 AM UTC.',
    container: 'section',
  },
};

export const CollapsibleContent: Story = {
  name: 'Collapsible Content (Collapsed)',
  args: {
    status: 'info',
    title: 'Emphasized Text',
    description: 'Description text',
    endContent: <Button label="Button" variant="secondary" size="sm" />,
    isDismissable: true,
    children: (
      <div
        style={{
          fontSize: '13px',
          padding: '40px',
          textAlign: 'center',
          color: '#999',
        }}>
        Flex Slot
      </div>
    ),
  },
};

export const CollapsibleContentExpanded: Story = {
  name: 'Collapsible Content (Expanded)',
  args: {
    status: 'info',
    title: 'Emphasized Text',
    description: 'Description text',
    defaultIsExpanded: true,
    endContent: <Button label="Button" variant="secondary" size="sm" />,
    isDismissable: true,
    children: (
      <div
        style={{
          fontSize: '13px',
          padding: '40px',
          textAlign: 'center',
          color: '#999',
        }}>
        Flex Slot
      </div>
    ),
  },
};

export const WithContentArea: Story = {
  name: 'With Content Area (Card Background)',
  args: {
    status: 'error',
    title: 'Multiple errors found',
    description: 'The following issues need to be resolved:',
    defaultIsExpanded: true,
    children: (
      <ul style={{margin: 0, paddingInlineStart: '20px', fontSize: '13px'}}>
        <li>Email address is invalid</li>
        <li>Password must be at least 8 characters</li>
        <li>Username is already taken</li>
      </ul>
    ),
  },
};

export const ContentAreaWithAction: Story = {
  name: 'Content Area + Action Button',
  args: {
    status: 'warning',
    title: 'Configuration changes detected',
    description: 'Review the changes before they take effect.',
    endContent: <Button label="Review" variant="secondary" size="sm" />,
    isDismissable: true,
    defaultIsExpanded: true,
    children: (
      <div style={{fontSize: '13px'}}>
        <p style={{margin: '0 0 8px'}}>Changed settings:</p>
        <ul style={{margin: 0, paddingInlineStart: '20px'}}>
          <li>Authentication method updated</li>
          <li>Rate limits modified</li>
        </ul>
      </div>
    ),
  },
};

export const AllStatuses: Story = {
  name: 'All Status Variants',
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
      <Banner status="info" title="Info banner" />
      <Banner status="warning" title="Warning banner" />
      <Banner status="error" title="Error banner" />
      <Banner status="success" title="Success banner" />
    </div>
  ),
};

export const AllFeatures: Story = {
  name: 'All Features Combined',
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
      <Banner
        status="info"
        title="Simple banner"
        description="Just the colored header area."
      />
      <Banner
        status="info"
        title="With custom icon"
        icon={<Icon icon={ShieldCheckIcon} size="md" color="accent" />}
      />
      <Banner
        status="warning"
        title="Dismissable"
        description="Click the X to dismiss. Works without onDismiss."
        isDismissable
      />
      <Banner
        status="info"
        title="With action button"
        endContent={
          <Button label="Learn more" variant="secondary" size="sm" />
        }
      />
      <Banner
        status="error"
        title="With collapsible content"
        description="Click the chevron to expand."
        isDismissable>
        <div style={{fontSize: '13px'}}>
          This content sits on a card-colored background, visually distinct from
          the status header above.
        </div>
      </Banner>
      <Banner
        status="success"
        title="Expanded by default"
        description="This content area starts open."
        defaultIsExpanded
        isDismissable>
        <div style={{fontSize: '13px'}}>
          Content is visible immediately because defaultIsExpanded is true.
        </div>
      </Banner>
      <Banner
        status="error"
        title="Section container"
        description="Full-width with no border-radius."
        container="section"
      />
    </div>
  ),
};
