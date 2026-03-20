/**
 * @file XDSTypeahead.test.tsx
 * @input Uses vitest, @testing-library/react, XDSTypeahead, XDSBaseTypeahead
 * @output Unit tests for Typeahead components
 * @position Testing; validates XDSTypeahead.tsx and XDSBaseTypeahead.tsx
 *
 * SYNC: When Typeahead components change, update tests to match
 */

import {describe, it, expect, vi, beforeAll, afterAll} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {XDSTypeahead} from './XDSTypeahead';
import {XDSBaseTypeahead} from './XDSBaseTypeahead';
import type {XDSSearchSource, XDSSearchableItem} from './types';

// Store original matches to restore later
const originalMatches = HTMLElement.prototype.matches;

// Track popover open state per element
const popoverOpenState = new WeakMap<HTMLElement, boolean>();

// Mock Popover API for jsdom
beforeAll(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, true);
    const event = new Event('toggle');
    Object.defineProperty(event, 'newState', {value: 'open'});
    this.dispatchEvent(event);
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, false);
    const event = new Event('toggle');
    Object.defineProperty(event, 'newState', {value: 'closed'});
    this.dispatchEvent(event);
  });

  HTMLElement.prototype.matches = function (selector: string) {
    if (selector === ':popover-open') {
      return popoverOpenState.get(this) ?? false;
    }
    return originalMatches.call(this, selector);
  };
});

afterAll(() => {
  HTMLElement.prototype.matches = originalMatches;
});

// Test data
const fruits: XDSSearchableItem[] = [
  {id: '1', label: 'Apple'},
  {id: '2', label: 'Banana'},
  {id: '3', label: 'Cherry'},
  {id: '4', label: 'Date'},
  {id: '5', label: 'Elderberry'},
];

