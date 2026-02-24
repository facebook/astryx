import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSCommandPaletteProvider,
  useXDSCommandPaletteRegister,
  useXDSCommandPalette,
} from '@xds/core/CommandPalette';
import type {XDSCommand} from '@xds/core/CommandPalette';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';

const meta: Meta<typeof XDSCommandPaletteProvider> = {
  title: 'Core/XDSCommandPalette',
  component: XDSCommandPaletteProvider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A command palette (Cmd+K) for searching and executing commands. Uses a provider/context pattern where any component can register searchable commands.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof XDSCommandPaletteProvider>;

// =============================================================================
// Default
// =============================================================================

function DefaultCommands() {
  useXDSCommandPaletteRegister(
    [
      {
        id: 'home',
        label: 'Go to Home',
        keywords: ['dashboard', 'main'],
        onSelect: () => alert('Navigating to Home'),
        group: 'Navigation',
      },
      {
        id: 'settings',
        label: 'Open Settings',
        keywords: ['preferences', 'config'],
        shortcut: 'mod+,',
        onSelect: () => alert('Opening Settings'),
        group: 'Navigation',
      },
      {
        id: 'profile',
        label: 'View Profile',
        keywords: ['account', 'user'],
        onSelect: () => alert('Viewing Profile'),
        group: 'Navigation',
      },
      {
        id: 'search',
        label: 'Search',
        keywords: ['find', 'lookup'],
        shortcut: 'mod+f',
        onSelect: () => alert('Searching'),
        group: 'Actions',
      },
      {
        id: 'new-doc',
        label: 'Create New Document',
        keywords: ['add', 'create', 'new'],
        shortcut: 'mod+n',
        onSelect: () => alert('Creating document'),
        group: 'Actions',
      },
    ],
    [],
  );

  return null;
}

function DefaultExample() {
  const {open} = useXDSCommandPalette();

  return (
    <div style={{padding: 24}}>
      <XDSText type="body" color="secondary">
        Press Cmd+K (or Ctrl+K) to open the command palette, or click the button
        below.
      </XDSText>
      <div style={{marginTop: 12}}>
        <XDSButton label="Open Command Palette" onClick={() => open()} />
      </div>
      <DefaultCommands />
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <XDSCommandPaletteProvider placeholder="What do you need?">
      <DefaultExample />
    </XDSCommandPaletteProvider>
  ),
};

// =============================================================================
// Grouped Commands
// =============================================================================

function GroupedCommands() {
  useXDSCommandPaletteRegister(
    [
      {
        id: 'bold',
        label: 'Bold',
        shortcut: 'mod+b',
        onSelect: () => alert('Bold'),
        group: 'Formatting',
      },
      {
        id: 'italic',
        label: 'Italic',
        shortcut: 'mod+i',
        onSelect: () => alert('Italic'),
        group: 'Formatting',
      },
      {
        id: 'underline',
        label: 'Underline',
        shortcut: 'mod+u',
        onSelect: () => alert('Underline'),
        group: 'Formatting',
      },
      {
        id: 'undo',
        label: 'Undo',
        shortcut: 'mod+z',
        onSelect: () => alert('Undo'),
        group: 'Edit',
      },
      {
        id: 'redo',
        label: 'Redo',
        shortcut: 'mod+shift+z',
        onSelect: () => alert('Redo'),
        group: 'Edit',
      },
      {
        id: 'copy',
        label: 'Copy',
        shortcut: 'mod+c',
        onSelect: () => alert('Copy'),
        group: 'Edit',
      },
      {
        id: 'paste',
        label: 'Paste',
        shortcut: 'mod+v',
        onSelect: () => alert('Paste'),
        group: 'Edit',
      },
    ],
    [],
  );

  return null;
}

function GroupedExample() {
  const {open} = useXDSCommandPalette();

  return (
    <div style={{padding: 24}}>
      <XDSText type="body" color="secondary">
        Commands organized into groups (Formatting, Edit).
      </XDSText>
      <div style={{marginTop: 12}}>
        <XDSButton label="Open Palette" onClick={() => open()} />
      </div>
      <GroupedCommands />
    </div>
  );
}

export const GroupedCommands_: Story = {
  name: 'Grouped Commands',
  render: () => (
    <XDSCommandPaletteProvider>
      <GroupedExample />
    </XDSCommandPaletteProvider>
  ),
};

// =============================================================================
// Nested Pages
// =============================================================================

function NestedPageCommands() {
  useXDSCommandPaletteRegister(
    [
      {
        id: 'theme-switcher',
        label: 'Change Theme...',
        onSelect: () => {},
        page: 'Themes',
      },
      {
        id: 'theme-light',
        label: 'Light Theme',
        onSelect: () => alert('Switched to Light'),
        group: 'Themes',
      },
      {
        id: 'theme-dark',
        label: 'Dark Theme',
        onSelect: () => alert('Switched to Dark'),
        group: 'Themes',
      },
      {
        id: 'theme-system',
        label: 'System Theme',
        onSelect: () => alert('Switched to System'),
        group: 'Themes',
      },
      {
        id: 'save',
        label: 'Save',
        shortcut: 'mod+s',
        onSelect: () => alert('Saved'),
        group: 'File',
      },
    ],
    [],
  );

  return null;
}

function NestedPageExample() {
  const {open} = useXDSCommandPalette();

  return (
    <div style={{padding: 24}}>
      <XDSText type="body" color="secondary">
        Select &quot;Change Theme...&quot; to open a sub-page. Press Backspace
        on empty input or Escape to go back.
      </XDSText>
      <div style={{marginTop: 12}}>
        <XDSButton label="Open Palette" onClick={() => open()} />
      </div>
      <NestedPageCommands />
    </div>
  );
}

export const NestedPages: Story = {
  render: () => (
    <XDSCommandPaletteProvider>
      <NestedPageExample />
    </XDSCommandPaletteProvider>
  ),
};

// =============================================================================
// With History
// =============================================================================

function HistoryCommands() {
  useXDSCommandPaletteRegister(
    [
      {
        id: 'action-a',
        label: 'Action Alpha',
        onSelect: () => alert('Alpha'),
        group: 'Actions',
      },
      {
        id: 'action-b',
        label: 'Action Beta',
        onSelect: () => alert('Beta'),
        group: 'Actions',
      },
      {
        id: 'action-c',
        label: 'Action Charlie',
        onSelect: () => alert('Charlie'),
        group: 'Navigation',
      },
      {
        id: 'action-d',
        label: 'Action Delta',
        onSelect: () => alert('Delta'),
        group: 'Navigation',
      },
    ],
    [],
  );

  return null;
}

function HistoryExample() {
  const {open} = useXDSCommandPalette();

  return (
    <div style={{padding: 24}}>
      <XDSText type="body" color="secondary">
        Select some commands, then reopen the palette. Recently used commands
        appear in a &quot;Recent&quot; group at the top with invocation count,
        relative time, source group, and a clear (×) button. Try selecting the
        same command multiple times to see the count increase.
      </XDSText>
      <div style={{marginTop: 12}}>
        <XDSButton label="Open Palette" onClick={() => open()} />
      </div>
      <HistoryCommands />
    </div>
  );
}

export const WithHistory: Story = {
  render: () => (
    <XDSCommandPaletteProvider isPersistHistory>
      <HistoryExample />
    </XDSCommandPaletteProvider>
  ),
};

// =============================================================================
// Dynamic Commands (mount/unmount)
// =============================================================================

function ConditionalCommands({isActive}: {isActive: boolean}) {
  useXDSCommandPaletteRegister(
    isActive
      ? [
          {
            id: 'dynamic-1',
            label: 'Dynamic: Refresh Data',
            onSelect: () => alert('Refreshing'),
          },
          {
            id: 'dynamic-2',
            label: 'Dynamic: Export Results',
            onSelect: () => alert('Exporting'),
          },
        ]
      : [],
    [isActive],
  );

  return null;
}

function DynamicExample() {
  const {open} = useXDSCommandPalette();
  const [isActive, setIsActive] = useState(false);

  return (
    <div style={{padding: 24}}>
      <XDSText type="body" color="secondary">
        Toggle the panel to register/deregister commands dynamically. Open the
        palette to see the difference.
      </XDSText>
      <div
        style={{marginTop: 12, display: 'flex', gap: 8, alignItems: 'center'}}>
        <XDSButton
          label={isActive ? 'Deactivate Panel' : 'Activate Panel'}
          variant={isActive ? 'primary' : 'secondary'}
          onClick={() => setIsActive(prev => !prev)}
        />
        <XDSButton
          label="Open Palette"
          variant="secondary"
          onClick={() => open()}
        />
      </div>
      <ConditionalCommands isActive={isActive} />
    </div>
  );
}

export const DynamicCommands: Story = {
  render: () => (
    <XDSCommandPaletteProvider>
      <DynamicExample />
    </XDSCommandPaletteProvider>
  ),
};

// =============================================================================
// Search Highlighting
// =============================================================================

function HighlightCommands() {
  useXDSCommandPaletteRegister(
    [
      {
        id: 'hl-save',
        label: 'Save File',
        keywords: ['write', 'persist'],
        onSelect: () => alert('Saving'),
        group: 'File',
      },
      {
        id: 'hl-save-as',
        label: 'Save As...',
        keywords: ['export', 'rename'],
        onSelect: () => alert('Save As'),
        group: 'File',
      },
      {
        id: 'hl-open',
        label: 'Open File',
        keywords: ['load', 'read'],
        onSelect: () => alert('Opening'),
        group: 'File',
      },
      {
        id: 'hl-settings',
        label: 'Open Settings',
        keywords: ['preferences', 'config'],
        onSelect: () => alert('Settings'),
        group: 'Navigation',
      },
      {
        id: 'hl-export-csv',
        label: 'Export as CSV',
        keywords: ['download', 'spreadsheet'],
        onSelect: () => alert('Exporting CSV'),
        group: 'Actions',
      },
      {
        id: 'hl-export-json',
        label: 'Export as JSON',
        keywords: ['download', 'api'],
        onSelect: () => alert('Exporting JSON'),
        group: 'Actions',
      },
      {
        id: 'hl-docs',
        label: 'Documentation',
        keywords: ['help', 'wiki', 'reference'],
        onSelect: () => alert('Docs'),
        group: 'Navigation',
      },
      {
        id: 'hl-deploy',
        label: 'Deploy to Production',
        keywords: ['ship', 'release'],
        onSelect: () => alert('Deploying'),
        group: 'Actions',
      },
      {
        id: 'hl-search',
        label: 'Search Everything',
        keywords: ['find', 'lookup'],
        shortcut: 'mod+shift+f',
        onSelect: () => alert('Searching'),
        group: 'Actions',
      },
      {
        id: 'hl-format',
        label: 'Format Document',
        keywords: ['prettier', 'lint'],
        shortcut: 'mod+shift+f',
        onSelect: () => alert('Formatting'),
        group: 'Edit',
      },
    ],
    [],
  );

  return null;
}

function HighlightExample() {
  const {open} = useXDSCommandPalette();

  return (
    <div style={{padding: 24}}>
      <XDSText type="heading3">Search Highlighting</XDSText>
      <div style={{marginTop: 8}}>
        <XDSText type="body" color="secondary">
          Type a query to see matching characters highlighted in bold. Try
          typing &quot;exp&quot; (starts-with on Export), &quot;set&quot;
          (starts-with on Settings), &quot;doc&quot; (starts-with on
          Documentation), &quot;sfl&quot; (subsequence: Save File), or
          &quot;config&quot; (keyword match, no label highlight).
        </XDSText>
      </div>
      <div style={{marginTop: 16}}>
        <XDSButton
          label="Open Command Palette"
          variant="primary"
          onClick={() => open()}
        />
      </div>
      <HighlightCommands />
    </div>
  );
}

export const SearchHighlighting: Story = {
  render: () => (
    <XDSCommandPaletteProvider placeholder="Try typing: exp, set, doc, sfl...">
      <HighlightExample />
    </XDSCommandPaletteProvider>
  ),
};

// =============================================================================
// Async Loading
// =============================================================================

const REMOTE_COMMANDS: Record<string, XDSCommand[]> = {
  user: [
    {
      id: 'remote-user-1',
      label: 'User: List All Users',
      onSelect: () => alert('Listing users'),
    },
    {
      id: 'remote-user-2',
      label: 'User: Create New User',
      onSelect: () => alert('Creating user'),
    },
    {
      id: 'remote-user-3',
      label: 'User: Edit Permissions',
      onSelect: () => alert('Editing permissions'),
    },
  ],
  report: [
    {
      id: 'remote-report-1',
      label: 'Report: Monthly Revenue',
      onSelect: () => alert('Revenue report'),
    },
    {
      id: 'remote-report-2',
      label: 'Report: User Growth',
      onSelect: () => alert('Growth report'),
    },
  ],
  deploy: [
    {
      id: 'remote-deploy-1',
      label: 'Deploy: Staging Environment',
      onSelect: () => alert('Deploying to staging'),
    },
    {
      id: 'remote-deploy-2',
      label: 'Deploy: Production Canary',
      onSelect: () => alert('Canary deploy'),
    },
    {
      id: 'remote-deploy-3',
      label: 'Deploy: Rollback Last Release',
      onSelect: () => alert('Rolling back'),
    },
  ],
};

function simulateFetch(query: string): Promise<XDSCommand[]> {
  return new Promise(resolve => {
    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      const results: XDSCommand[] = [];
      for (const [key, commands] of Object.entries(REMOTE_COMMANDS)) {
        if (key.includes(lowerQuery) || lowerQuery.includes(key)) {
          results.push(...commands);
        } else {
          for (const cmd of commands) {
            if (cmd.label.toLowerCase().includes(lowerQuery)) {
              results.push(cmd);
            }
          }
        }
      }
      resolve(results);
    }, 1000);
  });
}

