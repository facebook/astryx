// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Sheet.test.tsx
 * @input Uses vitest, @testing-library/react, Sheet component
 * @output Unit tests for Sheet component behavior
 * @position Testing; validates Sheet.tsx implementation
 *
 * SYNC: When Sheet.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen, fireEvent, act} from '@testing-library/react';
import {useState} from 'react';
import {Sheet} from './Sheet';

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

describe('Sheet', () => {
  it('renders children when open', () => {
    render(
      <Sheet isOpen onClose={() => {}} label="Host details">
        Sheet content
      </Sheet>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Sheet content')).toBeInTheDocument();
  });

  it('does not show when isOpen is false', () => {
    render(
      <Sheet isOpen={false} onClose={() => {}} label="Host details">
        Hidden content
      </Sheet>,
    );
    const dialog = screen.getByRole('dialog', {hidden: true});
    expect(dialog).not.toHaveAttribute('open');
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
  });

  it('applies the accessible label', () => {
    render(
      <Sheet isOpen onClose={() => {}} label="Host details">
        Content
      </Sheet>,
    );
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Host details');
  });

  describe('modal vs non-modal', () => {
    it('opens with showModal() and aria-modal by default (hasScrim)', () => {
      render(
        <Sheet isOpen onClose={() => {}} label="Details">
          Content
        </Sheet>,
      );
      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
      expect(HTMLDialogElement.prototype.show).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('opens with show() and no aria-modal when hasScrim is false', () => {
      render(
        <Sheet isOpen onClose={() => {}} label="Details" hasScrim={false}>
          Content
        </Sheet>,
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
        <Sheet isOpen onClose={handleClose} label="Details">
          Content
        </Sheet>,
      );
      fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Escape'});
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose on Escape in non-modal mode', () => {
      const handleClose = vi.fn();
      render(
        <Sheet isOpen onClose={handleClose} label="Details" hasScrim={false}>
          Content
        </Sheet>,
      );
      fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Escape'});
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('prevents the native cancel event and routes through onClose', () => {
      const handleClose = vi.fn();
      render(
        <Sheet isOpen onClose={handleClose} label="Details">
          Content
        </Sheet>,
      );
      const cancelEvent = new Event('cancel', {cancelable: true});
      fireEvent(screen.getByRole('dialog'), cancelEvent);
      expect(handleClose).toHaveBeenCalledTimes(1);
      expect(cancelEvent.defaultPrevented).toBe(true);
    });

    it('ignores other keys', () => {
      const handleClose = vi.fn();
      render(
        <Sheet isOpen onClose={handleClose} label="Details">
          Content
        </Sheet>,
      );
      fireEvent.keyDown(screen.getByRole('dialog'), {key: 'Enter'});
      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('scrim click', () => {
    it('calls onClose when the ::backdrop (dialog element itself) is clicked', () => {
      const handleClose = vi.fn();
      render(
        <Sheet isOpen onClose={handleClose} label="Details">
          Content
        </Sheet>,
      );
      fireEvent.click(screen.getByRole('dialog'));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not close when sheet content is clicked', () => {
      const handleClose = vi.fn();
      render(
        <Sheet isOpen onClose={handleClose} label="Details">
          <button type="button">Inside</button>
        </Sheet>,
      );
      fireEvent.click(screen.getByRole('button', {name: 'Inside'}));
      expect(handleClose).not.toHaveBeenCalled();
    });

    it('does not close on self-click when non-modal', () => {
      const handleClose = vi.fn();
      render(
        <Sheet isOpen onClose={handleClose} label="Details" hasScrim={false}>
          Content
        </Sheet>,
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
          <Sheet
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            label="Inspector">
            <button type="button" onClick={() => setIsOpen(false)}>
              Close inspector
            </button>
          </Sheet>
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
      <Sheet isOpen onClose={() => {}} label="Details">
        <button type="button">First</button>
        <button type="button" data-autofocus>
          Second
        </button>
      </Sheet>,
    );
    expect(screen.getByRole('button', {name: 'Second'})).toHaveFocus();
  });

  it('renders the side as a data attribute for theming', () => {
    render(
      <Sheet isOpen onClose={() => {}} label="Details" side="start">
        Content
      </Sheet>,
    );
    expect(screen.getByRole('dialog')).toHaveAttribute('data-side', 'start');
  });

  describe('sides', () => {
    it.each(['start', 'end', 'top', 'bottom'] as const)(
      'renders side="%s" with the matching data attribute',
      side => {
        render(
          <Sheet isOpen onClose={() => {}} label="Details" side={side}>
            Content
          </Sheet>,
        );
        expect(screen.getByRole('dialog')).toHaveAttribute('data-side', side);
      },
    );
  });

  describe('size', () => {
    it('applies the default 400px inline budget', () => {
      render(
        <Sheet isOpen onClose={() => {}} label="Details">
          Content
        </Sheet>,
      );
      const className = screen.getByRole('dialog').getAttribute('class') ?? '';
      // StyleX compiles to class names; check the dynamic style class
      // presence rather than inline style.
      expect(className).toContain('Sheet__dynamicStyles.inlineSize');
    });

    it('accepts a number of pixels', () => {
      render(
        <Sheet isOpen onClose={() => {}} label="Details" size={320}>
          Content
        </Sheet>,
      );
      const className = screen.getByRole('dialog').getAttribute('class') ?? '';
      expect(className).toContain('Sheet__dynamicStyles.inlineSize');
    });

    it('accepts any CSS length string', () => {
      render(
        <Sheet isOpen onClose={() => {}} label="Details" size="50%">
          Content
        </Sheet>,
      );
      const className = screen.getByRole('dialog').getAttribute('class') ?? '';
      expect(className).toContain('Sheet__dynamicStyles.inlineSize');
    });

    it('applies the size to the block axis for sheets', () => {
      render(
        <Sheet
          isOpen
          onClose={() => {}}
          label="Details"
          side="bottom"
          size="40dvh">
          Content
        </Sheet>,
      );
      const className = screen.getByRole('dialog').getAttribute('class') ?? '';
      expect(className).toContain('Sheet__dynamicStyles.blockSize');
    });

    it('sheets stretch to full viewport width', () => {
      render(
        <Sheet isOpen onClose={() => {}} label="Details" side="bottom">
          Content
        </Sheet>,
      );
      const className = screen.getByRole('dialog').getAttribute('class') ?? '';
      expect(className).toContain('Sheet__styles.bottom');
    });
  });

  describe('close button', () => {
    it('renders a close button by default when modal', () => {
      const handleClose = vi.fn();
      render(
        <Sheet isOpen onClose={handleClose} label="Details">
          Content
        </Sheet>,
      );
      const closeButton = screen.getByRole('button', {name: 'Close'});
      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not render a close button by default when non-modal', () => {
      render(
        <Sheet isOpen onClose={() => {}} label="Details" hasScrim={false}>
          Content
        </Sheet>,
      );
      expect(
        screen.queryByRole('button', {name: 'Close'}),
      ).not.toBeInTheDocument();
    });

    it('hides the close button with hasCloseButton={false}', () => {
      render(
        <Sheet isOpen onClose={() => {}} label="Details" hasCloseButton={false}>
          Content
        </Sheet>,
      );
      expect(
        screen.queryByRole('button', {name: 'Close'}),
      ).not.toBeInTheDocument();
    });

    it('shows the close button on a non-modal sheet with hasCloseButton', () => {
      render(
        <Sheet
          isOpen
          onClose={() => {}}
          label="Details"
          hasScrim={false}
          hasCloseButton>
          Content
        </Sheet>,
      );
      expect(screen.getByRole('button', {name: 'Close'})).toBeInTheDocument();
    });
  });

  describe('collapse to rail', () => {
    it('renders a full-size expand button with the label when collapsed', () => {
      render(
        <Sheet
          isOpen
          onClose={() => {}}
          label="Inspector"
          hasScrim={false}
          isCollapsed
          onCollapsedChange={() => {}}>
          Content
        </Sheet>,
      );
      const expandButton = screen.getByRole('button', {
        name: 'Expand Inspector',
      });
      expect(expandButton).toHaveTextContent('Inspector');
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
        <Sheet
          isOpen
          onClose={() => {}}
          label="Inspector"
          hasScrim={false}
          isCollapsed
          onCollapsedChange={handleCollapsedChange}>
          Content
        </Sheet>,
      );
      fireEvent.click(screen.getByRole('button', {name: 'Expand Inspector'}));
      expect(handleCollapsedChange).toHaveBeenCalledWith(false);
    });

    it('renders a collapse toggle while expanded when onCollapsedChange is provided', () => {
      const handleCollapsedChange = vi.fn();
      render(
        <Sheet
          isOpen
          onClose={() => {}}
          label="Inspector"
          hasScrim={false}
          isCollapsed={false}
          onCollapsedChange={handleCollapsedChange}>
          Content
        </Sheet>,
      );
      fireEvent.click(screen.getByRole('button', {name: 'Collapse Inspector'}));
      expect(handleCollapsedChange).toHaveBeenCalledWith(true);
    });

    it('dev-warns and ignores isCollapsed on a modal sheet', () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      try {
        render(
          <Sheet
            isOpen
            onClose={() => {}}
            label="Inspector"
            isCollapsed
            onCollapsedChange={() => {}}>
            Content
          </Sheet>,
        );
        expect(consoleError).toHaveBeenCalledWith(
          expect.stringContaining('[Sheet]'),
        );
        expect(
          screen.queryByRole('button', {name: 'Expand Inspector'}),
        ).not.toBeInTheDocument();
      } finally {
        consoleError.mockRestore();
      }
    });

    it('dev-warns and ignores isCollapsed on a sheet (bottom/top)', () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      try {
        render(
          <Sheet
            isOpen
            onClose={() => {}}
            label="Inspector"
            side="bottom"
            hasScrim={false}
            isCollapsed
            onCollapsedChange={() => {}}>
            Content
          </Sheet>,
        );
        expect(consoleError).toHaveBeenCalledWith(
          expect.stringContaining('[Sheet]'),
        );
        expect(
          screen.queryByRole('button', {name: 'Expand Inspector'}),
        ).not.toBeInTheDocument();
      } finally {
        consoleError.mockRestore();
      }
    });
  });

  describe('drag handle', () => {
    it('renders a drag handle when hasDragHandle is true and side is bottom', () => {
      render(
        <Sheet
          isOpen
          onClose={() => {}}
          label="Filters"
          side="bottom"
          hasDragHandle>
          Content
        </Sheet>,
      );
      const dialog = screen.getByRole('dialog');
      const handle = dialog.querySelector('[class*="dragHandle"]');
      expect(handle).not.toBeNull();
      const classAttr = handle?.getAttribute('class') ?? '';
      expect(classAttr).toContain('Sheet__styles.dragHandle');
      expect(classAttr).toContain('Sheet__styles.dragHandleBottom');
    });

    it('does not render a drag handle when hasDragHandle is false', () => {
      render(
        <Sheet isOpen onClose={() => {}} label="Details" side="bottom">
          Content
        </Sheet>,
      );
      const dialog = screen.getByRole('dialog');
      const handle = dialog.querySelector('[class*="dragHandle"]');
      expect(handle).toBeNull();
    });

    it('does not render a drag handle for side panels (start/end)', () => {
      render(
        <Sheet
          isOpen
          onClose={() => {}}
          label="Details"
          side="start"
          hasDragHandle>
          Content
        </Sheet>,
      );
      const dialog = screen.getByRole('dialog');
      const handle = dialog.querySelector('[class*="dragHandle"]');
      expect(handle).toBeNull();
    });
  });

  describe('LIFO stacking via overlay stack', () => {
    it('Escape only closes the last-opened sheet', () => {
      const closeFirst = vi.fn();
      const closeSecond = vi.fn();
      render(
        <>
          <Sheet isOpen onClose={closeFirst} label="First" hasScrim={false}>
            First content
          </Sheet>
          <Sheet isOpen onClose={closeSecond} label="Second" hasScrim={false}>
            Second content
          </Sheet>
        </>,
      );

      fireEvent.keyDown(screen.getByRole('dialog', {name: 'First'}), {
        key: 'Escape',
      });
      expect(closeFirst).not.toHaveBeenCalled();
      expect(closeSecond).not.toHaveBeenCalled();

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
          <Sheet
            isOpen={outerOpen}
            onClose={() => setOuterOpen(false)}
            label="Outer"
            hasScrim={false}>
            Outer content
          </Sheet>
          <Sheet
            isOpen={innerOpen}
            onClose={() => setInnerOpen(false)}
            label="Inner"
            hasScrim={false}>
            Inner content
          </Sheet>
        </>
      );
    }

    it('closes stacked sheets innermost-first', () => {
      vi.useFakeTimers();
      try {
        render(<StackHarness />);
        const outer = screen.getByRole('dialog', {name: 'Outer'});
        const inner = screen.getByRole('dialog', {name: 'Inner'});

        fireEvent.keyDown(inner, {key: 'Escape'});
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

    it('unregisters unmounted sheets so the remaining one becomes top', () => {
      const closeFirst = vi.fn();
      const {rerender} = render(
        <>
          <Sheet isOpen onClose={closeFirst} label="First" hasScrim={false}>
            First content
          </Sheet>
          <Sheet isOpen onClose={() => {}} label="Second" hasScrim={false}>
            Second content
          </Sheet>
        </>,
      );
      rerender(
        <Sheet isOpen onClose={closeFirst} label="First" hasScrim={false}>
          First content
        </Sheet>,
      );
      fireEvent.keyDown(screen.getByRole('dialog', {name: 'First'}), {
        key: 'Escape',
      });
      expect(closeFirst).toHaveBeenCalledTimes(1);
    });
  });
});
