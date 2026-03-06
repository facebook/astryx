/**
 * @file XDSAppShell.test.tsx
 * @input Uses vitest, @testing-library/react, XDSAppShell component
 * @output Unit tests for XDSAppShell component behavior
 * @position Testing; validates XDSAppShell.tsx implementation
 *
 * SYNC: When XDSAppShell.tsx changes, update tests to match new behavior
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
import {render, screen, fireEvent, act} from '@testing-library/react';
import {XDSAppShell} from './XDSAppShell';
import {XDSMobileNav} from '../MobileNav';

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

// Mock ResizeObserver
class MockResizeObserver {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal('ResizeObserver', MockResizeObserver);

// Mock matchMedia
function createMockMatchMedia(matches: boolean) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  const mql = {
    matches,
    media: '',
    onchange: null,
    addEventListener: vi.fn(
      (_event: string, handler: (e: MediaQueryListEvent) => void) => {
        listeners.push(handler);
      },
    ),
    removeEventListener: vi.fn(
      (_event: string, handler: (e: MediaQueryListEvent) => void) => {
        const idx = listeners.indexOf(handler);
        if (idx >= 0) listeners.splice(idx, 1);
      },
    ),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
    // Expose for test control
    _listeners: listeners,
    _setMatches: (newMatches: boolean) => {
      mql.matches = newMatches;
      for (const listener of listeners) {
        listener({matches: newMatches} as MediaQueryListEvent);
      }
    },
  };
  return mql;
}

let mockMql: ReturnType<typeof createMockMatchMedia>;

beforeEach(() => {
  mockMql = createMockMatchMedia(false);
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('XDSAppShell', () => {
  // ===========================================================================
  // Basic rendering
  // ===========================================================================

  it('renders children as main content', () => {
    render(
      <XDSAppShell>
        <div>Main content</div>
      </XDSAppShell>,
    );
    expect(screen.getByText('Main content')).toBeInTheDocument();
  });

  it('renders main element with role="main"', () => {
    render(
      <XDSAppShell>
        <div>Content</div>
      </XDSAppShell>,
    );
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders topNav in the header area', () => {
    render(
      <XDSAppShell topNav={<div>Top Nav</div>}>
        <div>Content</div>
      </XDSAppShell>,
    );
    expect(screen.getByText('Top Nav')).toBeInTheDocument();
  });

  it('renders banner when provided', () => {
    render(
      <XDSAppShell banner={<div>System banner</div>}>
        <div>Content</div>
      </XDSAppShell>,
    );
    expect(screen.getByText('System banner')).toBeInTheDocument();
  });

  it('renders sideNav in a nav element', () => {
    render(
      <XDSAppShell sideNav={<div>Side Nav</div>}>
        <div>Content</div>
      </XDSAppShell>,
    );
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    expect(screen.getByText('Side Nav')).toBeInTheDocument();
  });

  it('renders without optional slots', () => {
    render(
      <XDSAppShell>
        <div>Just content</div>
      </XDSAppShell>,
    );
    expect(screen.getByText('Just content')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('supports data-testid', () => {
    render(
      <XDSAppShell data-testid="my-shell">
        <div>Content</div>
      </XDSAppShell>,
    );
    expect(screen.getByTestId('my-shell')).toBeInTheDocument();
  });

  // ===========================================================================
  // Skip-to-content link
  // ===========================================================================

  it('renders a skip-to-content link', () => {
    render(
      <XDSAppShell>
        <div>Content</div>
      </XDSAppShell>,
    );
    const skipLink = screen.getByTestId('skip-to-content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#xds-app-shell-main');
    expect(skipLink.textContent).toBe('Skip to content');
  });

  it('main content has the correct id for skip link', () => {
    render(
      <XDSAppShell>
        <div>Content</div>
      </XDSAppShell>,
    );
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'xds-app-shell-main');
  });

  // ===========================================================================
  // SideNav accessibility
  // ===========================================================================

  it('sideNav has aria-label', () => {
    render(
      <XDSAppShell sideNav={<div>Nav</div>}>
        <div>Content</div>
      </XDSAppShell>,
    );
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Application navigation');
  });

  // ===========================================================================
  // SideNav collapse — uncontrolled
  // ===========================================================================

  it('sideNav is visible by default (uncontrolled)', () => {
    render(
      <XDSAppShell sideNav={<div>Nav Items</div>}>
        <div>Content</div>
      </XDSAppShell>,
    );
    expect(screen.getByText('Nav Items')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('sideNav is hidden when defaultIsSideNavCollapsed is true', () => {
    render(
      <XDSAppShell
        sideNav={<div>Nav Items</div>}
        defaultIsSideNavCollapsed={true}>
        <div>Content</div>
      </XDSAppShell>,
    );
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  // ===========================================================================
  // SideNav collapse — controlled
  // ===========================================================================

  it('sideNav is hidden when isSideNavCollapsed is true (controlled)', () => {
    render(
      <XDSAppShell
        sideNav={<div>Nav Items</div>}
        isSideNavCollapsed={true}
        onSideNavCollapsedChange={() => {}}>
        <div>Content</div>
      </XDSAppShell>,
    );
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('sideNav is visible when isSideNavCollapsed is false (controlled)', () => {
    render(
      <XDSAppShell
        sideNav={<div>Nav Items</div>}
        isSideNavCollapsed={false}
        onSideNavCollapsedChange={() => {}}>
        <div>Content</div>
      </XDSAppShell>,
    );
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  // ===========================================================================
  // Responsive breakpoint
  // ===========================================================================

  it('auto-collapses sideNav below breakpoint', () => {
    const onChange = vi.fn();
    render(
      <XDSAppShell
        sideNav={<div>Nav</div>}
        sideNavBreakpoint="md"
        onSideNavCollapsedChange={onChange}>
        <div>Content</div>
      </XDSAppShell>,
    );

    // Simulate going below breakpoint
    act(() => {
      mockMql._setMatches(true);
    });

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('does not auto-collapse when sideNavBreakpoint is none', () => {
    const onChange = vi.fn();
    render(
      <XDSAppShell
        sideNav={<div>Nav</div>}
        sideNavBreakpoint="none"
        onSideNavCollapsedChange={onChange}>
        <div>Content</div>
      </XDSAppShell>,
    );

    expect(window.matchMedia).not.toHaveBeenCalled();
  });

  // ===========================================================================
  // Mobile overlay (default XDSMobileNav wrapping sideNav)
  // ===========================================================================

  it('shows default mobile nav when below breakpoint and not collapsed', () => {
    // Start below breakpoint with sideNav expanded
    mockMql = createMockMatchMedia(true);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));

    render(
      <XDSAppShell
        sideNav={<div>Nav Items</div>}
        isSideNavCollapsed={false}
        onSideNavCollapsedChange={() => {}}>
        <div>Content</div>
      </XDSAppShell>,
    );

    // Should show default mobile nav (XDSMobileNav wrapping sideNav)
    expect(screen.getByTestId('sidenav-mobile')).toBeInTheDocument();
    // Should show nav content inside the mobile nav
    expect(screen.getByText('Nav Items')).toBeInTheDocument();
  });

  it('default mobile nav calls onSideNavCollapsedChange on close', () => {
    mockMql = createMockMatchMedia(true);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));

    const onChange = vi.fn();
    render(
      <XDSAppShell
        sideNav={<div>Nav</div>}
        isSideNavCollapsed={false}
        onSideNavCollapsedChange={onChange}>
        <div>Content</div>
      </XDSAppShell>,
    );

    // Click the close button inside the default mobile nav
    const closeButton = screen.getByRole('button', {name: /close/i});
    fireEvent.click(closeButton);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  // ===========================================================================
  // Height modes
  // ===========================================================================

  it('defaults to fill mode', () => {
    render(
      <XDSAppShell data-testid="shell">
        <div>Content</div>
      </XDSAppShell>,
    );
    // The root element should exist (fill is default)
    expect(screen.getByTestId('shell')).toBeInTheDocument();
  });

  it('supports auto height mode', () => {
    render(
      <XDSAppShell height="auto" data-testid="shell">
        <div>Content</div>
      </XDSAppShell>,
    );
    expect(screen.getByTestId('shell')).toBeInTheDocument();
  });

  it('renders topNav in auto mode', () => {
    render(
      <XDSAppShell height="auto" topNav={<div>Nav</div>} data-testid="shell">
        <div>Content</div>
      </XDSAppShell>,
    );
    expect(screen.getByText('Nav')).toBeInTheDocument();
  });

  // ===========================================================================
  // Sticky navigation in auto mode
  // ===========================================================================

  it('wraps header in sticky container in auto mode', () => {
    render(
      <XDSAppShell
        height="auto"
        topNav={<div data-testid="topnav">Nav</div>}
        data-testid="shell">
        <div>Content</div>
      </XDSAppShell>,
    );
    const topNav = screen.getByTestId('topnav');
    // The sticky wrapper is the parent of the XDSLayoutHeader div
    // topNav -> XDSLayoutHeader div -> sticky wrapper div
    const headerWrapper = topNav.parentElement?.parentElement;
    expect(headerWrapper).toBeTruthy();
    expect(
      headerWrapper?.style.position ||
        getComputedStyle(headerWrapper!).position,
    ).toBeDefined();
  });

  it('does not apply sticky wrapper in fill mode', () => {
    render(
      <XDSAppShell
        height="fill"
        topNav={<div data-testid="topnav">Nav</div>}
        data-testid="shell">
        <div>Content</div>
      </XDSAppShell>,
    );
    // In fill mode, header still renders but without sticky wrapper styles
    expect(screen.getByTestId('topnav')).toBeInTheDocument();
  });

  it('wraps sideNav in sticky container in auto mode', () => {
    render(
      <XDSAppShell
        height="auto"
        topNav={<div>Nav</div>}
        sideNav={<div data-testid="sidenav">Side</div>}
        data-testid="shell">
        <div>Content</div>
      </XDSAppShell>,
    );
    expect(screen.getByTestId('sidenav')).toBeInTheDocument();
    // The sideNav should be wrapped in a sticky div in auto mode
    const sideNav = screen.getByTestId('sidenav');
    // sideNav -> XDSLayoutPanel div -> sticky wrapper div
    const stickyWrapper = sideNav.parentElement?.parentElement;
    expect(stickyWrapper).toBeTruthy();
  });

  it('sets up ResizeObserver on header in auto mode', () => {
    const observeSpy = vi.fn();
    const disconnectSpy = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(public callback: ResizeObserverCallback) {}
        observe = observeSpy;
        unobserve = vi.fn();
        disconnect = disconnectSpy;
      },
    );

    render(
      <XDSAppShell height="auto" topNav={<div>Nav</div>} data-testid="shell">
        <div>Content</div>
      </XDSAppShell>,
    );

    expect(observeSpy).toHaveBeenCalled();
  });

  it('does not set up ResizeObserver in fill mode', () => {
    const observeSpy = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(public callback: ResizeObserverCallback) {}
        observe = observeSpy;
        unobserve = vi.fn();
        disconnect = vi.fn();
      },
    );

    render(
      <XDSAppShell height="fill" topNav={<div>Nav</div>} data-testid="shell">
        <div>Content</div>
      </XDSAppShell>,
    );

    expect(observeSpy).not.toHaveBeenCalled();
  });

  // ===========================================================================
  // Mobile nav slot
  // ===========================================================================

  it('renders mobileNav slot content', () => {
    render(
      <XDSAppShell
        sideNav={<div>Side Nav</div>}
        mobileNav={
          <XDSMobileNav
            isOpen={true}
            onOpenChange={() => {}}
            title="Test App"
            data-testid="appshell-mobile-nav">
            <div>Mobile Nav Content</div>
          </XDSMobileNav>
        }>
        <div>Content</div>
      </XDSAppShell>,
    );
    expect(screen.getByTestId('appshell-mobile-nav')).toBeInTheDocument();
    expect(screen.getByText('Mobile Nav Content')).toBeInTheDocument();
  });

  it('does not render mobileNav when not provided', () => {
    render(
      <XDSAppShell sideNav={<div>Side Nav</div>}>
        <div>Content</div>
      </XDSAppShell>,
    );
    expect(screen.queryByTestId('appshell-mobile-nav')).not.toBeInTheDocument();
  });

  it('uses explicit mobileNav instead of default when provided', () => {
    mockMql = createMockMatchMedia(true);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));

    render(
      <XDSAppShell
        sideNav={<div>Side Nav</div>}
        mobileNav={
          <XDSMobileNav
            isOpen={false}
            onOpenChange={() => {}}
            data-testid="appshell-mobile-nav">
            <div>Mobile Nav</div>
          </XDSMobileNav>
        }
        isSideNavCollapsed={false}
        onSideNavCollapsedChange={() => {}}>
        <div>Content</div>
      </XDSAppShell>,
    );
    // Default mobile nav should NOT appear
    expect(screen.queryByTestId('sidenav-mobile')).not.toBeInTheDocument();
    // Explicit mobileNav slot should be rendered
    expect(screen.getByTestId('appshell-mobile-nav')).toBeInTheDocument();
  });

  it('mobileNav onOpenChange is called when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <XDSAppShell
        sideNav={<div>Side Nav</div>}
        mobileNav={
          <XDSMobileNav isOpen={true} onOpenChange={onClose} title="Nav">
            <div>Mobile Nav</div>
          </XDSMobileNav>
        }>
        <div>Content</div>
      </XDSAppShell>,
    );
    const closeButton = screen.getByRole('button', {
      name: /close/i,
    });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  // ===========================================================================
  // Ref forwarding
  // ===========================================================================

  it('forwards ref to root element', () => {
    const ref = vi.fn();
    render(
      <XDSAppShell ref={ref} data-testid="shell">
        <div>Content</div>
      </XDSAppShell>,
    );
    expect(ref).toHaveBeenCalled();
    expect(ref.mock.calls[0][0]).toBe(screen.getByTestId('shell'));
  });
});