function AsyncLocalCommands() {
  useXDSCommandPaletteRegister(
    [
      {
        id: 'local-home',
        label: 'Go to Home',
        keywords: ['dashboard'],
        onSelect: () => alert('Home'),
        group: 'Navigation',
      },
      {
        id: 'local-settings',
        label: 'Open Settings',
        keywords: ['preferences'],
        shortcut: 'mod+,',
        onSelect: () => alert('Settings'),
        group: 'Navigation',
      },
      {
        id: 'local-search',
        label: 'Search Everything',
        keywords: ['find'],
        shortcut: 'mod+shift+f',
        onSelect: () => alert('Searching'),
        group: 'Actions',
      },
    ],
    [],
  );

  return null;
}

function AsyncExample() {
  const {open} = useXDSCommandPalette();

  return (
    <div style={{padding: 24}}>
      <XDSText type="heading3">Async Loading</XDSText>
      <div style={{marginTop: 8}}>
        <XDSText type="body" color="secondary">
          Local commands appear instantly while remote commands load with a
          spinner. Try typing &quot;user&quot;, &quot;report&quot;, or
          &quot;deploy&quot; to fetch remote commands (1-second simulated
          delay). Local commands like &quot;Home&quot; and &quot;Settings&quot;
          appear immediately.
        </XDSText>
      </div>
      <div style={{marginTop: 16}}>
        <XDSButton
          label="Open Command Palette"
          variant="primary"
          onClick={() => open()}
        />
      </div>
      <AsyncLocalCommands />
    </div>
  );
}

