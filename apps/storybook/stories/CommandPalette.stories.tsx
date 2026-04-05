/**
 * CommandPalette stories
 *
 * Progressive disclosure:
 * 1. No props beyond searchSource — default input, footer, rendering
 * 2. renderItem — custom item content, grouping still automatic
 */
import {useState, useMemo} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  XDSCommandPalette,
  XDSCommandPaletteInput,
  XDSCommandPaletteItem,
  XDSCommandPaletteGroup,
  XDSCommandPaletteFooter,
} from '@xds/lab';
import {XDSButton} from '@xds/core/Button';
import {XDSIcon} from '@xds/core/Icon';
import {createStaticSource} from '@xds/core/Typeahead';
import type {XDSSearchSource, XDSSearchableItem} from '@xds/core/Typeahead';

const meta: Meta<typeof XDSCommandPalette> = {
  title: 'Lab/XDSCommandPalette',
  component: XDSCommandPalette,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof XDSCommandPalette>;

// ─── Default ─────────────────────────────────────────────────────────────────

/** Simplest case — no input/footer/renderItem needed. */
export const Default: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const source = useMemo(
      () =>
        createStaticSource([
          {id: 'home', label: 'Home'},
          {id: 'settings', label: 'Settings'},
          {id: 'profile', label: 'Profile'},
          {id: 'dashboard', label: 'Dashboard'},
          {id: 'help', label: 'Help'},
        ]),
      [],
    );
    return (
      <>
        <XDSButton
          label="Open Command Palette"
          onClick={() => setIsOpen(true)}
        />
        <XDSCommandPalette
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          searchSource={source}
        />
      </>
    );
  },
};

// ─── Auto-grouping ────────────────────────────────────────────────────────────

/** Groups detected automatically from auxiliaryData.group. No custom rendering needed. */
export const AutoGrouped: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const source = useMemo(
      () =>
        createStaticSource([
          {id: 'home', label: 'Home', auxiliaryData: {group: 'Navigation'}},
          {
            id: 'settings',
            label: 'Settings',
            auxiliaryData: {group: 'Navigation'},
          },
          {
            id: 'profile',
            label: 'Profile',
            auxiliaryData: {group: 'Navigation'},
          },
          {
            id: 'new-file',
            label: 'New File',
            auxiliaryData: {group: 'Actions'},
          },
          {id: 'save', label: 'Save', auxiliaryData: {group: 'Actions'}},
          {id: 'export', label: 'Export', auxiliaryData: {group: 'Actions'}},
        ]),
      [],
    );
    return (
      <>
        <XDSButton label="Open Grouped" onClick={() => setIsOpen(true)} />
        <XDSCommandPalette
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          searchSource={source}
        />
      </>
    );
  },
};

// ─── Custom rendering via renderItem ─────────────────────────────────────────

type RichCommand = XDSSearchableItem<{
  icon?: string;
  group?: string;
  shortcut?: string;
  keywords?: string[];
}>;

/**
 * Custom item content via renderItem — icons and shortcuts.
 * Grouping remains automatic via auxiliaryData.group.
 */
export const WithRenderItem: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const commands: RichCommand[] = [
      {
        id: 'dashboard',
        label: 'Go to Dashboard',
        auxiliaryData: {icon: 'home', group: 'Navigation'},
      },
      {
        id: 'settings',
        label: 'Open Settings',
        auxiliaryData: {icon: 'settings', group: 'Navigation', shortcut: '⌘,'},
      },
      {
        id: 'profile',
        label: 'View Profile',
        auxiliaryData: {icon: 'user', group: 'Navigation'},
      },
      {
        id: 'dark-mode',
        label: 'Toggle Dark Mode',
        auxiliaryData: {group: 'Actions', keywords: ['theme', 'appearance']},
      },
      {
        id: 'new-file',
        label: 'Create New File',
        auxiliaryData: {group: 'Actions', shortcut: '⌘N'},
      },
      {
        id: 'search',
        label: 'Search Files',
        auxiliaryData: {icon: 'search', group: 'Actions', shortcut: '⌘P'},
      },
    ];
    const source = useMemo(
      () =>
        createStaticSource(commands, {
          keywords: item => item.auxiliaryData?.keywords ?? [],
        }),
      [],
    );
    return (
      <>
        <XDSButton label="Open Rich Palette" onClick={() => setIsOpen(true)} />
        <XDSCommandPalette
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          searchSource={source}
          renderItem={(item: RichCommand) => (
            <span
              style={{display: 'flex', alignItems: 'center', gap: 8, flex: 1}}>
              {item.auxiliaryData?.icon && (
                <XDSIcon icon={item.auxiliaryData.icon} size="sm" />
              )}
              <span style={{flex: 1}}>{item.label}</span>
              {item.auxiliaryData?.shortcut && (
                <span style={{fontSize: 12, opacity: 0.5}}>
                  {item.auxiliaryData.shortcut}
                </span>
              )}
            </span>
          )}
        />
      </>
    );
  },
};

