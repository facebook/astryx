// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useSheetOpenGesture.test.tsx
 * @input Uses vitest, @testing-library/react, useSheetOpenGesture
 * @output Unit tests for the drag-to-open recognizer
 * @position Lab testing; validates useSheetOpenGesture.ts
 *
 * EXPLORATION — see the notes in useSheetOpenGesture.ts.
 *
 * The claim rules these tests pin down were measured in a real engine, not
 * inferred: see the table in that file's header. jsdom cannot reproduce them
 * (nothing scrolls, nothing is cancelable on its own), so what is asserted
 * here is that the recognizer FOLLOWS them — which move it cancels, which it
 * lets through, and what it publishes.
 *
 * SYNC: When useSheetOpenGesture.ts changes, update these tests to match.
 */

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {act, render} from '@testing-library/react';
import type {SheetDragEvent} from '@astryxdesign/core/BottomSheet';
import {useSheetOpenGesture} from './useSheetOpenGesture';

// jsdom has no constructible TouchEvent, and a bare Event carries no
// changedTouches for the recognizer to read.
function touchEvent(
  type: 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel',
  touches: ReadonlyArray<{id: number; x: number; y: number}>,
  {
    cancelable = true,
    active = touches,
  }: {
    cancelable?: boolean;
    active?: ReadonlyArray<{id: number; x: number; y: number}>;
  } = {},
): Event {
  const event = new Event(type, {bubbles: true, cancelable});
  const list = touches.map(touch => ({
    identifier: touch.id,
    clientX: touch.x,
    clientY: touch.y,
  }));
  const activeList = active.map(touch => ({
    identifier: touch.id,
    clientX: touch.x,
    clientY: touch.y,
  }));
  Object.defineProperties(event, {
    changedTouches: {value: list},
    touches: {value: type === 'touchend' ? [] : activeList},
    targetTouches: {value: activeList},
  });
  return event;
}

function setDocumentScroll({
  scrollTop,
  clientHeight,
  scrollHeight,
}: {
  scrollTop: number;
  clientHeight: number;
  scrollHeight: number;
}) {
  const scroller = (document.scrollingElement ??
    document.documentElement) as HTMLElement;
  Object.defineProperty(scroller, 'scrollTop', {
    value: scrollTop,
    configurable: true,
  });
  Object.defineProperty(scroller, 'clientHeight', {
    value: clientHeight,
    configurable: true,
  });
  Object.defineProperty(scroller, 'scrollHeight', {
    value: scrollHeight,
    configurable: true,
  });
}

function Harness({
  events,
  enabled = true,
  from = 'page-end' as const,
}: {
  events: SheetDragEvent[];
  enabled?: boolean;
  from?: 'page-end' | 'element';
}) {
  const {source, regionProps} = useSheetOpenGesture({enabled, from});
  // Subscribing during render is fine here: the source is a plain emitter with
  // no React state, and the test needs every event including the first.
  const subscribed = (source as unknown as {__subscribed?: boolean})
    .__subscribed;
  if (!subscribed) {
    (source as unknown as {__subscribed?: boolean}).__subscribed = true;
    source.subscribe(event => events.push(event));
  }
  return <div data-testid="region" {...regionProps} />;
}

