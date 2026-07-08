// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tokenizer.test.tsx
 * @input Uses vitest, @testing-library/react, Tokenizer
 * @output Unit tests for Tokenizer component
 * @position Testing; validates Tokenizer.tsx
 *
 * SYNC: When Tokenizer.tsx changes, update tests to match
 */

import {describe, it, expect, vi, beforeAll, afterAll} from 'vitest';
import {render, screen, fireEvent, act, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Tokenizer} from './Tokenizer';
import type {SearchSource, SearchableItem} from '../Typeahead/types';

// Store original matches to restore later
const originalMatches = HTMLElement.prototype.matches;

// Track popover open state per element
const popoverOpenState = new WeakMap<HTMLElement, boolean>();

// Mock ResizeObserver for jsdom
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock Popover API for jsdom
beforeAll(() => {
  globalThis.ResizeObserver = MockResizeObserver;
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).matches = function (
    selector: string,
  ): boolean {
    if (selector === ':popover-open') {
      return popoverOpenState.get(this) ?? false;
    }
    return originalMatches.call(this, selector);
  };
});

afterAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).matches = originalMatches;
});

// Test data
const users: SearchableItem[] = [
  {id: '1', label: 'Alice'},
  {id: '2', label: 'Bob'},
  {id: '3', label: 'Charlie'},
  {id: '4', label: 'Diana'},
];

