/**
 * @file XDSCommandPalette.test.tsx
 * @input Tests for CommandPalette composable components and provider
 * @output Test results
 * @position Test file; validates XDSCommandPalette behavior
 */

import {render, screen, fireEvent, act} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {XDSCommandPalette} from './XDSCommandPalette';
import {XDSCommandPaletteInput} from './XDSCommandPaletteInput';
import {XDSCommandPaletteList} from './XDSCommandPaletteList';
import {XDSCommandPaletteItem} from './XDSCommandPaletteItem';
import {XDSCommandPaletteGroup} from './XDSCommandPaletteGroup';
import {XDSCommandPaletteEmpty} from './XDSCommandPaletteEmpty';
import {XDSCommandPaletteShortcut} from './XDSCommandPaletteShortcut';
import {XDSCommandPaletteFooter} from './XDSCommandPaletteFooter';
import {XDSCommandPaletteLoading} from './XDSCommandPaletteLoading';
import {useXDSCommandPaletteHistory} from './useXDSCommandPaletteHistory';
import {defaultFilter} from './filter';

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

// =============================================================================
// Filter tests
// =============================================================================

describe('defaultFilter', () => {
  it('returns 1 for empty search', () => {
    expect(defaultFilter('anything', '')).toBe(1);
  });

  it('returns 1 for exact match', () => {
    expect(defaultFilter('Settings', 'settings')).toBe(1);
  });

  it('returns 0.9 for starts-with match', () => {
    expect(defaultFilter('Settings', 'set')).toBe(0.9);
  });

  it('returns 0.7 for contains match', () => {
    expect(defaultFilter('Settings', 'ting')).toBe(0.7);
  });

  it('returns 0.6 for keyword starts-with', () => {
    expect(defaultFilter('Go Home', 'nav', ['navigation'])).toBe(0.6);
  });

  it('returns 0.5 for keyword contains', () => {
    expect(defaultFilter('Go Home', 'vig', ['navigation'])).toBe(0.5);
  });

  it('returns 0 for no match', () => {
    expect(defaultFilter('Settings', 'xyz')).toBe(0);
  });
});

// =============================================================================
// Shortcut display tests
// =============================================================================

describe('XDSCommandPaletteShortcut', () => {
  it('renders modifier keys as symbols', () => {
    const {container} = render(<XDSCommandPaletteShortcut keys="mod+k" />);
    const kbds = container.querySelectorAll('kbd');
    expect(kbds).toHaveLength(2);
    expect(kbds[0].textContent).toBe('\u2318'); // ⌘
    expect(kbds[1].textContent).toBe('K');
  });

  it('renders multi-key shortcuts', () => {
    const {container} = render(
      <XDSCommandPaletteShortcut keys="mod+shift+p" />,
    );
    const kbds = container.querySelectorAll('kbd');
    expect(kbds).toHaveLength(3);
  });
});

// =============================================================================
// Composable component tests (Layer 1)
// =============================================================================

