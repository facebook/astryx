// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MobileNavCloseEdgeCases.test.tsx
 * @input Uses vitest, @testing-library/react, MobileNav + AppShell + SideNav
 * @output Edge-case coverage for the deferred close introduced for #4290
 * @position Testing; guards the close path of MobileNav.tsx
 *
 * #4290 moved the unmount close into its own effect so the deferred slide-out
 * close is no longer cut off by its own cleanup. That split is the risky part:
 * the close now depends on a timer surviving to fire, and on the unmount-only
 * effect catching every teardown the timer misses. These tests cover the paths
 * where the two could disagree and leave a modal dialog open — which blocks the
 * whole document, whether or not the drawer is rendered.
 *
 * The invariant behind all of them: the drawer must never be left open. Being
 * slow to close is a glitch; never closing is a wedged page.
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
import {StrictMode, useLayoutEffect} from 'react';
import {render, screen, fireEvent, act} from '@testing-library/react';
import {MAX_EXIT_MS, MobileNav} from './MobileNav';
import {AppShell} from '../AppShell/AppShell';
import {SideNav, SideNavItem, SideNavSection} from '../SideNav';
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

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// `matches` has to depend on the query: a blanket `matches: true` puts AppShell
// below its breakpoint, which these tests need, but it also matches
// `prefers-reduced-motion`, which caps the close delay at 0 — every test here
// would run against an immediate close while appearing to exercise the real
// delay. See the header of stubMatchMedia.ts.

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', MockResizeObserver);
  stubMatchMedia({reduceMotion: false});
});

