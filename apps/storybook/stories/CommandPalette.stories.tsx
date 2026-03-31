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

const meta: Meta<typeof XDSCommandPalette> = {
  title: 'Lab/XDSCommandPalette',
  component: XDSCommandPalette,
  tags: ['autodocs'],
  argTypes: {
    isOpen: {control: 'boolean'},
    width: {control: 'number'},
    maxHeight: {control: 'number'},
    label: {control: 'text'},
  },
};

export default meta;
type Story = StoryObj<typeof XDSCommandPalette>;

/**
 * Full command palette with grouped items, context-driven filtering, and selection.
 * Type to filter. Arrow keys navigate across groups. Enter selects.
 */
export const Default: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <XDSButton
          label="Open Command Palette (⌘K)"
          onClick={() => setIsOpen(true)}
        />
        <XDSCommandPalette
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          onValueChange={value => console.log('Selected:', value)}>
          <XDSCommandPaletteInput placeholder="Type a command..." />
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
 * Flat list without groups — includes a disabled item.
 */
export const FlatList: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <XDSButton label="Open Flat Palette" onClick={() => setIsOpen(true)} />
        <XDSCommandPalette isOpen={isOpen} onOpenChange={setIsOpen}>
          <XDSCommandPaletteInput placeholder="Search..." />
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
 * Pre-selected item — palette opens with a value already selected.
 */
export const WithSelectedItem: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const [value, setValue] = useState('Open Settings');
    return (
      <>
        <XDSButton
          label={\`Open (selected: \${value})\`}
          onClick={() => setIsOpen(true)}
        />
        <XDSCommandPalette
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          value={value}
          onValueChange={setValue}>
          <XDSCommandPaletteInput placeholder="Type a command..." />
          <XDSCommandPaletteList>
            <XDSCommandPaletteItem value="Go to Dashboard">
              Go to Dashboard
            </XDSCommandPaletteItem>
            <XDSCommandPaletteItem value="Open Settings">
              Open Settings
            </XDSCommandPaletteItem>
            <XDSCommandPaletteItem value="View Profile">
              View Profile
            </XDSCommandPaletteItem>
          </XDSCommandPaletteList>
          <XDSCommandPaletteFooter />
        </XDSCommandPalette>
      </>
    );
  },
};

/**
 * Empty results — type anything to filter all items out.
 */
export const EmptyResults: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(true);
    return (
      <XDSCommandPalette isOpen={isOpen} onOpenChange={setIsOpen}>
        <XDSCommandPaletteInput placeholder="Type to filter all items..." />
        <XDSCommandPaletteList>
          <XDSCommandPaletteItem value="zzz-alpha">zzz-alpha</XDSCommandPaletteItem>
          <XDSCommandPaletteItem value="zzz-beta">zzz-beta</XDSCommandPaletteItem>
        </XDSCommandPaletteList>
        <XDSCommandPaletteFooter />
      </XDSCommandPalette>
    );
  },
};

/**
 * Overflow — 30 items to verify scroll behavior and keyboard nav across scroll.
 */
export const ManyItems: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const items = Array.from({length: 30}, (_, i) => \`Command \${i + 1}\`);
    return (
      <>
        <XDSButton label="Open (30 items)" onClick={() => setIsOpen(true)} />
        <XDSCommandPalette isOpen={isOpen} onOpenChange={setIsOpen}>
          <XDSCommandPaletteInput placeholder="Search 30 commands..." />
          <XDSCommandPaletteList>
            {items.map(item => (
              <XDSCommandPaletteItem key={item} value={item}>
                {item}
              </XDSCommandPaletteItem>
            ))}
          </XDSCommandPaletteList>
          <XDSCommandPaletteFooter />
        </XDSCommandPalette>
      </>
    );
  },
};

/**
 * Long labels — verify layout under text pressure.
 */
export const LongLabels: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <XDSButton label="Open (long labels)" onClick={() => setIsOpen(true)} />
        <XDSCommandPalette isOpen={isOpen} onOpenChange={setIsOpen}>
          <XDSCommandPaletteInput placeholder="Search..." />
          <XDSCommandPaletteList>
            <XDSCommandPaletteItem value="short">Short</XDSCommandPaletteItem>
            <XDSCommandPaletteItem value="long1">
              This is a very long item label that pushes the width of the palette
            </XDSCommandPaletteItem>
            <XDSCommandPaletteItem value="long2">
              <XDSIcon icon="settings" size="sm" />
              Long item with icon and a lot of descriptive text after it
            </XDSCommandPaletteItem>
            <XDSCommandPaletteItem value="long3">
              Supercalifragilisticexpialidocious command name right here
            </XDSCommandPaletteItem>
          </XDSCommandPaletteList>
          <XDSCommandPaletteFooter />
        </XDSCommandPalette>
      </>
    );
  },
};

/**
 * Custom footer — children inherit supporting text treatment (12px, secondary).
 */
export const CustomFooter: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <XDSButton label="Open Custom Footer" onClick={() => setIsOpen(true)} />
        <XDSCommandPalette isOpen={isOpen} onOpenChange={setIsOpen}>
          <XDSCommandPaletteInput placeholder="Search..." />
          <XDSCommandPaletteList>
            <XDSCommandPaletteItem value="Option A">Option A</XDSCommandPaletteItem>
            <XDSCommandPaletteItem value="Option B">Option B</XDSCommandPaletteItem>
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
 * External filtering disabled — all items always shown regardless of input.
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
