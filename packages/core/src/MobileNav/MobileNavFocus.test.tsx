// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MobileNavFocus.test.tsx
 * @input Uses vitest, @testing-library/react, MobileNav + AppShell + SideNav
 * @output Regression tests for focus restoration when the drawer closes
 * @position Testing; validates the focus-restore effect in MobileNav.tsx
 *
 * Repro for the umbrella accessibility issue (#3343): closing the drawer
 * dropped focus to `<body>` instead of returning it to the element that
 * opened the drawer.
 *
 * jsdom has NO `<dialog>` implementation at all — `HTMLDialogElement.prototype`
 * exposes only `open`, with no `show`/`showModal`/`close` (verified on
 * jsdom 27.4.0). The other MobileNav suites polyfill those two methods as
 * plain attribute toggles, which means focus never moves in the first place
 * and the defect is invisible.
 *
 * These tests model the two halves of real browser behaviour explicitly:
 * - `showModal()` runs the dialog focusing steps, so focus moves INTO the
 *   drawer. Without this the bug cannot reproduce.
 * - `close()` does NOT hand focus back. That is the behaviour reported
 *   against Safari 26.5.2, and it is what the component must not depend on.
 *
 * SYNC: When MobileNav.tsx's focus handling changes, update these tests.
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  afterEach,
} from 'vitest';
import {useState} from 'react';
import {render, screen, fireEvent, act} from '@testing-library/react';
import {MobileNav} from './MobileNav';
import {AppShell} from '../AppShell/AppShell';
import {SideNav, SideNavItem, SideNavSection} from '../SideNav';

beforeAll(() => {
  // Model the dialog focusing steps: showModal() moves focus into the dialog.
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
    const target = this.querySelector<HTMLElement>('[tabindex]');
    target?.focus();
  };
  // Deliberately does NOT restore focus — mirrors the reported Safari
  // behaviour the component must not rely on.
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
});

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', MockResizeObserver);

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches: true,
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
  vi.restoreAllMocks();
});

/** Controlled standalone harness with a real trigger button. */
function StandaloneHarness({onMounted}: {onMounted?: () => void} = {}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        data-testid="trigger"
        onClick={() => {
          onMounted?.();
          setIsOpen(true);
        }}>
        Open nav
      </button>
      <MobileNav
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        side="start"
        data-testid="nav">
        <a href="/home" data-testid="nav-link">
          Home
        </a>
      </MobileNav>
    </>
  );
}

/** Standalone harness whose whole subtree — trigger included — can unmount. */
function UnmountHarness() {
  const [isMounted, setIsMounted] = useState(true);
  return (
    <>
      <button
        type="button"
        data-testid="unmount"
        onClick={() => setIsMounted(false)}>
        Unmount
      </button>
      {isMounted ? <StandaloneHarness /> : null}
    </>
  );
}

/** Removes the trigger from the DOM in the same commit that closes the drawer. */
function DetachHarness() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasTrigger, setHasTrigger] = useState(true);
  return (
    <>
      {hasTrigger ? (
        <button
          type="button"
          data-testid="trigger"
          onClick={() => setIsOpen(true)}>
          Open nav
        </button>
      ) : null}
      <button
        type="button"
        data-testid="detach"
        onClick={() => {
          setHasTrigger(false);
          setIsOpen(false);
        }}>
        Detach
      </button>
      <MobileNav isOpen={isOpen} onOpenChange={setIsOpen} side="start">
        <span>Content</span>
      </MobileNav>
    </>
  );
}

/** Opens the drawer without ever focusing the button that opens it. */
function BodyHarness() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        data-testid="programmatic"
        onClick={() => setIsOpen(v => !v)}>
        Toggle
      </button>
      <MobileNav isOpen={isOpen} onOpenChange={setIsOpen} side="start">
        <span>Content</span>
      </MobileNav>
    </>
  );
}

function AppShellHarness() {
  return (
    <AppShell
      sideNav={
        <SideNav>
          <SideNavSection title="Test" isHeaderHidden>
            <SideNavItem label="Home" />
          </SideNavSection>
        </SideNav>
      }
      mobileNav={{breakpoint: 'md'}}>
      <div>Content</div>
    </AppShell>
  );
}

