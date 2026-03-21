/**
 * @file XDSTokenizer.test.tsx
 * @input Uses vitest, @testing-library/react, XDSTokenizer
 * @output Unit tests for XDSTokenizer component
 * @position Testing; validates XDSTokenizer.tsx
 *
 * SYNC: When XDSTokenizer.tsx changes, update tests to match
 */

import {describe, it, expect, vi, beforeAll, afterAll} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import {XDSTokenizer} from './XDSTokenizer';
import type {XDSSearchSource, XDSSearchableItem} from '../Typeahead/types';

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
const users: XDSSearchableItem[] = [
  {id: '1', label: 'Alice'},
  {id: '2', label: 'Bob'},
  {id: '3', label: 'Charlie'},
  {id: '4', label: 'Diana'},
];

const userSource: XDSSearchSource = {
  search: (query: string) =>
    users.filter(u => u.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => users.slice(0, 3),
};

describe('XDSTokenizer', () => {
  it('renders with label', () => {
    render(
      <XDSTokenizer
        label="Members"
        searchSource={userSource}
        value={[]}
        onChange={() => {}}
      />,
    );
    // Label is rendered by XDSField
    expect(screen.getByText('Members')).toBeInTheDocument();
  });

  it('renders combobox input', () => {
    render(
      <XDSTokenizer
        label="Members"
        searchSource={userSource}
        value={[]}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders placeholder when no tokens', () => {
    render(
      <XDSTokenizer
        label="Members"
        searchSource={userSource}
        value={[]}
        onChange={() => {}}
        placeholder="Search people..."
      />,
    );
    expect(screen.getByPlaceholderText('Search people...')).toBeInTheDocument();
  });

  it('renders tokens for selected items', () => {
    render(
      <XDSTokenizer
        label="Members"
        searchSource={userSource}
        value={[users[0], users[1]]}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('renders remove buttons on tokens', () => {
    render(
      <XDSTokenizer
        label="Members"
        searchSource={userSource}
        value={[users[0]]}
        onChange={() => {}}
      />,
    );
    expect(
      screen.getByRole('button', {name: 'Remove Alice'}),
    ).toBeInTheDocument();
  });

  it('calls onChange with remove when token is removed', () => {
    const onChange = vi.fn();
    render(
      <XDSTokenizer
        label="Members"
        searchSource={userSource}
        value={[users[0], users[1]]}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', {name: 'Remove Alice'}));
    expect(onChange).toHaveBeenCalledWith([users[1]], {
      item: users[0],
      type: 'remove',
    });
  });

  it('visually hides input when maxEntries is reached but preserves it for keyboard access', () => {
    render(
      <XDSTokenizer
        label="Members"
        searchSource={userSource}
        value={[users[0], users[1]]}
        onChange={() => {}}
        maxEntries={2}
      />,
    );
    // Input stays in the DOM for keyboard accessibility (backspace to remove)
    // but is visually hidden
    const input = screen.getByRole('combobox', {hidden: true});
    expect(input).toBeInTheDocument();
  });

  it('shows input when under maxEntries', () => {
    render(
      <XDSTokenizer
        label="Members"
        searchSource={userSource}
        value={[users[0]]}
        onChange={() => {}}
        maxEntries={2}
      />,
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows clear all button when hasClear is true', () => {
    render(
      <XDSTokenizer
        label="Members"
        searchSource={userSource}
        value={[users[0]]}
        onChange={() => {}}
        hasClear
      />,
    );
    expect(screen.getByRole('button', {name: 'Clear all'})).toBeInTheDocument();
  });

  it('does not show clear all when no tokens', () => {
    render(
      <XDSTokenizer
        label="Members"
        searchSource={userSource}
        value={[]}
        onChange={() => {}}
        hasClear
      />,
    );
    expect(
      screen.queryByRole('button', {name: 'Clear all'}),
    ).not.toBeInTheDocument();
  });

  it('renders description text', () => {
    render(
      <XDSTokenizer
        label="Members"
        description="Select team members"
        searchSource={userSource}
        value={[]}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('Select team members')).toBeInTheDocument();
  });

  it('renders error status', () => {
    render(
      <XDSTokenizer
        label="Members"
        searchSource={userSource}
        value={[]}
        onChange={() => {}}
        status={{type: 'error', message: 'At least one member required'}}
      />,
    );
    expect(
      screen.getByText('At least one member required'),
    ).toBeInTheDocument();
  });

  it('disables tokens and input when isDisabled', () => {
    render(
      <XDSTokenizer
        label="Members"
        searchSource={userSource}
        value={[users[0]]}
        onChange={() => {}}
        isDisabled
      />,
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
    // Remove button should not be present when disabled
    expect(
      screen.queryByRole('button', {name: 'Remove Alice'}),
    ).not.toBeInTheDocument();
  });

  it('renders with data-testid', () => {
    render(
      <XDSTokenizer
        label="Members"
        searchSource={userSource}
        value={[]}
        onChange={() => {}}
        data-testid="my-tokenizer"
      />,
    );
    expect(screen.getByTestId('my-tokenizer')).toBeInTheDocument();
  });

  it('renders group with aria-label', () => {
    render(
      <XDSTokenizer
        label="Members"
        searchSource={userSource}
        value={[]}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('group')).toHaveAttribute('aria-label', 'Members');
  });

  it('hides placeholder when tokens are present', () => {
    render(
      <XDSTokenizer
        label="Members"
        searchSource={userSource}
        value={[users[0]]}
        onChange={() => {}}
        placeholder="Search people..."
      />,
    );
    const input = screen.getByRole('combobox');
    // Placeholder should be empty when tokens exist
    expect(input).not.toHaveAttribute('placeholder', 'Search people...');
  });

  it('shows placeholder when no tokens are present', () => {
    render(
      <XDSTokenizer
        label="Members"
        searchSource={userSource}
        value={[]}
        onChange={() => {}}
        placeholder="Search people..."
      />,
    );
    expect(screen.getByPlaceholderText('Search people...')).toBeInTheDocument();
  });

  it('renders tokens as direct children of wrapper (not in a sub-container)', () => {
    const {container: _container} = render(
      <XDSTokenizer
        label="Members"
        searchSource={userSource}
        value={[users[0], users[1]]}
        onChange={() => {}}
        data-testid="tokenizer"
      />,
    );
    const wrapper = screen.getByTestId('tokenizer');
    // Tokens should be direct children of the wrapper, not nested in a div
    const tokenElements = wrapper.querySelectorAll(':scope > span');
    expect(tokenElements.length).toBeGreaterThanOrEqual(2);
  });

  // =========================================================================
  // Hardening: aria-required and aria-invalid
  // =========================================================================

  it('sets aria-required on combobox when isRequired', () => {
    render(
      <XDSTokenizer
        label="Members"
        searchSource={userSource}
        value={[]}
        onChange={() => {}}
        isRequired
      />,
    );
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-required',
      'true',
    );
  });

  it('does not set aria-required when not required', () => {
    render(
      <XDSTokenizer
        label="Members"
        searchSource={userSource}
        value={[]}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-required');
  });

  it('sets aria-invalid on combobox when status is error', () => {
    render(
      <XDSTokenizer
        label="Members"
        searchSource={userSource}
        value={[]}
        onChange={() => {}}
        status={{type: 'error', message: 'Required'}}
      />,
    );
    expect(screen.getByRole('combobox')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('does not set aria-invalid for warning status', () => {
    render(
      <XDSTokenizer
        label="Members"
        searchSource={userSource}
        value={[]}
        onChange={() => {}}
        status={{type: 'warning', message: 'Heads up'}}
      />,
    );
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-invalid');
  });

  // =========================================================================
  // Hardening: maxEntries hides input from screen readers
  // =========================================================================

  it('sets aria-hidden and tabIndex=-1 on input when at maxEntries', () => {
    render(
      <XDSTokenizer
        label="Members"
        searchSource={userSource}
        value={[users[0], users[1]]}
        onChange={() => {}}
        maxEntries={2}
      />,
    );
    const input = screen.getByRole('combobox', {hidden: true});
    expect(input).toHaveAttribute('aria-hidden', 'true');
    expect(input).toHaveAttribute('tabindex', '-1');
  });

  it('does not set aria-hidden when under maxEntries', () => {
    render(
      <XDSTokenizer
        label="Members"
        searchSource={userSource}
        value={[users[0]]}
        onChange={() => {}}
        maxEntries={2}
      />,
    );
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-hidden');
  });

  // =========================================================================
  // Hardening: aria-live announcements
  // =========================================================================

  it('has an aria-live region for announcements', () => {
    render(
      <XDSTokenizer
        label="Members"
        searchSource={userSource}
        value={[]}
        onChange={() => {}}
      />,
    );
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  });

  // =========================================================================
  // Hardening: handleClearAll uses type: 'clear'
  // =========================================================================

  it('calls onChange with type remove when clearing all tokens', () => {
    const onChange = vi.fn();
    render(
      <XDSTokenizer
        label="Members"
        searchSource={userSource}
        value={[users[0], users[1]]}
        onChange={onChange}
        hasClear
      />,
    );
    fireEvent.click(screen.getByRole('button', {name: 'Clear all'}));
    expect(onChange).toHaveBeenCalledWith([], {
      item: users[1],
      type: 'remove',
    });
  });

  // =========================================================================
  // Hardening: Arrow key navigation between tokens
  // =========================================================================

  it('moves focus to last token remove button on ArrowLeft from empty input', () => {
    render(
      <XDSTokenizer
        label="Members"
        searchSource={userSource}
        value={[users[0], users[1]]}
        onChange={() => {}}
      />,
    );
    const input = screen.getByRole('combobox');
    input.focus();
    fireEvent.keyDown(input, {key: 'ArrowLeft'});
    const removeButton = screen.getByRole('button', {name: 'Remove Bob'});
    expect(document.activeElement).toBe(removeButton);
  });

  it('navigates between token remove buttons with ArrowLeft/ArrowRight', () => {
    render(
      <XDSTokenizer
        label="Members"
        searchSource={userSource}
        value={[users[0], users[1], users[2]]}
        onChange={() => {}}
      />,
    );
    // Focus the last token's remove button
    const removeBob = screen.getByRole('button', {name: 'Remove Bob'});
    removeBob.focus();

    // ArrowLeft moves to previous token
    fireEvent.keyDown(removeBob, {key: 'ArrowLeft'});
    expect(document.activeElement).toBe(
      screen.getByRole('button', {name: 'Remove Alice'}),
    );

    // ArrowRight moves back
    fireEvent.keyDown(document.activeElement!, {key: 'ArrowRight'});
    expect(document.activeElement).toBe(removeBob);
  });

  it('moves focus from last token to input on ArrowRight', () => {
    render(
      <XDSTokenizer
        label="Members"
        searchSource={userSource}
        value={[users[0], users[1]]}
        onChange={() => {}}
      />,
    );
    const removeBob = screen.getByRole('button', {name: 'Remove Bob'});
    removeBob.focus();

    fireEvent.keyDown(removeBob, {key: 'ArrowRight'});
    expect(document.activeElement).toBe(screen.getByRole('combobox'));
  });
});
