// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {Meta, StoryObj} from '@storybook/react';
import {Item} from '@astryxdesign/core/Item';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Icon} from '@astryxdesign/core/Icon';
import {Text} from '@astryxdesign/core/Text';
import {Stack} from '@astryxdesign/core/Layout';

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

const meta: Meta<typeof Item> = {
  title: 'Core/Item',
  component: Item,
  tags: ['autodocs'],
  argTypes: {
    align: {control: 'select', options: ['center', 'start']},
    density: {control: 'select', options: ['compact', 'balanced', 'spacious']},
    variant: {control: 'select', options: ['default', 'outline', 'muted']},
  },
};

export default meta;
type Story = StoryObj<typeof Item>;

/** Basic item with all slots populated. */
export const Default: Story = {
  render: () => (
    <Item
      startContent={<Icon icon={UserIcon} size="sm" />}
      label="Alice Johnson"
      description="Software Engineer"
      endContent={<Badge label="Admin" />}
    />
  ),
};

/** Contact list with avatars and roles. */
export const ContactList: Story = {
  render: () => (
    <Stack gap={0}>
      <Item
        startContent={<Avatar name="Alice Johnson" size={40} />}
        label="Alice Johnson"
        description="Engineering Lead"
        endContent={<Badge label="Admin" />}
        onClick={() => {}}
      />
      <Item
        startContent={<Avatar name="Bob Smith" size={40} />}
        label="Bob Smith"
        description="Product Designer"
        onClick={() => {}}
      />
      <Item
        startContent={<Avatar name="Carol Williams" size={40} />}
        label="Carol Williams"
        description="Data Scientist"
        endContent={<Text color="secondary">Away</Text>}
        onClick={() => {}}
      />
    </Stack>
  ),
};

/** Notification inbox with timestamps and truncation. */
export const Notifications: Story = {
  render: () => (
    <Stack gap={0}>
      <Item
        startContent={<Avatar name="Alice" size={40} />}
        label={
          <>
            <b>Alice</b> commented on your PR
          </>
        }
        description="Looks good, one nit on the error handling..."
        endContent={<Text color="secondary">2h ago</Text>}
        descriptionLines={1}
        onClick={() => {}}
      />
      <Item
        startContent={
          <div {...stylex.props(storyStyles.iconCircle)}>
            <Icon icon={BellIcon} size="sm" />
          </div>
        }
        label="Build completed successfully"
        description="Pipeline #4521 — all 42 tests passed"
        endContent={<Text color="secondary">5h ago</Text>}
        descriptionLines={1}
        onClick={() => {}}
      />
    </Stack>
  ),
};

/** Compact menu items with icons. */
export const CompactMenu: Story = {
  render: () => (
    <Stack gap={0}>
      <Item
        startContent={<Icon icon={PencilSquareIcon} size="sm" />}
        label="Edit"
        density="compact"
        onClick={() => {}}
      />
      <Item
        startContent={<Icon icon={Cog6ToothIcon} size="sm" />}
        label="Settings"
        description="Manage your preferences"
        density="compact"
        onClick={() => {}}
      />
      <Item
        startContent={<Icon icon={ChatBubbleLeftIcon} size="sm" />}
        label="Messages"
        density="compact"
        endContent={<Badge label="12" />}
        onClick={() => {}}
      />
    </Stack>
  ),
};

