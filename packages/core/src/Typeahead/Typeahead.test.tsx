// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Typeahead.test.tsx
 * @input Uses vitest, @testing-library/react, Typeahead, BaseTypeahead
 * @output Unit tests for Typeahead components
 * @position Testing; validates Typeahead.tsx and BaseTypeahead.tsx
 *
 * SYNC: When Typeahead components change, update tests to match
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  beforeEach,
} from 'vitest';
import {render, screen, fireEvent, waitFor, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Typeahead} from './Typeahead';
import {BaseTypeahead} from './BaseTypeahead';
import type {SearchSource, SearchableItem} from './types';
import {InternationalizationProvider} from '../i18n';

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
const fruits: SearchableItem[] = [
  {id: '1', label: 'Apple'},
  {id: '2', label: 'Banana'},
  {id: '3', label: 'Cherry'},
  {id: '4', label: 'Date'},
  {id: '5', label: 'Elderberry'},
];

const fruitSource: SearchSource = {
  search: (query: string) =>
    fruits.filter(f => f.label.toLowerCase().includes(query.toLowerCase())),
  bootstrap: () => fruits.slice(0, 3),
};

describe('BaseTypeahead', () => {
  it('renders input with combobox role', () => {
    render(
      <BaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders placeholder text', () => {
    render(
      <BaseTypeahead
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
      <BaseTypeahead
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
      <BaseTypeahead
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

  it('announces the result count to a live region (comboboxes-6)', async () => {
    render(
      <InternationalizationProvider
        locale="fr"
        overrides={{
          fr: {
            '@astryx.typeahead.resultCount':
              '{count, number} {count, plural, one {résultat} other {résultats}}',
          },
        }}>
        <BaseTypeahead
          searchSource={fruitSource}
          value={null}
          onChange={() => {}}
          debounceMs={0}
        />
      </InternationalizationProvider>,
    );
    const input = screen.getByRole('combobox');
    // "Ap" matches Apple only — the singular ICU branch.
    fireEvent.change(input, {target: {value: 'Ap'}});

    await waitFor(() => {
      const region = document.querySelector(
        '[data-astryx-live-region="polite"]',
      );
      // Exact, so the plural branch ("1 résultats") would fail.
      expect(region?.textContent).toBe('1 résultat');
    });
  });

  it('announces the plural result count', async () => {
    render(
      <InternationalizationProvider
        locale="fr"
        overrides={{
          fr: {
            '@astryx.typeahead.resultCount':
              '{count, number} {count, plural, one {résultat} other {résultats}}',
          },
        }}>
        <BaseTypeahead
          searchSource={fruitSource}
          value={null}
          onChange={() => {}}
          debounceMs={0}
        />
      </InternationalizationProvider>,
    );
    const input = screen.getByRole('combobox');
    // "err" matches Cherry and Elderberry.
    fireEvent.change(input, {target: {value: 'err'}});

    await waitFor(() => {
      const region = document.querySelector(
        '[data-astryx-live-region="polite"]',
      );
      expect(region?.textContent).toBe('2 résultats');
    });
  });

  it('speaks the result count from a provider catalog', async () => {
    render(
      <InternationalizationProvider
        locale="fr"
        messages={{
          fr: {
            '@astryx.typeahead.resultCount': {
              defaultMessage:
                '{count, number} {count, plural, one {résultat} other {résultats}}',
            },
          },
        }}>
        <BaseTypeahead
          searchSource={fruitSource}
          value={null}
          onChange={() => {}}
          debounceMs={0}
        />
      </InternationalizationProvider>,
    );
    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'err'}});

    await waitFor(() => {
      const region = document.querySelector(
        '[data-astryx-live-region="polite"]',
      );
      // Same key through the catalog path rather than `overrides`.
      expect(region?.textContent).toBe('2 résultats');
    });
  });

  it('announces "no results found" when the search is empty (comboboxes-6)', async () => {
    render(
      <BaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        debounceMs={0}
        emptySearchResultsText="No results found"
      />,
    );
    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'zzzzz'}});

    await waitFor(() => {
      const region = document.querySelector(
        '[data-astryx-live-region="polite"]',
      );
      expect(region).toHaveTextContent('No results found');
    });
  });

  it('exposes the empty state as a themeable target', async () => {
    const {container} = render(
      <BaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        debounceMs={0}
        emptySearchResultsText="No results found"
      />,
    );
    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'zzzzz'}});

    await waitFor(() => {
      const emptyState = container.querySelector(
        '.astryx-typeahead-empty-state',
      );
      expect(emptyState).not.toBeNull();
      expect(emptyState).toHaveTextContent('No results found');
    });
  });

  describe('empty results active descendant (#4059)', () => {
    it('does not set aria-activedescendant when search has 0 results', async () => {
      render(
        <BaseTypeahead
          searchSource={fruitSource}
          value={null}
          onChange={() => {}}
          debounceMs={0}
        />,
      );
      const input = screen.getByRole('combobox');
      fireEvent.change(input, {target: {value: 'zzzzz'}});

      await waitFor(() => {
        expect(input).not.toHaveAttribute('aria-activedescendant');
      });

      // Press ArrowDown — should NOT set aria-activedescendant to option-0
      fireEvent.keyDown(input, {key: 'ArrowDown'});
      expect(input).not.toHaveAttribute('aria-activedescendant');

      // Press Home — should NOT set aria-activedescendant
      fireEvent.keyDown(input, {key: 'Home'});
      expect(input).not.toHaveAttribute('aria-activedescendant');
    });
  });

  describe('IME composition guard (#4828)', () => {
    it('does not select the highlighted result on a composing Enter', async () => {
      const onChange = vi.fn();
      render(
        <BaseTypeahead
          searchSource={fruitSource}
          value={null}
          onChange={onChange}
          debounceMs={0}
        />,
      );
      const input = screen.getByRole('combobox');
      fireEvent.change(input, {target: {value: 'App'}});
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });

      // The browser fires this composing keydown for the Enter that commits
      // an IME candidate (isComposing: true, or legacy keyCode 229) before
      // compositionend writes the pending syllable into the input. Without
      // the guard this both selects the highlighted result AND clears the
      // input via handleSelect, so the syllable that compositionend then
      // writes lands in an emptied field instead of being part of the word.
      fireEvent.keyDown(input, {key: 'Enter', isComposing: true});
      expect(onChange).not.toHaveBeenCalled();
      expect(input).toHaveValue('App');

      fireEvent.keyDown(input, {key: 'Enter', keyCode: 229});
      expect(onChange).not.toHaveBeenCalled();
      expect(input).toHaveValue('App');

      // A real, non-composing Enter still selects normally.
      fireEvent.keyDown(input, {key: 'Enter'});
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({label: 'Apple'}),
      );
    });
  });

  it('disables input when isDisabled', () => {
    render(
      <BaseTypeahead
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
      <BaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        anchorRef={anchorRef}
      />,
    );
    // Component renders without error — anchor is wired up internally
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('does not select every result when items lack ids', async () => {
    const idlessItems = [
      {label: 'Alpha'},
      {label: 'Beta'},
    ] as unknown as SearchableItem[];
    const idlessSource: SearchSource = {
      search: () => idlessItems,
      bootstrap: () => idlessItems,
    };

    render(
      <BaseTypeahead
        searchSource={idlessSource}
        value={idlessItems[0]}
        onChange={() => {}}
        hasEntriesOnFocus
        debounceMs={0}
      />,
    );

    fireEvent.focus(screen.getByRole('combobox'));

    await waitFor(() => {
      expect(screen.getAllByRole('option', {hidden: true})).toHaveLength(2);
    });

    const options = screen.getAllByRole('option', {hidden: true});
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(options[1]).toHaveAttribute('aria-selected', 'false');
  });
});

