// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {Meta, StoryObj} from '@storybook/react';
import {XDSItem} from '@xds/core/Item';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSBadge} from '@xds/core/Badge';
import {XDSIcon} from '@xds/core/Icon';
import {XDSText} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Layout';

const storyStyles = stylex.create({
  iconCircle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: '50%',
    backgroundColor: 'var(--color-neutral)',
  },
});
import {
  UserIcon,
  Cog6ToothIcon,
  DocumentIcon,
  PencilSquareIcon,
  BellIcon,
  ChatBubbleLeftIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const meta: Meta<typeof XDSItem> = {
  title: 'Core/Item',
  component: XDSItem,
  tags: ['autodocs'],
  argTypes: {
    align: {control: 'select', options: ['center', 'start']},
    density: {control: 'select', options: ['compact', 'balanced', 'spacious']},
  },
};

export default meta;
type Story = StoryObj<typeof XDSItem>;

/** Basic item with all slots populated. */
export const Default: Story = {
  render: () => (
    <XDSItem
      startContent={<XDSIcon icon={UserIcon} size="sm" />}
      label="Alice Johnson"
      description="Software Engineer"
      endContent={<XDSBadge label="Admin" />}
    />
  ),
};

/** Contact list with avatars and roles. */
export const ContactList: Story = {
  render: () => (
    <XDSStack gap={0}>
      <XDSItem
        startContent={<XDSAvatar name="Alice Johnson" size={40} />}
        label="Alice Johnson"
        description="Engineering Lead"
        endContent={<XDSBadge label="Admin" />}
        onClick={() => {}}
      />
      <XDSItem
        startContent={<XDSAvatar name="Bob Smith" size={40} />}
        label="Bob Smith"
        description="Product Designer"
        onClick={() => {}}
      />
      <XDSItem
        startContent={<XDSAvatar name="Carol Williams" size={40} />}
        label="Carol Williams"
        description="Data Scientist"
        endContent={<XDSText color="secondary">Away</XDSText>}
        onClick={() => {}}
      />
    </XDSStack>
  ),
};

/** Notification inbox with timestamps and truncation. */
export const Notifications: Story = {
  render: () => (
    <XDSStack gap={0}>
      <XDSItem
        startContent={<XDSAvatar name="Alice" size={40} />}
        label={
          <>
            <b>Alice</b> commented on your PR
          </>
        }
        description="Looks good, one nit on the error handling..."
        endContent={<XDSText color="secondary">2h ago</XDSText>}
        descriptionLines={1}
        onClick={() => {}}
      />
      <XDSItem
        startContent={
          <div {...stylex.props(storyStyles.iconCircle)}>
            <XDSIcon icon={BellIcon} size="sm" />
          </div>
        }
        label="Build completed successfully"
        description="Pipeline #4521 — all 42 tests passed"
        endContent={<XDSText color="secondary">5h ago</XDSText>}
        descriptionLines={1}
        onClick={() => {}}
      />
    </XDSStack>
  ),
};

/** Compact menu items with icons. */
export const CompactMenu: Story = {
  render: () => (
    <XDSStack gap={0}>
      <XDSItem
        startContent={<XDSIcon icon={PencilSquareIcon} size="sm" />}
        label="Edit"
        density="compact"
        onClick={() => {}}
      />
      <XDSItem
        startContent={<XDSIcon icon={Cog6ToothIcon} size="sm" />}
        label="Settings"
        description="Manage your preferences"
        density="compact"
        onClick={() => {}}
      />
      <XDSItem
        startContent={<XDSIcon icon={ChatBubbleLeftIcon} size="sm" />}
        label="Messages"
        density="compact"
        endContent={<XDSBadge label="12" />}
        onClick={() => {}}
      />
    </XDSStack>
  ),
};

/** Spacious item rows for roomy layouts. */
export const SpaciousRows: Story = {
  render: () => (
    <XDSStack gap={0}>
      <XDSItem
        startContent={<XDSIcon icon={BellIcon} size="sm" />}
        label="Product updates"
        description="Major announcements and release notes"
        density="spacious"
      />
      <XDSItem
        startContent={<XDSIcon icon={ChatBubbleLeftIcon} size="sm" />}
        label="Team messages"
        description="Direct messages, mentions, and thread replies"
        endContent={<XDSBadge label="4" />}
        density="spacious"
      />
    </XDSStack>
  ),
};

/** File browser with selection state. */
export const FileBrowser: Story = {
  render: function FileBrowserStory() {
    const [selected, setSelected] = useState<Set<string>>(new Set(['doc1']));
    const toggle = (id: string) =>
      setSelected(prev => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });

    return (
      <XDSStack gap={0}>
        <XDSItem
          startContent={<XDSIcon icon={DocumentIcon} size="sm" />}
          label="design-spec.pdf"
          description="Modified 2 hours ago"
          endContent={<XDSText color="secondary">2.4 MB</XDSText>}
          isSelected={selected.has('doc1')}
          onClick={() => toggle('doc1')}
        />
        <XDSItem
          startContent={<XDSIcon icon={DocumentIcon} size="sm" />}
          label="architecture-diagram.png"
          description="Modified yesterday"
          endContent={<XDSText color="secondary">1.2 MB</XDSText>}
          isSelected={selected.has('doc2')}
          onClick={() => toggle('doc2')}
        />
        <XDSItem
          startContent={<XDSIcon icon={DocumentIcon} size="sm" />}
          label="meeting-notes.md"
          description="Modified 3 days ago"
          endContent={<XDSText color="secondary">48 KB</XDSText>}
          isSelected={selected.has('doc3')}
          onClick={() => toggle('doc3')}
        />
      </XDSStack>
    );
  },
};

/** Search results with highlighted terms and links. */
export const SearchResults: Story = {
  render: () => (
    <XDSStack gap={0}>
      <XDSItem
        startContent={<XDSIcon icon={MagnifyingGlassIcon} size="sm" />}
        label={
          <>
            XDS <b>Button</b> Component
          </>
        }
        description="Primary interactive element for triggering actions..."
        descriptionLines={1}
        href="/docs/button"
      />
      <XDSItem
        startContent={<XDSIcon icon={MagnifyingGlassIcon} size="sm" />}
        label={
          <>
            XDS <b>Button</b>Group
          </>
        }
        description="Groups related buttons into a single connected control..."
        descriptionLines={1}
        href="/docs/button-group"
      />
    </XDSStack>
  ),
};

/** Disabled items. */
export const Disabled: Story = {
  render: () => (
    <XDSStack gap={0}>
      <XDSItem
        startContent={<XDSIcon icon={UserIcon} size="sm" />}
        label="Active item"
        description="This item is interactive"
        onClick={() => {}}
      />
      <XDSItem
        startContent={<XDSIcon icon={UserIcon} size="sm" />}
        label="Disabled item"
        description="This item cannot be interacted with"
        onClick={() => {}}
        isDisabled
      />
    </XDSStack>
  ),
};

/** Top-aligned layout for multi-line content. */
export const AlignStart: Story = {
  render: () => (
    <XDSItem
      align="start"
      startContent={<XDSAvatar name="Alice" size={40} />}
      label="Alice Johnson"
      description="This is a longer description that wraps across multiple lines to demonstrate the align=start behavior, which positions the start and end content at the top rather than vertically centering them."
      endContent={<XDSText color="secondary">Just now</XDSText>}
    />
  ),
};
