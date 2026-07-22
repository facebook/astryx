// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useState} from 'react';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@astryxdesign/core/DropdownMenu';
import {Divider} from '@astryxdesign/core/Divider';
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
  EllipsisHorizontalIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Core/DropdownMenu',
  component: DropdownMenu,
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
    placement: {
      control: 'select',
      options: ['above', 'below', 'start', 'end'],
      description: 'Menu placement relative to trigger',
    },
    'data-testid': {
      control: 'text',
      description: 'Test ID for testing frameworks',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

// Basic usage
export const Default: Story = {
  render: () => (
    <DropdownMenu
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
    <DropdownMenu
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
    <DropdownMenu
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
    <DropdownMenu
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
    <DropdownMenu
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
        <DropdownMenu
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
    <DropdownMenu
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
      <DropdownMenu
        button={{label: 'Secondary', variant: 'secondary'}}
        items={[{label: 'Option 1'}, {label: 'Option 2'}]}
      />
      <DropdownMenu
        button={{label: 'Primary', variant: 'primary'}}
        items={[{label: 'Option 1'}, {label: 'Option 2'}]}
      />
      <DropdownMenu
        button={{label: 'Ghost', variant: 'ghost'}}
        items={[{label: 'Option 1'}, {label: 'Option 2'}]}
      />
      <DropdownMenu
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
      <DropdownMenu
        button={{label: 'Small', size: 'sm'}}
        items={[{label: 'Option 1'}, {label: 'Option 2'}]}
      />
      <DropdownMenu
        button={{label: 'Medium', size: 'md'}}
        items={[{label: 'Option 1'}, {label: 'Option 2'}]}
      />
      <DropdownMenu
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
        <DropdownMenu
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

// Custom item rendering with compound mode
export const CustomItemRender: Story = {
  render: () => (
    <DropdownMenu button={{label: 'Select User'}} menuWidth={280}>
      <DropdownMenuItem
        icon={UserIcon}
        label="Alice Johnson"
        description="alice.johnson@example.com"
        onClick={() => console.log('Alice')}
      />
      <DropdownMenuItem
        icon={UserIcon}
        label="Bob Smith"
        description="bob.smith@example.com"
        onClick={() => console.log('Bob')}
      />
      <DropdownMenuItem
        icon={UserIcon}
        label="Carol Williams"
        description="carol.williams@example.com"
        onClick={() => console.log('Carol')}
      />
    </DropdownMenu>
  ),
};

// Icon-only trigger — renders as a square icon button (e.g., "⋯" menu)
export const IconOnly: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
      <DropdownMenu
        button={{
          label: 'More options',
          icon: <EllipsisHorizontalIcon />,
          variant: 'ghost',
          isIconOnly: true,
        }}
        items={[
          {label: 'Edit', icon: PencilIcon, onClick: () => console.log('Edit')},
          {
            label: 'Delete',
            icon: TrashIcon,
            onClick: () => console.log('Delete'),
          },
        ]}
      />
      <DropdownMenu
        button={{
          label: 'Settings',
          icon: <Cog6ToothIcon />,
          variant: 'secondary',
          isIconOnly: true,
        }}
        items={[
          {label: 'Preferences', onClick: () => console.log('Preferences')},
          {label: 'Account', onClick: () => console.log('Account')},
        ]}
      />
    </div>
  ),
};

// Icon + label together — pass children on button to get visible text with icon
export const IconWithLabel: Story = {
  render: () => (
    <DropdownMenu
      button={{
        label: 'Settings',
        icon: <Cog6ToothIcon />,
        variant: 'ghost',
        children: 'Settings',
      }}
      items={[
        {label: 'Preferences', onClick: () => console.log('Preferences')},
        {label: 'Account', onClick: () => console.log('Account')},
      ]}
    />
  ),
};

// No chevron — label-only trigger without dropdown indicator
export const NoChevron: Story = {
  render: () => (
    <DropdownMenu
      button={{label: 'Sort by: Name', variant: 'ghost'}}
      hasChevron={false}
      items={[
        {label: 'Name', onClick: () => console.log('Name')},
        {label: 'Date', onClick: () => console.log('Date')},
        {label: 'Size', onClick: () => console.log('Size')},
      ]}
    />
  ),
};

// Compound-component mode — JSX children with interactive items
export const CompoundBasic: Story = {
  render: () => (
    <DropdownMenu button={{label: 'Actions'}}>
      <DropdownMenuItem
        icon={PencilIcon}
        label="Edit"
        onClick={() => console.log('Edit')}
      />
      <DropdownMenuItem
        icon={DocumentDuplicateIcon}
        label="Duplicate"
        onClick={() => console.log('Duplicate')}
      />
      <Divider />
      <DropdownMenuItem
        icon={TrashIcon}
        label="Delete"
        onClick={() => console.log('Delete')}
      />
    </DropdownMenu>
  ),
};

// Compound mode with disabled items
export const CompoundWithDisabled: Story = {
  render: () => (
    <DropdownMenu button={{label: 'File Actions'}}>
      <DropdownMenuItem
        icon={PencilIcon}
        label="Edit"
        onClick={() => console.log('Edit')}
      />
      <DropdownMenuItem
        icon={DocumentDuplicateIcon}
        label="Duplicate"
        onClick={() => console.log('Duplicate')}
      />
      <Divider />
      <DropdownMenuItem
        icon={TrashIcon}
        label="Delete (no permission)"
        isDisabled
      />
    </DropdownMenu>
  ),
};

// Compound mode with conditional items
export const CompoundConditional: Story = {
  render: () => {
    const [canDelete, setCanDelete] = useState(false);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          alignItems: 'center',
        }}>
        <label style={{display: 'flex', gap: 8, alignItems: 'center'}}>
          <input
            type="checkbox"
            checked={canDelete}
            onChange={e => setCanDelete(e.target.checked)}
          />
          Show delete option
        </label>
        <DropdownMenu button={{label: 'Actions'}}>
          <DropdownMenuItem
            icon={PencilIcon}
            label="Edit"
            onClick={() => console.log('Edit')}
          />
          <DropdownMenuItem
            icon={ShareIcon}
            label="Share"
            onClick={() => console.log('Share')}
          />
          {canDelete && (
            <>
              <Divider />
              <DropdownMenuItem
                icon={TrashIcon}
                label="Delete"
                onClick={() => console.log('Delete')}
              />
            </>
          )}
        </DropdownMenu>
      </div>
    );
  },
};

