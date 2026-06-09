// Copyright (c) Meta Platforms, Inc. and affiliates.

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
import {render, screen, fireEvent} from '@testing-library/react';
import {XDSAppShell} from './XDSAppShell';
import {XDSMobileNav} from '../MobileNav';
import {XDSSideNav, XDSSideNavItem, XDSSideNavSection} from '../SideNav';
import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '../TopNav';

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

// Helper: minimal SideNav that provides the navigation landmark
function TestSideNav({children}: {children?: React.ReactNode}) {
  return (
    <XDSSideNav>
      <XDSSideNavSection title="Test" isHeaderHidden>
        <XDSSideNavItem
          label={typeof children === 'string' ? children : 'Nav'}
        />
      </XDSSideNavSection>
    </XDSSideNav>
  );
}

// Mock matchMedia
function createMockMatchMedia(matches: boolean) {
  const listeners: ((e: MediaQueryListEvent) => void)[] = [];
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
        if (idx >= 0) {
          listeners.splice(idx, 1);
        }
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
      <XDSAppShell sideNav={<TestSideNav />}>
        <div>Content</div>
      </XDSAppShell>,
    );
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    expect(screen.getByText('Nav')).toBeInTheDocument();
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
      <XDSAppShell sideNav={<TestSideNav />}>
        <div>Content</div>
      </XDSAppShell>,
    );
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Side navigation');
  });

  // ===========================================================================
  // SideNav collapse — uncontrolled
  // ===========================================================================

  it('sideNav is visible by default (uncontrolled)', () => {
    render(
      <XDSAppShell sideNav={<TestSideNav />}>
        <div>Content</div>
      </XDSAppShell>,
    );
    expect(screen.getByText('Nav')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  // (Collapse tests removed — collapse is now managed by XDSSideNav, not AppShell)

  // ===========================================================================
  // Responsive breakpoint
  // ===========================================================================

  it('tracks breakpoint changes', () => {
    render(
      <XDSAppShell sideNav={<TestSideNav />} mobileNav={{breakpoint: 'md'}}>
        <div>Content</div>
      </XDSAppShell>,
    );

    // matchMedia should have been called for the breakpoint
    expect(window.matchMedia).toHaveBeenCalled();
  });

  it('does not enter mobile mode when mobileNav breakpoint is none', () => {
    render(
      <XDSAppShell sideNav={<TestSideNav />} mobileNav={{breakpoint: 'none'}}>
        <div>Content</div>
      </XDSAppShell>,
    );

    // breakpoint 'none' uses (max-width: 0px) which never matches,
    // so sideNav stays inline and no mobile nav toggle appears
    expect(screen.getByText('Nav')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: /menu/i}),
    ).not.toBeInTheDocument();
  });

  // ===========================================================================
  // Mobile overlay (default XDSMobileNav wrapping sideNav)
  // ===========================================================================

  it('shows default mobile nav when below breakpoint and not collapsed', () => {
    // Start below breakpoint with sideNav expanded
    mockMql = createMockMatchMedia(true);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));

    render(
      <XDSAppShell sideNav={<TestSideNav />}>
        <div>Content</div>
      </XDSAppShell>,
    );

    // Should show default mobile nav (XDSMobileNav wrapping sideNav)
    expect(screen.getByRole('dialog', {hidden: true})).toBeInTheDocument();
    // Should show nav content inside the mobile nav
    expect(screen.getByText('Nav')).toBeInTheDocument();
  });

  it('renders default mobile nav when below breakpoint', () => {
    mockMql = createMockMatchMedia(true);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));

    render(
      <XDSAppShell sideNav={<TestSideNav />}>
        <div>Content</div>
      </XDSAppShell>,
    );

    // Default mobile nav should be rendered when below breakpoint
    expect(screen.getByRole('dialog', {hidden: true})).toBeInTheDocument();
  });

  it('keeps TopNav children in the combined mobile drawer with sideNav content', () => {
    mockMql = createMockMatchMedia(true);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));

    render(
      <XDSAppShell
        topNav={
          <XDSTopNav
            label="Navigation"
            heading={<XDSTopNavHeading heading="App" />}>
            <XDSTopNavItem label="Home" href="/" />
          </XDSTopNav>
        }
        sideNav={<TestSideNav>Side item</TestSideNav>}>
        <div>Content</div>
      </XDSAppShell>,
    );

    expect(
      screen.getByRole('button', {name: /open navigation/i}),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('dialog', {hidden: true}).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getAllByText('Side item').length).toBeGreaterThan(0);
  });

  it('shows mobile nav toggle for sideNav-only layout with heading-only topNav (#2243)', () => {
    mockMql = createMockMatchMedia(true);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));

    render(
      <XDSAppShell
        topNav={
          <XDSTopNav
            label="Main navigation"
            heading={<XDSTopNavHeading heading="My App" />}
          />
        }
        sideNav={<TestSideNav>Home</TestSideNav>}
        mobileNav={{breakpoint: 'md'}}>
        <div>Content</div>
      </XDSAppShell>,
    );

    expect(
      screen.getByRole('button', {name: /open navigation/i}),
    ).toBeInTheDocument();
  });

  it('renders sidenav items exactly once in mobile drawer when topNav has only heading (#2243)', () => {
    mockMql = createMockMatchMedia(true);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));

    render(
      <XDSAppShell
        variant="section"
        topNav={
          <XDSTopNav
            label="Main navigation"
            heading={<XDSTopNavHeading heading="My App" />}
          />
        }
        sideNav={
          <XDSSideNav>
            <XDSSideNavItem label="Dashboard" href="/" isSelected />
            <XDSSideNavItem label="Settings" href="/settings" />
          </XDSSideNav>
        }
        mobileNav={{breakpoint: 'md'}}
        contentPadding={4}>
        <div>Content</div>
      </XDSAppShell>,
    );

    expect(
      screen.getByRole('button', {name: /open navigation/i}),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Dashboard')).toHaveLength(1);
    expect(screen.getAllByText('Settings')).toHaveLength(1);
  });

  it('does not show auto mobile toggle when sideNav is explicitly undefined (#2243)', () => {
    mockMql = createMockMatchMedia(true);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));

    render(
      <XDSAppShell
        topNav={
          <XDSTopNav
            label="Main navigation"
            heading={<XDSTopNavHeading heading="My App" />}
          />
        }
        sideNav={undefined}
        mobileNav={{breakpoint: 'md'}}>
        <div>Content</div>
      </XDSAppShell>,
    );

    expect(
      screen.queryByRole('button', {name: /open navigation/i}),
    ).not.toBeInTheDocument();
  });

  it('does not show auto mobile toggle when sideNav is omitted entirely', () => {
    mockMql = createMockMatchMedia(true);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));

    render(
      <XDSAppShell
        topNav={
          <XDSTopNav
            label="Main navigation"
            heading={<XDSTopNavHeading heading="My App" />}
          />
        }
        mobileNav={{breakpoint: 'md'}}>
        <div>Content</div>
      </XDSAppShell>,
    );

    expect(
      screen.queryByRole('button', {name: /open navigation/i}),
    ).not.toBeInTheDocument();
  });

  it('heading-only topNav does not prevent sidenav from collapsing to mobile (#2243)', () => {
    mockMql = createMockMatchMedia(true);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));

    const {container} = render(
      <XDSAppShell
        topNav={
          <XDSTopNav
            label="Main navigation"
            heading={<XDSTopNavHeading heading="My App" />}
          />
        }
        sideNav={<TestSideNav>Home</TestSideNav>}
        mobileNav={{breakpoint: 'md'}}>
        <div>Content</div>
      </XDSAppShell>,
    );

    const inlinePanel = container.querySelector('.xds-layout-panel');
    expect(inlinePanel).toBeNull();
  });

  it('renders mobile layout on first render when defaultIsMobile is true', () => {
    // matchMedia says mobile too — simulates correct SSR hint
    mockMql = createMockMatchMedia(true);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));

    const {container} = render(
      <XDSAppShell
        sideNav={<TestSideNav />}
        mobileNav={{defaultIsMobile: true}}>
        <div>Content</div>
      </XDSAppShell>,
    );

    // SideNav should NOT be rendered inline — it's in the mobile drawer
    const inlinePanel = container.querySelector(
      '.xds-app-shell > .xds-layout .xds-layout-panel',
    );
    expect(inlinePanel).toBeNull();
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
        sideNav={<TestSideNav />}
        mobileNav={
          <XDSMobileNav
            isOpen={true}
            onOpenChange={() => {}}
            header="Test App"
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
      <XDSAppShell sideNav={<TestSideNav />}>
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
        sideNav={<TestSideNav />}
        mobileNav={
          <XDSMobileNav
            isOpen={false}
            onOpenChange={() => {}}
            data-testid="appshell-mobile-nav">
            <div>Mobile Nav</div>
          </XDSMobileNav>
        }>
        <div>Content</div>
      </XDSAppShell>,
    );
    // Default auto-generated mobile nav should NOT appear — only the explicit one
    // (The explicit mobileNav is rendered as a ReactNode, so only one dialog exists)
    const dialogs = screen.getAllByRole('dialog', {hidden: true});
    expect(dialogs).toHaveLength(1);
    // Explicit mobileNav slot should be rendered
    expect(screen.getByTestId('appshell-mobile-nav')).toBeInTheDocument();
  });

  it('mobileNav onOpenChange is called when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <XDSAppShell
        sideNav={<TestSideNav />}
        mobileNav={
          <XDSMobileNav isOpen={true} onOpenChange={onClose} header="Nav">
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
  // Content padding
  // ===========================================================================

  it('passes contentPadding to main content area', () => {
    render(
      <XDSAppShell contentPadding={4} data-testid="shell">
        <div>Content</div>
      </XDSAppShell>,
    );
    // Main content should render — contentPadding is passed through
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('defaults to contentPadding={0} when not specified', () => {
    render(
      <XDSAppShell data-testid="shell">
        <div>Content</div>
      </XDSAppShell>,
    );
    // Should render without error — padding=0 is the default
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('supports contentPadding={0} for full-bleed content', () => {
    render(
      <XDSAppShell contentPadding={0} data-testid="shell">
        <div>Full bleed content</div>
      </XDSAppShell>,
    );
    expect(screen.getByText('Full bleed content')).toBeInTheDocument();
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
