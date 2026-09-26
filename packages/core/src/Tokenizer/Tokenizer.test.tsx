// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tokenizer.test.tsx
 * @input Uses vitest, @testing-library/react, Tokenizer
 * @output Unit tests for Tokenizer component
 * @position Testing; validates Tokenizer.tsx
 *
 * SYNC: When Tokenizer.tsx changes, update tests to match
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  afterAll,
  afterEach,
} from 'vitest';
import {render, screen, fireEvent, act, waitFor} from '@testing-library/react';
import {Profiler, useState} from 'react';
import userEvent from '@testing-library/user-event';
import {Tokenizer, type TokenizerProps} from './Tokenizer';
import {__resetLiveRegionsForTest} from '../hooks/useAnnounce';
import type {SearchSource, SearchableItem} from '../Typeahead/types';
import {TestIcon} from '../__tests__/TestIcon';
import {InternationalizationProvider} from '../i18n';
import type * as TokenModule from '../Token';

// Every Token render, in order, by label.
//
// A spy that WRAPS the real component rather than replacing it: a stand-in
// would measure the stand-in, and the number under review is how often the
// real token subtree re-renders during a search.
const renderedTokens: string[] = [];
vi.mock('../Token', async importActual => {
  const actual = await importActual<typeof TokenModule>();
  return {
    ...actual,
    Token: (props: Parameters<typeof TokenModule.Token>[0]) => {
      renderedTokens.push(typeof props.label === 'string' ? props.label : '');
      return actual.Token(props);
    },
  };
});

// Test-supplied announcement strings: the assertions below depend on no
// catalog, and no hardcoded English in the component can satisfy them.
const TOKEN_MESSAGES = {
  fr: {
    '@astryx.tokenizer.tokenAdded': 'Ajouté : {label}',
    '@astryx.tokenizer.tokenRemoved': 'Retiré : {label}',
  },
};

function politeRegion(): HTMLElement | null {
  return document.querySelector('[data-astryx-live-region="polite"]');
}

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

