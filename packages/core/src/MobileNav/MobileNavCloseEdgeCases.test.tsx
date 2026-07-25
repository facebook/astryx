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
import {StrictMode} from 'react';
import {render, screen, fireEvent, act} from '@testing-library/react';
import {MobileNav} from './MobileNav';
import {AppShell} from '../AppShell/AppShell';
import {SideNav, SideNavItem, SideNavSection} from '../SideNav';

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

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', MockResizeObserver);
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
        vi.advanceTimersByTime(300);
      });
      expect(dialog).not.toHaveAttribute('open');
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

  it('still closes when the side prop changes mid-slide-out', () => {
    vi.useFakeTimers();
    try {
      const {rerender} = render(<Drawer isOpen side="start" />);
      const dialog = screen.getByTestId('mobile-nav');

      act(() => {
        rerender(<Drawer isOpen={false} side="start" />);
      });
      expect(dialog).toHaveAttribute('open');

      // A dep change re-runs the effect, whose cleanup clears the pending
      // close. It must re-arm, not drop it on the floor.
      act(() => {
        rerender(<Drawer isOpen={false} side="end" />);
        vi.advanceTimersByTime(300);
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
        vi.advanceTimersByTime(300);
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
      expect(document.documentElement.style.overflow).toBe('clip');

      act(() => {
        rerender(<Drawer isOpen={false} />);
        vi.advanceTimersByTime(300);
      });
      // A drawer that closes but leaves the page scroll-locked is its own
      // flavour of "the page is broken and nothing says why".
      expect(document.documentElement.style.overflow).toBe('');
    } finally {
      vi.useRealTimers();
    }
  });

  it('restores documentElement overflow when unmounted while open', () => {
    const {unmount} = render(<Drawer isOpen />);
    expect(document.documentElement.style.overflow).toBe('clip');

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

  it('closes inside the display hold when a theme shortens it', () => {
    // The hold is `--duration-medium`, which themes rewrite: the shipped y2k
    // theme uses 250ms and the documented "Snappy" preset does too. A close
    // scheduled on the hold's boundary lands on the frame the drawer stops
    // being rendered — which is exactly the #4290 state. The delay has to be
    // derived from the hold actually in effect, not assumed.
    // Full motion — otherwise the reduced-motion branch closes immediately and
    // the boundary is never exercised.
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
    vi.useFakeTimers();
    try {
      const hold = 250;
      const {rerender} = render(
        <MobileNav
          isOpen
          onOpenChange={() => {}}
          style={{transitionDuration: `${hold}ms`}}
          data-testid="mobile-nav">
          <span>Nav content</span>
        </MobileNav>,
      );
      const dialog = screen.getByTestId('mobile-nav');
      expect(getComputedStyle(dialog).transitionDuration).toBe(`${hold}ms`);

      act(() => {
        rerender(
          <MobileNav
            isOpen={false}
            onOpenChange={() => {}}
            style={{transitionDuration: `${hold}ms`}}
            data-testid="mobile-nav">
            <span>Nav content</span>
          </MobileNav>,
        );
      });
      act(() => {
        vi.advanceTimersByTime(hold - 1);
      });

      expect(dialog).not.toHaveAttribute('open');
    } finally {
      vi.useRealTimers();
    }
  });

  it('closes immediately under reduced motion, without shortening the hold', () => {
    // Reduced motion should make the close *sooner*, not the safety margin
    // *smaller*. Shortening the hold to match leaves no slack: one slow frame
    // between the commit and the close macrotask and the drawer has already
    // stopped being rendered — #4290 again, on the accessibility setting.
    // matchMedia is stubbed to `matches: true` for this file.
    vi.useFakeTimers();
    try {
      const style = {transitionDuration: '410ms'};
      const {rerender} = render(
        <MobileNav
          isOpen
          onOpenChange={() => {}}
          style={style}
          data-testid="mobile-nav">
          <span>Nav content</span>
        </MobileNav>,
      );
      const dialog = screen.getByTestId('mobile-nav');

      act(() => {
        rerender(
          <MobileNav
            isOpen={false}
            onOpenChange={() => {}}
            style={style}
            data-testid="mobile-nav">
            <span>Nav content</span>
          </MobileNav>,
        );
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
    render(<TestShell />);
    fireEvent.click(screen.getByRole('button', {name: /open navigation/i}));
    const dialog = screen.getAllByRole('dialog', {hidden: true})[0];
    expect(dialog).toHaveAttribute('open');

    fireEvent(dialog, new Event('cancel', {cancelable: true, bubbles: false}));

    expect(dialog).not.toHaveAttribute('open');
  });

  it('closes the AppShell drawer when the backdrop is clicked', () => {
    render(<TestShell />);
    fireEvent.click(screen.getByRole('button', {name: /open navigation/i}));
    const dialog = screen.getAllByRole('dialog', {hidden: true})[0];
    expect(dialog).toHaveAttribute('open');

    // A click landing on the dialog itself, not the drawer panel, is a
    // backdrop dismiss.
    fireEvent.click(dialog);

    expect(dialog).not.toHaveAttribute('open');
  });
});