/** Spacious item rows for roomy layouts. */
export const SpaciousRows: Story = {
  render: () => (
    <Stack gap={0}>
      <Item
        startContent={<Icon icon={BellIcon} size="sm" />}
        label="Product updates"
        description="Major announcements and release notes"
        density="spacious"
      />
      <Item
        startContent={<Icon icon={ChatBubbleLeftIcon} size="sm" />}
        label="Team messages"
        description="Direct messages, mentions, and thread replies"
        endContent={<Badge label="4" />}
        density="spacious"
      />
    </Stack>
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
      <Stack gap={0}>
        <Item
          startContent={<Icon icon={DocumentIcon} size="sm" />}
          label="design-spec.pdf"
          description="Modified 2 hours ago"
          endContent={<Text color="secondary">2.4 MB</Text>}
          isSelected={selected.has('doc1')}
          onClick={() => toggle('doc1')}
        />
        <Item
          startContent={<Icon icon={DocumentIcon} size="sm" />}
          label="architecture-diagram.png"
          description="Modified yesterday"
          endContent={<Text color="secondary">1.2 MB</Text>}
          isSelected={selected.has('doc2')}
          onClick={() => toggle('doc2')}
        />
        <Item
          startContent={<Icon icon={DocumentIcon} size="sm" />}
          label="meeting-notes.md"
          description="Modified 3 days ago"
          endContent={<Text color="secondary">48 KB</Text>}
          isSelected={selected.has('doc3')}
          onClick={() => toggle('doc3')}
        />
      </Stack>
    );
  },
};

/** Search results with highlighted terms and links. */
export const SearchResults: Story = {
  render: () => (
    <Stack gap={0}>
      <Item
        startContent={<Icon icon={MagnifyingGlassIcon} size="sm" />}
        label={
          <>
            Astryx <b>Button</b> Component
          </>
        }
        description="Primary interactive element for triggering actions..."
        descriptionLines={1}
        href="/docs/button"
      />
      <Item
        startContent={<Icon icon={MagnifyingGlassIcon} size="sm" />}
        label={
          <>
            Astryx <b>Button</b>Group
          </>
        }
        description="Groups related buttons into a single connected control..."
        descriptionLines={1}
        href="/docs/button-group"
      />
    </Stack>
  ),
};

/** Disabled items. */
export const Disabled: Story = {
  render: () => (
    <Stack gap={0}>
      <Item
        startContent={<Icon icon={UserIcon} size="sm" />}
        label="Active item"
        description="This item is interactive"
        onClick={() => {}}
      />
      <Item
        startContent={<Icon icon={UserIcon} size="sm" />}
        label="Disabled item"
        description="This item cannot be interacted with"
        onClick={() => {}}
        isDisabled
      />
    </Stack>
  ),
};

/**
 * Surface variants. `variant` is opt-in — an Item without it stays transparent,
 * which is what lists and menus want. The three variants share Card's tokens but
 * keep Item's element-scale radius.
 */
export const Variants: Story = {
  render: () => (
    <Stack gap={2}>
      <Item label="No variant" description="Transparent — the default" />
      <Item
        variant="default"
        label="default"
        description="Card background with a visible border"
      />
      <Item
        variant="outline"
        label="outline"
        description="Border only, no fill"
      />
      <Item
        variant="muted"
        label="muted"
        description="Muted background, no border"
      />
    </Stack>
  ),
};

/**
 * Hover and selection composite *over* the variant surface rather than
 * replacing it, so a bordered or filled Item still gives interaction feedback.
 */
export const VariantsInteractive: Story = {
  render: () => (
    <Stack gap={2}>
      <Item
        variant="default"
        label="Clickable default"
        description="Hover me"
        onClick={() => {}}
      />
      <Item
        variant="outline"
        label="Selected outline"
        description="Selection tint over the border"
        isSelected
        onClick={() => {}}
      />
      <Item
        variant="muted"
        label="Clickable muted"
        description="Hover still reads, even though muted and the hover overlay share a token value in light mode"
        onClick={() => {}}
      />
    </Stack>
  ),
};

/** Top-aligned layout for multi-line content. */
export const AlignStart: Story = {
  render: () => (
    <Item
      align="start"
      startContent={<Avatar name="Alice" size={40} />}
      label="Alice Johnson"
      description="This is a longer description that wraps across multiple lines to demonstrate the align=start behavior, which positions the start and end content at the top rather than vertically centering them."
      endContent={<Text color="secondary">Just now</Text>}
    />
  ),
};