describe('BaseTypeahead focus-out', () => {
  it('closes the dropdown when focus leaves the input', async () => {
    render(
      <>
        <BaseTypeahead
          searchSource={fruitSource}
          value={null}
          onChange={() => {}}
          debounceMs={0}
        />
        <button type="button">Outside</button>
      </>,
    );
    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: 'App'}});

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    // Focus moves to an element outside the field/dropdown → menu closes.
    const outside = screen.getByRole('button', {name: 'Outside'});
    fireEvent.blur(input, {relatedTarget: outside});

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('closes the list on the Tab keydown, before the blur it produces', async () => {
    render(
      <BaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        debounceMs={0}
      />,
    );
    const input = screen.getByRole('combobox');
    input.focus();
    fireEvent.change(input, {target: {value: 'App'}});
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    // No blur is fired here on purpose: dismissing from the blur instead lets
    // the popover close mid-focus-move, which Chrome answers by dropping
    // focus to <body>.
    fireEvent.keyDown(input, {key: 'Tab'});
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('Tab from the input with the list open moves focus to the next control', async () => {
    const user = userEvent.setup();
    render(
      <>
        <BaseTypeahead
          searchSource={fruitSource}
          value={null}
          onChange={() => {}}
          debounceMs={0}
        />
        <button type="button">Next</button>
      </>,
    );
    const input = screen.getByRole('combobox');
    input.focus();
    fireEvent.change(input, {target: {value: 'App'}});
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    await user.keyboard('{Tab}');
    expect(screen.getByRole('button', {name: 'Next'})).toHaveFocus();
  });

  it('keeps the dropdown open when focus moves into the anchor wrapper', async () => {
    const anchor = document.createElement('div');
    document.body.appendChild(anchor);
    const anchorRef = {current: anchor};
    render(
      <BaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        anchorRef={anchorRef}
        debounceMs={0}
      />,
    );
    const input = screen.getByRole('combobox');
    // The input lives inside the wrapper we hand to anchorRef.
    anchor.appendChild(input.closest('div') ?? input);
    fireEvent.change(input, {target: {value: 'App'}});

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    // A sibling control inside the field (e.g. a clear button) receives focus.
    const sibling = document.createElement('button');
    anchor.appendChild(sibling);
    fireEvent.blur(input, {relatedTarget: sibling});

    // Menu stays open because focus is still within the field.
    expect(input).toHaveAttribute('aria-expanded', 'true');
    document.body.removeChild(anchor);
  });

  it('does not close when a dropdown option receives focus', async () => {
    render(
      <BaseTypeahead
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

    const option = screen.getByRole('option', {hidden: true});
    fireEvent.blur(input, {relatedTarget: option});

    expect(input).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('Typeahead', () => {
  describe('out-of-order async results', () => {
    it('discards a stale response that resolves after a newer query', async () => {
      const resolvers = new Map<string, (items: SearchableItem[]) => void>();
      const rawSource: SearchSource = {
        search: async (query: string) =>
          new Promise<SearchableItem[]>(resolve => {
            resolvers.set(query, resolve);
          }),
        bootstrap: () => [],
      };

      render(
        <Typeahead
          label="Fruit"
          searchSource={rawSource}
          value={null}
          onChange={() => {}}
          debounceMs={0}
        />,
      );

      const input = screen.getByRole('combobox');
      fireEvent.change(input, {target: {value: 'a'}});
      fireEvent.change(input, {target: {value: 'ap'}});

      // The newer query resolves first…
      await act(async () => {
        resolvers.get('ap')!([{id: 'apple', label: 'Apple'}]);
      });
      expect(screen.getByText('Apple')).toBeInTheDocument();

      // …then the abandoned query's slow response arrives and must be
      // discarded rather than overwriting the current results.
      await act(async () => {
        resolvers.get('a')!([
          {id: 'avocado', label: 'Avocado'},
          {id: 'apricot', label: 'Apricot'},
        ]);
      });
      expect(screen.getByText('Apple')).toBeInTheDocument();
      expect(screen.queryByText('Avocado')).not.toBeInTheDocument();
    });
  });

  it('renders with label', () => {
    render(
      <Typeahead
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
      <Typeahead
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
      <Typeahead
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
      <Typeahead
        label="Fruit"
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        status={{type: 'error', message: 'Selection required'}}
      />,
    );
    expect(screen.getByText('Selection required')).toBeInTheDocument();
  });

  it('shows selected value as a token', () => {
    render(
      <Typeahead
        label="Fruit"
        searchSource={fruitSource}
        value={fruits[0]}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText(fruits[0].label)).toBeInTheDocument();
  });

  it('shows clear button when hasClear and value is selected', () => {
    render(
      <Typeahead
        label="Fruit"
        searchSource={fruitSource}
        value={fruits[0]}
        onChange={() => {}}
        hasClear
      />,
    );
    expect(
      screen.getByRole('button', {name: 'Clear selection'}),
    ).toBeInTheDocument();
  });

  it('does not show clear button when hasClear is false', () => {
    render(
      <Typeahead
        label="Fruit"
        searchSource={fruitSource}
        value={fruits[0]}
        onChange={() => {}}
        hasClear={false}
      />,
    );
    expect(
      screen.queryByRole('button', {name: 'Clear selection'}),
    ).not.toBeInTheDocument();
  });

  it('calls onChange with null when clear button is clicked', () => {
    const onChange = vi.fn();
    render(
      <Typeahead
        label="Fruit"
        searchSource={fruitSource}
        value={fruits[0]}
        onChange={onChange}
        hasClear
      />,
    );
    fireEvent.click(screen.getByRole('button', {name: 'Clear selection'}));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('renders with data-testid', () => {
    render(
      <Typeahead
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

describe('Typeahead size', () => {
  it('renders with size="lg"', () => {
    render(
      <Typeahead
        label="Fruit"
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        size="lg"
      />,
    );
    expect(screen.getByLabelText('Fruit')).toBeInTheDocument();
  });
});

describe('BaseTypeahead hasEntriesOnFocus', () => {
  it('shows bootstrap results on mouse click', async () => {
    render(
      <BaseTypeahead
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
      <BaseTypeahead
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
      <BaseTypeahead
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

describe('BaseTypeahead minQueryLength', () => {
  it('does not search or open the menu below the threshold', async () => {
    const search = vi.fn((query: string) =>
      fruits.filter(f => f.label.toLowerCase().includes(query.toLowerCase())),
    );
    render(
      <BaseTypeahead
        searchSource={{search, bootstrap: () => []}}
        value={null}
        onChange={() => {}}
        minQueryLength={3}
        debounceMs={0}
      />,
    );
    const input = screen.getByRole('combobox');

    fireEvent.change(input, {target: {value: 'Ap'}});
    await act(async () => {
      await Promise.resolve();
    });

    expect(search).not.toHaveBeenCalled();
    expect(input).toHaveAttribute('aria-expanded', 'false');

    // Positive control: the third character crosses the threshold, so the
    // same harness does see the search and the open menu.
    fireEvent.change(input, {target: {value: 'App'}});
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });
    expect(search).toHaveBeenCalledExactlyOnceWith('App');
  });

  it('closes the menu again when the query falls back below the threshold', async () => {
    render(
      <BaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        minQueryLength={3}
        debounceMs={0}
      />,
    );
    const input = screen.getByRole('combobox');

    fireEvent.change(input, {target: {value: 'App'}});
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    fireEvent.change(input, {target: {value: 'Ap'}});
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('does not fall back to bootstrap entries on ArrowDown below the threshold', async () => {
    const bootstrap = vi.fn(() => fruits.slice(0, 3));
    render(
      <BaseTypeahead
        searchSource={{search: () => [], bootstrap}}
        value={null}
        onChange={() => {}}
        hasEntriesOnFocus
        minQueryLength={3}
        debounceMs={0}
      />,
    );
    const input = screen.getByRole('combobox');

    fireEvent.focus(input);
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });
    bootstrap.mockClear();

    // Typing below the threshold closes the bootstrap menu...
    fireEvent.change(input, {target: {value: 'Ap'}});
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });

    // ...and ArrowDown must not re-open it with entries that ignore the
    // two characters already typed.
    fireEvent.keyDown(input, {key: 'ArrowDown'});
    await act(async () => {
      await Promise.resolve();
    });
    expect(bootstrap).not.toHaveBeenCalled();
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('searches on the first character when minQueryLength is not set', async () => {
    const search = vi.fn(() => fruits.slice(0, 1));
    render(
      <BaseTypeahead
        searchSource={{search, bootstrap: () => []}}
        value={null}
        onChange={() => {}}
        debounceMs={0}
      />,
    );
    const input = screen.getByRole('combobox');

    fireEvent.change(input, {target: {value: 'A'}});
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });
    expect(search).toHaveBeenCalledExactlyOnceWith('A');
  });

  it('stops reporting "Loading" when the query falls below the threshold mid-search', async () => {
    // Falling below the threshold abandons the in-flight search by bumping the
    // search generation, which also makes that search decline to clear the
    // loading flag on its way out. Backspacing from three characters to two on
    // a remote source is the everyday way to hit it, and the field would
    // otherwise report "Loading" to a screen reader until the third character
    // went back in.
    let settle: (items: SearchableItem[]) => void = () => {};
    const search = vi.fn(
      async () =>
        new Promise<SearchableItem[]>(resolve => {
          settle = resolve;
        }),
    );
    render(
      <BaseTypeahead
        searchSource={{search, bootstrap: () => []}}
        value={null}
        onChange={() => {}}
        minQueryLength={3}
        debounceMs={0}
      />,
    );
    const input = screen.getByRole('combobox');

    fireEvent.change(input, {target: {value: 'App'}});
    await waitFor(() => {
      expect(screen.getByRole('status', {name: 'Loading'})).toBeInTheDocument();
    });

    fireEvent.change(input, {target: {value: 'Ap'}});
    await act(async () => {
      settle(fruits.slice(0, 1));
      await Promise.resolve();
    });

    expect(
      screen.queryByRole('status', {name: 'Loading'}),
    ).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('BaseTypeahead hasSearched reset', () => {
  it('does not show "No results found" after selecting an item and re-entering', async () => {
    const onChange = vi.fn();
    const {rerender} = render(
      <BaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={onChange}
        debounceMs={0}
      />,
    );
    const input = screen.getByRole('combobox');

    // Type a query that returns results
    fireEvent.change(input, {target: {value: 'Apple'}});
    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    // Select the item
    fireEvent.click(screen.getByText('Apple'));
    expect(onChange).toHaveBeenCalledWith(fruits[0]);

    // Re-render with the selected value
    rerender(
      <BaseTypeahead
        searchSource={fruitSource}
        value={fruits[0]}
        onChange={onChange}
        debounceMs={0}
      />,
    );

    // Focus the input again — "No results found" should NOT appear
    fireEvent.focus(input);

    // The empty state text should not be visible since hasSearched was reset
    expect(screen.queryByText('No results found')).not.toBeInTheDocument();
  });

  it('resets hasSearched when query is cleared without hasEntriesOnFocus', async () => {
    render(
      <BaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        debounceMs={0}
      />,
    );
    const input = screen.getByRole('combobox');

    // Type a query that returns no results
    fireEvent.change(input, {target: {value: 'xyz'}});
    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });

    // Clear the query
    fireEvent.change(input, {target: {value: ''}});

    // "No results found" should disappear since hasSearched is reset
    expect(screen.queryByText('No results found')).not.toBeInTheDocument();
  });
});

describe('BaseTypeahead popover after selection', () => {
  it('does not show an empty popover after selecting an item with hasEntriesOnFocus', async () => {
    const onChange = vi.fn();
    render(
      <BaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={onChange}
        hasEntriesOnFocus
        debounceMs={0}
      />,
    );
    const input = screen.getByRole('combobox');

    // Focus to open bootstrap results
    fireEvent.focus(input);
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    // Select an item — popover should close
    fireEvent.click(screen.getByText('Apple'));
    expect(onChange).toHaveBeenCalledWith(fruits[0]);

    // After selection, input is refocused but popover should NOT reopen
    // with an empty menu. The handleFocus handler should be suppressed.
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });
  });
});

describe('Typeahead edit mode', () => {
  it('enters edit mode on token container click', () => {
    const onChange = vi.fn();
    render(
      <Typeahead
        label="Fruit"
        searchSource={fruitSource}
        value={fruits[0]}
        onChange={onChange}
      />,
    );
    screen.getByRole('combobox');

    // Click the token text to enter edit mode
    const tokenText = screen.getByText(fruits[0].label);
    const tokenContainer = tokenText.closest('div')!;
    fireEvent.click(tokenContainer);

    // onChange should NOT have been called (value is preserved for restore)
    expect(onChange).not.toHaveBeenCalled();
  });

  it('restores token on blur without action', async () => {
    const onChange = vi.fn();
    render(
      <Typeahead
        label="Fruit"
        searchSource={fruitSource}
        value={fruits[0]}
        onChange={onChange}
      />,
    );
    const input = screen.getByRole('combobox');

    // Enter edit mode
    const tokenText = screen.getByText(fruits[0].label);
    fireEvent.click(tokenText.closest('div')!);

    // Blur without selecting anything
    fireEvent.blur(input);

    // onChange should not have been called — value restored
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not exit edit mode on a composing Escape (IME)', async () => {
    const onChange = vi.fn();
    render(
      <Typeahead
        label="Fruit"
        searchSource={fruitSource}
        value={fruits[0]}
        onChange={onChange}
      />,
    );

    // Enter edit mode by clicking the token; the input uncollapses and
    // rejoins the Tab order (tabindex is cleared).
    const tokenText = screen.getByText(fruits[0].label);
    fireEvent.click(tokenText.closest('div')!);
    await act(async () => {
      await new Promise(r => requestAnimationFrame(r));
    });
    const input = screen.getByRole('combobox');
    expect(input).not.toHaveAttribute('tabindex', '-1');

    // BaseTypeahead invokes this external handler before its own IME guard, so
    // a composing Escape (isComposing / legacy keyCode 229) — which an IME uses
    // to cancel the pending candidate — must not exit edit mode here.
    fireEvent.keyDown(input, {key: 'Escape', isComposing: true});
    expect(screen.getByRole('combobox')).not.toHaveAttribute('tabindex', '-1');
    fireEvent.keyDown(input, {key: 'Escape', keyCode: 229});
    expect(screen.getByRole('combobox')).not.toHaveAttribute('tabindex', '-1');

    // A real, non-composing Escape still exits edit mode: the token is
    // restored and the collapsed input drops back out of the Tab order.
    fireEvent.keyDown(input, {key: 'Escape'});
    expect(screen.getByRole('combobox')).toHaveAttribute('tabindex', '-1');
  });
});

describe('Typeahead collapsed input tab order', () => {
  it('removes the invisible input from the Tab order while a token is shown', () => {
    render(
      <Typeahead
        label="Fruit"
        searchSource={fruitSource}
        value={fruits[0]}
        onChange={() => {}}
      />,
    );
    // While the token is shown the input is collapsed (width 0 / opacity 0);
    // it must stay programmatically focusable for token interactions but must
    // not be an invisible Tab stop (WCAG 2.4.3 / 2.4.7).
    expect(screen.getByRole('combobox')).toHaveAttribute('tabindex', '-1');
  });

  it('Tab from the token skips the invisible input', async () => {
    const user = userEvent.setup();
    render(
      <Typeahead
        label="Fruit"
        searchSource={fruitSource}
        value={fruits[0]}
        onChange={() => {}}
      />,
    );
    // Focus the token's internal button, then Tab away — focus must not land
    // on the visually hidden combobox input.
    const tokenButton = screen.getByRole('button', {name: fruits[0].label});
    tokenButton.focus();
    await user.tab();
    expect(screen.getByRole('combobox')).not.toHaveFocus();
  });

  it('keeps the input in the Tab order when no token is shown', () => {
    render(
      <Typeahead
        label="Fruit"
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('combobox')).not.toHaveAttribute('tabindex');
  });

  it('restores the input to the Tab order in edit mode', () => {
    render(
      <Typeahead
        label="Fruit"
        searchSource={fruitSource}
        value={fruits[0]}
        onChange={() => {}}
      />,
    );
    // Entering edit mode removes the token and uncollapses the input
    const tokenText = screen.getByText(fruits[0].label);
    fireEvent.click(tokenText.closest('div')!);
    expect(screen.getByRole('combobox')).not.toHaveAttribute('tabindex');
  });
});

describe('BaseTypeahead paste behavior', () => {
  it('pasting text triggers search results like typing', async () => {
    const user = userEvent.setup();
    render(
      <BaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        debounceMs={0}
      />,
    );

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.paste('App');

    await waitFor(() => {
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });
  });

  it('pasting non-matching text shows no results', async () => {
    const user = userEvent.setup();
    render(
      <BaseTypeahead
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        debounceMs={0}
      />,
    );

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.paste('xyz');

    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });
  });

  it('scrolls the highlighted option into view during arrow navigation', async () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
    try {
      const user = userEvent.setup();
      render(
        <BaseTypeahead
          searchSource={fruitSource}
          value={null}
          onChange={() => {}}
          debounceMs={0}
        />,
      );

      const input = screen.getByRole('combobox');
      await user.click(input);
      await user.paste('e'); // matches multiple fruits, opens listbox
      await waitFor(() => {
        expect(screen.getByRole('listbox', {hidden: true})).toBeInTheDocument();
      });

      scrollIntoView.mockClear();
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');

      expect(scrollIntoView).toHaveBeenCalledWith({block: 'nearest'});
    } finally {
      delete (HTMLElement.prototype as unknown as {scrollIntoView?: unknown})
        .scrollIntoView;
    }
  });
});

describe('Typeahead disabledMessage', () => {
  // jsdom does not implement the Popover API used by the tooltip, so mock
  // showPopover/hidePopover to toggle a `popover-open` attribute the tests
  // can assert on.
  beforeEach(() => {
    HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
      this.setAttribute('popover-open', '');
    });
    HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
      this.removeAttribute('popover-open');
    });
  });

  // jsdom popover content is in the DOM but not "visible" in the
  // accessibility tree; use hidden: true to find it.
  const h = {hidden: true} as const;

  it('shows the reason tooltip on hover when disabled with a reason', async () => {
    render(
      <Typeahead
        label="Assignee"
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        isDisabled
        disabledMessage="You need the Editor role"
      />,
    );

    const container = screen.getByRole('combobox').parentElement as HTMLElement;
    const tooltip = screen.getByRole('tooltip', h);
    expect(tooltip).toHaveTextContent('You need the Editor role');

    fireEvent.mouseEnter(container);
    await waitFor(() => {
      expect(tooltip).toHaveAttribute('popover-open');
    });

    fireEvent.mouseLeave(container);
    await waitFor(() => {
      expect(tooltip).not.toHaveAttribute('popover-open');
    });
  });

  it('shows the reason tooltip on keyboard focus', async () => {
    const user = userEvent.setup();
    render(
      <Typeahead
        label="Assignee"
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        isDisabled
        disabledMessage="You need the Editor role"
      />,
    );

    const tooltip = screen.getByRole('tooltip', h);
    await user.tab();
    expect(screen.getByRole('combobox')).toHaveFocus();
    await waitFor(() => {
      expect(tooltip).toHaveAttribute('popover-open');
    });
  });

  it('does not render a tooltip when not disabled', () => {
    render(
      <Typeahead
        label="Assignee"
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        disabledMessage="You need the Editor role"
      />,
    );
    expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
  });

  it('does not render a tooltip when disabled without a reason', () => {
    render(
      <Typeahead
        label="Assignee"
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        isDisabled
      />,
    );
    expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
  });

  it('keeps the input focusable via aria-disabled when a reason is provided', () => {
    render(
      <Typeahead
        label="Assignee"
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        isDisabled
        disabledMessage="You need the Editor role"
      />,
    );
    const input = screen.getByRole('combobox');
    expect(input).not.toBeDisabled();
    expect(input).toHaveAttribute('aria-disabled', 'true');
    expect(input).toHaveAttribute('readonly');
  });

  it('links the reason tooltip from the input via aria-describedby', () => {
    render(
      <Typeahead
        label="Assignee"
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        isDisabled
        disabledMessage="You need the Editor role"
      />,
    );
    const input = screen.getByRole('combobox');
    const tooltip = screen.getByRole('tooltip', h);
    expect(input.getAttribute('aria-describedby')).toContain(tooltip.id);
  });

  it('blocks typing and selection while focusable-disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Typeahead
        label="Assignee"
        searchSource={fruitSource}
        value={null}
        onChange={onChange}
        isDisabled
        disabledMessage="You need the Editor role"
      />,
    );

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'App');
    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('remains natively disabled when disabled without a reason', () => {
    render(
      <Typeahead
        label="Assignee"
        searchSource={fruitSource}
        value={null}
        onChange={() => {}}
        isDisabled
      />,
    );
    const input = screen.getByRole('combobox');
    expect(input).toBeDisabled();
    expect(input).not.toHaveAttribute('aria-disabled');
  });
});

describe('Typeahead statusVariant forwarding', () => {
  it('defaults to attached (status renders with data-variant="attached")', () => {
    const {container} = render(
      <Typeahead
        label="Fruit"
        searchSource={fruitSource}
        value={null}
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
      <Typeahead
        label="Fruit"
        searchSource={fruitSource}
        value={null}
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
