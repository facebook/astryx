/**
 * @file XDSTabList.test.tsx
 * @input Uses vitest, @testing-library/react, TabList components
 * @output Unit tests for XDSTabList, XDSTab, XDSTabMenu behavior
 * @position Testing; validates TabList component implementation
 *
 * SYNC: When TabList components change, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeAll, afterAll} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSTabList} from './XDSTabList';
import {XDSTab} from './XDSTab';
import {XDSTabMenu} from './XDSTabMenu';

// Store original matches to restore later
const originalMatches = HTMLElement.prototype.matches;

// Track popover open state per element
const popoverOpenState = new WeakMap<HTMLElement, boolean>();

// Mock Popover API for jsdom
beforeAll(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, true);
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, false);
  });

  // Only intercept :popover-open, delegate everything else to original
  HTMLElement.prototype.matches = function (selector: string) {
    if (selector === ':popover-open') {
      return popoverOpenState.get(this) ?? false;
    }
    return originalMatches.call(this, selector);
  };
});

afterAll(() => {
  HTMLElement.prototype.matches = originalMatches;
});

describe('XDSTabList', () => {
  it('renders a nav element with tab buttons', () => {
    render(
      <XDSTabList value="home" onChange={() => {}}>
        <XDSTab value="home" label="Home" />
        <XDSTab value="settings" label="Settings" />
      </XDSTabList>,
    );

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Home'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Settings'})).toBeInTheDocument();
  });

  it('marks selected tab with aria-current', () => {
    render(
      <XDSTabList value="home" onChange={() => {}}>
        <XDSTab value="home" label="Home" />
        <XDSTab value="settings" label="Settings" />
      </XDSTabList>,
    );

    expect(screen.getByRole('button', {name: 'Home'})).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('button', {name: 'Settings'})).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('calls onChange when a tab is clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <XDSTabList value="home" onChange={handleChange}>
        <XDSTab value="home" label="Home" />
        <XDSTab value="settings" label="Settings" />
      </XDSTabList>,
    );

    await user.click(screen.getByRole('button', {name: 'Settings'}));
    expect(handleChange).toHaveBeenCalledWith('settings');
  });

  it('updates aria-current when value changes', () => {
    const {rerender} = render(
      <XDSTabList value="home" onChange={() => {}}>
        <XDSTab value="home" label="Home" />
        <XDSTab value="settings" label="Settings" />
      </XDSTabList>,
    );

    expect(screen.getByRole('button', {name: 'Home'})).toHaveAttribute(
      'aria-current',
      'page',
    );

    rerender(
      <XDSTabList value="settings" onChange={() => {}}>
        <XDSTab value="home" label="Home" />
        <XDSTab value="settings" label="Settings" />
      </XDSTabList>,
    );

    expect(screen.getByRole('button', {name: 'Home'})).not.toHaveAttribute(
      'aria-current',
    );
    expect(screen.getByRole('button', {name: 'Settings'})).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('renders with different sizes', () => {
    const {rerender} = render(
      <XDSTabList value="home" onChange={() => {}} size="sm">
        <XDSTab value="home" label="Home" />
      </XDSTabList>,
    );
    expect(screen.getByRole('button', {name: 'Home'})).toBeInTheDocument();

    rerender(
      <XDSTabList value="home" onChange={() => {}} size="lg">
        <XDSTab value="home" label="Home" />
      </XDSTabList>,
    );
    expect(screen.getByRole('button', {name: 'Home'})).toBeInTheDocument();
  });

  it('renders tab with icon', () => {
    render(
      <XDSTabList value="home" onChange={() => {}}>
        <XDSTab
          value="home"
          label="Home"
          icon={<span data-testid="icon">🏠</span>}
        />
      </XDSTabList>,
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders selectedIcon when tab is selected', () => {
    render(
      <XDSTabList value="home" onChange={() => {}}>
        <XDSTab
          value="home"
          label="Home"
          icon={<span data-testid="icon">○</span>}
          selectedIcon={<span data-testid="selected-icon">●</span>}
        />
      </XDSTabList>,
    );

    expect(screen.getByTestId('selected-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
  });

  it('renders regular icon when tab is not selected', () => {
    render(
      <XDSTabList value="other" onChange={() => {}}>
        <XDSTab
          value="home"
          label="Home"
          icon={<span data-testid="icon">○</span>}
          selectedIcon={<span data-testid="selected-icon">●</span>}
        />
      </XDSTabList>,
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.queryByTestId('selected-icon')).not.toBeInTheDocument();
  });
});

describe('XDSTabMenu', () => {
  const menuOptions = [
    {value: 'analytics', label: 'Analytics'},
    {value: 'reports', label: 'Reports'},
  ];

  it('renders a trigger button with aria-haspopup and aria-controls', () => {
    render(
      <XDSTabList value="home" onChange={() => {}}>
        <XDSTab value="home" label="Home" />
        <XDSTabMenu label="More" options={menuOptions} />
      </XDSTabList>,
    );

    const trigger = screen.getByRole('button', {name: /More/});
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // aria-controls points to the menu element
    const menuId = trigger.getAttribute('aria-controls');
    expect(menuId).toBeTruthy();
    const menu = document.getElementById(menuId!);
    expect(menu).toBeInTheDocument();
    expect(menu).toHaveAttribute('role', 'menu');
  });

  it('shows label prop as trigger text when no option is selected', () => {
    render(
      <XDSTabList value="home" onChange={() => {}}>
        <XDSTab value="home" label="Home" />
        <XDSTabMenu label="More" options={menuOptions} />
      </XDSTabList>,
    );

    expect(screen.getByRole('button', {name: /More/})).toBeInTheDocument();
  });

  it('shows selected option label as trigger text when an option is active', () => {
    render(
      <XDSTabList value="analytics" onChange={() => {}}>
        <XDSTab value="home" label="Home" />
        <XDSTabMenu label="More" options={menuOptions} />
      </XDSTabList>,
    );

    const trigger = screen.getByRole('button', {name: /Analytics/});
    expect(trigger).toBeInTheDocument();
  });

  it('opens dropdown on click and shows menu items', async () => {
    const user = userEvent.setup();

    render(
      <XDSTabList value="home" onChange={() => {}}>
        <XDSTab value="home" label="Home" />
        <XDSTabMenu label="More" options={menuOptions} />
      </XDSTabList>,
    );

    await user.click(screen.getByRole('button', {name: /More/}));

    // showPopover should have been called
    expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();

    // Menu items are rendered in DOM (popover controls visibility, hidden from a11y tree)
    expect(
      screen.getByRole('menuitem', {name: 'Analytics', hidden: true}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {name: 'Reports', hidden: true}),
    ).toBeInTheDocument();
  });

  it('renders heading divider with menu label in dropdown', () => {
    render(
      <XDSTabList value="home" onChange={() => {}}>
        <XDSTab value="home" label="Home" />
        <XDSTabMenu label="More" options={menuOptions} />
      </XDSTabList>,
    );

    // The dropdown has role="menu" with aria-label
    const menu = screen.getByRole('menu', {name: 'More', hidden: true});
    expect(menu).toBeInTheDocument();

    // The heading is an XDSDivider with role="separator"
    const separator = screen.getByRole('separator', {hidden: true});
    expect(separator).toBeInTheDocument();
  });

  it('selects a menu item and calls onChange', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <XDSTabList value="home" onChange={handleChange}>
        <XDSTab value="home" label="Home" />
        <XDSTabMenu label="More" options={menuOptions} />
      </XDSTabList>,
    );

    // Click the menu trigger
    await user.click(screen.getByRole('button', {name: /More/}));

    // Click the menu item (popover content, hidden from a11y tree in jsdom)
    const menuItem = screen.getByRole('menuitem', {
      name: 'Analytics',
      hidden: true,
    });
    await user.click(menuItem);
    expect(handleChange).toHaveBeenCalledWith('analytics');
  });

  it('marks menu item as selected with aria-current', () => {
    render(
      <XDSTabList value="analytics" onChange={() => {}}>
        <XDSTab value="home" label="Home" />
        <XDSTabMenu label="More" options={menuOptions} />
      </XDSTabList>,
    );

    // Menu items are in DOM (popover content, hidden from a11y tree in jsdom)
    const analyticsItem = screen.getByRole('menuitem', {
      name: 'Analytics',
      hidden: true,
    });
    expect(analyticsItem).toHaveAttribute('aria-current', 'true');

    const reportsItem = screen.getByRole('menuitem', {
      name: 'Reports',
      hidden: true,
    });
    expect(reportsItem).not.toHaveAttribute('aria-current');
  });
});
