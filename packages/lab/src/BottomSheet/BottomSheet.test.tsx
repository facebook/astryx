// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BottomSheet.test.tsx
 * @input Uses vitest, @testing-library/react, BottomSheet component
 * @output Unit tests for BottomSheet component behavior
 * @position Lab testing; validates BottomSheet.tsx implementation
 *
 * SYNC: When BottomSheet.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {act, render, screen, fireEvent} from '@testing-library/react';
import {createRef, useState} from 'react';
import {BottomSheet} from './BottomSheet';
import {BottomSheetSwitcher} from './BottomSheetSwitcher';

// jsdom doesn't implement <dialog> open/close or pointer capture; stub them.
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
    vi.fn((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    }),
  );
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  window.scrollTo = vi.fn();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function getSheet(): HTMLElement {
  const sheet = document.querySelector<HTMLElement>('.astryx-bottom-sheet');
  if (!sheet) {
    throw new Error('sheet panel not found');
  }
  return sheet;
}

function getBody(): HTMLElement {
  const body = getSheet().lastElementChild;
  if (!(body instanceof HTMLElement)) {
    throw new Error('sheet scroll body not found');
  }
  return body;
}

function getPositioner(): HTMLElement {
  const positioner = getSheet().parentElement;
  if (!(positioner instanceof HTMLElement)) {
    throw new Error('sheet positioner not found');
  }
  return positioner;
}

function rect({top, bottom}: {top: number; bottom: number}): DOMRect {
  return {
    x: 0,
    y: top,
    top,
    right: 400,
    bottom,
    left: 0,
    width: 400,
    height: bottom - top,
    toJSON: () => ({}),
  };
}

function resizeEntry(
  borderBoxHeight: number,
  contentBoxHeight = borderBoxHeight,
): ResizeObserverEntry {
  return {
    borderBoxSize: [{blockSize: borderBoxHeight, inlineSize: 100}],
    contentRect: rect({top: 0, bottom: contentBoxHeight}),
  } as ResizeObserverEntry;
}

function mockVisualViewport(height: number, offsetTop = 0) {
  const viewport = Object.assign(new EventTarget(), {
    height,
    offsetTop,
  });
  vi.stubGlobal('visualViewport', viewport);
  return viewport;
}

function mockIOSWebKit() {
  const navigatorMock = Object.create(window.navigator);
  Object.defineProperties(navigatorMock, {
    userAgent: {
      configurable: true,
      value:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15',
    },
    maxTouchPoints: {configurable: true, value: 5},
  });
  vi.stubGlobal('navigator', navigatorMock);
}

interface ResizeObserverRecord {
  callback: ResizeObserverCallback;
  observed: Set<Element>;
}

function mockResizeObserverInstances(): ResizeObserverRecord[] {
  const observers: ResizeObserverRecord[] = [];
  class ResizeObserverMock {
    callback: ResizeObserverCallback;
    observed = new Set<Element>();

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
      observers.push(this);
    }

    observe(target: Element) {
      this.observed.add(target);
    }

    unobserve(target: Element) {
      this.observed.delete(target);
    }

    disconnect() {
      this.observed.clear();
    }
  }
  vi.stubGlobal('ResizeObserver', ResizeObserverMock);
  return observers;
}

function finishSheetExit() {
  fireEvent.transitionEnd(getSheet(), {propertyName: 'transform'});
}

function ExitHarness({hasScrim}: {hasScrim?: boolean}) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <BottomSheet
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      label="Filters"
      hasScrim={hasScrim}>
      <button type="button" onClick={() => setIsOpen(false)}>
        Close sheet
      </button>
    </BottomSheet>
  );
}

// The grab handle is the panel's first child (decorative, aria-hidden).
function getHandle(): HTMLElement {
  const handle = getSheet().querySelector<HTMLElement>('[aria-hidden="true"]');
  if (!handle) {
    throw new Error('grab handle not found');
  }
  return handle;
}

// Drive a pointer drag on the grab handle. jsdom PointerEvents don't carry
// clientY, so dispatch plain events with the coords the handlers read.
function drag(handle: HTMLElement, points: {y: number}[]) {
  const [down, ...rest] = points;
  fireEvent.pointerDown(handle, {
    pointerId: 1,
    clientY: down.y,
    button: 0,
    isPrimary: true,
  });
  for (const p of rest) {
    fireEvent.pointerMove(handle, {pointerId: 1, clientY: p.y});
  }
  const last = points[points.length - 1];
  fireEvent.pointerUp(handle, {pointerId: 1, clientY: last.y});
}

function fireTouchPointer(
  target: Element,
  type: 'pointerdown' | 'pointermove' | 'pointerup',
  {x, y}: {x: number; y: number},
) {
  const event = new Event(type, {bubbles: true, cancelable: true});
  Object.defineProperties(event, {
    clientX: {value: x},
    clientY: {value: y},
    isPrimary: {value: true},
    pointerId: {value: 1},
    pointerType: {value: 'touch'},
  });
  return fireEvent(target, event);
}

function fireTimedPointer(
  target: Element,
  type: 'pointerdown' | 'pointermove' | 'pointerup',
  {time, y}: {time: number; y: number},
) {
  const event = new Event(type, {bubbles: true, cancelable: true});
  Object.defineProperties(event, {
    button: {value: 0},
    clientY: {value: y},
    isPrimary: {value: true},
    pointerId: {value: 1},
    timeStamp: {value: time},
  });
  return fireEvent(target, event);
}