// Compound mode with descriptions
export const CompoundWithDescriptions: Story = {
  render: () => (
    <DropdownMenu button={{label: 'Select User'}} menuWidth={280}>
      <DropdownMenuItem
        icon={UserIcon}
        label="Alice Johnson"
        description="alice.johnson@example.com"
        onClick={() => console.log('Alice')}
      />
      <DropdownMenuItem
        icon={UserIcon}
        label="Bob Smith"
        description="bob.smith@example.com"
        onClick={() => console.log('Bob')}
      />
      <DropdownMenuItem
        icon={UserIcon}
        label="Carol Williams"
        description="carol.williams@example.com"
        onClick={() => console.log('Carol')}
      />
    </DropdownMenu>
  ),
};

export const PlacementAbove: Story = {
  render: () => (
    <DropdownMenu
      button={{label: 'Bottom toolbar menu'}}
      placement="above"
      items={[
        {label: 'Edit', onClick: () => console.log('Edit')},
        {label: 'Duplicate', onClick: () => console.log('Duplicate')},
        {label: 'Delete', onClick: () => console.log('Delete')},
      ]}
    />
  ),
};

export const RTL: Story = {
  render: () => (
    <div style={{direction: 'rtl', display: 'flex', gap: '16px'}}>
      <DropdownMenu
        button={{label: 'CSS direction: rtl'}}
        items={[
          {label: 'Edit', onClick: () => console.log('Edit')},
          {label: 'Duplicate', onClick: () => console.log('Duplicate')},
          {label: 'Delete', onClick: () => console.log('Delete')},
        ]}
      />
      <div dir="ltr">
        <div dir="rtl">
          <DropdownMenu
            button={{label: 'dir="rtl" attribute'}}
            items={[
              {label: 'Edit', onClick: () => console.log('Edit')},
              {label: 'Duplicate', onClick: () => console.log('Duplicate')},
              {label: 'Delete', onClick: () => console.log('Delete')},
            ]}
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'In RTL contexts (CSS direction property or dir attribute) the menu right-edge-aligns to the trigger and grows toward the left — the logical mirror of the LTR default (#3389). Both direction mechanisms are shown; the popover inherits direction from the trigger subtree and the self-* position-area keywords mirror it in pure CSS.',
      },
    },
  },
};

