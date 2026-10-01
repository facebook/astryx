// Copyright (c) Meta Platforms, Inc. and affiliates.
/**
 * @file MobileTokenizer.test.tsx
 * @input Uses vitest, @testing-library/react, MobileTokenizer
 * @output Lab tests for the single-sheet touch flow
 * @position Lab tests; validates MobileTokenizer.tsx
 */
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import {useState} from 'react';
import {MobileTokenizer, type MobileTokenizerChange} from './MobileTokenizer';
import type {SearchSource, SearchableItem} from '@astryxdesign/core/Typeahead';

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

function Harness({
  spy,
}: {
  spy?: (
    items: SearchableItem[],
    change: MobileTokenizerChange<SearchableItem>,
  ) => void;
}) {
  const [value, setValue] = useState<SearchableItem[]>([ITEMS[0], ITEMS[1]]);
  return (
    <MobileTokenizer
      label="Tags"
      searchSource={source}
      value={value}
      debounceMs={0}
      placeholder="Add tags"
      onChange={(items, change) => {
        setValue(items);
        spy?.(items, change);
      }}
    />
  );
}

function CreateHarness({spy}: {spy: ReturnType<typeof vi.fn>}) {
  const [value, setValue] = useState<SearchableItem[]>([]);
  return (
    <MobileTokenizer
      label="Tags"
      searchSource={source}
      value={value}
      hasCreate
      debounceMs={0}
      onChange={(items, change) => {
        setValue(items);
        spy(items, change);
      }}
    />
  );
}

beforeEach(() => {
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
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches: false,
      media: '',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  );
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    }),
  );
});
afterEach(() => vi.unstubAllGlobals());

describe('MobileTokenizer (Lab, single-sheet flow)', () => {
  it('opens one searchable list and toggles items in place', async () => {
    const spy = vi.fn();
    render(<Harness spy={spy} />);
    const trigger = screen.getByRole('button', {name: /Tags/});
    fireEvent.click(trigger);

    const list = await screen.findByTestId('mobile-tokenizer-list');
    expect(list).toHaveTextContent('Design');
    expect(list).toHaveTextContent('Engineer');
    const search = screen.getByLabelText('Search Tags');
    expect(
      search.closest('.astryx-text-input')?.querySelector('.astryx-icon'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Add item'}),
    ).not.toBeInTheDocument();
    const design = screen.getByRole('checkbox', {name: 'Design'});
    expect(design).toBeChecked();
    expect(design.lastElementChild).toHaveAttribute('aria-hidden', 'true');
    expect(design.lastElementChild).toHaveAttribute('data-size', 'md');

    fireEvent.click(screen.getByText('Engineer'));
    expect(spy).toHaveBeenCalledWith(
      [ITEMS[0], ITEMS[1], ITEMS[2]],
      expect.objectContaining({type: 'add'}),
    );
    await waitFor(() =>
      expect(screen.getByRole('checkbox', {name: 'Engineer'})).toBeChecked(),
    );

    fireEvent.click(screen.getByRole('checkbox', {name: 'Eng'}));
    expect(spy).toHaveBeenLastCalledWith(
      [ITEMS[0], ITEMS[2]],
      expect.objectContaining({type: 'remove'}),
    );

    fireEvent.click(screen.getByRole('button', {name: 'Done'}));
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('creates a custom entry with a trailing Add action', async () => {
    const spy = vi.fn();
    render(<CreateHarness spy={spy} />);
    const trigger = screen.getByRole('button', {name: /Tags/});
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
    expect(screen.getByTestId('mobile-tokenizer-create-row')).toHaveTextContent(
      'Create "Custom"',
    );
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
  });

  it('renders long lists in 50-item batches and resets the window for search', async () => {
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
      <MobileTokenizer
        label="Items"
        searchSource={longSource}
        value={[]}
        onChange={() => {}}
        maxMenuItems={120}
        debounceMs={0}
      />,
    );
    fireEvent.click(screen.getByRole('button', {name: 'Items'}));
    const list = await screen.findByTestId('mobile-tokenizer-list');
    await waitFor(() => {
      expect(list).toHaveAttribute('data-rendered-count', '50');
      expect(list).toHaveAttribute('data-total-count', '120');
    });
    expect(screen.getAllByRole('checkbox')).toHaveLength(50);
    expect(
      screen.queryByRole('checkbox', {name: 'Item 051'}),
    ).not.toBeInTheDocument();

    Object.defineProperties(list, {
      clientHeight: {configurable: true, value: 600},
      scrollHeight: {configurable: true, value: 2400},
      scrollTop: {configurable: true, value: 1700, writable: true},
    });
    fireEvent.scroll(list);
    expect(list).toHaveAttribute('data-rendered-count', '100');
    expect(screen.getAllByRole('checkbox')).toHaveLength(100);
    expect(
      screen.getByRole('checkbox', {name: 'Item 100'}),
    ).toBeInTheDocument();

    Object.defineProperties(list, {
      scrollHeight: {configurable: true, value: 4400},
      scrollTop: {
        configurable: true,
        value: 3600,
        writable: true,
      },
    });
    fireEvent.scroll(list);
    expect(list).toHaveAttribute('data-rendered-count', '120');
    expect(screen.getAllByRole('checkbox')).toHaveLength(120);

    fireEvent.change(screen.getByLabelText('Search Items'), {
      target: {value: 'Item'},
    });
    await waitFor(() =>
      expect(list).toHaveAttribute('data-rendered-count', '50'),
    );
    expect(screen.getAllByRole('checkbox')).toHaveLength(50);

    fireEvent.scroll(list);
    expect(list).toHaveAttribute('data-rendered-count', '100');
    expect(screen.getAllByRole('checkbox')).toHaveLength(100);
  });

  it('searches within the same sheet and centers the no-results state', async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', {name: /Tags/}));
    const search = await screen.findByLabelText('Search Tags');
    fireEvent.change(search, {target: {value: 'zzz'}});

    const title = await screen.findByRole('heading', {
      name: 'No results found',
    });
    const emptyState = title.closest('[role="status"]');
    expect(emptyState).toHaveTextContent('Try a different search.');
    expect(emptyState?.querySelector('.astryx-icon')).toHaveAttribute(
      'data-size',
      'lg',
    );
  });

  it('keeps large equal-width Clear all and Done footer actions while guarding the bulk clear', async () => {
    const spy = vi.fn();
    render(<Harness spy={spy} />);
    fireEvent.click(screen.getByRole('button', {name: /Tags/}));
    const list = await screen.findByTestId('mobile-tokenizer-list');

    const clearAll = screen.getByRole('button', {name: 'Clear all'});
    const done = screen.getByRole('button', {name: 'Done'});
    expect(clearAll).toHaveAttribute('data-size', 'lg');
    expect(clearAll).toHaveAttribute('data-variant', 'secondary');
    expect(done).toHaveAttribute('data-size', 'lg');
    expect(list.compareDocumentPosition(clearAll)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(list.compareDocumentPosition(done)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    fireEvent.click(clearAll);
    const confirmation = screen.getByRole('alertdialog');
    expect(confirmation).toHaveTextContent('Clear all selected items?');
    expect(spy).not.toHaveBeenCalled();
    fireEvent.click(
      within(confirmation).getByRole('button', {name: 'Clear selection'}),
    );
    expect(spy).toHaveBeenLastCalledWith(
      [],
      expect.objectContaining({type: 'remove'}),
    );
  });
});
