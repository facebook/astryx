// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useScrollableArea.singleElement.test.tsx
 * @input Shared scroll hook on one element that is both viewport and content
 *   box, a recorded resize observer, mocked geometry
 * @output Regression coverage for watching the direct children of a viewport
 *   that has no inner content box
 * @position DOM-level hook contract; useScrollableArea.test.tsx covers the
 *   two-box shape
 */

import {act, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {useScrollableArea} from './useScrollableArea';

const observed = vi.hoisted(
  () => new Map<Element, {callback: () => void; stopped: boolean}>(),
);

vi.mock('../utils/sharedResizeObserver', () => ({
  observeResize: (element: Element, callback: () => void) => {
    const entry = {callback, stopped: false};
    observed.set(element, entry);
    return () => {
      entry.stopped = true;
    };
  },
}));

function SingleBox({children}: {children: React.ReactNode}) {
  const {getViewportProps, getContentProps, state} = useScrollableArea({
    axis: 'block',
    keyboardAccess: {owner: 'content'},
  });
  return (
    <>
      <div data-testid="box" {...getContentProps(getViewportProps())}>
        {children}
      </div>
      <output data-testid="state">{JSON.stringify(state.block)}</output>
    </>
  );
}

function TwoBoxes() {
  const {getViewportProps, getContentProps} = useScrollableArea({
    axis: 'block',
    keyboardAccess: {owner: 'content'},
  });
  return (
    <div data-testid="viewport" {...getViewportProps()}>
      <div data-testid="content" {...getContentProps()}>
        <p data-testid="inner">Inner</p>
      </div>
    </div>
  );
}

function setHeights(element: HTMLElement, client: number, scroll: number) {
  for (const [key, value] of [
    ['clientWidth', 100],
    ['scrollWidth', 100],
    ['clientHeight', client],
    ['scrollHeight', scroll],
    ['scrollTop', 0],
  ] as const) {
    Object.defineProperty(element, key, {
      configurable: true,
      value,
      writable: true,
    });
  }
}

describe('useScrollableArea on a viewport that is its own content box', () => {
  let frames: FrameRequestCallback[];

  beforeEach(() => {
    observed.clear();
    frames = [];
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        frames.push(callback);
        return frames.length;
      }),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    const nativeGetComputedStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, 'getComputedStyle').mockImplementation(element => {
      const computed = nativeGetComputedStyle(element);
      return new Proxy(computed, {
        // eslint-disable-next-line @typescript-eslint/promise-function-async -- Proxy traps must remain synchronous
        get(target, property) {
          if (property === 'overflowX' || property === 'overflowY') {
            return 'auto';
          }
          return Reflect.get(target, property, target);
        },
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  function flushFrame() {
    act(() => {
      const pending = frames.splice(0);
      pending.forEach(callback => callback(performance.now()));
    });
  }

  it('watches each direct child, so content growing inside the box is measured', () => {
    render(
      <SingleBox>
        <p data-testid="first">First</p>
        <p data-testid="second">Second</p>
      </SingleBox>,
    );
    const box = screen.getByTestId('box');
    const second = screen.getByTestId('second');
    expect(observed.has(box)).toBe(true);
    expect(observed.has(screen.getByTestId('first'))).toBe(true);
    expect(observed.has(second)).toBe(true);

    // The child grows; the box itself keeps its size.
    setHeights(box, 100, 400);
    act(() => observed.get(second)?.callback());
    flushFrame();

    expect(JSON.parse(screen.getByTestId('state').textContent ?? '{}')).toEqual(
      {isScrollable: true, atStart: true, atEnd: false},
    );
  });

  it('follows children as they come and go', async () => {
    const {rerender} = render(
      <SingleBox>
        <p data-testid="first">First</p>
      </SingleBox>,
    );
    const first = screen.getByTestId('first');

    rerender(
      <SingleBox>
        <section data-testid="replacement">Replacement</section>
      </SingleBox>,
    );
    // The mutation observer reports the change asynchronously.
    await act(async () => {});

    expect(observed.get(first)?.stopped).toBe(true);
    expect(observed.has(screen.getByTestId('replacement'))).toBe(true);
  });

  it('leaves the children of a separate content box to that box', () => {
    render(<TwoBoxes />);

    expect(observed.has(screen.getByTestId('viewport'))).toBe(true);
    expect(observed.has(screen.getByTestId('content'))).toBe(true);
    expect(observed.has(screen.getByTestId('inner'))).toBe(false);
  });
});
