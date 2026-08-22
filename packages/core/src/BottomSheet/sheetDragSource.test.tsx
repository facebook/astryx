// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file sheetDragSource.test.tsx
 * @input Uses vitest, @testing-library/react, createSheetDragSource, BottomSheet
 * @output Unit tests for the drag-source contract and gesture-driven opening
 * @position Core testing; validates sheetDragSource.ts and the BottomSheet
 *   drag-to-open path added alongside it
 *
 * EXPLORATION — see the notes in sheetDragSource.ts.
 *
 * SYNC: When sheetDragSource.ts or the BottomSheet gesture path changes,
 * update these tests to match.
 */

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {act, render, screen} from '@testing-library/react';
import {useState} from 'react';
import {BottomSheet} from './BottomSheet';
import {createSheetDragSource} from './sheetDragSource';

// The sheet the integration tests drive: tall enough that a partial pull is
// unambiguously short of open, and a round number to assert against.
const SHEET_HEIGHT = 400;

let boundingRectSpy: ReturnType<typeof vi.spyOn> | null = null;

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

  // jsdom lays nothing out, so the sheet would measure 0 tall and the gesture
  // would have no travel to work with.
  boundingRectSpy = vi
    .spyOn(HTMLDivElement.prototype, 'getBoundingClientRect')
    .mockReturnValue({
      height: SHEET_HEIGHT,
      width: 320,
      top: 0,
      left: 0,
      right: 320,
      bottom: SHEET_HEIGHT,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

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
});

