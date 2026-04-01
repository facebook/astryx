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
 * Action launcher — the most common command palette pattern.
 * Each item triggers a one-shot action and the palette closes.
 * No selection state is tracked.
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
          input={<XDSCommandPaletteInput placeholder="Type a command..." />}
          footer={<XDSCommandPaletteFooter />}>
          <XDSCommandPaletteList>
            <XDSCommandPaletteGroup heading="Navigation">
              <XDSCommandPaletteItem
                value="dashboard"
                onSelect={() => console.log('Navigate to dashboard')}>
                <XDSIcon icon="home" size="sm" />
                Go to Dashboard
              </XDSCommandPaletteItem>
              <XDSCommandPaletteItem
                value="settings"
                onSelect={() => console.log('Navigate to settings')}>
                <XDSIcon icon="settings" size="sm" />
                Open Settings
              </XDSCommandPaletteItem>
              <XDSCommandPaletteItem
                value="profile"
                onSelect={() => console.log('Navigate to profile')}>
                <XDSIcon icon="user" size="sm" />
                View Profile
              </XDSCommandPaletteItem>
            </XDSCommandPaletteGroup>
            <XDSCommandPaletteGroup heading="Actions">
              <XDSCommandPaletteItem
                value="dark-mode"
                keywords={['theme', 'appearance']}
                onSelect={() => console.log('Toggle dark mode')}>
                Toggle Dark Mode
              </XDSCommandPaletteItem>
              <XDSCommandPaletteItem
                value="new-file"
                onSelect={() => console.log('Create new file')}>
                Create New File
              </XDSCommandPaletteItem>
              <XDSCommandPaletteItem
                value="search"
                onSelect={() => console.log('Open file search')}>
                <XDSIcon icon="search" size="sm" />
                Search Files
              </XDSCommandPaletteItem>
            </XDSCommandPaletteGroup>
          </XDSCommandPaletteList>
        </XDSCommandPalette>
      </>
    );
  },
};

/**
 * Flat launcher without groups — includes a disabled item.
 * Items use `onSelect` for fire-and-forget actions.
 */
export const FlatList: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <XDSButton label="Open Flat Palette" onClick={() => setIsOpen(true)} />
        <XDSCommandPalette
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          input={<XDSCommandPaletteInput placeholder="Search..." />}
          footer={<XDSCommandPaletteFooter />}>
          <XDSCommandPaletteList>
            <XDSCommandPaletteItem
              value="home"
              onSelect={() => console.log('Go home')}>
              Go Home
            </XDSCommandPaletteItem>
            <XDSCommandPaletteItem
              value="settings"
              onSelect={() => console.log('Open settings')}>
              Settings
            </XDSCommandPaletteItem>
            <XDSCommandPaletteItem value="disabled" isDisabled>
              Disabled Item
            </XDSCommandPaletteItem>
            <XDSCommandPaletteItem
              value="profile"
              onSelect={() => console.log('View profile')}>
              Profile
            </XDSCommandPaletteItem>
          </XDSCommandPaletteList>
        </XDSCommandPalette>
      </>
    );
  },
};

/**
 * Picker mode — use when the palette represents a choice with persistent selection.
 * The selected item is visually highlighted when the palette reopens.
 * Use `value` + `onValueChange` to track which option is active.
 *
 * Good for: theme switchers, workspace pickers, language selectors.
 */
export const Picker: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const [theme, setTheme] = useState('light');

    return (
      <>
        <XDSButton
          label={`Theme: ${theme}`}
          onClick={() => setIsOpen(true)}
        />
        <XDSCommandPalette
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          value={theme}
          onValueChange={setTheme}
          input={<XDSCommandPaletteInput placeholder="Choose a theme..." />}>
          <XDSCommandPaletteList>
            <XDSCommandPaletteItem value="light">Light</XDSCommandPaletteItem>
            <XDSCommandPaletteItem value="dark">Dark</XDSCommandPaletteItem>
            <XDSCommandPaletteItem value="system">System</XDSCommandPaletteItem>
          </XDSCommandPaletteList>
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
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <XDSButton label="Open (type to empty)" onClick={() => setIsOpen(true)} />
        <XDSCommandPalette
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          input={<XDSCommandPaletteInput placeholder="Type to filter all items out..." />}
          footer={<XDSCommandPaletteFooter />}>
          <XDSCommandPaletteList>
            <XDSCommandPaletteItem value="zzz-alpha">zzz-alpha</XDSCommandPaletteItem>
            <XDSCommandPaletteItem value="zzz-beta">zzz-beta</XDSCommandPaletteItem>
          </XDSCommandPaletteList>
        </XDSCommandPalette>
      </>
    );
  },
};

/**
 * Overflow — 30 items to verify scroll behavior and keyboard nav across scroll.
 */
export const ManyItems: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const items = Array.from({length: 30}, (_, i) => `Command ${i + 1}`);
    return (
      <>
        <XDSButton label="Open (30 items)" onClick={() => setIsOpen(true)} />
        <XDSCommandPalette
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          input={<XDSCommandPaletteInput placeholder="Search 30 commands..." />}
          footer={<XDSCommandPaletteFooter />}>
          <XDSCommandPaletteList>
            {items.map(item => (
              <XDSCommandPaletteItem
                key={item}
                value={item}
                onSelect={() => console.log('Run:', item)}>
                {item}
              </XDSCommandPaletteItem>
            ))}
          </XDSCommandPaletteList>
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
        <XDSCommandPalette
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          input={<XDSCommandPaletteInput placeholder="Search..." />}
          footer={<XDSCommandPaletteFooter />}>
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
        <XDSCommandPalette
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          input={<XDSCommandPaletteInput placeholder="Search..." />}
          footer={
            <XDSCommandPaletteFooter>
              <span>Tip: Use ⌘K to open this palette</span>
            </XDSCommandPaletteFooter>
          }>
          <XDSCommandPaletteList>
            <XDSCommandPaletteItem
              value="option-a"
              onSelect={() => console.log('Option A')}>
              Option A
            </XDSCommandPaletteItem>
            <XDSCommandPaletteItem
              value="option-b"
              onSelect={() => console.log('Option B')}>
              Option B
            </XDSCommandPaletteItem>
          </XDSCommandPaletteList>
        </XDSCommandPalette>
      </>
    );
  },
};

/**
 * External filtering disabled — all items always shown regardless of input.
 * Use when filtering is handled server-side or externally.
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
          isFiltered={false}
          input={<XDSCommandPaletteInput placeholder="Search (no filtering)..." />}
          footer={<XDSCommandPaletteFooter />}>
          <XDSCommandPaletteList>
            <XDSCommandPaletteItem
              value="always-a"
              onSelect={() => console.log('A')}>
              Always Visible A
            </XDSCommandPaletteItem>
            <XDSCommandPaletteItem
              value="always-b"
              onSelect={() => console.log('B')}>
              Always Visible B
            </XDSCommandPaletteItem>
            <XDSCommandPaletteItem
              value="always-c"
              onSelect={() => console.log('C')}>
              Always Visible C
            </XDSCommandPaletteItem>
          </XDSCommandPaletteList>
        </XDSCommandPalette>
      </>
    );
  },
};
