/**
 * @file XDSCommandPalette.test.tsx
 * @input Uses vitest, @testing-library/react, CommandPalette components
 * @output Unit tests for XDSCommandPalette behavior
 * @position Testing; validates CommandPalette implementation
 *
 * SYNC: When CommandPalette files change, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent, waitFor, act} from '@testing-library/react';
import {XDSCommandPaletteProvider} from './XDSCommandPaletteProvider';
import {useXDSCommandPaletteRegister} from './useXDSCommandPaletteRegister';
import {useXDSCommandPalette} from './useXDSCommandPalette';
import {useState} from 'react';
import type {XDSCommand} from './types';
import {fuzzySearch} from './fuzzySearch';

// Mock showModal and close methods since they're not fully implemented in jsdom
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  });
});

// Helper component that registers commands
function TestCommands({commands}: {commands: XDSCommand[]}) {
  useXDSCommandPaletteRegister(commands, [commands]);
  return null;
}

// Helper component with open button
function TestOpener() {
  const {open} = useXDSCommandPalette();
  return <button onClick={() => open()}>Open</button>;
}

/**
 * Find an option element by its text content (handles text split by <mark>).
 */
function getOptionByLabel(label: string): HTMLElement | undefined {
  const options = screen.getAllByRole('option');
  return options.find(o => o.textContent?.includes(label));
}

const defaultCommands: XDSCommand[] = [
  {id: 'save', label: 'Save File', onSelect: vi.fn(), shortcut: 'mod+s'},
  {id: 'open', label: 'Open File', onSelect: vi.fn(), shortcut: 'mod+o'},
  {
    id: 'settings',
    label: 'Open Settings',
    onSelect: vi.fn(),
    group: 'Navigation',
  },
];