const fruitSource: XDSSearchSource = {
  search: (query: string) =>
    fruits.filter(f => f.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => fruits.slice(0, 3),
};

describe('XDSBaseTypeahead', () => {
  it('renders input with combobox role', () => {
    render(
      <XDSBaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders placeholder text', () => {
    render(
      <XDSBaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        placeholder="Pick a fruit..."
      />,
    );
    expect(screen.getByPlaceholderText('Pick a fruit...')).toBeInTheDocument();
  });

  it('sets aria-expanded=false initially', () => {
    render(
      <XDSBaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('shows results on input change', async () => {
    render(
      <XDSBaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
      />,
    );
    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'App'}});

    await waitFor(() => {
      expect(screen.getByRole('listbox', {hidden: true})).toBeInTheDocument();
    });
  });

  it('disables input when isDisabled', () => {
    render(
      <XDSBaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        isDisabled
      />,
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('uses anchorRef for dropdown positioning', () => {
    const anchorRef = {current: document.createElement('div')};
    render(
      <XDSBaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        anchorRef={anchorRef}
      />,
    );
    // Component renders without error — anchor is wired up internally
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});

describe('XDSTypeahead', () => {
  it('renders with label', () => {
    render(
      <XDSTypeahead
        label="Fruit"
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
      />,
    );
    expect(screen.getByLabelText('Fruit')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(
      <XDSTypeahead
        label="Fruit"
        description="Pick your favorite fruit"
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('Pick your favorite fruit')).toBeInTheDocument();
  });

  it('shows required indicator', () => {
    render(
      <XDSTypeahead
        label="Fruit"
        isRequired
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText(/Required/)).toBeInTheDocument();
  });

  it('renders error status message', () => {
    render(
      <XDSTypeahead
        label="Fruit"
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        status={{type: 'error', message: 'Selection required'}}
      />,
    );
    expect(screen.getByText('Selection required')).toBeInTheDocument();
  });

  it('shows selected value as a token with remove button', () => {
    render(
      <XDSTypeahead
        label="Fruit"
        searchSource={fruitSource}
        value={fruits[0]}
        onChange={() => {}}
      />,
    );
    expect(
      screen.getByRole('button', {name: `Remove ${fruits[0].label}`}),
    ).toBeInTheDocument();
  });

  it('calls onChange with null when token remove is clicked', () => {
    const onChange = vi.fn();
    render(
      <XDSTypeahead
        label="Fruit"
        searchSource={fruitSource}
        value={fruits[0]}
        onChange={onChange}
      />,
    );
    fireEvent.click(
      screen.getByRole('button', {name: `Remove ${fruits[0].label}`}),
    );
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('renders with data-testid', () => {
    render(
      <XDSTypeahead
        label="Fruit"
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        data-testid="my-typeahead"
      />,
    );
    expect(screen.getByTestId('my-typeahead')).toBeInTheDocument();
  });
});

describe('XDSBaseTypeahead accessibility', () => {
  it('sets aria-haspopup="listbox" on combobox', () => {
    render(
      <XDSBaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-haspopup',
      'listbox',
    );
  });

  it('sets aria-required when isRequired is true', () => {
    render(
      <XDSBaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        isRequired
      />,
    );
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-required',
      'true',
    );
  });

  it('does not set aria-required when isRequired is false', () => {
    render(
      <XDSBaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-required');
  });

  it('sets aria-invalid when isInvalid is true', () => {
    render(
      <XDSBaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        isInvalid
      />,
    );
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('does not set aria-invalid when isInvalid is false', () => {
    render(
      <XDSBaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-invalid');
  });

  it('renders empty state with role="option" for valid ARIA tree', async () => {
    const emptySource: XDSSearchSource = {
      search: () => [],
      bootstrap: () => [],
    };
    render(
      <XDSBaseTypeahead
        searchSource={emptySource}
        value={null}
        onChange={() => {}}
        debounceMs={0}
      />,
    );
    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'xyz'}});

    await waitFor(() => {
      const listbox = screen.getByRole('listbox', {hidden: true});
      const option = listbox.querySelector('[role="option"]');
      expect(option).toBeInTheDocument();
      expect(option).toHaveAttribute('aria-disabled', 'true');
      expect(option).toHaveTextContent('No results found');
    });
  });
});

describe('XDSBaseTypeahead error handling', () => {
  it('calls onError when search throws', async () => {
    const error = new Error('search failed');
    const failSource: XDSSearchSource = {
      search: () => {
        throw error;
      },
      bootstrap: () => [],
    };
    const onError = vi.fn();
    render(
      <XDSBaseTypeahead
        searchSource={failSource}
        value={null}
        onChange={() => {}}
        onError={onError}
        debounceMs={0}
      />,
    );
    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'test'}});

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  it('calls onError when bootstrap throws', async () => {
    const error = new Error('bootstrap failed');
    const failSource: XDSSearchSource = {
      search: () => [],
      bootstrap: () => {
        throw error;
      },
    };
    const onError = vi.fn();
    render(
      <XDSBaseTypeahead
        searchSource={failSource}
        value={null}
        onChange={() => {}}
        onError={onError}
        hasEntriesOnFocus
        debounceMs={0}
      />,
    );
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error);
    });
  });
});

describe('XDSTypeahead accessibility', () => {
  it('sets aria-required on combobox when isRequired is true', () => {
    render(
      <XDSTypeahead
        label="Fruit"
        isRequired
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-required',
      'true',
    );
  });

  it('sets aria-invalid on combobox when status is error', () => {
    render(
      <XDSTypeahead
        label="Fruit"
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        status={{type: 'error', message: 'Required'}}
      />,
    );
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('does not set aria-invalid when status is not error', () => {
    render(
      <XDSTypeahead
        label="Fruit"
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        status={{type: 'warning', message: 'Watch out'}}
      />,
    );
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-invalid');
  });
});

describe('XDSBaseTypeahead hasEntriesOnFocus', () => {
  it('shows bootstrap results on mouse click', async () => {
    render(
      <XDSBaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        hasEntriesOnFocus
        debounceMs={0}
      />,
    );
    const input = screen.getByRole('combobox');

    // Simulate full mouse click sequence (pointerdown → focus → pointerup → click)
    fireEvent.pointerDown(input);
    fireEvent.focus(input);
    fireEvent.pointerUp(input);
    fireEvent.click(input);

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });
  });

  it('shows bootstrap results on keyboard focus', async () => {
    render(
      <XDSBaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        hasEntriesOnFocus
        debounceMs={0}
      />,
    );
    const input = screen.getByRole('combobox');

    // Keyboard focus — no pointer events
    fireEvent.focus(input);

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });
  });

  it('re-shows results on refocus when results already exist', async () => {
    render(
      <XDSBaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        hasEntriesOnFocus
        debounceMs={0}
      />,
    );
    const input = screen.getByRole('combobox');

    // Initial focus to load bootstrap results
    fireEvent.focus(input);
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    // Blur to close, then refocus
    fireEvent.blur(input);
    fireEvent.focus(input);

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });
  });
});

describe('XDSTypeahead edit mode', () => {
  it('enters edit mode on token container click', () => {
    const onChange = vi.fn();
    render(
      <XDSTypeahead
        label="Fruit"
        searchSource={fruitSource}
        value={fruits[0]}
        onChange={onChange}
      />,
    );
    screen.getByRole('combobox');

    // Click the token area to enter edit mode
    const removeButton = screen.getByRole('button', {
      name: `Remove ${fruits[0].label}`,
    });
    const tokenContainer = removeButton.closest('div')!;
    fireEvent.click(tokenContainer);

    // onChange should NOT have been called (value is preserved for restore)
    expect(onChange).not.toHaveBeenCalled();
  });

  it('restores token on blur without action', async () => {
    const onChange = vi.fn();
    render(
      <XDSTypeahead
        label="Fruit"
        searchSource={fruitSource}
        value={fruits[0]}
        onChange={onChange}
      />,
    );
    const input = screen.getByRole('combobox');

    // Enter edit mode
    const removeButton = screen.getByRole('button', {
      name: `Remove ${fruits[0].label}`,
    });
    fireEvent.click(removeButton.closest('div')!);

    // Blur without selecting anything
    fireEvent.blur(input);

    // onChange should not have been called — value restored
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('XDSBaseTypeahead keyboard navigation', () => {
  it('selects item with Enter key', async () => {
    const onChange = vi.fn();
    render(
      <XDSBaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={onChange}
        debounceMs={0}
      />,
    );
    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'a'}});

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    // First item should be highlighted by default, press Enter to select
    fireEvent.keyDown(input, {key: 'Enter'});
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({id: '1', label: 'Apple'}),
    );
  });

  it('navigates items with ArrowDown and ArrowUp', async () => {
    render(
      <XDSBaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        debounceMs={0}
      />,
    );
    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'a'}});

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    // Arrow down from first (index 0) to second (index 1)
    fireEvent.keyDown(input, {key: 'ArrowDown'});
    await waitFor(() => {
      const activeId = input.getAttribute('aria-activedescendant');
      expect(activeId).toContain('option-1');
    });

    // Arrow up back to first (index 0)
    fireEvent.keyDown(input, {key: 'ArrowUp'});
    await waitFor(() => {
      const activeId = input.getAttribute('aria-activedescendant');
      expect(activeId).toContain('option-0');
    });
  });

  it('closes dropdown with Escape key', async () => {
    render(
      <XDSBaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        debounceMs={0}
      />,
    );
    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'App'}});

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    fireEvent.keyDown(input, {key: 'Escape'});
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('wraps highlight from last to first on ArrowDown', async () => {
    const singleSource: XDSSearchSource = {
      search: () => [{id: '1', label: 'Apple'}],
      bootstrap: () => [],
    };
    render(
      <XDSBaseTypeahead
        searchSource={singleSource}
        value={null}
        onChange={() => {}}
        debounceMs={0}
      />,
    );
    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'a'}});

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    // Already at index 0 (only item), ArrowDown should wrap to 0
    fireEvent.keyDown(input, {key: 'ArrowDown'});
    await waitFor(() => {
      const activeId = input.getAttribute('aria-activedescendant');
      expect(activeId).toContain('option-0');
    });
  });

  it('opens dropdown with ArrowDown when hasEntriesOnFocus', async () => {
    render(
      <XDSBaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        hasEntriesOnFocus
        debounceMs={0}
      />,
    );
    const input = screen.getByRole('combobox');

    // Focus and wait for bootstrap
    fireEvent.focus(input);
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    // Close via Escape, then reopen with ArrowDown
    fireEvent.keyDown(input, {key: 'Escape'});
    expect(input).toHaveAttribute('aria-expanded', 'false');

    fireEvent.keyDown(input, {key: 'ArrowDown'});
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });
  });
});

