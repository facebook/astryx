// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Drawer.test.tsx
 * @input Uses vitest, @testing-library/react, Drawer component
 * @output Unit tests for Drawer component behavior
 * @position Lab testing; validates Drawer.tsx implementation
 *
 * SYNC: When Drawer.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen, fireEvent, act} from '@testing-library/react';
import {useState} from 'react';
import {Drawer} from './Drawer';
import {DrawerHeader} from './DrawerHeader';

// Mock dialog methods since they're not fully implemented in jsdom
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.show = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  });
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    this.setAttribute('open', '');
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    this.removeAttribute('open');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
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
  vi.unstubAllGlobals();
});

describe('Drawer', () => {
  it('renders children when open', () => {
    render(
      <Drawer isOpen onOpenChange={() => {}} label="Host details">
        Drawer content
      </Drawer>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Drawer content')).toBeInTheDocument();
  });

  it('does not show when isOpen is false', () => {
    render(
      <Drawer isOpen={false} onOpenChange={() => {}} label="Host details">
        Hidden content
      </Drawer>,
    );
    const dialog = screen.getByRole('dialog', {hidden: true});
    expect(dialog).not.toHaveAttribute('open');
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
  });

  it('applies the accessible label', () => {
    render(
      <Drawer isOpen onOpenChange={() => {}} label="Host details">
        Content
      </Drawer>,
    );
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Host details');
  });

  describe('modal vs non-modal', () => {
    it('opens with showModal() and aria-modal by default (hasScrim)', () => {
      render(
        <Drawer isOpen onOpenChange={() => {}} label="Details">
          Content
        </Drawer>,
      );
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
      expect(HTMLDialogElement.prototype.show).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('opens with showPopover() and no aria-modal when hasScrim is false', () => {
      render(
        <Drawer isOpen onOpenChange={() => {}} label="Details" hasScrim={false}>
          Content
        </Drawer>,
      );
      expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
      expect(HTMLDialogElement.prototype.show).not.toHaveBeenCalled();
      expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toHaveAttribute('popover', 'manual');
      expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-modal');
    });

    it('leaves the manual popover and preserves close listeners after exit', () => {
      const {rerender} = render(
        <Drawer isOpen onOpenChange={() => {}} label="Details" hasScrim={false}>
          Content
        </Drawer>,
      );
      const dialog = screen.getByRole('dialog', {hidden: true});
      const handleClose = vi.fn();
      dialog.addEventListener('close', handleClose);

      rerender(
        <Drawer
          isOpen={false}
          onOpenChange={() => {}}
          label="Details"
          hasScrim={false}>
          Content
        </Drawer>,
      );
      act(() => {
        fireEvent.transitionEnd(dialog, {propertyName: 'transform'});
      });

      expect(HTMLElement.prototype.hidePopover).toHaveBeenCalled();
      expect(handleClose).toHaveBeenCalledTimes(1);
      expect(dialog).not.toHaveAttribute('open');
    });

    it('dispatches the synthetic close after focus restore so a close listener owns final focus', () => {
      // Master-detail row switching: the consumer's close listener retargets
      // focus to the latest selected row. Native dialog.close() queues its
      // close event as a task, so such a listener always ran after the
      // drawer's own focus restore — the synthetic popover close must give
      // the consumer the same last word.
      function Fixture({isOpen}: {isOpen: boolean}) {
        return (
          <>
            <button type="button">Open row</button>
            <button type="button">Latest row</button>
            <Drawer
              isOpen={isOpen}
              onOpenChange={() => {}}
              label="Details"
              hasScrim={false}>
              Content
            </Drawer>
          </>
        );
      }
      const {rerender} = render(<Fixture isOpen={false} />);
      const openTrigger = screen.getByRole('button', {name: 'Open row'});
      const latestRow = screen.getByRole('button', {name: 'Latest row'});
      openTrigger.focus();
      rerender(<Fixture isOpen />);

      const dialog = screen.getByRole('dialog', {hidden: true});
      const handleClose = vi.fn(() => latestRow.focus());
      dialog.addEventListener('close', handleClose);

      rerender(<Fixture isOpen={false} />);
      act(() => {
        fireEvent.transitionEnd(dialog, {propertyName: 'transform'});
      });

      expect(handleClose).toHaveBeenCalledTimes(1);
      expect(latestRow).toHaveFocus();
    });

    it('dispatches exactly one close when an open non-modal drawer unmounts', () => {
      const {unmount} = render(
        <Drawer isOpen onOpenChange={() => {}} label="Details" hasScrim={false}>
          Content
        </Drawer>,
      );
      const dialog = screen.getByRole('dialog', {hidden: true});
      const handleClose = vi.fn();
      dialog.addEventListener('close', handleClose);

      unmount();

      expect(HTMLElement.prototype.hidePopover).toHaveBeenCalledTimes(1);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Escape key', () => {
    it('calls onOpenChange(false) on Escape keydown', () => {
      const handleOpenChange = vi.fn();
      render(
        <Drawer isOpen onOpenChange={handleOpenChange} label="Details">
          Content
        </Drawer>,
      );
      fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Escape'});
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it('calls onOpenChange(false) on Escape in non-modal mode (no native cancel)', () => {
      const handleOpenChange = vi.fn();
      render(
        <Drawer
          isOpen
          onOpenChange={handleOpenChange}
          label="Details"
          hasScrim={false}>
          Content
        </Drawer>,
      );
      fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Escape'});
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it('prevents the native cancel event and routes through onOpenChange(false)', () => {
      const handleOpenChange = vi.fn();
      render(
        <Drawer isOpen onOpenChange={handleOpenChange} label="Details">
          Content
        </Drawer>,
      );
      const cancelEvent = new Event('cancel', {cancelable: true});
      fireEvent(screen.getByRole('dialog'), cancelEvent);
      expect(handleOpenChange).toHaveBeenCalledWith(false);
      expect(cancelEvent.defaultPrevented).toBe(true);
    });

    it('ignores other keys', () => {
      const handleOpenChange = vi.fn();
      render(
        <Drawer isOpen onOpenChange={handleOpenChange} label="Details">
          Content
        </Drawer>,
      );
      fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Enter'});
      expect(handleOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('consumer event handlers', () => {
    it('composes a consumer onKeyDown with built-in Escape handling', () => {
      const handleKeyDown = vi.fn();
      const handleOpenChange = vi.fn();
      render(
        <Drawer
          isOpen
          onOpenChange={handleOpenChange}
          label="Details"
          onKeyDown={handleKeyDown}>
          Content
        </Drawer>,
      );
      fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Escape'});
      expect(handleKeyDown).toHaveBeenCalledTimes(1);
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it('lets a consumer preventDefault opt out of built-in Escape handling', () => {
      const handleOpenChange = vi.fn();
      render(
        <Drawer
          isOpen
          onOpenChange={handleOpenChange}
          label="Details"
          onKeyDown={event => event.preventDefault()}>
          Content
        </Drawer>,
      );
      fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Escape'});
      expect(handleOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('scrim click', () => {
    it('calls onOpenChange(false) when the ::backdrop (dialog element itself) is clicked', () => {
      const handleOpenChange = vi.fn();
      render(
        <Drawer isOpen onOpenChange={handleOpenChange} label="Details">
          Content
        </Drawer>,
      );
      fireEvent.click(screen.getByRole('dialog'));
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it('does not close when drawer content is clicked', () => {
      const handleOpenChange = vi.fn();
      render(
        <Drawer isOpen onOpenChange={handleOpenChange} label="Details">
          <button type="button">Inside</button>
        </Drawer>,
      );
      fireEvent.click(screen.getByRole('button', {name: 'Inside'}));
      expect(handleOpenChange).not.toHaveBeenCalled();
    });

    it('does not close on self-click when non-modal (no scrim to click)', () => {
      const handleOpenChange = vi.fn();
      render(
        <Drawer
          isOpen
          onOpenChange={handleOpenChange}
          label="Details"
          hasScrim={false}>
          Content
        </Drawer>,
      );
      fireEvent.click(screen.getByRole('dialog'));
      expect(handleOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('close and focus restore', () => {
    function Harness() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setIsOpen(true)}>
            Open inspector
          </button>
          <Drawer isOpen={isOpen} onOpenChange={setIsOpen} label="Inspector">
            <button type="button" onClick={() => setIsOpen(false)}>
              Close inspector
            </button>
          </Drawer>
        </>
      );
    }

    it('delays dialog.close() so the exit transition can play', () => {
      vi.useFakeTimers();
      try {
        render(<Harness />);
        fireEvent.click(screen.getByRole('button', {name: 'Open inspector'}));
        const dialog = screen.getByRole('dialog', {hidden: true});
        expect(dialog).toHaveAttribute('open');

        fireEvent.click(screen.getByRole('button', {name: 'Close inspector'}));
        // Still open while the slide-out transition plays
        expect(dialog).toHaveAttribute('open');
        act(() => {
          vi.advanceTimersByTime(250);
        });
        expect(dialog).toHaveAttribute('open');
        act(() => {
          vi.advanceTimersByTime(300);
        });
        expect(dialog).not.toHaveAttribute('open');
      } finally {
        vi.useRealTimers();
      }
    });

    it('closes as soon as the slide-out transition ends', () => {
      vi.useFakeTimers();
      try {
        render(<Harness />);
        fireEvent.click(screen.getByRole('button', {name: 'Open inspector'}));
        const dialog = screen.getByRole('dialog', {hidden: true});

        fireEvent.click(screen.getByRole('button', {name: 'Close inspector'}));
        expect(dialog).toHaveAttribute('open');

        // The transition is authoritative — no need to wait out the backstop.
        act(() => {
          fireEvent.transitionEnd(dialog, {propertyName: 'transform'});
        });
        expect(dialog).not.toHaveAttribute('open');
      } finally {
        vi.useRealTimers();
      }
    });

    it('keeps sliding while a transitionend for another property arrives', () => {
      vi.useFakeTimers();
      try {
        render(<Harness />);
        fireEvent.click(screen.getByRole('button', {name: 'Open inspector'}));
        const dialog = screen.getByRole('dialog', {hidden: true});

        fireEvent.click(screen.getByRole('button', {name: 'Close inspector'}));
        act(() => {
          fireEvent.transitionEnd(dialog, {propertyName: 'opacity'});
        });
        expect(dialog).toHaveAttribute('open');
      } finally {
        vi.useRealTimers();
      }
    });

    it('restores focus to the trigger element on close', () => {
      vi.useFakeTimers();
      try {
        render(<Harness />);
        const trigger = screen.getByRole('button', {name: 'Open inspector'});
        trigger.focus();
        fireEvent.click(trigger);

        fireEvent.click(screen.getByRole('button', {name: 'Close inspector'}));
        act(() => {
          vi.advanceTimersByTime(300);
        });
        expect(trigger).toHaveFocus();
      } finally {
        vi.useRealTimers();
      }
    });

    it('can be re-opened after closing', () => {
      vi.useFakeTimers();
      try {
        render(<Harness />);
        const dialog = screen.getByRole('dialog', {hidden: true});

        fireEvent.click(screen.getByRole('button', {name: 'Open inspector'}));
        expect(dialog).toHaveAttribute('open');

        fireEvent.click(screen.getByRole('button', {name: 'Close inspector'}));
        act(() => {
          vi.advanceTimersByTime(300);
        });
        expect(dialog).not.toHaveAttribute('open');

        fireEvent.click(screen.getByRole('button', {name: 'Open inspector'}));
        act(() => {
          vi.advanceTimersByTime(300);
        });
        expect(dialog).toHaveAttribute('open');
      } finally {
        vi.useRealTimers();
      }
    });
  });

  it('traps Tab focus inside a modal drawer', () => {
    render(
      <Drawer isOpen onOpenChange={() => {}} label="Details">
        <button type="button">First action</button>
        <button type="button">Last action</button>
      </Drawer>,
    );
    screen.getByRole('button', {name: 'Last action'}).focus();

    fireEvent.keyDown(document, {key: 'Tab'});

    expect(screen.getByRole('button', {name: 'First action'})).toHaveFocus();
  });

  it('focuses the element with data-autofocus on open', () => {
    render(
      <Drawer isOpen onOpenChange={() => {}} label="Details">
        <button type="button">First</button>
        <button type="button" data-autofocus>
          Second
        </button>
      </Drawer>,
    );
    expect(screen.getByRole('button', {name: 'Second'})).toHaveFocus();
  });

  it('renders the side as a data attribute for theming', () => {
    render(
      <Drawer isOpen onOpenChange={() => {}} label="Details" side="start">
        Content
      </Drawer>,
    );
    expect(screen.getByRole('dialog')).toHaveAttribute('data-side', 'start');
  });

  describe('sides', () => {
    it.each(['start', 'end'] as const)(
      'renders side="%s" with the matching data attribute',
      side => {
        render(
          <Drawer isOpen onOpenChange={() => {}} label="Details" side={side}>
            Content
          </Drawer>,
        );
        expect(screen.getByRole('dialog')).toHaveAttribute('data-side', side);
      },
    );
  });

  describe('width', () => {
    it('applies the default 400px inline budget', () => {
      render(
        <Drawer isOpen onOpenChange={() => {}} label="Details">
          Content
        </Drawer>,
      );
      expect(screen.getByRole('dialog').getAttribute('style')).toContain(
        '400px',
      );
    });

    it('accepts a number of pixels', () => {
      render(
        <Drawer isOpen onOpenChange={() => {}} label="Details" width={320}>
          Content
        </Drawer>,
      );
      expect(screen.getByRole('dialog').getAttribute('style')).toContain(
        '320px',
      );
    });

    it('accepts any CSS length string', () => {
      render(
        <Drawer isOpen onOpenChange={() => {}} label="Details" width="50%">
          Content
        </Drawer>,
      );
      expect(screen.getByRole('dialog').getAttribute('style')).toContain('50%');
    });

    it('preserves a 56px page reveal without exceeding the width budget on mobile', () => {
      render(
        <Drawer isOpen onOpenChange={() => {}} label="Details">
          Content
        </Drawer>,
      );
      // Desktop budget and mobile cap are both emitted as custom properties;
      // the media query itself is compiled CSS that jsdom cannot evaluate,
      // so assert both values reach the element.
      const style = screen.getByRole('dialog').getAttribute('style') ?? '';
      expect(style).toContain('400px');
      expect(style).toContain('min(400px, calc(100dvw - 56px))');
    });

    it('covers the full viewport on mobile with isFullWidthOnMobile', () => {
      render(
        <Drawer
          isOpen
          onOpenChange={() => {}}
          label="Details"
          isFullWidthOnMobile>
          Content
        </Drawer>,
      );
      const style = screen.getByRole('dialog').getAttribute('style') ?? '';
      expect(style).toContain('100dvw');
      expect(style).not.toContain('100dvw - 56px');
    });
  });

  describe('close control', () => {
    it('renders no close button of its own, modal or non-modal', () => {
      const {rerender} = render(
        <Drawer isOpen onOpenChange={() => {}} label="Details">
          Content
        </Drawer>,
      );
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      rerender(
        <Drawer isOpen onOpenChange={() => {}} label="Details" hasScrim={false}>
          Content
        </Drawer>,
      );
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('closes through a DrawerHeader given the same onOpenChange', () => {
      const handleOpenChange = vi.fn();
      render(
        <Drawer isOpen onOpenChange={handleOpenChange} label="Details">
          <DrawerHeader title="Details" onOpenChange={handleOpenChange} />
          Content
        </Drawer>,
      );
      fireEvent.click(screen.getByRole('button', {name: 'Close'}));
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('purpose', () => {
    it("defaults to 'info': Escape and a scrim click both request close", () => {
      const handleOpenChange = vi.fn();
      render(
        <Drawer isOpen onOpenChange={handleOpenChange} label="Details">
          Content
        </Drawer>,
      );
      const dialog = screen.getByRole('dialog');
      fireEvent.keyDown(dialog, {key: 'Escape'});
      fireEvent.click(dialog);
      expect(handleOpenChange).toHaveBeenCalledTimes(2);
      expect(handleOpenChange).toHaveBeenNthCalledWith(1, false);
      expect(handleOpenChange).toHaveBeenNthCalledWith(2, false);
    });

    it("'form' closes on Escape but ignores a scrim click", () => {
      const handleOpenChange = vi.fn();
      render(
        <Drawer
          isOpen
          onOpenChange={handleOpenChange}
          label="Details"
          purpose="form">
          Content
        </Drawer>,
      );
      const dialog = screen.getByRole('dialog');
      fireEvent.click(dialog);
      expect(handleOpenChange).not.toHaveBeenCalled();
      fireEvent.keyDown(dialog, {key: 'Escape'});
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it("'required' ignores Escape, the native cancel event, and a scrim click", () => {
      const handleOpenChange = vi.fn();
      render(
        <Drawer
          isOpen
          onOpenChange={handleOpenChange}
          label="Accept terms"
          purpose="required">
          Content
        </Drawer>,
      );
      const dialog = screen.getByRole('alertdialog');
      fireEvent.keyDown(dialog, {key: 'Escape'});
      fireEvent.click(dialog);
      const cancelEvent = new Event('cancel', {cancelable: true});
      fireEvent(dialog, cancelEvent);
      expect(cancelEvent.defaultPrevented).toBe(true);
      expect(handleOpenChange).not.toHaveBeenCalled();
    });

    it("'required' consumes Escape so a drawer behind it stays open", () => {
      const closeOuter = vi.fn();
      const closeInner = vi.fn();
      function Harness() {
        const [isInnerOpen, setIsInnerOpen] = useState(false);
        return (
          <>
            <Drawer
              isOpen
              onOpenChange={closeOuter}
              label="Order"
              hasScrim={false}>
              <button type="button" onClick={() => setIsInnerOpen(true)}>
                Open terms
              </button>
            </Drawer>
            <Drawer
              isOpen={isInnerOpen}
              onOpenChange={closeInner}
              label="Accept terms"
              purpose="required">
              Terms
            </Drawer>
          </>
        );
      }
      render(<Harness />);
      fireEvent.click(screen.getByRole('button', {name: 'Open terms'}));
      fireEvent.keyDown(document, {key: 'Escape'});
      expect(closeInner).not.toHaveBeenCalled();
      expect(closeOuter).not.toHaveBeenCalled();
    });

    it("exposes a modal 'required' drawer as an alertdialog", () => {
      render(
        <Drawer
          isOpen
          onOpenChange={() => {}}
          label="Accept terms"
          purpose="required">
          Content
        </Drawer>,
      );
      expect(
        screen.getByRole('alertdialog', {name: 'Accept terms'}),
      ).toHaveAttribute('aria-modal', 'true');
    });

    it("keeps a non-modal 'required' drawer in the dialog role", () => {
      render(
        <Drawer
          isOpen
          onOpenChange={() => {}}
          label="Accept terms"
          purpose="required"
          hasScrim={false}>
          Content
        </Drawer>,
      );
      expect(
        screen.getByRole('dialog', {name: 'Accept terms'}),
      ).toBeInTheDocument();
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });

  describe('LIFO stacking', () => {
    it('Escape closes only the last-opened drawer, regardless of event target', () => {
      const closeFirst = vi.fn();
      const closeSecond = vi.fn();
      render(
        <>
          <Drawer
            isOpen
            onOpenChange={closeFirst}
            label="First"
            hasScrim={false}>
            First content
          </Drawer>
          <Drawer
            isOpen
            onOpenChange={closeSecond}
            label="Second"
            hasScrim={false}>
            Second content
          </Drawer>
        </>,
      );

      // The shared document-level owner routes Escape to the top layer even
      // when the event starts inside a lower sibling.
      fireEvent.keyDown(screen.getByRole('dialog', {name: 'First'}), {
        key: 'Escape',
      });
      expect(closeSecond).toHaveBeenCalledWith(false);
      expect(closeFirst).not.toHaveBeenCalled();
    });

    function StackHarness() {
      const [outerOpen, setOuterOpen] = useState(true);
      const [innerOpen, setInnerOpen] = useState(true);
      return (
        <>
          <Drawer
            isOpen={outerOpen}
            onOpenChange={setOuterOpen}
            label="Outer"
            hasScrim={false}>
            Outer content
          </Drawer>
          <Drawer
            isOpen={innerOpen}
            onOpenChange={setInnerOpen}
            label="Inner"
            hasScrim={false}>
            Inner content
          </Drawer>
        </>
      );
    }

    it('keeps a closing top drawer on the stack until its exit completes', () => {
      render(<StackHarness />);
      const outer = screen.getByRole('dialog', {name: 'Outer'});
      const inner = screen.getByRole('dialog', {name: 'Inner'});

      fireEvent.keyDown(inner, {key: 'Escape'});
      // The inner host is still top-layer present while it slides out. A second
      // Escape must be consumed by that closing surface, not reach the outer.
      fireEvent.keyDown(outer, {key: 'Escape'});
      expect(outer).toHaveAttribute('open');
      expect(inner).toHaveAttribute('open');

      act(() => {
        fireEvent.transitionEnd(inner, {propertyName: 'transform'});
      });
      expect(inner).not.toHaveAttribute('open');
      expect(outer).toHaveAttribute('open');

      fireEvent.keyDown(outer, {key: 'Escape'});
      act(() => {
        fireEvent.transitionEnd(outer, {propertyName: 'transform'});
      });
      expect(outer).not.toHaveAttribute('open');
    });

    function ReopenHarness() {
      const [firstOpen, setFirstOpen] = useState(true);
      const [secondOpen, setSecondOpen] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setFirstOpen(false)}>
            Close first
          </button>
          <button type="button" onClick={() => setFirstOpen(true)}>
            Reopen first
          </button>
          <Drawer
            isOpen={firstOpen}
            onOpenChange={setFirstOpen}
            label="First"
            hasScrim={false}>
            First content
          </Drawer>
          <Drawer
            isOpen={secondOpen}
            onOpenChange={setSecondOpen}
            label="Second"
            hasScrim={false}>
            Second content
          </Drawer>
        </>
      );
    }

    it('moves a reopened sibling above a drawer that stayed open', () => {
      render(<ReopenHarness />);
      const first = screen.getByRole('dialog', {name: 'First'});
      const second = screen.getByRole('dialog', {name: 'Second'});

      fireEvent.click(screen.getByRole('button', {name: 'Close first'}));
      act(() => {
        fireEvent.transitionEnd(first, {propertyName: 'transform'});
      });
      expect(first).not.toHaveAttribute('open');
      expect(second).toHaveAttribute('open');

      fireEvent.click(screen.getByRole('button', {name: 'Reopen first'}));
      expect(first).toHaveAttribute('open');

      // Browser top-layer order now paints First above Second. The shared
      // dismissal stack must use the same reopened-last ordering even when the
      // key event starts in the lower sibling.
      fireEvent.keyDown(second, {key: 'Escape'});
      act(() => {
        fireEvent.transitionEnd(first, {propertyName: 'transform'});
      });
      expect(first).not.toHaveAttribute('open');
      expect(second).toHaveAttribute('open');
    });

    it('unregisters unmounted drawers so the remaining one becomes top', () => {
      const closeFirst = vi.fn();
      const {rerender} = render(
        <>
          <Drawer
            isOpen
            onOpenChange={closeFirst}
            label="First"
            hasScrim={false}>
            First content
          </Drawer>
          <Drawer
            isOpen
            onOpenChange={() => {}}
            label="Second"
            hasScrim={false}>
            Second content
          </Drawer>
        </>,
      );
      rerender(
        <Drawer isOpen onOpenChange={closeFirst} label="First" hasScrim={false}>
          First content
        </Drawer>,
      );
      fireEvent.keyDown(screen.getByRole('dialog', {name: 'First'}), {
        key: 'Escape',
      });
      expect(closeFirst).toHaveBeenCalledWith(false);
    });
  });

  describe('exit anchoring', () => {
    it('slides out to the side it opened from, even if the prop flips', () => {
      // The common consumer shape: `side` is derived from the same state that
      // drives isOpen, so it reverts to the default the moment the drawer
      // closes. The panel must still leave by the edge it came in from.
      function Harness() {
        const [side, setSide] = useState<'start' | 'end' | null>(null);
        return (
          <>
            <button type="button" onClick={() => setSide('start')}>
              Open from start
            </button>
            <Drawer
              isOpen={side != null}
              onOpenChange={isOpen => !isOpen && setSide(null)}
              label="Filters"
              side={side ?? 'end'}>
              Content
            </Drawer>
          </>
        );
      }
      render(<Harness />);
      fireEvent.click(screen.getByRole('button', {name: 'Open from start'}));
      const dialog = screen.getByRole('dialog', {hidden: true});
      expect(dialog).toHaveAttribute('data-side', 'start');

      fireEvent.keyDown(dialog, {key: 'Escape'});
      // Mid-exit: the live prop is now 'end', the anchor must still be 'start'.
      expect(dialog).toHaveAttribute('data-side', 'start');
    });
  });

  describe('container padding isolation', () => {
    it('resets container padding custom properties on the root dialog element', () => {
      render(
        <Drawer isOpen onOpenChange={() => {}} label="Details">
          Content
        </Drawer>,
      );
      const dialog = screen.getByRole('dialog');
      const computed = window.getComputedStyle(dialog);
      expect(
        computed.getPropertyValue('--container-padding-inline-start'),
      ).toBe('0px');
      expect(computed.getPropertyValue('--container-padding-inline-end')).toBe(
        '0px',
      );
      expect(computed.getPropertyValue('--container-padding-block-start')).toBe(
        '0px',
      );
      expect(computed.getPropertyValue('--container-padding-block-end')).toBe(
        '0px',
      );
    });
  });

  describe('container padding', () => {
    // StyleX lowers the block edges to their physical properties. block-end is
    // asserted separately: its applied edge composes the safe-area inset.
    const EDGES = [
      ['inline-start', 'padding-inline-start'],
      ['inline-end', 'padding-inline-end'],
      ['block-start', 'padding-top'],
    ] as const;
    // StyleX strips the space after the var() fallback comma.
    const SAFE_AREA_BLOCK_END =
      'calc(var(--container-padding-block-end,0px) + env(safe-area-inset-bottom,0px))';

    function renderWithPadding(padding?: 0 | 2) {
      render(
        <Drawer
          isOpen
          onOpenChange={() => {}}
          label="Details"
          padding={padding}>
          <span data-testid="drawer-child">Content</span>
        </Drawer>,
      );
      // The content area is the child's parent: the scrolling box inside the
      // panel, not the panel itself.
      return getComputedStyle(
        screen.getByTestId('drawer-child').parentElement!,
      );
    }

    it('keeps the released full-bleed default and publishes the theme chain', () => {
      const computed = renderWithPadding();
      for (const [edge, property] of EDGES) {
        const published = computed
          .getPropertyValue(`--container-padding-${edge}`)
          .replace(/\s+/g, '');
        expect(published, edge).toContain(
          `var(--astryx-drawer-padding-${edge}`,
        );
        // No theme padding resolves to no inset, as before the drawer was a
        // container.
        expect(published, edge).toContain('var(--astryx-drawer-padding,0px)');
        // Applied padding reads the published value, so bleed children
        // subtract exactly the inset they sit in.
        expect(computed.getPropertyValue(property), edge).toBe(
          `var(--container-padding-${edge})`,
        );
      }
      // block-end publishes the same chain, while the APPLIED edge adds the
      // home-indicator safe area on top of the container inset — the released
      // behavior with no inset.
      const publishedEnd = computed
        .getPropertyValue('--container-padding-block-end')
        .replace(/\s+/g, '');
      expect(publishedEnd).toContain('var(--astryx-drawer-padding-block-end');
      expect(publishedEnd).toContain('var(--astryx-drawer-padding,0px)');
      expect(computed.getPropertyValue('padding-bottom')).toBe(
        SAFE_AREA_BLOCK_END,
      );
      // The Layout insets have no terminal value: unthemed, they stay invalid
      // and a Layout inside the drawer keeps its own default padding.
      for (const name of [
        '--layout-padding-outer-x',
        '--layout-padding-outer-y',
        '--layout-padding-inner-x',
        '--layout-padding-inner-y',
      ]) {
        const value = computed.getPropertyValue(name).replace(/\s+/g, '');
        expect(value, name).toContain('var(--astryx-drawer-padding)');
        expect(value, name).not.toMatch(/0px|--spacing-/);
      }
    });

    it.each([0, 2] as const)(
      'applies and publishes an explicit padding step (%s)',
      padding => {
        const computed = renderWithPadding(padding);
        const expected = `var(--spacing-${padding})`;
        for (const [edge, property] of EDGES) {
          expect(
            computed.getPropertyValue(`--container-padding-${edge}`),
            edge,
          ).toBe(expected);
          expect(computed.getPropertyValue(property), edge).toBe(expected);
        }
        expect(computed.getPropertyValue('--container-padding-block-end')).toBe(
          expected,
        );
        expect(computed.getPropertyValue('padding-bottom')).toBe(
          SAFE_AREA_BLOCK_END,
        );
        expect(computed.getPropertyValue('--layout-padding-inner-x')).toBe(
          expected,
        );
      },
    );

    it('keeps the panel itself unpadded and free of a padding attribute', () => {
      renderWithPadding(2);
      const dialog = screen.getByRole('dialog');
      expect(dialog.hasAttribute('padding')).toBe(false);
      expect(
        getComputedStyle(dialog).getPropertyValue(
          '--container-padding-inline-start',
        ),
      ).toBe('0px');
    });
  });
});
