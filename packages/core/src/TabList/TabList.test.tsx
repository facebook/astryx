// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TabList.test.tsx
 * @input Uses vitest, @testing-library/react, TabList components
 * @output Unit tests for TabList, Tab, TabMenu behavior
 * @position Testing; validates TabList component implementation
 *
 * SYNC: When TabList components change, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeAll, afterAll} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {TabList} from './TabList';
import {Tab} from './Tab';
import {TabMenu} from './TabMenu';
import {LinkProvider} from '../Link/LinkProvider';

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

describe('TabList', () => {
  it('renders a nav element with tab buttons', () => {
    render(
      <TabList value="home" onChange={() => {}}>
        <Tab value="home" label="Home" />
        <Tab value="settings" label="Settings" />
      </TabList>,
    );

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Home'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Settings'})).toBeInTheDocument();
  });

  it('does not set aria-orientation on the nav (invalid for role navigation)', () => {
    // Regression: aria-orientation is not an allowed attribute on the
    // navigation role and produces an axe aria-allowed-attr violation. The
    // `orientation` prop must drive keyboard/hint behavior without emitting
    // this attribute, regardless of the value passed.
    const {rerender} = render(
      <TabList value="home" onChange={() => {}}>
        <Tab value="home" label="Home" />
        <Tab value="settings" label="Settings" />
      </TabList>,
    );

    expect(screen.getByRole('navigation')).not.toHaveAttribute(
      'aria-orientation',
    );

    rerender(
      <TabList value="home" onChange={() => {}} orientation="vertical">
        <Tab value="home" label="Home" />
        <Tab value="settings" label="Settings" />
      </TabList>,
    );

    expect(screen.getByRole('navigation')).not.toHaveAttribute(
      'aria-orientation',
    );
  });

  it('ignores a consumer-supplied aria-orientation on the nav', () => {
    // A caller passing aria-orientation should not reintroduce the invalid
    // attribute onto the nav.
    render(
      <TabList value="home" onChange={() => {}} aria-orientation="vertical">
        <Tab value="home" label="Home" />
        <Tab value="settings" label="Settings" />
      </TabList>,
    );

    expect(screen.getByRole('navigation')).not.toHaveAttribute(
      'aria-orientation',
    );
  });

  it('marks selected tab with aria-current', () => {
    render(
      <TabList value="home" onChange={() => {}}>
        <Tab value="home" label="Home" />
        <Tab value="settings" label="Settings" />
      </TabList>,
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
      <TabList value="home" onChange={handleChange}>
        <Tab value="home" label="Home" />
        <Tab value="settings" label="Settings" />
      </TabList>,
    );

    await user.click(screen.getByRole('button', {name: 'Settings'}));
    expect(handleChange).toHaveBeenCalledWith('settings');
  });

  it('updates aria-current when value changes', () => {
    const {rerender} = render(
      <TabList value="home" onChange={() => {}}>
        <Tab value="home" label="Home" />
        <Tab value="settings" label="Settings" />
      </TabList>,
    );

    expect(screen.getByRole('button', {name: 'Home'})).toHaveAttribute(
      'aria-current',
      'page',
    );

    rerender(
      <TabList value="settings" onChange={() => {}}>
        <Tab value="home" label="Home" />
        <Tab value="settings" label="Settings" />
      </TabList>,
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
      <TabList value="home" onChange={() => {}} size="sm">
        <Tab value="home" label="Home" />
      </TabList>,
    );
    expect(screen.getByRole('button', {name: 'Home'})).toBeInTheDocument();

    rerender(
      <TabList value="home" onChange={() => {}} size="lg">
        <Tab value="home" label="Home" />
      </TabList>,
    );
    expect(screen.getByRole('button', {name: 'Home'})).toBeInTheDocument();
  });

  it('renders tab with icon', () => {
    render(
      <TabList value="home" onChange={() => {}}>
        <Tab
          value="home"
          label="Home"
          icon={<span data-testid="icon">🏠</span>}
        />
      </TabList>,
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders icon-only tab with aria-label from label prop', () => {
    render(
      <TabList value="preview" onChange={() => {}}>
        <Tab
          value="preview"
          label="Preview"
          isLabelHidden
          icon={<span data-testid="icon">▣</span>}
        />
      </TabList>,
    );

    const tab = screen.getByRole('button', {name: 'Preview'});
    expect(tab).toHaveAttribute('aria-label', 'Preview');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.queryByText('Preview')).not.toBeInTheDocument();
  });

  it('omits empty label nodes so aria-labeled icon tabs align to the icon', () => {
    render(
      <TabList value="preview" onChange={() => {}}>
        <Tab
          value="preview"
          label=""
          aria-label="Preview"
          icon={<span data-testid="icon">▣</span>}
        />
      </TabList>,
    );

    const tab = screen.getByRole('button', {name: 'Preview'});
    expect(tab).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(tab.querySelectorAll(':scope > span').length).toBe(3);
  });

  it('renders selectedIcon when tab is selected', () => {
    render(
      <TabList value="home" onChange={() => {}}>
        <Tab
          value="home"
          label="Home"
          icon={<span data-testid="icon">○</span>}
          selectedIcon={<span data-testid="selected-icon">●</span>}
        />
      </TabList>,
    );

    expect(screen.getByTestId('selected-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
  });

  it('renders regular icon when tab is not selected', () => {
    render(
      <TabList value="other" onChange={() => {}}>
        <Tab
          value="home"
          label="Home"
          icon={<span data-testid="icon">○</span>}
          selectedIcon={<span data-testid="selected-icon">●</span>}
        />
      </TabList>,
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.queryByTestId('selected-icon')).not.toBeInTheDocument();
  });

  it('renders endContent after the label', () => {
    render(
      <TabList value="home" onChange={() => {}}>
        <Tab
          value="home"
          label="Home"
          endContent={<span data-testid="badge">5</span>}
        />
      </TabList>,
    );

    expect(screen.getByTestId('badge')).toBeInTheDocument();
    expect(screen.getByTestId('badge').textContent).toBe('5');
  });

  it('does not render endContent wrapper when endContent is not provided', () => {
    render(
      <TabList value="home" onChange={() => {}}>
        <Tab value="home" label="Home" />
      </TabList>,
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
      <TabList value="home" onChange={() => {}}>
        <Tab
          value="home"
          label="Home"
          href="/home"
          endContent={<span data-testid="dot">●</span>}
        />
      </TabList>,
    );

    expect(screen.getByTestId('dot')).toBeInTheDocument();
  });
});