afterEach(() => {
  boundingRectSpy?.mockRestore();
  boundingRectSpy = null;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('createSheetDragSource', () => {
  it('reports no drag until one starts, and clears it on release', () => {
    const source = createSheetDragSource();
    expect(source.getSnapshot()).toBeNull();

    source.start({y: 500, timeStamp: 0});
    expect(source.getSnapshot()).toEqual({startY: 500, y: 500, timeStamp: 0});

    source.move({y: 420, timeStamp: 16});
    expect(source.getSnapshot()).toEqual({startY: 500, y: 420, timeStamp: 16});

    source.end({y: 300, timeStamp: 32});
    expect(source.getSnapshot()).toBeNull();
  });

  it('keeps the gesture start point across every move', () => {
    const source = createSheetDragSource();
    source.start({y: 600, timeStamp: 0});
    source.move({y: 500, timeStamp: 16});
    source.move({y: 400, timeStamp: 32});
    // The whole point: a subscriber that arrives late still learns how far the
    // finger has travelled, not just where it is now.
    expect(source.getSnapshot()?.startY).toBe(600);
  });

  it('lets a subscriber that arrives mid-drag pick the drag up', () => {
    const source = createSheetDragSource();
    source.start({y: 500, timeStamp: 0});
    source.move({y: 450, timeStamp: 16});

    const late = vi.fn();
    source.subscribe(late);
    // Nothing is replayed — the snapshot is how a late subscriber catches up.
    expect(late).not.toHaveBeenCalled();
    expect(source.getSnapshot()).toEqual({startY: 500, y: 450, timeStamp: 16});

    source.move({y: 400, timeStamp: 32});
    expect(late).toHaveBeenCalledWith({type: 'move', y: 400, timeStamp: 32});
  });

  it('ignores moves and releases with no drag in flight', () => {
    const source = createSheetDragSource();
    const listener = vi.fn();
    source.subscribe(listener);

    source.move({y: 100, timeStamp: 0});
    source.end({y: 100, timeStamp: 0});
    source.cancel();

    expect(listener).not.toHaveBeenCalled();
  });

  it('stops notifying an unsubscribed listener', () => {
    const source = createSheetDragSource();
    const listener = vi.fn();
    const unsubscribe = source.subscribe(listener);
    unsubscribe();

    source.start({y: 10, timeStamp: 0});
    expect(listener).not.toHaveBeenCalled();
  });

  it('survives a listener that unsubscribes while being notified', () => {
    const source = createSheetDragSource();
    const second = vi.fn();
    const unsubscribeFirst = source.subscribe(() => unsubscribeFirst());
    source.subscribe(second);

    source.start({y: 10, timeStamp: 0});
    expect(second).toHaveBeenCalledTimes(1);
  });
});

function GestureSheet({
  source,
  onOpenChange,
}: {
  source: ReturnType<typeof createSheetDragSource>;
  onOpenChange?: (isOpen: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <BottomSheet
      label="Nearby places"
      isOpen={isOpen}
      onOpenChange={next => {
        setIsOpen(next);
        onOpenChange?.(next);
      }}
      dragSource={source}>
      <p>Sheet content</p>
    </BottomSheet>
  );
}

// Each touch event is its own tick in a browser, and the sheet needs the ticks:
// the first published move is what mounts it, and it can only pick the drag up
// once it exists. Batching a whole gesture into one `act` renders none of that.
function publishDrag(
  source: ReturnType<typeof createSheetDragSource>,
  points: ReadonlyArray<{y: number; timeStamp: number}>,
) {
  const [first, ...rest] = points;
  act(() => source.start(first));
  for (const point of rest.slice(0, -1)) {
    act(() => source.move(point));
  }
  const last = rest[rest.length - 1];
  act(() => source.move(last));
  act(() => source.end(last));
}

describe('BottomSheet drag-to-open', () => {
  it('stays closed until a drag is published', () => {
    const source = createSheetDragSource();
    render(<GestureSheet source={source} />);

    expect(document.querySelector('dialog')?.hasAttribute('open')).toBe(false);
  });

  it('presents the sheet on the first published move, before it is open', () => {
    const source = createSheetDragSource();
    const onOpenChange = vi.fn();
    render(<GestureSheet source={source} onOpenChange={onOpenChange} />);

    act(() => {
      source.start({y: 600, timeStamp: 0});
    });

    // On screen, but the host has NOT been told it opened: the finger is still
    // deciding, and it may yet put the sheet back.
    expect(document.querySelector('dialog')?.hasAttribute('open')).toBe(true);
    expect(screen.getByText('Sheet content')).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('opens when the pull is released past the fall-back threshold', () => {
    const source = createSheetDragSource();
    const onOpenChange = vi.fn();
    render(<GestureSheet source={source} onOpenChange={onOpenChange} />);

    publishDrag(source, [
      {y: 600, timeStamp: 0},
      {y: 300, timeStamp: 16},
      {y: 220, timeStamp: 32},
    ]);

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('falls back closed when the pull is released too early', () => {
    const source = createSheetDragSource();
    const onOpenChange = vi.fn();
    render(<GestureSheet source={source} onOpenChange={onOpenChange} />);

    publishDrag(source, [
      {y: 600, timeStamp: 0},
      {y: 590, timeStamp: 100},
      {y: 580, timeStamp: 200},
    ]);

    // Never opened, so the host is never told it closed either — a gesture the
    // user abandoned should leave no trace in their state.
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('opens on a fast upward flick that never reaches the top', () => {
    const source = createSheetDragSource();
    const onOpenChange = vi.fn();
    render(<GestureSheet source={source} onOpenChange={onOpenChange} />);

    // ~6 px/ms upward, far past the flick floor, over enough distance — but
    // released while the sheet is still well short of open.
    publishDrag(source, [
      {y: 600, timeStamp: 0},
      {y: 540, timeStamp: 8},
      {y: 480, timeStamp: 16},
    ]);

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('leaves the sheet closed when a drag is cancelled', () => {
    const source = createSheetDragSource();
    const onOpenChange = vi.fn();
    render(<GestureSheet source={source} onOpenChange={onOpenChange} />);

    act(() => source.start({y: 600, timeStamp: 0}));
    act(() => source.move({y: 300, timeStamp: 16}));
    act(() => source.cancel());

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('does not present a sheet that is already open', () => {
    const source = createSheetDragSource();
    render(
      <BottomSheet
        label="Nearby places"
        isOpen
        onOpenChange={() => {}}
        dragSource={source}>
        <p>Sheet content</p>
      </BottomSheet>,
    );
    const showModal = HTMLDialogElement.prototype.showModal as ReturnType<
      typeof vi.fn
    >;
    showModal.mockClear();

    act(() => {
      source.start({y: 600, timeStamp: 0});
    });

    expect(showModal).not.toHaveBeenCalled();
  });

  it('can pull open a sheet whose purpose forbids swipe-dismiss', () => {
    const source = createSheetDragSource();
    const onOpenChange = vi.fn();
    render(
      <BottomSheet
        label="Required sheet"
        isOpen={false}
        purpose="required"
        onOpenChange={onOpenChange}
        dragSource={source}>
        <p>Sheet content</p>
      </BottomSheet>,
    );

    publishDrag(source, [
      {y: 600, timeStamp: 0},
      {y: 300, timeStamp: 16},
      {y: 220, timeStamp: 32},
    ]);

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('abandons the pull on a purpose that forbids swipe-dismiss', () => {
    const source = createSheetDragSource();
    const onOpenChange = vi.fn();
    render(
      <BottomSheet
        label="Required sheet"
        isOpen={false}
        purpose="required"
        onOpenChange={onOpenChange}
        dragSource={source}>
        <p>Sheet content</p>
      </BottomSheet>,
    );

    publishDrag(source, [
      {y: 600, timeStamp: 0},
      {y: 595, timeStamp: 100},
      {y: 590, timeStamp: 200},
    ]);

    // `purpose` governs abandoning a sheet the user arrived at. It must not
    // strand them inside one they never opened.
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
