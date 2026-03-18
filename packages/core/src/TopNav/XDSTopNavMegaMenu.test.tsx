/**
 * @file XDSTopNavMegaMenu.test.tsx
 * @input Uses vitest, @testing-library/react, XDSTopNavMegaMenu and sub-components
 * @output Unit tests for XDSTopNavMegaMenu slots API and mobile modes
 * @position Testing; validates XDSTopNavMegaMenu behavior
 *
 * SYNC: When XDSTopNavMegaMenu changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSTopNavMegaMenu} from './XDSTopNavMegaMenu';
import {XDSTopNavMegaMenuItem} from './XDSTopNavMegaMenuItem';
import {XDSTopNavRenderContext} from './XDSTopNavRenderContext';

// =============================================================================
// Default (desktop) mode
// =============================================================================

describe('XDSTopNavMegaMenu — default mode', () => {
  it('renders the trigger button with label', () => {
    render(
      <XDSTopNavMegaMenu
        label="Products"
        items={<XDSTopNavMegaMenuItem title="Analytics" href="/analytics" />}
      />,
    );
    expect(screen.getByRole('button', {name: 'Products'})).toBeInTheDocument();
  });

  it('trigger has aria-haspopup and aria-expanded attributes', () => {
    render(
      <XDSTopNavMegaMenu
        label="Products"
        items={<XDSTopNavMegaMenuItem title="Analytics" href="/analytics" />}
      />,
    );
    const trigger = screen.getByRole('button', {name: 'Products'});
    expect(trigger).toHaveAttribute('aria-haspopup', 'true');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders with multiple menu items', () => {
    render(
      <XDSTopNavMegaMenu
        label="Products"
        items={
          <>
            <XDSTopNavMegaMenuItem title="Analytics" href="/analytics" />
            <XDSTopNavMegaMenuItem title="Reports" href="/reports" />
          </>
        }
      />,
    );
    expect(screen.getByRole('button', {name: 'Products'})).toBeInTheDocument();
  });

  it('renders with featured content', () => {
    render(
      <XDSTopNavMegaMenu
        label="Products"
        items={<XDSTopNavMegaMenuItem title="Analytics" href="/analytics" />}
        featured={<span data-testid="featured">Featured content</span>}
      />,
    );
    expect(screen.getByRole('button', {name: 'Products'})).toBeInTheDocument();
  });

  it('renders without items or featured', () => {
    render(<XDSTopNavMegaMenu label="Empty" />);
    expect(screen.getByRole('button', {name: 'Empty'})).toBeInTheDocument();
  });
});

// =============================================================================
// Mobile-bar mode — should be hidden
// =============================================================================

describe('XDSTopNavMegaMenu — mobile-bar mode', () => {
  it('returns null in mobile-bar mode', () => {
    const {container} = render(
      <XDSTopNavRenderContext.Provider value="mobile-bar">
        <XDSTopNavMegaMenu
          label="Products"
          items={<XDSTopNavMegaMenuItem title="Analytics" href="/analytics" />}
        />
      </XDSTopNavRenderContext.Provider>,
    );
    expect(container.innerHTML).toBe('');
  });
});

// =============================================================================
// Drawer mode — inline collapsible
// =============================================================================

describe('XDSTopNavMegaMenu — drawer mode', () => {
  it('renders a collapsible trigger with label', () => {
    render(
      <XDSTopNavRenderContext.Provider value="drawer">
        <XDSTopNavMegaMenu
          label="Products"
          items={<XDSTopNavMegaMenuItem title="Analytics" href="/analytics" />}
        />
      </XDSTopNavRenderContext.Provider>,
    );
    const trigger = screen.getByRole('button', {name: 'Products'});
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('expands to show items when tapped', async () => {
    const user = userEvent.setup();

    render(
      <XDSTopNavRenderContext.Provider value="drawer">
        <XDSTopNavMegaMenu
          label="Products"
          items={
            <>
              <XDSTopNavMegaMenuItem title="Analytics" href="/analytics" />
              <XDSTopNavMegaMenuItem title="Reports" href="/reports" />
            </>
          }
        />
      </XDSTopNavRenderContext.Provider>,
    );

    const trigger = screen.getByRole('button', {name: 'Products'});
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('collapses when trigger is clicked again', async () => {
    const user = userEvent.setup();

    render(
      <XDSTopNavRenderContext.Provider value="drawer">
        <XDSTopNavMegaMenu
          label="Products"
          items={<XDSTopNavMegaMenuItem title="Analytics" href="/analytics" />}
        />
      </XDSTopNavRenderContext.Provider>,
    );

    const trigger = screen.getByRole('button', {name: 'Products'});
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows item descriptions when provided', async () => {
    const user = userEvent.setup();

    render(
      <XDSTopNavRenderContext.Provider value="drawer">
        <XDSTopNavMegaMenu
          label="Products"
          items={
            <XDSTopNavMegaMenuItem
              title="Analytics"
              description="Track behavior"
              href="/analytics"
            />
          }
        />
      </XDSTopNavRenderContext.Provider>,
    );

    await user.click(screen.getByRole('button', {name: 'Products'}));

    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Track behavior')).toBeInTheDocument();
  });

  it('renders items as links when href is provided', async () => {
    const user = userEvent.setup();

    render(
      <XDSTopNavRenderContext.Provider value="drawer">
        <XDSTopNavMegaMenu
          label="Products"
          items={<XDSTopNavMegaMenuItem title="Analytics" href="/analytics" />}
        />
      </XDSTopNavRenderContext.Provider>,
    );

    await user.click(screen.getByRole('button', {name: 'Products'}));

    const link = screen.getByRole('link', {name: 'Analytics'});
    expect(link).toHaveAttribute('href', '/analytics');
  });

  it('renders items as buttons when onClick is provided without href', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <XDSTopNavRenderContext.Provider value="drawer">
        <XDSTopNavMegaMenu
          label="Tools"
          items={<XDSTopNavMegaMenuItem title="Export" onClick={handleClick} />}
        />
      </XDSTopNavRenderContext.Provider>,
    );

    await user.click(screen.getByRole('button', {name: 'Tools'}));
    await user.click(screen.getByRole('button', {name: 'Export'}));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders featured content when expanded', async () => {
    const user = userEvent.setup();

    render(
      <XDSTopNavRenderContext.Provider value="drawer">
        <XDSTopNavMegaMenu
          label="Products"
          items={<XDSTopNavMegaMenuItem title="Analytics" href="/analytics" />}
          featured={<span>Featured: New AI Tools</span>}
        />
      </XDSTopNavRenderContext.Provider>,
    );

    await user.click(screen.getByRole('button', {name: 'Products'}));

    expect(screen.getByText('Featured: New AI Tools')).toBeInTheDocument();
  });
});

// =============================================================================
// XDSTopNavMegaMenuItem — standalone rendering
// =============================================================================

describe('XDSTopNavMegaMenuItem', () => {
  it('renders as a desktop item by default', () => {
    render(<XDSTopNavMegaMenuItem title="Analytics" href="/analytics" />);
    expect(screen.getByRole('link', {name: /Analytics/})).toBeInTheDocument();
  });

  it('renders description in desktop mode', () => {
    render(
      <XDSTopNavMegaMenuItem
        title="Analytics"
        description="Track behavior"
        href="/analytics"
      />,
    );
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Track behavior')).toBeInTheDocument();
  });

  it('renders as a drawer item in drawer context', () => {
    render(
      <XDSTopNavRenderContext.Provider value="drawer">
        <XDSTopNavMegaMenuItem title="Analytics" href="/analytics" />
      </XDSTopNavRenderContext.Provider>,
    );
    expect(screen.getByRole('link', {name: /Analytics/})).toBeInTheDocument();
  });
});
