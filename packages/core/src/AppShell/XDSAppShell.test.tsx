/**
 * @file XDSAppShell.test.tsx
 * @input Uses vitest, @testing-library/react, XDSAppShell component
 * @output Unit tests for XDSAppShell component behavior
 * @position Testing; validates XDSAppShell.tsx implementation
 *
 * SYNC: When XDSAppShell.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen, fireEvent, act} from '@testing-library/react';
import {XDSAppShell} from './XDSAppShell';

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

  it('renders topNav in a header element', () => {
    render(
      <XDSAppShell topNav={<div>Top Nav</div>}>
        <div>Content</div>
      </XDSAppShell>,
    );
    expect(screen.getByText('Top Nav')).toBeInTheDocument();
    // The topNav is wrapped in a <header>
    const header = screen.getByText('Top Nav').closest('header');
    expect(header).toBeInTheDocument();
  });

  it('renders topBanner when provided', () => {
    render(
      <XDSAppShell topBanner={<div>System banner</div>}>
        <div>Content</div>
      </XDSAppShell>,
    );
    expect(screen.getByText('System banner')).toBeInTheDocument();
  });

  it('renders pageNav in a nav element', () => {
    render(
      <XDSAppShell pageNav={<div>Page Nav</div>}>
        <div>Content</div>
      </XDSAppShell>,
    );
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    expect(screen.getByText('Page Nav')).toBeInTheDocument();
  });

  it('renders without optional slots', () => {
    render(
      <XDSAppShell>
        <div>Just content</div>
      </XDSAppShell>,
    );
    expect(screen.getByText('Just content')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
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
  // Sidebar navigation accessibility
  // ===========================================================================

  it('sidebar nav has aria-label', () => {
    render(
      <XDSAppShell pageNav={<div>Nav</div>}>
        <div>Content</div>
      </XDSAppShell>,
    );
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Application navigation');
  });

  // ===========================================================================
  // Sidebar collapse — uncontrolled
  // ===========================================================================

  it('sidebar is visible by default (uncontrolled)', () => {
    render(
      <XDSAppShell pageNav={<div>Nav Items</div>}>
        <div>Content</div>
      </XDSAppShell>,
    );
    expect(screen.getByText('Nav Items')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('sidebar is hidden when initialIsSidebarCollapsed is true', () => {
    render(
      <XDSAppShell
        pageNav={<div>Nav Items</div>}
        initialIsSidebarCollapsed={true}>
        <div>Content</div>
      </XDSAppShell>,
    );
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  // ===========================================================================
  // Sidebar collapse — controlled
  // ===========================================================================

  it('sidebar is hidden when isSidebarCollapsed is true (controlled)', () => {
    render(
      <XDSAppShell
        pageNav={<div>Nav Items</div>}
        isSidebarCollapsed={true}
        onSidebarCollapsedChange={() => {}}>
        <div>Content</div>
      </XDSAppShell>,
    );
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('sidebar is visible when isSidebarCollapsed is false (controlled)', () => {
    render(
      <XDSAppShell
        pageNav={<div>Nav Items</div>}
        isSidebarCollapsed={false}
        onSidebarCollapsedChange={() => {}}>
        <div>Content</div>
      </XDSAppShell>,
    );
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  // ===========================================================================
  // Responsive breakpoint
  // ===========================================================================

  it('auto-collapses sidebar below breakpoint', () => {
    const onChange = vi.fn();
    render(
      <XDSAppShell
        pageNav={<div>Nav</div>}
        sidebarBreakpoint="md"
        onSidebarCollapsedChange={onChange}>
        <div>Content</div>
      </XDSAppShell>,
    );

    // Simulate going below breakpoint
    act(() => {
      mockMql._setMatches(true);
    });

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('does not auto-collapse when sidebarBreakpoint is none', () => {
    const onChange = vi.fn();
    render(
      <XDSAppShell
        pageNav={<div>Nav</div>}
        sidebarBreakpoint="none"
        onSidebarCollapsedChange={onChange}>
        <div>Content</div>
      </XDSAppShell>,
    );

    expect(window.matchMedia).not.toHaveBeenCalled();
  });

  // ===========================================================================
  // Mobile overlay
  // ===========================================================================

  it('shows overlay sidebar when below breakpoint and not collapsed', () => {
    // Start below breakpoint with sidebar expanded
    mockMql = createMockMatchMedia(true);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));

    render(
      <XDSAppShell
        pageNav={<div>Nav Items</div>}
        isSidebarCollapsed={false}
        onSidebarCollapsedChange={() => {}}>
        <div>Content</div>
      </XDSAppShell>,
    );

    // Should show backdrop
    expect(screen.getByTestId('sidebar-backdrop')).toBeInTheDocument();
    // Should show nav in overlay
    expect(screen.getByText('Nav Items')).toBeInTheDocument();
  });

  it('clicking backdrop calls onSidebarCollapsedChange', () => {
    mockMql = createMockMatchMedia(true);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));

    const onChange = vi.fn();
    render(
      <XDSAppShell
        pageNav={<div>Nav</div>}
        isSidebarCollapsed={false}
        onSidebarCollapsedChange={onChange}>
        <div>Content</div>
      </XDSAppShell>,
    );

    fireEvent.click(screen.getByTestId('sidebar-backdrop'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('pressing Escape closes mobile overlay', () => {
    mockMql = createMockMatchMedia(true);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mockMql));

    const onChange = vi.fn();
    render(
      <XDSAppShell
        pageNav={<div>Nav</div>}
        isSidebarCollapsed={false}
        onSidebarCollapsedChange={onChange}>
        <div>Content</div>
      </XDSAppShell>,
    );

    fireEvent.keyDown(document, {key: 'Escape'});
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

  it('renders header as sticky in auto mode', () => {
    render(
      <XDSAppShell height="auto" topNav={<div>Nav</div>} data-testid="shell">
        <div>Content</div>
      </XDSAppShell>,
    );
    const header = screen.getByText('Nav').closest('header');
    expect(header).toBeInTheDocument();
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
