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
  vi.stubGlobal('innerHeight', 800);
  window.scrollTo = vi.fn();
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

function showKeyboard(
  viewport: ReturnType<typeof mockVisualViewport>,
  height: number,
  offsetTop = 0,
): void {
  viewport.height = height;
  viewport.offsetTop = offsetTop;
  act(() => viewport.dispatchEvent(new Event('resize')));
}

interface KeyboardRects {
  bodyBottom?: number;
  bodyTop: number;
  inputBottom: number;
  inputTop: number;
  sheetBottom?: number;
  sheetTop: number;
}

function mockKeyboardRects(input: HTMLElement, geometry: KeyboardRects) {
  const sheet = getSheet();
  const positioner = getPositioner();
  const body = getBody();
  const currentLift = () =>
    Number.parseFloat(
      positioner.style.getPropertyValue('--_sheet-keyboard-lift'),
    ) || 0;
  const bodyBottom = geometry.bodyBottom ?? 800;
  const sheetBottom = geometry.sheetBottom ?? 848;

  vi.spyOn(sheet, 'getBoundingClientRect').mockImplementation(() =>
    rect({
      top: geometry.sheetTop - currentLift(),
      bottom: sheetBottom - currentLift(),
    }),
  );
  vi.spyOn(body, 'getBoundingClientRect').mockImplementation(() =>
    rect({
      top: geometry.bodyTop - currentLift(),
      bottom: bodyBottom - currentLift(),
    }),
  );
  vi.spyOn(input, 'getBoundingClientRect').mockImplementation(() =>
    rect({
      top: geometry.inputTop - currentLift() - body.scrollTop,
      bottom: geometry.inputBottom - currentLift() - body.scrollTop,
    }),
  );

  return {body, currentLift, positioner, sheet};
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
    it('focuses pointer-driven text entry without native scrolling', () => {
      const onFocus = vi.fn();
      const onClick = vi.fn();
      render(
        <BottomSheet isOpen onOpenChange={() => {}} label="Add a comment">
          <input aria-label="Comment" onClick={onClick} onFocus={onFocus} />
        </BottomSheet>,
      );
      const body = getBody();
      const input = screen.getByRole('textbox', {name: 'Comment'});
      const nativeFocus = input.focus.bind(input);
      const focus = vi.spyOn(input, 'focus').mockImplementation(options => {
        // Emulate a browser that pans before dispatching focus even though the
        // hook requests preventScroll. The captured position is still restored.
        body.scrollTop = 120;
        nativeFocus(options);
      });
      body.scrollTop = 20;

      const pointerDownAllowed = fireEvent.pointerDown(input, {
        pointerId: 1,
        clientY: 200,
      });
      fireEvent.click(input);

      expect(pointerDownAllowed).toBe(true);
      expect(body.scrollTop).toBe(20);
      expect(focus).toHaveBeenCalledWith({preventScroll: true});
      expect(document.activeElement).toBe(input);
      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('prevents pointer focus scrolling when a control stops propagation', () => {
      render(
        <BottomSheet isOpen onOpenChange={() => {}} label="Add a comment">
          <input
            aria-label="Comment"
            onPointerDown={event => event.stopPropagation()}
          />
        </BottomSheet>,
      );
      const body = getBody();
      const input = screen.getByRole('textbox', {name: 'Comment'});
      const focus = vi.spyOn(input, 'focus');
      body.scrollTop = 20;

      fireEvent.pointerDown(input, {pointerId: 1, clientY: 200});

      expect(body.scrollTop).toBe(20);
      expect(focus).toHaveBeenCalledWith({preventScroll: true});
      expect(document.activeElement).toBe(input);
    });

    it('restores native focus scrolling without duplicating focus events', () => {
      const onTitleBlur = vi.fn();
      const onCommentFocus = vi.fn();
      render(
        <BottomSheet isOpen onOpenChange={() => {}} label="Add a comment">
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

    it('keeps Tall position and height while scrolling internally above the keyboard', () => {
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
      const input = screen.getByRole('textbox', {name: 'Comment'});
      const {body, positioner, sheet} = mockKeyboardRects(input, {
        bodyTop: 112,
        inputBottom: 740,
        inputTop: 700,
        sheetTop: 64,
      });
      const dialog = screen.getByRole('dialog');
      vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue(
        rect({top: 0, bottom: 800}),
      );

      input.focus();
      expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe('');

      showKeyboard(viewport, 500);

      // 300px keyboard overlap + 48px room for Android suggestion UI.
      expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe(
        '348px',
      );
      expect(positioner.style.getPropertyValue('--_sheet-keyboard-lift')).toBe(
        '',
      );
      expect(sheet.getBoundingClientRect().top).toBe(64);
      expect(sheet.getBoundingClientRect().height).toBe(784);
      expect(sheet.style.height).toBe('784px');
      expect(dialog.style.height).toBe('800px');
      // Visible bottom is 500px; preserve the same 48px focus gap.
      expect(body.scrollTop).toBe(288);
      expect(input.getBoundingClientRect().bottom).toBe(452);

      showKeyboard(viewport, 800);
      expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe('');
      expect(positioner.style.getPropertyValue('--_sheet-keyboard-lift')).toBe(
        '',
      );
      expect(sheet.style.height).toBe('');
      expect(dialog.style.height).toBe('');
      expect(sheet.getBoundingClientRect().top).toBe(64);
      expect(sheet.getBoundingClientRect().height).toBe(784);
    });

    it('does not add clearance or scroll when the viewport is unobstructed', () => {
      mockVisualViewport(800);
      render(
        <BottomSheet isOpen onOpenChange={() => {}} label="Add a comment">
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

      expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe('');
      expect(body.scrollTop).toBe(0);
    });

    it('moves Hug upward while preserving and restoring its measured height', () => {
      const viewport = mockVisualViewport(800);
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Add a comment"
          height="hug">
          <input aria-label="Comment" />
        </BottomSheet>,
      );
      const input = screen.getByRole('textbox', {name: 'Comment'});
      const {body, positioner, sheet} = mockKeyboardRects(input, {
        bodyTop: 450,
        inputBottom: 740,
        inputTop: 700,
        sheetTop: 400,
      });

      input.focus();
      showKeyboard(viewport, 500);

      expect(sheet.style.height).toBe('448px');
      expect(positioner.style.getPropertyValue('--_sheet-keyboard-lift')).toBe(
        '300px',
      );
      expect(sheet.getBoundingClientRect().top).toBe(100);
      expect(sheet.getBoundingClientRect().height).toBe(448);
      expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe(
        '48px',
      );
      expect(body.scrollTop).toBe(0);

      showKeyboard(viewport, 800);
      expect(sheet.style.height).toBe('');
      expect(positioner.style.getPropertyValue('--_sheet-keyboard-lift')).toBe(
        '',
      );
      expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe('');
      expect(sheet.getBoundingClientRect().top).toBe(400);
      expect(sheet.getBoundingClientRect().height).toBe(448);
    });

    it('moves Capped upward and keeps its focused control visible', () => {
      const viewport = mockVisualViewport(800);
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Add a comment"
          height="capped">
          <input aria-label="Comment" />
        </BottomSheet>,
      );
      const input = screen.getByRole('textbox', {name: 'Comment'});
      const {body, positioner, sheet} = mockKeyboardRects(input, {
        bodyTop: 352,
        inputBottom: 790,
        inputTop: 750,
        sheetTop: 304,
      });

      input.focus();
      showKeyboard(viewport, 500);

      expect(positioner.style.getPropertyValue('--_sheet-keyboard-lift')).toBe(
        '300px',
      );
      expect(sheet.getBoundingClientRect().top).toBe(4);
      expect(sheet.getBoundingClientRect().height).toBe(544);
      expect(sheet.style.height).toBe('544px');
      expect(body.scrollTop).toBe(38);
      expect(input.getBoundingClientRect().bottom).toBe(452);

      showKeyboard(viewport, 800);
      expect(positioner.style.getPropertyValue('--_sheet-keyboard-lift')).toBe(
        '',
      );
      expect(sheet.style.height).toBe('');
      expect(sheet.getBoundingClientRect().top).toBe(304);
      expect(sheet.getBoundingClientRect().height).toBe(544);
    });

    it('applies the same shorter-sheet movement without a scrim', () => {
      const viewport = mockVisualViewport(800);
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Add a comment"
          height="capped"
          hasScrim={false}>
          <input aria-label="Comment" />
        </BottomSheet>,
      );
      const input = screen.getByRole('textbox', {name: 'Comment'});
      const {positioner, sheet} = mockKeyboardRects(input, {
        bodyTop: 352,
        inputBottom: 740,
        inputTop: 700,
        sheetTop: 304,
      });

      input.focus();
      showKeyboard(viewport, 500);

      expect(positioner.style.getPropertyValue('--_sheet-keyboard-lift')).toBe(
        '300px',
      );
      expect(sheet.getBoundingClientRect().top).toBe(4);
    });

    it('applies the same height-aware behavior inside a switcher', () => {
      const viewport = mockVisualViewport(800);
      render(
        <BottomSheetSwitcher
          activeSheet="details"
          onActiveSheetChange={() => {}}>
          <BottomSheet sheetId="details" label="Details" height="capped">
            <input aria-label="Comment" />
          </BottomSheet>
        </BottomSheetSwitcher>,
      );
      const input = screen.getByRole('textbox', {name: 'Comment'});
      const {positioner, sheet} = mockKeyboardRects(input, {
        bodyTop: 352,
        inputBottom: 740,
        inputTop: 700,
        sheetTop: 304,
      });

      input.focus();
      showKeyboard(viewport, 500);

      expect(positioner.style.getPropertyValue('--_sheet-keyboard-lift')).toBe(
        '300px',
      );
      expect(sheet.getBoundingClientRect().top).toBe(4);
    });

    it('restores pre-existing inline sizing after keyboard dismissal', () => {
      const viewport = mockVisualViewport(800);
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Add a comment"
          style={{height: '50vh'}}>
          <input aria-label="Comment" />
        </BottomSheet>,
      );
      const input = screen.getByRole('textbox', {name: 'Comment'});
      const {sheet} = mockKeyboardRects(input, {
        bodyTop: 450,
        inputBottom: 740,
        inputTop: 700,
        sheetBottom: 800,
        sheetTop: 400,
      });
      expect(sheet.style.height).toBe('50vh');

      input.focus();
      showKeyboard(viewport, 500);
      expect(sheet.style.height).toBe('400px');

      showKeyboard(viewport, 800);
      expect(sheet.style.height).toBe('50vh');
    });

    it('re-reveals a focused control when content layout changes', () => {
      const observers = mockResizeObserverInstances();
      const viewport = mockVisualViewport(800);
      render(
        <BottomSheet isOpen onOpenChange={() => {}} label="Add a comment">
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
      showKeyboard(viewport, 500);
      expect(body.scrollTop).toBe(248);

      layoutShift = 200;
      const observer = observers.find(instance => instance.observed.has(input));
      expect(observer).toBeDefined();
      act(() => {
        observer?.callback([], observer as unknown as ResizeObserver);
      });

      expect(body.scrollTop).toBe(448);
    });

    it('classifies custom heights from their rendered geometry', () => {
      for (const testCase of [
        {height: '40dvh', sheetTop: 64, expectedLift: ''},
        {height: '92dvh', sheetTop: 400, expectedLift: '300px'},
      ] as const) {
        const viewport = mockVisualViewport(800);
        const {unmount} = render(
          <BottomSheet
            isOpen
            onOpenChange={() => {}}
            label="Add a comment"
            height={testCase.height}>
            <input aria-label="Comment" />
          </BottomSheet>,
        );
        const input = screen.getByRole('textbox', {name: 'Comment'});
        const {positioner} = mockKeyboardRects(input, {
          bodyTop: testCase.sheetTop + 48,
          inputBottom: 740,
          inputTop: 700,
          sheetTop: testCase.sheetTop,
        });

        input.focus();
        showKeyboard(viewport, 500);

        expect(
          positioner.style.getPropertyValue('--_sheet-keyboard-lift'),
        ).toBe(testCase.expectedLift);
        unmount();
      }
    });

    it('never moves a shorter sheet beyond the visible viewport top', () => {
      const viewport = mockVisualViewport(800);
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Add a comment"
          height="capped">
          <input aria-label="Comment" />
        </BottomSheet>,
      );
      const input = screen.getByRole('textbox', {name: 'Comment'});
      const {positioner, sheet} = mockKeyboardRects(input, {
        bodyTop: 168,
        inputBottom: 740,
        inputTop: 700,
        sheetTop: 120,
      });

      input.focus();
      showKeyboard(viewport, 250, 50);

      expect(positioner.style.getPropertyValue('--_sheet-keyboard-lift')).toBe(
        '70px',
      );
      expect(sheet.getBoundingClientRect().top).toBe(50);
    });

    it('tracks keyboard animation from stable geometry without oscillating', () => {
      const viewport = mockVisualViewport(800);
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Add a comment"
          height="capped">
          <input aria-label="Comment" />
        </BottomSheet>,
      );
      const input = screen.getByRole('textbox', {name: 'Comment'});
      const {positioner, sheet} = mockKeyboardRects(input, {
        bodyTop: 352,
        inputBottom: 740,
        inputTop: 700,
        sheetTop: 304,
      });
      input.focus();

      showKeyboard(viewport, 650);
      expect(positioner.style.getPropertyValue('--_sheet-keyboard-lift')).toBe(
        '150px',
      );
      expect(sheet.getBoundingClientRect().top).toBe(154);

      showKeyboard(viewport, 500);
      expect(positioner.style.getPropertyValue('--_sheet-keyboard-lift')).toBe(
        '300px',
      );
      expect(sheet.getBoundingClientRect().top).toBe(4);

      showKeyboard(viewport, 500);
      expect(positioner.style.getPropertyValue('--_sheet-keyboard-lift')).toBe(
        '300px',
      );

      showKeyboard(viewport, 600);
      expect(positioner.style.getPropertyValue('--_sheet-keyboard-lift')).toBe(
        '200px',
      );
      expect(sheet.getBoundingClientRect().top).toBe(104);

      showKeyboard(viewport, 800);
      expect(positioner.style.getPropertyValue('--_sheet-keyboard-lift')).toBe(
        '',
      );
      expect(sheet.getBoundingClientRect().top).toBe(304);
    });

    it('retains keyboard layout during travel until the viewport recovers', () => {
      const viewport = mockVisualViewport(800);
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Add a comment"
          height="hug">
          <input aria-label="Comment" />
        </BottomSheet>,
      );
      const input = screen.getByRole('textbox', {name: 'Comment'});
      const {body, positioner, sheet} = mockKeyboardRects(input, {
        bodyTop: 450,
        inputBottom: 740,
        inputTop: 700,
        sheetTop: 400,
      });

      input.focus();
      showKeyboard(viewport, 500);
      expect(positioner.style.getPropertyValue('--_sheet-keyboard-lift')).toBe(
        '300px',
      );
      expect(body.scrollTop).toBe(0);

      fireEvent.pointerDown(getHandle(), {pointerId: 1, clientY: 0});
      fireEvent.pointerMove(getHandle(), {pointerId: 1, clientY: 40});

      expect(document.activeElement).toBe(sheet);
      expect(positioner.style.getPropertyValue('--_sheet-keyboard-lift')).toBe(
        '300px',
      );
      expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe(
        '48px',
      );
      expect(body.scrollTop).toBe(0);

      showKeyboard(viewport, 800);
      expect(positioner.style.getPropertyValue('--_sheet-keyboard-lift')).toBe(
        '',
      );
      expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe('');
    });

    it('keeps keyboard geometry stable as the entrance transform settles', () => {
      const viewport = mockVisualViewport(800);
      render(
        <BottomSheet
          isOpen
          onOpenChange={() => {}}
          label="Add a comment"
          height="hug">
          <input aria-label="Comment" />
        </BottomSheet>,
      );
      const sheet = getSheet();
      const positioner = getPositioner();
      const body = getBody();
      const input = screen.getByRole('textbox', {name: 'Comment'});
      let entranceOffset = 100;
      const currentLift = () =>
        Number.parseFloat(
          positioner.style.getPropertyValue('--_sheet-keyboard-lift'),
        ) || 0;
      vi.spyOn(sheet, 'getBoundingClientRect').mockImplementation(() =>
        rect({
          top: 400 + entranceOffset - currentLift(),
          bottom: 800 + entranceOffset - currentLift(),
        }),
      );
      vi.spyOn(body, 'getBoundingClientRect').mockImplementation(() =>
        rect({
          top: 450 + entranceOffset - currentLift(),
          bottom: 800 + entranceOffset - currentLift(),
        }),
      );
      vi.spyOn(input, 'getBoundingClientRect').mockImplementation(() =>
        rect({
          top: 700 + entranceOffset - currentLift() - body.scrollTop,
          bottom: 740 + entranceOffset - currentLift() - body.scrollTop,
        }),
      );

      input.focus();
      showKeyboard(viewport, 500);
      expect(positioner.style.getPropertyValue('--_sheet-keyboard-lift')).toBe(
        '400px',
      );
      expect(sheet.getBoundingClientRect().top).toBe(100);

      entranceOffset = 0;
      fireEvent.transitionEnd(sheet, {propertyName: 'transform'});

      expect(positioner.style.getPropertyValue('--_sheet-keyboard-lift')).toBe(
        '300px',
      );
      expect(sheet.getBoundingClientRect().top).toBe(100);
      expect(input.getBoundingClientRect().bottom).toBe(440);
    });

    it('keeps the keyboard open for a handle tap and blurs after travel starts', () => {
      render(
        <BottomSheet isOpen onOpenChange={() => {}} label="Add a comment">
          <input aria-label="Comment" />
        </BottomSheet>,
      );
      const input = screen.getByRole('textbox', {name: 'Comment'});
      input.focus();

      const pointerDownAllowed = fireEvent.pointerDown(getHandle(), {
        pointerId: 1,
        clientY: 0,
      });
      expect(pointerDownAllowed).toBe(false);
      expect(document.activeElement).toBe(input);

      fireEvent.pointerMove(getHandle(), {pointerId: 1, clientY: 40});

      expect(document.activeElement).toBe(getSheet());
    });

    it('dismisses the keyboard on close and retains geometry until recovery', () => {
      const viewport = mockVisualViewport(800);
      const onOpenChange = vi.fn();
      const content = (isOpen: boolean) => (
        <BottomSheet
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          label="Add a comment"
          height="hug">
          <input aria-label="Comment" />
        </BottomSheet>
      );
      const {rerender} = render(content(true));
      const input = screen.getByRole('textbox', {name: 'Comment'});
      const {body, positioner, sheet} = mockKeyboardRects(input, {
        bodyTop: 450,
        inputBottom: 740,
        inputTop: 700,
        sheetTop: 400,
      });
      input.focus();
      showKeyboard(viewport, 500);
      expect(positioner.style.getPropertyValue('--_sheet-keyboard-lift')).toBe(
        '300px',
      );

      rerender(content(false));

      expect(document.activeElement).not.toBe(input);
      expect(positioner.style.getPropertyValue('--_sheet-keyboard-lift')).toBe(
        '300px',
      );
      expect(sheet.style.height).toBe('448px');

      showKeyboard(viewport, 800);
      expect(positioner.style.getPropertyValue('--_sheet-keyboard-lift')).toBe(
        '',
      );
      expect(body.style.getPropertyValue('--_sheet-keyboard-inset')).toBe('');
      expect(sheet.style.height).toBe('');
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
