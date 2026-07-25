// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {TreeList} from '@astryxdesign/core/TreeList';
import type {TreeListItemData} from '@astryxdesign/core/TreeList';
import {Icon} from '@astryxdesign/core/Icon';
import {Badge} from '@astryxdesign/core/Badge';
import {Theme, defineTheme} from '@astryxdesign/core/theme';
import {
  FolderIcon,
  DocumentIcon,
  Cog6ToothIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const noop = () => {};

const meta: Meta<typeof TreeList> = {
  title: 'Core/TreeList',
  component: TreeList,
  tags: ['autodocs'],
  argTypes: {
    density: {
      control: 'select',
      options: ['compact', 'balanced', 'spacious'],
      description: 'Spacing density for tree list items',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TreeList>;

const fileTreeItems: TreeListItemData[] = [
  {
    id: 'src',
    label: 'src',
    isExpanded: true,
    children: [
      {
        id: 'components',
        label: 'components',
        children: [
          {id: 'button', label: 'Button.tsx', onClick: noop},
          {id: 'card', label: 'Card.tsx', onClick: noop},
          {id: 'list', label: 'List.tsx', onClick: noop},
        ],
      },
      {id: 'app', label: 'App.tsx', onClick: noop},
      {id: 'index', label: 'index.tsx', onClick: noop},
    ],
  },
  {
    id: 'public',
    label: 'public',
    children: [
      {id: 'favicon', label: 'favicon.ico', onClick: noop},
      {id: 'index-html', label: 'index.html', onClick: noop},
    ],
  },
  {id: 'pkg', label: 'package.json', onClick: noop},
  {id: 'readme', label: 'README.md', onClick: noop},
];

export const Basic: Story = {
  args: {
    items: fileTreeItems,
  },
};

export const FullyExpanded: Story = {
  args: {
    items: [
      {
        id: 'src',
        label: 'src',
        isExpanded: true,
        children: [
          {
            id: 'components',
            label: 'components',
            isExpanded: true,
            children: [
              {id: 'button', label: 'Button.tsx', onClick: noop},
              {id: 'card', label: 'Card.tsx', onClick: noop},
              {id: 'list', label: 'List.tsx', onClick: noop},
            ],
          },
          {id: 'app', label: 'App.tsx', onClick: noop},
          {id: 'index', label: 'index.tsx', onClick: noop},
        ],
      },
      {
        id: 'public',
        label: 'public',
        isExpanded: true,
        children: [
          {id: 'favicon', label: 'favicon.ico', onClick: noop},
          {id: 'index-html', label: 'index.html', onClick: noop},
        ],
      },
      {id: 'pkg', label: 'package.json', onClick: noop},
      {id: 'readme', label: 'README.md', onClick: noop},
    ],
  },
};

export const WithIcons: Story = {
  args: {
    items: [
      {
        id: 'src',
        label: 'src',
        isExpanded: true,
        startContent: <Icon icon={FolderIcon} />,
        children: [
          {
            id: 'app',
            label: 'App.tsx',
            onClick: noop,
            startContent: <Icon icon={DocumentIcon} />,
          },
          {
            id: 'index',
            label: 'index.tsx',
            onClick: noop,
            startContent: <Icon icon={DocumentIcon} />,
          },
        ],
      },
      {
        id: 'pkg',
        label: 'package.json',
        onClick: noop,
        startContent: <Icon icon={DocumentIcon} />,
      },
    ],
  },
};

export const WithHeader: Story = {
  args: {
    items: fileTreeItems,
    header: <strong>Project Files</strong>,
  },
};

export const Compact: Story = {
  args: {
    items: [
      {
        id: 'src',
        label: 'src',
        isExpanded: true,
        children: [
          {
            id: 'components',
            label: 'components',
            isExpanded: true,
            children: [
              {id: 'button', label: 'Button.tsx', onClick: noop},
              {id: 'card', label: 'Card.tsx', onClick: noop},
              {id: 'list', label: 'List.tsx', onClick: noop},
            ],
          },
          {id: 'app', label: 'App.tsx', onClick: noop},
          {id: 'index', label: 'index.tsx', onClick: noop},
        ],
      },
      {
        id: 'public',
        label: 'public',
        children: [
          {id: 'favicon', label: 'favicon.ico', onClick: noop},
          {id: 'index-html', label: 'index.html', onClick: noop},
        ],
      },
      {id: 'pkg', label: 'package.json', onClick: noop},
      {id: 'readme', label: 'README.md', onClick: noop},
    ],
    density: 'compact',
  },
};

export const Spacious: Story = {
  args: {
    items: fileTreeItems,
    density: 'spacious',
  },
};

export const TopAligned: Story = {
  args: {
    items: [
      {
        id: 'src',
        label: 'src',
        isExpanded: true,
        children: [
          {
            id: 'components',
            label: 'components',
            isExpanded: true,
            children: [
              {id: 'button', label: 'Button.tsx', onClick: noop},
              {id: 'card', label: 'Card.tsx', onClick: noop},
              {id: 'list', label: 'List.tsx', onClick: noop},
            ],
          },
          {id: 'app', label: 'App.tsx', onClick: noop},
          {id: 'index', label: 'index.tsx', onClick: noop},
        ],
      },
      {
        id: 'public',
        label: 'public',
        children: [
          {id: 'favicon', label: 'favicon.ico', onClick: noop},
          {id: 'index-html', label: 'index.html', onClick: noop},
        ],
      },
      {id: 'pkg', label: 'package.json', onClick: noop},
      {id: 'readme', label: 'README.md', onClick: noop},
    ],
  },
};

export const Interactive: Story = {
  args: {
    items: [
      {
        id: 'settings',
        label: 'Settings',
        isExpanded: true,
        startContent: <Icon icon={Cog6ToothIcon} />,
        onClick: () => alert('Settings'),
        children: [
          {
            id: 'general',
            label: 'General',
            onClick: () => alert('General settings'),
          },
          {
            id: 'advanced',
            label: 'Advanced',
            onClick: () => alert('Advanced settings'),
          },
        ],
      },
      {
        id: 'docs',
        label: 'Documentation',
        href: '#',
        endContent: <Icon icon={ChevronRightIcon} />,
      },
    ],
  },
};

export const WithEndContent: Story = {
  args: {
    items: [
      {
        id: 'inbox',
        label: 'Inbox',
        isExpanded: true,
        endContent: <Badge label="3" />,
        children: [
          {
            id: 'unread',
            label: 'Unread',
            onClick: noop,
            endContent: <Badge label="3" />,
          },
          {id: 'starred', label: 'Starred', onClick: noop},
        ],
      },
      {id: 'sent', label: 'Sent', onClick: noop},
      {
        id: 'drafts',
        label: 'Drafts',
        onClick: noop,
        endContent: <Badge label="1" />,
      },
    ],
  },
};

export const DisabledItems: Story = {
  args: {
    items: [
      {
        id: 'active',
        label: 'Active Section',
        isExpanded: true,
        children: [
          {id: 'item1', label: 'Available Item', onClick: noop},
          {
            id: 'item2',
            label: 'Disabled Item',
            onClick: noop,
            isDisabled: true,
          },
        ],
      },
      {
        id: 'disabled-parent',
        label: 'Disabled Parent',
        onClick: noop,
        isDisabled: true,
      },
    ],
  },
};

export const SelectedItems: Story = {
  args: {
    items: [
      {
        id: 'nav',
        label: 'Navigation',
        isExpanded: true,
        children: [
          {id: 'home', label: 'Home', onClick: noop},
          {id: 'about', label: 'About', onClick: noop, isSelected: true},
          {id: 'contact', label: 'Contact', onClick: noop},
        ],
      },
    ],
  },
};

/**
 * Theme the expand/collapse chevron precisely via `defineTheme`.
 *
 * - `components['tree-list-chevron'].base` scopes overrides to the toggle
 *   control only (via the `astryx-tree-list-chevron` target), instead of
 *   reaching it through the functional `[data-tree-toggle]` attribute.
 * - `state:expanded` / `state:collapsed` restyle each open/closed state,
 *   which the toggle reflects as a `data-state` attribute.
 *
 * Defaults are unchanged; this story only demonstrates the override channel.
 */
const chevronTheme = defineTheme({
  name: 'tree-list-chevron-demo',
  components: {
    'tree-list-chevron': {
      base: {
        color: 'var(--color-accent)',
      },
      'state:expanded': {
        color: 'var(--color-success)',
      },
    },
  },
});

/**
 * Theme the item label text precisely via `defineTheme`.
 *
 * - `components['tree-list-item-label'].base` scopes overrides to the label
 *   text only (via the `astryx-tree-list-item-label` target), instead of a
 *   fragile `button:not([data-tree-toggle]) > span` structural selector.
 * - `selected` restyles just the selected item's label (bold here), which the
 *   label reflects as a `data-selected` attribute.
 *
 * Defaults are unchanged; this story only demonstrates the override channel.
 */
const labelTheme = defineTheme({
  name: 'tree-list-item-label-demo',
  components: {
    'tree-list-item-label': {
      selected: {
        fontWeight: 'var(--font-weight-bold)',
        color: 'var(--color-accent)',
      },
    },
  },
});

export const ThemedChevron: Story = {
  render: () => (
    <Theme theme={chevronTheme} mode="light">
      <TreeList
        items={[
          {
            id: 'root',
            label: 'Expanded branch (accent → success)',
            isExpanded: true,
            children: [
              {id: 'leaf-1', label: 'Leaf 1', onClick: noop},
              {
                id: 'nested',
                label: 'Collapsed branch (accent)',
                children: [{id: 'leaf-2', label: 'Leaf 2', onClick: noop}],
              },
            ],
          },
        ]}
      />
    </Theme>
  ),
};

export const ThemedItemLabel: Story = {
  render: () => (
    <Theme theme={labelTheme} mode="light">
      <TreeList
        items={[
          {
            id: 'nav',
            label: 'Navigation',
            isExpanded: true,
            children: [
              {id: 'home', label: 'Home', onClick: noop},
              {
                id: 'about',
                label: 'About (selected — bold accent label)',
                onClick: noop,
                isSelected: true,
              },
              {id: 'contact', label: 'Contact', onClick: noop},
            ],
          },
        ]}
      />
    </Theme>
  ),
};