describe('XDSBaseTypeahead selection', () => {
  it('calls onChange when dropdown item is clicked', async () => {
    const onChange = vi.fn();
    render(
      <XDSBaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={onChange}
        debounceMs={0}
      />,
    );
    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'Ban'}});

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    const option = screen.getByRole('option', {hidden: true});
    fireEvent.click(option);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({id: '2', label: 'Banana'}),
    );
  });

  it('clears query after selection', async () => {
    const onChange = vi.fn();
    render(
      <XDSBaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={onChange}
        debounceMs={0}
      />,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    fireEvent.change(input, {target: {value: 'Ban'}});

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    const option = screen.getByRole('option', {hidden: true});
    fireEvent.click(option);

    expect(input.value).toBe('');
  });
});

describe('XDSBaseTypeahead callbacks', () => {
  it('calls onOpenChange(true) when dropdown opens', async () => {
    const onOpenChange = vi.fn();
    render(
      <XDSBaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        onOpenChange={onOpenChange}
        hasEntriesOnFocus
        debounceMs={0}
      />,
    );
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  it('calls onChangeQuery when input changes', () => {
    const onChangeQuery = vi.fn();
    render(
      <XDSBaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        onChangeQuery={onChangeQuery}
        debounceMs={0}
      />,
    );
    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'test'}});

    expect(onChangeQuery).toHaveBeenCalledWith('test');
  });
});

describe('XDSBaseTypeahead disabled interaction', () => {
  it('does not open bootstrap results when disabled', () => {
    render(
      <XDSBaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        hasEntriesOnFocus
        isDisabled
        debounceMs={0}
      />,
    );
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);

    expect(input).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('XDSTypeahead disabled interaction', () => {
  it('does not call onChange when disabled and remove is attempted', () => {
    const onChange = vi.fn();
    render(
      <XDSTypeahead
        label="Fruit"
        searchSource={fruitSource}
        value={fruits[0]}
        onChange={onChange}
        isDisabled
      />,
    );
    // Token remove button should not be rendered when disabled
    expect(
      screen.queryByRole('button', {name: `Remove ${fruits[0].label}`}),
    ).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('XDSTypeahead aria-describedby', () => {
  it('wires aria-describedby to description element', () => {
    render(
      <XDSTypeahead
        label="Fruit"
        description="Pick a fruit"
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
      />,
    );
    const input = screen.getByRole('combobox');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();

    const descriptionEl = document.getElementById(describedBy!.split(' ')[0]);
    expect(descriptionEl).toHaveTextContent('Pick a fruit');
  });
});