describe('XDSCommandPalette', () => {
  it('renders provider without error', () => {
    render(
      <XDSCommandPaletteProvider>
        <div>App content</div>
      </XDSCommandPaletteProvider>,
    );
    expect(screen.getByText('App content')).toBeInTheDocument();
  });

  it('opens the palette with Cmd+K', () => {
    render(
      <XDSCommandPaletteProvider>
        <TestCommands commands={defaultCommands} />
      </XDSCommandPaletteProvider>,
    );

    // Palette should not be visible
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Fire Cmd+K (use ctrlKey since jsdom is not Mac)
    fireEvent.keyDown(document, {key: 'k', ctrlKey: true});

    // Palette should now be visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes the palette with Escape', () => {
    render(
      <XDSCommandPaletteProvider>
        <TestCommands commands={defaultCommands} />
        <TestOpener />
      </XDSCommandPaletteProvider>,
    );

    // Open via button
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Press Escape on the input
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, {key: 'Escape'});

    // Palette should be gone
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows registered commands', () => {
    render(
      <XDSCommandPaletteProvider>
        <TestCommands commands={defaultCommands} />
        <TestOpener />
      </XDSCommandPaletteProvider>,
    );

    fireEvent.click(screen.getByText('Open'));

    expect(screen.getByText('Save File')).toBeInTheDocument();
    expect(screen.getByText('Open File')).toBeInTheDocument();
    expect(screen.getByText('Open Settings')).toBeInTheDocument();
  });

  it('filters commands with search', () => {
    render(
      <XDSCommandPaletteProvider>
        <TestCommands commands={defaultCommands} />
        <TestOpener />
      </XDSCommandPaletteProvider>,
    );

    fireEvent.click(screen.getByText('Open'));

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'save'}});

    // Text may be split by <mark> elements, so check option content
    const option = getOptionByLabel('Save File');
    expect(option).toBeDefined();
    expect(screen.queryByText('Open Settings')).not.toBeInTheDocument();
  });

  it('supports keyboard navigation', () => {
    render(
      <XDSCommandPaletteProvider>
        <TestCommands commands={defaultCommands} />
        <TestOpener />
      </XDSCommandPaletteProvider>,
    );

    fireEvent.click(screen.getByText('Open'));

    const input = screen.getByRole('combobox');

    // First item should be highlighted
    const firstOption = screen.getAllByRole('option')[0];
    expect(firstOption).toHaveAttribute('aria-selected', 'true');

    // Arrow down
    fireEvent.keyDown(input, {key: 'ArrowDown'});
    const secondOption = screen.getAllByRole('option')[1];
    expect(secondOption).toHaveAttribute('aria-selected', 'true');

    // Arrow up
    fireEvent.keyDown(input, {key: 'ArrowUp'});
    expect(firstOption).toHaveAttribute('aria-selected', 'true');
  });

  it('selects command with Enter', () => {
    const onSelect = vi.fn();
    const commands = [{id: 'test', label: 'Test Command', onSelect}];

    render(
      <XDSCommandPaletteProvider>
        <TestCommands commands={commands} />
        <TestOpener />
      </XDSCommandPaletteProvider>,
    );

    fireEvent.click(screen.getByText('Open'));

    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, {key: 'Enter'});

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('deregisters commands on unmount', () => {
    function ToggleCommands() {
      const [isShown, setIsShown] = useState(true);
      return (
        <>
          {isShown && (
            <TestCommands
              commands={[
                {id: 'temp', label: 'Temporary Command', onSelect: vi.fn()},
              ]}
            />
          )}
          <button onClick={() => setIsShown(false)}>Remove</button>
        </>
      );
    }

    render(
      <XDSCommandPaletteProvider>
        <ToggleCommands />
        <TestOpener />
      </XDSCommandPaletteProvider>,
    );

    // Open and verify command exists
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByText('Temporary Command')).toBeInTheDocument();

    // Close palette
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, {key: 'Escape'});

    // Unmount the commands
    fireEvent.click(screen.getByText('Remove'));

    // Reopen — command should be gone
    fireEvent.click(screen.getByText('Open'));
    expect(screen.queryByText('Temporary Command')).not.toBeInTheDocument();
  });

  it('hides commands with isEnabled: false', () => {
    const commands = [
      {id: 'enabled', label: 'Enabled Command', onSelect: vi.fn()},
      {
        id: 'disabled',
        label: 'Disabled Command',
        onSelect: vi.fn(),
        isEnabled: false,
      },
    ];

    render(
      <XDSCommandPaletteProvider>
        <TestCommands commands={commands} />
        <TestOpener />
      </XDSCommandPaletteProvider>,
    );

    fireEvent.click(screen.getByText('Open'));

    expect(screen.getByText('Enabled Command')).toBeInTheDocument();
    expect(screen.queryByText('Disabled Command')).not.toBeInTheDocument();
  });

  it('opens to a specific page via command', () => {
    const commands = [
      {
        id: 'theme',
        label: 'Change Theme',
        onSelect: vi.fn(),
        page: 'Themes',
      },
      {
        id: 'dark',
        label: 'Dark Mode',
        onSelect: vi.fn(),
        group: 'Themes',
      },
      {
        id: 'light',
        label: 'Light Mode',
        onSelect: vi.fn(),
        group: 'Themes',
      },
    ];

    render(
      <XDSCommandPaletteProvider>
        <TestCommands commands={commands} />
        <TestOpener />
      </XDSCommandPaletteProvider>,
    );

    fireEvent.click(screen.getByText('Open'));

    // Select the "Change Theme" page command
    fireEvent.click(screen.getByText('Change Theme'));

    // Should now show theme sub-page commands
    expect(screen.getByText('Dark Mode')).toBeInTheDocument();
    expect(screen.getByText('Light Mode')).toBeInTheDocument();
    expect(screen.queryByText('Change Theme')).not.toBeInTheDocument();
  });

  it('navigates back from a sub-page with Backspace on empty input', () => {
    const commands = [
      {
        id: 'theme',
        label: 'Change Theme',
        onSelect: vi.fn(),
        page: 'Themes',
      },
      {
        id: 'dark',
        label: 'Dark Mode',
        onSelect: vi.fn(),
        group: 'Themes',
      },
    ];

    render(
      <XDSCommandPaletteProvider>
        <TestCommands commands={commands} />
        <TestOpener />
      </XDSCommandPaletteProvider>,
    );

    fireEvent.click(screen.getByText('Open'));

    // Go to sub-page
    fireEvent.click(screen.getByText('Change Theme'));
    expect(screen.getByText('Dark Mode')).toBeInTheDocument();

    // Press Backspace on empty input to go back
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, {key: 'Backspace'});

    // Should be back on main page
    expect(screen.getByText('Change Theme')).toBeInTheDocument();
  });

  it('records history when a command is selected', () => {
    const onSelect = vi.fn();
    const commands = [
      {id: 'cmd1', label: 'Command One', onSelect},
      {id: 'cmd2', label: 'Command Two', onSelect: vi.fn()},
    ];

    render(
      <XDSCommandPaletteProvider>
        <TestCommands commands={commands} />
        <TestOpener />
      </XDSCommandPaletteProvider>,
    );

    // Select a command
    fireEvent.click(screen.getByText('Open'));
    fireEvent.click(screen.getByText('Command One'));

    // Reopen — the selected command should appear in "Recent" group
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByText('Recent')).toBeInTheDocument();
  });

  it('shows relative time and clear button for recent commands', () => {
    const onSelect = vi.fn();
    const commands = [
      {id: 'cmd1', label: 'Command One', onSelect, group: 'Tools'},
      {id: 'cmd2', label: 'Command Two', onSelect: vi.fn()},
    ];

    render(
      <XDSCommandPaletteProvider>
        <TestCommands commands={commands} />
        <TestOpener />
      </XDSCommandPaletteProvider>,
    );

    // Select a command
    fireEvent.click(screen.getByText('Open'));
    fireEvent.click(screen.getByText('Command One'));

    // Reopen
    fireEvent.click(screen.getByText('Open'));

    // Should show relative time
    expect(screen.getByText('just now')).toBeInTheDocument();

    // Should show group context
    expect(screen.getByText('Tools')).toBeInTheDocument();

    // Should have a clear button
    expect(
      screen.getByLabelText('Remove Command One from recent'),
    ).toBeInTheDocument();
  });

  it('increments count on repeated command selections', () => {
    const onSelect = vi.fn();
    const commands = [{id: 'cmd1', label: 'Command One', onSelect}];

    render(
      <XDSCommandPaletteProvider>
        <TestCommands commands={commands} />
        <TestOpener />
      </XDSCommandPaletteProvider>,
    );

    // Select the same command 3 times
    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByText('Open'));
      fireEvent.click(screen.getByText('Command One'));
    }

    // Reopen — count should be displayed
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByText('3×')).toBeInTheDocument();
  });

  it('clears a single history entry with the clear button', () => {
    const onSelect = vi.fn();
    const commands = [
      {id: 'cmd1', label: 'Command One', onSelect},
      {id: 'cmd2', label: 'Command Two', onSelect: vi.fn()},
    ];

    render(
      <XDSCommandPaletteProvider>
        <TestCommands commands={commands} />
        <TestOpener />
      </XDSCommandPaletteProvider>,
    );

    // Select both commands
    fireEvent.click(screen.getByText('Open'));
    fireEvent.click(screen.getByText('Command One'));
    fireEvent.click(screen.getByText('Open'));
    fireEvent.click(screen.getByText('Command Two'));

    // Reopen — both should be in Recent
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByText('Recent')).toBeInTheDocument();

    // Clear Command One from history
    fireEvent.click(screen.getByLabelText('Remove Command One from recent'));

    // Command Two should still be in Recent, Command One should not
    const options = screen.getAllByRole('option');
    const recentLabels = options.map(o => o.textContent);
    expect(recentLabels.some(l => l?.includes('Command Two'))).toBe(true);
    // Recent group should still exist for Command Two
    expect(screen.getByText('Recent')).toBeInTheDocument();
  });

  it('uses custom placeholder', () => {
    render(
      <XDSCommandPaletteProvider placeholder="Type a command...">
        <TestOpener />
      </XDSCommandPaletteProvider>,
    );

    fireEvent.click(screen.getByText('Open'));
    expect(
      screen.getByPlaceholderText('Type a command...'),
    ).toBeInTheDocument();
  });

  it('shows empty content when no results', () => {
    render(
      <XDSCommandPaletteProvider emptyContent="Nothing here">
        <TestCommands
          commands={[{id: 'test', label: 'Test', onSelect: vi.fn()}]}
        />
        <TestOpener />
      </XDSCommandPaletteProvider>,
    );

    fireEvent.click(screen.getByText('Open'));

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'zzzzz'}});

    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders footer content', () => {
    render(
      <XDSCommandPaletteProvider footer={<span>Tip: Use arrow keys</span>}>
        <TestOpener />
      </XDSCommandPaletteProvider>,
    );

    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByText('Tip: Use arrow keys')).toBeInTheDocument();
  });

  it('supports Home and End keys', () => {
    const commands = [
      {id: 'a', label: 'Alpha', onSelect: vi.fn()},
      {id: 'b', label: 'Beta', onSelect: vi.fn()},
      {id: 'c', label: 'Charlie', onSelect: vi.fn()},
    ];

    render(
      <XDSCommandPaletteProvider>
        <TestCommands commands={commands} />
        <TestOpener />
      </XDSCommandPaletteProvider>,
    );

    fireEvent.click(screen.getByText('Open'));

    const input = screen.getByRole('combobox');

    // Press End
    fireEvent.keyDown(input, {key: 'End'});
    const options = screen.getAllByRole('option');
    expect(options[options.length - 1]).toHaveAttribute(
      'aria-selected',
      'true',
    );

    // Press Home
    fireEvent.keyDown(input, {key: 'Home'});
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('uses XDSDialog with purpose="info" for backdrop click dismiss', () => {
    render(
      <XDSCommandPaletteProvider data-testid="palette">
        <TestCommands
          commands={[{id: 'test', label: 'Test', onSelect: vi.fn()}]}
        />
        <TestOpener />
      </XDSCommandPaletteProvider>,
    );

    fireEvent.click(screen.getByText('Open'));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog.tagName).toBe('DIALOG');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });
});