export const AsyncLoading: Story = {
  render: () => (
    <XDSCommandPaletteProvider
      commandFetcher={simulateFetch}
      fetchDebounceMs={200}
      placeholder="Type to search local + remote commands...">
      <AsyncExample />
    </XDSCommandPaletteProvider>
  ),
};

// =============================================================================
// Kitchen Sink
// =============================================================================

const KS_REMOTE_COMMANDS: Record<string, XDSCommand[]> = {
  user: [
    {
      id: 'ks-remote-user-list',
      label: 'List All Users',
      onSelect: () => alert('Listing users'),
      group: 'Users',
    },
    {
      id: 'ks-remote-user-create',
      label: 'Create New User',
      onSelect: () => alert('Creating user'),
      group: 'Users',
    },
    {
      id: 'ks-remote-user-perms',
      label: 'Edit User Permissions',
      onSelect: () => alert('Editing permissions'),
      group: 'Users',
    },
  ],
  report: [
    {
      id: 'ks-remote-report-rev',
      label: 'Monthly Revenue Report',
      onSelect: () => alert('Revenue report'),
      group: 'Reports',
    },
    {
      id: 'ks-remote-report-growth',
      label: 'User Growth Report',
      onSelect: () => alert('Growth report'),
      group: 'Reports',
    },
  ],
  deploy: [
    {
      id: 'ks-remote-deploy-staging',
      label: 'Deploy to Staging',
      onSelect: () => alert('Deploying to staging'),
      group: 'DevOps',
    },
    {
      id: 'ks-remote-deploy-canary',
      label: 'Deploy Production Canary',
      onSelect: () => alert('Canary deploy'),
      group: 'DevOps',
    },
    {
      id: 'ks-remote-deploy-rollback',
      label: 'Rollback Last Release',
      onSelect: () => alert('Rolling back'),
      group: 'DevOps',
    },
  ],
};

