import type {Meta, StoryObj} from '@storybook/react';
import {XDSMoreMenu} from '@xds/core/MoreMenu';
import {XDSDropdownMenuItem} from '@xds/core/DropdownMenu';
import {XDSButton} from '@xds/core/Button';
import {
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const meta: Meta<typeof XDSMoreMenu> = {
  title: 'Core/XDSMoreMenu',
  component: XDSMoreMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    items: {
      description: 'Menu items (items, dividers, or sections)',
    },
    label: {
      control: 'text',
      description: 'Accessible label for the trigger button',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'destructive'],
      description: 'Visual style variant of the trigger button',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the trigger button',
    },
    isDisabled: {
      control: 'boolean',
      description: 'Whether the menu trigger is disabled',
    },
    'data-testid': {
      control: 'text',
      description: 'Test ID for testing frameworks',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSMoreMenu>;

// Basic usage — just items, all defaults
export const Default: Story = {
  render: () => (
    <XDSMoreMenu
      items={[
        {label: 'Edit', onClick: () => console.log('Edit clicked')},
        {label: 'Duplicate', onClick: () => console.log('Duplicate clicked')},
        {label: 'Delete', onClick: () => console.log('Delete clicked')},
      ]}
    />
  ),
};

// With icons on items
export const WithIcons: Story = {
  render: () => (
    <XDSMoreMenu
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
        {
          label: 'Download',
          icon: ArrowDownTrayIcon,
          onClick: () => console.log('Download'),
        },
        {
          label: 'Share',
          icon: ShareIcon,
          onClick: () => console.log('Share'),
        },
      ]}
    />
  ),
};

// With dividers
export const WithDividers: Story = {
  render: () => (
    <XDSMoreMenu
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
        {type: 'divider'},
        {
          label: 'Delete',
          icon: TrashIcon,
          onClick: () => console.log('Delete'),
        },
      ]}
    />
  ),
};

// With sections
export const WithSections: Story = {
  render: () => (
    <XDSMoreMenu
      label="Document actions"
      items={[
        {
          type: 'section',
          title: 'Actions',
          items: [
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
          ],
        },
        {
          type: 'section',
          title: 'Danger zone',
          items: [
            {
              label: 'Delete',
              icon: TrashIcon,
              onClick: () => console.log('Delete'),
            },
          ],
        },
      ]}
    />
  ),
};

// Small size — for table rows and dense layouts
export const SmallSize: Story = {
  render: () => (
    <XDSMoreMenu
      size="sm"
      label="Row actions"
      items={[
        {
          label: 'Edit',
          icon: PencilIcon,
          onClick: () => console.log('Edit'),
        },
        {type: 'divider'},
        {
          label: 'Delete',
          icon: TrashIcon,
          onClick: () => console.log('Delete'),
        },
      ]}
    />
  ),
};

// Different variants
export const Variants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
      <XDSMoreMenu
        variant="ghost"
        label="Ghost variant"
        items={[{label: 'Action', onClick: () => {}}]}
      />
      <XDSMoreMenu
        variant="secondary"
        label="Secondary variant"
        items={[{label: 'Action', onClick: () => {}}]}
      />
      <XDSMoreMenu
        variant="primary"
        label="Primary variant"
        items={[{label: 'Action', onClick: () => {}}]}
      />
    </div>
  ),
};

// Disabled state
export const Disabled: Story = {
  render: () => (
    <XDSMoreMenu
      isDisabled
      items={[
        {label: 'Edit', onClick: () => console.log('Edit')},
        {label: 'Delete', onClick: () => console.log('Delete')},
      ]}
    />
  ),
};

// In a toolbar alongside other buttons
export const InToolbar: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
      <XDSButton label="Save" variant="primary" onClick={() => {}} />
      <XDSButton label="Preview" variant="secondary" onClick={() => {}} />
      <XDSMoreMenu
        label="More actions"
        items={[
          {
            label: 'Export',
            icon: ArrowDownTrayIcon,
            onClick: () => console.log('Export'),
          },
          {
            label: 'Share',
            icon: ShareIcon,
            onClick: () => console.log('Share'),
          },
          {type: 'divider'},
          {
            label: 'Delete',
            icon: TrashIcon,
            onClick: () => console.log('Delete'),
          },
        ]}
      />
    </div>
  ),
};

// With custom item rendering
export const CustomItemRendering: Story = {
  render: () => (
    <XDSMoreMenu
      label="User actions"
      items={[
        {label: 'Alice Johnson', onClick: () => console.log('Alice')},
        {label: 'Bob Smith', onClick: () => console.log('Bob')},
        {label: 'Carol Williams', onClick: () => console.log('Carol')},
      ]}>
      {item => (
        <XDSDropdownMenuItem label={item.label} description="Team member" />
      )}
    </XDSMoreMenu>
  ),
};

// With disabled items
export const WithDisabledItems: Story = {
  render: () => (
    <XDSMoreMenu
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
          isDisabled: true,
        },
        {type: 'divider'},
        {
          label: 'Delete',
          icon: TrashIcon,
          onClick: () => console.log('Delete'),
          isDisabled: true,
        },
      ]}
    />
  ),
};

// Custom trigger icon — replaces the default three-dots
export const CustomIcon: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
      <XDSMoreMenu
        icon={<Cog6ToothIcon />}
        label="Settings"
        items={[
          {label: 'Preferences', onClick: () => console.log('Preferences')},
          {label: 'Account', onClick: () => console.log('Account')},
          {label: 'Logout', onClick: () => console.log('Logout')},
        ]}
      />
      <XDSMoreMenu
        icon={<PencilIcon />}
        label="Edit options"
        items={[
          {label: 'Edit title', onClick: () => console.log('Edit title')},
          {
            label: 'Edit description',
            onClick: () => console.log('Edit description'),
          },
        ]}
      />
    </div>
  ),
};
