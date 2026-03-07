import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {
  XDSCommandPalette,
  XDSCommandPaletteInput,
  XDSCommandPaletteList,
  XDSCommandPaletteItem,
  XDSCommandPaletteGroup,
  XDSCommandPaletteFooter,
  XDSCommandPaletteProvider,
  useXDSCommandPaletteRegister,
  useXDSCommandPalette,
} from '@xds/core/CommandPalette';
import {XDSKbd} from '@xds/core/Kbd';
import {XDSDivider} from '@xds/core/Divider';
import {XDSIcon} from '@xds/core/Icon';
import {XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';

const styles = stylex.create({
  itemLabel: {
    flex: 1,
  },
});

const meta: Meta<typeof XDSCommandPalette> = {
  title: 'Components/XDSCommandPalette',
  component: XDSCommandPalette,
  tags: ['autodocs'],
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
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <XDSButton
          label="Open Command Palette (\u2318K)"
          onClick={() => setIsOpen(true)}
        />
        <XDSCommandPalette
          isOpen={isOpen}
          onOpenChange={open => setIsOpen(open)}>
          <XDSCommandPaletteInput placeholder="Type a command or search..." />
          <XDSCommandPaletteList>
            <XDSCommandPaletteGroup heading="Navigation">
              <XDSCommandPaletteItem
                value="home"
                onSelect={() => setIsOpen(false)}>
                <XDSIcon icon="home" size="sm" />
                <XDSText xstyle={styles.itemLabel}>Go Home</XDSText>
                <XDSKbd keys="mod+h" />
              </XDSCommandPaletteItem>
              <XDSCommandPaletteItem
                value="settings"
                onSelect={() => setIsOpen(false)}>
                <XDSIcon icon="settings" size="sm" />
                <XDSText xstyle={styles.itemLabel}>Settings</XDSText>
                <XDSKbd keys="mod+," />
              </XDSCommandPaletteItem>
              <XDSCommandPaletteItem
                value="profile"
                onSelect={() => setIsOpen(false)}>
                <XDSIcon icon="person" size="sm" />
                <XDSText>Profile</XDSText>
              </XDSCommandPaletteItem>
            </XDSCommandPaletteGroup>
            <XDSDivider />
            <XDSCommandPaletteGroup heading="Actions">
              <XDSCommandPaletteItem
                value="new-file"
                onSelect={() => setIsOpen(false)}>
                <XDSIcon icon="add" size="sm" />
                <XDSText xstyle={styles.itemLabel}>New File</XDSText>
                <XDSKbd keys="mod+n" />
              </XDSCommandPaletteItem>
              <XDSCommandPaletteItem
                value="save"
                onSelect={() => setIsOpen(false)}>
                <XDSIcon icon="check" size="sm" />
                <XDSText xstyle={styles.itemLabel}>Save</XDSText>
                <XDSKbd keys="mod+s" />
              </XDSCommandPaletteItem>
            </XDSCommandPaletteGroup>
          </XDSCommandPaletteList>
          <XDSCommandPaletteFooter>
            <XDSText size="xsm" color="secondary">
              \u2191\u2193 Navigate
            </XDSText>
            <XDSText size="xsm" color="secondary">
              \u21B5 Select
            </XDSText>
            <XDSText size="xsm" color="secondary">
              Esc Close
            </XDSText>
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
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <XDSButton label="Open Palette" onClick={() => setIsOpen(true)} />
        <XDSCommandPalette
          isOpen={isOpen}
          onOpenChange={open => setIsOpen(open)}>
          <XDSCommandPaletteInput />
          <XDSCommandPaletteList>
            <XDSCommandPaletteItem
              value="enabled"
              onSelect={() => setIsOpen(false)}>
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
              onSelect={() => setIsOpen(false)}>
              Another Action
            </XDSCommandPaletteItem>
          </XDSCommandPaletteList>
        </XDSCommandPalette>
      </>
    );
  },
};

/**
 * Demonstrates filtering behavior \u2014 type to filter items.
 */
export const Filtering: Story = {
  render: function FilteringStory() {
    const [isOpen, setIsOpen] = useState(false);

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
        <XDSButton label="Open Palette" onClick={() => setIsOpen(true)} />
        <XDSCommandPalette
          isOpen={isOpen}
          onOpenChange={open => setIsOpen(open)}>
          <XDSCommandPaletteInput placeholder="Search pages..." />
          <XDSCommandPaletteList>
            {items.map(item => (
              <XDSCommandPaletteItem
                key={item.value}
                value={item.value}
                keywords={item.keywords}
                onSelect={() => setIsOpen(false)}>
                {item.label}
              </XDSCommandPaletteItem>
            ))}
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
  return <XDSButton label="Open Command Palette (\u2318K)" onClick={open} />;
}

/**
 * Provider pattern with distributed command registration.
 * Commands are registered from separate components via useXDSCommandPaletteRegister.
 * Press \u2318K (or click the button) to open.
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