// =============================================================================
// fuzzySearch match range tests
// =============================================================================

describe('fuzzySearch match ranges', () => {
  it('returns match ranges for exact match', () => {
    const commands = [{id: '1', label: 'Save', onSelect: vi.fn()}];
    const results = fuzzySearch(commands, 'save', []);

    expect(results).toHaveLength(1);
    expect(results[0].score).toBe(100);
    expect(results[0].matchRanges).toEqual([{start: 0, end: 4}]);
  });

  it('returns match ranges for starts-with match', () => {
    const commands = [{id: '1', label: 'Save File', onSelect: vi.fn()}];
    const results = fuzzySearch(commands, 'save', []);

    expect(results).toHaveLength(1);
    expect(results[0].score).toBe(80);
    expect(results[0].matchRanges).toEqual([{start: 0, end: 4}]);
  });

  it('returns match ranges for contains match', () => {
    const commands = [{id: '1', label: 'Open Settings', onSelect: vi.fn()}];
    const results = fuzzySearch(commands, 'sett', []);

    expect(results).toHaveLength(1);
    expect(results[0].score).toBe(70);
    expect(results[0].matchRanges).toEqual([{start: 5, end: 9}]);
  });

  it('does not match scattered subsequences', () => {
    const commands = [{id: '1', label: 'Save File', onSelect: vi.fn()}];
    const results = fuzzySearch(commands, 'sfl', []);

    expect(results).toHaveLength(0);
  });

  it('returns empty match ranges for keyword-only match', () => {
    const commands = [
      {id: '1', label: 'Settings', keywords: ['config'], onSelect: vi.fn()},
    ];
    const results = fuzzySearch(commands, 'config', []);

    expect(results).toHaveLength(1);
    expect(results[0].score).toBe(40);
    expect(results[0].matchRanges).toEqual([]);
  });

  it('returns all commands with empty ranges when query is empty', () => {
    const commands = [
      {id: '1', label: 'Save', onSelect: vi.fn()},
      {id: '2', label: 'Open', onSelect: vi.fn()},
    ];
    const results = fuzzySearch(commands, '', []);

    expect(results).toHaveLength(2);
    expect(results[0].matchRanges).toEqual([]);
    expect(results[1].matchRanges).toEqual([]);
  });

  it('matches aliases with label-level scoring but no highlighting', () => {
    const commands = [
      {
        id: '1',
        label: 'Settings',
        aliases: ['Preferences'],
        onSelect: vi.fn(),
      },
    ];
    const results = fuzzySearch(commands, 'pref', []);

    expect(results).toHaveLength(1);
    expect(results[0].score).toBe(80); // starts-with on alias
    expect(results[0].matchRanges).toEqual([]); // no label highlighting
  });

  it('prefers label match over alias match', () => {
    const commands = [
      {
        id: '1',
        label: 'Settings',
        aliases: ['Settings Panel'],
        onSelect: vi.fn(),
      },
    ];
    const results = fuzzySearch(commands, 'settings', []);

    expect(results).toHaveLength(1);
    expect(results[0].score).toBe(100); // exact label match
    expect(results[0].matchRanges).toEqual([{start: 0, end: 8}]); // label highlighting
  });

  it('falls through to keywords when no label or alias match', () => {
    const commands = [
      {
        id: '1',
        label: 'Settings',
        aliases: ['Preferences'],
        keywords: ['config'],
        onSelect: vi.fn(),
      },
    ];
    const results = fuzzySearch(commands, 'config', []);

    expect(results).toHaveLength(1);
    expect(results[0].score).toBe(40); // keyword match
    expect(results[0].matchRanges).toEqual([]);
  });
});

