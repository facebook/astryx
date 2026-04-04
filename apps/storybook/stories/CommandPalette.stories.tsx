/**
 * CommandPalette with searchSource API — story sketches
 *
 * Progressive disclosure:
 * 1. No children -> default rendering (label text, auto-groups by auxiliaryData.group)
 * 2. children render function -> full control over item layout and grouping
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

// --- Simplest case ---

/** No children -- default rendering. Each item renders its label. */
export const Default: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const source = useMemo(() => createStaticSource([
      {id: 'home', label: 'Home'},
      {id: 'settings', label: 'Settings'},
      {id: 'profile', label: 'Profile'},
      {id: 'dashboard', label: 'Dashboard'},
      {id: 'help', label: 'Help'},
    ]), []);

    return (
      <>
        <XDSButton label="Open Command Palette" onClick={() => setIsOpen(true)} />
        <XDSCommandPalette
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          searchSource={source}
          input={<XDSCommandPaletteInput placeholder="Type a command..." />}
          footer={<XDSCommandPaletteFooter />}
        />
      </>
    );
  },
};

// --- Auto-grouping ---

/**
 * Groups detected automatically from auxiliaryData.group.
 * Still no children -- the default renderer handles grouping.
 */
export const AutoGrouped: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const source = useMemo(() => createStaticSource([
      {id: 'home', label: 'Home', auxiliaryData: {group: 'Navigation'}},
      {id: 'settings', label: 'Settings', auxiliaryData: {group: 'Navigation'}},
      {id: 'profile', label: 'Profile', auxiliaryData: {group: 'Navigation'}},
      {id: 'new-file', label: 'New File', auxiliaryData: {group: 'Actions'}},
      {id: 'save', label: 'Save', auxiliaryData: {group: 'Actions'}},
      {id: 'export', label: 'Export', auxiliaryData: {group: 'Actions'}},
    ]), []);

    return (
      <>
        <XDSButton label="Open Grouped" onClick={() => setIsOpen(true)} />
        <XDSCommandPalette
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          searchSource={source}
          input={<XDSCommandPaletteInput placeholder="Search commands..." />}
          footer={<XDSCommandPaletteFooter />}
        />
      </>
    );
  },
};

// --- Keywords ---

/** Type "theme" or "appearance" to find "Toggle Dark Mode". */
export const WithKeywords: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);

    const commands: XDSSearchableItem<{aliases?: string[]}>[] = [
      {id: 'home', label: 'Home'},
      {id: 'dark-mode', label: 'Toggle Dark Mode', auxiliaryData: {aliases: ['theme', 'appearance']}},
      {id: 'font-size', label: 'Change Font Size', auxiliaryData: {aliases: ['text', 'zoom']}},
    ];

    const source = useMemo(
      () => createStaticSource(commands, {
        keywords: (item) => item.auxiliaryData?.aliases ?? [],
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
          input={<XDSCommandPaletteInput placeholder="Search..." />}
          footer={<XDSCommandPaletteFooter />}
        />
      </>
    );
  },
};

// --- Custom rendering with groups ---

type CommandItem = XDSSearchableItem<{
  icon?: string;
  group?: string;
  shortcut?: string;
  keywords?: string[];
}>;

/** Full control via render function. Groups, icons, shortcuts -- all explicit. */
export const CustomRendering: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);

    const commands: CommandItem[] = [
      {id: 'dashboard', label: 'Go to Dashboard', auxiliaryData: {icon: 'home', group: 'Navigation'}},
      {id: 'settings', label: 'Open Settings', auxiliaryData: {icon: 'settings', group: 'Navigation', shortcut: '\u2318,'}},
      {id: 'profile', label: 'View Profile', auxiliaryData: {icon: 'user', group: 'Navigation'}},
      {id: 'dark-mode', label: 'Toggle Dark Mode', auxiliaryData: {group: 'Actions', keywords: ['theme', 'appearance']}},
      {id: 'new-file', label: 'Create New File', auxiliaryData: {group: 'Actions', shortcut: '\u2318N'}},
      {id: 'search', label: 'Search Files', auxiliaryData: {icon: 'search', group: 'Actions', shortcut: '\u2318P'}},
    ];

    const source = useMemo(
      () => createStaticSource(commands, {
        keywords: (item) => item.auxiliaryData?.keywords ?? [],
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
          input={<XDSCommandPaletteInput placeholder="Type a command..." />}
          footer={<XDSCommandPaletteFooter />}>
          {(items) => {
            const groups = new Map<string, CommandItem[]>();
            const ungrouped: CommandItem[] = [];

            for (const item of items as CommandItem[]) {
              const group = item.auxiliaryData?.group;
              if (group) {
                if (!groups.has(group)) groups.set(group, []);
                groups.get(group)!.push(item);
              } else {
                ungrouped.push(item);
              }
            }

            return (
              <>
                {Array.from(groups.entries()).map(([heading, groupItems]) => (
                  <XDSCommandPaletteGroup key={heading} heading={heading}>
                    {groupItems.map(item => (
                      <XDSCommandPaletteItem
                        key={item.id}
                        value={item.id}
                        onSelect={() => console.log('Selected:', item.id)}>
                        <div style={{display: 'flex', alignItems: 'center', gap: 8, flex: 1}}>
                          {item.auxiliaryData?.icon && (
                            <XDSIcon icon={item.auxiliaryData.icon} size="sm" />
                          )}
                          <span style={{flex: 1}}>{item.label}</span>
                          {item.auxiliaryData?.shortcut && (
                            <span style={{fontSize: 12, opacity: 0.5}}>
                              {item.auxiliaryData.shortcut}
                            </span>
                          )}
                        </div>
                      </XDSCommandPaletteItem>
                    ))}
                  </XDSCommandPaletteGroup>
                ))}
                {ungrouped.map(item => (
                  <XDSCommandPaletteItem key={item.id} value={item.id}>
                    {item.label}
                  </XDSCommandPaletteItem>
                ))}
              </>
            );
          }}
        </XDSCommandPalette>
      </>
    );
  },
};

