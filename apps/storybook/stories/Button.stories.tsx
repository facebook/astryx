// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {Button} from '@astryxdesign/core/Button';
import {Badge} from '@astryxdesign/core/Badge';
import {Cog6ToothIcon, TrashIcon} from '@heroicons/react/24/outline';

const buttonStoryStyles = stylex.create({
  fullWidth: {
    width: '100%',
  },
});

const meta: Meta<typeof Button> = {
  title: 'Core/Button',
  component: Button,
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
type Story = StoryObj<typeof Button>;

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
      <Button label="Small" variant="primary" size="sm" />
      <Button label="Medium" variant="primary" size="md" />
      <Button label="Large" variant="primary" size="lg" />
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '12px'}}>
      <Button
        label="Settings"
        variant="ghost"
        icon={<Cog6ToothIcon style={{width: 16, height: 16}} />}
        isIconOnly
      />
      <Button
        label="Delete"
        variant="destructive"
        icon={<TrashIcon style={{width: 16, height: 16}} />}
        isIconOnly
      />
    </div>
  ),
};

export const IconWithText: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '12px'}}>
      <Button
        label="Settings"
        variant="secondary"
        icon={<Cog6ToothIcon style={{width: 16, height: 16}} />}
      />
      <Button
        label="Delete"
        variant="destructive"
        icon={<TrashIcon style={{width: 16, height: 16}} />}
      />
    </div>
  ),
};

export const WithEndSlot: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
      <Button
        label="Messages"
        variant="primary"
        endContent={<Badge variant="info" label={3} />}
      />
      <Button
        label="Notifications"
        variant="secondary"
        endContent={<Badge variant="neutral" label="New" />}
      />
    </div>
  ),
};

export const IconAndEndSlot: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
      <Button
        label="Settings"
        variant="secondary"
        icon={<Cog6ToothIcon style={{width: 16, height: 16}} />}
        endContent={<Badge variant="info" label="New" />}
      />
      <Button
        label="Delete"
        variant="destructive"
        icon={<TrashIcon style={{width: 16, height: 16}} />}
        endContent={<Badge variant="error" label={5} />}
      />
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
        <Button label="Primary" variant="primary" />
        <Button label="Secondary" variant="secondary" />
        <Button label="Ghost" variant="ghost" />
        <Button label="Destructive" variant="destructive" />
      </div>
      <div style={{display: 'flex', gap: '12px'}}>
        <Button label="Loading..." variant="primary" isLoading />
        <Button label="Loading..." variant="secondary" isLoading />
        <Button label="Loading..." variant="ghost" isLoading />
        <Button label="Loading..." variant="destructive" isLoading />
      </div>
      <div style={{display: 'flex', gap: '12px'}}>
        <Button label="Disabled" variant="primary" isDisabled />
        <Button label="Disabled" variant="secondary" isDisabled />
        <Button label="Disabled" variant="ghost" isDisabled />
        <Button label="Disabled" variant="destructive" isDisabled />
      </div>
      <div style={{display: 'flex', gap: '12px'}}>
        <Button
          label="Settings"
          variant="ghost"
          icon={<Cog6ToothIcon style={{width: 16, height: 16}} />}
          isIconOnly
        />
        <Button
          label="Settings"
          variant="secondary"
          icon={<Cog6ToothIcon style={{width: 16, height: 16}} />}
        />
        <Button
          label="Delete"
          variant="destructive"
          icon={<TrashIcon style={{width: 16, height: 16}} />}
          isIconOnly
        />
      </div>
      <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
        <Button label="Small" variant="primary" size="sm" />
        <Button label="Medium" variant="primary" size="md" />
        <Button label="Large" variant="primary" size="lg" />
      </div>
      <div style={{display: 'flex', gap: '12px'}}>
        <Button
          label="With Badge"
          variant="primary"
          endContent={<Badge variant="info" label={3} />}
        />
        <Button
          label="With Badge"
          variant="secondary"
          endContent={<Badge variant="neutral" label="New" />}
        />
        <Button
          label="Icon + Badge"
          variant="ghost"
          icon={<Cog6ToothIcon style={{width: 16, height: 16}} />}
          endContent={<Badge variant="info" label={5} />}>
          Settings
        </Button>
      </div>
    </div>
  ),
};

/**
 * Demonstrates button rendering as a link when `href` is provided.
 * Right-click to verify native browser link context menu (open in new tab, etc.).
 * Disabled state falls back to `<button>` — disabled links are an a11y anti-pattern.
 */
export const LinkButton: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
      <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
        <Button
          label="Visit Example"
          href="https://example.com"
          variant="primary"
        />
        <Button
          label="Open in new tab"
          href="https://example.com"
          target="_blank"
          rel="noopener noreferrer"
          variant="secondary"
        />
        <Button label="Ghost link" href="https://example.com" variant="ghost" />
      </div>
      <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
        <Button
          label="Disabled link"
          href="https://example.com"
          variant="primary"
          isDisabled
        />
        <Button
          label="Loading link"
          href="https://example.com"
          variant="primary"
          isLoading
        />
      </div>
      <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
        <Button
          label="Settings"
          href="https://example.com"
          variant="secondary"
          icon={<Cog6ToothIcon style={{width: 16, height: 16}} />}
        />
        <Button
          label="Icon-only link"
          href="https://example.com"
          variant="ghost"
          icon={<Cog6ToothIcon style={{width: 16, height: 16}} />}
          isIconOnly
        />
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
          <Button
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
            <Button
              label="Submit this extremely long form action"
              variant="primary"
              xstyle={buttonStoryStyles.fullWidth}
            />
          </div>
          <Button label="Cancel" variant="secondary" />
        </div>
      </div>
      <div>
        <p style={{fontSize: 12, color: '#666', marginBottom: 8}}>
          Unconstrained — renders at natural width
        </p>
        <Button
          label="A very long button label that shows fully"
          variant="primary"
          icon={<Cog6ToothIcon style={{width: 16, height: 16}} />}
        />
      </div>
    </div>
  ),
};