// =============================================================================
// Lab — selectable items (#3829)
// =============================================================================

export const LabCheckboxItems: Story = {
  render: function LabCheckboxItemsStory() {
    const [showArchived, setShowArchived] = useState(false);
    const [showDrafts, setShowDrafts] = useState(true);
    return (
      <DropdownMenu button={{label: 'View'}}>
        <DropdownMenuCheckboxItem
          label="Show archived"
          value={showArchived}
          onChange={setShowArchived}
        />
        <DropdownMenuCheckboxItem
          label="Show drafts"
          description="Include unpublished items"
          value={showDrafts}
          onChange={setShowDrafts}
        />
      </DropdownMenu>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'DropdownMenuCheckboxItem — independent toggles (role="menuitemcheckbox"). The menu stays open on toggle by default so several can be flipped at once.',
      },
    },
  },
};

export const LabRadioGroup: Story = {
  render: function LabRadioGroupStory() {
    const [sort, setSort] = useState('newest');
    return (
      <DropdownMenu button={{label: 'Sort'}}>
        <DropdownMenuRadioGroup
          value={sort}
          onChange={setSort}
          aria-label="Sort by">
          <DropdownMenuRadioItem value="newest" label="Newest" />
          <DropdownMenuRadioItem value="oldest" label="Oldest" />
          <DropdownMenuRadioItem
            value="az"
            label="Alphabetical"
            description="A → Z"
          />
        </DropdownMenuRadioGroup>
      </DropdownMenu>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'DropdownMenuRadioGroup + DropdownMenuRadioItem — single-select group (role="menuitemradio"). Selecting closes the menu by default.',
      },
    },
  },
};

export const LabSelectableSizes: Story = {
  render: function LabSelectableSizesStory() {
    const [sm, setSm] = useState('a');
    const [lg, setLg] = useState('a');
    return (
      <div style={{display: 'flex', gap: 24}}>
        <DropdownMenu button={{label: 'Small menu', size: 'sm'}}>
          <DropdownMenuRadioGroup
            value={sm}
            onChange={setSm}
            aria-label="Small">
            <DropdownMenuRadioItem value="a" label="Option A" />
            <DropdownMenuRadioItem value="b" label="Option B" />
          </DropdownMenuRadioGroup>
        </DropdownMenu>
        <DropdownMenu button={{label: 'Large menu', size: 'lg'}}>
          <DropdownMenuRadioGroup
            value={lg}
            onChange={setLg}
            aria-label="Large">
            <DropdownMenuRadioItem value="a" label="Option A" />
            <DropdownMenuRadioItem value="b" label="Option B" />
          </DropdownMenuRadioGroup>
        </DropdownMenu>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'The checkbox/radio control size is derived from the menu item size — a `sm` menu renders the small (18px) control, `md`/`lg` render the standard (22px) control. On coarse-pointer (touch) devices the control swaps to the inline-end of the row.',
      },
    },
  },
};
