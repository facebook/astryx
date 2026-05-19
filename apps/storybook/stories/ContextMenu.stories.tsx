// Copyright (c) Meta Platforms, Inc. and affiliates.
import type {Meta, StoryObj} from '@storybook/react';
import {XDSContextMenu, XDSContextMenuItem} from '@xds/core/ContextMenu';
import {XDSDivider} from '@xds/core/Divider';
import {
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  ScissorsIcon,
  ClipboardIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';
import * as stylex from '@stylexjs/stylex';

const triggerStyles = stylex.create({
  area: {
    padding: '48px',
    borderWidth: '2px',
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    borderRadius: '8px',
    textAlign: 'center',
    color: '#6b7280',
    userSelect: 'none',
  },
});

const meta: Meta<typeof XDSContextMenu> = {
  title: 'Core/ContextMenu',
  component: XDSContextMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    items: {
      description: 'Menu items (items, dividers, or sections)',
    },
    menuWidth: {
      control: 'text',
      description: 'Custom menu width (number for px or CSS string)',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Menu item size',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Disable custom context menu',
    },
    'data-testid': {
      control: 'text',
      description: 'Test ID for testing frameworks',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSContextMenu>;

export const Default: Story = {
  render: () => (
    <XDSContextMenu
      items={[
        {label: 'Cut', onClick: () => console.log('Cut')},
        {label: 'Copy', onClick: () => console.log('Copy')},
        {label: 'Paste', onClick: () => console.log('Paste')},
      ]}>
      <div {...stylex.props(triggerStyles.area)}>Right-click this area</div>
    </XDSContextMenu>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <XDSContextMenu
      items={[
        {
          label: 'Cut',
          icon: ScissorsIcon,
          onClick: () => console.log('Cut'),
        },
        {
          label: 'Copy',
          icon: ClipboardDocumentIcon,
          onClick: () => console.log('Copy'),
        },
        {
          label: 'Paste',
          icon: ClipboardIcon,
          onClick: () => console.log('Paste'),
        },
        {type: 'divider'},
        {
          label: 'Delete',
          icon: TrashIcon,
          onClick: () => console.log('Delete'),
        },
      ]}>
      <div {...stylex.props(triggerStyles.area)}>Right-click for actions</div>
    </XDSContextMenu>
  ),
};

export const WithSections: Story = {
  render: () => (
    <XDSContextMenu
      items={[
        {
          type: 'section',
          title: 'Edit',
          items: [
            {
              label: 'Cut',
              icon: ScissorsIcon,
              onClick: () => console.log('Cut'),
            },
            {
              label: 'Copy',
              icon: ClipboardDocumentIcon,
              onClick: () => console.log('Copy'),
            },
            {
              label: 'Paste',
              icon: ClipboardIcon,
              onClick: () => console.log('Paste'),
            },
          ],
        },
        {
          type: 'section',
          title: 'Share',
          items: [
            {
              label: 'Share',
              icon: ShareIcon,
              onClick: () => console.log('Share'),
            },
            {
              label: 'Download',
              icon: ArrowDownTrayIcon,
              onClick: () => console.log('Download'),
            },
          ],
        },
      ]}>
      <div {...stylex.props(triggerStyles.area)}>
        Right-click for grouped actions
      </div>
    </XDSContextMenu>
  ),
};

export const WithDividers: Story = {
  render: () => (
    <XDSContextMenu
      items={[
        {label: 'Edit', onClick: () => console.log('Edit')},
        {label: 'Duplicate', onClick: () => console.log('Duplicate')},
        {type: 'divider'},
        {label: 'Delete', onClick: () => console.log('Delete')},
      ]}>
      <div {...stylex.props(triggerStyles.area)}>Right-click this area</div>
    </XDSContextMenu>
  ),
};

export const WithDisabledItems: Story = {
  render: () => (
    <XDSContextMenu
      items={[
        {
          label: 'Edit',
          icon: PencilIcon,
          onClick: () => console.log('Edit'),
        },
        {
          label: 'Duplicate',
          icon: DocumentDuplicateIcon,
          onClick: () => console.log('Duplicate'),
        },
        {label: 'Delete (no permission)', icon: TrashIcon, isDisabled: true},
      ]}>
      <div {...stylex.props(triggerStyles.area)}>Right-click this area</div>
    </XDSContextMenu>
  ),
};

export const CustomWidth: Story = {
  render: () => (
    <XDSContextMenu
      menuWidth={280}
      items={[
        {
          label: 'This is a longer option that needs more space',
          onClick: () => console.log('Option 1'),
        },
        {
          label: 'Another long option',
          onClick: () => console.log('Option 2'),
        },
        {label: 'Short', onClick: () => console.log('Option 3')},
      ]}>
      <div {...stylex.props(triggerStyles.area)}>Right-click for wide menu</div>
    </XDSContextMenu>
  ),
};

export const SmallSize: Story = {
  render: () => (
    <XDSContextMenu
      size="sm"
      items={[
        {label: 'Cut', onClick: () => console.log('Cut')},
        {label: 'Copy', onClick: () => console.log('Copy')},
        {label: 'Paste', onClick: () => console.log('Paste')},
      ]}>
      <div {...stylex.props(triggerStyles.area)}>
        Right-click for compact menu
      </div>
    </XDSContextMenu>
  ),
};

export const Disabled: Story = {
  render: () => (
    <XDSContextMenu
      isDisabled
      items={[
        {label: 'Cut', onClick: () => console.log('Cut')},
        {label: 'Copy', onClick: () => console.log('Copy')},
      ]}>
      <div {...stylex.props(triggerStyles.area)}>
        Right-click shows native menu (disabled)
      </div>
    </XDSContextMenu>
  ),
};

export const CompoundBasic: Story = {
  render: () => (
    <XDSContextMenu
      menuContent={
        <>
          <XDSContextMenuItem
            icon={PencilIcon}
            label="Edit"
            onClick={() => console.log('Edit')}
          />
          <XDSContextMenuItem
            icon={DocumentDuplicateIcon}
            label="Duplicate"
            onClick={() => console.log('Duplicate')}
          />
          <XDSDivider />
          <XDSContextMenuItem
            icon={TrashIcon}
            label="Delete"
            onClick={() => console.log('Delete')}
          />
        </>
      }>
      <div {...stylex.props(triggerStyles.area)}>
        Right-click for compound menu
      </div>
    </XDSContextMenu>
  ),
};

export const CompoundWithDescriptions: Story = {
  render: () => (
    <XDSContextMenu
      menuWidth={280}
      menuContent={
        <>
          <XDSContextMenuItem
            icon={PencilIcon}
            label="Edit"
            description="Modify this item"
            onClick={() => console.log('Edit')}
          />
          <XDSContextMenuItem
            icon={ShareIcon}
            label="Share"
            description="Share with others"
            onClick={() => console.log('Share')}
          />
          <XDSDivider />
          <XDSContextMenuItem
            icon={TrashIcon}
            label="Delete"
            description="Permanently remove"
            onClick={() => console.log('Delete')}
          />
        </>
      }>
      <div {...stylex.props(triggerStyles.area)}>
        Right-click for detailed menu
      </div>
    </XDSContextMenu>
  ),
};
