// Copyright (c) Meta Platforms, Inc. and affiliates.
/**
 * @file TokenizerBottomSheet.test.tsx
 * @input Uses vitest, Testing Library, Tokenizer with
 *   `experimental.presentation`
 * @output Tests for the experimental sheet presentation: the presentation
 *   resolution (`component:Tokenizer` FR16) and the single-sheet touch flow
 *   (FR17–FR24, AR6)
 * @position Core tests; validates Tokenizer.tsx and TokenizerBottomSheet.tsx
 */
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import {createRef, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Tokenizer, type TokenizerChange} from './Tokenizer';
import {__resetLiveRegionsForTest} from '../hooks/useAnnounce';
import {__resetDevWarnings} from '../utils/devWarning';
import {colorVars} from '../theme/tokens.stylex';
import type {SearchSource, SearchableItem} from '../Typeahead/types';

const COMPACT_TOUCH_QUERY = '(max-width: 768px) and (pointer: coarse)';

const ITEMS: SearchableItem[] = [
  {id: 'design', label: 'Design'},
  {id: 'eng', label: 'Eng'},
  {id: 'engineer', label: 'Engineer'},
  {id: 'energizer', label: 'Energizer'},
];
const source: SearchSource<SearchableItem> = {
  search: q =>
    ITEMS.filter(item => item.label.toLowerCase().includes(q.toLowerCase())),
  bootstrap: () => ITEMS,
};

type Presentation = 'popover' | 'bottom-sheet' | 'adaptive';

const DEFAULT_INITIAL = [ITEMS[0], ITEMS[1]];

function Harness({
  spy,
  presentation = 'bottom-sheet',
  initial = DEFAULT_INITIAL,
  ...props
}: {
  spy?: (
    items: SearchableItem[],
    change: TokenizerChange<SearchableItem>,
  ) => void;
  presentation?: Presentation;
  initial?: SearchableItem[];
  hasCreate?: boolean;
  maxEntries?: number;
  isDisabled?: boolean;
  disabledMessage?: string;
  debounceMs?: number;
  onFocus?: (event: React.FocusEvent) => void;
  onBlur?: (event: React.FocusEvent) => void;
}) {
  const [value, setValue] = useState<SearchableItem[]>(initial);
  return (
    <Tokenizer
      label="Tags"
      searchSource={source}
      value={value}
      debounceMs={0}
      placeholder="Add tags"
      onChange={(items, change) => {
        setValue(items);
        spy?.(items, change);
      }}
      experimental={{presentation}}
      {...props}
    />
  );
}

function stubMatchMedia(matcher: (query: string) => boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: matcher(query),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

function stubEnvironment() {
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.show = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  });
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
  }
  stubMatchMedia(() => false);
  window.scrollTo = vi.fn();
}

const openTrigger = () => screen.getByRole('button', {name: 'Tags'});
// The row list carries the progressive-rendering counters (FR21).
const list = () => document.querySelector<HTMLElement>('[data-total-count]')!;

// The sheet surface is loaded with React.lazy, so the first sheet renders a
// tick after it opens. Open one up front so the module is cached and every
// later sheet renders synchronously.
beforeAll(async () => {
  stubEnvironment();
  try {
    render(<Harness />);
    fireEvent.click(openTrigger());
    await screen.findByLabelText('Search Tags', undefined, {timeout: 15000});
  } finally {
    cleanup();
    vi.unstubAllGlobals();
  }
}, 20000);

beforeEach(() => {
  __resetLiveRegionsForTest();
  stubEnvironment();
});
afterEach(() => vi.unstubAllGlobals());

