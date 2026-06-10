// Copyright (c) Meta Platforms, Inc. and affiliates.

import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSPopover} from '@xds/core/Popover';
import type {PopoverTriggerRenderProps} from '@xds/core/Popover';
import {XDSButton} from '@xds/core/Button';
import {XDSToken} from '@xds/core/Token';
import {XDSLink} from '@xds/core/Link';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSDivider} from '@xds/core/Divider';

const meta: Meta<typeof XDSPopover> = {
  title: 'Core/Popover',
  component: XDSPopover,
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
type Story = StoryObj<typeof XDSPopover>;

// =============================================================================
// Settings Panel
// =============================================================================

function SettingsContent() {
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [sounds, setSounds] = React.useState(true);

  return (
    <XDSVStack gap={3}>
      <XDSHeading level={4} tabIndex={-1}>
        Settings
      </XDSHeading>
      <XDSDivider />
      <XDSSwitch
        label="Notifications"
        description="Receive push notifications"
        value={notifications}
        onChange={setNotifications}
      />
      <XDSSwitch
        label="Dark mode"
        description="Use dark color theme"
        value={darkMode}
        onChange={setDarkMode}
      />
      <XDSSwitch
        label="Sounds"
        description="Play sounds for actions"
        value={sounds}
        onChange={setSounds}
      />
    </XDSVStack>
  );
}

export const Default: Story = {
  args: {
    placement: 'below',
    label: 'Settings',
    width: 280,
    content: <SettingsContent />,
    children: <XDSButton label="Settings">Settings</XDSButton>,
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
    <XDSVStack gap={3}>
      <XDSHeading level={4} tabIndex={-1}>
        Filter by status
      </XDSHeading>
      <XDSDivider />
      <XDSCheckboxInput
        label="Active"
        value={filters.active}
        onChange={() => toggle('active')}
      />
      <XDSCheckboxInput
        label="Archived"
        value={filters.archived}
        onChange={() => toggle('archived')}
      />
      <XDSCheckboxInput
        label="Drafts"
        value={filters.drafts}
        onChange={() => toggle('drafts')}
      />
      <XDSCheckboxInput
        label="Shared with me"
        value={filters.shared}
        onChange={() => toggle('shared')}
      />
      <XDSDivider />
      <XDSHStack gap={2} hAlign="end">
        <XDSButton label="Apply" variant="primary" onClick={onApply}>
          Apply
        </XDSButton>
        <XDSButton
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
        </XDSButton>
      </XDSHStack>
    </XDSVStack>
  );
}

export const FilterPanel: Story = {
  render: function FilterPanelStory() {
    const [isOpen, setIsOpen] = React.useState(false);
    return (
      <XDSPopover
        placement="below"
        label="Filter"
        width={240}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        content={<FilterContent onApply={() => setIsOpen(false)} />}>
        <XDSButton label="Filter">Filter</XDSButton>
      </XDSPopover>
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
    <XDSVStack gap={3}>
      <XDSHeading level={4} tabIndex={-1}>
        Delete project?
      </XDSHeading>
      <XDSText type="body">
        This will permanently delete the project and all its data. This action
        cannot be undone.
      </XDSText>
      <XDSHStack gap={2} hAlign="end">
        <XDSButton label="Delete" variant="destructive" onClick={onConfirm}>
          Delete
        </XDSButton>
        <XDSButton label="Cancel" variant="ghost" onClick={onCancel}>
          Cancel
        </XDSButton>
      </XDSHStack>
    </XDSVStack>
  );
}

export const Confirmation: Story = {
  render: function ConfirmationStory() {
    const [isOpen, setIsOpen] = React.useState(false);
    return (
      <XDSPopover
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
        <XDSButton label="Delete project" variant="destructive">
          Delete project
        </XDSButton>
      </XDSPopover>
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
        <XDSButton ref={buttonRef} label="Anchor button">
          Anchor button
        </XDSButton>
        <XDSPopover
          anchorRef={buttonRef as React.RefObject<HTMLElement>}
          label="Sibling popover"
          width={260}
          placement="below"
          content={
            <XDSVStack gap={2}>
              <XDSHeading level={4} tabIndex={-1}>
                Sibling mode
              </XDSHeading>
              <XDSText type="body">
                This popover uses anchorRef to attach to the button as a
                sibling, without wrapping it.
              </XDSText>
            </XDSVStack>
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
      <XDSPopover
        placement="above"
        label="Info"
        width={260}
        content={
          <XDSVStack gap={2}>
            <XDSHeading level={4} tabIndex={-1}>
              Keyboard shortcuts
            </XDSHeading>
            <XDSDivider />
            <XDSHStack gap={3}>
              <XDSText type="body" weight="bold">
                ⌘K
              </XDSText>
              <XDSText type="body">Command palette</XDSText>
            </XDSHStack>
            <XDSHStack gap={3}>
              <XDSText type="body" weight="bold">
                ⌘/
              </XDSText>
              <XDSText type="body">Toggle sidebar</XDSText>
            </XDSHStack>
            <XDSHStack gap={3}>
              <XDSText type="body" weight="bold">
                ⌘.
              </XDSText>
              <XDSText type="body">Quick actions</XDSText>
            </XDSHStack>
          </XDSVStack>
        }>
        <XDSButton label="Shortcuts">Shortcuts</XDSButton>
      </XDSPopover>
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
    content: <XDSText type="body">This should not appear.</XDSText>,
    children: <XDSButton label="Disabled popover">Disabled</XDSButton>,
  },
};

// =============================================================================
// Token as Popover Trigger (via XDSInteractiveRoleContext)
// =============================================================================

export const TokenTrigger: Story = {
  render: () => (
    <XDSPopover
      placement="below"
      label="Token options"
      width={220}
      content={
        <XDSVStack gap={2}>
          <XDSHeading level={4} tabIndex={-1}>
            Filter options
          </XDSHeading>
          <XDSDivider />
          <XDSText type="body">
            The token automatically renders as a button via context.
          </XDSText>
        </XDSVStack>
      }>
      <XDSToken label="Status: Active" icon="filter" />
    </XDSPopover>
  ),
};

// =============================================================================
// Link as Popover Trigger (no href → renders as button)
// =============================================================================

export const LinkTrigger: Story = {
  render: () => (
    <XDSPopover
      placement="below"
      label="Link actions"
      width={220}
      content={
        <XDSVStack gap={2}>
          <XDSHeading level={4} tabIndex={-1}>
            Quick actions
          </XDSHeading>
          <XDSDivider />
          <XDSText type="body">
            XDSLink without href renders as a button, suitable for triggers.
          </XDSText>
        </XDSVStack>
      }>
      <XDSLink>More options</XDSLink>
    </XDSPopover>
  ),
};

// =============================================================================
// Render Prop Pattern (explicit trigger wiring)
// =============================================================================

export const RenderProp: Story = {
  render: () => (
    <XDSPopover
      placement="below"
      label="Custom trigger"
      width={260}
      content={
        <XDSVStack gap={2}>
          <XDSHeading level={4} tabIndex={-1}>
            Custom trigger
          </XDSHeading>
          <XDSDivider />
          <XDSText type="body">
            The render prop gives full control over the trigger element.
          </XDSText>
        </XDSVStack>
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
    </XDSPopover>
  ),
};