function kitchenSinkFetcher(query: string): Promise<XDSCommand[]> {
  return new Promise(resolve => {
    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      const results: XDSCommand[] = [];
      for (const [key, commands] of Object.entries(KS_REMOTE_COMMANDS)) {
        if (key.includes(lowerQuery) || lowerQuery.includes(key)) {
          results.push(...commands);
        } else {
          for (const cmd of commands) {
            if (cmd.label.toLowerCase().includes(lowerQuery)) {
              results.push(cmd);
            }
          }
        }
      }
      resolve(results);
    }, 800);
  });
}

function KitchenSinkCommands() {
  useXDSCommandPaletteRegister(
    [
      // Navigation group
      {
        id: 'ks-home',
        label: 'Go to Home',
        keywords: ['dashboard', 'main', 'start'],
        shortcut: 'mod+shift+h',
        onSelect: () => alert('Home'),
        group: 'Navigation',
        priority: 10,
      },
      {
        id: 'ks-projects',
        label: 'Browse Projects',
        keywords: ['repos', 'repositories', 'code'],
        onSelect: () => alert('Projects'),
        group: 'Navigation',
      },
      {
        id: 'ks-inbox',
        label: 'Open Inbox',
        keywords: ['messages', 'notifications', 'mail'],
        shortcut: 'mod+shift+i',
        onSelect: () => alert('Inbox'),
        group: 'Navigation',
      },
      {
        id: 'ks-calendar',
        label: 'View Calendar',
        keywords: ['schedule', 'meetings', 'events'],
        icon: 'calendar',
        onSelect: () => alert('Calendar'),
        group: 'Navigation',
      },
      {
        id: 'ks-docs',
        label: 'Documentation',
        keywords: ['help', 'wiki', 'guides', 'reference'],
        icon: 'externalLink',
        onSelect: () => alert('Docs'),
        group: 'Navigation',
      },

      // Actions group
      {
        id: 'ks-new-project',
        label: 'Create New Project',
        keywords: ['add', 'create', 'new', 'init'],
        shortcut: 'mod+n',
        onSelect: () => alert('New Project'),
        group: 'Actions',
        priority: 5,
      },
      {
        id: 'ks-new-file',
        label: 'Create New File',
        keywords: ['add', 'create', 'file', 'document'],
        onSelect: () => alert('New File'),
        group: 'Actions',
      },
      {
        id: 'ks-import',
        label: 'Import Data',
        keywords: ['upload', 'csv', 'json', 'load'],
        onSelect: () => alert('Import'),
        group: 'Actions',
      },
      {
        id: 'ks-export',
        label: 'Export as CSV',
        keywords: ['download', 'save', 'csv', 'spreadsheet'],
        onSelect: () => alert('Export CSV'),
        group: 'Actions',
      },
      {
        id: 'ks-export-json',
        label: 'Export as JSON',
        keywords: ['download', 'save', 'json', 'api'],
        onSelect: () => alert('Export JSON'),
        group: 'Actions',
      },

      // Settings — nested page
      {
        id: 'ks-settings',
        label: 'Settings...',
        keywords: ['preferences', 'config', 'options'],
        shortcut: 'mod+,',
        onSelect: () => {},
        page: 'Settings',
        group: 'System',
        priority: 3,
      },
      {
        id: 'ks-setting-general',
        label: 'General',
        keywords: ['language', 'region', 'locale'],
        onSelect: () => alert('General Settings'),
        group: 'Settings',
      },
      {
        id: 'ks-setting-notifications',
        label: 'Notifications',
        keywords: ['alerts', 'emails', 'push'],
        onSelect: () => alert('Notification Settings'),
        group: 'Settings',
      },
      {
        id: 'ks-setting-privacy',
        label: 'Privacy & Security',
        keywords: ['password', 'two-factor', '2fa', 'permissions'],
        onSelect: () => alert('Privacy Settings'),
        group: 'Settings',
      },
      {
        id: 'ks-setting-api',
        label: 'API Keys',
        keywords: ['tokens', 'keys', 'credentials', 'oauth'],
        onSelect: () => alert('API Key Settings'),
        group: 'Settings',
      },

      // Theme — nested page
      {
        id: 'ks-theme',
        label: 'Change Theme...',
        keywords: ['appearance', 'dark', 'light', 'colors'],
        onSelect: () => {},
        page: 'Theme',
        group: 'System',
      },
      {
        id: 'ks-theme-light',
        label: 'Light',
        onSelect: () => alert('Switched to Light'),
        group: 'Theme',
      },
      {
        id: 'ks-theme-dark',
        label: 'Dark',
        onSelect: () => alert('Switched to Dark'),
        group: 'Theme',
      },
      {
        id: 'ks-theme-system',
        label: 'System (auto)',
        onSelect: () => alert('Switched to System'),
        group: 'Theme',
      },
      {
        id: 'ks-theme-high-contrast',
        label: 'High Contrast',
        onSelect: () => alert('Switched to High Contrast'),
        group: 'Theme',
      },

      // Account group
      {
        id: 'ks-profile',
        label: 'View Profile',
        keywords: ['account', 'user', 'me'],
        onSelect: () => alert('Profile'),
        group: 'Account',
      },
      {
        id: 'ks-billing',
        label: 'Billing & Plans',
        keywords: ['subscription', 'payment', 'upgrade', 'pricing'],
        onSelect: () => alert('Billing'),
        group: 'Account',
      },
      {
        id: 'ks-team',
        label: 'Team Members',
        keywords: ['users', 'invite', 'collaborators', 'org'],
        onSelect: () => alert('Team'),
        group: 'Account',
      },
      {
        id: 'ks-signout',
        label: 'Sign Out',
        keywords: ['logout', 'exit', 'leave'],
        onSelect: () => alert('Signed out'),
        group: 'Account',
      },

      // Developer group
      {
        id: 'ks-console',
        label: 'Open Developer Console',
        keywords: ['devtools', 'debug', 'inspect'],
        shortcut: 'mod+shift+j',
        onSelect: () => alert('Console'),
        group: 'Developer',
      },
      {
        id: 'ks-network',
        label: 'View Network Requests',
        keywords: ['api', 'http', 'fetch', 'xhr'],
        onSelect: () => alert('Network'),
        group: 'Developer',
      },
      {
        id: 'ks-clear-cache',
        label: 'Clear Cache',
        keywords: ['reset', 'flush', 'storage', 'cookies'],
        onSelect: () => alert('Cache cleared'),
        group: 'Developer',
      },

      // Disabled command
      {
        id: 'ks-deploy',
        label: 'Deploy to Production',
        keywords: ['ship', 'release', 'publish'],
        onSelect: () => {},
        group: 'Actions',
        isEnabled: false,
      },
    ],
    [],
  );

  return null;
}

