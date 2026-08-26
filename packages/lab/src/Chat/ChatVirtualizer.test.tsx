// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi} from 'vitest';
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

  // ---- Touch write-gate --------------------------------------------------
  // jsdom has no compositor, so these pin the STATE MACHINE (which events
  // open and close the gate, and what the gate suppresses), not the geometry
  // it protects. The painted-position numbers behind it are in the PR.

  function attachedList(el: HTMLElement, data: Row[] = rows(50)) {
    return renderList(data, {scrollElement: el});
  }

  const scroller = (): HTMLElement => {
    const el = document.createElement('div');
    Object.defineProperty(el, 'clientHeight', {value: 400, writable: true});
    Object.defineProperty(el, 'scrollHeight', {value: 5000, writable: true});
    el.scrollTop = 2000;
    document.body.appendChild(el);
    return el;
  };

  const touch = (el: HTMLElement, type: string, remaining = 0): void => {
    const e = new Event(type, {bubbles: false});
    Object.defineProperty(e, 'touches', {value: {length: remaining}});
    act(() => {
      el.dispatchEvent(e);
    });
  };

  it('suppresses scroll writes while a finger is down', () => {
    const el = scroller();
    attachedList(el);
    touch(el, 'touchstart', 1);
    const at = (el.scrollTop = 1234);
    act(() => {
      el.dispatchEvent(new Event('scroll'));
    });
    expect(el.scrollTop).toBe(at);
    touch(el, 'touchend', 0);
    el.remove();
  });

  it('starts settling only when the last finger lifts', () => {
    vi.useFakeTimers();
    try {
      const el = scroller();
      attachedList(el);
      touch(el, 'touchstart', 1);
      touch(el, 'touchstart', 2);
      // First lift with a finger still on the glass must NOT settle: a
      // two-finger drag would take a scroll write under the remaining
      // finger.
      touch(el, 'touchend', 1);
      const held = (el.scrollTop = 900);
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(el.scrollTop).toBe(held);
      touch(el, 'touchend', 0);
      el.remove();
    } finally {
      vi.useRealTimers();
    }
  });

  it('releases the gate on touchcancel (system gesture takeover)', () => {
    vi.useFakeTimers();
    try {
      const el = scroller();
      attachedList(el);
      touch(el, 'touchstart', 1);
      touch(el, 'touchcancel', 0);
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      // Gate released: a later declaration reaches scrollTop again. Without
      // the touchcancel binding the gate would hold forever, because no
      // touchend ever arrives for a system-gesture takeover.
      expect(() => {
        act(() => {
          el.dispatchEvent(new Event('scroll'));
        });
      }).not.toThrow();
      el.remove();
    } finally {
      vi.useRealTimers();
    }
  });

  it('unmounting mid-gesture leaves no pending settle timer', () => {
    vi.useFakeTimers();
    try {
      const el = scroller();
      const {unmount} = attachedList(el);
      touch(el, 'touchstart', 1);
      touch(el, 'touchend', 0);
      unmount();
      // The in-flight touch keeps targeting the old element, so the timer
      // must die with the listeners rather than fire onto a dead tree.
      expect(() => {
        act(() => {
          vi.advanceTimersByTime(2000);
        });
      }).not.toThrow();
      el.remove();
    } finally {
      vi.useRealTimers();
    }
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

  // ---- History prepend ---------------------------------------------------
  // Loading older messages inserts ABOVE everything placed, so the restore
  // owes a correction the size of the whole page. The component treats that as
  // a convergence; what jsdom can check is the CONTRACT the convergence rests
  // on — that a prepend leaves the rows the user is looking at untouched, so
  // there is a stable identity to converge toward. (Geometry: a 300-row
  // prepend from scrollTop 0 slipped the view a row in 7 runs of 12 before
  // this and 0 of 12 after; numbers in the PR.)

  const listOf = (data: Row[]) => (
    <ChatVirtualizer<Row>
      data={data}
      keyExtractor={m => String(m.id)}
      renderItem={({item}) => <span>{item.text}</span>}
      estimatedItemSize={100}
    />
  );

  it('a prepend re-indexes rows without renumbering their keys', () => {
    const {container, rerender} = render(listOf(rows(3)));
    const keysBefore = [...container.querySelectorAll('[data-pkey]')].map(e =>
      e.getAttribute('data-pkey'),
    );
    rerender(
      listOf([
        {id: 'older-a', text: 'a'},
        {id: 'older-b', text: 'b'},
        ...rows(3),
      ]),
    );
    const keysAfter = [...container.querySelectorAll('[data-pkey]')].map(e =>
      e.getAttribute('data-pkey'),
    );
    // Every message that was on screen still answers to the same key at a new
    // index. Keying by index instead renumbers all of them, and the anchor
    // then names a different message — which is what makes a prepend jump.
    for (const k of keysBefore) {
      expect(keysAfter).toContain(k);
    }
    expect(container.querySelector('[data-pkey="older-b"]')).not.toBeNull();
    // Deliberately NOT asserting DOM node identity: a window that recomputes
    // across the intermediate render may legitimately unmount and remount a
    // row, and pinning that would be testing React's reconciliation, not this
    // component's contract.
  });

  it('survives a gesture that ends with nothing rendered', () => {
    vi.useFakeTimers();
    try {
      const el = scroller();
      const {rerender} = attachedList(el, rows(5));
      touch(el, 'touchstart', 1);
      // The list empties under the finger — the flush has no row to read a
      // reference frame off, and must fall back rather than throw.
      rerender(
        <ChatVirtualizer<Row>
          data={[]}
          keyExtractor={m => String(m.id)}
          renderItem={({item}) => <span>{item.text}</span>}
          estimatedItemSize={100}
          scrollElement={el}
        />,
      );
      touch(el, 'touchend', 0);
      expect(() => {
        act(() => {
          vi.advanceTimersByTime(500);
        });
      }).not.toThrow();
      el.remove();
    } finally {
      vi.useRealTimers();
    }
  });
});
