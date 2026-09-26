// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
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
    elevation: {
      control: 'inline-radio',
      options: ['none', 'low', 'med', 'high'],
      description: 'Resting shadow depth (for a floating banner)',
    },
    isDismissable: {
      control: 'boolean',
      description:
        'Whether the banner can be dismissed (manages its own hidden state)',
    },
    collapsible: {
      control: 'boolean',
      description:
        'Whether the content area sits behind an expand/collapse toggle. On by default, starting collapsed. false keeps children always visible with no toggle; pass {defaultIsOpen: true} to start open, or {isOpen, onOpenChange} for controlled.',
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

export const Floating: Story = {
  args: {
    status: 'info',
    title: 'This banner floats above content.',
    description: 'A raised banner draws attention as an overlay.',
    elevation: 'med',
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
          padding: '40px',
          textAlign: 'center',
          color: 'var(--color-text-secondary)',
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
    collapsible: {defaultIsOpen: true},
    endContent: <Button label="Button" variant="secondary" size="sm" />,
    isDismissable: true,
    children: (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          color: 'var(--color-text-secondary)',
        }}>
        Flex Slot
      </div>
    ),
  },
};

export const AlwaysVisibleContent: Story = {
  name: 'Content Always Visible (collapsible={false})',
  args: {
    status: 'error',
    title: 'Multiple errors found',
    description: 'The following issues need to be resolved:',
    collapsible: false,
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
    collapsible: {defaultIsOpen: true},
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
        endContent={<Button label="Learn more" variant="secondary" size="sm" />}
      />
      <Banner
        status="error"
        title="With content, always visible"
        description="collapsible={false} drops the toggle."
        isDismissable
        collapsible={false}>
        <div style={{fontSize: '13px'}}>
          The content sits on a card-colored background, visually distinct from
          the status header above.
        </div>
      </Banner>
      <Banner
        status="error"
        title="With collapsible content"
        description="Click the chevron to expand. This is the default."
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
        collapsible={{
          defaultIsOpen: true,
        }}
        isDismissable>
        <div style={{fontSize: '13px'}}>
          Content is visible immediately because of defaultIsOpen.
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

export const LongText: Story = {
  name: 'Overflow (long text and a long word)',
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
      <Banner
        status="error"
        title="Your subscription payment could not be processed because the card on file has expired"
        description="Update the payment method in billing settings to restore access to every workspace on this account before the grace period ends."
        isDismissable
      />
      <Banner
        status="warning"
        title="Pneumonoultramicroscopicsilicovolcanoconiosisdiagnosisunavailable"
        description="Verkehrsinfrastrukturfinanzierungsgesellschaftsvorstandsvorsitzender"
        isDismissable
      />
    </div>
  ),
};

export const NarrowContainer: Story = {
  name: 'Narrow container (240px)',
  render: () => (
    <div style={{width: '240px'}}>
      <Banner
        status="info"
        title="Storage almost full"
        description="Free up space or upgrade your plan to keep syncing."
        isDismissable
      />
    </div>
  ),
};

export const EmptySlots: Story = {
  name: 'Empty slots (falsy children and description)',
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
      <Banner status="info" title="No expand affordance" description="">
        {false}
      </Banner>
      <Banner status="success" title="Title only" />
    </div>
  ),
};

export const MultipleActionsNarrow: Story = {
  name: 'Multiple actions (narrow viewport)',
  render: () => (
    <Banner
      status="warning"
      title="A compute node is required"
      description="Attach one of the announcing compute nodes to continue this session."
      endContent={
        <>
          <Button label="Attach od-1234" variant="secondary" size="sm" />
          <Button label="Attach od-9999" variant="secondary" size="sm" />
          <Button label="Provision new" variant="secondary" size="sm" />
        </>
      }
      isDismissable
    />
  ),
};