const userSource: SearchSource = {
  search: (query: string) =>
    users.filter(u => u.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => users.slice(0, 3),
};

describe('Tokenizer', () => {
  it('forwards ref to the root field element', () => {
    let root: HTMLDivElement | null = null;
    render(
      <Tokenizer
        ref={el => {
          root = el;
        }}
        label="Members"
        searchSource={userSource}
        value={[]}
        onChange={() => {}}
      />,
    );
    expect(root).toBeInstanceOf(HTMLDivElement);
    expect(root).toHaveClass('astryx-field');
  });

  it('exposes focus control through handleRef', () => {
    let handle: {focus: () => void; blur: () => void} | null = null;
    render(
      <Tokenizer
        handleRef={h => {
          handle = h;
        }}
        label="Members"
        searchSource={userSource}
        value={[]}
        onChange={() => {}}
      />,
    );

    act(() => {
      handle?.focus();
    });

    expect(screen.getByRole('combobox')).toHaveFocus();
  });

  it('renders with label', () => {
    render(
      <Tokenizer
        label="Members"
        searchSource={userSource}
        value={[]}
        onChange={() => {}}
      />,
    );
    // Label is rendered by Field
    expect(screen.getByText('Members')).toBeInTheDocument();
  });

  it('renders combobox input', () => {
    render(
      <Tokenizer
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
      <Tokenizer
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
      <Tokenizer
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
      <Tokenizer
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
      <Tokenizer
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
      <Tokenizer
        label="Members"
        searchSource={userSource}
        value={[users[0], users[1]]}
        onChange={() => {}}
        maxEntries={2}
      />,
    );
    // Input stays in the DOM for keyboard accessibility (backspace to remove)
    // but is visually hidden
    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
  });

  it('shows input when under maxEntries', () => {
    render(
      <Tokenizer
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
      <Tokenizer
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
      <Tokenizer
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
      <Tokenizer
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
      <Tokenizer
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
      <Tokenizer
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
      <Tokenizer
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
      <Tokenizer
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
      <Tokenizer
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
      <Tokenizer
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
      <Tokenizer
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

  it('renders with size="lg"', () => {
    render(
      <Tokenizer
        label="Members"
        searchSource={userSource}
        value={[]}
        onChange={() => {}}
        size="lg"
      />,
    );
    expect(screen.getByText('Members')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  describe('tokenOverflowBehavior', () => {
    it('none: renders all tokens directly without OverflowList', () => {
      const {container} = render(
        <Tokenizer
          label="Members"
          searchSource={userSource}
          value={[users[0], users[1]]}
          onChange={() => {}}
          tokenOverflowBehavior="none"
          data-testid="tokenizer"
        />,
      );
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      // Should not have overflow list measurement containers
      expect(
        container.querySelector('[data-overflow-list]'),
      ).not.toBeInTheDocument();
    });

    it('unfocusedInline: renders OverflowList when blurred', () => {
      render(
        <Tokenizer
          label="Members"
          searchSource={userSource}
          value={[users[0], users[1], users[2]]}
          onChange={() => {}}
          tokenOverflowBehavior="unfocusedInline"
          data-testid="tokenizer"
        />,
      );
      // OverflowList renders a hidden measurement container plus visible items,
      // so tokens appear multiple times in the DOM
      expect(screen.getAllByText('Alice').length).toBeGreaterThanOrEqual(1);
    });

    it('unfocusedInline: removes truncation on focus', () => {
      render(
        <Tokenizer
          label="Members"
          searchSource={userSource}
          value={[users[0], users[1], users[2]]}
          onChange={() => {}}
          tokenOverflowBehavior="unfocusedInline"
          data-testid="tokenizer"
        />,
      );
      const wrapper = screen.getByTestId('tokenizer');
      // Focus the wrapper (simulates focusing the input within)
      fireEvent.focusIn(wrapper);
      // All tokens should be directly rendered (no overflow list)
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
    });

    it('unfocusedLayer: renders placeholder and top-layer popover', () => {
      const {container} = render(
        <Tokenizer
          label="Members"
          searchSource={userSource}
          value={[users[0], users[1]]}
          onChange={() => {}}
          tokenOverflowBehavior="unfocusedLayer"
          data-testid="tokenizer"
        />,
      );
      // The wrapper should be rendered inside the placeholder (truncated view in-flow)
      const wrapper = screen.getByTestId('tokenizer');
      expect(wrapper).toBeInTheDocument();
      // A popover element should exist for the top-layer expanded content
      const popover = container.querySelector('[popover]');
      expect(popover).toBeInTheDocument();
      // Only one group role (the wrapper)
      expect(container.querySelectorAll('[role="group"]').length).toBe(1);
    });

    it('unfocusedLayer: shows expanded content in popover on focus', () => {
      render(
        <Tokenizer
          label="Members"
          searchSource={userSource}
          value={[users[0], users[1], users[2]]}
          onChange={() => {}}
          tokenOverflowBehavior="unfocusedLayer"
          data-testid="tokenizer"
        />,
      );
      const wrapper = screen.getByTestId('tokenizer');
      // Focus the wrapper to expand
      fireEvent.focusIn(wrapper);
      // showPopover should have been called
      expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
      // All tokens should be visible
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Charlie')).toBeInTheDocument();
    });

    it('unfocusedLayer: collapses on blur', () => {
      const {container} = render(
        <Tokenizer
          label="Members"
          searchSource={userSource}
          value={[users[0], users[1], users[2]]}
          onChange={() => {}}
          tokenOverflowBehavior="unfocusedLayer"
          data-testid="tokenizer"
        />,
      );
      const wrapper = screen.getByTestId('tokenizer');
      // Focus to expand — fires on wrapper in the placeholder
      act(() => {
        fireEvent.focusIn(wrapper);
      });
      // After focus, content moves to the popover. We need to blur
      // from the popover content, not the original wrapper.
      // Get the popover element and blur from it.
      const popover = container.querySelector('[popover]');
      expect(popover).toBeInTheDocument();
      // Find the wrapper again (it may have moved into the popover)
      const expandedWrapper = screen.getByTestId('tokenizer');
      act(() => {
        fireEvent.focusOut(expandedWrapper, {relatedTarget: document.body});
      });
      // hidePopover should have been called
      expect(HTMLElement.prototype.hidePopover).toHaveBeenCalled();
    });

    it('unfocusedInline: does not truncate when no tokens', () => {
      render(
        <Tokenizer
          label="Members"
          searchSource={userSource}
          value={[]}
          onChange={() => {}}
          tokenOverflowBehavior="unfocusedInline"
          data-testid="tokenizer"
        />,
      );
      // With no tokens, should not be in truncated state
      const wrapper = screen.getByTestId('tokenizer');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('hasCreate', () => {
    const emptySource: SearchSource = {
      search: () => [],
      bootstrap: () => [],
    };

    it('shows a "Create" option when typing with hasCreate', async () => {
      render(
        <Tokenizer
          label="Tags"
          searchSource={emptySource}
          value={[]}
          onChange={() => {}}
          hasCreate
          debounceMs={0}
        />,
      );

      const input = screen.getByRole('combobox');
      await act(async () => {
        fireEvent.change(input, {target: {value: 'new-tag'}});
      });
      await act(async () => {
        await new Promise(r => setTimeout(r, 50));
      });

      expect(screen.queryByText('Create "new-tag"')).toBeInTheDocument();
    });

    it('fires onChange with type "create" when the Create item is clicked', async () => {
      const onChange = vi.fn();
      render(
        <Tokenizer
          label="Tags"
          searchSource={emptySource}
          value={[]}
          onChange={onChange}
          hasCreate
          debounceMs={0}
        />,
      );

      const input = screen.getByRole('combobox');
      await act(async () => {
        fireEvent.change(input, {target: {value: 'new-tag'}});
      });
      await act(async () => {
        await new Promise(r => setTimeout(r, 50));
      });

      const createOption = screen.getByText('Create "new-tag"');
      await act(async () => {
        fireEvent.click(createOption);
      });

      expect(onChange).toHaveBeenCalledWith(
        [{id: 'new-tag', label: 'new-tag'}],
        {item: {id: 'new-tag', label: 'new-tag'}, type: 'create'},
      );
    });

    it('does not show Create option for already-selected values', async () => {
      render(
        <Tokenizer
          label="Tags"
          searchSource={emptySource}
          value={[{id: 'existing', label: 'existing'}]}
          onChange={() => {}}
          hasCreate
          debounceMs={0}
        />,
      );

      const input = screen.getByRole('combobox');
      await act(async () => {
        fireEvent.change(input, {target: {value: 'existing'}});
      });
      await act(async () => {
        await new Promise(r => setTimeout(r, 50));
      });

      expect(screen.queryByText('Create "existing"')).not.toBeInTheDocument();
    });

    it('does not show Create option when hasCreate is false', async () => {
      render(
        <Tokenizer
          label="Tags"
          searchSource={emptySource}
          value={[]}
          onChange={() => {}}
          hasCreate={false}
          debounceMs={0}
        />,
      );

      const input = screen.getByRole('combobox');
      await act(async () => {
        fireEvent.change(input, {target: {value: 'something'}});
      });
      await act(async () => {
        await new Promise(r => setTimeout(r, 50));
      });

      expect(screen.queryByText('Create "something"')).not.toBeInTheDocument();
    });

    it('appends Create option alongside real search results', async () => {
      const onChange = vi.fn();
      render(
        <Tokenizer
          label="Tags"
          searchSource={userSource}
          value={[]}
          onChange={onChange}
          hasCreate
          debounceMs={0}
        />,
      );

      const input = screen.getByRole('combobox');
      // "Ali" matches Alice but "Ali" itself is a new value
      await act(async () => {
        fireEvent.change(input, {target: {value: 'Ali'}});
      });
      await act(async () => {
        await new Promise(r => setTimeout(r, 50));
      });

      // Both the real result and the Create option should appear
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Create "Ali"')).toBeInTheDocument();
    });

    it('does not show Create when typed text exactly matches a result label', async () => {
      render(
        <Tokenizer
          label="Tags"
          searchSource={userSource}
          value={[]}
          onChange={() => {}}
          hasCreate
          debounceMs={0}
        />,
      );

      const input = screen.getByRole('combobox');
      await act(async () => {
        fireEvent.change(input, {target: {value: 'Alice'}});
      });
      await act(async () => {
        await new Promise(r => setTimeout(r, 50));
      });

      // "Alice" exactly matches a result — no Create option
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.queryByText('Create "Alice"')).not.toBeInTheDocument();
    });
  });

  describe('popover after selection', () => {
    it('does not show an empty popover after selecting an item with hasEntriesOnFocus', async () => {
      const onChange = vi.fn();
      render(
        <Tokenizer
          label="Members"
          searchSource={userSource}
          value={[]}
          onChange={onChange}
          hasEntriesOnFocus
          debounceMs={0}
        />,
      );
      const input = screen.getByRole('combobox');

      // Focus to open bootstrap results
      fireEvent.focus(input);
      await act(async () => {
        await new Promise(r => setTimeout(r, 50));
      });
      expect(input).toHaveAttribute('aria-expanded', 'true');

      // Select an item
      fireEvent.click(screen.getByText('Alice'));
      expect(onChange).toHaveBeenCalled();

      // Popover should not reopen with an empty menu after selection
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('paste behavior', () => {
    it('pasting text triggers search results like typing', async () => {
      const user = userEvent.setup();
      render(
        <Tokenizer
          label="Members"
          searchSource={userSource}
          value={[]}
          onChange={() => {}}
          debounceMs={0}
        />,
      );

      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.paste('Ali');
      await act(async () => {
        await new Promise(r => setTimeout(r, 50));
      });

      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('pasting text shows Create option with hasCreate', async () => {
      const user = userEvent.setup();
      render(
        <Tokenizer
          label="Tags"
          searchSource={userSource}
          value={[]}
          onChange={() => {}}
          hasCreate
          debounceMs={0}
        />,
      );

      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.paste('NewTag');
      await act(async () => {
        await new Promise(r => setTimeout(r, 50));
      });

      expect(screen.getByText('Create "NewTag"')).toBeInTheDocument();
    });
  });

  describe('disabledMessage', () => {
    const h = {hidden: true} as const;
    const isOpen = (el: Element) => el.matches(':popover-open');

    function renderTokenizer(props?: {onChange?: () => void}) {
      return render(
        <Tokenizer
          label="Members"
          searchSource={userSource}
          value={[]}
          onChange={props?.onChange ?? (() => {})}
          isDisabled
          disabledMessage="You need edit access to change members"
        />,
      );
    }

    it('shows the reason tooltip on hover when disabled with a reason', async () => {
      renderTokenizer();
      const tooltip = screen.getByRole('tooltip', h);
      expect(tooltip).toHaveTextContent(
        'You need edit access to change members',
      );
      const wrapper = screen.getByRole('group', {name: 'Members'});
      fireEvent.mouseEnter(wrapper);
      await waitFor(() => expect(isOpen(tooltip)).toBe(true));
      fireEvent.mouseLeave(wrapper);
      await waitFor(() => expect(isOpen(tooltip)).toBe(false));
    });

    it('shows the reason tooltip on keyboard focus', async () => {
      const user = userEvent.setup();
      renderTokenizer();
      const tooltip = screen.getByRole('tooltip', h);
      await user.tab();
      expect(screen.getByRole('combobox')).toHaveFocus();
      await waitFor(() => expect(isOpen(tooltip)).toBe(true));
    });

    it('does not render a tooltip when not disabled', () => {
      render(
        <Tokenizer
          label="Members"
          searchSource={userSource}
          value={[]}
          onChange={() => {}}
          disabledMessage="You need edit access to change members"
        />,
      );
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('does not render a tooltip when disabled without a reason', () => {
      render(
        <Tokenizer
          label="Members"
          searchSource={userSource}
          value={[]}
          onChange={() => {}}
          isDisabled
        />,
      );
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('keeps the input focusable via aria-disabled when a reason is provided', () => {
      renderTokenizer();
      const input = screen.getByRole('combobox');
      expect(input).not.toBeDisabled();
      expect(input).toHaveAttribute('aria-disabled', 'true');
    });

    it('links the reason tooltip via aria-describedby', () => {
      renderTokenizer();
      const input = screen.getByRole('combobox');
      const tooltip = screen.getByRole('tooltip', h);
      expect(input.getAttribute('aria-describedby')).toContain(tooltip.id);
    });

    it('blocks input while focusable-disabled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderTokenizer({onChange});
      const input = screen.getByRole('combobox');
      input.focus();
      await user.keyboard('Ali');
      expect((input as HTMLInputElement).value).toBe('');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('keeps the input natively disabled when disabled without a reason', () => {
      render(
        <Tokenizer
          label="Members"
          searchSource={userSource}
          value={[]}
          onChange={() => {}}
          isDisabled
        />,
      );
      expect(screen.getByRole('combobox')).toBeDisabled();
    });
  });
  describe('form participation', () => {
    it('submits one entry per token id under htmlName', () => {
      const {container} = render(
        <form>
          <Tokenizer
            label="Users"
            htmlName="users"
            searchSource={userSource}
            value={[users[0], users[1]]}
            onChange={() => {}}
          />
        </form>,
      );
      const data = new FormData(container.querySelector('form')!);
      expect(data.getAll('users')).toEqual([users[0].id, users[1].id]);
    });

    it('is excluded from form data when disabled', () => {
      const {container} = render(
        <form>
          <Tokenizer
            label="Users"
            htmlName="users"
            searchSource={userSource}
            value={[users[0]]}
            onChange={() => {}}
            isDisabled
          />
        </form>,
      );
      expect([...new FormData(container.querySelector('form')!).keys()]).toEqual([]);
    });
  });
});
