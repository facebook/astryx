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
import {List, ListItem} from '@astryxdesign/core/List';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';

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
  ArchiveBoxIcon,
  EnvelopeIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const meta: Meta<typeof Item> = {
  title: 'Core/Item',
  component: Item,
  tags: ['autodocs'],
  argTypes: {
    align: {control: 'select', options: ['center', 'start']},
    density: {control: 'select', options: ['compact', 'balanced', 'spacious']},
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

/**
 * Swipe actions, as a mail list uses them: on a touch screen a drag toward
 * the inline start uncovers Archive and Delete (Delete outermost, so a long
 * drag or a fling fires it); a drag toward the inline end uncovers a
 * read/unread toggle. Under `reveal` (the default) the row rests open with
 * every entry a real button. Every verb is also in the row's own content, so
 * a mouse and a keyboard reach it without the gesture. `List` clips the rows
 * in the inline axis for the slide.
 */
export const SwipeActions: Story = {
  render: () => {
    const [rows, setRows] = useState(() =>
      Array.from({length: 6}, (_, index) => ({
        id: index,
        isUnread: index % 2 === 0,
        label: `Message ${index + 1}`,
      })),
    );
    const remove = (id: number) =>
      setRows(current => current.filter(row => row.id !== id));
    const toggleRead = (id: number) =>
      setRows(current =>
        current.map(row =>
          row.id === id ? {...row, isUnread: !row.isUnread} : row,
        ),
      );
    return (
      <List>
        {rows.map(row => (
          <ListItem
            key={row.id}
            label={row.label}
            description={row.isUnread ? 'Unread' : 'Read'}
            onClick={() => {}}
            endContent={
              <Text color="secondary">
                {row.isUnread ? 'Mark read' : 'Mark unread'} · Archive · Delete
              </Text>
            }
            swipeActions={{
              leading: [
                {
                  label: row.isUnread ? 'Read' : 'Unread',
                  icon: <Icon icon={EnvelopeIcon} size="sm" />,
                  onActivate: () => toggleRead(row.id),
                },
              ],
              trailing: [
                {
                  label: 'Archive',
                  icon: <Icon icon={ArchiveBoxIcon} size="sm" />,
                  onActivate: () => remove(row.id),
                  variant: 'neutral',
                  hasRemoval: true,
                },
                {
                  label: 'Delete',
                  icon: <Icon icon={TrashIcon} size="sm" />,
                  onActivate: () => remove(row.id),
                  variant: 'destructive',
                  hasRemoval: true,
                },
              ],
            }}
          />
        ))}
        {rows.length === 0 && <ListItem label="All done." />}
      </List>
    );
  },
};

/**
 * `swipeBehavior="commit"`: one verb per side; a release past the commit
 * point slides the row out and fires it, and nothing rests. The panel is
 * presentational.
 */
export const SwipeCommit: Story = {
  render: () => {
    const [rows, setRows] = useState(() =>
      Array.from({length: 5}, (_, index) => ({
        id: index,
        label: `Notification ${index + 1}`,
      })),
    );
    const remove = (id: number) =>
      setRows(current => current.filter(row => row.id !== id));
    return (
      <List>
        {rows.map(row => (
          <ListItem
            key={row.id}
            label={row.label}
            description="Swipe toward the start to dismiss"
            onClick={() => {}}
            endContent={<Text color="secondary">Dismiss</Text>}
            swipeBehavior="commit"
            swipeActions={{
              trailing: [
                {
                  label: 'Dismiss',
                  icon: <Icon icon={TrashIcon} size="sm" />,
                  onActivate: () => remove(row.id),
                  variant: 'destructive',
                  hasRemoval: true,
                },
              ],
            }}
          />
        ))}
        {rows.length === 0 && <ListItem label="All caught up." />}
      </List>
    );
  },
};

/**
 * A row that opens something: `controlProps` puts the disclosure's state and
 * relation on the control a keyboard user focuses (the row's invisible
 * button), where a screen reader reads them with the name. The root keeps
 * the rest of the row's props.
 */
export const DisclosureRow: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <Stack gap={1}>
        <Item
          label="Changed files"
          description={isOpen ? '3 files, shown below' : '3 files'}
          onClick={() => setIsOpen(open => !open)}
          endContent={<Text color="secondary">{isOpen ? 'Hide' : 'Show'}</Text>}
          controlProps={{
            'aria-expanded': isOpen,
            'aria-controls': 'disclosure-row-panel',
          }}
        />
        {isOpen && (
          <div id="disclosure-row-panel">
            <Item label="src/app.tsx" description="+12 −4" />
            <Item label="src/row.tsx" description="+3 −1" />
            <Item label="docs/row.md" description="+40" />
          </div>
        )}
      </Stack>
    );
  },
};

/**
 * Rows of a grid: `role="row"` renders the row's parts as `gridcell`s (the
 * select cell, the label cell with its link, the end cell, each swipe panel)
 * and keeps the row's own control, where the grid's roving focus lands
 * through `controlProps`. Arrow keys move between rows; Space on a row's
 * checkbox selects it; a touch swipe toward the inline start uncovers
 * Archive. Selection is the row's `aria-selected`.
 */
export const GridRows: Story = {
  render: () => {
    const [rows, setRows] = useState(() =>
      Array.from({length: 5}, (_, index) => ({
        id: `m-${index + 1}`,
        label: `Message ${index + 1}`,
        selected: index === 1,
      })),
    );
    const [focusedIndex, setFocusedIndex] = useState(0);
    const remove = (id: string) =>
      setRows(current => current.filter(row => row.id !== id));
    const toggle = (id: string) =>
      setRows(current =>
        current.map(row =>
          row.id === id ? {...row, selected: !row.selected} : row,
        ),
      );
    const focusRow = (index: number) => {
      const next = Math.max(0, Math.min(rows.length - 1, index));
      setFocusedIndex(next);
      document
        .querySelector<HTMLElement>(`[data-nav-id="${rows[next]?.id}"]`)
        ?.focus();
    };
    return (
      <div role="grid" aria-label="Inbox" aria-rowcount={rows.length}>
        {rows.map((row, index) => (
          <Item
            key={row.id}
            role="row"
            aria-rowindex={index + 1}
            label={row.label}
            description="A short snippet of the message"
            href={`#${row.id}`}
            isSelected={row.selected}
            startContent={
              <CheckboxInput
                label={`Select ${row.label}`}
                isLabelHidden
                value={row.selected}
                onChange={() => toggle(row.id)}
              />
            }
            endContent={<Text color="secondary">2h</Text>}
            controlProps={{
              'data-nav-id': row.id,
              tabIndex: index === focusedIndex ? 0 : -1,
              onKeyDown: event => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  focusRow(index + 1);
                } else if (event.key === 'ArrowUp') {
                  event.preventDefault();
                  focusRow(index - 1);
                }
              },
            }}
            swipeActions={{
              trailing: [
                {
                  label: 'Archive',
                  icon: <Icon icon={ArchiveBoxIcon} size="sm" />,
                  onActivate: () => remove(row.id),
                  variant: 'neutral',
                  hasRemoval: true,
                },
              ],
            }}
          />
        ))}
      </div>
    );
  },
};
