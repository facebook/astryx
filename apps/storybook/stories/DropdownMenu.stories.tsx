import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import {XDSDropdownMenu, XDSDropdownMenuItem} from '@xds/core/DropdownMenu';
import {
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  ArchiveBoxIcon,
  FolderPlusIcon,
  DocumentPlusIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const meta: Meta<typeof XDSDropdownMenu> = {
  title: 'Core/XDSDropdownMenu',
  component: XDSDropdownMenu,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    button: {
      description: 'Props for customizing the trigger button',
    },
    items: {
      description: 'Menu items (items, dividers, or sections)',
    },
    isMenuOpen: {
      control: 'boolean',
      description: 'Controlled open state',
    },
    menuWidth: {
      control: 'text',
      description: 'Custom menu width (number for px or CSS string)',
    },
    children: {
      description: 'Custom render function for items',
    },
    'data-testid': {
      control: 'text',
      description: 'Test ID for testing frameworks',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSDropdownMenu>;

// Basic usage
export const Default: Story = {
  render: () => (
    <XDSDropdownMenu
      button={{label: 'Actions'}}
      items={[
        {label: 'Edit', onClick: () => console.log('Edit clicked')},
        {label: 'Duplicate', onClick: () => console.log('Duplicate clicked')},
        {label: 'Delete', onClick: () => console.log('Delete clicked')},
      ]}
    />
  ),
};

// With icons
export const WithIcons: Story = {
  render: () => (
    <XDSDropdownMenu
      button={{label: 'Actions', variant: 'primary'}}
      items={[
        {label: 'Edit', icon: PencilIcon, onClick: () => console.log('Edit')},
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
    <XDSDropdownMenu
      button={{label: 'File', variant: 'ghost'}}
      items={[
        {
          type: 'section',
          title: 'Create',
          items: [
            {
              label: 'New File',
              icon: DocumentPlusIcon,
              onClick: () => console.log('New File'),
            },
            {
              label: 'New Folder',
              icon: FolderPlusIcon,
              onClick: () => console.log('New Folder'),
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
              label: 'Archive',
              icon: ArchiveBoxIcon,
              onClick: () => console.log('Archive'),
            },
          ],
        },
      ]}
    />
  ),
};

// With dividers
export const WithDividers: Story = {
  render: () => (
    <XDSDropdownMenu
      button={{label: 'Actions'}}
      items={[
        {label: 'Edit', onClick: () => console.log('Edit')},
        {label: 'Duplicate', onClick: () => console.log('Duplicate')},
        {type: 'divider'},
        {label: 'Delete', onClick: () => console.log('Delete')},
      ]}
    />
  ),
};

// With disabled items
export const WithDisabledItems: Story = {
  render: () => (
    <XDSDropdownMenu
      button={{label: 'Actions'}}
      items={[
        {label: 'Edit', onClick: () => console.log('Edit')},
        {label: 'Duplicate', onClick: () => console.log('Duplicate')},
        {label: 'Delete (disabled)', isDisabled: true},
      ]}
    />
  ),
};

// Controlled mode
export const Controlled: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          alignItems: 'center',
        }}>
        <div>Menu is {isOpen ? 'open' : 'closed'}</div>
        <XDSDropdownMenu
          button={{label: 'Controlled Menu'}}
          isMenuOpen={isOpen}
          onOpenChange={setIsOpen}
          items={[
            {label: 'Item 1', onClick: () => console.log('Item 1')},
            {label: 'Item 2', onClick: () => console.log('Item 2')},
            {label: 'Item 3', onClick: () => console.log('Item 3')},
          ]}
        />
      </div>
    );
  },
};

// Custom menu width
export const CustomWidth: Story = {
  render: () => (
    <XDSDropdownMenu
      button={{label: 'Wide Menu'}}
      menuWidth={300}
      items={[
        {
          label: 'This is a longer option that needs more space',
          onClick: () => console.log('Option 1'),
        },
        {
          label: 'Another long option with extra text',
          onClick: () => console.log('Option 2'),
        },
        {label: 'Short one', onClick: () => console.log('Option 3')},
      ]}
    />
  ),
};

// Button variants
export const ButtonVariants: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 16, flexWrap: 'wrap'}}>
      <XDSDropdownMenu
        button={{label: 'Secondary', variant: 'secondary'}}
        items={[{label: 'Option 1'}, {label: 'Option 2'}]}
      />
      <XDSDropdownMenu
        button={{label: 'Primary', variant: 'primary'}}
        items={[{label: 'Option 1'}, {label: 'Option 2'}]}
      />
      <XDSDropdownMenu
        button={{label: 'Ghost', variant: 'ghost'}}
        items={[{label: 'Option 1'}, {label: 'Option 2'}]}
      />
      <XDSDropdownMenu
        button={{label: 'Destructive', variant: 'destructive'}}
        items={[{label: 'Option 1'}, {label: 'Option 2'}]}
      />
    </div>
  ),
};

// Button sizes
export const ButtonSizes: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
      <XDSDropdownMenu
        button={{label: 'Small', size: 'sm'}}
        items={[{label: 'Option 1'}, {label: 'Option 2'}]}
      />
      <XDSDropdownMenu
        button={{label: 'Medium', size: 'md'}}
        items={[{label: 'Option 1'}, {label: 'Option 2'}]}
      />
      <XDSDropdownMenu
        button={{label: 'Large', size: 'lg'}}
        items={[{label: 'Option 1'}, {label: 'Option 2'}]}
      />
    </div>
  ),
};

// With onClick callback
export const WithOnClick: Story = {
  render: () => {
    const [clickCount, setClickCount] = useState(0);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          alignItems: 'center',
        }}>
        <div>Button clicked {clickCount} times</div>
        <XDSDropdownMenu
          button={{label: 'Click Me'}}
          onClick={() => setClickCount(c => c + 1)}
          items={[
            {label: 'Menu Item', onClick: () => console.log('Item clicked')},
          ]}
        />
      </div>
    );
  },
};

// Custom item rendering with XDSDropdownMenuItem
export const CustomItemRender: Story = {
  render: () => (
    <XDSDropdownMenu
      button={{label: 'Select User'}}
      items={[
        {label: 'Alice Johnson'},
        {label: 'Bob Smith'},
        {label: 'Carol Williams'},
      ]}>
      {item => (
        <XDSDropdownMenuItem
          icon={UserIcon}
          label={item.label}
          description={`${item.label.toLowerCase().replace(' ', '.')}@example.com`}
        />
      )}
    </XDSDropdownMenu>
  ),
};
