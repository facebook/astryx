// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BaseTypeahead.test.tsx
 * @input BaseTypeahead public props and a synchronous SearchSource
 * @output Combobox contract tests, including stale source refresh on focus and reopen,
 *   and pending work that settles after a dismissal
 * @position Colocated verification for BaseTypeahead
 */

import {afterAll, beforeAll, describe, expect, it, vi} from 'vitest';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as stylex from '@stylexjs/stylex';
import {BaseTypeahead} from './BaseTypeahead';
import type {SearchSource, SearchableItem} from './types';

const popoverOpenState = new WeakMap<HTMLElement, boolean>();
const originalMatchesDescriptor = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  'matches',
);
const originalMatches = HTMLElement.prototype.matches;

beforeAll(() => {
  HTMLElement.prototype.showPopover = function () {
    popoverOpenState.set(this, true);
    const event = new Event('toggle');
    Object.defineProperty(event, 'newState', {value: 'open'});
    this.dispatchEvent(event);
  };
  HTMLElement.prototype.hidePopover = function () {
    popoverOpenState.set(this, false);
    const event = new Event('toggle');
    Object.defineProperty(event, 'newState', {value: 'closed'});
    this.dispatchEvent(event);
  };
  Object.defineProperty(HTMLElement.prototype, 'matches', {
    ...originalMatchesDescriptor,
    value(this: HTMLElement, selector: string) {
      if (selector === ':popover-open') {
        return popoverOpenState.get(this) ?? false;
      }
      return originalMatches.call(this, selector);
    },
  });
});

afterAll(() => {
  if (originalMatchesDescriptor) {
    Object.defineProperty(
      HTMLElement.prototype,
      'matches',
      originalMatchesDescriptor,
    );
  }
});

const emptySource: SearchSource<SearchableItem> = {
  search: () => [],
  bootstrap: () => [],
};

const resultItem: SearchableItem = {id: '1', label: 'Result'};

const testStyles = stylex.create({
  input: {textTransform: 'uppercase'},
});