afterEach(() => {
  __resetLiveRegionsForTest();
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

describe('Tokenizer minQueryLength', () => {
  it('forwards the threshold to the typeahead engine', async () => {
    const search = vi.fn((query: string) =>
      users.filter(u => u.label.toLowerCase().includes(query.toLowerCase())),
    );
    render(
      <Tokenizer
        label="People"
        searchSource={{search, bootstrap: () => []}}
        value={[]}
        onChange={() => {}}
        minQueryLength={3}
        debounceMs={0}
      />,
    );
    const input = screen.getByRole('combobox');

    fireEvent.change(input, {target: {value: 'Al'}});
    await act(async () => {
      await Promise.resolve();
    });
    expect(search).not.toHaveBeenCalled();
    expect(input).toHaveAttribute('aria-expanded', 'false');

    fireEvent.change(input, {target: {value: 'Ali'}});
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });
  });
});

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

    it('unfocusedLayer: RTL emits no justify-self into the inset-positioned popover', () => {
      // The popover positions itself with explicit anchor() insets
      // (positioning: 'custom'), so none of useLayer's placement-derived
      // styles may reach it — an RTL justify-self with insets and no
      // position-area would re-align the box inside the inset-modified
      // containing block instead of hugging the anchor.
      const original = window.getComputedStyle;
      let root: HTMLElement | null = null;
      const spy = vi
        .spyOn(window, 'getComputedStyle')
        .mockImplementation((el, pseudo) => {
          const style = original(el, pseudo);
          if (root && el instanceof Element && root.contains(el)) {
            Object.defineProperty(style, 'direction', {
              value: 'rtl',
              configurable: true,
            });
          }
          return style;
        });

      try {
        const {container} = render(
          <div style={{direction: 'rtl'}}>
            <Tokenizer
              label="Members"
              searchSource={userSource}
              value={[users[0], users[1], users[2]]}
              onChange={() => {}}
              tokenOverflowBehavior="unfocusedLayer"
              data-testid="tokenizer"
            />
          </div>,
        );
        root = container.firstElementChild as HTMLElement;

        fireEvent.focusIn(screen.getByTestId('tokenizer'));
        expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();

        const popover = container.querySelector('[popover]');
        const style = popover?.getAttribute('style') ?? '';
        // jsdom drops anchor() values for known properties (top/left), so
        // anchor the positive check on position-anchor instead. The negative
        // checks are meaningful: jsdom serializes both justify-self and
        // position-area when emitted (the DropdownMenu RTL test relies on it).
        expect(style).toContain('position-anchor');
        expect(style).not.toContain('justify-self');
        expect(style).not.toContain('position-area');
        expect(style).not.toContain('position-try-fallbacks');
      } finally {
        spy.mockRestore();
      }
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

    it('still offers Create below minQueryLength, and does not search', async () => {
      // The threshold exists to avoid a fetch too broad to be worth making.
      // Creating costs no fetch, so a field that can create `QA` should not
      // stop being able to just because a search for `QA` would match too
      // much. Reported on #5385.
      const search = vi.fn(() => []);
      const onChange = vi.fn();
      render(
        <Tokenizer
          label="Tags"
          searchSource={{search, bootstrap: () => []}}
          value={[]}
          onChange={onChange}
          hasCreate
          minQueryLength={3}
          debounceMs={0}
        />,
      );

      const input = screen.getByRole('combobox');
      await act(async () => {
        fireEvent.change(input, {target: {value: 'QA'}});
      });
      await act(async () => {
        await new Promise(r => setTimeout(r, 50));
      });

      // Offered...
      expect(screen.queryByText('Create "QA"')).toBeInTheDocument();
      // ...without the source ever being asked.
      expect(search).not.toHaveBeenCalled();
      // ...and it commits.
      fireEvent.click(screen.getByText('Create "QA"'));
      expect(onChange).toHaveBeenCalledWith(
        [expect.objectContaining({id: 'QA', label: 'QA'})],
        expect.objectContaining({type: 'create'}),
      );
    });

    it('offers no menu below the threshold without hasCreate', async () => {
      // The negative control for the case above: with nothing to derive from
      // the text, a below-threshold query still opens nothing, and never
      // reports "no results" for a query that was not searched.
      const search = vi.fn(() => []);
      render(
        <Tokenizer
          label="Tags"
          searchSource={{search, bootstrap: () => []}}
          value={[]}
          onChange={() => {}}
          minQueryLength={3}
          debounceMs={0}
        />,
      );

      const input = screen.getByRole('combobox');
      await act(async () => {
        fireEvent.change(input, {target: {value: 'QA'}});
      });
      await act(async () => {
        await new Promise(r => setTimeout(r, 50));
      });

      expect(search).not.toHaveBeenCalled();
      expect(input).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByText('No results found')).not.toBeInTheDocument();
    });

    it('does not offer Create below the threshold for a token already held', async () => {
      render(
        <Tokenizer
          label="Tags"
          searchSource={{search: () => [], bootstrap: () => []}}
          value={[{id: 'QA', label: 'QA'}]}
          onChange={() => {}}
          hasCreate
          minQueryLength={3}
          debounceMs={0}
        />,
      );

      const input = screen.getByRole('combobox');
      await act(async () => {
        fireEvent.change(input, {target: {value: 'QA'}});
      });
      await act(async () => {
        await new Promise(r => setTimeout(r, 50));
      });

      expect(screen.queryByText('Create "QA"')).not.toBeInTheDocument();
    });

    it('offers Create on top of a full menu, not in place of a result', async () => {
      // The Create entry is appended after the results are cut to
      // `maxMenuItems`, so a full menu shows one more option rather than
      // dropping its last result to make room. Deliberate: creating is a
      // different capability from searching, and the cap exists to bound how
      // many *results* a menu shows.
      const many = Array.from({length: 20}, (_, i) => ({
        id: `qa-${i}`,
        label: `QA ${i}`,
      }));
      render(
        <Tokenizer
          label="Tags"
          searchSource={{search: () => many, bootstrap: () => []}}
          value={[]}
          onChange={() => {}}
          hasCreate
          maxMenuItems={3}
          debounceMs={0}
        />,
      );

      const input = screen.getByRole('combobox');
      await act(async () => {
        fireEvent.change(input, {target: {value: 'QA'}});
      });
      await act(async () => {
        await new Promise(r => setTimeout(r, 50));
      });

      // Queried off the document rather than by role: the popover renders
      // into a layer that jsdom keeps out of the accessibility tree, which is
      // why the tests around this one reach for text too.
      const options = document.querySelectorAll('[role="option"]');
      expect(options).toHaveLength(4);
      expect(options[3]).toHaveTextContent('Create "QA"');
    });

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

  describe('popover after typed-query selection', () => {
    it.each([false, true])(
      'closes after selecting a typed result when hasEntriesOnFocus is %s',
      async hasEntriesOnFocus => {
        const onChange = vi.fn();
        render(
          <Tokenizer
            label="Members"
            searchSource={userSource}
            value={[]}
            onChange={onChange}
            hasEntriesOnFocus={hasEntriesOnFocus}
            debounceMs={0}
          />,
        );
        const input = screen.getByRole('combobox');

        fireEvent.change(input, {target: {value: 'Ali'}});
        await waitFor(() => {
          expect(input).toHaveAttribute('aria-expanded', 'true');
          expect(screen.getByText('Alice')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Alice'));
        expect(onChange).toHaveBeenCalledWith([users[0]], {
          item: users[0],
          type: 'add',
        });
        expect(input).toHaveAttribute('aria-expanded', 'false');
      },
    );
  });

  describe('consecutive selection menu', () => {
    const fixture = (props: Partial<TokenizerProps<SearchableItem>> = {}) => (
      <Tokenizer
        label="Members"
        searchSource={userSource}
        value={[]}
        onChange={() => {}}
        hasEntriesOnFocus
        debounceMs={0}
        {...props}
      />
    );

    function ControlledTokenizer({
      debounceMs = 0,
      maxEntries,
      maxMenuItems,
      source = userSource,
    }: {
      debounceMs?: number;
      maxEntries?: number;
      maxMenuItems?: number;
      source?: SearchSource;
    }) {
      const [value, setValue] = useState<SearchableItem[]>([]);
      return fixture({
        debounceMs,
        maxEntries,
        maxMenuItems,
        onChange: setValue,
        searchSource: source,
        value,
      });
    }

    it('keeps focus and remaining choices open across pointer selections', async () => {
      const user = userEvent.setup();
      render(<ControlledTokenizer />);
      const input = screen.getByRole('combobox');

      await user.click(input);
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });
      await user.click(
        screen.getByRole('option', {name: 'Alice', hidden: true}),
      );
      await waitFor(() => {
        expect(input).toHaveFocus();
        expect(input).toHaveAttribute('aria-expanded', 'true');
        expect(
          screen.getByRole('option', {name: 'Bob', hidden: true}),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('option', {name: 'Bob', hidden: true}));
      await waitFor(() => {
        expect(input).toHaveFocus();
        expect(input).toHaveAttribute('aria-expanded', 'true');
        expect(
          screen.getByRole('button', {name: 'Remove Alice'}),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', {name: 'Remove Bob'}),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('option', {name: 'Charlie', hidden: true}),
        ).toBeInTheDocument();
      });
    });

    it.each([
      {name: 'natively disabled', disabledMessage: undefined},
      {
        name: 'focusable-disabled',
        disabledMessage: 'You need edit access to change members',
      },
    ])(
      'closes and blocks selection when an open menu becomes $name',
      async ({disabledMessage}) => {
        const onChange = vi.fn();
        const {rerender} = render(fixture({onChange}));
        const input = screen.getByRole('combobox');

        fireEvent.focus(input);
        const alice = await screen.findByRole('option', {
          name: 'Alice',
          hidden: true,
        });
        expect(input).toHaveAttribute('aria-expanded', 'true');
        expect(input).toHaveAttribute('aria-activedescendant', alice.id);

        rerender(
          fixture({
            disabledMessage,
            isDisabled: true,
            onChange,
          }),
        );
        fireEvent.keyDown(input, {key: 'Enter'});

        expect(onChange).not.toHaveBeenCalled();
        expect(input).toHaveAttribute('aria-expanded', 'false');
        expect(input).not.toHaveAttribute('aria-activedescendant');
        if (disabledMessage == null) {
          expect(input).toBeDisabled();
        } else {
          expect(input).toHaveAttribute('aria-disabled', 'true');
        }
      },
    );

    it('does not reopen a pointer-started menu after reaching its selection limit', async () => {
      const frames: FrameRequestCallback[] = [];
      const animationFrameSpy = vi
        .spyOn(globalThis, 'requestAnimationFrame')
        .mockImplementation(callback => {
          frames.push(callback);
          return frames.length;
        });

      try {
        const {rerender} = render(fixture());
        const input = screen.getByRole('combobox');

        fireEvent.pointerDown(input);
        fireEvent.focus(input);
        await screen.findByRole('option', {name: 'Alice', hidden: true});
        fireEvent.click(input);
        expect(frames).toHaveLength(2);

        rerender(fixture({maxEntries: 1, value: [users[0]]}));
        act(() => frames.forEach(callback => callback(0)));

        expect(input).toHaveAttribute('aria-expanded', 'false');
        expect(input).not.toHaveAttribute('aria-activedescendant');
      } finally {
        animationFrameSpy.mockRestore();
      }
    });

    it('keeps DOM order and the logical next choice across keyboard selections', async () => {
      const user = userEvent.setup();
      const mixedItems: SearchableItem[] = [
        {
          id: 'grouped-a',
          label: 'Grouped Alice',
          auxiliaryData: {group: 'Team'},
        },
        {id: 'ungrouped', label: 'Ungrouped Bob'},
        {
          id: 'grouped-c',
          label: 'Grouped Charlie',
          auxiliaryData: {group: 'Team'},
        },
      ];
      const mixedSource: SearchSource = {
        search: () => mixedItems,
        bootstrap: () => mixedItems,
      };
      render(<ControlledTokenizer source={mixedSource} />);
      const input = screen.getByRole('combobox');

      await user.click(input);
      const ungrouped = await screen.findByRole('option', {
        name: 'Ungrouped Bob',
        hidden: true,
      });
      expect(input).toHaveAttribute('aria-activedescendant', ungrouped.id);

      await user.keyboard('{ArrowDown}');
      const groupedAlice = screen.getByRole('option', {
        name: 'Grouped Alice',
        hidden: true,
      });
      const groupedCharlie = screen.getByRole('option', {
        name: 'Grouped Charlie',
        hidden: true,
      });
      const groupedCharlieId = groupedCharlie.id;
      expect(input).toHaveAttribute('aria-activedescendant', groupedAlice.id);

      await user.keyboard('{Enter}');
      await waitFor(() => {
        const survivingCharlie = screen.getByRole('option', {
          name: 'Grouped Charlie',
          hidden: true,
        });
        expect(
          screen.getByRole('button', {name: 'Remove Grouped Alice'}),
        ).toBeInTheDocument();
        expect(input).toHaveFocus();
        expect(input).toHaveAttribute('aria-expanded', 'true');
        expect(survivingCharlie.id).toBe(groupedCharlieId);
        expect(input).toHaveAttribute(
          'aria-activedescendant',
          survivingCharlie.id,
        );
      });

      await user.keyboard('{Enter}');
      await waitFor(() => {
        const remaining = screen.getByRole('option', {
          name: 'Ungrouped Bob',
          hidden: true,
        });
        expect(
          screen.getByRole('button', {name: 'Remove Grouped Charlie'}),
        ).toBeInTheDocument();
        expect(input).toHaveAttribute('aria-expanded', 'true');
        expect(input).toHaveAttribute('aria-activedescendant', remaining.id);
      });
    });

    it('preserves the highlighted item across a controlled selection update', async () => {
      const onChange = vi.fn();
      const {rerender} = render(fixture({onChange}));
      const input = screen.getByRole('combobox');

      fireEvent.focus(input);
      const bob = await screen.findByRole('option', {
        name: 'Bob',
        hidden: true,
      });
      fireEvent.keyDown(input, {key: 'ArrowDown'});
      expect(input).toHaveAttribute('aria-activedescendant', bob.id);

      rerender(fixture({onChange, value: [users[0]]}));

      expect(input).toHaveAttribute('aria-activedescendant', bob.id);
      fireEvent.keyDown(input, {key: 'Enter'});
      expect(onChange).toHaveBeenLastCalledWith([users[0], users[1]], {
        item: users[1],
        type: 'add',
      });
    });

    it('filters committed choices by id and keeps a distinct same-label choice', async () => {
      const selected = {id: 'selected', label: 'Same label'};
      const remaining = {id: 'remaining', label: 'Same label'};
      const source: SearchSource = {
        search: () => [selected, remaining],
        bootstrap: () => [selected, remaining],
      };
      const onChange = vi.fn();
      render(fixture({onChange, searchSource: source, value: [selected]}));
      const input = screen.getByRole('combobox');

      fireEvent.focus(input);
      const options = await screen.findAllByRole('option', {
        name: 'Same label',
        hidden: true,
      });
      expect(options).toHaveLength(1);
      expect(input).toHaveAttribute('aria-activedescendant', options[0].id);

      fireEvent.keyDown(input, {key: 'Enter'});
      expect(onChange).toHaveBeenCalledWith([selected, remaining], {
        item: remaining,
        type: 'add',
      });
    });

    it('reveals the next eligible loaded choice through a capped bootstrap cohort', async () => {
      const source: SearchSource = {
        search: () => users.slice(0, 2),
        bootstrap: () => users.slice(0, 2),
      };
      render(<ControlledTokenizer maxMenuItems={1} source={source} />);
      const input = screen.getByRole('combobox');

      fireEvent.focus(input);
      const alice = await screen.findByRole('option', {
        name: 'Alice',
        hidden: true,
      });
      expect(screen.getAllByRole('option', {hidden: true})).toHaveLength(1);
      fireEvent.keyDown(input, {key: 'Enter'});

      await waitFor(() => {
        const bob = screen.getByRole('option', {name: 'Bob', hidden: true});
        expect(screen.getAllByRole('option', {hidden: true})).toHaveLength(1);
        expect(input).toHaveFocus();
        expect(input).toHaveAttribute('aria-expanded', 'true');
        expect(input).toHaveAttribute('aria-activedescendant', bob.id);
        expect(alice).not.toBeInTheDocument();
      });

      fireEvent.keyDown(input, {key: 'Enter'});
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'false');
        expect(input).not.toHaveAttribute('aria-activedescendant');
      });
    });

    it.each(['deferred', 'rejected'] as const)(
      'keeps a sole controlled selection active while $control, then closes on commit',
      async control => {
        const onChange = vi.fn();
        const soleSource: SearchSource = {
          search: () => [users[0]],
          bootstrap: () => [users[0]],
        };
        const props = {
          maxEntries: 1,
          onChange,
          searchSource: soleSource,
        };
        const {rerender} = render(fixture(props));
        const input = screen.getByRole('combobox');

        fireEvent.focus(input);
        const alice = await screen.findByRole('option', {
          name: 'Alice',
          hidden: true,
        });
        const aliceId = alice.id;
        fireEvent.keyDown(input, {key: 'Enter'});
        expect(onChange).toHaveBeenCalledWith([users[0]], {
          item: users[0],
          type: 'add',
        });

        if (control === 'rejected') {
          rerender(fixture({...props, value: []}));
        }
        expect(input).toHaveFocus();
        expect(input).toHaveAttribute('aria-expanded', 'true');
        expect(input).toHaveAttribute('aria-activedescendant', aliceId);
        expect(
          screen.getByRole('option', {name: 'Alice', hidden: true}),
        ).toBeInTheDocument();

        rerender(fixture({...props, value: [users[0]]}));
        await waitFor(() => {
          expect(input).toHaveAttribute('aria-expanded', 'false');
          expect(input).not.toHaveAttribute('aria-busy');
        });
      },
    );

    it.each([
      {
        caseName: 'maximum entry count',
        source: userSource,
        maxEntries: 1,
      },
      {
        caseName: 'all loaded choices selected',
        source: {
          search: () => [users[0]],
          bootstrap: () => [users[0]],
        } satisfies SearchSource,
        maxEntries: undefined,
      },
    ])('closes after controlled state reaches $caseName', async props => {
      const {rerender} = render(
        fixture({
          maxEntries: props.maxEntries,
          searchSource: props.source,
        }),
      );
      const input = screen.getByRole('combobox');

      fireEvent.focus(input);
      await screen.findByRole('option', {name: 'Alice', hidden: true});
      expect(input).toHaveAttribute('aria-expanded', 'true');

      rerender(
        fixture({
          maxEntries: props.maxEntries,
          searchSource: props.source,
          value: [users[0]],
        }),
      );

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it.each([
      {caseName: 'an empty visible cohort', results: [users[0]]},
      {caseName: 'one surviving choice', results: users.slice(0, 2)},
    ])(
      'filters a pending typed response to current controlled state: $caseName',
      async ({caseName, results}) => {
        let resolveSearch: (items: SearchableItem[]) => void = () => {};
        const source: SearchSource = {
          search: async () =>
            new Promise<SearchableItem[]>(resolve => {
              resolveSearch = resolve;
            }),
          bootstrap: () => [],
        };
        const {rerender} = render(
          fixture({maxMenuItems: 1, searchSource: source}),
        );
        const input = screen.getByRole('combobox');

        fireEvent.change(input, {target: {value: 'Ali'}});
        await waitFor(() => {
          expect(input).toHaveAttribute('aria-busy', 'true');
        });
        rerender(fixture({searchSource: source, value: [users[0]]}));
        await act(async () => {
          resolveSearch(results);
          await Promise.resolve();
        });

        expect(input).toHaveAttribute('aria-expanded', 'true');
        expect(
          screen.queryByRole('option', {name: 'Alice', hidden: true}),
        ).not.toBeInTheDocument();
        if (caseName === 'one surviving choice') {
          expect(
            screen.getByRole('option', {name: 'Bob', hidden: true}),
          ).toBeInTheDocument();
          await waitFor(() => {
            expect(politeRegion()?.textContent).toBe('1 result');
          });
        } else {
          expect(screen.getByText('No results found')).toBeInTheDocument();
          await waitFor(() => {
            expect(politeRegion()?.textContent).toBe('No results found');
          });
        }
      },
    );

    it('lets an initial pending bootstrap finish before projecting committed selections', async () => {
      let resolveBootstrap: (items: SearchableItem[]) => void = () => {};
      const source: SearchSource = {
        search: () => [],
        bootstrap: async () =>
          new Promise<SearchableItem[]>(resolve => {
            resolveBootstrap = resolve;
          }),
      };
      render(
        fixture({
          maxMenuItems: 2,
          searchSource: source,
          value: [users[0]],
        }),
      );
      const input = screen.getByRole('combobox');

      fireEvent.focus(input);
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-busy', 'true');
      });
      await act(async () => {
        resolveBootstrap(users);
        await Promise.resolve();
      });

      await waitFor(() => {
        const bob = screen.getByRole('option', {name: 'Bob', hidden: true});
        expect(input).not.toHaveAttribute('aria-busy');
        expect(input).toHaveAttribute('aria-expanded', 'true');
        expect(input).toHaveAttribute('aria-activedescendant', bob.id);
        expect(
          screen.queryByRole('option', {name: 'Alice', hidden: true}),
        ).not.toBeInTheDocument();
        expect(
          screen.getByRole('option', {name: 'Charlie', hidden: true}),
        ).toBeInTheDocument();
      });
    });

    it('keeps a deselected item in a pending typed response without double projection', async () => {
      let resolveSearch: (items: SearchableItem[]) => void = () => {};
      const source: SearchSource = {
        search: async () =>
          new Promise<SearchableItem[]>(resolve => {
            resolveSearch = resolve;
          }),
        bootstrap: () => [],
      };
      const {rerender} = render(
        fixture({searchSource: source, value: [users[0]]}),
      );
      const input = screen.getByRole('combobox');

      fireEvent.change(input, {target: {value: 'a'}});
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-busy', 'true');
      });
      rerender(fixture({searchSource: source, value: []}));
      await act(async () => {
        resolveSearch(users.slice(0, 2));
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(input).not.toHaveAttribute('aria-busy');
        expect(input).toHaveAttribute('aria-expanded', 'true');
        expect(
          screen.getByRole('option', {name: 'Alice', hidden: true}),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('option', {name: 'Bob', hidden: true}),
        ).toBeInTheDocument();
        expect(politeRegion()?.textContent).toBe('2 results');
      });
    });

    it.each(['typed search', 'bootstrap'] as const)(
      'does not reopen from a cancel-free late $request after committed max',
      async request => {
        let resolveRequest: (items: SearchableItem[]) => void = () => {};
        const pending = async () =>
          new Promise<SearchableItem[]>(resolve => {
            resolveRequest = resolve;
          });
        const source: SearchSource = {
          search: request === 'typed search' ? pending : () => [],
          bootstrap: request === 'bootstrap' ? pending : () => [],
        };
        const props = {maxEntries: 1, searchSource: source};
        const {rerender} = render(fixture(props));
        const input = screen.getByRole('combobox');

        if (request === 'typed search') {
          fireEvent.change(input, {target: {value: 'a'}});
        } else {
          fireEvent.focus(input);
        }
        await waitFor(() => {
          expect(input).toHaveAttribute('aria-busy', 'true');
        });
        rerender(fixture({...props, value: [users[0]]}));
        await waitFor(() => {
          expect(input).toHaveAttribute('aria-expanded', 'false');
          expect(input).not.toHaveAttribute('aria-busy');
        });

        await act(async () => {
          resolveRequest([users[1]]);
          await Promise.resolve();
        });
        expect(input).toHaveAttribute('aria-expanded', 'false');
        expect(input).not.toHaveAttribute('aria-busy');
        expect(
          screen.queryByRole('option', {name: 'Bob', hidden: true}),
        ).not.toBeInTheDocument();
      },
    );

    it('forwards cancellation when committed state reaches max', async () => {
      let resolveSearch: (items: SearchableItem[]) => void = () => {};
      const cancel = vi.fn();
      const source: SearchSource = {
        search: async () =>
          new Promise<SearchableItem[]>(resolve => {
            resolveSearch = resolve;
          }),
        bootstrap: () => [],
        cancel,
      };
      const props = {maxEntries: 1, searchSource: source};
      const {rerender} = render(fixture(props));
      const input = screen.getByRole('combobox');

      fireEvent.change(input, {target: {value: 'a'}});
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-busy', 'true');
      });
      const cancelCount = cancel.mock.calls.length;
      rerender(fixture({...props, value: [users[0]]}));
      await waitFor(() => {
        expect(cancel.mock.calls.length).toBeGreaterThan(cancelCount);
        expect(input).not.toHaveAttribute('aria-busy');
      });
      await act(async () => {
        resolveSearch([users[1]]);
        await Promise.resolve();
      });
    });

    it('keeps a selected-only pending bootstrap closed', async () => {
      let resolveBootstrap: (items: SearchableItem[]) => void = () => {};
      const source: SearchSource = {
        search: () => [],
        bootstrap: async () =>
          new Promise<SearchableItem[]>(resolve => {
            resolveBootstrap = resolve;
          }),
      };
      const {rerender} = render(fixture({searchSource: source}));
      const input = screen.getByRole('combobox');

      fireEvent.focus(input);
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-busy', 'true');
      });
      rerender(fixture({searchSource: source, value: [users[0]]}));
      await act(async () => {
        resolveBootstrap([users[0]]);
        await Promise.resolve();
      });

      expect(input).toHaveAttribute('aria-expanded', 'false');
      expect(
        screen.queryByRole('option', {name: 'Alice', hidden: true}),
      ).not.toBeInTheDocument();
    });

    it('keeps malformed-Unicode option ids unique and keyboard-selectable', async () => {
      const highSurrogateItem = {id: '\ud800', label: 'High surrogate'};
      const lowSurrogateItem = {id: '\udc00', label: 'Low surrogate'};
      const pairedIdItem = {id: '\ud800\udc00', label: 'Surrogate pair'};
      const source: SearchSource = {
        search: () => [highSurrogateItem, lowSurrogateItem, pairedIdItem],
        bootstrap: () => [highSurrogateItem, lowSurrogateItem, pairedIdItem],
      };
      const onChange = vi.fn();
      render(fixture({onChange, searchSource: source}));
      const input = screen.getByRole('combobox');

      fireEvent.focus(input);
      const highOption = await screen.findByRole('option', {
        name: 'High surrogate',
        hidden: true,
      });
      const lowOption = screen.getByRole('option', {
        name: 'Low surrogate',
        hidden: true,
      });
      const pairedOption = screen.getByRole('option', {
        name: 'Surrogate pair',
        hidden: true,
      });
      expect(new Set([highOption.id, lowOption.id, pairedOption.id]).size).toBe(
        3,
      );
      expect(input).toHaveAttribute('aria-activedescendant', highOption.id);
      fireEvent.keyDown(input, {key: 'Enter'});
      expect(onChange).toHaveBeenCalledWith([highSurrogateItem], {
        item: highSurrogateItem,
        type: 'add',
      });
    });

    it('does not reopen after dismissal while replacement results are loading', async () => {
      let resolveSearch: (items: SearchableItem[]) => void = () => {};
      const source: SearchSource = {
        search: async () =>
          new Promise<SearchableItem[]>(resolve => {
            resolveSearch = resolve;
          }),
        bootstrap: () => users.slice(0, 2),
      };
      render(<ControlledTokenizer source={source} />);
      const input = screen.getByRole('combobox');

      fireEvent.focus(input);
      await screen.findByRole('option', {name: 'Alice', hidden: true});
      fireEvent.change(input, {target: {value: 'a'}});
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-busy', 'true');
      });

      fireEvent.keyDown(input, {key: 'Escape'});
      expect(input).toHaveAttribute('aria-expanded', 'false');
      expect(input).not.toHaveAttribute('aria-busy');

      await act(async () => {
        resolveSearch(users);
        await Promise.resolve();
      });
      expect(input).toHaveAttribute('aria-expanded', 'false');
      expect(input).not.toHaveAttribute('aria-busy');
    });

    it.each([0, 50])(
      'closes stale typed results before a %ims bootstrap',
      async debounceMs => {
        let bootstrapCount = 0;
        let resolveBootstrap: ((items: SearchableItem[]) => void) | undefined;
        const bootstrap = vi.fn(
          (): SearchableItem[] | Promise<SearchableItem[]> => {
            bootstrapCount += 1;
            if (bootstrapCount === 1) {
              return [];
            }
            return new Promise<SearchableItem[]>(resolve => {
              resolveBootstrap = resolve;
            });
          },
        );
        const source: SearchSource = {
          search: () => users.slice(0, 2),
          bootstrap,
        };
        render(<ControlledTokenizer source={source} debounceMs={debounceMs} />);
        const input = screen.getByRole('combobox');

        act(() => input.focus());
        await waitFor(() => {
          expect(bootstrap).toHaveBeenCalledTimes(1);
          expect(input).not.toHaveAttribute('aria-busy');
        });
        fireEvent.change(input, {target: {value: 'a'}});
        await waitFor(() => {
          expect(input).toHaveAttribute('aria-expanded', 'true');
          expect(
            screen.getByRole('option', {name: 'Alice', hidden: true}),
          ).toBeInTheDocument();
        });

        fireEvent.change(input, {target: {value: ''}});
        expect(input).toHaveAttribute('aria-expanded', 'true');
        fireEvent.click(
          screen.getByRole('option', {name: 'Alice', hidden: true}),
        );
        await waitFor(() => {
          expect(
            screen.getByRole('button', {name: 'Remove Alice'}),
          ).toBeInTheDocument();
          expect(input).toHaveAttribute('aria-expanded', 'false');
        });

        if (resolveBootstrap != null) {
          await act(async () => {
            resolveBootstrap?.(users.slice(1, 3));
            await Promise.resolve();
          });
        } else {
          await act(async () => {
            await new Promise(resolve => setTimeout(resolve, debounceMs + 25));
          });
          expect(bootstrap).toHaveBeenCalledTimes(1);
        }
        expect(input).toHaveAttribute('aria-expanded', 'false');
      },
    );

    it('closes on Escape after a selection', async () => {
      const user = userEvent.setup();
      render(<ControlledTokenizer />);
      const input = screen.getByRole('combobox');

      await user.click(input);
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });
      await user.click(
        screen.getByRole('option', {name: 'Alice', hidden: true}),
      );
      await waitFor(() => {
        expect(
          screen.getByRole('button', {name: 'Remove Alice'}),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('option', {name: 'Bob', hidden: true}),
        ).toBeInTheDocument();
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });

      await user.keyboard('{Escape}');
      expect(input).toHaveAttribute('aria-expanded', 'false');
      expect(input).toHaveFocus();
    });

    it('closes when focus leaves after a selection', async () => {
      const user = userEvent.setup();
      render(
        <>
          <ControlledTokenizer />
          <button type="button">Outside</button>
        </>,
      );
      const input = screen.getByRole('combobox');

      await user.click(input);
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });
      await user.click(
        screen.getByRole('option', {name: 'Alice', hidden: true}),
      );
      await waitFor(() => {
        expect(
          screen.getByRole('button', {name: 'Remove Alice'}),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('option', {name: 'Bob', hidden: true}),
        ).toBeInTheDocument();
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });

      const outside = screen.getByRole('button', {name: 'Outside'});
      await user.click(outside);
      expect(input).toHaveAttribute('aria-expanded', 'false');
      expect(outside).toHaveFocus();
    });

    it('closes when no choices remain or the selection reaches maxEntries', async () => {
      const user = userEvent.setup();
      const atMax = render(<ControlledTokenizer maxEntries={1} />);
      let input = screen.getByRole('combobox');

      await user.click(input);
      let alice = await screen.findByRole('option', {
        name: 'Alice',
        hidden: true,
      });
      expect(input).toHaveAttribute('aria-expanded', 'true');
      await user.click(alice);
      expect(
        screen.getByRole('button', {name: 'Remove Alice'}),
      ).toBeInTheDocument();
      expect(input).toHaveAttribute('aria-expanded', 'false');
      atMax.unmount();

      const onlyAliceSource: SearchSource = {
        search: () => [users[0]],
        bootstrap: () => [users[0]],
      };
      render(<ControlledTokenizer source={onlyAliceSource} />);
      input = screen.getByRole('combobox');
      await user.click(input);
      alice = await screen.findByRole('option', {
        name: 'Alice',
        hidden: true,
      });
      expect(input).toHaveAttribute('aria-expanded', 'true');
      await user.click(alice);
      expect(
        screen.getByRole('button', {name: 'Remove Alice'}),
      ).toBeInTheDocument();
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

  describe('startIcon', () => {
    it('does not render a start icon when omitted', () => {
      render(
        <Tokenizer
          label="Members"
          searchSource={userSource}
          value={[]}
          onChange={() => {}}
        />,
      );
      expect(document.querySelector('svg')).not.toBeInTheDocument();
    });

    it('renders a ReactNode start icon before the tokens', () => {
      render(
        <Tokenizer
          label="Members"
          searchSource={userSource}
          value={[{id: '1', label: 'Alice'}]}
          onChange={() => {}}
          startIcon={<TestIcon data-testid="start-icon" />}
        />,
      );
      const icon = screen.getByTestId('start-icon');
      const token = screen.getByText('Alice');
      expect(icon).toBeInTheDocument();
      expect(
        icon.compareDocumentPosition(token) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it('renders an IconType (SVG component) start icon', () => {
      render(
        <Tokenizer
          label="Members"
          searchSource={userSource}
          value={[]}
          onChange={() => {}}
          startIcon={TestIcon}
        />,
      );
      expect(document.querySelector('svg')).toBeInTheDocument();
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
  describe('announcements', () => {
    it('announces removal politely on Backspace with an empty input', async () => {
      const onChange = vi.fn();
      render(
        <InternationalizationProvider locale="fr" overrides={TOKEN_MESSAGES}>
          <Tokenizer
            label="Members"
            searchSource={userSource}
            value={[users[0], users[1]]}
            onChange={onChange}
          />
        </InternationalizationProvider>,
      );
      const input = screen.getByRole('combobox');
      fireEvent.keyDown(input, {key: 'Backspace'});
      expect(onChange).toHaveBeenCalledWith([users[0]], {
        item: users[1],
        type: 'remove',
      });
      await waitFor(() => {
        expect(politeRegion()?.textContent).toBe('Retiré : Bob');
      });
    });

    it("announces removal politely when clicking a token's remove button", async () => {
      render(
        <InternationalizationProvider locale="fr" overrides={TOKEN_MESSAGES}>
          <Tokenizer
            label="Members"
            searchSource={userSource}
            value={[users[0], users[1]]}
            onChange={() => {}}
          />
        </InternationalizationProvider>,
      );
      fireEvent.click(screen.getByRole('button', {name: 'Remove Alice'}));
      await waitFor(() => {
        expect(politeRegion()?.textContent).toBe('Retiré : Alice');
      });
    });

    it('announces addition politely when selecting a search result', async () => {
      render(
        <InternationalizationProvider locale="fr" overrides={TOKEN_MESSAGES}>
          <Tokenizer
            label="Members"
            searchSource={userSource}
            value={[]}
            onChange={() => {}}
            hasEntriesOnFocus
            debounceMs={0}
          />
        </InternationalizationProvider>,
      );
      const input = screen.getByRole('combobox');
      fireEvent.focus(input);
      await act(async () => {
        await new Promise(r => setTimeout(r, 50));
      });
      fireEvent.click(screen.getByText('Alice'));
      await waitFor(() => {
        expect(politeRegion()?.textContent).toBe('Ajouté : Alice');
      });
    });

    it('announces addition politely when creating a token with hasCreate', async () => {
      const emptySource: SearchSource = {
        search: () => [],
        bootstrap: () => [],
      };
      render(
        <InternationalizationProvider locale="fr" overrides={TOKEN_MESSAGES}>
          <Tokenizer
            label="Tags"
            searchSource={emptySource}
            value={[]}
            onChange={() => {}}
            hasCreate
            debounceMs={0}
          />
        </InternationalizationProvider>,
      );
      const input = screen.getByRole('combobox');
      await act(async () => {
        fireEvent.change(input, {target: {value: 'new-tag'}});
      });
      await act(async () => {
        await new Promise(r => setTimeout(r, 50));
      });
      fireEvent.click(screen.getByText('Create "new-tag"'));
      await waitFor(() => {
        expect(politeRegion()?.textContent).toBe('Ajouté : new-tag');
      });
    });

    it('does not announce on mount', () => {
      render(
        <Tokenizer
          label="Members"
          searchSource={userSource}
          value={[users[0]]}
          onChange={() => {}}
        />,
      );
      // The live regions are created lazily on first announce, so a mount
      // with pre-selected tokens must not create (or speak through) one.
      expect(politeRegion()).toBeNull();
    });

    it('does not announce add/remove while typing', async () => {
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
      await act(async () => {
        fireEvent.change(input, {target: {value: 'Ali'}});
      });
      await act(async () => {
        await new Promise(r => setTimeout(r, 50));
      });
      // BaseTypeahead announces result counts while typing (existing
      // behavior); typing alone must not produce add/remove announcements.
      expect(politeRegion()?.textContent ?? '').not.toMatch(/Added|Removed/);
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
      expect([
        ...new FormData(container.querySelector('form')!).keys(),
      ]).toEqual([]);
    });
  });
});

describe('Tokenizer statusVariant forwarding', () => {
  it('defaults to attached (status renders with data-variant="attached")', () => {
    const {container} = render(
      <Tokenizer
        label="Members"
        searchSource={userSource}
        value={[]}
        onChange={() => {}}
        status={{type: 'error', message: 'Required'}}
      />,
    );
    expect(container.querySelector('.astryx-field-status')).toHaveAttribute(
      'data-variant',
      'attached',
    );
  });

  it('forwards statusVariant="detached" to the underlying Field status', () => {
    const {container} = render(
      <Tokenizer
        label="Members"
        searchSource={userSource}
        value={[]}
        onChange={() => {}}
        status={{type: 'error', message: 'Required'}}
        statusVariant="detached"
      />,
    );
    expect(container.querySelector('.astryx-field-status')).toHaveAttribute(
      'data-variant',
      'detached',
    );
  });
});

describe('Tokenizer disabled theme state', () => {
  it('reflects disabled on the root target so themes can gate paint on it', () => {
    const {container} = render(
      <Tokenizer
        label="Members"
        searchSource={userSource}
        value={[]}
        onChange={() => {}}
        isDisabled
      />,
    );
    const root = container.querySelector('.astryx-tokenizer');
    expect(root).toHaveAttribute('data-disabled', 'disabled');
  });

  it('omits data-disabled when enabled, like status does', () => {
    const {container} = render(
      <Tokenizer
        label="Members"
        searchSource={userSource}
        value={[]}
        onChange={() => {}}
      />,
    );
    const root = container.querySelector('.astryx-tokenizer');
    expect(root).not.toHaveAttribute('data-disabled');
  });
});

describe('Tokenizer end-lane reserve', () => {
  // Tokenizer keeps the measured lane that Typeahead no longer needs: its
  // lane stays pinned to the field's first row while tokens wrap below it,
  // so it has to be out of flow, and an out-of-flow box reserves nothing by
  // definition. jsdom performs no layout — it reports every width as 0 and
  // has no ResizeObserver — so these stub both, which is what makes the
  // mechanism, and the bug it had, reproducible in CI.
  class StubResizeObserver {
    static instances = 0;
    private readonly cb: ResizeObserverCallback;
    constructor(cb: ResizeObserverCallback) {
      this.cb = cb;
      StubResizeObserver.instances++;
    }
    observe(target: Element) {
      this.cb(
        [
          {
            target,
            borderBoxSize: [{inlineSize: 24, blockSize: 20}],
            contentRect: {width: 24, height: 20},
          } as unknown as ResizeObserverEntry,
        ],
        this,
      );
    }
    unobserve() {}
    disconnect() {}
  }

  // The lane's true, untransformed width. `offsetWidth` is what reports it.
  const LANE_LOCAL_WIDTH = 24;
  // What `getBoundingClientRect()` would report for that same lane inside a
  // `scale(.5)` subtree: viewport space, so half. Reading this instead is the
  // bug — the number is spent as padding, which is in local space.
  const LANE_VIEWPORT_WIDTH = 12;

  let originalRO: typeof ResizeObserver | undefined;
  beforeEach(() => {
    originalRO = globalThis.ResizeObserver;
    StubResizeObserver.instances = 0;
    globalThis.ResizeObserver = StubResizeObserver;
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(
      LANE_LOCAL_WIDTH,
    );
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      width: LANE_VIEWPORT_WIDTH,
      height: 20,
      top: 0,
      left: 0,
      right: LANE_VIEWPORT_WIDTH,
      bottom: 20,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
  });
  afterEach(() => {
    globalThis.ResizeObserver = originalRO as typeof ResizeObserver;
    vi.restoreAllMocks();
  });

  const pendingSource = () => {
    let settle: (items: SearchableItem[]) => void = () => {};
    return {
      source: {
        search: async () =>
          new Promise<SearchableItem[]>(resolve => {
            settle = resolve;
          }),
        bootstrap: () => [],
      },
      settle: (items: SearchableItem[] = []) => settle(items),
    };
  };

  const laneHost = (container: HTMLElement) =>
    container.querySelector<HTMLElement>(
      '[style*="--_tokenizer-end-lane-reserve"]',
    );

  // The variable carries the whole reserve — the lane's inset plus its
  // measured width — so its ABSENCE means "no lane", not "a lane of zero
  // width". That distinction is what lets the input apply the padding rule
  // unconditionally and still keep its full content box when nothing is in
  // the lane.
  const reserveOf = (container: HTMLElement) =>
    laneHost(container)?.style.getPropertyValue(
      '--_tokenizer-end-lane-reserve',
    );

  it('reserves the lane\u2019s untransformed width, not its on-screen width', () => {
    // The regression. A CSS transform anywhere above the field scales what
    // `getBoundingClientRect()` reports but not what the padding means, so
    // the two must not be mixed: measured in Chromium under `scale(.5)` the
    // input reserved half what it needed and the live query ran under the
    // controls again (22.83px), and under `scale(2)` the caret sat in a
    // 202.69px gap. `offsetWidth` is the same number at every scale.
    const {container} = render(
      <Tokenizer
        label="Users"
        searchSource={userSource}
        value={[users[0]]}
        onChange={() => {}}
        hasClear
      />,
    );
    expect(reserveOf(container)).toBe(
      `calc(var(--spacing-2) + ${LANE_LOCAL_WIDTH}px)`,
    );
  });

  it('reserves the lane when the spinner is the only thing in it', () => {
    // Busy-only: no endContent and no clear button, so the lane exists for
    // the duration of the search and for nothing else. It still has width,
    // and the query still has to clear it.
    const {source} = pendingSource();
    const {container} = render(
      <Tokenizer
        label="Users"
        searchSource={source}
        value={[]}
        onChange={() => {}}
        hasClear={false}
        debounceMs={0}
      />,
    );
    expect(laneHost(container)).toBeNull();

    act(() => {
      fireEvent.change(screen.getByRole('combobox'), {target: {value: 'Al'}});
    });

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(reserveOf(container)).toBe(
      `calc(var(--spacing-2) + ${LANE_LOCAL_WIDTH}px)`,
    );
  });

  it('does not pad the input on the collapsed paths', () => {
    // Collapsed: with tokens truncated the input is given no width to pad —
    // `inputAtMax` zeroes its padding outright — so a reserve there would be
    // padding applied to a zero-width box, fighting the collapse. The lane
    // still publishes its width; what must not happen is the input claiming
    // the reserve class.
    const {container} = render(
      <Tokenizer
        label="Users"
        searchSource={userSource}
        value={[users[0], users[1], users[2]]}
        onChange={() => {}}
        tokenOverflowBehavior="unfocusedInline"
      />,
    );
    const input = screen.getByRole('combobox');
    expect(input.className).not.toBe('');
    // The reserve is the only rule that reads the lane variable; the
    // collapsed input must not carry it.
    const reserveClasses = new Set(
      (laneHost(container)?.className ?? '').split(' '),
    );
    expect(
      [...input.classList].some(c => reserveClasses.has(c) && c !== ''),
    ).toBe(false);
  });

  it('costs no commit of its own across a whole search', async () => {
    // The measurement reaches CSS as a custom property written to the DOM,
    // never as state, so it cannot re-render the field. The two commits below
    // are the ones the search itself owes: the spinner arriving, and the
    // spinner leaving. Held in state, the measurement doubled that.
    const {source, settle} = pendingSource();
    const commits: string[] = [];
    render(
      <Profiler id="field" onRender={(_id, phase) => commits.push(phase)}>
        <Tokenizer
          label="Users"
          searchSource={source}
          value={[]}
          onChange={() => {}}
          debounceMs={0}
        />
      </Profiler>,
    );
    const input = screen.getByRole('combobox');
    commits.length = 0;

    await act(async () => {
      fireEvent.change(input, {target: {value: 'Al'}});
    });
    const afterStart = commits.length;

    await act(async () => {
      settle([]);
      await Promise.resolve();
    });

    expect(afterStart).toBe(1);
    expect(commits.length).toBe(2);
  });

  it('re-renders no token when a search starts or settles', async () => {
    // The regression this guards. The busy state has one owner — the base —
    // and the field only needs it to decide whether one Spinner is on screen.
    // Mirrored into the field's own state, every transition re-rendered the
    // whole field including every selected token: measured at six tokens,
    // 6 renders at search start and 6 more at settlement, and 20/40 at
    // twenty. A token contains no part of the indicator, so the correct
    // number is zero at any count.
    const {source, settle} = pendingSource();
    const selected = users.slice(0, 6);
    renderedTokens.length = 0;

    render(
      <Tokenizer
        label="Users"
        searchSource={source}
        value={selected}
        onChange={() => {}}
        hasClear
        debounceMs={0}
      />,
    );
    expect(new Set(renderedTokens).size).toBe(selected.length);
    renderedTokens.length = 0;

    await act(async () => {
      fireEvent.change(screen.getByRole('combobox'), {target: {value: 'Al'}});
    });
    // The indicator is up, so the transition really did happen. Scoped by
    // name: the announcer for result counts is a role="status" live region
    // too, and it is not the indicator.
    expect(screen.getByRole('status', {name: 'Loading'})).toBeInTheDocument();
    // ...and it cost no token a render.
    expect(renderedTokens).toEqual([]);

    await act(async () => {
      settle([]);
      await Promise.resolve();
    });
    await waitFor(() => {
      expect(
        screen.queryByRole('status', {name: 'Loading'}),
      ).not.toBeInTheDocument();
    });
    expect(renderedTokens).toEqual([]);
  });

  it('shares one observer across every field on the page', () => {
    // Browsers batch per observer instance, so one observer per lane meant N
    // callback dispatches a frame for N fields.
    render(
      <>
        <Tokenizer
          label="One"
          searchSource={userSource}
          value={[users[0]]}
          onChange={() => {}}
          hasClear
        />
        <Tokenizer
          label="Two"
          searchSource={userSource}
          value={[users[1]]}
          onChange={() => {}}
          hasClear
        />
        <Tokenizer
          label="Three"
          searchSource={userSource}
          value={[users[2]]}
          onChange={() => {}}
          hasClear
        />
      </>,
    );
    expect(StubResizeObserver.instances).toBeLessThanOrEqual(1);
  });

  it('takes the room back when the lane goes', async () => {
    const {source, settle} = pendingSource();
    const {container} = render(
      <Tokenizer
        label="Users"
        searchSource={source}
        value={[]}
        onChange={() => {}}
        hasClear={false}
        debounceMs={0}
      />,
    );
    await act(async () => {
      fireEvent.change(screen.getByRole('combobox'), {target: {value: 'Al'}});
    });
    expect(laneHost(container)).not.toBeNull();

    await act(async () => {
      settle([]);
      await Promise.resolve();
    });
    await waitFor(() => {
      expect(laneHost(container)).toBeNull();
    });
  });
});

function dismissClosedTokenizerInput(
  input: HTMLElement,
  outside: HTMLElement,
  dismissal: 'Escape' | 'outside blur',
) {
  if (dismissal === 'Escape') {
    fireEvent.keyDown(input, {key: 'Escape'});
  } else {
    fireEvent.blur(input, {relatedTarget: outside});
  }
}

async function flushTokenizerReviewWork() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('Tokenizer closed-pending dismissal', () => {
  it.each(['Escape', 'outside blur'] as const)(
    'invalidates a cancel-free pending bootstrap on %s before the popup opens',
    async dismissal => {
      let resolveBootstrap: (items: SearchableItem[]) => void = () => {};
      const source: SearchSource = {
        search: () => [],
        bootstrap: async () =>
          new Promise<SearchableItem[]>(resolve => {
            resolveBootstrap = resolve;
          }),
      };

      render(
        <>
          <Tokenizer
            label="Members"
            searchSource={source}
            value={[]}
            onChange={() => {}}
            hasEntriesOnFocus
            debounceMs={0}
          />
          <button type="button">Outside</button>
        </>,
      );
      const input = screen.getByRole('combobox');
      const outside = screen.getByRole('button', {name: 'Outside'});

      fireEvent.focus(input);
      await waitFor(() => expect(input).toHaveAttribute('aria-busy', 'true'));
      expect(input).toHaveAttribute('aria-expanded', 'false');

      dismissClosedTokenizerInput(input, outside, dismissal);
      const afterDismiss = {
        busy: input.getAttribute('aria-busy'),
        expanded: input.getAttribute('aria-expanded'),
      };

      await act(async () => {
        resolveBootstrap(users);
        await Promise.resolve();
      });

      expect({
        afterDismiss,
        afterLateSettlement: {
          busy: input.getAttribute('aria-busy'),
          expanded: input.getAttribute('aria-expanded'),
        },
      }).toEqual({
        afterDismiss: {busy: null, expanded: 'false'},
        afterLateSettlement: {busy: null, expanded: 'false'},
      });
    },
  );

  it.each(['Escape', 'outside blur'] as const)(
    'cancels an initial debounced search on %s while the popup is still closed',
    async dismissal => {
      vi.useFakeTimers();
      try {
        const search = vi.fn(() => users);
        render(
          <>
            <Tokenizer
              label="Members"
              searchSource={{search, bootstrap: () => []}}
              value={[]}
              onChange={() => {}}
              debounceMs={50}
            />
            <button type="button">Outside</button>
          </>,
        );
        const input = screen.getByRole('combobox');
        const outside = screen.getByRole('button', {name: 'Outside'});

        fireEvent.focus(input);
        fireEvent.change(input, {target: {value: 'a'}});
        expect(input).toHaveAttribute('aria-expanded', 'false');
        expect(search).not.toHaveBeenCalled();

        dismissClosedTokenizerInput(input, outside, dismissal);
        await act(async () => {
          await vi.advanceTimersByTimeAsync(50);
        });

        expect({
          busy: input.getAttribute('aria-busy'),
          expanded: input.getAttribute('aria-expanded'),
          query: (input as HTMLInputElement).value,
          searchCalls: search.mock.calls.length,
        }).toEqual({
          busy: null,
          expanded: 'false',
          query: 'a',
          searchCalls: 0,
        });
      } finally {
        vi.useRealTimers();
      }
    },
  );
});

describe('Tokenizer queued pointer-bootstrap dismissal', () => {
  it.each(['Escape', 'outside blur'] as const)(
    'keeps a settled pointer bootstrap closed after %s before the queued frame',
    async dismissal => {
      const frames: FrameRequestCallback[] = [];
      const animationFrameSpy = vi
        .spyOn(globalThis, 'requestAnimationFrame')
        .mockImplementation(callback => {
          frames.push(callback);
          return frames.length;
        });

      try {
        render(
          <>
            <Tokenizer
              label="Members"
              searchSource={{search: () => [], bootstrap: () => users}}
              value={[]}
              onChange={() => {}}
              hasEntriesOnFocus
              debounceMs={0}
            />
            <button type="button">Outside</button>
          </>,
        );
        const input = screen.getByRole('combobox');
        const outside = screen.getByRole('button', {name: 'Outside'});

        fireEvent.pointerDown(input);
        act(() => input.focus());
        await screen.findByRole('option', {name: 'Alice', hidden: true});
        fireEvent.click(input);

        expect(frames.length).toBeGreaterThan(0);
        expect(input).toHaveAttribute('aria-expanded', 'false');
        expect(input).not.toHaveAttribute('aria-activedescendant');

        if (dismissal === 'Escape') {
          fireEvent.keyDown(input, {key: 'Escape'});
          expect(input).toHaveFocus();
        } else {
          act(() => outside.focus());
          expect(outside).toHaveFocus();
        }

        act(() => frames.splice(0).forEach(callback => callback(0)));

        expect(input).toHaveAttribute('aria-expanded', 'false');
        expect(input).not.toHaveAttribute('aria-activedescendant');
        expect(dismissal === 'Escape' ? input : outside).toHaveFocus();
      } finally {
        animationFrameSpy.mockRestore();
      }
    },
  );
});

describe('Tokenizer settled-bootstrap close cancellation', () => {
  it.each(['Escape', 'outside focus'] as const)(
    'cancels the settled synchronous bootstrap exactly once on %s',
    async closePath => {
      const cancel = vi.fn();
      const source: SearchSource = {
        search: () => [],
        bootstrap: () => users,
        cancel,
      };

      render(
        <>
          <Tokenizer
            label="Members"
            searchSource={source}
            value={[]}
            onChange={() => {}}
            hasEntriesOnFocus
            debounceMs={0}
          />
          <button type="button">Outside</button>
        </>,
      );
      const input = screen.getByRole('combobox');
      const outside = screen.getByRole('button', {name: 'Outside'});

      act(() => input.focus());
      await waitFor(() =>
        expect(input).toHaveAttribute('aria-expanded', 'true'),
      );
      expect(input).not.toHaveAttribute('aria-busy');
      cancel.mockClear();

      if (closePath === 'Escape') {
        fireEvent.keyDown(input, {key: 'Escape'});
      } else {
        act(() => outside.focus());
      }
      await waitFor(() =>
        expect(input).toHaveAttribute('aria-expanded', 'false'),
      );

      expect(cancel).toHaveBeenCalledTimes(1);
      expect(closePath === 'Escape' ? input : outside).toHaveFocus();
    },
  );
});

describe('Tokenizer terminal interaction', () => {
  it.each([
    {maxEntries: 0, value: [] as SearchableItem[]},
    {maxEntries: 1, value: [users[0]]},
  ])(
    'blocks typing, Create, and keyboard reopening at maxEntries=$maxEntries',
    async ({maxEntries, value}) => {
      const search = vi.fn(() => users);
      const onChange = vi.fn();
      render(
        <Tokenizer
          label="Members"
          searchSource={{search, bootstrap: () => users}}
          value={value}
          onChange={onChange}
          maxEntries={maxEntries}
          hasEntriesOnFocus
          hasCreate
          debounceMs={0}
        />,
      );
      const input = screen.getByRole('combobox');

      fireEvent.change(input, {target: {value: 'New member'}});
      await flushTokenizerReviewWork();
      const afterTyping = {
        createVisible: screen.queryByText('Create "New member"') != null,
        expanded: input.getAttribute('aria-expanded'),
        query: (input as HTMLInputElement).value,
        searchCalls: search.mock.calls.length,
      };

      fireEvent.keyDown(input, {key: 'Escape'});
      fireEvent.keyDown(input, {key: 'ArrowDown'});
      await flushTokenizerReviewWork();
      fireEvent.keyDown(input, {key: 'Enter'});

      expect({
        afterTyping,
        changes: onChange.mock.calls,
        expandedAfterKeys: input.getAttribute('aria-expanded'),
      }).toEqual({
        afterTyping: {
          createVisible: false,
          expanded: 'false',
          query: '',
          searchCalls: 0,
        },
        changes: [],
        expandedAfterKeys: 'false',
      });
    },
  );

  it('still removes the last token with Backspace while enabled at maxEntries', () => {
    const onChange = vi.fn();
    render(
      <Tokenizer
        label="Members"
        searchSource={userSource}
        value={[users[0]]}
        onChange={onChange}
        maxEntries={1}
      />,
    );

    fireEvent.keyDown(screen.getByRole('combobox'), {key: 'Backspace'});

    expect(onChange).toHaveBeenCalledExactlyOnceWith([], {
      item: users[0],
      type: 'remove',
    });
  });

  it.each([
    {disabledMessage: undefined, mode: 'native disabled'},
    {disabledMessage: 'Locked by policy', mode: 'focusable disabled'},
  ])(
    'blocks ArrowDown, Enter, and Backspace after transition to $mode',
    async ({disabledMessage}) => {
      const onChange = vi.fn();
      const props = {
        label: 'Members',
        searchSource: userSource,
        value: [users[0]],
        onChange,
        hasEntriesOnFocus: true,
        debounceMs: 0,
      };
      const {rerender} = render(<Tokenizer {...props} />);
      const input = screen.getByRole('combobox');

      fireEvent.focus(input);
      await screen.findByRole('option', {name: 'Bob', hidden: true});
      expect(input).toHaveAttribute('aria-expanded', 'true');

      rerender(
        <Tokenizer {...props} isDisabled disabledMessage={disabledMessage} />,
      );
      await waitFor(() =>
        expect(input).toHaveAttribute('aria-expanded', 'false'),
      );
      onChange.mockClear();

      fireEvent.keyDown(input, {key: 'ArrowDown'});
      await flushTokenizerReviewWork();
      const reopened = input.getAttribute('aria-expanded');
      fireEvent.keyDown(input, {key: 'Enter'});
      fireEvent.keyDown(input, {key: 'Backspace'});

      expect({changes: onChange.mock.calls, reopened}).toEqual({
        changes: [],
        reopened: 'false',
      });
    },
  );

  it('forwards one cancellation for one committed terminal close', async () => {
    const cancel = vi.fn();
    const source: SearchSource = {
      search: () => users,
      bootstrap: () => users,
      cancel,
    };
    const props = {
      label: 'Members',
      searchSource: source,
      onChange: () => {},
      maxEntries: 1,
      hasEntriesOnFocus: true,
      debounceMs: 0,
    };
    const {rerender} = render(<Tokenizer {...props} value={[]} />);
    const input = screen.getByRole('combobox');

    fireEvent.focus(input);
    await screen.findByRole('option', {name: 'Alice', hidden: true});
    cancel.mockClear();

    rerender(<Tokenizer {...props} value={[users[0]]} />);
    await waitFor(() =>
      expect(input).toHaveAttribute('aria-expanded', 'false'),
    );

    expect(cancel).toHaveBeenCalledTimes(1);
  });
});

describe('Tokenizer close cancellation ownership', () => {
  it('cancels once when a Tab close is followed by outside blur', async () => {
    const cancel = vi.fn();
    const onChange = vi.fn();
    const source: SearchSource = {
      search: () => users,
      bootstrap: () => users,
      cancel,
    };

    render(
      <>
        <Tokenizer
          label="Members"
          searchSource={source}
          value={[]}
          onChange={onChange}
          hasEntriesOnFocus
          debounceMs={0}
        />
        <button type="button">Outside</button>
      </>,
    );
    const input = screen.getByRole('combobox');
    const outside = screen.getByRole('button', {name: 'Outside'});

    act(() => input.focus());
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));
    cancel.mockClear();

    fireEvent.keyDown(input, {key: 'Tab'});
    await waitFor(() =>
      expect(input).toHaveAttribute('aria-expanded', 'false'),
    );
    act(() => outside.focus());

    expect({
      busy: input.getAttribute('aria-busy'),
      cancelCalls: cancel.mock.calls.length,
      changes: onChange.mock.calls,
      expanded: input.getAttribute('aria-expanded'),
      outsideFocused: document.activeElement === outside,
    }).toEqual({
      busy: null,
      cancelCalls: 1,
      changes: [],
      expanded: 'false',
      outsideFocused: true,
    });
  });

  it('cancels source A once across selection close and source replacement while source B stays usable', async () => {
    const cancelA = vi.fn();
    const searchB = vi.fn(() => [users[1]]);
    const sourceA: SearchSource = {
      search: () => [users[0]],
      bootstrap: () => [users[0]],
      cancel: cancelA,
    };
    const sourceB: SearchSource = {
      search: searchB,
      bootstrap: () => [users[1]],
    };
    const onChange = vi.fn();
    const props = {
      label: 'Members',
      onChange,
      hasEntriesOnFocus: true,
      debounceMs: 0,
    };
    const {rerender} = render(
      <Tokenizer {...props} searchSource={sourceA} value={[]} />,
    );
    const input = screen.getByRole('combobox');

    fireEvent.focus(input);
    const alice = await screen.findByRole('option', {
      name: 'Alice',
      hidden: true,
    });
    cancelA.mockClear();

    fireEvent.click(alice);
    rerender(
      <Tokenizer {...props} searchSource={sourceA} value={[users[0]]} />,
    );
    await waitFor(() =>
      expect(input).toHaveAttribute('aria-expanded', 'false'),
    );
    rerender(
      <Tokenizer {...props} searchSource={sourceB} value={[users[0]]} />,
    );
    await flushTokenizerReviewWork();

    fireEvent.change(input, {target: {value: 'Bob'}});
    const bob = await screen.findByRole('option', {
      name: 'Bob',
      hidden: true,
    });

    expect({
      busy: input.getAttribute('aria-busy'),
      cancelACalls: cancelA.mock.calls.length,
      changes: onChange.mock.calls,
      expanded: input.getAttribute('aria-expanded'),
      resultVisible: bob != null,
      searchBCalls: searchB.mock.calls,
    }).toEqual({
      busy: null,
      cancelACalls: 1,
      changes: [[[users[0]], {item: users[0], type: 'add'}]],
      expanded: 'true',
      resultVisible: true,
      searchBCalls: [['Bob']],
    });
  });

  it('cancels once across selection close and component unmount', async () => {
    const cancel = vi.fn();
    const onChange = vi.fn();
    const source: SearchSource = {
      search: () => [users[0]],
      bootstrap: () => [users[0]],
      cancel,
    };
    const props = {
      label: 'Members',
      searchSource: source,
      onChange,
      hasEntriesOnFocus: true,
      debounceMs: 0,
    };
    const {rerender, unmount} = render(<Tokenizer {...props} value={[]} />);
    const input = screen.getByRole('combobox');

    fireEvent.focus(input);
    const alice = await screen.findByRole('option', {
      name: 'Alice',
      hidden: true,
    });
    cancel.mockClear();

    fireEvent.click(alice);
    rerender(<Tokenizer {...props} value={[users[0]]} />);
    await waitFor(() =>
      expect(input).toHaveAttribute('aria-expanded', 'false'),
    );
    const beforeUnmount = {
      busy: input.getAttribute('aria-busy'),
      cancelCalls: cancel.mock.calls.length,
      expanded: input.getAttribute('aria-expanded'),
    };
    unmount();

    expect({
      beforeUnmount,
      cancelCallsAfterUnmount: cancel.mock.calls.length,
      changes: onChange.mock.calls,
    }).toEqual({
      beforeUnmount: {busy: null, cancelCalls: 1, expanded: 'false'},
      cancelCallsAfterUnmount: 1,
      changes: [[[users[0]], {item: users[0], type: 'add'}]],
    });
  });
});
