// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandPaletteInput.test.tsx
 * @input Uses vitest, @testing-library/react, CommandPaletteInput, Dialog
 * @output Unit tests for CommandPaletteInput component
 * @position Testing; validates CommandPaletteInput.tsx implementation
 */

import {createRef} from 'react';
import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {CommandPaletteInput} from './CommandPaletteInput';
import {CommandPaletteContext} from './CommandPaletteContext';
import {Dialog} from '../Dialog';
import type {CommandPaletteContextValue} from './CommandPaletteContext';

function makeContext(
  overrides: Partial<CommandPaletteContextValue> = {},
): CommandPaletteContextValue {
  return {
    search: '',
    setSearch: vi.fn(),
    value: '',
    setValue: vi.fn(),
    listId: 'list-1',
    highlightedIndex: -1,
    setHighlightedIndex: vi.fn(),
    getItemId: (i: number) => `item-${i}`,
    selectableItems: [],
    searchResults: [],
    selectItem: vi.fn(),
    onKeyDown: vi.fn(),
    onClose: vi.fn(),
    isOpen: true,
    isBusy: false,
    ...overrides,
  };
}

describe('CommandPaletteInput', () => {
  it('renders with default placeholder', () => {
    render(<CommandPaletteInput />);
    expect(screen.getByPlaceholderText('Search…')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<CommandPaletteInput placeholder="Type a command..." />);
    expect(
      screen.getByPlaceholderText('Type a command...'),
    ).toBeInTheDocument();
  });

  it('uses searchbox semantics when no popup context exists', () => {
    render(<CommandPaletteInput />);
    const input = screen.getByRole('searchbox');
    expect(input).not.toHaveAttribute('aria-expanded');
    expect(input).not.toHaveAttribute('aria-controls');
    expect(input).not.toHaveAttribute('aria-autocomplete');
  });

  it('has an accessible name by default', () => {
    render(<CommandPaletteInput />);
    expect(screen.getByRole('searchbox')).toHaveAttribute(
      'aria-label',
      'Search…',
    );
  });

  it('uses the label prop as the accessible name', () => {
    render(<CommandPaletteInput label="Search commands" />);
    const input = screen.getByRole('searchbox');
    expect(input).toHaveAttribute('aria-label', 'Search commands');
    expect(input).toHaveAttribute('placeholder', 'Search…');
  });

  it('falls back to a custom placeholder for the accessible name', () => {
    render(<CommandPaletteInput placeholder="Type a command..." />);
    expect(screen.getByRole('searchbox')).toHaveAttribute(
      'aria-label',
      'Type a command...',
    );
  });

  it('lets a consumer-passed aria-label override the default', () => {
    render(
      <CommandPaletteInput label="Search commands" aria-label="Custom name" />,
    );
    expect(screen.getByRole('searchbox')).toHaveAttribute(
      'aria-label',
      'Custom name',
    );
  });

  it('calls onValueChange when typing', () => {
    const handleChange = vi.fn();
    render(<CommandPaletteInput onValueChange={handleChange} />);

    fireEvent.change(screen.getByRole('searchbox'), {
      target: {value: 'test'},
    });

    expect(handleChange).toHaveBeenCalledWith('test');
  });

  it('displays controlled value', () => {
    render(<CommandPaletteInput value="hello" onValueChange={() => {}} />);
    expect(screen.getByRole('searchbox')).toHaveValue('hello');
  });

  it('forwards native onChange alongside onValueChange', () => {
    const handleChange = vi.fn();
    const handleNativeChange = vi.fn();

    render(
      <CommandPaletteInput
        onValueChange={handleChange}
        onChange={handleNativeChange}
      />,
    );

    fireEvent.change(screen.getByRole('searchbox'), {target: {value: 'x'}});

    expect(handleChange).toHaveBeenCalledWith('x');
    expect(handleNativeChange).toHaveBeenCalled();
  });

  it('keeps visible numeric end content in the trailing group', () => {
    render(<CommandPaletteInput endContent={0} />);
    expect(screen.getByText('0').tagName).toBe('SPAN');
  });

  it('forwards the ref and native data attributes to the query field', () => {
    const ref = createRef<HTMLInputElement>();
    render(<CommandPaletteInput ref={ref} data-testid="query-field" />);

    expect(ref.current).toBe(screen.getByTestId('query-field'));
  });
});

describe('CommandPaletteInput popup context', () => {
  it('preserves component-owned combobox semantics against rest props', () => {
    render(
      <CommandPaletteContext value={makeContext({isOpen: false})}>
        <CommandPaletteInput
          role="button"
          aria-expanded="true"
          aria-autocomplete="none"
          aria-controls="wrong-list"
          aria-activedescendant="wrong-item"
        />
      </CommandPaletteContext>,
    );

    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    expect(input).toHaveAttribute('aria-controls', 'list-1');
    expect(input).not.toHaveAttribute('aria-activedescendant');
  });

  it('exposes the highlighted option as the active descendant', () => {
    render(
      <CommandPaletteContext value={makeContext({highlightedIndex: 2})}>
        <CommandPaletteInput />
      </CommandPaletteContext>,
    );

    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-activedescendant',
      'item-2',
    );
  });

  it('reads and writes search state through context', () => {
    const setSearch = vi.fn();
    render(
      <CommandPaletteContext value={makeContext({search: 'hel', setSearch})}>
        <CommandPaletteInput />
      </CommandPaletteContext>,
    );

    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('hel');
    fireEvent.change(input, {target: {value: 'help'}});
    expect(setSearch).toHaveBeenCalledWith('help');
  });

  it('does not delegate a consumer-prevented keyboard event', () => {
    const onKeyDown = vi.fn();
    render(
      <CommandPaletteContext value={makeContext({onKeyDown})}>
        <CommandPaletteInput onKeyDown={event => event.preventDefault()} />
      </CommandPaletteContext>,
    );

    fireEvent.keyDown(screen.getByRole('combobox'), {key: 'ArrowDown'});
    expect(onKeyDown).not.toHaveBeenCalled();
  });

  it('does not auto-focus inside an inline dialog', () => {
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus');
    render(
      <Dialog isOpen isInline onOpenChange={() => {}}>
        <CommandPaletteContext value={makeContext()}>
          <CommandPaletteInput />
        </CommandPaletteContext>
      </Dialog>,
    );

    const input = screen.getByRole('combobox');
    const inputFocusCalls = focusSpy.mock.calls.filter((_, i) => {
      return focusSpy.mock.contexts[i] === input;
    });
    expect(inputFocusCalls).toHaveLength(0);
    focusSpy.mockRestore();
  });

  it('auto-focuses outside an inline dialog', async () => {
    render(
      <CommandPaletteContext value={makeContext()}>
        <CommandPaletteInput />
      </CommandPaletteContext>,
    );

    await vi.waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveFocus();
    });
  });
});
