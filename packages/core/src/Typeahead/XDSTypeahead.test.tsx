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
    const input = screen.getByRole('combobox');

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