describe('TabList keyboard navigation (roving tabindex)', () => {
  it('exposes the tab strip as a single Tab stop (only selected tab is tabbable)', () => {
    render(
      <TabList value="settings" onChange={() => {}}>
        <Tab value="home" label="Home" />
        <Tab value="settings" label="Settings" />
        <Tab value="profile" label="Profile" />
      </TabList>,
    );

    expect(screen.getByRole('button', {name: 'Home'})).toHaveAttribute(
      'tabindex',
      '-1',
    );
    expect(screen.getByRole('button', {name: 'Settings'})).toHaveAttribute(
      'tabindex',
      '0',
    );
    expect(screen.getByRole('button', {name: 'Profile'})).toHaveAttribute(
      'tabindex',
      '-1',
    );
  });

  it('makes the first tab tabbable when the selected value matches no tab', () => {
    render(
      <TabList value="__none__" onChange={() => {}}>
        <Tab value="home" label="Home" />
        <Tab value="settings" label="Settings" />
      </TabList>,
    );

    expect(screen.getByRole('button', {name: 'Home'})).toHaveAttribute(
      'tabindex',
      '0',
    );
    expect(screen.getByRole('button', {name: 'Settings'})).toHaveAttribute(
      'tabindex',
      '-1',
    );
  });

  it('moves focus with ArrowRight and ArrowLeft', async () => {
    const user = userEvent.setup();
    render(
      <TabList value="home" onChange={() => {}}>
        <Tab value="home" label="Home" />
        <Tab value="settings" label="Settings" />
        <Tab value="profile" label="Profile" />
      </TabList>,
    );

    const home = screen.getByRole('button', {name: 'Home'});
    const settings = screen.getByRole('button', {name: 'Settings'});
    const profile = screen.getByRole('button', {name: 'Profile'});

    home.focus();
    expect(home).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(settings).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(profile).toHaveFocus();

    await user.keyboard('{ArrowLeft}');
    expect(settings).toHaveFocus();
  });

  it('supports ArrowDown and ArrowUp as forward/backward as well', async () => {
    const user = userEvent.setup();
    render(
      <TabList value="home" onChange={() => {}}>
        <Tab value="home" label="Home" />
        <Tab value="settings" label="Settings" />
      </TabList>,
    );

    const home = screen.getByRole('button', {name: 'Home'});
    const settings = screen.getByRole('button', {name: 'Settings'});

    home.focus();
    await user.keyboard('{ArrowDown}');
    expect(settings).toHaveFocus();

    await user.keyboard('{ArrowUp}');
    expect(home).toHaveFocus();
  });

  it('jumps to first and last tab with Home and End', async () => {
    const user = userEvent.setup();
    render(
      <TabList value="settings" onChange={() => {}}>
        <Tab value="home" label="Home" />
        <Tab value="settings" label="Settings" />
        <Tab value="profile" label="Profile" />
      </TabList>,
    );

    const home = screen.getByRole('button', {name: 'Home'});
    const settings = screen.getByRole('button', {name: 'Settings'});
    const profile = screen.getByRole('button', {name: 'Profile'});

    settings.focus();

    await user.keyboard('{End}');
    expect(profile).toHaveFocus();

    await user.keyboard('{Home}');
    expect(home).toHaveFocus();
  });

  it('wraps around at the ends', async () => {
    const user = userEvent.setup();
    render(
      <TabList value="home" onChange={() => {}}>
        <Tab value="home" label="Home" />
        <Tab value="settings" label="Settings" />
        <Tab value="profile" label="Profile" />
      </TabList>,
    );

    const home = screen.getByRole('button', {name: 'Home'});
    const profile = screen.getByRole('button', {name: 'Profile'});

    home.focus();
    await user.keyboard('{ArrowLeft}');
    expect(profile).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(home).toHaveFocus();
  });

  it('skips disabled tabs during arrow navigation', async () => {
    const user = userEvent.setup();
    render(
      <TabList value="home" onChange={() => {}}>
        <Tab value="home" label="Home" />
        <Tab value="settings" label="Settings" aria-disabled="true" />
        <Tab value="profile" label="Profile" />
      </TabList>,
    );

    const home = screen.getByRole('button', {name: 'Home'});
    const profile = screen.getByRole('button', {name: 'Profile'});

    home.focus();
    await user.keyboard('{ArrowRight}');
    expect(profile).toHaveFocus();
  });

  it('does not intercept unrelated keys', async () => {
    const user = userEvent.setup();
    render(
      <TabList value="home" onChange={() => {}}>
        <Tab value="home" label="Home" />
        <Tab value="settings" label="Settings" />
      </TabList>,
    );

    const home = screen.getByRole('button', {name: 'Home'});
    home.focus();
    await user.keyboard('a');
    expect(home).toHaveFocus();
  });

  it('composes consumer onKeyDown with internal arrow navigation', async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();

    render(
      <TabList value="home" onChange={() => {}} onKeyDown={onKeyDown}>
        <Tab value="home" label="Home" />
        <Tab value="settings" label="Settings" />
      </TabList>,
    );

    const home = screen.getByRole('button', {name: 'Home'});
    const settings = screen.getByRole('button', {name: 'Settings'});

    home.focus();
    await user.keyboard('{ArrowRight}');

    expect(onKeyDown).toHaveBeenCalled();
    expect(settings).toHaveFocus();
  });

  it('respects preventDefault from consumer onKeyDown', async () => {
    const user = userEvent.setup();

    render(
      <TabList
        value="home"
        onChange={() => {}}
        onKeyDown={e => e.preventDefault()}>
        <Tab value="home" label="Home" />
        <Tab value="settings" label="Settings" />
      </TabList>,
    );

    const home = screen.getByRole('button', {name: 'Home'});
    home.focus();
    await user.keyboard('{ArrowRight}');

    expect(home).toHaveFocus();
  });
});

