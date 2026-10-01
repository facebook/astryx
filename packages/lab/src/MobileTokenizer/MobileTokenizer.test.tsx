// Copyright (c) Meta Platforms, Inc. and affiliates.
/**
 * @file MobileTokenizer.test.tsx
 * @input Uses vitest, @testing-library/react, MobileTokenizer
 * @output Lab tests for the sketch flow: field -> manage -> add (bottom
 *   filter) -> Done -> manage
 * @position Lab tests; validates MobileTokenizer.tsx
 */
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
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
    ITEMS.filter(i => i.label.toLowerCase().includes(q.toLowerCase())),
  bootstrap: () => ITEMS,
};

function Harness({
  spy,
}: {
  spy?: (i: SearchableItem[], c: MobileTokenizerChange<SearchableItem>) => void;
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
    vi
      .fn()
      .mockReturnValue({
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

describe('MobileTokenizer (Lab, sketch flow)', () => {
  it('field -> manage -> add: filter at bottom, tap + adds, Done returns', async () => {
    const spy = vi.fn();
    render(<Harness spy={spy} />);
    const trigger = screen.getByRole('button', {name: /Tags/});
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    fireEvent.click(trigger);
    expect(
      (await screen.findByTestId('mobile-tokenizer-manage-list')).textContent,
    ).toContain('Design');
    fireEvent.click(screen.getByRole('button', {name: 'Add item'}));
    const search = await screen.findByLabelText('Search Tags');
    fireEvent.change(search, {target: {value: 'E'}});
    const engineer = await screen.findByRole('button', {name: 'Add Engineer'});
    expect(engineer).toHaveAttribute('data-variant', 'secondary');
    fireEvent.click(engineer);
    expect(spy).toHaveBeenCalledWith(
      [ITEMS[0], ITEMS[1], ITEMS[2]],
      expect.objectContaining({type: 'add'}),
    );
    await waitFor(() =>
      expect(
        screen.getByRole('button', {name: 'Remove Engineer'}),
      ).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', {name: 'Done'}));
    expect(
      (await screen.findByTestId('mobile-tokenizer-manage-list')).textContent,
    ).toContain('Engineer');
  });
  it('uses guided empty states and large actions', async () => {
    render(
      <MobileTokenizer
        label="Tags"
        searchSource={source}
        value={[]}
        debounceMs={0}
        onChange={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', {name: /Tags/}));
    const manageTitle = await screen.findByRole('heading', {
      name: 'No items yet',
    });
    expect(
      manageTitle.closest('[role="status"]')?.querySelector('.astryx-icon'),
    ).toHaveAttribute('data-size', 'lg');
    expect(screen.getByRole('button', {name: 'Clear all'})).toHaveAttribute(
      'data-size',
      'lg',
    );
    expect(
      screen.queryByRole('button', {name: 'Close'}),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Add item'}));
    const search = await screen.findByLabelText('Search Tags');
    expect(search.closest('.astryx-text-input')).toHaveAttribute(
      'data-size',
      'lg',
    );
    expect(screen.getByRole('button', {name: 'Done'})).toHaveAttribute(
      'data-size',
      'lg',
    );
    fireEvent.change(search, {target: {value: 'zzz'}});
    const searchTitle = await screen.findByRole('heading', {
      name: 'No results found',
    });
    expect(searchTitle.closest('[role="status"]')).toHaveTextContent(
      'Try a different search.',
    );
  });
  it('manage sheet removes and clears', async () => {
    const spy = vi.fn();
    render(<Harness spy={spy} />);
    fireEvent.click(screen.getByRole('button', {name: /Tags/}));
    await screen.findByTestId('mobile-tokenizer-manage-list');
    fireEvent.click(screen.getByRole('button', {name: 'Remove Eng'}));
    expect(spy).toHaveBeenCalledWith(
      [ITEMS[0]],
      expect.objectContaining({type: 'remove'}),
    );
    fireEvent.click(screen.getByRole('button', {name: 'Clear all'}));
    expect(spy).toHaveBeenLastCalledWith(
      [],
      expect.objectContaining({type: 'remove'}),
    );
  });
});