// --- Async search ---

/** Server-side search. Input shows spinner while pending. */
export const AsyncSearch: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);

    const source = useMemo<XDSSearchSource>(() => ({
      _controller: null as AbortController | null,
      cancel() { this._controller?.abort(); },
      async search(query: string) {
        this.cancel();
        this._controller = new AbortController();
        await new Promise(r => setTimeout(r, 300));
        const all = [
          {id: 'readme', label: 'README.md'},
          {id: 'package', label: 'package.json'},
          {id: 'tsconfig', label: 'tsconfig.json'},
          {id: 'index', label: 'src/index.ts'},
          {id: 'app', label: 'src/App.tsx'},
        ];
        return all.filter(f => f.label.toLowerCase().includes(query.toLowerCase()));
      },
      bootstrap() { return []; },
    }), []);

    return (
      <>
        <XDSButton label="Open File Search" onClick={() => setIsOpen(true)} />
        <XDSCommandPalette
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          searchSource={source}
          input={<XDSCommandPaletteInput placeholder="Search files..." />}
        />
      </>
    );
  },
};

// --- Hybrid: static + async ---

/** Recent files (static) + project files (API) in one source. */
export const HybridSearch: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);

    const recentFiles: XDSSearchableItem<{recent: boolean}>[] = [
      {id: 'recent-1', label: 'App.tsx', auxiliaryData: {recent: true}},
      {id: 'recent-2', label: 'index.ts', auxiliaryData: {recent: true}},
    ];

    const source = useMemo<XDSSearchSource>(() => ({
      async search(query: string) {
        const lower = query.toLowerCase();
        const matchingRecent = recentFiles.filter(f =>
          f.label.toLowerCase().includes(lower),
        );
        await new Promise(r => setTimeout(r, 200));
        const apiResults: XDSSearchableItem[] = [
          {id: 'api-1', label: 'utils/helpers.ts'},
          {id: 'api-2', label: 'components/Button.tsx'},
          {id: 'api-3', label: 'hooks/useAuth.ts'},
        ].filter(f => f.label.toLowerCase().includes(lower));
        return [...matchingRecent, ...apiResults];
      },
      bootstrap() { return recentFiles; },
    }), []);

    return (
      <>
        <XDSButton label="Open File Finder" onClick={() => setIsOpen(true)} />
        <XDSCommandPalette
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          searchSource={source}
          input={<XDSCommandPaletteInput placeholder="Search project files..." />}>
          {(items) => {
            const recent = items.filter(i => {
              const aux = i.auxiliaryData as Record<string, unknown> | undefined;
              return aux?.recent === true;
            });
            const other = items.filter(i => {
              const aux = i.auxiliaryData as Record<string, unknown> | undefined;
              return aux?.recent !== true;
            });
            return (
              <>
                {recent.length > 0 && (
                  <XDSCommandPaletteGroup heading="Recent">
                    {recent.map(item => (
                      <XDSCommandPaletteItem key={item.id} value={item.id}>
                        {item.label}
                      </XDSCommandPaletteItem>
                    ))}
                  </XDSCommandPaletteGroup>
                )}
                {other.length > 0 && (
                  <XDSCommandPaletteGroup heading="Project">
                    {other.map(item => (
                      <XDSCommandPaletteItem key={item.id} value={item.id}>
                        {item.label}
                      </XDSCommandPaletteItem>
                    ))}
                  </XDSCommandPaletteGroup>
                )}
              </>
            );
          }}
        </XDSCommandPalette>
      </>
    );
  },
};

// --- Picker ---

/** Selection persists across opens. Uses isSelected for visual state. */
export const Picker: Story = {
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    const [theme, setTheme] = useState('light');

    const source = useMemo(() => createStaticSource([
      {id: 'light', label: 'Light'},
      {id: 'dark', label: 'Dark'},
      {id: 'system', label: 'System'},
    ]), []);

    return (
      <>
        <XDSButton label={`Theme: ${theme}`} onClick={() => setIsOpen(true)} />
        <XDSCommandPalette
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          searchSource={source}
          value={theme}
          onValueChange={setTheme}
          input={<XDSCommandPaletteInput placeholder="Choose theme..." />}>
          {(items) => items.map(item => (
            <XDSCommandPaletteItem
              key={item.id}
              value={item.id}
              isSelected={item.id === theme}>
              {item.label}
            </XDSCommandPaletteItem>
          ))}
        </XDSCommandPalette>
      </>
    );
  },
};