beforeEach(() => {
  // At the end of the page: an upward pull has no scrolling left to be.
  setDocumentScroll({scrollTop: 400, clientHeight: 600, scrollHeight: 1000});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useSheetOpenGesture', () => {
  it('claims the first upward move past the threshold and publishes the pull', () => {
    const events: SheetDragEvent[] = [];
    render(<Harness events={events} />);

    act(() => {
      document.dispatchEvent(
        touchEvent('touchstart', [{id: 1, x: 100, y: 500}]),
      );
    });
    const move = touchEvent('touchmove', [{id: 1, x: 100, y: 480}]);
    act(() => {
      document.dispatchEvent(move);
    });

    expect(move.defaultPrevented).toBe(true);
    expect(events).toEqual([
      {type: 'start', y: 500, timeStamp: move.timeStamp},
      {type: 'move', y: 480, timeStamp: move.timeStamp},
    ]);
  });

  it('anchors the pull at the touch, not at the threshold crossing', () => {
    const events: SheetDragEvent[] = [];
    render(<Harness events={events} />);

    act(() => {
      document.dispatchEvent(
        touchEvent('touchstart', [{id: 1, x: 100, y: 500}]),
      );
      document.dispatchEvent(
        touchEvent('touchmove', [{id: 1, x: 100, y: 470}]),
      );
    });

    // Starting at 500, not 470: the sheet should rise by the whole 30 px the
    // finger has already travelled, not just by what is left after the
    // threshold.
    expect(events[0]).toMatchObject({type: 'start', y: 500});
  });

  it('keeps cancelling every move once the gesture is claimed', () => {
    const events: SheetDragEvent[] = [];
    render(<Harness events={events} />);

    act(() => {
      document.dispatchEvent(
        touchEvent('touchstart', [{id: 1, x: 100, y: 500}]),
      );
      document.dispatchEvent(
        touchEvent('touchmove', [{id: 1, x: 100, y: 480}]),
      );
    });
    const later = touchEvent('touchmove', [{id: 1, x: 100, y: 300}]);
    act(() => {
      document.dispatchEvent(later);
    });

    // Letting one move through ends the claim for the rest of the gesture and
    // hands the page back to native scrolling mid-drag.
    expect(later.defaultPrevented).toBe(true);
    expect(events.at(-1)).toMatchObject({type: 'move', y: 300});
  });

  it('ignores a pull that is under the threshold', () => {
    const events: SheetDragEvent[] = [];
    render(<Harness events={events} />);

    const move = touchEvent('touchmove', [{id: 1, x: 100, y: 497}]);
    act(() => {
      document.dispatchEvent(
        touchEvent('touchstart', [{id: 1, x: 100, y: 500}]),
      );
      document.dispatchEvent(move);
    });

    expect(move.defaultPrevented).toBe(false);
    expect(events).toEqual([]);
  });

  it('leaves a downward drag to the page', () => {
    const events: SheetDragEvent[] = [];
    render(<Harness events={events} />);

    act(() => {
      document.dispatchEvent(
        touchEvent('touchstart', [{id: 1, x: 100, y: 500}]),
      );
      document.dispatchEvent(
        touchEvent('touchmove', [{id: 1, x: 100, y: 540}]),
      );
      // Reversing upward afterwards must not resurrect the gesture: by now the
      // browser owns the scroll.
      document.dispatchEvent(
        touchEvent('touchmove', [{id: 1, x: 100, y: 400}]),
      );
    });

    expect(events).toEqual([]);
  });

  it('leaves a mostly-sideways drag to the page', () => {
    const events: SheetDragEvent[] = [];
    render(<Harness events={events} />);

    act(() => {
      document.dispatchEvent(
        touchEvent('touchstart', [{id: 1, x: 100, y: 500}]),
      );
      document.dispatchEvent(
        touchEvent('touchmove', [{id: 1, x: 220, y: 480}]),
      );
    });

    expect(events).toEqual([]);
  });

  it('does not arm away from the end of the page', () => {
    setDocumentScroll({scrollTop: 0, clientHeight: 600, scrollHeight: 2000});
    const events: SheetDragEvent[] = [];
    render(<Harness events={events} />);

    act(() => {
      document.dispatchEvent(
        touchEvent('touchstart', [{id: 1, x: 100, y: 500}]),
      );
      document.dispatchEvent(
        touchEvent('touchmove', [{id: 1, x: 100, y: 400}]),
      );
    });

    expect(events).toEqual([]);
  });

  it('arms on a page that does not scroll at all', () => {
    setDocumentScroll({scrollTop: 0, clientHeight: 600, scrollHeight: 600});
    const events: SheetDragEvent[] = [];
    render(<Harness events={events} />);

    act(() => {
      document.dispatchEvent(
        touchEvent('touchstart', [{id: 1, x: 100, y: 500}]),
      );
      document.dispatchEvent(
        touchEvent('touchmove', [{id: 1, x: 100, y: 400}]),
      );
    });

    expect(events[0]).toMatchObject({type: 'start'});
  });

  it('does nothing while disabled', () => {
    const events: SheetDragEvent[] = [];
    render(<Harness events={events} enabled={false} />);

    act(() => {
      document.dispatchEvent(
        touchEvent('touchstart', [{id: 1, x: 100, y: 500}]),
      );
      document.dispatchEvent(
        touchEvent('touchmove', [{id: 1, x: 100, y: 400}]),
      );
    });

    expect(events).toEqual([]);
  });

  it('refuses a second finger', () => {
    const events: SheetDragEvent[] = [];
    render(<Harness events={events} />);

    act(() => {
      document.dispatchEvent(
        touchEvent('touchstart', [{id: 2, x: 150, y: 500}], {
          active: [
            {id: 1, x: 100, y: 500},
            {id: 2, x: 150, y: 500},
          ],
        }),
      );
      document.dispatchEvent(
        touchEvent('touchmove', [{id: 2, x: 150, y: 400}]),
      );
    });

    expect(events).toEqual([]);
  });

  it('will not claim a move the browser has already committed to scrolling', () => {
    const events: SheetDragEvent[] = [];
    render(<Harness events={events} />);

    act(() => {
      document.dispatchEvent(
        touchEvent('touchstart', [{id: 1, x: 100, y: 500}]),
      );
      document.dispatchEvent(
        touchEvent('touchmove', [{id: 1, x: 100, y: 400}], {cancelable: false}),
      );
      // And it stays disarmed: a drag that shares the gesture with the page
      // scrolling behind it is worse than no drag at all.
      document.dispatchEvent(
        touchEvent('touchmove', [{id: 1, x: 100, y: 300}]),
      );
    });

    expect(events).toEqual([]);
  });

  it('publishes the release', () => {
    const events: SheetDragEvent[] = [];
    render(<Harness events={events} />);

    act(() => {
      document.dispatchEvent(
        touchEvent('touchstart', [{id: 1, x: 100, y: 500}]),
      );
      document.dispatchEvent(
        touchEvent('touchmove', [{id: 1, x: 100, y: 300}]),
      );
      document.dispatchEvent(touchEvent('touchend', [{id: 1, x: 100, y: 300}]));
    });

    expect(events.at(-1)).toMatchObject({type: 'end', y: 300});
  });

  it('cancels an interrupted gesture', () => {
    const events: SheetDragEvent[] = [];
    render(<Harness events={events} />);

    act(() => {
      document.dispatchEvent(
        touchEvent('touchstart', [{id: 1, x: 100, y: 500}]),
      );
      document.dispatchEvent(
        touchEvent('touchmove', [{id: 1, x: 100, y: 300}]),
      );
      document.dispatchEvent(
        touchEvent('touchcancel', [{id: 1, x: 100, y: 300}]),
      );
    });

    expect(events.at(-1)).toEqual({type: 'cancel'});
  });

  it('publishes nothing for a touch that ended without being claimed', () => {
    const events: SheetDragEvent[] = [];
    render(<Harness events={events} />);

    act(() => {
      document.dispatchEvent(
        touchEvent('touchstart', [{id: 1, x: 100, y: 500}]),
      );
      document.dispatchEvent(touchEvent('touchend', [{id: 1, x: 100, y: 500}]));
    });

    expect(events).toEqual([]);
  });

  describe("from: 'element'", () => {
    it('claims a pull that began inside the region', () => {
      const events: SheetDragEvent[] = [];
      const {getByTestId} = render(<Harness events={events} from="element" />);

      act(() => {
        const start = touchEvent('touchstart', [{id: 1, x: 100, y: 500}]);
        getByTestId('region').dispatchEvent(start);
        document.dispatchEvent(
          touchEvent('touchmove', [{id: 1, x: 100, y: 400}]),
        );
      });

      expect(events[0]).toMatchObject({type: 'start', y: 500});
    });

    it('ignores a pull that began outside it', () => {
      const events: SheetDragEvent[] = [];
      render(<Harness events={events} from="element" />);

      act(() => {
        document.dispatchEvent(
          touchEvent('touchstart', [{id: 1, x: 100, y: 500}]),
        );
        document.dispatchEvent(
          touchEvent('touchmove', [{id: 1, x: 100, y: 400}]),
        );
      });

      expect(events).toEqual([]);
    });

    it('keeps a claimed gesture that has since left the region', () => {
      const events: SheetDragEvent[] = [];
      const {getByTestId} = render(<Harness events={events} from="element" />);

      act(() => {
        getByTestId('region').dispatchEvent(
          touchEvent('touchstart', [{id: 1, x: 100, y: 500}]),
        );
        document.dispatchEvent(
          touchEvent('touchmove', [{id: 1, x: 100, y: 400}]),
        );
        // A full-height pull ends nowhere near where it started, so the moves
        // stop being targeted at the region long before the finger lifts.
        document.dispatchEvent(
          touchEvent('touchmove', [{id: 1, x: 100, y: 80}]),
        );
      });

      expect(events.at(-1)).toMatchObject({type: 'move', y: 80});
    });
  });
});
