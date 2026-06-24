// Copyright (c) Meta Platforms, Inc. and affiliates.

import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Popover} from '@astryxdesign/core/Popover';
import type {PopoverTriggerRenderProps} from '@astryxdesign/core/Popover';
import {Button} from '@astryxdesign/core/Button';
import {Token} from '@astryxdesign/core/Token';
import {Link} from '@astryxdesign/core/Link';
import {VStack, HStack} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Switch} from '@astryxdesign/core/Switch';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Divider} from '@astryxdesign/core/Divider';

const meta: Meta<typeof Popover> = {
  title: 'Core/Popover',
  component: Popover,
  tags: ['autodocs'],
  argTypes: {
    placement: {
      control: 'select',
      options: ['above', 'below', 'start', 'end'],
      description: 'Position relative to trigger',
    },
    alignment: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: 'Alignment on placement axis',
    },
    isEnabled: {
      control: 'boolean',
      description: 'Enable/disable the popover',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Popover>;

// =============================================================================
// Settings Panel
// =============================================================================

function SettingsContent() {
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [sounds, setSounds] = React.useState(true);

  return (
    <VStack gap={3}>
      <Heading level={4} tabIndex={-1}>
        Settings
      </Heading>
      <Divider />
      <Switch
        label="Notifications"
        description="Receive push notifications"
        value={notifications}
        onChange={setNotifications}
      />
      <Switch
        label="Dark mode"
        description="Use dark color theme"
        value={darkMode}
        onChange={setDarkMode}
      />
      <Switch
        label="Sounds"
        description="Play sounds for actions"
        value={sounds}
        onChange={setSounds}
      />
    </VStack>
  );
}

export const Default: Story = {
  args: {
    placement: 'below',
    label: 'Settings',
    width: 280,
    content: <SettingsContent />,
    children: <Button label="Settings">Settings</Button>,
  },
};

// =============================================================================
// Filter Panel
// =============================================================================

function FilterContent({onApply}: {onApply?: () => void}) {
  const [filters, setFilters] = React.useState({
    active: true,
    archived: false,
    drafts: true,
    shared: false,
  });

  const toggle = (key: keyof typeof filters) =>
    setFilters(prev => ({...prev, [key]: !prev[key]}));

  return (
    <VStack gap={3}>
      <Heading level={4} tabIndex={-1}>
        Filter by status
      </Heading>
      <Divider />
      <CheckboxInput
        label="Active"
        value={filters.active}
        onChange={() => toggle('active')}
      />
      <CheckboxInput
        label="Archived"
        value={filters.archived}
        onChange={() => toggle('archived')}
      />
      <CheckboxInput
        label="Drafts"
        value={filters.drafts}
        onChange={() => toggle('drafts')}
      />
      <CheckboxInput
        label="Shared with me"
        value={filters.shared}
        onChange={() => toggle('shared')}
      />
      <Divider />
      <HStack gap={2} hAlign="end">
        <Button label="Apply" variant="primary" onClick={onApply}>
          Apply
        </Button>
        <Button
          label="Reset"
          variant="ghost"
          onClick={() =>
            setFilters({
              active: true,
              archived: false,
              drafts: true,
              shared: false,
            })
          }>
          Reset
        </Button>
      </HStack>
    </VStack>
  );
}

export const FilterPanel: Story = {
  render: function FilterPanelStory() {
    const [isOpen, setIsOpen] = React.useState(false);
    return (
      <Popover
        placement="below"
        label="Filter"
        width={240}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        content={<FilterContent onApply={() => setIsOpen(false)} />}>
        <Button label="Filter">Filter</Button>
      </Popover>
    );
  },
};

// =============================================================================
// Confirmation
// =============================================================================

function ConfirmContent({
  onConfirm,
  onCancel,
}: {
  onConfirm?: () => void;
  onCancel?: () => void;
}) {
  return (
    <VStack gap={3}>
      <Heading level={4} tabIndex={-1}>
        Delete project?
      </Heading>
      <Text type="body">
        This will permanently delete the project and all its data. This action
        cannot be undone.
      </Text>
      <HStack gap={2} hAlign="end">
        <Button label="Delete" variant="destructive" onClick={onConfirm}>
          Delete
        </Button>
        <Button label="Cancel" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </HStack>
    </VStack>
  );
}

export const Confirmation: Story = {
  render: function ConfirmationStory() {
    const [isOpen, setIsOpen] = React.useState(false);
    return (
      <Popover
        placement="below"
        label="Confirm deletion"
        width={300}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        content={
          <ConfirmContent
            onConfirm={() => setIsOpen(false)}
            onCancel={() => setIsOpen(false)}
          />
        }>
        <Button label="Delete project" variant="destructive">
          Delete project
        </Button>
      </Popover>
    );
  },
};

// =============================================================================
// Sibling Mode (anchorRef)
// =============================================================================

export const AnchorRef: Story = {
  render: function AnchorRefStory() {
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    return (
      <>
        <Button ref={buttonRef} label="Anchor button">
          Anchor button
        </Button>
        <Popover
          anchorRef={buttonRef as React.RefObject<HTMLElement>}
          label="Sibling popover"
          width={260}
          placement="below"
          content={
            <VStack gap={2}>
              <Heading level={4} tabIndex={-1}>
                Sibling mode
              </Heading>
              <Text type="body">
                This popover uses anchorRef to attach to the button as a
                sibling, without wrapping it.
              </Text>
            </VStack>
          }
        />
      </>
    );
  },
};

// =============================================================================
// Placement: Above
// =============================================================================

export const Above: Story = {
  render: () => (
    <div style={{paddingTop: 200}}>
      <Popover
        placement="above"
        label="Info"
        width={260}
        content={
          <VStack gap={2}>
            <Heading level={4} tabIndex={-1}>
              Keyboard shortcuts
            </Heading>
            <Divider />
            <HStack gap={3}>
              <Text type="body" weight="bold">
                ⌘K
              </Text>
              <Text type="body">Command palette</Text>
            </HStack>
            <HStack gap={3}>
              <Text type="body" weight="bold">
                ⌘/
              </Text>
              <Text type="body">Toggle sidebar</Text>
            </HStack>
            <HStack gap={3}>
              <Text type="body" weight="bold">
                ⌘.
              </Text>
              <Text type="body">Quick actions</Text>
            </HStack>
          </VStack>
        }>
        <Button label="Shortcuts">Shortcuts</Button>
      </Popover>
    </div>
  ),
};

// =============================================================================
// Disabled
// =============================================================================

export const Disabled: Story = {
  args: {
    placement: 'below',
    label: 'Disabled popover',
    isEnabled: false,
    content: <Text type="body">This should not appear.</Text>,
    children: <Button label="Disabled popover">Disabled</Button>,
  },
};

// =============================================================================
// Token as Popover Trigger (via InteractiveRoleContext)
// =============================================================================

export const TokenTrigger: Story = {
  render: () => (
    <Popover
      placement="below"
      label="Token options"
      width={220}
      content={
        <VStack gap={2}>
          <Heading level={4} tabIndex={-1}>
            Filter options
          </Heading>
          <Divider />
          <Text type="body">
            The token automatically renders as a button via context.
          </Text>
        </VStack>
      }>
      <Token label="Status: Active" icon="filter" />
    </Popover>
  ),
};

// =============================================================================
// Link as Popover Trigger (no href → renders as button)
// =============================================================================

export const LinkTrigger: Story = {
  render: () => (
    <Popover
      placement="below"
      label="Link actions"
      width={220}
      content={
        <VStack gap={2}>
          <Heading level={4} tabIndex={-1}>
            Quick actions
          </Heading>
          <Divider />
          <Text type="body">
            Link without href renders as a button, suitable for triggers.
          </Text>
        </VStack>
      }>
      <Link>More options</Link>
    </Popover>
  ),
};

// =============================================================================
// Render Prop Pattern (explicit trigger wiring)
// =============================================================================

export const RenderProp: Story = {
  render: () => (
    <Popover
      placement="below"
      label="Custom trigger"
      width={260}
      content={
        <VStack gap={2}>
          <Heading level={4} tabIndex={-1}>
            Custom trigger
          </Heading>
          <Divider />
          <Text type="body">
            The render prop gives full control over the trigger element.
          </Text>
        </VStack>
      }>
      {(triggerProps: PopoverTriggerRenderProps) => (
        <button
          ref={triggerProps.ref}
          onClick={triggerProps.onClick}
          aria-haspopup={triggerProps['aria-haspopup']}
          aria-expanded={triggerProps['aria-expanded']}
          aria-controls={triggerProps['aria-controls']}
          style={{
            padding: '8px 16px',
            border: '1px dashed currentColor',
            borderRadius: 4,
            background: 'transparent',
            cursor: 'pointer',
          }}>
          Custom trigger element
        </button>
      )}
    </Popover>
  ),
};