describe('BottomSheet', () => {
  it('renders children when open and applies the accessible label', () => {
    render(
      <BottomSheet isOpen onOpenChange={() => {}} label="Filters">
        Sheet content
      </BottomSheet>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAccessibleName('Filters');
    expect(screen.getByText('Sheet content')).toBeInTheDocument();
  });

  it('forwards DOM props and refs to the visual panel, not the dialog host', () => {
    const panelRef = createRef<HTMLDivElement>();
    const onClick = vi.fn();
    render(
      <BottomSheet
        ref={panelRef}
        isOpen
        onOpenChange={() => {}}
        label="Filters"
        data-testid="filters-panel"
        data-sheet-owner="search"
        className="custom-panel"
        onClick={onClick}>
        Content
      </BottomSheet>,
    );

    const panel = screen.getByTestId('filters-panel');
    const dialog = screen.getByRole('dialog');
    expect(panelRef.current).toBe(panel);
    expect(panel.tagName).toBe('DIV');
    expect(panel).toHaveClass('astryx-bottom-sheet', 'custom-panel');
    expect(panel).toHaveAttribute('data-sheet-owner', 'search');
    expect(dialog).not.toHaveAttribute('data-testid');

    fireEvent.click(panel);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('keeps consumer content as the last scroll-body child', () => {
    render(
      <BottomSheet isOpen onOpenChange={() => {}} label="Filters">
        <div data-testid="consumer-content">Sheet content</div>
      </BottomSheet>,
    );
    const body = getBody();
    const consumer = screen.getByTestId('consumer-content');

    expect(body.children).toHaveLength(1);
    expect(body.lastElementChild).toBe(consumer);
    expect(consumer.matches(':last-child')).toBe(true);
  });

  it('does not show when isOpen is false', () => {
    render(
      <BottomSheet isOpen={false} onOpenChange={() => {}} label="Filters">
        Hidden
      </BottomSheet>,
    );
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
  });

  it('opens modally (showModal + aria-modal)', () => {
    render(
      <BottomSheet isOpen onOpenChange={() => {}} label="Filters">
        Content
      </BottomSheet>,
    );
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('requests close on Escape', () => {
    const onOpenChange = vi.fn();
    render(
      <BottomSheet isOpen onOpenChange={onOpenChange} label="Filters">
        Content
      </BottomSheet>,
    );
    fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Escape'});
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('requests close when the scrim (dialog element itself) is clicked', () => {
    const onOpenChange = vi.fn();
    render(
      <BottomSheet isOpen onOpenChange={onOpenChange} label="Filters">
        Content
      </BottomSheet>,
    );
    fireEvent.click(screen.getByRole('dialog'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('purpose=form blocks scrim and swipe dismissal but allows Escape', () => {
    const onOpenChange = vi.fn();
    render(
      <BottomSheet
        isOpen
        purpose="form"
        onOpenChange={onOpenChange}
        label="Edit profile">
        Content
      </BottomSheet>,
    );
    const dialog = screen.getByRole('dialog');

    fireEvent.click(dialog);
    drag(getHandle(), [{y: 0}, {y: 40}, {y: 120}]);

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(dialog).toHaveStyle({'--_sheet-scrim-opacity': '1'});

    fireEvent.keyDown(dialog, {key: 'Escape'});
    fireEvent(dialog, new Event('cancel', {cancelable: true}));

    expect(onOpenChange).toHaveBeenCalledTimes(2);
    expect(onOpenChange).toHaveBeenNthCalledWith(1, false);
    expect(onOpenChange).toHaveBeenNthCalledWith(2, false);
  });

  it('purpose=required blocks every implicit dismissal path', () => {
    const onOpenChange = vi.fn();
    render(
      <BottomSheet
        isOpen
        purpose="required"
        onOpenChange={onOpenChange}
        label="Required action">
        Content
      </BottomSheet>,
    );
    const dialog = screen.getByRole('alertdialog');

    fireEvent.click(dialog);
    fireEvent.keyDown(dialog, {key: 'Escape'});
    fireEvent(dialog, new Event('cancel', {cancelable: true}));
    drag(getHandle(), [{y: 0}, {y: 40}, {y: 120}]);

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(dialog).toHaveStyle({'--_sheet-scrim-opacity': '1'});
  });

  it('keeps a standalone modal sheet presented through its exit animation', () => {
    render(<ExitHarness />);
    const dialog = screen.getByRole('dialog', {name: 'Filters'});

    fireEvent.click(screen.getByRole('button', {name: 'Close sheet'}));

    expect(dialog).toHaveAttribute('open');
    expect(dialog).toHaveAttribute('inert');
    expect(dialog).toHaveAttribute('aria-hidden', 'true');
    expect(dialog).not.toHaveAttribute('aria-modal');
    expect(dialog).toHaveStyle({'--_sheet-scrim-opacity': '0'});
    expect(document.body.style.position).toBe('fixed');

    finishSheetExit();

    expect(dialog).not.toHaveAttribute('open');
    expect(document.body.style.position).not.toBe('fixed');
  });

  it('does not dismiss when the sheet surface itself is clicked', () => {
    const onOpenChange = vi.fn();
    render(
      <BottomSheet isOpen onOpenChange={onOpenChange} label="Filters">
        Content
      </BottomSheet>,
    );
    // Only a click that lands on the dialog (the transparent area) dismisses;
    // clicks bubbling up from the sheet must not.
    fireEvent.click(screen.getByText('Content'));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  describe('hasScrim={false} (non-modal)', () => {
    it('opens non-modally: show() instead of showModal(), no aria-modal', () => {
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Filters"
          hasScrim={false}>
          Content
        </BottomSheet>,
      );
      expect(HTMLDialogElement.prototype.show).toHaveBeenCalled();
      expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-modal');
    });

    it('does not dismiss when the shell (dialog element itself) is clicked', () => {
      // No scrim: a tap on the transparent shell must pass through to the page,
      // not dismiss the sheet.
      const onOpenChange = vi.fn();
      render(
        <BottomSheet
          isOpen
          onOpenChange={onOpenChange}
          label="Filters"
          hasScrim={false}>
          Content
        </BottomSheet>,
      );
      fireEvent.click(screen.getByRole('dialog'));
      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it('still closes on Escape while focus is inside', () => {
      const onOpenChange = vi.fn();
      render(
        <BottomSheet
          isOpen
          onOpenChange={onOpenChange}
          label="Filters"
          hasScrim={false}>
          Content
        </BottomSheet>,
      );
      fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Escape'});
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('still dismisses on a downward swipe past the threshold', () => {
      const onOpenChange = vi.fn();
      render(
        <BottomSheet
          isOpen
          onOpenChange={onOpenChange}
          label="Filters"
          hasScrim={false}>
          Content
        </BottomSheet>,
      );
      drag(getHandle(), [{y: 0}, {y: 40}, {y: 120}]);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('does not steal focus onto the panel on open', () => {
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Filters"
          hasScrim={false}>
          <button type="button">First action</button>
        </BottomSheet>,
      );
      // The background stays interactive, so the sheet must not grab focus.
      expect(document.activeElement).not.toBe(getSheet());
    });

    it('still honors a descendant with data-autofocus', () => {
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Filters"
          hasScrim={false}>
          <input data-autofocus aria-label="Search" />
        </BottomSheet>,
      );
      expect(document.activeElement).toBe(
        screen.getByRole('textbox', {name: 'Search'}),
      );
    });

    it('keeps a standalone non-modal sheet visible until its exit ends', () => {
      render(<ExitHarness hasScrim={false} />);
      const dialog = screen.getByRole('dialog', {name: 'Filters'});

      fireEvent.click(screen.getByRole('button', {name: 'Close sheet'}));

      expect(dialog).toHaveAttribute('open');
      expect(dialog).toHaveAttribute('inert');
      expect(document.body.style.position).not.toBe('fixed');

      finishSheetExit();

      expect(dialog).not.toHaveAttribute('open');
    });
  });

  describe('grab handle', () => {
    it('renders a decorative handle hidden from assistive tech', () => {
      render(
        <BottomSheet isOpen onOpenChange={() => {}} label="Filters">
          Content
        </BottomSheet>,
      );
      const handle = getHandle();
      expect(handle).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('swipe to dismiss', () => {
    it('requests close when dragged past the dismiss threshold', () => {
      const onOpenChange = vi.fn();
      render(
        <BottomSheet isOpen onOpenChange={onOpenChange} label="Filters">
          Content
        </BottomSheet>,
      );
      // No measured height in jsdom (0) -> any downward drag dismisses via
      // the distance branch (offset > 0.25) once released downward.
      drag(getHandle(), [{y: 0}, {y: 40}, {y: 120}]);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('restores the sheet when a context menu interrupts an active drag', () => {
      const onOpenChange = vi.fn();
      render(
        <BottomSheet isOpen onOpenChange={onOpenChange} label="Filters">
          Content
        </BottomSheet>,
      );
      const handle = getHandle();
      const dialog = screen.getByRole('dialog');

      fireEvent.pointerDown(handle, {
        pointerId: 1,
        clientY: 0,
        button: 0,
        isPrimary: true,
      });
      fireEvent.pointerMove(handle, {pointerId: 1, clientY: 300});
      expect(getSheet().style.transform).toBe('translateY(300px)');

      expect(fireEvent.contextMenu(handle)).toBe(false);

      expect(getSheet().style.transform).toBe('');
      expect(dialog).toHaveStyle({'--_sheet-scrim-opacity': '1'});
      expect(onOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('height', () => {
    it('renders for each named height without error', () => {
      for (const height of ['hug', 'capped', 'tall'] as const) {
        const {unmount} = render(
          <BottomSheet
            isOpen
            onOpenChange={() => {}}
            label="Filters"
            height={height}>
            Content
          </BottomSheet>,
        );
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        unmount();
      }
    });

    it('accepts a freeform height (number or CSS length)', () => {
      for (const height of [480, '70dvh'] as const) {
        const {unmount} = render(
          <BottomSheet
            isOpen
            onOpenChange={() => {}}
            label="Filters"
            height={height}>
            Content
          </BottomSheet>,
        );
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        unmount();
      }
    });

    it('keeps the full layout height at the peek detent', () => {
      const observers = mockResizeObserverInstances();
      mockVisualViewport(800);
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Release notes"
          height="tall">
          Content
        </BottomSheet>,
      );
      const sheet = getSheet();
      const sheetObserver = observers.find(instance =>
        instance.observed.has(sheet),
      );
      act(() => {
        sheetObserver?.callback(
          [resizeEntry(784, 736)],
          sheetObserver as unknown as ResizeObserver,
        );
      });

      // Settle on the shortest 112px peek: offset 736 - 112 = 624.
      fireTimedPointer(getHandle(), 'pointerdown', {time: 0, y: 0});
      fireTimedPointer(getHandle(), 'pointermove', {time: 1000, y: 600});
      fireTimedPointer(getHandle(), 'pointerup', {time: 2000, y: 600});
      fireEvent.transitionEnd(sheet, {propertyName: 'transform'});

      // A glance state does not reflow the content into a sliver: the sheet
      // keeps its full layout height and slides below the viewport instead.
      expect(sheet.style.height).toBe('');
      expect(sheet.style.transform).toBe('translateY(624px)');
      expect(getBody().style.paddingBlockEnd).toBe('');

      // Dragging back up off the peek stays transform-only for the same
      // reason — there is no shortened layout to restore first.
      fireTimedPointer(getHandle(), 'pointerdown', {time: 3000, y: 600});
      fireTimedPointer(getHandle(), 'pointermove', {time: 4000, y: 400});
      expect(sheet.style.transform).toBe('translateY(424px)');
      expect(sheet.style.height).toBe('784px');
      expect(getBody().style.paddingBlockEnd).toBe('');

      // Releasing at the taller p50 detent resizes the scrolling area.
      fireTimedPointer(getHandle(), 'pointerup', {time: 5000, y: 400});
      fireEvent.transitionEnd(sheet, {propertyName: 'transform'});
      expect(sheet.style.height).toBe('448px');
      expect(sheet.style.transform).toBe('');
    });

    it('swaps height for transform without a transition when released on a detent', () => {
      const observers = mockResizeObserverInstances();
      mockVisualViewport(800);
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Release notes"
          height="tall">
          Content
        </BottomSheet>,
      );
      const sheet = getSheet();
      const sheetObserver = observers.find(instance =>
        instance.observed.has(sheet),
      );
      act(() => {
        sheetObserver?.callback(
          [resizeEntry(784, 736)],
          sheetObserver as unknown as ResizeObserver,
        );
      });

      // magnetize() lands a slow drag exactly on the p50 detent (offset 336),
      // so the release has no travel left to animate and reconciles at once.
      fireTimedPointer(getHandle(), 'pointerdown', {time: 0, y: 0});
      fireTimedPointer(getHandle(), 'pointermove', {time: 1000, y: 336});
      expect(sheet.style.transform).toBe('translateY(336px)');
      expect(sheet.style.height).toBe('784px');

      // Hold the reconciliation frame so the intermediate render is visible
      // to the assertions below.
      const reconciliationFrames: FrameRequestCallback[] = [];
      vi.mocked(requestAnimationFrame).mockImplementation(callback => {
        reconciliationFrames.push(callback);
        return reconciliationFrames.length;
      });
      fireTimedPointer(getHandle(), 'pointerup', {time: 2000, y: 336});

      // Height and transform swap roles in this one render. That is only
      // invisible with transitions off; live, the composited transform would
      // animate the whole 336px swap while the height jumped, and the sheet
      // would lurch away from the detent before coming back to it.
      expect(sheet.style.height).toBe('448px');
      expect(sheet.style.transform).toBe('');
      expect(sheet.style.transition).toBe('none');

      // Transitions come back for the next gesture.
      act(() => reconciliationFrames.splice(0).forEach(frame => frame(0)));
      expect(sheet.style.transition).toBe('');
    });

    it('uses transforms while dragging and resizes to the visible snapped height', () => {
      const observers = mockResizeObserverInstances();
      mockVisualViewport(800);
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Release notes"
          height="tall">
          Content
        </BottomSheet>,
      );
      const sheet = getSheet();
      const sheetObserver = observers.find(instance =>
        instance.observed.has(sheet),
      );
      act(() => {
        sheetObserver?.callback(
          // A Tall sheet has 736px visible height in this 800px viewport plus
          // the 48px border-box reserve held below the viewport.
          [resizeEntry(784, 736)],
          sheetObserver as unknown as ResizeObserver,
        );
      });

      fireTimedPointer(getHandle(), 'pointerdown', {time: 0, y: 0});
      fireTimedPointer(getHandle(), 'pointermove', {time: 1000, y: 240});

      expect(sheet.style.transform).toBe('translateY(240px)');
      expect(sheet.style.height).toBe('784px');
      expect(sheet.style.transition).toBe('none');

      fireTimedPointer(getHandle(), 'pointerup', {time: 2000, y: 240});
      // Release remains transform-only until the snap finishes.
      // p50 is a visible 400px sheet: 784 - 48 - 400 = 336px offset.
      expect(sheet.style.transform).toBe('translateY(336px)');
      expect(sheet.style.height).toBe('784px');
      expect(sheet.style.transition).toBe('');
      const reconciliationFrames: FrameRequestCallback[] = [];
      vi.mocked(requestAnimationFrame).mockImplementation(callback => {
        reconciliationFrames.push(callback);
        return reconciliationFrames.length;
      });
      fireEvent.transitionEnd(sheet, {propertyName: 'transform'});
      expect(sheet.style.transform).toBe('');
      expect(sheet.style.height).toBe('448px');
      // The transform reset is transition-free so it cannot produce a second
      // fly-in animation after the snap has already reached its destination.
      expect(sheet.style.transition).toBe('none');
      expect(reconciliationFrames.length).toBeGreaterThan(0);
      act(() => reconciliationFrames.splice(0).forEach(frame => frame(0)));
      expect(sheet.style.transition).toBe('');

      // Ignore ResizeObserver frames from the height reconciliation. The
      // next drag must still use the original 784px border-box height.
      act(() => {
        sheetObserver?.callback(
          [resizeEntry(500, 452)],
          sheetObserver as unknown as ResizeObserver,
        );
      });
      fireTimedPointer(getHandle(), 'pointerdown', {time: 3000, y: 240});
      fireTimedPointer(getHandle(), 'pointermove', {time: 4000, y: 140});
      expect(sheet.style.transform).toBe('translateY(236px)');
      expect(sheet.style.height).toBe('784px');
      expect(getBody().style.paddingBlockEnd).toBe('336px');

      // Reversing below the settled point restores the settled height and
      // translates only the distance traveled from that detent. The temporary
      // scroll-preservation inset leaves with the temporary expanded layout.
      fireTimedPointer(getHandle(), 'pointermove', {time: 5000, y: 340});
      expect(sheet.style.transform).toBe('translateY(100px)');
      expect(sheet.style.height).toBe('448px');
      expect(getBody().style.paddingBlockEnd).toBe('');
    });

    it('reconciles the snapped height immediately when transitions are disabled', () => {
      const observers = mockResizeObserverInstances();
      mockVisualViewport(800);
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Release notes"
          height="tall"
          style={{transition: 'none'}}>
          Content
        </BottomSheet>,
      );
      const sheet = getSheet();
      const sheetObserver = observers.find(instance =>
        instance.observed.has(sheet),
      );
      act(() => {
        sheetObserver?.callback(
          [resizeEntry(784, 736)],
          sheetObserver as unknown as ResizeObserver,
        );
      });

      fireTimedPointer(getHandle(), 'pointerdown', {time: 0, y: 0});
      fireTimedPointer(getHandle(), 'pointermove', {time: 1000, y: 240});
      fireTimedPointer(getHandle(), 'pointerup', {time: 2000, y: 240});

      expect(sheet.style.transform).toBe('');
      expect(sheet.style.height).toBe('448px');
    });

    it('restores the maximum height before an upward drag and reconciles at snap', () => {
      const observers = mockResizeObserverInstances();
      mockVisualViewport(800);
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Release notes"
          height="tall">
          Content
        </BottomSheet>,
      );
      const sheet = getSheet();
      const sheetObserver = observers.find(instance =>
        instance.observed.has(sheet),
      );
      act(() => {
        sheetObserver?.callback(
          [resizeEntry(784, 736)],
          sheetObserver as unknown as ResizeObserver,
        );
      });

      // Start at the middle 400px detent.
      fireTimedPointer(getHandle(), 'pointerdown', {time: 0, y: 0});
      fireTimedPointer(getHandle(), 'pointermove', {time: 1000, y: 240});
      fireTimedPointer(getHandle(), 'pointerup', {time: 2000, y: 240});
      fireEvent.transitionEnd(sheet, {propertyName: 'transform'});
      expect(sheet.style.height).toBe('448px');

      // The upward gesture renders the full 784px surface below the viewport
      // and translates it to preserve the visible top edge.
      fireTimedPointer(getHandle(), 'pointerdown', {time: 3000, y: 240});
      fireTimedPointer(getHandle(), 'pointermove', {time: 4000, y: 0});
      expect(sheet.style.transform).toBe('translateY(96px)');
      expect(sheet.style.height).toBe('784px');
      expect(getBody().style.paddingBlockEnd).toBe('336px');

      // Release first animates only the transform, keeping the source layout
      // and scroll range fixed for the entire snap.
      fireTimedPointer(getHandle(), 'pointerup', {time: 5000, y: 0});
      expect(sheet.style.transform).toBe('');
      expect(sheet.style.height).toBe('784px');
      expect(getBody().style.paddingBlockEnd).toBe('336px');

      // At transition end, height and preservation spacing reconcile in one
      // render with the same visible geometry.
      fireEvent.transitionEnd(sheet, {propertyName: 'transform'});
      expect(sheet.style.transform).toBe('');
      expect(sheet.style.height).toBe('');
      expect(getBody().style.paddingBlockEnd).toBe('336px');

      // Once ordinary scrolling brings the content back within its natural
      // range, the retained end padding is no longer needed and is discarded.
      const body = getBody();
      Object.defineProperties(body, {
        clientHeight: {configurable: true, value: 600},
        scrollHeight: {configurable: true, value: 1000},
        scrollTop: {configurable: true, value: 64, writable: true},
      });
      fireEvent.scroll(body);
      expect(body.style.paddingBlockEnd).toBe('');
    });

    it('keeps the settled height stable while dismissing', () => {
      const observers = mockResizeObserverInstances();
      mockVisualViewport(800);
      render(<ExitHarness />);
      const sheet = getSheet();
      const sheetObserver = observers.find(instance =>
        instance.observed.has(sheet),
      );
      act(() => {
        sheetObserver?.callback(
          [resizeEntry(784, 736)],
          sheetObserver as unknown as ResizeObserver,
        );
      });

      // First settle at the middle detent.
      fireTimedPointer(getHandle(), 'pointerdown', {time: 0, y: 0});
      fireTimedPointer(getHandle(), 'pointermove', {time: 1000, y: 240});
      fireTimedPointer(getHandle(), 'pointerup', {time: 2000, y: 240});
      fireEvent.transitionEnd(sheet, {propertyName: 'transform'});
      expect(sheet.style.height).toBe('448px');

      // A later dismiss stays transform-only and preserves that settled
      // scroll-area height throughout the exit.
      fireTimedPointer(getHandle(), 'pointerdown', {time: 3000, y: 240});
      fireTimedPointer(getHandle(), 'pointermove', {time: 4000, y: 1000});
      expect(sheet.style.transform).toBe('translateY(760px)');
      expect(sheet.style.height).toBe('448px');
      fireTimedPointer(getHandle(), 'pointerup', {time: 5000, y: 1000});
      expect(sheet.style.height).toBe('448px');

      act(() => {
        sheetObserver?.callback(
          [resizeEntry(200, 152)],
          sheetObserver as unknown as ResizeObserver,
        );
      });
      expect(sheet.style.height).toBe('448px');
    });
  });

  describe('mobile keyboard', () => {
    it('prevents native touch focus panning without moving focus early or duplicating events', () => {
      mockIOSWebKit();
      const onFocus = vi.fn();
      const onBlur = vi.fn();
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Add a comment"
          height="tall">
          <input
            aria-label="Comment"
            onPointerDown={event => event.stopPropagation()}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </BottomSheet>,
      );
      const sheet = getSheet();
      const input = screen.getByRole('textbox', {name: 'Comment'});
      const focus = vi.spyOn(input, 'focus');
      sheet.focus();

      // Pointerdown may still become a scroll gesture, so it must not move
      // focus or open the keyboard early.
      fireTouchPointer(input, 'pointerdown', {x: 20, y: 200});
      expect(focus).not.toHaveBeenCalled();
      expect(onFocus).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(sheet);

      // Pointerup confirms a tap and prevents focus panning. The subsequent
      // native click remains responsible for caret placement.
      fireTouchPointer(input, 'pointerup', {x: 20, y: 200});
      expect(focus).toHaveBeenCalledTimes(1);
      expect(focus).toHaveBeenCalledWith({preventScroll: true});
      expect(document.activeElement).toBe(input);
      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(onBlur).not.toHaveBeenCalled();

      // The native click still runs for caret placement and must not produce a
      // second focus transition.
      fireEvent.click(input);
      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(onBlur).not.toHaveBeenCalled();
    });

    it('does not focus when a touch becomes a scroll gesture', () => {
      mockIOSWebKit();
      const onPreviousBlur = vi.fn();
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Add a comment"
          height="tall">
          <button type="button" onBlur={onPreviousBlur}>
            Previous action
          </button>
          <input aria-label="Comment" />
        </BottomSheet>,
      );
      const body = getBody();
      const previous = screen.getByRole('button', {name: 'Previous action'});
      const input = screen.getByRole('textbox', {name: 'Comment'});
      const focus = vi.spyOn(input, 'focus');
      body.scrollTop = 20;
      previous.focus();

      fireTouchPointer(input, 'pointerdown', {x: 20, y: 200});
      fireTouchPointer(input, 'pointermove', {x: 20, y: 240});
      fireTouchPointer(input, 'pointerup', {x: 20, y: 240});

      expect(focus).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(previous);
      expect(onPreviousBlur).not.toHaveBeenCalled();
    });

    it('does not focus when pointer activation is canceled', () => {
      mockIOSWebKit();
      const onFocus = vi.fn();
      const onPreviousBlur = vi.fn();
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Add a comment"
          height="tall">
          <button type="button" onBlur={onPreviousBlur}>
            Previous action
          </button>
          <input
            aria-label="Comment"
            onPointerDown={event => event.preventDefault()}
            onFocus={onFocus}
          />
        </BottomSheet>,
      );
      const previous = screen.getByRole('button', {name: 'Previous action'});
      const input = screen.getByRole('textbox', {name: 'Comment'});
      const focus = vi.spyOn(input, 'focus');
      previous.focus();

      const pointerDownAllowed = fireTouchPointer(input, 'pointerdown', {
        x: 20,
        y: 200,
      });
      fireTouchPointer(input, 'pointerup', {x: 20, y: 200});

      expect(pointerDownAllowed).toBe(false);
      expect(focus).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(previous);
      expect(onFocus).not.toHaveBeenCalled();
      expect(onPreviousBlur).not.toHaveBeenCalled();
    });

    it('prevents input-to-input focus panning without duplicating focus or blur events', () => {
      mockIOSWebKit();
      const onTitleBlur = vi.fn();
      const onCommentFocus = vi.fn();
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Add a comment"
          height="tall">
          <input aria-label="Title" onBlur={onTitleBlur} />
          <input aria-label="Comment" onFocus={onCommentFocus} />
        </BottomSheet>,
      );
      const title = screen.getByRole('textbox', {name: 'Title'});
      const comment = screen.getByRole('textbox', {name: 'Comment'});
      title.focus();
      const focus = vi.spyOn(comment, 'focus');

      fireTouchPointer(comment, 'pointerdown', {x: 20, y: 200});
      fireTouchPointer(comment, 'pointerup', {x: 20, y: 200});

      expect(focus).toHaveBeenCalledWith({preventScroll: true});
      expect(document.activeElement).toBe(comment);
      expect(onTitleBlur).toHaveBeenCalledTimes(1);
      expect(onCommentFocus).toHaveBeenCalledTimes(1);

      fireEvent.click(comment);
      expect(onTitleBlur).toHaveBeenCalledTimes(1);
      expect(onCommentFocus).toHaveBeenCalledTimes(1);
    });

    it('does not duplicate callbacks during programmatic input-to-input focus', () => {
      mockIOSWebKit();
      const onTitleBlur = vi.fn();
      const onCommentFocus = vi.fn();
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Add a comment"
          height="tall">
          <input aria-label="Title" onBlur={onTitleBlur} />
          <input aria-label="Comment" onFocus={onCommentFocus} />
        </BottomSheet>,
      );
      const title = screen.getByRole('textbox', {name: 'Title'});
      const comment = screen.getByRole('textbox', {name: 'Comment'});

      title.focus();
      comment.focus();

      expect(document.activeElement).toBe(comment);
      expect(onTitleBlur).toHaveBeenCalledTimes(1);
      expect(onCommentFocus).toHaveBeenCalledTimes(1);
    });

    it('does not alter ordinary desktop focus when the viewport is unobstructed', () => {
      mockVisualViewport(800);
      const onFocus = vi.fn();
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Add a comment"
          height="tall">
          <input aria-label="Comment" onFocus={onFocus} />
        </BottomSheet>,
      );
      const input = screen.getByRole('textbox', {name: 'Comment'});
      const focus = vi.spyOn(input, 'focus');

      input.focus();

      expect(focus).not.toHaveBeenCalledWith({preventScroll: true});
      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(getBody().style.getPropertyValue('--_sheet-keyboard-inset')).toBe(
        '0px',
      );
    });

    it('keeps Tall geometry fixed while extending and cleaning up its internal scroll range', () => {
      const viewport = mockVisualViewport(500);
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Add a comment"
          height="tall">
          <input aria-label="Comment" />
        </BottomSheet>,
      );
      const sheet = getSheet();
      const positioner = getPositioner();
      const body = getBody();
      const input = screen.getByRole('textbox', {name: 'Comment'});
      vi.spyOn(sheet, 'getBoundingClientRect').mockReturnValue(
        rect({top: 0, bottom: 800}),
      );
      vi.spyOn(body, 'getBoundingClientRect').mockReturnValue(
        rect({top: 100, bottom: 800}),
      );
      vi.spyOn(input, 'getBoundingClientRect').mockImplementation(() =>
        rect({
          top: 660 - body.scrollTop,
          bottom: 700 - body.scrollTop,
        }),
      );

      const initialRect = sheet.getBoundingClientRect();

      input.focus();

      expect(sheet.getBoundingClientRect()).toEqual(initialRect);
      expect(sheet.style.height).toBe('');
      expect(sheet.style.getPropertyValue('--_sheet-budget')).toBe('92dvh');
      expect(positioner.style.getPropertyValue('--_sheet-keyboard-lift')).toBe(
        '',
      );
      // 300px keyboard overlap + 48px room for Android suggestion UI.
      expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe(
        '348px',
      );
      // Visible bottom is 500px; preserve the same 48px focus gap.
      expect(body.scrollTop).toBe(248);

      viewport.height = 800;
      void act(() => viewport.dispatchEvent(new Event('resize')));
      expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe(
        '0px',
      );
      expect(sheet.getBoundingClientRect()).toEqual(initialRect);
      expect(sheet.style.height).toBe('');
    });

    it('smoothly scrolls a focused Tall control above the keyboard', () => {
      mockVisualViewport(500);
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Add a comment"
          height="tall">
          <input aria-label="Comment" />
        </BottomSheet>,
      );
      const body = getBody();
      const input = screen.getByRole('textbox', {name: 'Comment'});
      const scrollBy = vi.fn((options: ScrollToOptions) => {
        body.scrollTop += options.top ?? 0;
      });
      Object.defineProperty(body, 'scrollBy', {
        configurable: true,
        value: scrollBy,
      });
      vi.spyOn(body, 'getBoundingClientRect').mockReturnValue(
        rect({top: 100, bottom: 800}),
      );
      vi.spyOn(input, 'getBoundingClientRect').mockImplementation(() =>
        rect({
          top: 660 - body.scrollTop,
          bottom: 700 - body.scrollTop,
        }),
      );

      input.focus();

      expect(scrollBy).toHaveBeenCalledWith({top: 248, behavior: 'smooth'});
    });

    it('does not add clearance or scroll when the viewport is unobstructed', () => {
      mockVisualViewport(800);
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Add a comment"
          height="tall">
          <input aria-label="Comment" />
        </BottomSheet>,
      );
      const body = getBody();
      const input = screen.getByRole('textbox', {name: 'Comment'});
      vi.spyOn(body, 'getBoundingClientRect').mockReturnValue(
        rect({top: 100, bottom: 800}),
      );
      vi.spyOn(input, 'getBoundingClientRect').mockReturnValue(
        rect({top: 760, bottom: 790}),
      );

      input.focus();

      expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe(
        '0px',
      );
      expect(body.scrollTop).toBe(0);
    });

    it('does not accommodate the keyboard at a shorter Tall detent', () => {
      mockIOSWebKit();
      const observers = mockResizeObserverInstances();
      const viewport = mockVisualViewport(800);
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Add a comment"
          height="tall">
          <input aria-label="Comment" />
        </BottomSheet>,
      );
      const sheet = getSheet();
      const body = getBody();
      const input = screen.getByRole('textbox', {name: 'Comment'});
      const sheetObserver = observers.find(instance =>
        instance.observed.has(sheet),
      );
      expect(sheetObserver).toBeDefined();
      act(() => {
        sheetObserver?.callback(
          [resizeEntry(784)],
          sheetObserver as unknown as ResizeObserver,
        );
      });

      fireTimedPointer(getHandle(), 'pointerdown', {time: 0, y: 0});
      fireTimedPointer(getHandle(), 'pointermove', {time: 1000, y: 240});
      fireTimedPointer(getHandle(), 'pointerup', {time: 2000, y: 240});
      fireEvent.transitionEnd(sheet, {propertyName: 'transform'});
      // Settled at the p50 detent: 400px of visible sheet plus the 48px
      // border-box reserve held below the viewport.
      expect(sheet.style.transform).toBe('');
      expect(sheet.style.height).toBe('448px');

      vi.spyOn(body, 'getBoundingClientRect').mockReturnValue(
        rect({top: 500, bottom: 1200}),
      );
      vi.spyOn(input, 'getBoundingClientRect').mockReturnValue(
        rect({top: 700, bottom: 740}),
      );
      viewport.height = 500;
      const focus = vi.spyOn(input, 'focus');
      fireTouchPointer(input, 'pointerdown', {x: 20, y: 700});
      fireTouchPointer(input, 'pointerup', {x: 20, y: 700});
      expect(focus).not.toHaveBeenCalled();

      focus.mockRestore();
      input.focus();
      void act(() => viewport.dispatchEvent(new Event('resize')));

      expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe(
        '0px',
      );
      expect(body.scrollTop).toBe(0);
      // The keyboard moved nothing: the sheet still rests at that detent.
      expect(sheet.style.transform).toBe('');
      expect(sheet.style.height).toBe('448px');
    });

    it.each([
      ['Hug', 'hug'],
      ['Capped', 'capped'],
      ['numeric', 480],
      ['custom CSS', '70dvh'],
    ] as const)(
      'does not add keyboard behavior to a %s height',
      (_label, height) => {
        mockIOSWebKit();
        const viewport = mockVisualViewport(500);
        render(
          <BottomSheet
            isOpen
            onOpenChange={() => {}}
            label="Add a comment"
            height={height}>
            <input aria-label="Comment" />
          </BottomSheet>,
        );
        const sheet = getSheet();
        const positioner = getPositioner();
        const body = getBody();
        const input = screen.getByRole('textbox', {name: 'Comment'});
        const focus = vi.spyOn(input, 'focus');
        const sheetFocus = vi.spyOn(sheet, 'focus');
        vi.spyOn(body, 'getBoundingClientRect').mockReturnValue(
          rect({top: 400, bottom: 800}),
        );
        vi.spyOn(input, 'getBoundingClientRect').mockReturnValue(
          rect({top: 700, bottom: 740}),
        );
        body.scrollTop = 20;

        fireEvent.touchStart(input);
        fireTouchPointer(input, 'pointerdown', {x: 20, y: 200});
        fireTouchPointer(input, 'pointerup', {x: 20, y: 200});
        fireEvent.pointerDown(input, {pointerId: 1, clientY: 200});
        body.scrollTop = 120;
        fireEvent.focus(input, {relatedTarget: null});
        void act(() => viewport.dispatchEvent(new Event('resize')));

        expect(body.scrollTop).toBe(120);
        expect(focus).not.toHaveBeenCalled();
        expect(sheetFocus).not.toHaveBeenCalled();
        expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe('');
        expect(
          positioner.style.getPropertyValue('--_sheet-keyboard-lift'),
        ).toBe('');
        expect(sheet.style.height).toBe('');
      },
    );

    it.each([
      ['standalone no-scrim', 'standalone', false],
      ['modal switcher', 'switcher', true],
      ['no-scrim switcher', 'switcher', false],
    ] as const)(
      'supports Tall internal keyboard scrolling in a %s presentation',
      (_label, host, hasScrim) => {
        mockVisualViewport(500);
        const content = <input aria-label="Comment" />;
        const result =
          host === 'standalone'
            ? render(
                <BottomSheet
                  isOpen
                  onOpenChange={() => {}}
                  label="Add a comment"
                  height="tall"
                  hasScrim={hasScrim}>
                  {content}
                </BottomSheet>,
              )
            : render(
                <BottomSheetSwitcher
                  activeSheet="comment"
                  onActiveSheetChange={() => {}}
                  hasScrim={hasScrim}>
                  <BottomSheet
                    sheetId="comment"
                    label="Add a comment"
                    height="tall">
                    {content}
                  </BottomSheet>
                </BottomSheetSwitcher>,
              );
        const body = getBody();
        const input = screen.getByRole('textbox', {name: 'Comment'});
        vi.spyOn(body, 'getBoundingClientRect').mockReturnValue(
          rect({top: 100, bottom: 800}),
        );
        vi.spyOn(input, 'getBoundingClientRect').mockImplementation(() =>
          rect({
            top: 660 - body.scrollTop,
            bottom: 700 - body.scrollTop,
          }),
        );

        input.focus();

        expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe(
          '348px',
        );
        expect(body.scrollTop).toBe(248);
        result.unmount();
      },
    );

    it('re-reveals a focused Tall control when content layout changes', () => {
      const observers = mockResizeObserverInstances();
      mockVisualViewport(500);
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Add a comment"
          height="tall">
          <input aria-label="Comment" />
        </BottomSheet>,
      );
      const body = getBody();
      const input = screen.getByRole('textbox', {name: 'Comment'});
      let layoutShift = 0;
      vi.spyOn(body, 'getBoundingClientRect').mockReturnValue(
        rect({top: 100, bottom: 800}),
      );
      vi.spyOn(input, 'getBoundingClientRect').mockImplementation(() =>
        rect({
          top: 660 + layoutShift - body.scrollTop,
          bottom: 700 + layoutShift - body.scrollTop,
        }),
      );

      input.focus();
      expect(body.scrollTop).toBe(248);

      layoutShift = 200;
      const observer = observers.find(instance => instance.observed.has(input));
      expect(observer).toBeDefined();
      act(() => {
        observer?.callback([], observer as unknown as ResizeObserver);
      });

      expect(body.scrollTop).toBe(448);
    });

    it('retains Tall keyboard scroll space during travel until the viewport recovers', () => {
      const viewport = mockVisualViewport(500);
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Add a comment"
          height="tall">
          <input aria-label="Comment" />
        </BottomSheet>,
      );
      const sheet = getSheet();
      const positioner = getPositioner();
      const body = getBody();
      const input = screen.getByRole('textbox', {name: 'Comment'});
      vi.spyOn(sheet, 'getBoundingClientRect').mockReturnValue(
        rect({top: 0, bottom: 800}),
      );
      vi.spyOn(body, 'getBoundingClientRect').mockReturnValue(
        rect({top: 100, bottom: 800}),
      );
      vi.spyOn(input, 'getBoundingClientRect').mockImplementation(() =>
        rect({
          top: 660 - body.scrollTop,
          bottom: 700 - body.scrollTop,
        }),
      );

      input.focus();
      expect(body.scrollTop).toBe(248);
      expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe(
        '348px',
      );

      const pointerDownAllowed = fireEvent.pointerDown(getHandle(), {
        pointerId: 1,
        clientY: 0,
        button: 0,
        isPrimary: true,
      });
      expect(pointerDownAllowed).toBe(false);
      expect(document.activeElement).toBe(input);

      fireEvent.pointerMove(getHandle(), {pointerId: 1, clientY: 40});

      expect(document.activeElement).toBe(sheet);
      expect(positioner.style.getPropertyValue('--_sheet-keyboard-lift')).toBe(
        '',
      );
      expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe(
        '348px',
      );
      expect(body.scrollTop).toBe(248);

      viewport.height = 800;
      void act(() => viewport.dispatchEvent(new Event('resize')));
      expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe(
        '0px',
      );
    });

    it('retains Tall keyboard scroll space after blur until the viewport recovers', () => {
      const viewport = mockVisualViewport(500);
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Add a comment"
          height="tall">
          <input aria-label="Comment" />
        </BottomSheet>,
      );
      const body = getBody();
      const input = screen.getByRole('textbox', {name: 'Comment'});
      vi.spyOn(body, 'getBoundingClientRect').mockReturnValue(
        rect({top: 100, bottom: 800}),
      );
      vi.spyOn(input, 'getBoundingClientRect').mockImplementation(() =>
        rect({
          top: 660 - body.scrollTop,
          bottom: 700 - body.scrollTop,
        }),
      );
      input.focus();
      expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe(
        '348px',
      );

      input.blur();

      expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe(
        '348px',
      );

      viewport.height = 800;
      void act(() => viewport.dispatchEvent(new Event('resize')));
      expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe(
        '0px',
      );
    });

    it('blurs the focused Tall field and retains its inset until the viewport recovers', () => {
      const viewport = mockVisualViewport(500);
      const onOpenChange = vi.fn();
      const content = (isOpen: boolean) => (
        <BottomSheet
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          label="Add a comment"
          height="tall">
          <input aria-label="Comment" />
        </BottomSheet>
      );
      const {rerender} = render(content(true));
      const body = getBody();
      const input = screen.getByRole('textbox', {name: 'Comment'});
      vi.spyOn(body, 'getBoundingClientRect').mockReturnValue(
        rect({top: 100, bottom: 800}),
      );
      vi.spyOn(input, 'getBoundingClientRect').mockImplementation(() =>
        rect({
          top: 660 - body.scrollTop,
          bottom: 700 - body.scrollTop,
        }),
      );
      input.focus();
      expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe(
        '348px',
      );

      rerender(content(false));

      expect(document.activeElement).not.toBe(input);
      expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe(
        '348px',
      );

      viewport.height = 800;
      void act(() => viewport.dispatchEvent(new Event('resize')));
      expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe(
        '0px',
      );
    });

    it('retains Tall keyboard scroll space through a switcher handoff until the viewport recovers', () => {
      const viewport = mockVisualViewport(500);
      const content = (activeSheet: string) => (
        <BottomSheetSwitcher
          activeSheet={activeSheet}
          onActiveSheetChange={() => {}}>
          <BottomSheet sheetId="comment" label="Add a comment" height="tall">
            <input aria-label="Comment" />
          </BottomSheet>
          <BottomSheet sheetId="confirmation" label="Confirmation">
            Confirmation
          </BottomSheet>
        </BottomSheetSwitcher>
      );
      const {rerender} = render(content('comment'));
      const body = getBody();
      const input = screen.getByRole('textbox', {name: 'Comment'});
      vi.spyOn(body, 'getBoundingClientRect').mockReturnValue(
        rect({top: 100, bottom: 800}),
      );
      vi.spyOn(input, 'getBoundingClientRect').mockImplementation(() =>
        rect({
          top: 660 - body.scrollTop,
          bottom: 700 - body.scrollTop,
        }),
      );
      input.focus();
      expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe(
        '348px',
      );

      rerender(content('confirmation'));

      expect(document.activeElement).not.toBe(input);
      expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe(
        '348px',
      );

      viewport.height = 800;
      void act(() => viewport.dispatchEvent(new Event('resize')));
      expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe(
        '0px',
      );
    });
  });

  describe('focus restore', () => {
    function Harness() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setIsOpen(true)}>
            Open sheet
          </button>
          <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} label="Filters">
            <button type="button" onClick={() => setIsOpen(false)}>
              Done
            </button>
          </BottomSheet>
        </>
      );
    }

    it('restores focus to the opener after close', () => {
      render(<Harness />);
      const opener = screen.getByRole('button', {name: 'Open sheet'});
      opener.focus();
      fireEvent.click(opener);
      fireEvent.click(screen.getByRole('button', {name: 'Done'}));
      finishSheetExit();

      expect(document.activeElement).toBe(opener);
    });
  });

  describe('initial focus', () => {
    it('focuses the sheet panel on open, not the first control', () => {
      render(
        <BottomSheet isOpen onOpenChange={() => {}} label="Filters">
          <button type="button">First action</button>
        </BottomSheet>,
      );
      const panel = getSheet();
      expect(document.activeElement).toBe(panel);
      expect(document.activeElement).not.toBe(
        screen.getByRole('button', {name: 'First action'}),
      );
    });

    it('honors a descendant with data-autofocus', () => {
      render(
        <BottomSheet isOpen onOpenChange={() => {}} label="Filters">
          <input data-autofocus aria-label="Search" />
        </BottomSheet>,
      );
      expect(document.activeElement).toBe(
        screen.getByRole('textbox', {name: 'Search'}),
      );
    });
  });

  describe('accessible name', () => {
    it('warns in development when label is empty', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(
        <BottomSheet isOpen onOpenChange={() => {}} label="">
          Content
        </BottomSheet>,
      );
      expect(
        warn.mock.calls.some(args => String(args[0]).includes('BottomSheet')),
      ).toBe(true);
      warn.mockRestore();
    });
  });

  describe('reduced motion', () => {
    it('opens without throwing when prefers-reduced-motion is set', () => {
      vi.stubGlobal(
        'matchMedia',
        vi.fn().mockReturnValue({
          matches: true,
          media: '(prefers-reduced-motion: reduce)',
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          addListener: vi.fn(),
          removeListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }),
      );
      render(
        <BottomSheet isOpen onOpenChange={() => {}} label="Filters">
          Content
        </BottomSheet>,
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