describe('BaseTypeahead', () => {
  it('forwards supported DOM, styling, and event props to the combobox input', () => {
    const onBlur = vi.fn();
    const onFocus = vi.fn();
    const onPointerDown = vi.fn();

    render(
      <BaseTypeahead
        searchSource={emptySource}
        value={null}
        onChange={() => {}}
        aria-label="Find a framework"
        aria-expanded="true"
        className="consumer-input"
        data-audit-state="forwarded"
        onBlur={onBlur}
        onFocus={onFocus}
        onPointerDown={onPointerDown}
        style={{letterSpacing: '0.08em'}}
        xstyle={testStyles.input}
      />,
    );

    const input = screen.getByRole('combobox', {name: 'Find a framework'});
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('data-audit-state', 'forwarded');
    expect(input).toHaveClass('consumer-input');
    expect(input).toHaveStyle({letterSpacing: '0.08em'});
    expect(getComputedStyle(input).textTransform).toBe('uppercase');

    fireEvent.pointerDown(input);
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(onPointerDown).toHaveBeenCalledOnce();
    expect(onFocus).toHaveBeenCalledOnce();
    expect(onBlur).toHaveBeenCalledOnce();
  });

  it('preserves native input attributes when legacy aliases are undefined', () => {
    render(
      <BaseTypeahead
        searchSource={emptySource}
        value={null}
        onChange={() => {}}
        id="native-input"
        aria-describedby="native-description"
        aria-labelledby="native-label"
        tabIndex={3}
        inputId={undefined}
        ariaDescribedBy={undefined}
        ariaLabelledBy={undefined}
        inputTabIndex={undefined}
      />,
    );

    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('id', 'native-input');
    expect(input).toHaveAttribute('aria-describedby', 'native-description');
    expect(input).toHaveAttribute('aria-labelledby', 'native-label');
    expect(input).toHaveAttribute('tabindex', '3');
  });

  it('lets defined legacy aliases override their native equivalents', () => {
    render(
      <BaseTypeahead
        searchSource={emptySource}
        value={null}
        onChange={() => {}}
        id="native-input"
        aria-describedby="native-description"
        aria-labelledby="native-label"
        tabIndex={3}
        inputId="legacy-input"
        ariaDescribedBy="legacy-description"
        ariaLabelledBy="legacy-label"
        inputTabIndex={-1}
      />,
    );

    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('id', 'legacy-input');
    expect(input).toHaveAttribute('aria-describedby', 'legacy-description');
    expect(input).toHaveAttribute('aria-labelledby', 'legacy-label');
    expect(input).toHaveAttribute('tabindex', '-1');
  });

  it('refreshes nonempty cached results after source replacement on a focused-input click', async () => {
    const user = userEvent.setup();
    const originalSource: SearchSource<SearchableItem> = {
      search: () => [],
      bootstrap: () => [resultItem],
    };
    const updatedSource: SearchSource<SearchableItem> = {
      search: () => [],
      bootstrap: () => [{id: '2', label: 'Updated result'}],
    };
    const {rerender} = render(
      <BaseTypeahead
        searchSource={originalSource}
        value={null}
        onChange={() => {}}
        hasEntriesOnFocus
      />,
    );
    const input = screen.getByRole('combobox');

    await user.click(input);
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });
    expect(
      screen.getByRole('option', {name: 'Result', hidden: true}),
    ).toBeInTheDocument();

    await user.keyboard('{Escape}');
    rerender(
      <BaseTypeahead
        searchSource={updatedSource}
        value={null}
        onChange={() => {}}
        hasEntriesOnFocus
      />,
    );
    expect(input).toHaveFocus();
    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.getByRole('option', {name: 'Result', hidden: true}),
    ).toBeInTheDocument();

    await user.click(input);
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
      expect(
        screen.getByRole('option', {name: 'Updated result', hidden: true}),
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByRole('option', {name: 'Result', hidden: true}),
    ).not.toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  it.each([
    ['a click', 'click'],
    ['keyboard focus', 'tab'],
  ] as const)(
    'bootstraps the replacement source when %s refocuses the input',
    async (_label, refocus) => {
      const user = userEvent.setup();
      const originalSource: SearchSource<SearchableItem> = {
        search: () => [],
        bootstrap: () => [resultItem],
      };
      const updatedBootstrap = vi.fn(() => [
        {id: '2', label: 'Updated result'},
      ]);
      const updatedSource: SearchSource<SearchableItem> = {
        search: () => [],
        bootstrap: updatedBootstrap,
      };
      const renderField = (searchSource: SearchSource<SearchableItem>) => (
        <>
          <BaseTypeahead
            searchSource={searchSource}
            value={null}
            onChange={() => {}}
            hasEntriesOnFocus
          />
          <button type="button">Sort</button>
        </>
      );
      const {rerender} = render(renderField(originalSource));
      const input = screen.getByRole('combobox');
      const sortButton = screen.getByRole('button', {name: 'Sort'});

      await user.click(input);
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });

      // Focus moves to another control, which then hands the field a new
      // source (a sort or filter change rebuilding the caller's source).
      await user.click(sortButton);
      expect(input).not.toHaveFocus();
      expect(input).toHaveAttribute('aria-expanded', 'false');
      rerender(renderField(updatedSource));

      if (refocus === 'click') {
        await user.click(input);
      } else {
        await user.tab({shift: true});
      }
      expect(input).toHaveFocus();
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
        expect(
          screen.getByRole('option', {name: 'Updated result', hidden: true}),
        ).toBeInTheDocument();
      });
      expect(
        screen.queryByRole('option', {name: 'Result', hidden: true}),
      ).not.toBeInTheDocument();
      expect(updatedBootstrap).toHaveBeenCalledTimes(1);
    },
  );

  it('re-shows cached results without bootstrapping again when the source is unchanged', async () => {
    const user = userEvent.setup();
    const bootstrap = vi.fn(() => [resultItem]);
    const source: SearchSource<SearchableItem> = {search: () => [], bootstrap};
    render(
      <>
        <BaseTypeahead
          searchSource={source}
          value={null}
          onChange={() => {}}
          hasEntriesOnFocus
        />
        <button type="button">Sort</button>
      </>,
    );
    const input = screen.getByRole('combobox');

    await user.click(input);
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });
    await user.click(screen.getByRole('button', {name: 'Sort'}));
    expect(input).toHaveAttribute('aria-expanded', 'false');

    await user.click(input);
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });
    expect(
      screen.getByRole('option', {name: 'Result', hidden: true}),
    ).toBeInTheDocument();
    expect(bootstrap).toHaveBeenCalledTimes(1);
  });

  it('counts grapheme clusters when enforcing minQueryLength', async () => {
    const search = vi.fn(() => [resultItem]);
    render(
      <BaseTypeahead
        searchSource={{search, bootstrap: () => []}}
        value={null}
        onChange={() => {}}
        debounceMs={0}
        minQueryLength={2}
      />,
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, {target: {value: '😀'}});
    await Promise.resolve();
    expect(search).not.toHaveBeenCalled();
    expect(input).toHaveAttribute('aria-expanded', 'false');

    fireEvent.change(input, {target: {value: '😀a'}});
    await waitFor(() => expect(search).toHaveBeenCalledExactlyOnceWith('😀a'));
  });

  it('exposes a completed empty search as a disabled listbox option', async () => {
    render(
      <BaseTypeahead
        searchSource={emptySource}
        value={null}
        onChange={() => {}}
        debounceMs={0}
        emptySearchText="No matching frameworks"
      />,
    );

    fireEvent.change(screen.getByRole('combobox'), {
      target: {value: 'none'},
    });

    await waitFor(() => {
      expect(
        screen.getByRole('option', {
          hidden: true,
          name: 'No matching frameworks',
        }),
      ).toHaveAttribute('aria-disabled', 'true');
    });
  });
});