describe('Tab polymorphic link', () => {
  it('renders custom component when href and as are provided', () => {
    render(
      <TabList value="home" onChange={() => {}}>
        <Tab value="home" label="Home" href="/home" as={CustomLink} />
      </TabList>,
    );
    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).toHaveAttribute('href', '/home');
  });

  it('still renders button without href even with as prop', () => {
    render(
      <TabList value="home" onChange={() => {}}>
        <Tab value="home" label="Home" as={CustomLink} />
      </TabList>,
    );
    const button = screen.getByRole('button', {name: 'Home'});
    expect(button).toBeInTheDocument();
    expect(button).not.toHaveAttribute('data-custom-link');
  });

  it('renders custom component from LinkProvider when href is provided', () => {
    render(
      <LinkProvider component={CustomLink}>
        <TabList value="home" onChange={() => {}}>
          <Tab value="home" label="Home" href="/home" />
        </TabList>
      </LinkProvider>,
    );
    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toHaveAttribute('data-custom-link');
  });
});

describe('TabMenu', () => {
  const menuOptions = [
    {value: 'analytics', label: 'Analytics'},
    {value: 'reports', label: 'Reports'},
  ];

  it('renders a trigger button with aria-haspopup and aria-controls', () => {
    render(
      <TabList value="home" onChange={() => {}}>
        <Tab value="home" label="Home" />
        <TabMenu label="More" options={menuOptions} />
      </TabList>,
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
      <TabList value="home" onChange={() => {}}>
        <Tab value="home" label="Home" />
        <TabMenu label="More" options={menuOptions} />
      </TabList>,
    );

    expect(screen.getByRole('button', {name: /More/})).toBeInTheDocument();
  });

  it('shows selected option label as trigger text when an option is active', () => {
    render(
      <TabList value="analytics" onChange={() => {}}>
        <Tab value="home" label="Home" />
        <TabMenu label="More" options={menuOptions} />
      </TabList>,
    );

    const trigger = screen.getByRole('button', {name: /Analytics/});
    expect(trigger).toBeInTheDocument();
  });

  it('opens dropdown on click and shows menu items', async () => {
    const user = userEvent.setup();

    render(
      <TabList value="home" onChange={() => {}}>
        <Tab value="home" label="Home" />
        <TabMenu label="More" options={menuOptions} />
      </TabList>,
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
      <TabList value="home" onChange={() => {}}>
        <Tab value="home" label="Home" />
        <TabMenu label="More" options={menuOptions} />
      </TabList>,
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
      <TabList value="home" onChange={handleChange}>
        <Tab value="home" label="Home" />
        <TabMenu label="More" options={menuOptions} />
      </TabList>,
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
      <TabList value="analytics" onChange={() => {}}>
        <Tab value="home" label="Home" />
        <TabMenu label="More" options={menuOptions} />
      </TabList>,
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
