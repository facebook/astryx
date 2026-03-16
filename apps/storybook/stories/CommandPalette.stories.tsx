import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSCommandPalette,
  XDSCommandPaletteInput,
  XDSCommandPaletteList,
  XDSCommandPaletteItem,
  XDSCommandPaletteGroup,
  XDSCommandPaletteFooter,
} from '@xds/lab';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {XDSDivider} from '@xds/core/Divider';

const meta: Meta<typeof XDSCommandPalette> = {
  title: 'Lab/XDSCommandPalette',
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

/**
 * Full command palette with context-driven filtering and selection.
 * Type to filter items. Arrow keys to navigate. Enter to select.
 */
export const Default: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <XDSButton
          label="Open Command Palette (or press ⌘K)"
          onClick={() => setIsOpen(true)}
        />
        <XDSCommandPalette
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          onValueChange={value => {
            console.log('Selected:', value);
          }}>
          <XDSCommandPaletteInput placeholder="Type a command..." />
          <XDSDivider />
          <XDSCommandPaletteList>
            <XDSCommandPaletteGroup heading="Navigation">
              <XDSCommandPaletteItem value="Go to Dashboard">
                <XDSIcon icon="home" size="sm" />
                Go to Dashboard
              </XDSCommandPaletteItem>
              <XDSCommandPaletteItem value="Open Settings">
                <XDSIcon icon="settings" size="sm" />
                Open Settings
              </XDSCommandPaletteItem>
              <XDSCommandPaletteItem value="View Profile">
                <XDSIcon icon="user" size="sm" />
                View Profile
              </XDSCommandPaletteItem>
            </XDSCommandPaletteGroup>
            <XDSCommandPaletteGroup heading="Actions">
              <XDSCommandPaletteItem
                value="Toggle Dark Mode"
                keywords={['theme', 'appearance']}>
                Toggle Dark Mode
              </XDSCommandPaletteItem>
              <XDSCommandPaletteItem value="Create New File">
                Create New File
              </XDSCommandPaletteItem>
              <XDSCommandPaletteItem value="Search Files">
                <XDSIcon icon="search" size="sm" />
                Search Files
              </XDSCommandPaletteItem>
            </XDSCommandPaletteGroup>
          </XDSCommandPaletteList>
          <XDSCommandPaletteFooter />
        </XDSCommandPalette>
      </>
    );
  },
};

/**
 * Flat list without groups — items filter automatically.
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
            <XDSCommandPaletteItem value="Home">Go Home</XDSCommandPaletteItem>
            <XDSCommandPaletteItem value="Settings">
              Settings
            </XDSCommandPaletteItem>
            <XDSCommandPaletteItem value="Disabled Item" isDisabled>
              Disabled Item
            </XDSCommandPaletteItem>
            <XDSCommandPaletteItem value="Profile">
              Profile
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
            <XDSCommandPaletteItem value="Option A">
              Option A
            </XDSCommandPaletteItem>
            <XDSCommandPaletteItem value="Option B">
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

/**
 * With external filtering disabled — all items always shown.
 */
export const UnfilteredList: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <XDSButton label="Open Unfiltered" onClick={() => setIsOpen(true)} />
        <XDSCommandPalette
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          isFiltered={false}>
          <XDSCommandPaletteInput placeholder="Search (no filtering)..." />
          <XDSDivider />
          <XDSCommandPaletteList>
            <XDSCommandPaletteItem value="Always Visible A">
              Always Visible A
            </XDSCommandPaletteItem>
            <XDSCommandPaletteItem value="Always Visible B">
              Always Visible B
            </XDSCommandPaletteItem>
            <XDSCommandPaletteItem value="Always Visible C">
              Always Visible C
            </XDSCommandPaletteItem>
          </XDSCommandPaletteList>
          <XDSCommandPaletteFooter />
        </XDSCommandPalette>
      </>
    );
  },
};