describe('MobileNav focus restoration', () => {
  it('returns focus to the trigger when the drawer closes (standalone)', () => {
    vi.useFakeTimers();
    try {
      render(<StandaloneHarness />);

      const trigger = screen.getByTestId('trigger');
      trigger.focus();
      fireEvent.click(trigger);

      // showModal() pulled focus into the drawer.
      expect(trigger).not.toHaveFocus();

      fireEvent.click(screen.getByRole('button', {name: /close/i}));
      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(trigger).toHaveFocus();
    } finally {
      vi.useRealTimers();
    }
  });

  it('returns focus to the hamburger toggle when the AppShell drawer closes', () => {
    vi.useFakeTimers();
    try {
      render(<AppShellHarness />);

      const toggle = screen.getByRole('button', {name: /open navigation/i});
      toggle.focus();
      fireEvent.click(toggle);

      expect(toggle).not.toHaveFocus();

      fireEvent.click(screen.getByRole('button', {name: /close navigation/i}));
      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(document.activeElement).not.toBe(document.body);
      expect(toggle).toHaveFocus();
    } finally {
      vi.useRealTimers();
    }
  });

  it('restores focus only after the native dialog has closed', () => {
    // Load-bearing ordering contract. Browsers hold the rest of the document
    // inert while a modal <dialog> is open, so focusing the trigger before
    // close() would be silently dropped — the exact class of failure this fix
    // exists to remove. jsdom has no top layer and cannot reproduce that, so
    // assert the call order directly instead. Reordering the focus-restore
    // effect above the open/close effect in MobileNav.tsx breaks this.
    vi.useFakeTimers();
    try {
      render(<StandaloneHarness />);

      const trigger = screen.getByTestId('trigger');
      trigger.focus();
      fireEvent.click(trigger);

      const closeSpy = vi.spyOn(HTMLDialogElement.prototype, 'close');
      const focusSpy = vi.spyOn(trigger, 'focus');

      fireEvent.click(screen.getByRole('button', {name: /close/i}));
      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(closeSpy).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
      expect(focusSpy.mock.invocationCallOrder[0]).toBeGreaterThan(
        closeSpy.mock.invocationCallOrder[0],
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('returns focus to the trigger even when focus moved inside the drawer first', () => {
    vi.useFakeTimers();
    try {
      render(<StandaloneHarness />);

      const trigger = screen.getByTestId('trigger');
      trigger.focus();
      fireEvent.click(trigger);

      // User tabs to a link inside the drawer before dismissing it.
      const link = screen.getByTestId('nav-link');
      link.focus();
      expect(link).toHaveFocus();

      fireEvent.click(screen.getByRole('button', {name: /close/i}));
      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(trigger).toHaveFocus();
    } finally {
      vi.useRealTimers();
    }
  });

  it('restores focus when the drawer is closed via Escape', () => {
    vi.useFakeTimers();
    try {
      render(<StandaloneHarness />);

      const trigger = screen.getByTestId('trigger');
      trigger.focus();
      fireEvent.click(trigger);

      const dialog = screen.getByTestId('nav');
      fireEvent(
        dialog,
        new Event('cancel', {bubbles: false, cancelable: true}),
      );
      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(trigger).toHaveFocus();
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not throw when the drawer unmounts while still open', () => {
    vi.useFakeTimers();
    try {
      render(<UnmountHarness />);

      const trigger = screen.getByTestId('trigger');
      trigger.focus();
      fireEvent.click(trigger);
      expect(trigger).not.toHaveFocus();

      // Unmounting the whole drawer subtree also takes the trigger with it —
      // the restore must not throw and must not force focus onto a detached
      // node.
      expect(() => {
        fireEvent.click(screen.getByTestId('unmount'));
        act(() => {
          vi.advanceTimersByTime(400);
        });
      }).not.toThrow();
      expect(document.activeElement).toBe(document.body);
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not throw when the trigger is removed before the drawer closes', () => {
    vi.useFakeTimers();
    try {
      render(<DetachHarness />);

      const trigger = screen.getByTestId('trigger');
      trigger.focus();
      fireEvent.click(trigger);

      // jsdom silently ignores focus() on a detached node, so assert the call
      // is never made rather than assert on activeElement.
      const triggerFocus = vi.spyOn(trigger, 'focus');
      expect(() => {
        fireEvent.click(screen.getByTestId('detach'));
        act(() => {
          vi.advanceTimersByTime(400);
        });
      }).not.toThrow();
      expect(screen.queryByTestId('trigger')).toBeNull();
      expect(triggerFocus).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('leaves focus alone when nothing was focused before opening', () => {
    vi.useFakeTimers();
    try {
      render(<BodyHarness />);

      // fireEvent.click does not focus, so <body> is the "trigger" the drawer
      // sees when it opens — there is nothing meaningful to restore to.
      expect(document.activeElement).toBe(document.body);
      fireEvent.click(screen.getByTestId('programmatic'));
      act(() => {
        vi.advanceTimersByTime(400);
      });

      // jsdom treats <body> as a non-focusable area, so body.focus() is a
      // silent no-op there and an activeElement assertion cannot tell the two
      // implementations apart. Spy on the call itself — in a real browser
      // body.focus() DOES blur whatever is focused.
      const bodyFocus = vi.spyOn(document.body, 'focus');
      fireEvent.click(screen.getByRole('button', {name: /close/i}));
      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(bodyFocus).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});
