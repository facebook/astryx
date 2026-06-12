// Copyright (c) Meta Platforms, Inc. and affiliates.

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
import {XDSLinkProvider} from '../Link/XDSLinkProvider';

function CustomLink({
  children,
  ref,
  ...props
}: React.ComponentPropsWithRef<'a'>) {
  return (
    <a ref={ref} data-custom-link {...props}>
      {children}
    </a>
  );
}

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).matches = function (
    selector: string,
  ): boolean {
    if (selector === ':popover-open') {
      return popoverOpenState.get(this) ?? false;
    }
    return originalMatches.call(this, selector);
  };
});

afterAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).matches = originalMatches;
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

  it('renders icon-only tab with aria-label from label prop', () => {
    render(
      <XDSTabList value="preview" onChange={() => {}}>
        <XDSTab
          value="preview"
          label="Preview"
          isLabelHidden
          icon={<span data-testid="icon">▣</span>}
        />
      </XDSTabList>,
    );

    const tab = screen.getByRole('button', {name: 'Preview'});
    expect(tab).toHaveAttribute('aria-label', 'Preview');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.queryByText('Preview')).not.toBeInTheDocument();
  });

  it('omits empty label nodes so aria-labeled icon tabs align to the icon', () => {
    render(
      <XDSTabList value="preview" onChange={() => {}}>
        <XDSTab
          value="preview"
          label=""
          aria-label="Preview"
          icon={<span data-testid="icon">▣</span>}
        />
      </XDSTabList>,
    );

    const tab = screen.getByRole('button', {name: 'Preview'});
    expect(tab).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(tab.querySelectorAll(':scope > span').length).toBe(3);
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

  it('renders endContent after the label', () => {
    render(
      <XDSTabList value="home" onChange={() => {}}>
        <XDSTab
          value="home"
          label="Home"
          endContent={<span data-testid="badge">5</span>}
        />
      </XDSTabList>,
    );

    expect(screen.getByTestId('badge')).toBeInTheDocument();
    expect(screen.getByTestId('badge').textContent).toBe('5');
  });

  it('does not render endContent wrapper when endContent is not provided', () => {
    render(
      <XDSTabList value="home" onChange={() => {}}>
        <XDSTab value="home" label="Home" />
      </XDSTabList>,
    );

    // The endContentWrapper span should not exist
    const button = screen.getByRole('button', {name: 'Home'});
    // Button children: hoverBg, labelContainer, indicator (no endContent wrapper)
    const spans = button.querySelectorAll(':scope > span');
    // hoverBg + labelContainer + indicator = 3 spans
    expect(spans.length).toBe(3);
  });

  it('renders endContent in link tabs', () => {
    render(
      <XDSTabList value="home" onChange={() => {}}>
        <XDSTab
          value="home"
          label="Home"
          href="/home"
          endContent={<span data-testid="dot">●</span>}
        />
      </XDSTabList>,
    );

    expect(screen.getByTestId('dot')).toBeInTheDocument();
  });
});

describe('XDSTab polymorphic link', () => {
  it('renders custom component when href and as are provided', () => {
    render(
      <XDSTabList value="home" onChange={() => {}}>
        <XDSTab value="home" label="Home" href="/home" as={CustomLink} />
      </XDSTabList>,
    );
    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).toHaveAttribute('href', '/home');
  });

  it('still renders button without href even with as prop', () => {
    render(
      <XDSTabList value="home" onChange={() => {}}>
        <XDSTab value="home" label="Home" as={CustomLink} />
      </XDSTabList>,
    );
    const button = screen.getByRole('button', {name: 'Home'});
    expect(button).toBeInTheDocument();
    expect(button).not.toHaveAttribute('data-custom-link');
  });

  it('renders custom component from XDSLinkProvider when href is provided', () => {
    render(
      <XDSLinkProvider component={CustomLink}>
        <XDSTabList value="home" onChange={() => {}}>
          <XDSTab value="home" label="Home" href="/home" />
        </XDSTabList>
      </XDSLinkProvider>,
    );
    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toHaveAttribute('data-custom-link');
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

  it('renders heading with menu label in dropdown', () => {
    render(
      <XDSTabList value="home" onChange={() => {}}>
        <XDSTab value="home" label="Home" />
        <XDSTabMenu label="More" options={menuOptions} />
      </XDSTabList>,
    );

    // The dropdown has role="menu" with aria-label
    const menu = screen.getByRole('menu', {name: 'More', hidden: true});
    expect(menu).toBeInTheDocument();

    // The heading is a presentation span with the menu label
    const heading = screen.getByRole('presentation', {hidden: true});
    expect(heading).toHaveTextContent('More');
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