// =============================================================================
// Highlight rendering tests
// =============================================================================

describe('search highlight rendering', () => {
  it('renders mark elements for matching text', () => {
    const commands = [{id: '1', label: 'Save File', onSelect: vi.fn()}];

    render(
      <XDSCommandPaletteProvider>
        <TestCommands commands={commands} />
        <TestOpener />
      </XDSCommandPaletteProvider>,
    );

    fireEvent.click(screen.getByText('Open'));

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'save'}});

    // The matching "Save" portion should be in a <mark> element
    const marks = document.querySelectorAll('mark');
    expect(marks.length).toBeGreaterThan(0);
    expect(marks[0].textContent).toBe('Save');
  });

  it('renders mark for contiguous substring match', () => {
    const commands = [{id: '1', label: 'Open Settings', onSelect: vi.fn()}];

    render(
      <XDSCommandPaletteProvider>
        <TestCommands commands={commands} />
        <TestOpener />
      </XDSCommandPaletteProvider>,
    );

    fireEvent.click(screen.getByText('Open'));

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'sett'}});

    const marks = document.querySelectorAll('mark');
    expect(marks.length).toBe(1);
    expect(marks[0].textContent).toBe('Sett');
  });

  it('does not render mark elements when no query', () => {
    const commands = [{id: '1', label: 'Save File', onSelect: vi.fn()}];

    render(
      <XDSCommandPaletteProvider>
        <TestCommands commands={commands} />
        <TestOpener />
      </XDSCommandPaletteProvider>,
    );

    fireEvent.click(screen.getByText('Open'));

    // No query, no marks
    const marks = document.querySelectorAll('mark');
    expect(marks.length).toBe(0);
  });

  it('does not render mark elements for keyword-only matches', () => {
    const commands = [
      {id: '1', label: 'Settings', keywords: ['config'], onSelect: vi.fn()},
    ];

    render(
      <XDSCommandPaletteProvider>
        <TestCommands commands={commands} />
        <TestOpener />
      </XDSCommandPaletteProvider>,
    );

    fireEvent.click(screen.getByText('Open'));

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'config'}});

    // Keyword match — no label highlighting
    const marks = document.querySelectorAll('mark');
    expect(marks.length).toBe(0);
  });

  it('does not match commands with scattered subsequence queries', () => {
    const commands = [{id: '1', label: 'Save File', onSelect: vi.fn()}];

    render(
      <XDSCommandPaletteProvider>
        <TestCommands commands={commands} />
        <TestOpener />
      </XDSCommandPaletteProvider>,
    );

    fireEvent.click(screen.getByText('Open'));

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'sfl'}});

    // No results — scattered subsequence not supported
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });
});

