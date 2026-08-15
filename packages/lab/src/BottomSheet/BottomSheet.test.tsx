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

function mockVisualViewport(height: number, offsetTop = 0) {
  const viewport = Object.assign(new EventTarget(), {
    height,
    offsetTop,
  });
  vi.stubGlobal('visualViewport', viewport);
  return viewport;
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
function drag(handle: HTMLElement, points: Array<{y: number}>) {
  const [down, ...rest] = points;
  fireEvent.pointerDown(handle, {pointerId: 1, clientY: down.y});
  for (const p of rest) {
    fireEvent.pointerMove(handle, {pointerId: 1, clientY: p.y});
  }
  const last = points[points.length - 1];
  fireEvent.pointerUp(handle, {pointerId: 1, clientY: last.y});
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
  });

  describe('mobile keyboard', () => {
    it('restores pointer-driven focus scrolling without re-focusing', () => {
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
      const body = getBody();
      const input = screen.getByRole('textbox', {name: 'Comment'});
      const focus = vi.spyOn(input, 'focus');
      body.scrollTop = 20;

      fireEvent.pointerDown(input, {pointerId: 1, clientY: 200});
      expect(focus).not.toHaveBeenCalled();

      // Emulate the browser panning before it dispatches the focus event.
      body.scrollTop = 120;
      fireEvent.focus(input, {relatedTarget: null});

      expect(body.scrollTop).toBe(20);
      expect(focus).not.toHaveBeenCalled();
      expect(onFocus).toHaveBeenCalledTimes(1);
    });

    it('restores pointer focus scrolling when a control stops propagation', () => {
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Add a comment"
          height="tall">
          <input
            aria-label="Comment"
            onPointerDown={event => event.stopPropagation()}
          />
        </BottomSheet>,
      );
      const body = getBody();
      const input = screen.getByRole('textbox', {name: 'Comment'});
      body.scrollTop = 20;

      fireEvent.pointerDown(input, {pointerId: 1, clientY: 200});
      body.scrollTop = 120;
      fireEvent.focus(input, {relatedTarget: null});

      expect(body.scrollTop).toBe(20);
    });

    it('restores native focus scrolling without duplicating focus events', () => {
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
      const body = getBody();
      const title = screen.getByRole('textbox', {name: 'Title'});
      const comment = screen.getByRole('textbox', {name: 'Comment'});
      title.focus();
      body.scrollTop = 20;
      document.addEventListener(
        'focusout',
        () => {
          // Emulate the browser scrolling the destination between focusout and
          // focus. The hook must restore the position before consumer focus.
          body.scrollTop = 120;
        },
        {once: true},
      );

      comment.focus();

      expect(document.activeElement).toBe(comment);
      expect(body.scrollTop).toBe(20);
      expect(onTitleBlur).toHaveBeenCalledTimes(1);
      expect(onCommentFocus).toHaveBeenCalledTimes(1);
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
      act(() => viewport.dispatchEvent(new Event('resize')));
      expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe(
        '0px',
      );
      expect(sheet.getBoundingClientRect()).toEqual(initialRect);
      expect(sheet.style.height).toBe('');
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

    it.each([
      ['Hug', 'hug'],
      ['Capped', 'capped'],
      ['numeric', 480],
      ['custom CSS', '70dvh'],
    ] as const)(
      'does not add keyboard behavior to a %s height',
      (_label, height) => {
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
        vi.spyOn(body, 'getBoundingClientRect').mockReturnValue(
          rect({top: 400, bottom: 800}),
        );
        vi.spyOn(input, 'getBoundingClientRect').mockReturnValue(
          rect({top: 700, bottom: 740}),
        );
        body.scrollTop = 20;

        fireEvent.pointerDown(input, {pointerId: 1, clientY: 200});
        body.scrollTop = 120;
        fireEvent.focus(input, {relatedTarget: null});
        act(() => viewport.dispatchEvent(new Event('resize')));

        expect(body.scrollTop).toBe(120);
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
      act(() => viewport.dispatchEvent(new Event('resize')));
      expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe(
        '0px',
      );
    });

    it('blurs the focused Tall field and clears its inset when closing starts', () => {
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
      input.focus();

      rerender(content(false));

      expect(document.activeElement).not.toBe(input);
      expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe('');
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
