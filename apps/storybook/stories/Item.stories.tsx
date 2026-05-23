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
    density: {control: 'select', options: ['default', 'compact']},
  },
};

export default meta;
type Story = StoryObj<typeof XDSItem>;

/** Basic item with all slots populated. */
export const Default: Story = {
  render: () => (
    <XDSItem
      media={<XDSIcon icon={UserIcon} size="sm" />}
      label="Alice Johnson"
      description="Software Engineer"
      trailing={<XDSBadge label="Admin" />}
    />
  ),
};

/** Contact list with avatars and roles. */
export const ContactList: Story = {
  render: () => (
    <XDSStack gap={0}>
      <XDSItem
        media={<XDSAvatar name="Alice Johnson" size={40} />}
        label="Alice Johnson"
        description="Engineering Lead"
        trailing={<XDSBadge label="Admin" />}
        onClick={() => {}}
      />
      <XDSItem
        media={<XDSAvatar name="Bob Smith" size={40} />}
        label="Bob Smith"
        description="Product Designer"
        onClick={() => {}}
      />
      <XDSItem
        media={<XDSAvatar name="Carol Williams" size={40} />}
        label="Carol Williams"
        description="Data Scientist"
        trailing={<XDSText color="secondary">Away</XDSText>}
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
        media={<XDSAvatar name="Alice" size={40} />}
        label={
          <>
            <b>Alice</b> commented on your PR
          </>
        }
        description="Looks good, one nit on the error handling..."
        trailing={<XDSText color="secondary">2h ago</XDSText>}
        descriptionLines={1}
        onClick={() => {}}
      />
      <XDSItem
        media={
          <div {...stylex.props(storyStyles.iconCircle)}>
            <XDSIcon icon={BellIcon} size="sm" />
          </div>
        }
        label="Build completed successfully"
        description="Pipeline #4521 — all 42 tests passed"
        trailing={<XDSText color="secondary">5h ago</XDSText>}
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
        media={<XDSIcon icon={PencilSquareIcon} size="sm" />}
        label="Edit"
        density="compact"
        onClick={() => {}}
      />
      <XDSItem
        media={<XDSIcon icon={Cog6ToothIcon} size="sm" />}
        label="Settings"
        description="Manage your preferences"
        density="compact"
        onClick={() => {}}
      />
      <XDSItem
        media={<XDSIcon icon={ChatBubbleLeftIcon} size="sm" />}
        label="Messages"
        density="compact"
        trailing={<XDSBadge label="12" />}
        onClick={() => {}}
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
          media={<XDSIcon icon={DocumentIcon} size="sm" />}
          label="design-spec.pdf"
          description="Modified 2 hours ago"
          trailing={<XDSText color="secondary">2.4 MB</XDSText>}
          isSelected={selected.has('doc1')}
          onClick={() => toggle('doc1')}
        />
        <XDSItem
          media={<XDSIcon icon={DocumentIcon} size="sm" />}
          label="architecture-diagram.png"
          description="Modified yesterday"
          trailing={<XDSText color="secondary">1.2 MB</XDSText>}
          isSelected={selected.has('doc2')}
          onClick={() => toggle('doc2')}
        />
        <XDSItem
          media={<XDSIcon icon={DocumentIcon} size="sm" />}
          label="meeting-notes.md"
          description="Modified 3 days ago"
          trailing={<XDSText color="secondary">48 KB</XDSText>}
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
        media={<XDSIcon icon={MagnifyingGlassIcon} size="sm" />}
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
        media={<XDSIcon icon={MagnifyingGlassIcon} size="sm" />}
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
        media={<XDSIcon icon={UserIcon} size="sm" />}
        label="Active item"
        description="This item is interactive"
        onClick={() => {}}
      />
      <XDSItem
        media={<XDSIcon icon={UserIcon} size="sm" />}
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
      media={<XDSAvatar name="Alice" size={40} />}
      label="Alice Johnson"
      description="This is a longer description that wraps across multiple lines to demonstrate the align=start behavior, which positions the media and trailing content at the top rather than vertically centering them."
      trailing={<XDSText color="secondary">Just now</XDSText>}
    />
  ),
};
