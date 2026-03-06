import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSCommandPalette,
  XDSCommandPaletteInput,
  XDSCommandPaletteList,
  XDSCommandPaletteItem,
  XDSCommandPaletteGroup,
  XDSCommandPaletteEmpty,
  XDSCommandPaletteShortcut,
  XDSCommandPaletteFooter,
  XDSCommandPaletteSeparator,
  XDSCommandPaletteLoading,
  XDSCommandPaletteProvider,
  useXDSCommandPaletteRegister,
  useXDSCommandPalette,
} from '@xds/core/CommandPalette';
import {XDSIcon} from '@xds/core/Icon';
import {XDSButton} from '@xds/core/Button';

const meta: Meta<typeof XDSCommandPalette> = {
  title: 'Components/CommandPalette',
  component: XDSCommandPalette,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof XDSCommandPalette>;

// =============================================================================
// Layer 1: Composable
// =============================================================================

/**
 * Basic composable command palette with groups and keyboard shortcuts.
 * This demonstrates the Layer 1 API where you compose sub-components directly.
 */
export const Composable: Story = {
  render: function ComposableStory() {
    const [isShown, setIsShown] = useState(false);

    return (
      <>
        <XDSButton
          label="Open Command Palette (⌘K)"
          onClick={() => setIsShown(true)}
        />
        <XDSCommandPalette
          isShown={isShown}
          onOpenChange={open => setIsShown(open)}>
          <XDSCommandPaletteInput placeholder="Type a command or search..." />
          <XDSCommandPaletteList>
            <XDSCommandPaletteGroup heading="Navigation">
              <XDSCommandPaletteItem
                value="home"
                onSelect={() => setIsShown(false)}>
                <XDSIcon icon="home" size="sm" />
                <span style={{flex: 1}}>Go Home</span>
                <XDSCommandPaletteShortcut keys="mod+h" />
              </XDSCommandPaletteItem>
              <XDSCommandPaletteItem
                value="settings"
                onSelect={() => setIsShown(false)}>
                <XDSIcon icon="settings" size="sm" />
                <span style={{flex: 1}}>Settings</span>
                <XDSCommandPaletteShortcut keys="mod+," />
              </XDSCommandPaletteItem>
              <XDSCommandPaletteItem
                value="profile"
                onSelect={() => setIsShown(false)}>
                <XDSIcon icon="person" size="sm" />
                <span style={{flex: 1}}>Profile</span>
              </XDSCommandPaletteItem>
            </XDSCommandPaletteGroup>
            <XDSCommandPaletteSeparator />
            <XDSCommandPaletteGroup heading="Actions">
              <XDSCommandPaletteItem
                value="new-file"
                onSelect={() => setIsShown(false)}>
                <XDSIcon icon="add" size="sm" />
                <span style={{flex: 1}}>New File</span>
                <XDSCommandPaletteShortcut keys="mod+n" />
              </XDSCommandPaletteItem>
              <XDSCommandPaletteItem
                value="save"
                onSelect={() => setIsShown(false)}>
                <XDSIcon icon="check" size="sm" />
                <span style={{flex: 1}}>Save</span>
                <XDSCommandPaletteShortcut keys="mod+s" />
              </XDSCommandPaletteItem>
            </XDSCommandPaletteGroup>
            <XDSCommandPaletteEmpty>No results found</XDSCommandPaletteEmpty>
          </XDSCommandPaletteList>
          <XDSCommandPaletteFooter>
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </XDSCommandPaletteFooter>
        </XDSCommandPalette>
      </>
    );
  },
};

/**
 * Demonstrates disabled items and custom content.
 */
export const DisabledItems: Story = {
  render: function DisabledItemsStory() {
    const [isShown, setIsShown] = useState(false);

    return (
      <>
        <XDSButton label="Open Palette" onClick={() => setIsShown(true)} />
        <XDSCommandPalette
          isShown={isShown}
          onOpenChange={open => setIsShown(open)}>
          <XDSCommandPaletteInput />
          <XDSCommandPaletteList>
            <XDSCommandPaletteItem
              value="enabled"
              onSelect={() => setIsShown(false)}>
              Enabled Action
            </XDSCommandPaletteItem>
            <XDSCommandPaletteItem
              value="disabled"
              isDisabled
              onSelect={() => {}}>
              Disabled Action (no permission)
            </XDSCommandPaletteItem>
            <XDSCommandPaletteItem
              value="another"
              onSelect={() => setIsShown(false)}>
              Another Action
            </XDSCommandPaletteItem>
          </XDSCommandPaletteList>
        </XDSCommandPalette>
      </>
    );
  },
};

/**
 * Demonstrates filtering behavior — type to filter items.
 */
export const Filtering: Story = {
  render: function FilteringStory() {
    const [isShown, setIsShown] = useState(false);

    const items = [
      {value: 'dashboard', label: 'Dashboard', keywords: ['home', 'overview']},
      {
        value: 'users',
        label: 'User Management',
        keywords: ['people', 'accounts'],
      },
      {
        value: 'analytics',
        label: 'Analytics',
        keywords: ['data', 'reports', 'charts'],
      },
      {value: 'billing', label: 'Billing', keywords: ['payments', 'invoices']},
      {
        value: 'notifications',
        label: 'Notification Settings',
        keywords: ['alerts', 'emails'],
      },
      {
        value: 'api-keys',
        label: 'API Keys',
        keywords: ['tokens', 'credentials'],
      },
    ];

    return (
      <>
        <XDSButton label="Open Palette" onClick={() => setIsShown(true)} />
        <XDSCommandPalette
          isShown={isShown}
          onOpenChange={open => setIsShown(open)}>
          <XDSCommandPaletteInput placeholder="Search pages..." />
          <XDSCommandPaletteList>
            {items.map(item => (
              <XDSCommandPaletteItem
                key={item.value}
                value={item.value}
                keywords={item.keywords}
                onSelect={() => setIsShown(false)}>
                {item.label}
              </XDSCommandPaletteItem>
            ))}
            <XDSCommandPaletteEmpty>No pages found</XDSCommandPaletteEmpty>
          </XDSCommandPaletteList>
        </XDSCommandPalette>
      </>
    );
  },
};

// =============================================================================
// Layer 2: Provider
// =============================================================================

function NavigationCommands() {
  useXDSCommandPaletteRegister([
    {
      id: 'nav-home',
      label: 'Go Home',
      icon: 'home',
      group: 'Navigation',
      onSelect: () => alert('Home'),
    },
    {
      id: 'nav-settings',
      label: 'Settings',
      icon: 'settings',
      shortcut: 'mod+,',
      group: 'Navigation',
      onSelect: () => alert('Settings'),
    },
    {
      id: 'nav-profile',
      label: 'Profile',
      icon: 'person',
      group: 'Navigation',
      onSelect: () => alert('Profile'),
    },
  ]);
  return null;
}

function ActionCommands() {
  useXDSCommandPaletteRegister([
    {
      id: 'act-new',
      label: 'New File',
      icon: 'add',
      shortcut: 'mod+n',
      group: 'Actions',
      onSelect: () => alert('New File'),
    },
    {
      id: 'act-save',
      label: 'Save',
      icon: 'check',
      shortcut: 'mod+s',
      group: 'Actions',
      onSelect: () => alert('Save'),
    },
  ]);
  return null;
}

function OpenButton() {
  const {open} = useXDSCommandPalette();
  return <XDSButton label="Open Command Palette (⌘K)" onClick={open} />;
}

/**
 * Provider pattern with distributed command registration.
 * Commands are registered from separate components via useXDSCommandPaletteRegister.
 * Press ⌘K (or click the button) to open.
 */
export const Provider: Story = {
  render: function ProviderStory() {
    return (
      <XDSCommandPaletteProvider shortcut="mod+k">
        <NavigationCommands />
        <ActionCommands />
        <OpenButton />
      </XDSCommandPaletteProvider>
    );
  },
};

/**
 * Loading state for async command fetching.
 */
export const Loading: Story = {
  render: function LoadingStory() {
    const [isShown, setIsShown] = useState(false);

    return (
      <>
        <XDSButton label="Open Palette" onClick={() => setIsShown(true)} />
        <XDSCommandPalette
          isShown={isShown}
          onOpenChange={open => setIsShown(open)}>
          <XDSCommandPaletteInput placeholder="Search..." />
          <XDSCommandPaletteList>
            <XDSCommandPaletteLoading>Searching...</XDSCommandPaletteLoading>
          </XDSCommandPaletteList>
        </XDSCommandPalette>
      </>
    );
  },
};
