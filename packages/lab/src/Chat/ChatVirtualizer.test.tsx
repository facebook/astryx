// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, act} from '@testing-library/react';
import {createRef} from 'react';
import {ChatVirtualizer, type ChatVirtualizerHandle} from './ChatVirtualizer';

// jsdom has no real layout (offsetHeight is 0, ResizeObserver never fires),
// so these tests cover the CONTRACT layer — rendering shape, key handling,
// the imperative handle — not scroll geometry. Geometry behavior is covered
// by the storybook story and, upstream of this PR, by a CDP-driven
// painted-frame benchmark suite (numbers in the PR description).

type Row = {id: string | number; text: string};

const rows = (n: number): Row[] =>
  Array.from({length: n}, (_, i) => ({id: i, text: `message ${i}`}));

function renderList(
  data: Row[],
  extra: Partial<React.ComponentProps<typeof ChatVirtualizer<Row>>> = {},
) {
  return render(
    <ChatVirtualizer<Row>
      data={data}
      keyExtractor={m => String(m.id)}
      renderItem={({item}) => <span>{item.text}</span>}
      estimatedItemSize={100}
      {...extra}
    />,
  );
}

describe('ChatVirtualizer', () => {
  it('renders two aria-hidden spacers around the windowed rows', () => {
    const {container} = renderList(rows(5));
    const spacers = container.querySelectorAll('[aria-hidden="true"]');
    expect(spacers.length).toBe(2);
  });

  it('tags every rendered row with its data-pkey identity', () => {
    const {container} = renderList(rows(5));
    for (const el of container.querySelectorAll('[data-pkey]')) {
      const key = el.getAttribute('data-pkey');
      expect(key).toBeTruthy();
      expect(typeof key).toBe('string');
    }
  });

  it('coerces number keys to strings (the dataset round-trip contract)', () => {
    const {container} = renderList(rows(3), {
      // Deliberately returns a number at runtime; the component must coerce
      // so the RO pipeline (which reads dataset.pkey strings) and the size
      // cache stay keyed consistently.
      keyExtractor: (m: Row) => m.id as unknown as string,
    });
    const first = container.querySelector('[data-pkey]');
    expect(first?.getAttribute('data-pkey')).toBe('0');
  });

  it('renders an empty list as just the spacers', () => {
    const {container} = renderList([]);
    expect(container.querySelectorAll('[data-pkey]').length).toBe(0);
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBe(2);
  });

  it('renders a bare fragment in attach mode (no own scroll container)', () => {
    const host = document.createElement('div');
    const {container} = renderList(rows(3), {scrollElement: host});
    // Own-container mode wraps everything in one scroller div; attach mode
    // must not add a wrapper — the spacers are direct children.
    expect(
      (container.firstElementChild as HTMLElement).getAttribute('aria-hidden'),
    ).toBe('true');
  });

  it('renders nothing but spacers while the attach element is pending (null)', () => {
    const {container} = renderList(rows(3), {scrollElement: null});
    // null = attach mode waiting: no own container may be created, or an
    // unbounded parent would mount every row for one commit.
    expect(container.querySelector('[style*="overflow"]')).toBeNull();
  });

  it('exposes the declaration handle via apiRef', () => {
    const ref = createRef<ChatVirtualizerHandle>();
    renderList(rows(3), {apiRef: ref});
    expect(typeof ref.current?.scrollToDistanceFromBottomPx).toBe('function');
    expect(typeof ref.current?.anchorToKey).toBe('function');
    // Declarations must not throw without real layout.
    act(() => {
      ref.current?.scrollToDistanceFromBottomPx(0);
      ref.current?.anchorToKey('1', 0);
      // A key that is not in the data must not throw either — it falls back
      // to follow-at-end on the next pass (dead-anchor fallback).
      ref.current?.anchorToKey('missing-key', 0);
    });
  });

  it('keeps row identity stable across data replacement', () => {
    const {container, rerender} = renderList(rows(3));
    const before = container.querySelector('[data-pkey="1"]');
    rerender(
      <ChatVirtualizer<Row>
        data={[...rows(3), {id: 3, text: 'message 3'}]}
        keyExtractor={m => String(m.id)}
        renderItem={({item}) => <span>{item.text}</span>}
        estimatedItemSize={100}
      />,
    );
    expect(container.querySelector('[data-pkey="1"]')).toBe(before);
  });
});
