// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MobileNavCloseVisibility.test.tsx
 * @input Uses vitest, @testing-library/react, MobileNav
 * @output Regression tests keeping the drawer rendered until the dialog closes
 * @position Testing; guards the close path of MobileNav.tsx
 *
 * Repro for #4290 (page unresponsive after closing the drawer in Safari 26.1).
 *
 * A `<dialog>` opened with `showModal()` blocks the rest of the document for as
 * long as it stays in the top layer — whether or not it is rendered. The drawer
 * hid itself the moment `isOpen` flipped, while the native `close()` only ran
 * afterwards from an effect, so `close()` was always called on a dialog that was
 * already `display: none`. A browser that fails to un-block the document when
 * such a dialog closes leaves the page inert with no JavaScript error.
 *
 * The fix keeps `display` in the transition with `allow-discrete`, so the drawer
 * stays rendered until the slide-out finishes, and moves the unmount close into
 * its own effect so the deferred close is no longer cut off by its own cleanup.
 *
 * Note on scope: jsdom has no top layer and no CSS transitions, so the inertness
 * itself is not observable here. These tests pin the two mechanisms that prevent
 * it — the declared transition, and the close actually being deferred.
 */

import {describe, it, expect, vi, beforeAll} from 'vitest';
import {render, screen, act} from '@testing-library/react';
import {MobileNav} from './MobileNav';
import {stubMatchMedia} from '../__tests__/stubMatchMedia';

// jsdom doesn't implement showModal/close on <dialog>, so we mock them
beforeAll(() => {
  HTMLDialogElement.prototype.showModal =
    HTMLDialogElement.prototype.showModal ||
    function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
  HTMLDialogElement.prototype.close =
    HTMLDialogElement.prototype.close ||
    function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    };
});

function Drawer({isOpen}: {isOpen: boolean}) {
  return (
    <MobileNav isOpen={isOpen} onOpenChange={() => {}} data-testid="mobile-nav">
      <span>Nav content</span>
    </MobileNav>
  );
}

describe('MobileNav stays rendered while it closes', () => {
  it('transitions display with allow-discrete so it hides only once closed', () => {
    render(<Drawer isOpen />);
    const style = getComputedStyle(screen.getByTestId('mobile-nav'));

    // Without these two the drawer blanks out the instant `isOpen` flips,
    // leaving an open modal dialog that nothing renders — and nothing can
    // click past. See the file header.
    expect(style.transitionProperty).toContain('display');
    expect(style.transitionBehavior).toBe('allow-discrete');
    // A zero hold is the bug wearing the fix's clothes: the drawer stops being
    // rendered on the next style recalc, before any effect can close it.
    expect(style.transitionDuration.trim()).not.toBe('');
    // The hold must stay tied to the motion token rather than a literal: the
    // close delay is derived by reading this value back, so a hardcoded hold
    // and a themed slide-out would drift apart again. jsdom leaves var()
    // unresolved, which is exactly why this reads as a declaration.
    expect(style.transitionDuration).toContain('var(');
  });

  it('keeps the native dialog open until the slide-out has run', () => {
    vi.useFakeTimers();
    try {
      const {rerender} = render(<Drawer isOpen />);
      const dialog = screen.getByTestId('mobile-nav');
      expect(dialog).toHaveAttribute('open');

      act(() => {
        rerender(<Drawer isOpen={false} />);
      });

      // The drawer is on its way out but the dialog is still open, so it is
      // still rendered and still the thing holding the top layer.
      expect(dialog).toHaveAttribute('open');

      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(dialog).not.toHaveAttribute('open');
    } finally {
      vi.useRealTimers();
    }
  });

  it('still closes the dialog when unmounted mid-slide-out', () => {
    vi.useFakeTimers();
    try {
      const {rerender, unmount} = render(<Drawer isOpen />);
      const dialog = screen.getByTestId('mobile-nav');

      act(() => {
        rerender(<Drawer isOpen={false} />);
      });
      expect(dialog).toHaveAttribute('open');

      // Teardown before the timer fires — the unmount-only effect has to close
      // the dialog, or the next showModal() is skipped and the drawer can never
      // be re-opened (#3091).
      unmount();
      expect(dialog).not.toHaveAttribute('open');
    } finally {
      vi.useRealTimers();
    }
  });

  it('still defers the close under prefers-reduced-motion', () => {
    // Query-aware on purpose. A blanket `matches: true` is the stub shape that
    // once left 9 of 11 tests in the sibling edge-case file silently running
    // against a 0ms close delay — see the header of stubMatchMedia.ts. It is
    // inert for this file today (MobileNav renders standalone here, so
    // prefers-reduced-motion is the only query in play), but the shape is the
    // hazard, not the blast radius.
    stubMatchMedia({reduceMotion: true});
    vi.useFakeTimers();
    try {
      const {rerender} = render(<Drawer isOpen />);
      const dialog = screen.getByTestId('mobile-nav');

      act(() => {
        rerender(<Drawer isOpen={false} />);
      });
      // Reduced motion caps the delay at 0 — but 0 is still a macrotask. What
      // must not happen is the close landing synchronously in the commit, while
      // the dialog is mid-flip. This pins deferral, not duration.
      expect(dialog).toHaveAttribute('open');

      act(() => {
        vi.advanceTimersByTime(20);
      });
      expect(dialog).not.toHaveAttribute('open');
    } finally {
      vi.useRealTimers();
      vi.unstubAllGlobals();
    }
  });

  it('re-opening mid-slide-out cancels the pending close', () => {
    vi.useFakeTimers();
    try {
      const {rerender} = render(<Drawer isOpen />);
      const dialog = screen.getByTestId('mobile-nav');

      act(() => {
        rerender(<Drawer isOpen={false} />);
      });
      act(() => {
        rerender(<Drawer isOpen />);
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // The queued close must not fire after the drawer has been re-opened.
      expect(dialog).toHaveAttribute('open');
    } finally {
      vi.useRealTimers();
    }
  });
});
