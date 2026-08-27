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

    it('opens with show() and no aria-modal when hasScrim is false', () => {
      render(
        <Drawer isOpen onOpenChange={() => {}} label="Details" hasScrim={false}>
          Content
        </Drawer>,
      );
      expect(HTMLDialogElement.prototype.show).toHaveBeenCalled();
      expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-modal');
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

  describe('close button', () => {
    it('renders a close button by default when modal', () => {
      const handleOpenChange = vi.fn();
      render(
        <Drawer isOpen onOpenChange={handleOpenChange} label="Details">
          Content
        </Drawer>,
      );
      const closeButton = screen.getByRole('button', {name: 'Close'});
      fireEvent.click(closeButton);
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it('renders a close button by default when non-modal', () => {
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
      fireEvent.click(screen.getByRole('button', {name: 'Close'}));
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it('hides the close button with hasCloseButton={false}', () => {
      render(
        <Drawer
          isOpen
          onOpenChange={() => {}}
          label="Details"
          hasCloseButton={false}>
          Content
        </Drawer>,
      );
      expect(
        screen.queryByRole('button', {name: 'Close'}),
      ).not.toBeInTheDocument();
    });

    it('keeps the close button when hasCloseButton is explicitly true in non-modal mode', () => {
      render(
        <Drawer
          isOpen
          onOpenChange={() => {}}
          label="Details"
          hasScrim={false}
          hasCloseButton>
          Content
        </Drawer>,
      );
      expect(screen.getByRole('button', {name: 'Close'})).toBeInTheDocument();
    });
  });

  describe('LIFO stacking', () => {
    it('Escape only closes the last-opened drawer', () => {
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

      // Escape inside the first (bottom-of-stack) drawer is ignored.
      fireEvent.keyDown(screen.getByRole('dialog', {name: 'First'}), {
        key: 'Escape',
      });
      expect(closeFirst).not.toHaveBeenCalled();
      expect(closeSecond).not.toHaveBeenCalled();

      // Escape inside the last-opened drawer closes it.
      fireEvent.keyDown(screen.getByRole('dialog', {name: 'Second'}), {
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

    it('closes stacked drawers innermost-first', () => {
      vi.useFakeTimers();
      try {
        render(<StackHarness />);
        const outer = screen.getByRole('dialog', {name: 'Outer'});
        const inner = screen.getByRole('dialog', {name: 'Inner'});

        fireEvent.keyDown(inner, {key: 'Escape'});
        // Inner unregistered when isOpen flipped — outer is now the top.
        fireEvent.keyDown(outer, {key: 'Escape'});
        act(() => {
          vi.advanceTimersByTime(300);
        });
        expect(inner).not.toHaveAttribute('open');
        expect(outer).not.toHaveAttribute('open');
      } finally {
        vi.useRealTimers();
      }
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
});
