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
import {render, screen, fireEvent, act} from '@testing-library/react';
import {useState} from 'react';
import {BottomSheet} from './BottomSheet';

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
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function getHandle(): HTMLElement {
  const handle = document.querySelector<HTMLElement>(
    '[data-astryx-sheet-handle]',
  );
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
      for (const height of ['short', 'medium', 'tall', 'auto'] as const) {
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

    it('restores focus to the opener after close', async () => {
      vi.useFakeTimers();
      try {
        render(<Harness />);
        const opener = screen.getByRole('button', {name: 'Open sheet'});
        opener.focus();
        fireEvent.click(opener);
        fireEvent.click(screen.getByRole('button', {name: 'Done'}));
        await act(async () => {
          vi.runAllTimers();
        });
        expect(document.activeElement).toBe(opener);
      } finally {
        vi.useRealTimers();
      }
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