describe('Tokenizer experimental.presentation (FR16)', () => {
  it('keeps the inline combobox when experimental is omitted', () => {
    render(
      <Tokenizer
        label="Tags"
        searchSource={source}
        value={[ITEMS[0]]}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Tags'}),
    ).not.toBeInTheDocument();
  });

  it('keeps the inline combobox for an empty experimental object and for popover', () => {
    const {unmount} = render(
      <Tokenizer
        label="Tags"
        searchSource={source}
        value={[]}
        onChange={() => {}}
        experimental={{}}
      />,
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    unmount();
    render(<Harness presentation="popover" />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Tags'}),
    ).not.toBeInTheDocument();
  });

  it('forces the sheet trigger for bottom-sheet on every device', async () => {
    render(<Harness presentation="bottom-sheet" />);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    const trigger = openTrigger();
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveTextContent('Design');
    expect(trigger).toHaveTextContent('Eng');
    // Tokens in the trigger are display-only (FR17).
    expect(within(trigger).queryAllByRole('button')).toHaveLength(0);

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const sheet = await screen.findByRole('dialog', {name: 'Tags'});
    expect(sheet).toBeInTheDocument();
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it('uses the sheet for adaptive presentation on compact touch', async () => {
    stubMatchMedia(query => query === COMPACT_TOUCH_QUERY);
    render(<Harness presentation="adaptive" />);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    fireEvent.click(openTrigger());
    expect(
      await screen.findByRole('dialog', {name: 'Tags'}),
    ).toBeInTheDocument();
  });

  it('keeps adaptive presentation inline without compact touch', () => {
    render(<Harness presentation="adaptive" />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Tags'}),
    ).not.toBeInTheDocument();
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
  });

  it('shows the trigger placeholder when nothing is selected', () => {
    render(<Harness initial={[]} />);
    expect(openTrigger()).toHaveTextContent('Add tags');
  });
});

describe('Tokenizer sheet presentation (single-sheet touch flow)', () => {
  it('keeps rows stable while open and applies selected-first order on reopen (FR19)', async () => {
    const spy = vi.fn();
    render(<Harness spy={spy} />);
    const trigger = openTrigger();
    fireEvent.click(trigger);

    await screen.findByRole('checkbox', {name: 'Energizer'});
    const checkboxLabels = () =>
      within(list())
        .getAllByRole('checkbox')
        .map(row => row.getAttribute('aria-label'));
    expect(checkboxLabels()).toEqual([
      'Design',
      'Eng',
      'Engineer',
      'Energizer',
    ]);
    expect(screen.getByLabelText('Search Tags')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Add item'}),
    ).not.toBeInTheDocument();
    const design = screen.getByRole('checkbox', {name: 'Design'});
    expect(design).toBeChecked();
    expect(design.lastElementChild).toHaveAttribute('aria-hidden', 'true');
    expect(design.lastElementChild).toHaveAttribute('data-size', 'md');

    fireEvent.click(screen.getByRole('checkbox', {name: 'Energizer'}));
    expect(spy).toHaveBeenCalledWith(
      [ITEMS[0], ITEMS[1], ITEMS[3]],
      expect.objectContaining({type: 'add'}),
    );
    await waitFor(() =>
      expect(screen.getByRole('checkbox', {name: 'Energizer'})).toBeChecked(),
    );
    expect(checkboxLabels()).toEqual([
      'Design',
      'Eng',
      'Engineer',
      'Energizer',
    ]);

    fireEvent.click(screen.getByRole('checkbox', {name: 'Eng'}));
    expect(spy).toHaveBeenLastCalledWith(
      [ITEMS[0], ITEMS[3]],
      expect.objectContaining({type: 'remove'}),
    );
    expect(checkboxLabels()).toEqual([
      'Design',
      'Eng',
      'Engineer',
      'Energizer',
    ]);

    fireEvent.click(screen.getByRole('button', {name: 'Done'}));
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await act(async () => {
      fireEvent.click(trigger);
    });
    expect(checkboxLabels()).toEqual([
      'Design',
      'Energizer',
      'Eng',
      'Engineer',
    ]);
  });

  it('announces additions, removals, and the busy start inside the open modal sheet, not on the page body (AR6; AST-086 FR14)', async () => {
    // jsdom has no showModal(), so an open dialog never matches `:modal`;
    // stand in for the sheet the browser presents modally.
    const matches = Element.prototype.matches;
    const spy = vi
      .spyOn(Element.prototype, 'matches')
      .mockImplementation(function (this: Element, selector: string) {
        return selector === ':modal'
          ? this instanceof HTMLDialogElement && this.open
          : matches.call(this, selector);
      });
    try {
      // A real debounce, so a typed query has a busy window to announce.
      render(<Harness debounceMs={50} />);
      fireEvent.click(openTrigger());
      const dialog = await screen.findByRole('dialog', {name: 'Tags'});
      const region = () =>
        dialog.querySelector(
          ':scope > [data-astryx-modal-live-region="polite"]',
        );
      const shared = () =>
        document.querySelector('[data-astryx-live-region="polite"]');
      // An instant bootstrap announces no busy start; a debounced typed
      // query does, in the sheet, before its results land.
      await screen.findByRole('checkbox', {name: 'Energizer'});
      expect(region()).toBeNull();
      fireEvent.change(screen.getByLabelText('Search Tags'), {
        target: {value: 'E'},
      });
      await waitFor(() => expect(region()).toHaveTextContent('Loading'));
      fireEvent.change(screen.getByLabelText('Search Tags'), {
        target: {value: ''},
      });
      fireEvent.click(await screen.findByRole('checkbox', {name: 'Energizer'}));
      await waitFor(() =>
        expect(region()).toHaveTextContent('Added Energizer'),
      );
      expect(region()).toHaveAttribute('role', 'status');
      expect(dialog.contains(region())).toBe(true);
      expect(shared()?.textContent ?? '').toBe('');
      fireEvent.click(screen.getByRole('checkbox', {name: 'Design'}));
      await waitFor(() => expect(region()).toHaveTextContent('Removed Design'));
      expect(shared()?.textContent ?? '').toBe('');
      // How a search ended: the result count for a typed query …
      fireEvent.change(screen.getByLabelText('Search Tags'), {
        target: {value: 'En'},
      });
      await waitFor(() => expect(region()).toHaveTextContent('3 results'));
      // … and the empty state's words when it shows.
      fireEvent.change(screen.getByLabelText('Search Tags'), {
        target: {value: 'zzz'},
      });
      await waitFor(() =>
        expect(region()).toHaveTextContent('No results found'),
      );
      expect(shared()?.textContent ?? '').toBe('');
    } finally {
      spy.mockRestore();
    }
  });

  it('keeps the inline popover presentation on the shared live region', async () => {
    render(
      <Tokenizer
        label="Tags"
        searchSource={source}
        value={[ITEMS[0], ITEMS[1]]}
        onChange={() => {}}
        debounceMs={0}
      />,
    );
    // Backspace on the empty input removes the last token through the
    // same path the sheet's rows use.
    const input = screen.getByRole('combobox');
    input.focus();
    fireEvent.keyDown(input, {key: 'Backspace'});
    await waitFor(() =>
      expect(
        document.querySelector('[data-astryx-live-region="polite"]'),
      ).toHaveTextContent('Removed Eng'),
    );
    expect(
      document.querySelector('[data-astryx-modal-live-region]'),
    ).toBeNull();
  });

  it('creates a custom entry with a trailing Add action and announces the created value (FR22)', async () => {
    // jsdom has no showModal(); stand in for the sheet presented modally so
    // the announcement takes the in-dialog route.
    const matches = Element.prototype.matches;
    const modalSpy = vi
      .spyOn(Element.prototype, 'matches')
      .mockImplementation(function (this: Element, selector: string) {
        return selector === ':modal'
          ? this instanceof HTMLDialogElement && this.open
          : matches.call(this, selector);
      });
    try {
      const spy = vi.fn();
      render(<Harness spy={spy} hasCreate initial={[]} />);
      const trigger = openTrigger();
      fireEvent.click(trigger);
      const search = await screen.findByLabelText('Search Tags');
      fireEvent.change(search, {target: {value: 'Custom'}});

      expect(
        screen.queryByRole('checkbox', {name: 'Create "Custom"'}),
      ).not.toBeInTheDocument();
      const create = await screen.findByRole('button', {name: 'Add Custom'});
      expect(
        screen.queryByRole('button', {name: 'Clear all'}),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', {name: 'Done'}),
      ).not.toBeInTheDocument();
      expect(create).toHaveAttribute('data-size', 'lg');
      expect(screen.getByText('Create "Custom"')).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(create);
      });
      expect(spy).toHaveBeenCalledWith(
        [{id: 'Custom', label: 'Custom'}],
        expect.objectContaining({type: 'create'}),
      );
      await waitFor(() => expect(trigger).toHaveTextContent('Custom'));
      expect(search).toHaveValue('');
      const custom = await screen.findByRole('checkbox', {name: 'Custom'});
      expect(custom).toBeChecked();
      // Announced inside the sheet as the created value, not the row's
      // caption ("Create …"), as the inline field announces it.
      const dialog = screen.getByRole('dialog', {name: 'Tags'});
      await waitFor(() =>
        expect(
          dialog.querySelector(
            ':scope > [data-astryx-modal-live-region="polite"]',
          ),
        ).toHaveTextContent('Added Custom'),
      );
      expect(
        dialog.querySelector(
          ':scope > [data-astryx-modal-live-region="polite"]',
        ),
      ).not.toHaveTextContent('Create');
    } finally {
      modalSpy.mockRestore();
    }
  });
  it('offers no create row for text that matches a selected label or a result', async () => {
    render(<Harness hasCreate />);
    fireEvent.click(openTrigger());
    const search = await screen.findByLabelText('Search Tags');
    fireEvent.change(search, {target: {value: 'design'}});
    await screen.findByRole('checkbox', {name: 'Design'});
    expect(
      screen.queryByRole('button', {name: /^Add /}),
    ).not.toBeInTheDocument();
    fireEvent.change(search, {target: {value: 'ENGINEER'}});
    await screen.findByRole('checkbox', {name: 'Engineer'});
    expect(
      screen.queryByRole('button', {name: /^Add /}),
    ).not.toBeInTheDocument();
  });

  it('renders long lists in 50-item batches and resets the window for search (FR21)', async () => {
    const longItems: SearchableItem[] = Array.from(
      {length: 120},
      (_, index) => ({
        id: `item-${index + 1}`,
        label: `Item ${String(index + 1).padStart(3, '0')}`,
      }),
    );
    const longSource: SearchSource<SearchableItem> = {
      bootstrap: () => longItems,
      search: query =>
        longItems.filter(item =>
          item.label.toLowerCase().includes(query.toLowerCase()),
        ),
    };
    render(
      <Tokenizer
        label="Items"
        searchSource={longSource}
        value={[]}
        onChange={() => {}}
        maxMenuItems={120}
        debounceMs={0}
        experimental={{presentation: 'bottom-sheet'}}
      />,
    );
    fireEvent.click(screen.getByRole('button', {name: 'Items'}));
    await screen.findByRole('checkbox', {name: 'Item 001'});
    const items = list();
    await waitFor(() => {
      expect(items).toHaveAttribute('data-rendered-count', '50');
      expect(items).toHaveAttribute('data-total-count', '120');
    });
    expect(screen.getAllByRole('checkbox')).toHaveLength(50);
    expect(
      screen.queryByRole('checkbox', {name: 'Item 051'}),
    ).not.toBeInTheDocument();
    // Every row's listitem names its place in the whole set, not the
    // rendered window; `checkbox` does not admit the position attributes,
    // so they sit on the listitem that wraps each row.
    const rowList = within(items).getByRole('list');
    const listItems = within(rowList).getAllByRole('listitem');
    expect(listItems).toHaveLength(50);
    expect(listItems[0]).toHaveAttribute('aria-setsize', '120');
    expect(listItems[0]).toHaveAttribute('aria-posinset', '1');
    expect(
      within(listItems[0]).getByRole('checkbox', {name: 'Item 001'}),
    ).toBeInTheDocument();
    expect(listItems[49]).toHaveAttribute('aria-setsize', '120');
    expect(listItems[49]).toHaveAttribute('aria-posinset', '50');
    const first = screen.getByRole('checkbox', {name: 'Item 001'});
    expect(first).not.toHaveAttribute('aria-setsize');
    expect(first).not.toHaveAttribute('aria-posinset');
    const fiftieth = screen.getByRole('checkbox', {name: 'Item 050'});
    // Focus reaching the last rendered row renders the next batch, so a
    // keyboard user reaches every row without scrolling.
    fiftieth.focus();
    await waitFor(() =>
      expect(items).toHaveAttribute('data-rendered-count', '100'),
    );
    expect(
      screen
        .getByRole('checkbox', {name: 'Item 051'})
        .closest('[role="listitem"]'),
    ).toHaveAttribute('aria-posinset', '51');
    screen.getByRole('checkbox', {name: 'Item 100'}).focus();
    await waitFor(() =>
      expect(items).toHaveAttribute('data-rendered-count', '120'),
    );
    // The window is back to one batch for the scroll part of the test.
    fireEvent.change(screen.getByLabelText('Search Items'), {
      target: {value: 'Item'},
    });
    await waitFor(() =>
      expect(items).toHaveAttribute('data-rendered-count', '50'),
    );
    fireEvent.change(screen.getByLabelText('Search Items'), {
      target: {value: ''},
    });
    await waitFor(() =>
      expect(items).toHaveAttribute('data-rendered-count', '50'),
    );

    Object.defineProperties(items, {
      clientHeight: {configurable: true, value: 600},
      scrollHeight: {configurable: true, value: 2400},
      scrollTop: {configurable: true, value: 1700, writable: true},
    });
    fireEvent.scroll(items);
    expect(items).toHaveAttribute('data-rendered-count', '100');
    expect(screen.getAllByRole('checkbox')).toHaveLength(100);
    expect(
      screen.getByRole('checkbox', {name: 'Item 100'}),
    ).toBeInTheDocument();

    Object.defineProperties(items, {
      scrollHeight: {configurable: true, value: 4400},
      scrollTop: {configurable: true, value: 3600, writable: true},
    });
    fireEvent.scroll(items);
    expect(items).toHaveAttribute('data-rendered-count', '120');
    expect(screen.getAllByRole('checkbox')).toHaveLength(120);

    fireEvent.change(screen.getByLabelText('Search Items'), {
      target: {value: 'Item'},
    });
    await waitFor(() =>
      expect(items).toHaveAttribute('data-rendered-count', '50'),
    );
    expect(screen.getAllByRole('checkbox')).toHaveLength(50);

    fireEvent.scroll(items);
    expect(items).toHaveAttribute('data-rendered-count', '100');
    expect(screen.getAllByRole('checkbox')).toHaveLength(100);
  });

  it('searches within the same sheet and shows the no-results state (FR18, FR20)', async () => {
    const onChangeQuery = vi.fn();
    const {rerender} = render(
      <Tokenizer
        label="Tags"
        searchSource={source}
        value={[ITEMS[0]]}
        onChange={() => {}}
        debounceMs={0}
        onChangeQuery={onChangeQuery}
        experimental={{presentation: 'bottom-sheet'}}
      />,
    );
    fireEvent.click(openTrigger());
    const search = await screen.findByLabelText('Search Tags');
    fireEvent.change(search, {target: {value: 'zzz'}});
    expect(onChangeQuery).toHaveBeenCalledWith('zzz');

    const title = await screen.findByRole('heading', {
      name: 'No results found',
    });
    const emptyState = title.closest('[role="status"]');
    expect(emptyState).toHaveTextContent('Try a different search.');
    expect(emptyState?.querySelector('.astryx-icon')).toHaveAttribute(
      'data-size',
      'lg',
    );
    // Only one dialog: the sheet searches in place (FR18).
    expect(screen.getAllByRole('dialog')).toHaveLength(1);

    // A string emptySearchText becomes the empty state's title.
    rerender(
      <Tokenizer
        label="Tags"
        searchSource={source}
        value={[ITEMS[0]]}
        onChange={() => {}}
        debounceMs={0}
        emptySearchText="Nothing here"
        experimental={{presentation: 'bottom-sheet'}}
      />,
    );
    expect(
      await screen.findByRole('heading', {name: 'Nothing here'}),
    ).toBeInTheDocument();
  });

  it('shows the no-items state for an empty source (FR20)', async () => {
    const emptySource: SearchSource<SearchableItem> = {
      search: () => [],
      bootstrap: () => [],
    };
    render(
      <Tokenizer
        label="Tags"
        searchSource={emptySource}
        value={[]}
        onChange={() => {}}
        debounceMs={0}
        experimental={{presentation: 'bottom-sheet'}}
      />,
    );
    fireEvent.click(openTrigger());
    expect(
      await screen.findByRole('heading', {name: 'No items available'}),
    ).toBeInTheDocument();
    expect(
      screen.getByText('There are no items to choose from.'),
    ).toBeInTheDocument();
  });

  it('keeps large equal-width Clear all and Done footer actions while guarding the bulk clear (FR24)', async () => {
    const spy = vi.fn();
    render(<Harness spy={spy} />);
    fireEvent.click(openTrigger());
    await screen.findByRole('checkbox', {name: 'Energizer'});

    const clearAll = screen.getByRole('button', {name: 'Clear all'});
    const done = screen.getByRole('button', {name: 'Done'});
    expect(clearAll).toHaveAttribute('data-size', 'lg');
    expect(clearAll).toHaveAttribute('data-variant', 'secondary');
    expect(done).toHaveAttribute('data-size', 'lg');
    expect(list().compareDocumentPosition(clearAll)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(list().compareDocumentPosition(done)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    fireEvent.click(clearAll);
    const confirmation = screen.getByRole('alertdialog');
    expect(confirmation).toHaveTextContent('Clear all selected items?');
    expect(confirmation).toHaveTextContent(
      'This removes all selected items from Tags.',
    );
    expect(spy).not.toHaveBeenCalled();
    fireEvent.click(
      within(confirmation).getByRole('button', {name: 'Clear selection'}),
    );
    expect(spy).toHaveBeenLastCalledWith(
      [],
      expect.objectContaining({type: 'remove', item: ITEMS[1]}),
    );
    await waitFor(() =>
      expect(screen.getByRole('button', {name: 'Clear all'})).toBeDisabled(),
    );
  });

  it('keeps a disabled trigger focusable without opening the sheet (FR17; AST-085 FR1, FR2)', () => {
    render(<Harness isDisabled initial={[ITEMS[0]]} />);
    const trigger = openTrigger();
    expect(trigger).not.toHaveAttribute('disabled');
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    trigger.focus();
    expect(trigger).toHaveFocus();
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    // A field disabled from the start mounts no sheet at all.
    expect(document.querySelector('dialog')).toBeNull();
    expect(document.querySelector('[data-total-count]')).toBeNull();
  });

  it('moves focus to the search field after a confirmed Clear all, since Clear all is disabled by then (FR24; AST-085 FR4)', async () => {
    render(<Harness />);
    fireEvent.click(openTrigger());
    await screen.findByRole('dialog', {name: 'Tags'});
    const clearAll = screen.getByRole('button', {name: 'Clear all'});
    clearAll.focus();
    fireEvent.click(clearAll);
    const confirmation = await screen.findByRole('alertdialog');
    fireEvent.click(
      within(confirmation).getByRole('button', {name: 'Clear selection'}),
    );
    await waitFor(() =>
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('button', {name: 'Clear all'})).toBeDisabled();
    expect(screen.getByLabelText('Search Tags')).toHaveFocus();
    expect(document.activeElement).not.toBe(document.body);
  });

  it('announces the rows it lists, not the source count: a created value and a maxMenuItems cap (FR20; AR6)', async () => {
    const matches = Element.prototype.matches;
    const modalSpy = vi
      .spyOn(Element.prototype, 'matches')
      .mockImplementation(function (this: Element, selector: string) {
        return selector === ':modal'
          ? this instanceof HTMLDialogElement && this.open
          : matches.call(this, selector);
      });
    try {
      // "Enzo" is a created value the source never returns; the source has
      // three "en" matches (Eng, Engineer, Energizer), capped to two rows.
      render(
        <Tokenizer
          label="Tags"
          searchSource={source}
          value={[{id: 'Enzo', label: 'Enzo'}]}
          onChange={() => {}}
          debounceMs={0}
          maxMenuItems={2}
          hasCreate
          experimental={{presentation: 'bottom-sheet'}}
        />,
      );
      fireEvent.click(openTrigger());
      const dialog = await screen.findByRole('dialog', {name: 'Tags'});
      const region = () =>
        dialog.querySelector(
          ':scope > [data-astryx-modal-live-region="polite"]',
        );
      // Part of the created value: the source returns nothing, but the
      // checked row for Enzo is listed — "1 result", not "0 results".
      fireEvent.change(screen.getByLabelText('Search Tags'), {
        target: {value: 'enz'},
      });
      await screen.findByRole('checkbox', {name: 'Enzo'});
      await waitFor(() => expect(region()).toHaveTextContent('1 result'));
      expect(region()).not.toHaveTextContent('0 results');
      // A query the cap applies to: the source has three matches, capped to
      // two rows, plus the created value's checked row — three rows listed,
      // three announced (the source count would say two, or three uncapped).
      fireEvent.change(screen.getByLabelText('Search Tags'), {
        target: {value: 'en'},
      });
      await waitFor(() => expect(region()).toHaveTextContent('3 results'));
      expect(screen.getAllByRole('checkbox')).toHaveLength(3);
      expect(
        screen.queryByRole('checkbox', {name: 'Energizer'}),
      ).not.toBeInTheDocument();
    } finally {
      modalSpy.mockRestore();
    }
  });

  it('announces a confirmed Clear all inside the sheet (AR6; AST-086 FR14)', async () => {
    // jsdom has no showModal(); stand in for the sheet presented modally so
    // the announcement takes the in-dialog route.
    const matches = Element.prototype.matches;
    const modalSpy = vi
      .spyOn(Element.prototype, 'matches')
      .mockImplementation(function (this: Element, selector: string) {
        return selector === ':modal'
          ? this instanceof HTMLDialogElement && this.open
          : matches.call(this, selector);
      });
    try {
      render(<Harness />);
      fireEvent.click(openTrigger());
      const dialog = await screen.findByRole('dialog', {name: 'Tags'});
      fireEvent.click(screen.getByRole('button', {name: 'Clear all'}));
      const confirmation = await screen.findByRole('alertdialog');
      fireEvent.click(
        within(confirmation).getByRole('button', {name: 'Clear selection'}),
      );
      await waitFor(() =>
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument(),
      );
      await waitFor(() =>
        expect(
          dialog.querySelector(
            ':scope > [data-astryx-modal-live-region="polite"]',
          ),
        ).toHaveTextContent('All items removed'),
      );
    } finally {
      modalSpy.mockRestore();
    }
  });

  it('keeps and does not report the query when the field is disabled while the sheet is open (FR18)', async () => {
    const onChangeQuery = vi.fn();
    const props = {
      label: 'Tags',
      searchSource: source,
      value: [ITEMS[0]],
      onChange: () => {},
      onChangeQuery,
      debounceMs: 0,
      experimental: {presentation: 'bottom-sheet' as const},
    };
    const {rerender} = render(<Tokenizer {...props} />);
    fireEvent.click(openTrigger());
    await screen.findByRole('dialog', {name: 'Tags'});
    fireEvent.change(screen.getByLabelText('Search Tags'), {
      target: {value: 'En'},
    });
    onChangeQuery.mockClear();
    rerender(<Tokenizer {...props} isDisabled />);
    fireEvent.transitionEnd(document.querySelector('.astryx-bottom-sheet')!, {
      propertyName: 'transform',
    });
    // Nothing the person did changed the query, so nothing is reported, and
    // the caller's mirror and the sheet agree on the next open.
    expect(onChangeQuery).not.toHaveBeenCalled();
    rerender(<Tokenizer {...props} />);
    fireEvent.click(openTrigger());
    await screen.findByRole('dialog', {name: 'Tags'});
    expect(screen.getByLabelText('Search Tags')).toHaveValue('En');
    expect(onChangeQuery).not.toHaveBeenCalled();
  });

  it('closes the sheet and returns focus to the trigger when the field becomes disabled (FR17; AST-085 FR2)', async () => {
    const {rerender} = render(
      <Tokenizer
        label="Tags"
        searchSource={source}
        value={[ITEMS[0]]}
        onChange={() => {}}
        debounceMs={0}
        experimental={{presentation: 'bottom-sheet'}}
      />,
    );
    const trigger = openTrigger();
    fireEvent.click(trigger);
    const dialog = await screen.findByRole('dialog', {name: 'Tags'});
    const search = screen.getByLabelText('Search Tags');
    search.focus();
    expect(search).toHaveFocus();

    rerender(
      <Tokenizer
        label="Tags"
        searchSource={source}
        value={[ITEMS[0]]}
        onChange={() => {}}
        debounceMs={0}
        isDisabled
        experimental={{presentation: 'bottom-sheet'}}
      />,
    );
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(dialog).toHaveAttribute('aria-hidden', 'true');
    // BottomSheet hands focus back after its exit motion.
    fireEvent.transitionEnd(document.querySelector('.astryx-bottom-sheet')!, {
      propertyName: 'transform',
    });
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    // Re-enabling does not reopen it.
    rerender(
      <Tokenizer
        label="Tags"
        searchSource={source}
        value={[ITEMS[0]]}
        onChange={() => {}}
        debounceMs={0}
        experimental={{presentation: 'bottom-sheet'}}
      />,
    );
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('describes the trigger with the selected token labels for assistive technology (AR6; AST-020 FR1)', () => {
    const {unmount} = render(<Harness />);
    const trigger = openTrigger();
    expect(trigger).toHaveAccessibleName('Tags');
    // A catalog count, then each label; the separator is the accessible-name
    // algorithm's, not a literal (i18n INV1a).
    expect(trigger).toHaveAccessibleDescription('2 selected Design Eng');
    unmount();
    render(<Harness initial={[]} />);
    expect(openTrigger()).not.toHaveAttribute('aria-describedby');
  });

  it('sends base props and ref to the trigger in the sheet presentation (FR10, INV8)', () => {
    const ref = createRef<HTMLInputElement>();
    const onFocus = vi.fn();
    const onKeyDown = vi.fn();
    render(
      <Tokenizer
        label="Tags"
        searchSource={source}
        value={[ITEMS[0]]}
        onChange={() => {}}
        id="tags-field"
        data-testid="tags"
        aria-describedby="hint"
        description="Pick some"
        ref={ref}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        experimental={{presentation: 'bottom-sheet'}}
      />,
    );
    const trigger = openTrigger();
    expect(trigger).toHaveAttribute('id', 'tags-field');
    expect(trigger).toHaveAttribute('data-testid', 'tags');
    expect(trigger.getAttribute('aria-describedby')).toContain('hint');
    expect(trigger).toHaveAccessibleDescription(/Pick some/);
    expect(ref.current).toBe(trigger);
    // The label points at the trigger.
    expect(screen.getByText('Tags', {selector: 'label'})).toHaveAttribute(
      'for',
      'tags-field',
    );
    fireEvent.focus(trigger);
    expect(onFocus).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(trigger, {key: 'ArrowDown'});
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });

  it('treats the sheet as part of the field: no onBlur on open, no onFocus on return, both on a real exit (FR10)', async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(
      <>
        <Tokenizer
          label="Tags"
          searchSource={source}
          value={[ITEMS[0]]}
          onChange={() => {}}
          debounceMs={0}
          onFocus={onFocus}
          onBlur={onBlur}
          experimental={{presentation: 'bottom-sheet'}}
        />
        <button type="button">Elsewhere</button>
      </>,
    );
    const trigger = openTrigger();
    // Entering the field from outside reports once.
    trigger.focus();
    expect(onFocus).toHaveBeenCalledTimes(1);
    // Open: focus moves into the field's own sheet, not out of the field.
    fireEvent.click(trigger);
    await screen.findByRole('dialog', {name: 'Tags'});
    screen.getByLabelText('Search Tags').focus();
    expect(onBlur).not.toHaveBeenCalled();
    // Done: focus returns from the sheet, not from outside.
    fireEvent.click(screen.getByRole('button', {name: 'Done'}));
    fireEvent.transitionEnd(document.querySelector('.astryx-bottom-sheet')!, {
      propertyName: 'transform',
    });
    expect(trigger).toHaveFocus();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).not.toHaveBeenCalled();
    // A real exit, from the trigger to elsewhere, reports.
    screen.getByRole('button', {name: 'Elsewhere'}).focus();
    expect(onBlur).toHaveBeenCalledTimes(1);
    // And a second open-and-close cycle from outside reports the entry once.
    trigger.focus();
    expect(onFocus).toHaveBeenCalledTimes(2);
    fireEvent.click(trigger);
    await screen.findByRole('dialog', {name: 'Tags'});
    fireEvent.click(screen.getByRole('button', {name: 'Done'}));
    fireEvent.transitionEnd(document.querySelector('.astryx-bottom-sheet')!, {
      propertyName: 'transform',
    });
    expect(onFocus).toHaveBeenCalledTimes(2);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('reports the entry on the return focus when the open came from a click that did not focus the trigger (Safari), so onBlur never comes alone (FR10)', async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(
      <>
        <Tokenizer
          label="Tags"
          searchSource={source}
          value={[ITEMS[0]]}
          onChange={() => {}}
          debounceMs={0}
          onFocus={onFocus}
          onBlur={onBlur}
          experimental={{presentation: 'bottom-sheet'}}
        />
        <button type="button">Elsewhere</button>
      </>,
    );
    const trigger = openTrigger();
    // A click with no focus first, as Safari delivers a pointer press on a
    // button: no entry has been reported when the sheet opens.
    fireEvent.click(trigger);
    await screen.findByRole('dialog', {name: 'Tags'});
    expect(onFocus).not.toHaveBeenCalled();
    expect(onBlur).not.toHaveBeenCalled();
    // Done: BottomSheet's return focus is the one focus the trigger gets in
    // this visit, so it is the entry, and is reported.
    fireEvent.click(screen.getByRole('button', {name: 'Done'}));
    fireEvent.transitionEnd(document.querySelector('.astryx-bottom-sheet')!, {
      propertyName: 'transform',
    });
    expect(trigger).toHaveFocus();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).not.toHaveBeenCalled();
    // Leaving reports the exit: one onFocus, one onBlur.
    screen.getByRole('button', {name: 'Elsewhere'}).focus();
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it('runs the open first and then the caller onClick, which cannot cancel it (FR10)', async () => {
    const order: string[] = [];
    const onClick = vi.fn((event: React.MouseEvent) => {
      order.push(
        (event.currentTarget as HTMLElement).getAttribute('aria-expanded') ??
          '',
      );
      event.preventDefault();
    });
    render(
      <Tokenizer
        label="Tags"
        searchSource={source}
        value={[ITEMS[0]]}
        onChange={() => {}}
        debounceMs={0}
        onClick={onClick}
        experimental={{presentation: 'bottom-sheet'}}
      />,
    );
    const trigger = openTrigger();
    fireEvent.click(trigger);
    expect(onClick).toHaveBeenCalledTimes(1);
    // The caller's preventDefault() does not keep the sheet closed, as the
    // inline field's own click handling runs first and is not cancelable.
    expect(
      await screen.findByRole('dialog', {name: 'Tags'}),
    ).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // The caller saw the click on the trigger (its pre-open state in the same
    // event, since the open commits after the handler).
    expect(order).toEqual(['false']);
  });

  it('warns once in development about props with no sheet surface (INV3)', () => {
    __resetDevWarnings();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const {rerender} = render(
      <Tokenizer
        label="Tags"
        searchSource={source}
        value={[ITEMS[0]]}
        onChange={() => {}}
        hasClear
        menuWidth={320}
        experimental={{presentation: 'bottom-sheet'}}
      />,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(/Tokenizer/);
    expect(warn.mock.calls[0][0]).toMatch(/`hasClear`, `menuWidth`/);
    expect(warn.mock.calls[0][0]).toMatch(/bottom-sheet presentation/);
    rerender(
      <Tokenizer
        label="Tags"
        searchSource={source}
        value={[ITEMS[0], ITEMS[1]]}
        onChange={() => {}}
        hasClear
        menuWidth={320}
        experimental={{presentation: 'bottom-sheet'}}
      />,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockClear();
    render(
      <Tokenizer
        label="Other"
        searchSource={source}
        value={[]}
        onChange={() => {}}
        hasClear
        menuWidth={320}
      />,
    );
    // The inline presentation renders them, so nothing to say.
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('is busy, not empty, from open and from each query change until the search settles (FR20)', async () => {
    vi.useFakeTimers();
    try {
      const slow: SearchSource<SearchableItem> = {
        bootstrap: async () =>
          new Promise(resolve => setTimeout(() => resolve(ITEMS), 50)),
        search: async q =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve(
                  ITEMS.filter(item =>
                    item.label.toLowerCase().includes(q.toLowerCase()),
                  ),
                ),
              50,
            ),
          ),
      };
      // Default debounceMs (150), so the debounce window is under test too.
      // hasCreate, so the create row's timing is under test as well.
      render(
        <Tokenizer
          label="Tags"
          searchSource={slow}
          value={[]}
          onChange={() => {}}
          hasCreate
          experimental={{presentation: 'bottom-sheet'}}
        />,
      );
      fireEvent.click(openTrigger());
      const list = () => document.querySelector('[data-total-count]')!;
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
      expect(list()).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByRole('img', {name: 'Loading'})).toBeInTheDocument();
      expect(
        screen.queryByRole('heading', {name: 'No items available'}),
      ).not.toBeInTheDocument();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(250);
      });
      expect(list()).not.toHaveAttribute('aria-busy');
      expect(
        screen.getByRole('checkbox', {name: 'Design'}),
      ).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText('Search Tags'), {
        target: {value: 'zzz'},
      });
      // Inside the debounce window: busy, no "No results found", no create
      // row (the previous query's results cannot judge a duplicate), and the
      // named Loading row sits above the rows still listed from before, so
      // the person sees that those rows are not the answer yet.
      expect(
        screen.queryByRole('button', {name: /^Add /}),
      ).not.toBeInTheDocument();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });
      expect(list()).toHaveAttribute('aria-busy', 'true');
      const loading = screen.getByRole('img', {name: 'Loading'});
      const staleRow = screen.getByRole('checkbox', {name: 'Design'});
      expect(staleRow).toBeInTheDocument();
      expect(loading.compareDocumentPosition(staleRow)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
      expect(
        screen.queryByRole('heading', {name: 'No results found'}),
      ).not.toBeInTheDocument();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(200);
      });
      expect(list()).not.toHaveAttribute('aria-busy');
      // Settled with no match: the create row is offered now, against this
      // query's own results, and no empty state shows beside it.
      expect(screen.getByRole('button', {name: 'Add zzz'})).toBeInTheDocument();
      expect(
        screen.queryByRole('heading', {name: 'No results found'}),
      ).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('describes a disabled trigger with disabledMessage', async () => {
    render(
      <Harness isDisabled disabledMessage="Pick a team first" initial={[]} />,
    );
    const trigger = openTrigger();
    fireEvent.focus(trigger);
    expect(await screen.findByText('Pick a team first')).toBeInTheDocument();
  });

  it('keeps an unselectable row at the limit focusable but inert (FR23; AST-085 FR1, FR2)', async () => {
    const spy = vi.fn();
    render(<Harness spy={spy} initial={[ITEMS[0]]} maxEntries={1} />);
    fireEvent.click(openTrigger());
    const row = await screen.findByRole('checkbox', {name: 'Energizer'});
    expect(row).not.toHaveAttribute('disabled');
    expect(row).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(row);
    expect(spy).not.toHaveBeenCalled();
    expect(row).toHaveAttribute('aria-checked', 'false');
    // In forced colors its indicator border takes GrayText (AST-085 FR6).
    const indicatorClasses = stylex
      .props(
        stylex.create({
          indicatorBorder: {
            borderColor: {
              default: colorVars['--color-border'],
              '@media (forced-colors: active)': 'GrayText',
            },
          },
        }).indicatorBorder,
      )
      .className!.split(' ')
      .filter(name => !name.includes('__'));
    const indicator = row.querySelector('.astryx-checkbox-indicator')!;
    for (const name of indicatorClasses) {
      expect(indicator).toHaveClass(name);
    }
    // The checked row still toggles, making room (FR23).
    fireEvent.click(screen.getByRole('checkbox', {name: 'Design'}));
    expect(spy).toHaveBeenLastCalledWith(
      [],
      expect.objectContaining({type: 'remove'}),
    );
  });

  it('paints a disabled trigger, its placeholder, and its tokens GrayText in forced colors (AST-085 FR6)', () => {
    const atoms = (style: stylex.StyleXStyles) =>
      stylex
        .props(style)
        .className!.split(' ')
        .filter(name => !name.includes('__'));
    const forced = stylex.create({
      trigger: {
        borderColor: {
          default: colorVars['--color-border-emphasized'],
          '@media (forced-colors: active)': 'GrayText',
        },
        color: {default: null, '@media (forced-colors: active)': 'GrayText'},
      },
      token: {
        color: {
          default: colorVars['--color-text-primary'],
          '@media (forced-colors: active)': 'GrayText',
        },
      },
      placeholder: {
        color: {
          default: colorVars['--color-text-secondary'],
          '@media (forced-colors: active)': 'GrayText',
        },
      },
    });
    const {unmount} = render(<Harness isDisabled />);
    const trigger = openTrigger();
    for (const name of atoms(forced.trigger)) {
      expect(trigger).toHaveClass(name);
    }
    const tokens = trigger.querySelectorAll('.astryx-token');
    expect(tokens).toHaveLength(2);
    for (const token of tokens) {
      for (const name of atoms(forced.token)) {
        expect(token).toHaveClass(name);
      }
    }
    unmount();
    render(<Harness isDisabled initial={[]} />);
    const placeholder = screen.getByText('Add tags');
    for (const name of atoms(forced.placeholder)) {
      expect(placeholder).toHaveClass(name);
    }
  });

  it('renders a row without its action and warns once in development (FR19; AST-058 FR9)', async () => {
    __resetDevWarnings();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const withAction: SearchSource<SearchableItem> = {
      search: () => [],
      bootstrap: () => [
        {
          id: 'design',
          label: 'Design',
          action: <button type="button">Go</button>,
        },
        {id: 'eng', label: 'Eng'},
      ],
    };
    render(
      <Tokenizer
        label="Tags"
        searchSource={withAction}
        value={[]}
        onChange={() => {}}
        debounceMs={0}
        experimental={{presentation: 'bottom-sheet'}}
      />,
    );
    fireEvent.click(openTrigger());
    const row = await screen.findByRole('checkbox', {name: 'Design'});
    expect(within(row).queryByRole('button')).not.toBeInTheDocument();
    await waitFor(() => expect(warn).toHaveBeenCalledTimes(1));
    expect(warn.mock.calls[0][0]).toMatch(/`action`/);
    expect(warn.mock.calls[0][0]).toMatch(/bottom-sheet rows/);
    warn.mockRestore();
  });

  it('keeps focus when adaptive stops resolving to the sheet while it is open (FR16)', async () => {
    // A matchMedia stub whose match can flip, with a change listener the
    // test fires, as a phone turned to landscape would.
    let compact = true;
    const listeners = new Set<() => void>();
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        get matches() {
          return query === COMPACT_TOUCH_QUERY ? compact : false;
        },
        media: query,
        onchange: null,
        addEventListener: (_: string, cb: () => void) => listeners.add(cb),
        removeEventListener: (_: string, cb: () => void) =>
          listeners.delete(cb),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
    render(<Harness presentation="adaptive" />);
    const trigger = openTrigger();
    fireEvent.click(trigger);
    const dialog = await screen.findByRole('dialog', {name: 'Tags'});
    screen.getByLabelText('Search Tags').focus();

    // The viewport stops being compact while the sheet is open: nothing
    // changes until the sheet closes.
    compact = false;
    act(() => {
      for (const cb of listeners) cb();
    });
    expect(screen.getByRole('dialog', {name: 'Tags'})).toBe(dialog);
    expect(trigger).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Done'}));
    // The sheet is closing; the trigger stays mounted to take focus back,
    // and the inline input does not appear yet.
    expect(trigger).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    fireEvent.transitionEnd(document.querySelector('.astryx-bottom-sheet')!, {
      propertyName: 'transform',
    });
    // Focus came back to the trigger, the latch released into the popover
    // presentation, and the inline input took the focus over.
    await waitFor(() =>
      expect(screen.getByRole('combobox')).toBeInTheDocument(),
    );
    expect(screen.getByRole('combobox')).toHaveFocus();
    expect(
      screen.queryByRole('button', {name: 'Tags'}),
    ).not.toBeInTheDocument();
  });

  it('types ref for the control it reaches: the input without experimental, input or trigger with it', () => {
    const inputRef = createRef<HTMLInputElement>();
    const {unmount} = render(
      <Tokenizer
        label="Tags"
        searchSource={source}
        value={[]}
        onChange={() => {}}
        ref={inputRef}
      />,
    );
    expect(inputRef.current).toBe(screen.getByRole('combobox'));
    unmount();
    const wideRef = createRef<HTMLInputElement | HTMLButtonElement>();
    const {rerender} = render(
      <Tokenizer
        label="Tags"
        searchSource={source}
        value={[]}
        onChange={() => {}}
        ref={wideRef}
        experimental={{presentation: 'popover'}}
      />,
    );
    expect(wideRef.current).toBe(screen.getByRole('combobox'));
    rerender(
      <Tokenizer
        label="Tags"
        searchSource={source}
        value={[]}
        onChange={() => {}}
        ref={wideRef}
        experimental={{presentation: 'bottom-sheet'}}
      />,
    );
    expect(wideRef.current).toBe(openTrigger());
  });

  it('does not search, wait, empty out, or announce for a query below minQueryLength (FR20)', async () => {
    const search = vi.fn(source.search);
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Tokenizer
        label="Tags"
        searchSource={{...source, search}}
        value={[ITEMS[0]]}
        onChange={() => {}}
        debounceMs={0}
        minQueryLength={3}
        hasCreate
        experimental={{presentation: 'bottom-sheet'}}
      />,
    );
    fireEvent.click(openTrigger());
    await screen.findByRole('checkbox', {name: 'Eng'});
    search.mockClear();
    fireEvent.change(screen.getByLabelText('Search Tags'), {
      target: {value: 'De'},
    });
    // Only the selected row it matches, and the create row; nothing searched,
    // nothing pending, no empty state.
    expect(screen.getByRole('checkbox', {name: 'Design'})).toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', {name: 'Eng'}),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Add De'})).toBeInTheDocument();
    expect(list()).not.toHaveAttribute('aria-busy');
    expect(
      screen.queryByRole('img', {name: 'Loading'}),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', {name: 'No results found'}),
    ).not.toBeInTheDocument();
    expect(search).not.toHaveBeenCalled();
    // One more character crosses the threshold and searches.
    fireEvent.change(screen.getByLabelText('Search Tags'), {
      target: {value: 'Des'},
    });
    await waitFor(() => expect(search).toHaveBeenCalledWith('Des'));
    spy.mockRestore();
  });

  it('announces the rendered empty state when emptySearchText is an element (FR20; AST-056 FR3)', async () => {
    const matches = Element.prototype.matches;
    const spy = vi
      .spyOn(Element.prototype, 'matches')
      .mockImplementation(function (this: Element, selector: string) {
        return selector === ':modal'
          ? this instanceof HTMLDialogElement && this.open
          : matches.call(this, selector);
      });
    try {
      render(
        <Tokenizer
          label="Tags"
          searchSource={source}
          value={[]}
          onChange={() => {}}
          debounceMs={0}
          emptySearchText={
            <p>
              Nothing called <strong>that</strong>
              <span aria-hidden="true"> (decorative)</span>
            </p>
          }
          experimental={{presentation: 'bottom-sheet'}}
        />,
      );
      fireEvent.click(openTrigger());
      const dialog = await screen.findByRole('dialog', {name: 'Tags'});
      fireEvent.change(screen.getByLabelText('Search Tags'), {
        target: {value: 'zzz'},
      });
      await waitFor(() =>
        expect(
          dialog.querySelector(
            ':scope > [data-astryx-modal-live-region="polite"]',
          ),
        ).toHaveTextContent('Nothing called that'),
      );
      expect(
        dialog.querySelector(
          ':scope > [data-astryx-modal-live-region="polite"]',
        ),
      ).not.toHaveTextContent('decorative');
      expect(screen.getByText('that')).toBeInTheDocument();
    } finally {
      spy.mockRestore();
    }
  });

  it('settles a rejecting source to no results without an unhandled rejection (FR20)', async () => {
    const matches = Element.prototype.matches;
    const spy = vi
      .spyOn(Element.prototype, 'matches')
      .mockImplementation(function (this: Element, selector: string) {
        return selector === ':modal'
          ? this instanceof HTMLDialogElement && this.open
          : matches.call(this, selector);
      });
    const rejected = vi.fn();
    const onRejection = (event: PromiseRejectionEvent) => {
      rejected(event.reason);
      event.preventDefault();
    };
    window.addEventListener('unhandledrejection', onRejection);
    try {
      const flaky: SearchSource<SearchableItem> = {
        bootstrap: () => ITEMS,
        search: async q => {
          if (q === 'boom') {
            throw new Error('source down');
          }
          return source.search(q);
        },
      };
      render(
        <Tokenizer
          label="Tags"
          searchSource={flaky}
          value={[]}
          onChange={() => {}}
          debounceMs={0}
          experimental={{presentation: 'bottom-sheet'}}
        />,
      );
      fireEvent.click(openTrigger());
      const dialog = await screen.findByRole('dialog', {name: 'Tags'});
      const region = () =>
        dialog.querySelector(
          ':scope > [data-astryx-modal-live-region="polite"]',
        );
      fireEvent.change(screen.getByLabelText('Search Tags'), {
        target: {value: 'En'},
      });
      await screen.findByRole('checkbox', {name: 'Energizer'});
      await waitFor(() => expect(region()).toHaveTextContent('3 results'));
      fireEvent.change(screen.getByLabelText('Search Tags'), {
        target: {value: 'boom'},
      });
      // Settled: no stale rows, busy cleared, the empty state announced
      // rather than the old count.
      await waitFor(() =>
        expect(
          screen.getByRole('heading', {name: 'No results found'}),
        ).toBeInTheDocument(),
      );
      expect(
        screen.queryByRole('checkbox', {name: 'Energizer'}),
      ).not.toBeInTheDocument();
      expect(list()).not.toHaveAttribute('aria-busy');
      await waitFor(() =>
        expect(region()).toHaveTextContent('No results found'),
      );
      expect(region()).not.toHaveTextContent('3 results');
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      expect(rejected).not.toHaveBeenCalled();
    } finally {
      window.removeEventListener('unhandledrejection', onRejection);
      spy.mockRestore();
    }
  });

  it('retires an unsettled search when a query below minQueryLength follows it, announcing nothing (FR20)', async () => {
    vi.useFakeTimers();
    const matches = Element.prototype.matches;
    const spy = vi
      .spyOn(Element.prototype, 'matches')
      .mockImplementation(function (this: Element, selector: string) {
        return selector === ':modal'
          ? this instanceof HTMLDialogElement && this.open
          : matches.call(this, selector);
      });
    try {
      const slow: SearchSource<SearchableItem> = {
        bootstrap: () => ITEMS,
        search: async q =>
          new Promise(resolve =>
            setTimeout(() => resolve(source.search(q)), 300),
          ),
      };
      render(
        <Tokenizer
          label="Tags"
          searchSource={slow}
          value={[]}
          onChange={() => {}}
          debounceMs={0}
          minQueryLength={3}
          experimental={{presentation: 'bottom-sheet'}}
        />,
      );
      fireEvent.click(openTrigger());
      await act(async () => {
        await vi.advanceTimersByTimeAsync(10);
      });
      const dialog = screen.getByRole('dialog', {name: 'Tags'});
      const region = () =>
        dialog.querySelector(
          ':scope > [data-astryx-modal-live-region="polite"]',
        );
      const search = screen.getByLabelText('Search Tags');
      // "Eng" searches; before it settles, backspace to "En", below the
      // threshold: nothing pending, and when the old search returns its rows
      // do not land and no count is announced.
      fireEvent.change(search, {target: {value: 'Eng'}});
      expect(list()).toHaveAttribute('aria-busy', 'true');
      fireEvent.change(search, {target: {value: 'En'}});
      expect(list()).not.toHaveAttribute('aria-busy');
      await act(async () => {
        await vi.advanceTimersByTimeAsync(400);
      });
      expect(
        screen.queryByRole('checkbox', {name: 'Eng'}),
      ).not.toBeInTheDocument();
      expect(region()?.textContent ?? '').not.toMatch(/results?/);
      // A searched query afterwards announces as usual.
      fireEvent.change(search, {target: {value: 'Ener'}});
      await act(async () => {
        await vi.advanceTimersByTimeAsync(400);
      });
      expect(
        screen.getByRole('checkbox', {name: 'Energizer'}),
      ).toBeInTheDocument();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });
      expect(region()).toHaveTextContent('1 result');
    } finally {
      spy.mockRestore();
      vi.useRealTimers();
    }
  });

  it('marks the list pending while the bootstrap set reloads after the create row (FR20, FR22)', async () => {
    vi.useFakeTimers();
    try {
      const onChangeQuery = vi.fn();
      const slow: SearchSource<SearchableItem> = {
        bootstrap: async () =>
          new Promise(resolve => setTimeout(() => resolve(ITEMS), 300)),
        search: async q =>
          new Promise(resolve =>
            setTimeout(() => resolve(source.search(q)), 300),
          ),
      };
      render(
        <Tokenizer
          label="Tags"
          searchSource={slow}
          value={[]}
          onChange={() => {}}
          onChangeQuery={onChangeQuery}
          debounceMs={0}
          hasCreate
          experimental={{presentation: 'bottom-sheet'}}
        />,
      );
      fireEvent.click(openTrigger());
      await act(async () => {
        await vi.advanceTimersByTimeAsync(400);
      });
      fireEvent.change(screen.getByLabelText('Search Tags'), {
        target: {value: 'Ops'},
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(400);
      });
      onChangeQuery.mockClear();
      fireEvent.click(screen.getByRole('button', {name: 'Add Ops'}));
      // The query is cleared through the same path a typed change takes:
      // the bootstrap reload is pending and the change is reported.
      expect(list()).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByRole('img', {name: 'Loading'})).toBeInTheDocument();
      expect(onChangeQuery).toHaveBeenCalledWith('');
      await act(async () => {
        await vi.advanceTimersByTimeAsync(400);
      });
      expect(list()).not.toHaveAttribute('aria-busy');
      expect(
        screen.getByRole('checkbox', {name: 'Design'}),
      ).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('joins two announcements from one change inside the sheet (AST-086 FR14)', async () => {
    const matches = Element.prototype.matches;
    const spy = vi
      .spyOn(Element.prototype, 'matches')
      .mockImplementation(function (this: Element, selector: string) {
        return selector === ':modal'
          ? this instanceof HTMLDialogElement && this.open
          : matches.call(this, selector);
      });
    try {
      render(<Harness hasCreate maxEntries={2} initial={[ITEMS[0]]} />);
      fireEvent.click(openTrigger());
      const dialog = await screen.findByRole('dialog', {name: 'Tags'});
      const region = () =>
        dialog.querySelector(
          ':scope > [data-astryx-modal-live-region="polite"]',
        );
      // Typing a query that both searches (its count is announced on settle)
      // and, here with an instant source, settles in the same frame as the
      // create row appears: both words are in one announcement, in order.
      fireEvent.change(screen.getByLabelText('Search Tags'), {
        target: {value: 'Ops'},
      });
      await waitFor(() => expect(region()).toHaveTextContent('0 results'));
      // Two selection changes in one frame: neither is dropped.
      fireEvent.change(screen.getByLabelText('Search Tags'), {
        target: {value: ''},
      });
      await screen.findByRole('checkbox', {name: 'Eng'});
      await act(async () => {
        await new Promise(resolve =>
          requestAnimationFrame(() => resolve(null)),
        );
        await new Promise(resolve =>
          requestAnimationFrame(() => resolve(null)),
        );
      });
      fireEvent.click(screen.getByRole('checkbox', {name: 'Eng'}));
      fireEvent.click(screen.getByRole('checkbox', {name: 'Design'}));
      await waitFor(() =>
        expect(region()).toHaveTextContent('Added Eng Removed Design'),
      );
    } finally {
      spy.mockRestore();
    }
  });

  it('clears the query on Escape dismissal, so the next open lists the bootstrap set and settles (FR18, FR20)', async () => {
    const onChangeQuery = vi.fn();
    const search = vi.fn(source.search);
    render(
      <Tokenizer
        label="Tags"
        searchSource={{...source, search}}
        value={[]}
        onChange={() => {}}
        onChangeQuery={onChangeQuery}
        debounceMs={0}
        minQueryLength={3}
        hasCreate
        experimental={{presentation: 'bottom-sheet'}}
      />,
    );
    fireEvent.click(openTrigger());
    const dialog = await screen.findByRole('dialog', {name: 'Tags'});
    await screen.findByRole('checkbox', {name: 'Design'});
    // A query below the threshold, then an Escape dismissal: the query does
    // not survive the close.
    fireEvent.change(screen.getByLabelText('Search Tags'), {
      target: {value: 'De'},
    });
    expect(screen.getByRole('button', {name: 'Add De'})).toBeInTheDocument();
    onChangeQuery.mockClear();
    search.mockClear();
    fireEvent.keyDown(dialog, {key: 'Escape'});
    await waitFor(() =>
      expect(openTrigger()).toHaveAttribute('aria-expanded', 'false'),
    );
    expect(onChangeQuery).toHaveBeenCalledWith('');
    fireEvent.transitionEnd(document.querySelector('.astryx-bottom-sheet')!, {
      propertyName: 'transform',
    });
    // Reopened: the search field is empty, the bootstrap set loads and
    // settles — no list left pending for a search that never runs.
    fireEvent.click(openTrigger());
    await screen.findByRole('dialog', {name: 'Tags'});
    expect(screen.getByLabelText('Search Tags')).toHaveValue('');
    await screen.findByRole('checkbox', {name: 'Eng'});
    expect(list()).not.toHaveAttribute('aria-busy');
    expect(
      screen.queryByRole('img', {name: 'Loading'}),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: /^Add /}),
    ).not.toBeInTheDocument();
    expect(search).not.toHaveBeenCalled();
  });

  it('reports the cleared query from the close handler, not during render (FR18; runtime INV2)', async () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      // A caller that mirrors the query into its own state: a render-phase
      // report would be a cross-component update React warns about.
      function Mirror() {
        const [query, setQuery] = useState('');
        return (
          <>
            <Tokenizer
              label="Tags"
              searchSource={source}
              value={[]}
              onChange={() => {}}
              onChangeQuery={setQuery}
              debounceMs={0}
              experimental={{presentation: 'bottom-sheet'}}
            />
            <output data-testid="mirror">{query}</output>
          </>
        );
      }
      render(<Mirror />);
      fireEvent.click(openTrigger());
      const dialog = await screen.findByRole('dialog', {name: 'Tags'});
      fireEvent.change(screen.getByLabelText('Search Tags'), {
        target: {value: 'En'},
      });
      expect(screen.getByTestId('mirror')).toHaveTextContent('En');
      fireEvent.keyDown(dialog, {key: 'Escape'});
      await waitFor(() =>
        expect(openTrigger()).toHaveAttribute('aria-expanded', 'false'),
      );
      expect(screen.getByTestId('mirror')).toHaveTextContent('');
      const renderPhase = errors.mock.calls.filter(call =>
        String(call[0]).includes('Cannot update a component'),
      );
      expect(renderPhase).toEqual([]);
    } finally {
      errors.mockRestore();
    }
  });

  it('loads the bootstrap set at once on open: an instant source shows no Loading row and announces nothing (FR20)', async () => {
    const matches = Element.prototype.matches;
    const spy = vi
      .spyOn(Element.prototype, 'matches')
      .mockImplementation(function (this: Element, selector: string) {
        return selector === ':modal'
          ? this instanceof HTMLDialogElement && this.open
          : matches.call(this, selector);
      });
    try {
      // Default debounceMs (150): the open must not wait for it.
      render(
        <Tokenizer
          label="Tags"
          searchSource={source}
          value={[ITEMS[0]]}
          onChange={() => {}}
          experimental={{presentation: 'bottom-sheet'}}
        />,
      );
      fireEvent.click(openTrigger());
      const dialog = await screen.findByRole('dialog', {name: 'Tags'});
      await screen.findByRole('checkbox', {name: 'Eng'});
      expect(list()).not.toHaveAttribute('aria-busy');
      expect(
        screen.queryByRole('img', {name: 'Loading'}),
      ).not.toBeInTheDocument();
      // Nothing was announced for the open: no region was ever needed.
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });
      expect(
        dialog.querySelector('[data-astryx-modal-live-region]'),
      ).toBeNull();
      // A typed query still waits for the debounce (busy meanwhile), and
      // clearing it reloads the bootstrap set at once.
      fireEvent.change(screen.getByLabelText('Search Tags'), {
        target: {value: 'En'},
      });
      expect(list()).toHaveAttribute('aria-busy', 'true');
      await waitFor(() => expect(list()).not.toHaveAttribute('aria-busy'));
      fireEvent.change(screen.getByLabelText('Search Tags'), {
        target: {value: ''},
      });
      await screen.findByRole('checkbox', {name: 'Design'});
      expect(list()).not.toHaveAttribute('aria-busy');
    } finally {
      spy.mockRestore();
    }
  });

  it('moves focus to the search field when a settled search removes the focused row (FR20; AST-085 FR4)', async () => {
    render(<Harness initial={[]} />);
    fireEvent.click(openTrigger());
    await screen.findByRole('dialog', {name: 'Tags'});
    const design = await screen.findByRole('checkbox', {name: 'Design'});
    design.focus();
    expect(design).toHaveFocus();
    // A query Design does not match: the settled search removes the focused
    // row, and focus lands on the search field, not the page body.
    fireEvent.change(screen.getByLabelText('Search Tags'), {
      target: {value: 'En'},
    });
    await waitFor(() =>
      expect(
        screen.queryByRole('checkbox', {name: 'Design'}),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByLabelText('Search Tags')).toHaveFocus();
    expect(document.activeElement).not.toBe(document.body);
  });

  it('awaits a non-native thenable from the source, as the inline field does (FR20)', async () => {
    // A thenable that is not a native Promise: a library promise, or one
    // from another realm. Typed as what the source contract names so the
    // source is a plain object of synchronous functions returning it.
    const asThenable = (items: SearchableItem[]) =>
      ({
        then: (resolve: (items: SearchableItem[]) => void) => {
          resolve(items);
        },
      }) as unknown as SearchableItem[];
    const thenable: SearchSource<SearchableItem> = {
      bootstrap: () => asThenable(ITEMS),
      search: q => asThenable(source.search(q) as SearchableItem[]),
    };
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      render(
        <Tokenizer
          label="Tags"
          searchSource={thenable}
          value={[]}
          onChange={() => {}}
          debounceMs={0}
          experimental={{presentation: 'bottom-sheet'}}
        />,
      );
      fireEvent.click(openTrigger());
      await screen.findByRole('dialog', {name: 'Tags'});
      expect(
        await screen.findByRole('checkbox', {name: 'Design'}),
      ).toBeInTheDocument();
      fireEvent.change(screen.getByLabelText('Search Tags'), {
        target: {value: 'Ener'},
      });
      expect(
        await screen.findByRole('checkbox', {name: 'Energizer'}),
      ).toBeInTheDocument();
      expect(list()).not.toHaveAttribute('aria-busy');
      expect(errors).not.toHaveBeenCalled();
    } finally {
      errors.mockRestore();
    }
  });

  it('subscribes to matchMedia only for the adaptive presentation (runtime INV5)', () => {
    const added: string[] = [];
    const matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {
        added.push(query);
      },
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    vi.stubGlobal('matchMedia', matchMedia);
    // The default popover, with and without the experimental object: no
    // query is evaluated and no listener is registered.
    const {unmount} = render(
      <Tokenizer
        label="Tags"
        searchSource={source}
        value={[]}
        onChange={() => {}}
      />,
    );
    render(<Harness presentation="popover" />);
    render(<Harness presentation="bottom-sheet" />);
    expect(
      matchMedia.mock.calls.filter(([q]) => q === COMPACT_TOUCH_QUERY),
    ).toHaveLength(0);
    expect(added.filter(q => q === COMPACT_TOUCH_QUERY)).toHaveLength(0);
    unmount();
    // Only adaptive reads the policy, and subscribes once.
    render(<Harness presentation="adaptive" />);
    expect(added.filter(q => q === COMPACT_TOUCH_QUERY)).toHaveLength(1);
  });

  it('moves focus to the sheet panel on open, not the search field (FR18)', async () => {
    render(<Harness />);
    fireEvent.click(openTrigger());
    const dialog = await screen.findByRole('dialog', {name: 'Tags'});
    await screen.findByRole('checkbox', {name: 'Design'});
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(screen.getByLabelText('Search Tags')).not.toHaveFocus();
  });

  it('moves focus to the search field after the create row is activated (FR22)', async () => {
    render(<Harness hasCreate initial={[]} />);
    fireEvent.click(openTrigger());
    await screen.findByRole('dialog', {name: 'Tags'});
    fireEvent.change(screen.getByLabelText('Search Tags'), {
      target: {value: 'Ops'},
    });
    const add = await screen.findByRole('button', {name: 'Add Ops'});
    add.focus();
    fireEvent.click(add);
    expect(
      screen.queryByRole('button', {name: 'Add Ops'}),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('Search Tags')).toHaveFocus();
  });

  it("moves focus to the new presentation's control when adaptive changes while the sheet is closed (FR16)", async () => {
    let compact = true;
    const listeners = new Set<() => void>();
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        get matches() {
          return query === COMPACT_TOUCH_QUERY ? compact : false;
        },
        media: query,
        onchange: null,
        addEventListener: (_: string, cb: () => void) => listeners.add(cb),
        removeEventListener: (_: string, cb: () => void) =>
          listeners.delete(cb),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(
      <Harness presentation="adaptive" onFocus={onFocus} onBlur={onBlur} />,
    );
    const trigger = openTrigger();
    trigger.focus();
    expect(trigger).toHaveFocus();
    expect(onFocus).toHaveBeenCalledTimes(1);
    // Trigger focused, phone turns to landscape: the input takes over, and
    // the hand-off inside the field reports neither a blur nor a focus.
    compact = false;
    act(() => {
      for (const cb of listeners) cb();
    });
    expect(screen.getByRole('combobox')).toHaveFocus();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).not.toHaveBeenCalled();
    // And back: the input focused, the screen becomes compact again.
    compact = true;
    act(() => {
      for (const cb of listeners) cb();
    });
    expect(openTrigger()).toHaveFocus();
    // Unfocused, a change moves nothing.
    openTrigger().blur();
    compact = false;
    act(() => {
      for (const cb of listeners) cb();
    });
    expect(document.body).toHaveFocus();
  });

  it('carries hidden form inputs and the field chrome in the sheet presentation', () => {
    const {container} = render(
      <Tokenizer
        label="Tags"
        searchSource={source}
        value={[ITEMS[0], ITEMS[1]]}
        onChange={() => {}}
        htmlName="tags"
        status={{type: 'error', message: 'Pick at least three'}}
        experimental={{presentation: 'bottom-sheet'}}
      />,
    );
    const hidden = container.querySelectorAll('input[type="hidden"]');
    expect(hidden).toHaveLength(2);
    expect(hidden[0]).toHaveAttribute('name', 'tags');
    expect(hidden[0]).toHaveValue('design');
    const trigger = openTrigger();
    expect(trigger).toHaveClass('astryx-tokenizer');
    expect(trigger).toHaveAttribute('data-status', 'error');
    expect(screen.getByText('Pick at least three')).toBeInTheDocument();
  });
});