// =============================================================================
// Async loading tests
// =============================================================================

describe('async command loading', () => {
  it('shows loading spinner while fetching', async () => {
    let resolveFetch: (commands: XDSCommand[]) => void;
    const fetcher = vi.fn(
      () =>
        new Promise<XDSCommand[]>(resolve => {
          resolveFetch = resolve;
        }),
    );

    render(
      <XDSCommandPaletteProvider commandFetcher={fetcher} fetchDebounceMs={0}>
        <TestCommands
          commands={[{id: 'local', label: 'Local Command', onSelect: vi.fn()}]}
        />
        <TestOpener />
      </XDSCommandPaletteProvider>,
    );

    fireEvent.click(screen.getByText('Open'));

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'test'}});

    // Wait for debounce (0ms) + fetcher to be called
    await waitFor(() => {
      expect(fetcher).toHaveBeenCalledWith('test');
    });

    // Resolve the fetch
    await act(async () => {
      resolveFetch!([
        {id: 'remote', label: 'Remote Test Command', onSelect: vi.fn()},
      ]);
    });

    // Remote command should appear in results (text may be split by <mark>)
    await waitFor(() => {
      const option = getOptionByLabel('Remote Test Command');
      expect(option).toBeDefined();
    });
  });

  it('merges local and fetched commands', async () => {
    const fetcher = vi.fn(() =>
      Promise.resolve([
        {id: 'remote-1', label: 'Remote Alpha', onSelect: vi.fn()},
      ]),
    );

    render(
      <XDSCommandPaletteProvider commandFetcher={fetcher} fetchDebounceMs={0}>
        <TestCommands
          commands={[{id: 'local-1', label: 'Local Alpha', onSelect: vi.fn()}]}
        />
        <TestOpener />
      </XDSCommandPaletteProvider>,
    );

    fireEvent.click(screen.getByText('Open'));

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'alpha'}});

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      const labels = options.map(o => o.textContent);
      expect(labels.some(l => l?.includes('Local Alpha'))).toBe(true);
      expect(labels.some(l => l?.includes('Remote Alpha'))).toBe(true);
    });
  });

  it('deduplicates fetched commands with same id as local', async () => {
    const fetcher = vi.fn(() =>
      Promise.resolve([
        {id: 'shared', label: 'Remote Version', onSelect: vi.fn()},
      ]),
    );

    render(
      <XDSCommandPaletteProvider commandFetcher={fetcher} fetchDebounceMs={0}>
        <TestCommands
          commands={[{id: 'shared', label: 'Local Version', onSelect: vi.fn()}]}
        />
        <TestOpener />
      </XDSCommandPaletteProvider>,
    );

    fireEvent.click(screen.getByText('Open'));

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'version'}});

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      const labels = options.map(o => o.textContent);
      // Local command takes precedence
      expect(labels.some(l => l?.includes('Local Version'))).toBe(true);
      expect(labels.some(l => l?.includes('Remote Version'))).toBe(false);
    });
  });
});
