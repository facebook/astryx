import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSCommandPalette,
  XDSCommandPaletteInput,
  XDSCommandPaletteList,
  XDSCommandPaletteItem,
  XDSCommandPaletteGroup,
  XDSCommandPaletteFooter,
} from '@xds/core/CommandPalette';
import {XDSButton} from '@xds/core/Button';
import {XDSDivider} from '@xds/core/Divider';

const meta: Meta<typeof XDSCommandPalette> = {
  title: 'Core/XDSCommandPalette',
  component: XDSCommandPalette,
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Whether the command palette is open',
    },
    width: {
      control: 'number',
      description: 'Width of the dialog',
    },
    maxHeight: {
      control: 'number',
      description: 'Maximum height of the dialog',
    },
    label: {
      control: 'text',
      description: 'Accessible label',
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSCommandPalette>;

const ALL_ITEMS = [
  {value: 'dashboard', label: 'Go to Dashboard', group: 'Navigation'},
  {value: 'settings', label: 'Open Settings', group: 'Navigation'},
  {value: 'profile', label: 'View Profile', group: 'Navigation'},
  {value: 'dark-mode', label: 'Toggle Dark Mode', group: 'Actions'},
  {value: 'new-file', label: 'Create New File', group: 'Actions'},
  {value: 'search', label: 'Search Files', group: 'Actions'},
];

/**
 * Full command palette with input, grouped items, and footer.
 */
export const Default: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [highlighted, setHighlighted] = useState(0);

    const filtered = ALL_ITEMS.filter(item =>
      item.label.toLowerCase().includes(search.toLowerCase()),
    );

    const groups = filtered.reduce(
      (acc, item) => {
        if (!acc[item.group]) acc[item.group] = [];
        acc[item.group].push(item);
        return acc;
      },
      {} as Record<string, typeof ALL_ITEMS>,
    );

    return (
      <>
        <XDSButton
          label="Open Command Palette"
          onClick={() => setIsOpen(true)}
        />
        <XDSCommandPalette isOpen={isOpen} onOpenChange={setIsOpen}>
          <XDSCommandPaletteInput
            value={search}
            onValueChange={v => {
              setSearch(v);
              setHighlighted(0);
            }}
            placeholder="Type a command..."
          />
          <XDSDivider />
          <XDSCommandPaletteList>
            {Object.entries(groups).map(([group, items]) => (
              <XDSCommandPaletteGroup key={group} heading={group}>
                {items.map(item => {
                  const flatIndex = filtered.indexOf(item);
                  return (
                    <XDSCommandPaletteItem
                      key={item.value}
                      value={item.value}
                      isHighlighted={flatIndex === highlighted}
                      onSelect={() => {
                        setIsOpen(false);
                        setSearch('');
                      }}>
                      {item.label}
                    </XDSCommandPaletteItem>
                  );
                })}
              </XDSCommandPaletteGroup>
            ))}
          </XDSCommandPaletteList>
          <XDSCommandPaletteFooter />
        </XDSCommandPalette>
      </>
    );
  },
};

/**
 * Flat list without groups.
 */
export const FlatList: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <XDSButton label="Open Flat Palette" onClick={() => setIsOpen(true)} />
        <XDSCommandPalette isOpen={isOpen} onOpenChange={setIsOpen}>
          <XDSCommandPaletteInput placeholder="Search..." />
          <XDSDivider />
          <XDSCommandPaletteList>
            <XDSCommandPaletteItem
              value="home"
              onSelect={() => setIsOpen(false)}>
              Go Home
            </XDSCommandPaletteItem>
            <XDSCommandPaletteItem
              value="settings"
              onSelect={() => setIsOpen(false)}>
              Settings
            </XDSCommandPaletteItem>
            <XDSCommandPaletteItem value="disabled" isDisabled>
              Disabled Item
            </XDSCommandPaletteItem>
          </XDSCommandPaletteList>
          <XDSCommandPaletteFooter />
        </XDSCommandPalette>
      </>
    );
  },
};

/**
 * With custom footer content.
 */
export const CustomFooter: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <XDSButton label="Open Custom Footer" onClick={() => setIsOpen(true)} />
        <XDSCommandPalette isOpen={isOpen} onOpenChange={setIsOpen}>
          <XDSCommandPaletteInput placeholder="Search..." />
          <XDSDivider />
          <XDSCommandPaletteList>
            <XDSCommandPaletteItem value="a" onSelect={() => setIsOpen(false)}>
              Option A
            </XDSCommandPaletteItem>
            <XDSCommandPaletteItem value="b" onSelect={() => setIsOpen(false)}>
              Option B
            </XDSCommandPaletteItem>
          </XDSCommandPaletteList>
          <XDSCommandPaletteFooter>
            <span>Tip: Use ⌘K to open this palette</span>
          </XDSCommandPaletteFooter>
        </XDSCommandPalette>
      </>
    );
  },
};
