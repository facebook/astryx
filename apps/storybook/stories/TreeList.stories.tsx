// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {XDSTreeList} from '@xds/core/TreeList';
import type {XDSTreeListItemData} from '@xds/core/TreeList';
import {XDSIcon} from '@xds/core/Icon';
import {XDSBadge} from '@xds/core/Badge';
import {
  FolderIcon,
  DocumentIcon,
  Cog6ToothIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const noop = () => {};

const meta: Meta<typeof XDSTreeList> = {
  title: 'Core/TreeList',
  component: XDSTreeList,
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
type Story = StoryObj<typeof XDSTreeList>;

const fileTreeItems: XDSTreeListItemData[] = [
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
        startContent: <XDSIcon icon={FolderIcon} />,
        children: [
          {
            id: 'app',
            label: 'App.tsx',
            onClick: noop,
            startContent: <XDSIcon icon={DocumentIcon} />,
          },
          {
            id: 'index',
            label: 'index.tsx',
            onClick: noop,
            startContent: <XDSIcon icon={DocumentIcon} />,
          },
        ],
      },
      {
        id: 'pkg',
        label: 'package.json',
        onClick: noop,
        startContent: <XDSIcon icon={DocumentIcon} />,
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
        startContent: <XDSIcon icon={Cog6ToothIcon} />,
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
        endContent: <XDSIcon icon={ChevronRightIcon} />,
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
        endContent: <XDSBadge label="3" />,
        children: [
          {id: 'unread', label: 'Unread', onClick: noop, endContent: <XDSBadge label="3" />},
          {id: 'starred', label: 'Starred', onClick: noop},
        ],
      },
      {id: 'sent', label: 'Sent', onClick: noop},
      {id: 'drafts', label: 'Drafts', onClick: noop, endContent: <XDSBadge label="1" />},
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
      {id: 'disabled-parent', label: 'Disabled Parent', onClick: noop, isDisabled: true},
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
