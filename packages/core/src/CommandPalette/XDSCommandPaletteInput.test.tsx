/**
 * @file XDSCommandPaletteInput.test.tsx
 * @input Uses vitest, @testing-library/react, XDSCommandPaletteInput
 * @output Unit tests for XDSCommandPaletteInput component
 * @position Testing; validates XDSCommandPaletteInput.tsx implementation
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {XDSCommandPaletteInput} from './XDSCommandPaletteInput';
import {CommandPaletteContext} from './CommandPaletteContext';
import type {CommandPaletteContextValue} from './CommandPaletteContext';

describe('XDSCommandPaletteInput', () => {
  it('renders with default placeholder', () => {
    render(<XDSCommandPaletteInput />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<XDSCommandPaletteInput placeholder="Type a command..." />);
    expect(
      screen.getByPlaceholderText('Type a command...'),
    ).toBeInTheDocument();
  });

  it('has combobox role', () => {
    render(<XDSCommandPaletteInput />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('calls onValueChange when typing', () => {
    const handleChange = vi.fn();
    render(<XDSCommandPaletteInput onValueChange={handleChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'test'}});

    expect(handleChange).toHaveBeenCalledWith('test');
  });

  it('displays controlled value', () => {
    render(<XDSCommandPaletteInput value="hello" onValueChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveValue('hello');
  });

  it('forwards native onChange alongside onValueChange', () => {
    const handleChange = vi.fn();
    const handleNativeChange = vi.fn();

    render(
      <XDSCommandPaletteInput
        onValueChange={handleChange}
        onChange={handleNativeChange}
      />,
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'x'}});

    expect(handleChange).toHaveBeenCalledWith('x');
    expect(handleNativeChange).toHaveBeenCalled();
  });

  it('has aria-expanded and aria-autocomplete', () => {
    render(<XDSCommandPaletteInput />);
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
  });
});

describe('XDSCommandPaletteInput inline context', () => {
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
      isInline: false,
      ...overrides,
    };
  }

  it('does not auto-focus when context isInline is true', () => {
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus');
    render(
      <CommandPaletteContext.Provider value={makeContext({isInline: true})}>
        <XDSCommandPaletteInput />
      </CommandPaletteContext.Provider>,
    );

    const input = screen.getByRole('combobox');
    const inputFocusCalls = focusSpy.mock.calls.filter((_, i) => {
      return focusSpy.mock.contexts[i] === input;
    });
    expect(inputFocusCalls).toHaveLength(0);
    focusSpy.mockRestore();
  });

  it('auto-focuses when context isInline is false', async () => {
    render(
      <CommandPaletteContext.Provider value={makeContext({isInline: false})}>
        <XDSCommandPaletteInput />
      </CommandPaletteContext.Provider>,
    );

    // Auto-focus uses requestAnimationFrame — flush it
    await vi.waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveFocus();
    });
  });
});
