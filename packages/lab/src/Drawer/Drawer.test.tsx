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
      <Drawer isOpen onClose={() => {}} label="Host details">
        Drawer content
      </Drawer>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Drawer content')).toBeInTheDocument();
  });

  it('does not show when isOpen is false', () => {
    render(
      <Drawer isOpen={false} onClose={() => {}} label="Host details">
        Hidden content
      </Drawer>,
    );
    const dialog = screen.getByRole('dialog', {hidden: true});
    expect(dialog).not.toHaveAttribute('open');
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
  });

  it('applies the accessible label', () => {
    render(
      <Drawer isOpen onClose={() => {}} label="Host details">
        Content
      </Drawer>,
    );
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Host details');
  });

  describe('modal vs non-modal', () => {
    it('opens with showModal() and aria-modal by default (hasScrim)', () => {
      render(
        <Drawer isOpen onClose={() => {}} label="Details">
          Content
        </Drawer>,
      );
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
      expect(HTMLDialogElement.prototype.show).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('opens with show() and no aria-modal when hasScrim is false', () => {
      render(
        <Drawer isOpen onClose={() => {}} label="Details" hasScrim={false}>
          Content
        </Drawer>,
      );
      expect(HTMLDialogElement.prototype.show).toHaveBeenCalled();
      expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-modal');
    });
  });

  describe('Escape key', () => {
    it('calls onClose on Escape keydown', () => {
      const handleClose = vi.fn();
      render(
        <Drawer isOpen onClose={handleClose} label="Details">
          Content
        </Drawer>,
      );
      fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Escape'});
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose on Escape in non-modal mode (no native cancel)', () => {
      const handleClose = vi.fn();
      render(
        <Drawer isOpen onClose={handleClose} label="Details" hasScrim={false}>
          Content
        </Drawer>,
      );
      fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Escape'});
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('prevents the native cancel event and routes through onClose', () => {
      const handleClose = vi.fn();
      render(
        <Drawer isOpen onClose={handleClose} label="Details">
          Content
        </Drawer>,
      );
      const cancelEvent = new Event('cancel', {cancelable: true});
      fireEvent(screen.getByRole('dialog'), cancelEvent);
      expect(handleClose).toHaveBeenCalledTimes(1);
      expect(cancelEvent.defaultPrevented).toBe(true);
    });

    it('ignores other keys', () => {
      const handleClose = vi.fn();
      render(
        <Drawer isOpen onClose={handleClose} label="Details">
          Content
        </Drawer>,
      );
      fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Enter'});
      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('scrim click', () => {
    it('calls onClose when the ::backdrop (dialog element itself) is clicked', () => {
      const handleClose = vi.fn();
      render(
        <Drawer isOpen onClose={handleClose} label="Details">
          Content
        </Drawer>,
      );
      fireEvent.click(screen.getByRole('dialog'));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not close when drawer content is clicked', () => {
      const handleClose = vi.fn();
      render(
        <Drawer isOpen onClose={handleClose} label="Details">
          <button type="button">Inside</button>
        </Drawer>,
      );
      fireEvent.click(screen.getByRole('button', {name: 'Inside'}));
      expect(handleClose).not.toHaveBeenCalled();
    });

    it('does not close on self-click when non-modal (no scrim to click)', () => {
      const handleClose = vi.fn();
      render(
        <Drawer isOpen onClose={handleClose} label="Details" hasScrim={false}>
          Content
        </Drawer>,
      );
      fireEvent.click(screen.getByRole('dialog'));
      expect(handleClose).not.toHaveBeenCalled();
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
          <Drawer
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            label="Inspector">
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
          vi.advanceTimersByTime(300);
        });
        expect(dialog).not.toHaveAttribute('open');
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
      <Drawer isOpen onClose={() => {}} label="Details">
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
      <Drawer isOpen onClose={() => {}} label="Details" side="start">
        Content
      </Drawer>,
    );
    expect(screen.getByRole('dialog')).toHaveAttribute('data-side', 'start');
  });

  describe('sides', () => {
    it.each(['start', 'end', 'top', 'bottom'] as const)(
      'renders side="%s" with the matching data attribute',
      side => {
        render(
          <Drawer isOpen onClose={() => {}} label="Details" side={side}>
            Content
          </Drawer>,
        );
        expect(screen.getByRole('dialog')).toHaveAttribute('data-side', side);
      },
    );
  });

  describe('size', () => {
    it('applies the default 400px inline budget', () => {
      render(
        <Drawer isOpen onClose={() => {}} label="Details">
          Content
        </Drawer>,
      );
      expect(screen.getByRole('dialog').getAttribute('style')).toContain(
        '400px',
      );
    });

    it('accepts a number of pixels', () => {
      render(
        <Drawer isOpen onClose={() => {}} label="Details" size={320}>
          Content
        </Drawer>,
      );
      expect(screen.getByRole('dialog').getAttribute('style')).toContain(
        '320px',
      );
    });

    it('accepts any CSS length string', () => {
      render(
        <Drawer isOpen onClose={() => {}} label="Details" size="50%">
          Content
        </Drawer>,
      );
      expect(screen.getByRole('dialog').getAttribute('style')).toContain('50%');
    });

    it('applies the size to the block axis for sheets', () => {
      render(
        <Drawer
          isOpen
          onClose={() => {}}
          label="Details"
          side="bottom"
          size="40dvh">
          Content
        </Drawer>,
      );
      expect(screen.getByRole('dialog').getAttribute('style')).toContain(
        '40dvh',
      );
    });

    it('sheets stretch to full viewport width (regression: UA width: fit-content left the sheet content-width in a corner)', () => {
      render(
        <Drawer isOpen onClose={() => {}} label="Details" side="bottom">
          Content
        </Drawer>,
      );
      // The explicit width: 100dvw lives in the static bottom side style —
      // insetInline: 0 alone loses to the dialog UA stylesheet's
      // `width: fit-content`. jsdom can't resolve class-compiled CSS, so
      // assert the side style class is applied; the declaration itself is
      // covered by the source and visual verification.
      const className = screen.getByRole('dialog').getAttribute('class') ?? '';
      expect(className).toContain('Drawer__styles.bottom');
    });
  });

  describe('close button', () => {
    it('renders a close button by default when modal', () => {
      const handleClose = vi.fn();
      render(
        <Drawer isOpen onClose={handleClose} label="Details">
          Content
        </Drawer>,
      );
      const closeButton = screen.getByRole('button', {name: 'Close'});
      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not render a close button by default when non-modal', () => {
      render(
        <Drawer isOpen onClose={() => {}} label="Details" hasScrim={false}>
          Content
        </Drawer>,
      );
      expect(
        screen.queryByRole('button', {name: 'Close'}),
      ).not.toBeInTheDocument();
    });

    it('hides the close button with hasCloseButton={false}', () => {
      render(
        <Drawer
          isOpen
          onClose={() => {}}
          label="Details"
          hasCloseButton={false}>
          Content
        </Drawer>,
      );
      expect(
        screen.queryByRole('button', {name: 'Close'}),
      ).not.toBeInTheDocument();
    });

    it('shows the close button on a non-modal drawer with hasCloseButton', () => {
      render(
        <Drawer
          isOpen
          onClose={() => {}}
          label="Details"
          hasScrim={false}
          hasCloseButton>
          Content
        </Drawer>,
      );
      expect(screen.getByRole('button', {name: 'Close'})).toBeInTheDocument();
    });
  });

  describe('collapse to rail', () => {
    it('renders a full-size expand button with the label when collapsed', () => {
      render(
        <Drawer
          isOpen
          onClose={() => {}}
          label="Inspector"
          hasScrim={false}
          isCollapsed
          onCollapsedChange={() => {}}>
          Content
        </Drawer>,
      );
      const expandButton = screen.getByRole('button', {
        name: 'Expand Inspector',
      });
      expect(expandButton).toHaveTextContent('Inspector');
      // Close/collapse controls are hidden while collapsed.
      expect(
        screen.queryByRole('button', {name: 'Collapse Inspector'}),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', {name: 'Close'}),
      ).not.toBeInTheDocument();
    });

    it('calls onCollapsedChange(false) when the rail is clicked', () => {
      const handleCollapsedChange = vi.fn();
      render(
        <Drawer
          isOpen
          onClose={() => {}}
          label="Inspector"
          hasScrim={false}
          isCollapsed
          onCollapsedChange={handleCollapsedChange}>
          Content
        </Drawer>,
      );
      fireEvent.click(screen.getByRole('button', {name: 'Expand Inspector'}));
      expect(handleCollapsedChange).toHaveBeenCalledWith(false);
    });

    it('renders a collapse toggle while expanded when onCollapsedChange is provided', () => {
      const handleCollapsedChange = vi.fn();
      render(
        <Drawer
          isOpen
          onClose={() => {}}
          label="Inspector"
          hasScrim={false}
          isCollapsed={false}
          onCollapsedChange={handleCollapsedChange}>
          Content
        </Drawer>,
      );
      fireEvent.click(screen.getByRole('button', {name: 'Collapse Inspector'}));
      expect(handleCollapsedChange).toHaveBeenCalledWith(true);
    });

    it('dev-warns and ignores isCollapsed on a modal drawer', () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      try {
        render(
          <Drawer
            isOpen
            onClose={() => {}}
            label="Inspector"
            isCollapsed
            onCollapsedChange={() => {}}>
            Content
          </Drawer>,
        );
        expect(consoleError).toHaveBeenCalledWith(
          expect.stringContaining('[Drawer]'),
        );
        expect(
          screen.queryByRole('button', {name: 'Expand Inspector'}),
        ).not.toBeInTheDocument();
      } finally {
        consoleError.mockRestore();
      }
    });

    it('dev-warns and ignores isCollapsed on a sheet', () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      try {
        render(
          <Drawer
            isOpen
            onClose={() => {}}
            label="Inspector"
            side="bottom"
            hasScrim={false}
            isCollapsed
            onCollapsedChange={() => {}}>
            Content
          </Drawer>,
        );
        expect(consoleError).toHaveBeenCalledWith(
          expect.stringContaining('[Drawer]'),
        );
        expect(
          screen.queryByRole('button', {name: 'Expand Inspector'}),
        ).not.toBeInTheDocument();
      } finally {
        consoleError.mockRestore();
      }
    });
  });

  describe('LIFO stacking', () => {
    it('Escape only closes the last-opened drawer', () => {
      const closeFirst = vi.fn();
      const closeSecond = vi.fn();
      render(
        <>
          <Drawer isOpen onClose={closeFirst} label="First" hasScrim={false}>
            First content
          </Drawer>
          <Drawer isOpen onClose={closeSecond} label="Second" hasScrim={false}>
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
      expect(closeSecond).toHaveBeenCalledTimes(1);
      expect(closeFirst).not.toHaveBeenCalled();
    });

    function StackHarness() {
      const [outerOpen, setOuterOpen] = useState(true);
      const [innerOpen, setInnerOpen] = useState(true);
      return (
        <>
          <Drawer
            isOpen={outerOpen}
            onClose={() => setOuterOpen(false)}
            label="Outer"
            hasScrim={false}>
            Outer content
          </Drawer>
          <Drawer
            isOpen={innerOpen}
            onClose={() => setInnerOpen(false)}
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
          <Drawer isOpen onClose={closeFirst} label="First" hasScrim={false}>
            First content
          </Drawer>
          <Drawer isOpen onClose={() => {}} label="Second" hasScrim={false}>
            Second content
          </Drawer>
        </>,
      );
      rerender(
        <Drawer isOpen onClose={closeFirst} label="First" hasScrim={false}>
          First content
        </Drawer>,
      );
      fireEvent.keyDown(screen.getByRole('dialog', {name: 'First'}), {
        key: 'Escape',
      });
      expect(closeFirst).toHaveBeenCalledTimes(1);
    });
  });
});