afterEach(() => {
  document.documentElement.style.overflow = '';
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function Drawer({
  isOpen,
  side,
}: {
  isOpen: boolean;
  side?: 'start' | 'end' | 'auto';
}) {
  return (
    <MobileNav
      isOpen={isOpen}
      onOpenChange={() => {}}
      side={side}
      data-testid="mobile-nav">
      <span>Nav content</span>
    </MobileNav>
  );
}

function drawerOf(dialog: HTMLElement): HTMLElement {
  const drawer = dialog.querySelector<HTMLElement>('[tabindex="-1"]');
  if (drawer == null) {
    throw new Error('no drawer panel');
  }
  return drawer;
}

function TestShell() {
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

describe('MobileNav close path edge cases', () => {
  it('survives StrictMode double-invoked effects', () => {
    vi.useFakeTimers();
    try {
      const {rerender} = render(
        <StrictMode>
          <Drawer isOpen />
        </StrictMode>,
      );
      const dialog = screen.getByTestId('mobile-nav');

      // StrictMode mounts effects, tears them down, and mounts them again. The
      // unmount-only effect closes the dialog during that teardown, so the
      // open/close effect has to re-open it on the second mount.
      expect(dialog).toHaveAttribute('open');

      act(() => {
        rerender(
          <StrictMode>
            <Drawer isOpen={false} />
          </StrictMode>,
        );
      });
      act(() => {
        vi.advanceTimersByTime(MAX_EXIT_MS);
      });
      expect(dialog).not.toHaveAttribute('open');
    } finally {
      vi.useRealTimers();
    }
  });

  // A browser that does not hold a discrete `display` transition (WebKit)
  // drops the dialog to `display: none` the moment the open styling goes, while
  // it is still an open modal: nothing is visible, yet the page stays inert
  // until the close timer fires. So the dialog's own open styling has to be
  // held by the component, not left to that transition. jsdom applies no
  // StyleX styles, so this reads the readable class names StyleX emits in
  // tests: the `open` class (display) is held through the closing commit, the
  // `backdropOpen` class is not, and the hold ends when the dialog closes.
  it('keeps the dialog rendered until its delayed close has run', () => {
    vi.useFakeTimers();
    try {
      const {rerender} = render(<Drawer isOpen />);
      const dialog = screen.getByTestId('mobile-nav');
      expect(dialog.className).toMatch(/styles\.open/);
      expect(dialog.className).toMatch(/styles\.backdropOpen/);

      act(() => {
        rerender(<Drawer isOpen={false} />);
      });
      // Still an open modal, so still rendered; only the backdrop's open
      // styling (the fade-out) has gone.
      expect(dialog).toHaveAttribute('open');
      expect(dialog.className).toMatch(/styles\.open/);
      expect(dialog.className).not.toMatch(/styles\.backdropOpen/);

      act(() => {
        vi.advanceTimersByTime(MAX_EXIT_MS);
      });
      // Closed: the hold is released along with the dialog.
      expect(dialog).not.toHaveAttribute('open');
      expect(dialog.className).not.toMatch(/styles\.open/);
    } finally {
      vi.useRealTimers();
    }
  });

  it('closes the dialog when unmounted while fully open', () => {
    const {unmount} = render(<Drawer isOpen />);
    const dialog = screen.getByTestId('mobile-nav');
    expect(dialog).toHaveAttribute('open');

    unmount();

    // Left open, the next showModal() is skipped and the drawer can never be
    // re-opened (#3091) — and the document stays blocked meanwhile.
    expect(dialog).not.toHaveAttribute('open');
  });

  it('does not restart the slide-out when the side prop changes', () => {
    vi.useFakeTimers();
    try {
      const {rerender} = render(<Drawer isOpen side="start" />);
      const dialog = screen.getByTestId('mobile-nav');

      act(() => {
        rerender(<Drawer isOpen={false} side="start" />);
      });
      expect(dialog).toHaveAttribute('open');

      // Most of the way through the slide-out...
      act(() => {
        vi.advanceTimersByTime(MAX_EXIT_MS - 100);
      });
      expect(dialog).toHaveAttribute('open');

      // ...then change the side. Side resolution lives in its own effect, so
      // this has to leave the close alone. Were `side` a dep of the open/close
      // effect, its cleanup would cancel the pending close and re-arm a fresh
      // full timer, holding the page behind the modal dialog long after the
      // slide-out it is waiting for has ended.
      //
      // The split advance is the whole point: the total must clear one
      // slide-out but not two.
      act(() => {
        rerender(<Drawer isOpen={false} side="end" />);
      });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(dialog).not.toHaveAttribute('open');
    } finally {
      vi.useRealTimers();
    }
  });

  it('settles closed after a rapid open/close/open/close burst', () => {
    vi.useFakeTimers();
    try {
      const {rerender} = render(<Drawer isOpen={false} />);
      const dialog = screen.getByTestId('mobile-nav');

      act(() => {
        rerender(<Drawer isOpen />);
      });
      act(() => {
        rerender(<Drawer isOpen={false} />);
      });
      act(() => {
        rerender(<Drawer isOpen />);
      });
      act(() => {
        rerender(<Drawer isOpen={false} />);
      });
      act(() => {
        vi.advanceTimersByTime(MAX_EXIT_MS);
      });

      expect(dialog).not.toHaveAttribute('open');
    } finally {
      vi.useRealTimers();
    }
  });

  it('restores documentElement overflow once the drawer has closed', () => {
    vi.useFakeTimers();
    try {
      const {rerender} = render(<Drawer isOpen />);
      const dialog = screen.getByTestId('mobile-nav');
      expect(document.documentElement.style.overflow).toBe('hidden');

      // Two acts on purpose: the close timer is armed by the effect that runs
      // when the first act flushes, so advancing inside that same act would
      // advance past nothing and the drawer would never actually close.
      act(() => {
        rerender(<Drawer isOpen={false} />);
      });
      act(() => {
        vi.advanceTimersByTime(MAX_EXIT_MS);
      });
      // Pin the close itself. The effect cleanup resets overflow on every
      // isOpen flip, so the overflow assertion alone passes even with the whole
      // close path deleted — the test name would be the only thing left of it.
      expect(dialog).not.toHaveAttribute('open');
      // A drawer that closes but leaves the page scroll-locked is its own
      // flavour of "the page is broken and nothing says why".
      expect(document.documentElement.style.overflow).toBe('');
    } finally {
      vi.useRealTimers();
    }
  });

  it('restores documentElement overflow when unmounted while open', () => {
    const {unmount} = render(<Drawer isOpen />);
    expect(document.documentElement.style.overflow).toBe('hidden');

    unmount();

    expect(document.documentElement.style.overflow).toBe('');
  });

  it('leaves no pending close timer behind after unmount', () => {
    vi.useFakeTimers();
    try {
      const {rerender, unmount} = render(<Drawer isOpen />);
      act(() => {
        rerender(<Drawer isOpen={false} />);
      });
      unmount();

      // The queued close must be cancelled, not left to fire against a
      // detached node.
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('closes when a slide-out a theme shortens has run', () => {
    // The slide-out is `--duration-medium`, which themes rewrite: the shipped
    // y2k theme uses 250ms. The dialog has to close when the drawer's own
    // transition ends, not after an assumed one.
    vi.useFakeTimers();
    try {
      const {rerender} = render(<Drawer isOpen />);
      const dialog = screen.getByTestId('mobile-nav');
      drawerOf(dialog).style.transitionDuration = '250ms';

      act(() => {
        rerender(<Drawer isOpen={false} />);
      });
      act(() => {
        vi.advanceTimersByTime(249);
      });
      expect(dialog).toHaveAttribute('open');

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(dialog).not.toHaveAttribute('open');
    } finally {
      vi.useRealTimers();
    }
  });

  it('caps a slide-out longer than MAX_EXIT_MS', () => {
    // A theme with a long --duration-medium must not hold the page longer.
    vi.useFakeTimers();
    try {
      const {rerender} = render(<Drawer isOpen />);
      const dialog = screen.getByTestId('mobile-nav');
      drawerOf(dialog).style.transitionDuration = '2s';

      act(() => {
        rerender(<Drawer isOpen={false} />);
      });
      act(() => {
        vi.advanceTimersByTime(MAX_EXIT_MS);
      });

      expect(dialog).not.toHaveAttribute('open');
    } finally {
      vi.useRealTimers();
    }
  });

  it('closes on the next macrotask when the slide-out is zero', () => {
    // A theme can set --duration-medium to 0 — nothing validates motion
    // values. There is then nothing to wait for, so the close goes out on
    // the next macrotask rather than falling back to the cap.
    vi.useFakeTimers();
    try {
      const {rerender} = render(<Drawer isOpen />);
      const dialog = screen.getByTestId('mobile-nav');
      drawerOf(dialog).style.transitionDuration = '0ms';

      act(() => {
        rerender(<Drawer isOpen={false} />);
      });
      act(() => {
        vi.advanceTimersByTime(1);
      });

      expect(dialog).not.toHaveAttribute('open');
    } finally {
      vi.useRealTimers();
    }
  });

  it('closes on the next macrotask under reduced motion', () => {
    // Reduced motion moves the drawer and the scrim in 0.01s, so there is no
    // slide-out to wait for.
    stubMatchMedia({reduceMotion: true});
    vi.useFakeTimers();
    try {
      const {rerender} = render(<Drawer isOpen />);
      const dialog = screen.getByTestId('mobile-nav');
      drawerOf(dialog).style.transitionDuration = '410ms';

      act(() => {
        rerender(<Drawer isOpen={false} />);
      });
      act(() => {
        vi.advanceTimersByTime(1);
      });

      expect(dialog).not.toHaveAttribute('open');
    } finally {
      vi.useRealTimers();
    }
  });

  it('closes the AppShell drawer when dismissed with Escape', () => {
    // Fake timers: AppShell now defers hiding this drawer's Activity boundary
    // (#5701) so MobileNav's own close effect gets a real chance to run —
    // the dialog closes via its normal deferred setTimeout, not synchronously.
    vi.useFakeTimers();
    try {
      render(<TestShell />);
      act(() => {
        fireEvent.click(screen.getByRole('button', {name: /open navigation/i}));
      });
      const dialog = screen.getAllByRole('dialog', {hidden: true})[0];
      expect(dialog).toHaveAttribute('open');

      act(() => {
        fireEvent(
          dialog,
          new Event('cancel', {cancelable: true, bubbles: false}),
        );
      });
      act(() => {
        vi.advanceTimersByTime(MAX_EXIT_MS);
      });

      expect(dialog).not.toHaveAttribute('open');
    } finally {
      vi.useRealTimers();
    }
  });

  it('closes the AppShell drawer when the backdrop is clicked', () => {
    vi.useFakeTimers();
    try {
      render(<TestShell />);
      act(() => {
        fireEvent.click(screen.getByRole('button', {name: /open navigation/i}));
      });
      const dialog = screen.getAllByRole('dialog', {hidden: true})[0];
      expect(dialog).toHaveAttribute('open');

      // A click landing on the dialog itself, not the drawer panel, is a
      // backdrop dismiss.
      act(() => {
        fireEvent.click(dialog);
      });
      act(() => {
        vi.advanceTimersByTime(MAX_EXIT_MS);
      });

      expect(dialog).not.toHaveAttribute('open');
    } finally {
      vi.useRealTimers();
    }
  });

  // #5701: AppShell mounts the drawer inside a React.Activity boundary that
  // used to flip to mode="hidden" in the SAME commit as the close, cutting
  // the slide-out off before it could run. AppShell defers that flip by the
  // drawer's longest slide-out (MAX_EXIT_MS) plus a buffer, so the slide-out
  // runs to its end and MobileNav closes its own dialog first.
  it('keeps the drawer mounted long enough for its slide-out to run (#5701)', () => {
    vi.useFakeTimers();
    try {
      render(<TestShell />);
      act(() => {
        fireEvent.click(screen.getByRole('button', {name: /open navigation/i}));
      });
      const dialog = screen.getAllByRole('dialog', {hidden: true})[0];
      expect(dialog).toHaveAttribute('open');

      act(() => {
        fireEvent.click(
          screen.getByRole('button', {name: /close navigation/i}),
        );
      });

      // Immediately after closing, with no timers advanced: the old
      // synchronous-hide bug closed the dialog on this exact tick. The
      // slide-out is running, so the dialog is still open, inert, and shown.
      expect(dialog).toHaveAttribute('open');
      expect(drawerOf(dialog).inert).toBe(true);
      // Activity hides its subtree with an inline `display: none`.
      expect(dialog.style.display).not.toBe('none');

      // The slide-out (capped at MAX_EXIT_MS in jsdom, where the theme's
      // duration cannot be read) ends and MobileNav closes its dialog while
      // AppShell's Activity boundary still shows the subtree.
      act(() => {
        vi.advanceTimersByTime(MAX_EXIT_MS);
      });
      expect(dialog).not.toHaveAttribute('open');
      expect(dialog.style.display).not.toBe('none');

      // After the hold, Activity hides the subtree.
      act(() => {
        vi.advanceTimersByTime(60);
      });
      expect(dialog.style.display).toBe('none');
    } finally {
      vi.useRealTimers();
    }
  });
  // A controlled open must be visible in the commit that carries it. The
  // Activity boundary only defers the CLOSE; if opening waited for an effect
  // to copy the open state, the drawer would render hidden for one commit
  // with `isOpen` already true.
  it('shows a controlled open in the same commit, not one effect later', () => {
    const commits: {isOpen: boolean; isHidden: boolean}[] = [];
    function Probe({isOpen}: {isOpen: boolean}) {
      useLayoutEffect(() => {
        const drawer = document.querySelector('dialog');
        commits.push({
          isOpen,
          isHidden:
            drawer != null && getComputedStyle(drawer).display === 'none',
        });
      });
      return null;
    }
    const shell = (isOpen: boolean) => (
      <AppShell
        sideNav={
          <SideNav>
            <SideNavSection title="Test" isHeaderHidden>
              <SideNavItem label="Home" />
            </SideNavSection>
          </SideNav>
        }
        mobileNav={{breakpoint: 'md', isOpen, onOpenChange: () => {}}}>
        <Probe isOpen={isOpen} />
        <div>Content</div>
      </AppShell>
    );

    const {rerender} = render(shell(false));
    rerender(shell(true));

    const openCommits = commits.filter(commit => commit.isOpen);
    expect(openCommits.length).toBeGreaterThan(0);
    expect(openCommits.every(commit => !commit.isHidden)).toBe(true);
  });
});