describe('XDSCommandPalette (composable)', () => {
  it('renders when isShown is true', () => {
    render(
      <XDSCommandPalette isShown={true} onOpenChange={vi.fn()}>
        <XDSCommandPaletteInput />
        <XDSCommandPaletteList>
          <XDSCommandPaletteItem value="test" onSelect={vi.fn()}>
            Test Item
          </XDSCommandPaletteItem>
        </XDSCommandPaletteList>
      </XDSCommandPalette>,
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  it('renders groups with headings', () => {
    render(
      <XDSCommandPalette isShown={true} onOpenChange={vi.fn()}>
        <XDSCommandPaletteInput />
        <XDSCommandPaletteList>
          <XDSCommandPaletteGroup heading="Navigation">
            <XDSCommandPaletteItem value="home" onSelect={vi.fn()}>
              Home
            </XDSCommandPaletteItem>
          </XDSCommandPaletteGroup>
        </XDSCommandPaletteList>
      </XDSCommandPalette>,
    );
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(
      <XDSCommandPalette isShown={true} onOpenChange={vi.fn()}>
        <XDSCommandPaletteInput />
        <XDSCommandPaletteList>
          <XDSCommandPaletteEmpty>No results found</XDSCommandPaletteEmpty>
        </XDSCommandPaletteList>
      </XDSCommandPalette>,
    );
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(
      <XDSCommandPalette isShown={true} onOpenChange={vi.fn()}>
        <XDSCommandPaletteInput />
        <XDSCommandPaletteList>
          <XDSCommandPaletteLoading>Searching...</XDSCommandPaletteLoading>
        </XDSCommandPaletteList>
      </XDSCommandPalette>,
    );
    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(
      <XDSCommandPalette isShown={true} onOpenChange={vi.fn()}>
        <XDSCommandPaletteInput />
        <XDSCommandPaletteList>
          <XDSCommandPaletteItem value="test" onSelect={vi.fn()}>
            Test
          </XDSCommandPaletteItem>
        </XDSCommandPaletteList>
        <XDSCommandPaletteFooter>
          <span>↵ Select</span>
        </XDSCommandPaletteFooter>
      </XDSCommandPalette>,
    );
    expect(screen.getByText('↵ Select')).toBeInTheDocument();
  });

  it('calls onSelect when item is clicked', () => {
    const onSelect = vi.fn();
    render(
      <XDSCommandPalette isShown={true} onOpenChange={vi.fn()}>
        <XDSCommandPaletteInput />
        <XDSCommandPaletteList>
          <XDSCommandPaletteItem value="test" onSelect={onSelect}>
            Test Item
          </XDSCommandPaletteItem>
        </XDSCommandPaletteList>
      </XDSCommandPalette>,
    );
    fireEvent.click(screen.getByText('Test Item'));
    expect(onSelect).toHaveBeenCalledWith('test');
  });

  it('does not call onSelect for disabled items', () => {
    const onSelect = vi.fn();
    render(
      <XDSCommandPalette isShown={true} onOpenChange={vi.fn()}>
        <XDSCommandPaletteInput />
        <XDSCommandPaletteList>
          <XDSCommandPaletteItem value="test" onSelect={onSelect} isDisabled>
            Disabled Item
          </XDSCommandPaletteItem>
        </XDSCommandPaletteList>
      </XDSCommandPalette>,
    );
    fireEvent.click(screen.getByText('Disabled Item'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('has correct ARIA attributes', () => {
    render(
      <XDSCommandPalette
        isShown={true}
        onOpenChange={vi.fn()}
        label="Test palette">
        <XDSCommandPaletteInput placeholder="Search..." />
        <XDSCommandPaletteList>
          <XDSCommandPaletteItem value="test" onSelect={vi.fn()}>
            Test
          </XDSCommandPaletteItem>
        </XDSCommandPaletteList>
      </XDSCommandPalette>,
    );

    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');

    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();
  });
});

// =============================================================================
// History hook tests (Layer 3)
// =============================================================================

describe('useXDSCommandPaletteHistory', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with empty history', () => {
    const {result} = renderHook(() => useXDSCommandPaletteHistory());
    expect(result.current.history).toEqual([]);
  });

  it('records entries', () => {
    const {result} = renderHook(() => useXDSCommandPaletteHistory());

    act(() => {
      result.current.record('cmd-1');
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].id).toBe('cmd-1');
  });

  it('moves re-selected entries to top', () => {
    const {result} = renderHook(() => useXDSCommandPaletteHistory());

    act(() => {
      result.current.record('cmd-1');
      result.current.record('cmd-2');
      result.current.record('cmd-1');
    });

    expect(result.current.history).toHaveLength(2);
    expect(result.current.history[0].id).toBe('cmd-1');
  });

  it('respects maxEntries', () => {
    const {result} = renderHook(() =>
      useXDSCommandPaletteHistory({maxEntries: 2}),
    );

    act(() => {
      result.current.record('cmd-1');
      result.current.record('cmd-2');
      result.current.record('cmd-3');
    });

    expect(result.current.history).toHaveLength(2);
    expect(result.current.history[0].id).toBe('cmd-3');
  });

  it('clears history', () => {
    const {result} = renderHook(() => useXDSCommandPaletteHistory());

    act(() => {
      result.current.record('cmd-1');
      result.current.clear();
    });

    expect(result.current.history).toEqual([]);
  });

  it('clears individual entries', () => {
    const {result} = renderHook(() => useXDSCommandPaletteHistory());

    act(() => {
      result.current.record('cmd-1');
      result.current.record('cmd-2');
      result.current.clearEntry('cmd-1');
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].id).toBe('cmd-2');
  });

  it('persists to localStorage when enabled', () => {
    const {result} = renderHook(() =>
      useXDSCommandPaletteHistory({
        persist: true,
        storageKey: 'test-history',
      }),
    );

    act(() => {
      result.current.record('cmd-1');
    });

    const stored = JSON.parse(localStorage.getItem('test-history') ?? '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('cmd-1');
  });
});

// =============================================================================
// Helper: renderHook (minimal implementation for vitest)
// =============================================================================

function renderHook<T>(hook: () => T) {
  const result = {current: {} as T};

  function TestComponent() {
    result.current = hook();
    return null;
  }

  render(<TestComponent />);
  return {result};
}
