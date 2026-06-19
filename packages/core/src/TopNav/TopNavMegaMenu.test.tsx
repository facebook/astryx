// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TopNavMegaMenu.test.tsx
 * @input Uses vitest, @testing-library/react, TopNavMegaMenu and sub-components
 * @output Unit tests for TopNavMegaMenu slots API and mobile modes
 * @position Testing; validates TopNavMegaMenu behavior
 *
 * SYNC: When TopNavMegaMenu changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {TopNavMegaMenu} from './TopNavMegaMenu';
import {TopNavMegaMenuItem} from './TopNavMegaMenuItem';
import {TopNavRenderContext} from './TopNavRenderContext';

// =============================================================================
// Default (desktop) mode
// =============================================================================

describe('TopNavMegaMenu — default mode', () => {
  it('renders the trigger button with label', () => {
    render(
      <TopNavMegaMenu
        label="Products"
        items={<TopNavMegaMenuItem title="Analytics" href="/analytics" />}
      />,
    );
    expect(screen.getByRole('button', {name: 'Products'})).toBeInTheDocument();
  });

  it('trigger has aria-haspopup and aria-expanded attributes', () => {
    render(
      <TopNavMegaMenu
        label="Products"
        items={<TopNavMegaMenuItem title="Analytics" href="/analytics" />}
      />,
    );
    const trigger = screen.getByRole('button', {name: 'Products'});
    expect(trigger).toHaveAttribute('aria-haspopup', 'true');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders with multiple menu items', () => {
    render(
      <TopNavMegaMenu
        label="Products"
        items={
          <>
            <TopNavMegaMenuItem title="Analytics" href="/analytics" />
            <TopNavMegaMenuItem title="Reports" href="/reports" />
          </>
        }
      />,
    );
    expect(screen.getByRole('button', {name: 'Products'})).toBeInTheDocument();
  });

  it('renders with featured content', () => {
    render(
      <TopNavMegaMenu
        label="Products"
        items={<TopNavMegaMenuItem title="Analytics" href="/analytics" />}
        featured={<span data-testid="featured">Featured content</span>}
      />,
    );
    expect(screen.getByRole('button', {name: 'Products'})).toBeInTheDocument();
  });

  it('renders without items or featured', () => {
    render(<TopNavMegaMenu label="Empty" />);
    expect(screen.getByRole('button', {name: 'Empty'})).toBeInTheDocument();
  });
});

// =============================================================================
// Mobile-bar mode — should be hidden
// =============================================================================

describe('TopNavMegaMenu — mobile-bar mode', () => {
  it('returns null in mobile-bar mode', () => {
    const {container} = render(
      <TopNavRenderContext value="mobile-bar">
        <TopNavMegaMenu
          label="Products"
          items={<TopNavMegaMenuItem title="Analytics" href="/analytics" />}
        />
      </TopNavRenderContext>,
    );
    expect(container.innerHTML).toBe('');
  });
});

// =============================================================================
// Drawer mode — inline collapsible
// =============================================================================

describe('TopNavMegaMenu — drawer mode', () => {
  it('renders a collapsible trigger with label', () => {
    render(
      <TopNavRenderContext value="drawer">
        <TopNavMegaMenu
          label="Products"
          items={<TopNavMegaMenuItem title="Analytics" href="/analytics" />}
        />
      </TopNavRenderContext>,
    );
    const trigger = screen.getByRole('button', {name: 'Products'});
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('expands to show items when tapped', async () => {
    const user = userEvent.setup();

    render(
      <TopNavRenderContext value="drawer">
        <TopNavMegaMenu
          label="Products"
          items={
            <>
              <TopNavMegaMenuItem title="Analytics" href="/analytics" />
              <TopNavMegaMenuItem title="Reports" href="/reports" />
            </>
          }
        />
      </TopNavRenderContext>,
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
      <TopNavRenderContext value="drawer">
        <TopNavMegaMenu
          label="Products"
          items={<TopNavMegaMenuItem title="Analytics" href="/analytics" />}
        />
      </TopNavRenderContext>,
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
      <TopNavRenderContext value="drawer">
        <TopNavMegaMenu
          label="Products"
          items={
            <TopNavMegaMenuItem
              title="Analytics"
              description="Track behavior"
              href="/analytics"
            />
          }
        />
      </TopNavRenderContext>,
    );

    await user.click(screen.getByRole('button', {name: 'Products'}));

    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Track behavior')).toBeInTheDocument();
  });

  it('renders items as links when href is provided', async () => {
    const user = userEvent.setup();

    render(
      <TopNavRenderContext value="drawer">
        <TopNavMegaMenu
          label="Products"
          items={<TopNavMegaMenuItem title="Analytics" href="/analytics" />}
        />
      </TopNavRenderContext>,
    );

    await user.click(screen.getByRole('button', {name: 'Products'}));

    const link = screen.getByRole('link', {name: 'Analytics'});
    expect(link).toHaveAttribute('href', '/analytics');
  });

  it('renders items as buttons when onClick is provided without href', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <TopNavRenderContext value="drawer">
        <TopNavMegaMenu
          label="Tools"
          items={<TopNavMegaMenuItem title="Export" onClick={handleClick} />}
        />
      </TopNavRenderContext>,
    );

    await user.click(screen.getByRole('button', {name: 'Tools'}));
    await user.click(screen.getByRole('button', {name: 'Export'}));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders featured content when expanded', async () => {
    const user = userEvent.setup();

    render(
      <TopNavRenderContext value="drawer">
        <TopNavMegaMenu
          label="Products"
          items={<TopNavMegaMenuItem title="Analytics" href="/analytics" />}
          featured={<span>Featured: New AI Tools</span>}
        />
      </TopNavRenderContext>,
    );

    await user.click(screen.getByRole('button', {name: 'Products'}));

    expect(screen.getByText('Featured: New AI Tools')).toBeInTheDocument();
  });
});

// =============================================================================
// TopNavMegaMenuItem — standalone rendering
// =============================================================================

describe('TopNavMegaMenuItem', () => {
  it('renders as a desktop item by default', () => {
    render(<TopNavMegaMenuItem title="Analytics" href="/analytics" />);
    expect(screen.getByRole('link', {name: /Analytics/})).toBeInTheDocument();
  });

  it('renders description in desktop mode', () => {
    render(
      <TopNavMegaMenuItem
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
      <TopNavRenderContext value="drawer">
        <TopNavMegaMenuItem title="Analytics" href="/analytics" />
      </TopNavRenderContext>,
    );
    expect(screen.getByRole('link', {name: /Analytics/})).toBeInTheDocument();
  });
});