// ─── Picker mode ─────────────────────────────────────────────────────────────

/** Selection persists across opens. isSelected passed to renderItem. */
export const Picker: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const [theme, setTheme] = useState('light');
    const source = useMemo(
      () =>
        createStaticSource([
          {id: 'light', label: 'Light'},
          {id: 'dark', label: 'Dark'},
          {id: 'system', label: 'System'},
        ]),
      [],
    );
    return (
      <>
        <XDSButton label={`Theme: ${theme}`} onClick={() => setIsOpen(true)} />
        <XDSCommandPalette
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          searchSource={source}
          value={theme}
          onValueChange={v => {
            setTheme(v);
            setIsOpen(false);
          }}
          renderItem={(item, isSelected) => (
            <span
              style={{display: 'flex', alignItems: 'center', gap: 8, flex: 1}}>
              <span style={{flex: 1}}>{item.label}</span>
              {isSelected && <XDSIcon icon="check" size="sm" />}
            </span>
          )}
        />
      </>
    );
  },
};

// ─── Async search ─────────────────────────────────────────────────────────────

/** Server-side search. Spinner shown while pending. Empty state on no results. */
export const AsyncSearch: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const source = useMemo<XDSSearchSource>(
      () => ({
        _controller: null as AbortController | null,
        cancel() {
          this._controller?.abort();
        },
        async search(query: string) {
          this.cancel();
          this._controller = new AbortController();
          await new Promise(r => setTimeout(r, 400));
          const all = [
            {id: 'readme', label: 'README.md'},
            {id: 'package', label: 'package.json'},
            {id: 'tsconfig', label: 'tsconfig.json'},
            {id: 'index', label: 'src/index.ts'},
            {id: 'app', label: 'src/App.tsx'},
          ];
          return all.filter(f =>
            f.label.toLowerCase().includes(query.toLowerCase()),
          );
        },
        bootstrap() {
          return [];
        },
      }),
      [],
    );
    return (
      <>
        <XDSButton label="Open File Search" onClick={() => setIsOpen(true)} />
        <XDSCommandPalette
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          searchSource={source}
          input={<XDSCommandPaletteInput placeholder="Search files..." />}
          emptyBootstrapText="Type a filename to search"
          emptySearchText="No files found"
        />
      </>
    );
  },
};

// ─── Keywords ────────────────────────────────────────────────────────────────

/** Type "theme" or "appearance" to find "Toggle Dark Mode". */
export const WithKeywords: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const commands: XDSSearchableItem<{aliases?: string[]}>[] = [
      {id: 'home', label: 'Home'},
      {
        id: 'dark-mode',
        label: 'Toggle Dark Mode',
        auxiliaryData: {aliases: ['theme', 'appearance']},
      },
      {
        id: 'font-size',
        label: 'Change Font Size',
        auxiliaryData: {aliases: ['text', 'zoom']},
      },
    ];
    const source = useMemo(
      () =>
        createStaticSource(commands, {
          keywords: item => item.auxiliaryData?.aliases ?? [],
        }),
      [],
    );
    return (
      <>
        <XDSButton label="Open (try 'theme')" onClick={() => setIsOpen(true)} />
        <XDSCommandPalette
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          searchSource={source}
        />
      </>
    );
  },
};

// ─── Many items (overflow / scroll test) ─────────────────────────────────────

/**
 * 50 items across 5 groups. Verifies the list scrolls within the dialog
 * rather than expanding it past maxHeight.
 */
export const ManyItems: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const groups = ['Files', 'Actions', 'Navigation', 'Settings', 'Recent'];
    const items = Array.from({length: 50}, (_, i) => ({
      id: `item-${i}`,
      label: `Item ${i + 1}`,
      auxiliaryData: {group: groups[i % groups.length]},
    }));
    const source = useMemo(() => createStaticSource(items), []);
    return (
      <>
        <XDSButton label="Open (50 items)" onClick={() => setIsOpen(true)} />
        <XDSCommandPalette
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          searchSource={source}
        />
      </>
    );
  },
};

// ─── Custom footer ────────────────────────────────────────────────────────────

/** Replacing the footer with custom content. */
export const CustomFooter: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const source = useMemo(
      () =>
        createStaticSource([
          {id: 'home', label: 'Home'},
          {id: 'settings', label: 'Settings'},
        ]),
      [],
    );
    return (
      <>
        <XDSButton label="Open" onClick={() => setIsOpen(true)} />
        <XDSCommandPalette
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          searchSource={source}
          footer={
            <XDSCommandPaletteFooter>
              <span>Pro tip: use ⌘K to open anywhere</span>
            </XDSCommandPaletteFooter>
          }
        />
      </>
    );
  },
};
