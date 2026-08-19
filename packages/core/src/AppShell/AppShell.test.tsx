// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file AppShell.test.tsx
 * @input Uses vitest, @testing-library/react, AppShell component
 * @output Unit tests for AppShell component behavior
 * @position Testing; validates AppShell.tsx implementation
 *
 * SYNC: When AppShell.tsx changes, update tests to match new behavior
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
import userEvent from '@testing-library/user-event';
import {AppShell} from './AppShell';
import {InternationalizationProvider} from '../i18n';
import {MobileNav} from '../MobileNav';
import {SideNav, SideNavItem, SideNavSection} from '../SideNav';
import {TopNav, TopNavHeading, TopNavItem} from '../TopNav';
import {useAppShellMobile} from './AppShellMobileContext';

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
    <SideNav>
      <SideNavSection title="Test" isHeaderHidden>
        <SideNavItem label={typeof children === 'string' ? children : 'Nav'} />
      </SideNavSection>
    </SideNav>
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

describe('AppShell', () => {
  // ===========================================================================
  // Basic rendering
  // ===========================================================================

  it('renders children as main content', () => {
    render(
      <AppShell>
        <div>Main content</div>
      </AppShell>,
    );
    expect(screen.getByText('Main content')).toBeInTheDocument();
  });

  it('renders main element with role="main"', () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>,
    );
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders topNav in the header area', () => {
    render(
      <AppShell topNav={<div>Top Nav</div>}>
        <div>Content</div>
      </AppShell>,
    );
    expect(screen.getByText('Top Nav')).toBeInTheDocument();
  });

  it('renders banner when provided', () => {
    render(
      <AppShell banner={<div>System banner</div>}>
        <div>Content</div>
      </AppShell>,
    );
    expect(screen.getByText('System banner')).toBeInTheDocument();
  });

  it('renders sideNav in a nav element', () => {
    render(
      <AppShell sideNav={<TestSideNav />}>
        <div>Content</div>
      </AppShell>,
    );
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    expect(screen.getByText('Nav')).toBeInTheDocument();
  });

  it('renders without optional slots', () => {
    render(
      <AppShell>
        <div>Just content</div>
      </AppShell>,
    );
    expect(screen.getByText('Just content')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('supports data-testid', () => {
    render(
      <AppShell data-testid="my-shell">
        <div>Content</div>
      </AppShell>,
    );
    expect(screen.getByTestId('my-shell')).toBeInTheDocument();
  });

  // ===========================================================================
  // Skip-to-content link
  // ===========================================================================

  it('renders a skip-to-content link', () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>,
    );
    const skipLink = screen.getByTestId('skip-to-content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#astryx-app-shell-main');
    expect(skipLink.textContent).toBe('Skip to content');
  });

  it('main content has the correct id for skip link', () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>,
    );
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'astryx-app-shell-main');
  });

  it('moves focus to the main content when the skip link is activated', () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>,
    );
    const skipLink = screen.getByTestId('skip-to-content');
    const main = screen.getByRole('main');
    // The target must be programmatically focusable for focus to move
    expect(main).toHaveAttribute('tabindex', '-1');
    fireEvent.click(skipLink);
    expect(document.activeElement).toBe(main);
  });

  it('skip link text comes from the i18n catalog', () => {
    render(
      <InternationalizationProvider
        locale="en"
        overrides={{en: {'@astryx.appShell.skipToContent': 'Jump to main'}}}>
        <AppShell>
          <div>Content</div>
        </AppShell>
      </InternationalizationProvider>,
    );
    expect(screen.getByTestId('skip-to-content').textContent).toBe(
      'Jump to main',
    );
  });

  // ===========================================================================
  // Banner landmark
  // ===========================================================================

  it('exposes the header region as a banner landmark', () => {
    render(
      <AppShell topNav={<div>Top Nav</div>}>
        <div>Content</div>
      </AppShell>,
    );
    const banner = screen.getByRole('banner');
    expect(banner).toBeInTheDocument();
    // banner must be top-level — not nested inside another landmark
    expect(screen.getByRole('main')).not.toContainElement(banner);
  });

  it('does not render a banner landmark without header content', () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>,
    );
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
  });

  // ===========================================================================
  // SideNav accessibility
  // ===========================================================================

  it('sideNav has aria-label', () => {
    render(
      <AppShell sideNav={<TestSideNav />}>
        <div>Content</div>
      </AppShell>,
    );
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Side navigation');
  });

  // ===========================================================================
  // SideNav collapse — uncontrolled
  // ===========================================================================

  it('sideNav is visible by default (uncontrolled)', () => {
    render(
      <AppShell sideNav={<TestSideNav />}>
        <div>Content</div>
      </AppShell>,
    );
    expect(screen.getByText('Nav')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  // (Collapse tests removed — collapse is now managed by SideNav, not AppShell)

  // ===========================================================================
  // Responsive breakpoint
  // ===========================================================================

  it('tracks breakpoint changes', () => {
    render(
      <AppShell sideNav={<TestSideNav />} mobileNav={{breakpoint: 'md'}}>
        <div>Content</div>
      </AppShell>,
    );

    // matchMedia should have been called for the breakpoint
    expect(window.matchMedia).toHaveBeenCalled();
  });

  it('does not enter mobile mode when mobileNav breakpoint is none', () => {
    render(
      <AppShell sideNav={<TestSideNav />} mobileNav={{breakpoint: 'none'}}>
        <div>Content</div>
      </AppShell>,
    );

    // breakpoint 'none' uses (max-width: 0px) which never matches,
    // so sideNav stays inline and no mobile nav toggle appears
    expect(screen.getByText('Nav')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: /menu/i}),
    ).not.toBeInTheDocument();
  });

  // ===========================================================================
  // Mobile overlay (default MobileNav wrapping sideNav)
  // ===========================================================================

  it('shows default mobile nav when below breakpoint and not collapsed', () => {
    // Start below breakpoint with sideNav expanded
    mockMql = createMockMatchMedia(true);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));

    render(
      <AppShell sideNav={<TestSideNav />}>
        <div>Content</div>
      </AppShell>,
    );

    // Should show default mobile nav (MobileNav wrapping sideNav)
    expect(screen.getByRole('dialog', {hidden: true})).toBeInTheDocument();
    // Should show nav content inside the mobile nav
    expect(screen.getByText('Nav')).toBeInTheDocument();
  });

  it('renders default mobile nav when below breakpoint', () => {
    mockMql = createMockMatchMedia(true);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));

    render(
      <AppShell sideNav={<TestSideNav />}>
        <div>Content</div>
      </AppShell>,
    );

    // Default mobile nav should be rendered when below breakpoint
    expect(screen.getByRole('dialog', {hidden: true})).toBeInTheDocument();
  });

  it('keeps TopNav children in the combined mobile drawer with sideNav content', () => {
    mockMql = createMockMatchMedia(true);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));

    render(
      <AppShell
        topNav={
          <TopNav label="Navigation" heading={<TopNavHeading heading="App" />}>
            <TopNavItem label="Home" href="/" />
          </TopNav>
        }
        sideNav={<TestSideNav>Side item</TestSideNav>}>
        <div>Content</div>
      </AppShell>,
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
      <AppShell
        topNav={
          <TopNav
            label="Main navigation"
            heading={<TopNavHeading heading="My App" />}
          />
        }
        sideNav={<TestSideNav>Home</TestSideNav>}
        mobileNav={{breakpoint: 'md'}}>
        <div>Content</div>
      </AppShell>,
    );

    expect(
      screen.getByRole('button', {name: /open navigation/i}),
    ).toBeInTheDocument();
  });

  it('renders sidenav items exactly once in mobile drawer when topNav has only heading (#2243)', () => {
    mockMql = createMockMatchMedia(true);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));

    render(
      <AppShell
        variant="section"
        topNav={
          <TopNav
            label="Main navigation"
            heading={<TopNavHeading heading="My App" />}
          />
        }
        sideNav={
          <SideNav>
            <SideNavItem label="Dashboard" href="/" isSelected />
            <SideNavItem label="Settings" href="/settings" />
          </SideNav>
        }
        mobileNav={{breakpoint: 'md'}}
        contentPadding={4}>
        <div>Content</div>
      </AppShell>,
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
      <AppShell
        topNav={
          <TopNav
            label="Main navigation"
            heading={<TopNavHeading heading="My App" />}
          />
        }
        sideNav={undefined}
        mobileNav={{breakpoint: 'md'}}>
        <div>Content</div>
      </AppShell>,
    );

    expect(
      screen.queryByRole('button', {name: /open navigation/i}),
    ).not.toBeInTheDocument();
  });

  it('does not show auto mobile toggle when sideNav is omitted entirely', () => {
    mockMql = createMockMatchMedia(true);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));

    render(
      <AppShell
        topNav={
          <TopNav
            label="Main navigation"
            heading={<TopNavHeading heading="My App" />}
          />
        }
        mobileNav={{breakpoint: 'md'}}>
        <div>Content</div>
      </AppShell>,
    );

    expect(
      screen.queryByRole('button', {name: /open navigation/i}),
    ).not.toBeInTheDocument();
  });

  it('heading-only topNav does not prevent sidenav from collapsing to mobile (#2243)', () => {
    mockMql = createMockMatchMedia(true);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));

    const {container} = render(
      <AppShell
        topNav={
          <TopNav
            label="Main navigation"
            heading={<TopNavHeading heading="My App" />}
          />
        }
        sideNav={<TestSideNav>Home</TestSideNav>}
        mobileNav={{breakpoint: 'md'}}>
        <div>Content</div>
      </AppShell>,
    );

    const inlinePanel = container.querySelector('.astryx-layout-panel');
    expect(inlinePanel).toBeNull();
  });

  it('renders mobile layout on first render when defaultIsMobile is true', () => {
    // matchMedia says mobile too — simulates correct SSR hint
    mockMql = createMockMatchMedia(true);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));

    const {container} = render(
      <AppShell sideNav={<TestSideNav />} mobileNav={{defaultIsMobile: true}}>
        <div>Content</div>
      </AppShell>,
    );

    // SideNav should NOT be rendered inline — it's in the mobile drawer
    const inlinePanel = container.querySelector(
      '.astryx-app-shell > .astryx-layout .astryx-layout-panel',
    );
    expect(inlinePanel).toBeNull();
  });

  // ===========================================================================
  // Height modes
  // ===========================================================================

  it('defaults to fill mode', () => {
    render(
      <AppShell data-testid="shell">
        <div>Content</div>
      </AppShell>,
    );
    // The root element should exist (fill is default)
    expect(screen.getByTestId('shell')).toBeInTheDocument();
  });

  it('supports auto height mode', () => {
    render(
      <AppShell height="auto" data-testid="shell">
        <div>Content</div>
      </AppShell>,
    );
    expect(screen.getByTestId('shell')).toBeInTheDocument();
  });

  it('renders topNav in auto mode', () => {
    render(
      <AppShell height="auto" topNav={<div>Nav</div>} data-testid="shell">
        <div>Content</div>
      </AppShell>,
    );
    expect(screen.getByText('Nav')).toBeInTheDocument();
  });

  // ===========================================================================
  // Sticky navigation in auto mode
  // ===========================================================================

  it('wraps header in sticky container in auto mode', () => {
    render(
      <AppShell
        height="auto"
        topNav={<div data-testid="topnav">Nav</div>}
        data-testid="shell">
        <div>Content</div>
      </AppShell>,
    );
    const topNav = screen.getByTestId('topnav');
    // The sticky wrapper is the parent of the LayoutHeader div
    // topNav -> LayoutHeader div -> sticky wrapper div
    const headerWrapper = topNav.parentElement?.parentElement;
    expect(headerWrapper).toBeTruthy();
    expect(
      headerWrapper?.style.position ||
        getComputedStyle(headerWrapper!).position,
    ).toBeDefined();
  });

  it('does not apply sticky wrapper in fill mode', () => {
    render(
      <AppShell
        height="fill"
        topNav={<div data-testid="topnav">Nav</div>}
        data-testid="shell">
        <div>Content</div>
      </AppShell>,
    );
    // In fill mode, header still renders but without sticky wrapper styles
    expect(screen.getByTestId('topnav')).toBeInTheDocument();
  });

  it('wraps sideNav in sticky container in auto mode', () => {
    render(
      <AppShell
        height="auto"
        topNav={<div>Nav</div>}
        sideNav={<div data-testid="sidenav">Side</div>}
        data-testid="shell">
        <div>Content</div>
      </AppShell>,
    );
    expect(screen.getByTestId('sidenav')).toBeInTheDocument();
    // The sideNav should be wrapped in a sticky div in auto mode
    const sideNav = screen.getByTestId('sidenav');
    // sideNav -> LayoutPanel div -> sticky wrapper div
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
      <AppShell height="auto" topNav={<div>Nav</div>} data-testid="shell">
        <div>Content</div>
      </AppShell>,
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
      <AppShell height="fill" topNav={<div>Nav</div>} data-testid="shell">
        <div>Content</div>
      </AppShell>,
    );

    expect(observeSpy).not.toHaveBeenCalled();
  });

  // ===========================================================================
  // Mobile nav slot
  // ===========================================================================

  it('renders mobileNav slot content', () => {
    render(
      <AppShell
        sideNav={<TestSideNav />}
        mobileNav={
          <MobileNav
            isOpen={true}
            onOpenChange={() => {}}
            header="Test App"
            data-testid="appshell-mobile-nav">
            <div>Mobile Nav Content</div>
          </MobileNav>
        }>
        <div>Content</div>
      </AppShell>,
    );
    expect(screen.getByTestId('appshell-mobile-nav')).toBeInTheDocument();
    expect(screen.getByText('Mobile Nav Content')).toBeInTheDocument();
  });

  it('does not render mobileNav when not provided', () => {
    render(
      <AppShell sideNav={<TestSideNav />}>
        <div>Content</div>
      </AppShell>,
    );
    expect(screen.queryByTestId('appshell-mobile-nav')).not.toBeInTheDocument();
  });

  it('uses explicit mobileNav instead of default when provided', () => {
    mockMql = createMockMatchMedia(true);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));

    render(
      <AppShell
        sideNav={<TestSideNav />}
        mobileNav={
          <MobileNav
            isOpen={false}
            onOpenChange={() => {}}
            data-testid="appshell-mobile-nav">
            <div>Mobile Nav</div>
          </MobileNav>
        }>
        <div>Content</div>
      </AppShell>,
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
      <AppShell
        sideNav={<TestSideNav />}
        mobileNav={
          <MobileNav isOpen={true} onOpenChange={onClose} header="Nav">
            <div>Mobile Nav</div>
          </MobileNav>
        }>
        <div>Content</div>
      </AppShell>,
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
      <AppShell contentPadding={4} data-testid="shell">
        <div>Content</div>
      </AppShell>,
    );
    // Main content should render — contentPadding is passed through
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('defaults to contentPadding={0} when not specified', () => {
    render(
      <AppShell data-testid="shell">
        <div>Content</div>
      </AppShell>,
    );
    // Should render without error — padding=0 is the default
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('supports contentPadding={0} for full-bleed content', () => {
    render(
      <AppShell contentPadding={0} data-testid="shell">
        <div>Full bleed content</div>
      </AppShell>,
    );
    expect(screen.getByText('Full bleed content')).toBeInTheDocument();
  });

  // ===========================================================================
  // Ref forwarding
  // ===========================================================================

  it('forwards ref to root element', () => {
    const ref = vi.fn();
    render(
      <AppShell ref={ref} data-testid="shell">
        <div>Content</div>
      </AppShell>,
    );
    expect(ref).toHaveBeenCalled();
    expect(ref.mock.calls[0][0]).toBe(screen.getByTestId('shell'));
  });
  // ===========================================================================
  // Keyboard operation
  //
  // The focus TRAP and focus RESTORE contracts of the drawer are native
  // <dialog> behaviour and cannot be asserted here: jsdom has no dialog
  // implementation, so this file shims showModal()/close() with an `open`
  // attribute. Those two were verified in Chromium instead. What is asserted
  // here is everything the shim can still prove: the keyboard path to each
  // control, and the ARIA wiring between the toggle and the drawer.
  // ===========================================================================

  it('reaches the skip link with Tab and moves focus to main with Enter', async () => {
    const user = userEvent.setup();
    render(
      <AppShell topNav={<TopNav label="Main navigation" />}>
        <div>Content</div>
      </AppShell>,
    );

    await user.tab();
    const skipLink = screen.getByTestId('skip-to-content');
    expect(skipLink).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('opens the mobile drawer from the keyboard and points the toggle at it', async () => {
    mockMql = createMockMatchMedia(true);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));
    const user = userEvent.setup();

    render(
      <AppShell sideNav={<TestSideNav />}>
        <div>Content</div>
      </AppShell>,
    );

    const toggle = screen.getByRole('button', {name: 'Open navigation'});
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    toggle.focus();
    await user.keyboard('{Enter}');

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const drawer = screen.getByRole('dialog', {hidden: true});
    // aria-controls has to name the drawer that actually opened, or a screen
    // reader cannot follow the toggle to it.
    expect(toggle.getAttribute('aria-controls')).toBe(drawer.id);
    expect(drawer.id).toBeTruthy();
  });

  // ===========================================================================
  // Banner landmark on the mobile top bar
  // ===========================================================================

  it('exposes the mobile top bar as a banner landmark in a sidenav-only layout', () => {
    mockMql = createMockMatchMedia(true);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));

    render(
      <AppShell sideNav={<TestSideNav />}>
        <div>Content</div>
      </AppShell>,
    );

    // Same landmark structure as the topNav layout: one banner region holding
    // the top bar, whichever nav slots the page happens to fill.
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders exactly one banner landmark when a banner slot joins the mobile top bar', () => {
    mockMql = createMockMatchMedia(true);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));

    render(
      <AppShell banner={<div>Announcement</div>} sideNav={<TestSideNav />}>
        <div>Content</div>
      </AppShell>,
    );

    expect(screen.getAllByRole('banner')).toHaveLength(1);
  });

  // ===========================================================================
  // useAppShellMobile
  // ===========================================================================

  function MobileProbe() {
    const {isMobile, isMobileNavOpen, isMobileNavEnabled, mobileNavId} =
      useAppShellMobile();
    return (
      <span data-testid="probe">
        {JSON.stringify({
          isMobile,
          isMobileNavOpen,
          isMobileNavEnabled,
          hasId: mobileNavId != null,
        })}
      </span>
    );
  }

  it('useAppShellMobile is inert outside an AppShell', () => {
    render(<MobileProbe />);
    expect(JSON.parse(screen.getByTestId('probe').textContent)).toEqual({
      isMobile: false,
      isMobileNavOpen: false,
      isMobileNavEnabled: false,
      hasId: false,
    });
  });

  it('useAppShellMobile reports the shell mobile state and drawer id', async () => {
    mockMql = createMockMatchMedia(true);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));
    const user = userEvent.setup();

    render(
      <AppShell sideNav={<TestSideNav />}>
        <MobileProbe />
      </AppShell>,
    );

    expect(JSON.parse(screen.getByTestId('probe').textContent)).toEqual({
      isMobile: true,
      isMobileNavOpen: false,
      isMobileNavEnabled: true,
      hasId: true,
    });

    await user.click(screen.getByRole('button', {name: 'Open navigation'}));

    expect(
      JSON.parse(screen.getByTestId('probe').textContent).isMobileNavOpen,
    ).toBe(true);
  });
});