describe('BaseTypeahead pending work after a dismissal', () => {
  // A source that cannot abort: every search answers when the test says so.
  function pendingSource() {
    const answers = new Map<string, (items: SearchableItem[]) => void>();
    const search = vi.fn(
      async (query: string) =>
        new Promise<SearchableItem[]>(resolve => answers.set(query, resolve)),
    );
    const source: SearchSource<SearchableItem> = {search, bootstrap: () => []};
    const answer = async (query: string, labels: string[]) => {
      await waitFor(() => expect(answers.has(query)).toBe(true));
      answers.get(query)?.(labels.map(label => ({id: label, label})));
      await act(async () => {});
    };
    return {source, search, answer};
  }

  function renderPending(extra: Partial<Parameters<typeof BaseTypeahead>[0]>) {
    const pending = pendingSource();
    render(
      <>
        <BaseTypeahead
          searchSource={pending.source}
          value={null}
          onChange={() => {}}
          debounceMs={0}
          {...extra}
        />
        <button type="button">Elsewhere</button>
      </>,
    );
    return {...pending, input: screen.getByRole('combobox')};
  }

  async function openWithPendingQuery(
    input: HTMLElement,
    answer: (query: string, labels: string[]) => Promise<void>,
  ) {
    input.focus();
    fireEvent.change(input, {target: {value: 'a'}});
    await answer('a', ['Alpha']);
    expect(input).toHaveAttribute('aria-expanded', 'true');
    fireEvent.change(input, {target: {value: 'al'}});
    await waitFor(() => expect(input).toHaveAttribute('aria-busy', 'true'));
  }

  it('stays closed and stops being busy when a search answers after Escape', async () => {
    const {input, answer} = renderPending({});
    await openWithPendingQuery(input, answer);

    fireEvent.keyDown(input, {key: 'Escape'});
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).not.toHaveAttribute('aria-busy');

    await answer('al', ['Alpine']);
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).not.toHaveAttribute('aria-busy');
  });

  it('stays closed when a search answers after an outside click closed the popup', async () => {
    const {input, answer} = renderPending({});
    await openWithPendingQuery(input, answer);

    // Native light dismissal closes the popover itself and reports a toggle.
    const popup = screen
      .getByRole('listbox', {hidden: true})
      .closest('[popover]') as HTMLElement;
    act(() => popup.hidePopover());
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).not.toHaveAttribute('aria-busy');

    await answer('al', ['Alpine']);
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not open when a search answers after focus left the field', async () => {
    const {input, answer} = renderPending({});
    input.focus();
    fireEvent.change(input, {target: {value: 'a'}});
    await waitFor(() => expect(input).toHaveAttribute('aria-busy', 'true'));

    fireEvent.blur(input, {
      relatedTarget: screen.getByRole('button', {name: 'Elsewhere'}),
    });
    expect(input).not.toHaveAttribute('aria-busy');

    await answer('a', ['Alpha']);
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not open when focus bootstrap answers after focus left the field', async () => {
    let resolve: (items: SearchableItem[]) => void = () => {};
    const source: SearchSource<SearchableItem> = {
      search: () => [],
      bootstrap: async () =>
        new Promise<SearchableItem[]>(r => {
          resolve = r;
        }),
    };
    render(
      <>
        <BaseTypeahead
          searchSource={source}
          value={null}
          onChange={() => {}}
          hasEntriesOnFocus
        />
        <button type="button">Elsewhere</button>
      </>,
    );
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    await waitFor(() => expect(input).toHaveAttribute('aria-busy', 'true'));

    fireEvent.blur(input, {
      relatedTarget: screen.getByRole('button', {name: 'Elsewhere'}),
    });
    expect(input).not.toHaveAttribute('aria-busy');

    await act(async () => resolve([{id: '1', label: 'Suggested'}]));
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows the late answer, without searching again, when the same query is reopened', async () => {
    const {input, search, answer} = renderPending({});
    await openWithPendingQuery(input, answer);
    fireEvent.keyDown(input, {key: 'Escape'});
    await answer('al', ['Alpine']);

    fireEvent.keyDown(input, {key: 'ArrowDown'});
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('option', {name: 'Alpine', hidden: true}),
    ).toBeInTheDocument();
    expect(search.mock.calls.filter(([q]) => q === 'al')).toHaveLength(1);
  });

  it('drops a late answer for a query the person has since changed', async () => {
    const {input, answer} = renderPending({});
    await openWithPendingQuery(input, answer);
    fireEvent.keyDown(input, {key: 'Escape'});

    fireEvent.change(input, {target: {value: 'alp'}});
    await answer('al', ['Stale']);
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('option', {name: 'Stale', hidden: true}),
    ).not.toBeInTheDocument();

    await answer('alp', ['Alpine']);
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('option', {name: 'Alpine', hidden: true}),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('option', {name: 'Stale', hidden: true}),
    ).not.toBeInTheDocument();
  });

  it('does not keep or show a late answer while a changed query waits on its debounce', async () => {
    vi.useFakeTimers({shouldAdvanceTime: true});
    try {
      const {input, search, answer} = renderPending({debounceMs: 200});
      input.focus();
      fireEvent.change(input, {target: {value: 'a'}});
      await act(async () => vi.advanceTimersByTime(200));
      await answer('a', ['Alpha']);
      fireEvent.change(input, {target: {value: 'al'}});
      await act(async () => vi.advanceTimersByTime(200));
      await waitFor(() => expect(input).toHaveAttribute('aria-busy', 'true'));
      fireEvent.keyDown(input, {key: 'Escape'});

      // The next query is typed but its search has not started yet.
      fireEvent.change(input, {target: {value: 'alp'}});
      await answer('al', ['Stale']);
      expect(input).toHaveAttribute('aria-expanded', 'false');

      // Asking for the menu searches the text the field holds now.
      fireEvent.keyDown(input, {key: 'ArrowDown'});
      expect(search).toHaveBeenLastCalledWith('alp');
      expect(input).toHaveAttribute('aria-busy', 'true');
      await answer('alp', ['Alpine']);
      expect(input).toHaveAttribute('aria-expanded', 'true');
      expect(
        screen.getByRole('option', {name: 'Alpine', hidden: true}),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('option', {name: 'Stale', hidden: true}),
      ).not.toBeInTheDocument();
      await act(async () => vi.advanceTimersByTime(200));
      expect(search.mock.calls.filter(([q]) => q === 'alp')).toHaveLength(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it.each([
    ['with', true],
    ['without', false],
  ] as const)(
    'reopens on ArrowDown %s entries on focus by waiting for the search still running for the typed text',
    async (_label, hasEntriesOnFocus) => {
      const bootstrap = vi.fn(() => [{id: 'b', label: 'Suggested'}]);
      const pending = pendingSource();
      pending.source.bootstrap = bootstrap;
      render(
        <BaseTypeahead
          searchSource={pending.source}
          value={null}
          onChange={() => {}}
          debounceMs={0}
          hasEntriesOnFocus={hasEntriesOnFocus}
        />,
      );
      const input = screen.getByRole('combobox');
      input.focus();
      fireEvent.change(input, {target: {value: 'a'}});
      await pending.answer('a', ['Alpha']);
      fireEvent.change(input, {target: {value: 'al'}});
      await waitFor(() => expect(input).toHaveAttribute('aria-busy', 'true'));
      fireEvent.keyDown(input, {key: 'Escape'});
      expect(input).not.toHaveAttribute('aria-busy');
      bootstrap.mockClear();

      fireEvent.keyDown(input, {key: 'ArrowDown'});
      // The pending answer is the one wanted: no bootstrap, no second search.
      expect(bootstrap).not.toHaveBeenCalled();
      expect(input).toHaveAttribute('aria-busy', 'true');
      expect(input).toHaveAttribute('aria-expanded', 'false');

      await pending.answer('al', ['Alpine']);
      expect(input).toHaveAttribute('aria-expanded', 'true');
      expect(input).not.toHaveAttribute('aria-busy');
      expect(
        screen.getByRole('option', {name: 'Alpine', hidden: true}),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('option', {name: 'Suggested', hidden: true}),
      ).not.toBeInTheDocument();
      expect(
        pending.search.mock.calls.filter(([q]) => q === 'al'),
      ).toHaveLength(1);
    },
  );

  it('opens with the pending answer when focus returns while its search still runs', async () => {
    const {input, search, answer} = renderPending({});
    input.focus();
    fireEvent.change(input, {target: {value: 'a'}});
    await waitFor(() => expect(input).toHaveAttribute('aria-busy', 'true'));
    fireEvent.blur(input, {
      relatedTarget: screen.getByRole('button', {name: 'Elsewhere'}),
    });
    expect(input).not.toHaveAttribute('aria-busy');

    fireEvent.focus(input);
    expect(input).toHaveAttribute('aria-busy', 'true');
    await answer('a', ['Alpha']);
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(search).toHaveBeenCalledTimes(1);
  });

  it('still opens the entries on focus with ArrowDown for an empty field', async () => {
    const source: SearchSource<SearchableItem> = {
      search: () => [],
      bootstrap: () => [{id: 'b', label: 'Suggested'}],
    };
    render(
      <BaseTypeahead
        searchSource={source}
        value={null}
        onChange={() => {}}
        hasEntriesOnFocus
      />,
    );
    const input = screen.getByRole('combobox');
    input.focus();
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));
    fireEvent.keyDown(input, {key: 'Escape'});
    expect(input).toHaveAttribute('aria-expanded', 'false');

    fireEvent.keyDown(input, {key: 'ArrowDown'});
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));
    expect(
      screen.getByRole('option', {name: 'Suggested', hidden: true}),
    ).toBeInTheDocument();
  });

  it('does not run a search still waiting on its debounce after Escape', async () => {
    vi.useFakeTimers({shouldAdvanceTime: true});
    try {
      const {input, search, answer} = renderPending({debounceMs: 200});
      input.focus();
      fireEvent.change(input, {target: {value: 'a'}});
      await act(async () => vi.advanceTimersByTime(200));
      await answer('a', ['Alpha']);
      expect(input).toHaveAttribute('aria-expanded', 'true');

      fireEvent.change(input, {target: {value: 'al'}});
      fireEvent.keyDown(input, {key: 'Escape'});
      await act(async () => vi.advanceTimersByTime(400));
      expect(search).not.toHaveBeenCalledWith('al');
      expect(input).not.toHaveAttribute('aria-busy');
      expect(input).toHaveAttribute('aria-expanded', 'false');

      fireEvent.keyDown(input, {key: 'ArrowDown'});
      expect(search).toHaveBeenLastCalledWith('al');
      await answer('al', ['Alpine']);
      expect(input).toHaveAttribute('aria-expanded', 'true');
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not run a search still waiting on its debounce after focus leaves', async () => {
    vi.useFakeTimers({shouldAdvanceTime: true});
    try {
      const {input, search} = renderPending({debounceMs: 200});
      input.focus();
      fireEvent.change(input, {target: {value: 'a'}});
      fireEvent.blur(input, {
        relatedTarget: screen.getByRole('button', {name: 'Elsewhere'}),
      });
      await act(async () => vi.advanceTimersByTime(400));
      expect(search).not.toHaveBeenCalled();
      expect(input).not.toHaveAttribute('aria-busy');
      expect(input).toHaveAttribute('aria-expanded', 'false');
    } finally {
      vi.useRealTimers();
    }
  });
});
