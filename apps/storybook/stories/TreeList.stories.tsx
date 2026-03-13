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

const meta: Meta<typeof XDSTreeList> = {
  title: 'Core/XDSTreeList',
  component: XDSTreeList,
  tags: ['autodocs'],
  argTypes: {
    density: {
      control: 'select',
      options: ['compact', 'balanced', 'spacious'],
      description: 'Spacing density for tree list items',
    },
    branchAlignment: {
      control: 'select',
      options: ['center', 'top'],
      description: 'Where branch lines connect to items',
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
          {id: 'button', label: 'Button.tsx'},
          {id: 'card', label: 'Card.tsx'},
          {id: 'list', label: 'List.tsx'},
        ],
      },
      {id: 'app', label: 'App.tsx'},
      {id: 'index', label: 'index.tsx'},
    ],
  },
  {
    id: 'public',
    label: 'public',
    children: [
      {id: 'favicon', label: 'favicon.ico'},
      {id: 'index-html', label: 'index.html'},
    ],
  },
  {id: 'pkg', label: 'package.json'},
  {id: 'readme', label: 'README.md'},
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
              {id: 'button', label: 'Button.tsx'},
              {id: 'card', label: 'Card.tsx'},
              {id: 'list', label: 'List.tsx'},
            ],
          },
          {id: 'app', label: 'App.tsx'},
          {id: 'index', label: 'index.tsx'},
        ],
      },
      {
        id: 'public',
        label: 'public',
        isExpanded: true,
        children: [
          {id: 'favicon', label: 'favicon.ico'},
          {id: 'index-html', label: 'index.html'},
        ],
      },
      {id: 'pkg', label: 'package.json'},
      {id: 'readme', label: 'README.md'},
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
            startContent: <XDSIcon icon={DocumentIcon} />,
          },
          {
            id: 'index',
            label: 'index.tsx',
            startContent: <XDSIcon icon={DocumentIcon} />,
          },
        ],
      },
      {
        id: 'pkg',
        label: 'package.json',
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
              {id: 'button', label: 'Button.tsx'},
              {id: 'card', label: 'Card.tsx'},
              {id: 'list', label: 'List.tsx'},
            ],
          },
          {id: 'app', label: 'App.tsx'},
          {id: 'index', label: 'index.tsx'},
        ],
      },
      {
        id: 'public',
        label: 'public',
        children: [
          {id: 'favicon', label: 'favicon.ico'},
          {id: 'index-html', label: 'index.html'},
        ],
      },
      {id: 'pkg', label: 'package.json'},
      {id: 'readme', label: 'README.md'},
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
              {id: 'button', label: 'Button.tsx'},
              {id: 'card', label: 'Card.tsx'},
              {id: 'list', label: 'List.tsx'},
            ],
          },
          {id: 'app', label: 'App.tsx'},
          {id: 'index', label: 'index.tsx'},
        ],
      },
      {
        id: 'public',
        label: 'public',
        children: [
          {id: 'favicon', label: 'favicon.ico'},
          {id: 'index-html', label: 'index.html'},
        ],
      },
      {id: 'pkg', label: 'package.json'},
      {id: 'readme', label: 'README.md'},
    ],
    branchAlignment: 'top',
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
          {id: 'unread', label: 'Unread', endContent: <XDSBadge label="3" />},
          {id: 'starred', label: 'Starred'},
        ],
      },
      {id: 'sent', label: 'Sent'},
      {id: 'drafts', label: 'Drafts', endContent: <XDSBadge label="1" />},
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
          {id: 'item1', label: 'Available Item', onClick: () => {}},
          {
            id: 'item2',
            label: 'Disabled Item',
            onClick: () => {},
            isDisabled: true,
          },
        ],
      },
      {id: 'disabled-parent', label: 'Disabled Parent', isDisabled: true},
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
          {id: 'home', label: 'Home', onClick: () => {}},
          {id: 'about', label: 'About', onClick: () => {}, isSelected: true},
          {id: 'contact', label: 'Contact', onClick: () => {}},
        ],
      },
    ],
  },
};
