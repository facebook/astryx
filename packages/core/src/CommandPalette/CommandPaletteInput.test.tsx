// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandPaletteInput.test.tsx
 * @input Uses vitest, @testing-library/react, CommandPaletteInput, Dialog
 * @output Unit tests for CommandPaletteInput component
 * @position Testing; validates CommandPaletteInput.tsx implementation
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {CommandPaletteInput} from './CommandPaletteInput';
import {CommandPaletteContext} from './CommandPaletteContext';
import {Dialog} from '../Dialog';
import type {CommandPaletteContextValue} from './CommandPaletteContext';

describe('CommandPaletteInput', () => {
  it('renders with default placeholder', () => {
    render(<CommandPaletteInput />);
    expect(screen.getByPlaceholderText('Search…')).toBeInTheDocument();
  });

  it('renders the local input target and delegated search icon', () => {
    const {container} = render(<CommandPaletteInput />);

    expect(container.firstElementChild).toHaveClass(
      'astryx-command-palette-input',
    );
    expect(container.querySelector('.astryx-icon')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('renders with custom placeholder', () => {
    render(<CommandPaletteInput placeholder="Type a command..." />);
    expect(
      screen.getByPlaceholderText('Type a command...'),
    ).toBeInTheDocument();
  });

  it('has combobox role', () => {
    render(<CommandPaletteInput />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('has an accessible name independent of its placeholder by default', () => {
    render(<CommandPaletteInput placeholder="Find an action…" />);
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-label', 'Search commands');
    expect(input).toHaveAttribute('placeholder', 'Find an action…');
  });

  it('uses the label prop as the accessible name', () => {
    render(<CommandPaletteInput label="Search commands" />);
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-label', 'Search commands');
    // The label prop does not affect the visible placeholder
    expect(input).toHaveAttribute('placeholder', 'Search…');
  });

  it('lets a consumer-passed aria-label override the default', () => {
    render(
      <CommandPaletteInput label="Search commands" aria-label="Custom name" />,
    );
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-label',
      'Custom name',
    );
  });

  it('calls onValueChange when typing', () => {
    const handleChange = vi.fn();
    render(<CommandPaletteInput onValueChange={handleChange} />);

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'test'}});

    expect(handleChange).toHaveBeenCalledWith('test');
  });

  it('displays controlled value', () => {
    render(<CommandPaletteInput value="hello" onValueChange={() => {}} />);
    expect(screen.getByRole('combobox')).toHaveValue('hello');
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

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'x'}});

    expect(handleChange).toHaveBeenCalledWith('x');
    expect(handleNativeChange).toHaveBeenCalled();
  });

  it('has aria-expanded and aria-autocomplete', () => {
    render(<CommandPaletteInput />);
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
  });
});

describe('CommandPaletteInput dialog context', () => {
  function makeContext(
    overrides: Partial<CommandPaletteContextValue> = {},
  ): CommandPaletteContextValue {
    return {
      search: '',
      setSearch: vi.fn(),
      value: '',
      setValue: vi.fn(),
      listId: 'list-1',
      hasListbox: true,
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

  it('renders the delegated loading spinner while busy', () => {
    render(
      <CommandPaletteContext value={makeContext({isBusy: true})}>
        <CommandPaletteInput />
      </CommandPaletteContext>,
    );

    expect(screen.getByRole('status', {name: 'Loading'})).toHaveClass(
      'astryx-spinner',
    );
  });

  it('omits popup ARIA while the result surface has no listbox', () => {
    render(
      <CommandPaletteContext value={makeContext({hasListbox: false})}>
        <CommandPaletteInput />
      </CommandPaletteContext>,
    );

    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).not.toHaveAttribute('aria-controls');
    expect(input).not.toHaveAttribute('aria-activedescendant');
  });

  it('omits an active descendant whose highlighted index has no option', () => {
    render(
      <CommandPaletteContext
        value={makeContext({
          highlightedIndex: 1,
          selectableItems: [{value: 'home'}],
        })}>
        <CommandPaletteInput />
      </CommandPaletteContext>,
    );

    expect(screen.getByRole('combobox')).not.toHaveAttribute(
      'aria-activedescendant',
    );
  });

  it('does not route IME composition keys to palette commands', () => {
    const onKeyDown = vi.fn();
    render(
      <CommandPaletteContext value={makeContext({onKeyDown})}>
        <CommandPaletteInput />
      </CommandPaletteContext>,
    );

    fireEvent.keyDown(screen.getByRole('combobox'), {
      key: 'Enter',
      isComposing: true,
    });

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

    // Auto-focus uses requestAnimationFrame — flush it
    await vi.waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveFocus();
    });
  });
});
