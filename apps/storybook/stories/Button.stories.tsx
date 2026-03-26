import type {Meta, StoryObj} from '@storybook/react';
import {XDSButton} from '@xds/core/Button';
import {XDSBadge} from '@xds/core/Badge';
import {Cog6ToothIcon, TrashIcon} from '@heroicons/react/24/outline';

const meta: Meta<typeof XDSButton> = {
  title: 'Core/XDSButton',
  component: XDSButton,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Accessible label (required)',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'destructive'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
    },
    isLoading: {
      control: 'boolean',
      description: 'Loading state',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    endContent: {
      control: false,
      description: 'Content rendered after the label (e.g. icon, badge)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSButton>;

export const Primary: Story = {
  args: {
    label: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    label: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Ghost: Story = {
  args: {
    label: 'Ghost Button',
    variant: 'ghost',
  },
};

export const Destructive: Story = {
  args: {
    label: 'Delete',
    variant: 'destructive',
  },
};

export const Loading: Story = {
  args: {
    label: 'Loading...',
    variant: 'primary',
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    variant: 'primary',
    isDisabled: true,
  },
};

export const SizeVariants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
      <XDSButton label="Small" variant="primary" size="sm" />
      <XDSButton label="Medium" variant="primary" size="md" />
      <XDSButton label="Large" variant="primary" size="lg" />
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '12px'}}>
      <XDSButton
        label="Settings"
        variant="ghost"
        icon={<Cog6ToothIcon style={{width: 16, height: 16}} />}
      />
      <XDSButton
        label="Delete"
        variant="destructive"
        icon={<TrashIcon style={{width: 16, height: 16}} />}
      />
    </div>
  ),
};

export const IconWithText: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '12px'}}>
      <XDSButton
        label="Settings"
        variant="secondary"
        icon={<Cog6ToothIcon style={{width: 16, height: 16}} />}>
        Settings
      </XDSButton>
      <XDSButton
        label="Delete"
        variant="destructive"
        icon={<TrashIcon style={{width: 16, height: 16}} />}>
        Delete
      </XDSButton>
    </div>
  ),
};

export const WithEndSlot: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
      <XDSButton
        label="Messages"
        variant="primary"
        endContent={<XDSBadge variant="info" label={3} />}
      />
      <XDSButton
        label="Notifications"
        variant="secondary"
        endContent={<XDSBadge variant="neutral" label="New" />}
      />
    </div>
  ),
};

export const IconAndEndSlot: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
      <XDSButton
        label="Settings"
        variant="secondary"
        icon={<Cog6ToothIcon style={{width: 16, height: 16}} />}
        endContent={<XDSBadge variant="info" label="New" />}>
        Settings
      </XDSButton>
      <XDSButton
        label="Delete"
        variant="destructive"
        icon={<TrashIcon style={{width: 16, height: 16}} />}
        endContent={<XDSBadge variant="error" label={5} />}>
        Delete
      </XDSButton>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '600px',
      }}>
      <div style={{display: 'flex', gap: '12px'}}>
        <XDSButton label="Primary" variant="primary" />
        <XDSButton label="Secondary" variant="secondary" />
        <XDSButton label="Ghost" variant="ghost" />
        <XDSButton label="Destructive" variant="destructive" />
      </div>
      <div style={{display: 'flex', gap: '12px'}}>
        <XDSButton label="Loading..." variant="primary" isLoading />
        <XDSButton label="Loading..." variant="secondary" isLoading />
        <XDSButton label="Loading..." variant="ghost" isLoading />
        <XDSButton label="Loading..." variant="destructive" isLoading />
      </div>
      <div style={{display: 'flex', gap: '12px'}}>
        <XDSButton label="Disabled" variant="primary" isDisabled />
        <XDSButton label="Disabled" variant="secondary" isDisabled />
        <XDSButton label="Disabled" variant="ghost" isDisabled />
        <XDSButton label="Disabled" variant="destructive" isDisabled />
      </div>
      <div style={{display: 'flex', gap: '12px'}}>
        <XDSButton
          label="Settings"
          variant="ghost"
          icon={<Cog6ToothIcon style={{width: 16, height: 16}} />}
        />
        <XDSButton
          label="Settings"
          variant="secondary"
          icon={<Cog6ToothIcon style={{width: 16, height: 16}} />}>
          Settings
        </XDSButton>
        <XDSButton
          label="Delete"
          variant="destructive"
          icon={<TrashIcon style={{width: 16, height: 16}} />}
        />
      </div>
      <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
        <XDSButton label="Small" variant="primary" size="sm" />
        <XDSButton label="Medium" variant="primary" size="md" />
        <XDSButton label="Large" variant="primary" size="lg" />
      </div>
      <div style={{display: 'flex', gap: '12px'}}>
        <XDSButton
          label="With Badge"
          variant="primary"
          endContent={<XDSBadge variant="info" label={3} />}
        />
        <XDSButton
          label="With Badge"
          variant="secondary"
          endContent={<XDSBadge variant="neutral" label="New" />}
        />
        <XDSButton
          label="Icon + Badge"
          variant="ghost"
          icon={<Cog6ToothIcon style={{width: 16, height: 16}} />}
          endContent={<XDSBadge variant="info" label={5} />}>
          Settings
        </XDSButton>
      </div>
    </div>
  ),
};

/**
 * Demonstrates button text truncation in constrained containers.
 * When a button's container is narrower than the button's natural width,
 * the label truncates with an ellipsis instead of wrapping to multiple lines.
 */
export const Truncation: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
      <div>
        <p style={{fontSize: 12, color: '#666', marginBottom: 8}}>
          200px container — label truncates with ellipsis
        </p>
        <div style={{width: 200, border: '1px dashed #ccc', padding: 4}}>
          <XDSButton
            label="A very long button label that overflows"
            variant="primary"
            icon={<Cog6ToothIcon style={{width: 16, height: 16}} />}
          />
        </div>
      </div>
      <div>
        <p style={{fontSize: 12, color: '#666', marginBottom: 8}}>
          Flex row with limited space — button shrinks gracefully
        </p>
        <div style={{display: 'flex', gap: 8, maxWidth: 320}}>
          <div style={{flex: 1, minWidth: 0}}>
            <XDSButton
              label="Submit this extremely long form action"
              variant="primary"
              xstyle={{width: '100%'}}
            />
          </div>
          <XDSButton label="Cancel" variant="secondary" />
        </div>
      </div>
      <div>
        <p style={{fontSize: 12, color: '#666', marginBottom: 8}}>
          Unconstrained — renders at natural width
        </p>
        <XDSButton
          label="A very long button label that shows fully"
          variant="primary"
          icon={<Cog6ToothIcon style={{width: 16, height: 16}} />}
        />
      </div>
    </div>
  ),
};