function KitchenSinkExample() {
  const {open} = useXDSCommandPalette();

  return (
    <div style={{padding: 24}}>
      <XDSText type="heading3">Kitchen Sink</XDSText>
      <div style={{marginTop: 8}}>
        <XDSText type="body" color="secondary">
          A fully-loaded command palette demonstrating all features: local
          commands appear instantly while remote commands load with a spinner.
          Multiple groups, keyboard shortcuts, nested sub-pages (Settings,
          Theme), search highlighting, priority ranking, icons, history tracking
          with metadata, and disabled commands. Try &quot;export&quot; or
          &quot;dark&quot; for local results, and &quot;user&quot;,
          &quot;report&quot;, or &quot;deploy&quot; to see async remote commands
          load alongside local matches.
        </XDSText>
      </div>
      <div style={{marginTop: 16}}>
        <XDSButton
          label="Open Command Palette"
          variant="primary"
          onClick={() => open()}
        />
      </div>
      <KitchenSinkCommands />
    </div>
  );
}

export const KitchenSink: Story = {
  render: () => (
    <XDSCommandPaletteProvider
      isPersistHistory
      maxHistory={5}
      commandFetcher={kitchenSinkFetcher}
      fetchDebounceMs={200}
      placeholder="Type a command or search..."
      footer={
        <div style={{display: 'flex', gap: 16, fontSize: 12}}>
          <span>
            <kbd
              style={{
                padding: '2px 5px',
                borderRadius: 3,
                backgroundColor: 'var(--color-deemphasized)',
                fontSize: 11,
              }}>
              &uarr;&darr;
            </kbd>{' '}
            Navigate
          </span>
          <span>
            <kbd
              style={{
                padding: '2px 5px',
                borderRadius: 3,
                backgroundColor: 'var(--color-deemphasized)',
                fontSize: 11,
              }}>
              &crarr;
            </kbd>{' '}
            Select
          </span>
          <span>
            <kbd
              style={{
                padding: '2px 5px',
                borderRadius: 3,
                backgroundColor: 'var(--color-deemphasized)',
                fontSize: 11,
              }}>
              esc
            </kbd>{' '}
            Close
          </span>
        </div>
      }>
      <KitchenSinkExample />
    </XDSCommandPaletteProvider>
  ),
};
