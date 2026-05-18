// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi} from 'vitest';
import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSNavHeadingMenu} from './XDSNavHeadingMenu';
import {XDSNavHeadingMenuItem} from './XDSNavHeadingMenuItem';
import {XDSNavMenuItem} from './XDSNavMenuItem';
import {XDSNavHeadingCloseContext} from './XDSNavMenuContext';

describe('XDSNavHeadingMenu', () => {
  it('renders with role="menu"', () => {
    render(
      <XDSNavHeadingMenu>
        <XDSNavHeadingMenuItem label="Item 1" />
      </XDSNavHeadingMenu>,
    );
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('renders children as menuitems', () => {
    render(
      <XDSNavHeadingMenu>
        <XDSNavHeadingMenuItem label="Dashboard" />
        <XDSNavHeadingMenuItem label="Settings" />
      </XDSNavHeadingMenu>,
    );
    const items = screen.getAllByRole('menuitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Dashboard');
    expect(items[1]).toHaveTextContent('Settings');
  });

  it('applies size class to container', () => {
    const {container} = render(
      <XDSNavHeadingMenu size="lg">
        <XDSNavHeadingMenuItem label="Item" />
      </XDSNavHeadingMenu>,
    );
    const menu = screen.getByRole('menu');
    expect(menu.className).toContain('nav-heading-menu');
  });

  it('applies data-testid', () => {
    render(
      <XDSNavHeadingMenu data-testid="product-menu">
        <XDSNavHeadingMenuItem label="Item" />
      </XDSNavHeadingMenu>,
    );
    expect(screen.getByTestId('product-menu')).toBeInTheDocument();
  });

  it('applies minWidth override via inline style', () => {
    render(
      <XDSNavHeadingMenu minWidth={300}>
        <XDSNavHeadingMenuItem label="Item" />
      </XDSNavHeadingMenu>,
    );
    const menu = screen.getByRole('menu');
    expect(menu.style.minWidth).toBe('300px');
  });
});

describe('XDSNavHeadingMenuItem', () => {
  it('renders with role="menuitem"', () => {
    render(
      <XDSNavHeadingMenu>
        <XDSNavHeadingMenuItem label="Dashboard" />
      </XDSNavHeadingMenu>,
    );
    expect(screen.getByRole('menuitem')).toHaveTextContent('Dashboard');
  });

  it('renders as a link when href is provided', () => {
    render(
      <XDSNavHeadingMenu>
        <XDSNavHeadingMenuItem label="Docs" href="/docs" />
      </XDSNavHeadingMenu>,
    );
    const item = screen.getByRole('menuitem');
    expect(item.tagName).toBe('A');
    expect(item).toHaveAttribute('href', '/docs');
  });

  it('renders as div when no href', () => {
    render(
      <XDSNavHeadingMenu>
        <XDSNavHeadingMenuItem label="Action" onClick={() => {}} />
      </XDSNavHeadingMenu>,
    );
    const item = screen.getByRole('menuitem');
    expect(item.tagName).toBe('DIV');
  });

  it('calls onClick on click', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <XDSNavHeadingMenu>
        <XDSNavHeadingMenuItem label="Action" onClick={onClick} />
      </XDSNavHeadingMenu>,
    );
    await user.click(screen.getByRole('menuitem'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <XDSNavHeadingMenu>
        <XDSNavHeadingMenuItem label="Action" onClick={onClick} isDisabled />
      </XDSNavHeadingMenu>,
    );
    await user.click(screen.getByRole('menuitem'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('sets aria-disabled when disabled', () => {
    render(
      <XDSNavHeadingMenu>
        <XDSNavHeadingMenuItem label="Disabled" isDisabled />
      </XDSNavHeadingMenu>,
    );
    expect(screen.getByRole('menuitem')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('renders description text', () => {
    render(
      <XDSNavHeadingMenu>
        <XDSNavHeadingMenuItem label="Dashboard" description="View metrics" />
      </XDSNavHeadingMenu>,
    );
    expect(screen.getByText('View metrics')).toBeInTheDocument();
  });

  it('applies data-testid', () => {
    render(
      <XDSNavHeadingMenu>
        <XDSNavHeadingMenuItem label="Item" data-testid="menu-item-1" />
      </XDSNavHeadingMenu>,
    );
    expect(screen.getByTestId('menu-item-1')).toBeInTheDocument();
  });
});

describe('keyboard navigation', () => {
  it('moves focus with arrow keys', async () => {
    const user = userEvent.setup();
    render(
      <XDSNavHeadingMenu>
        <XDSNavHeadingMenuItem label="First" />
        <XDSNavHeadingMenuItem label="Second" />
        <XDSNavHeadingMenuItem label="Third" />
      </XDSNavHeadingMenu>,
    );
    const items = screen.getAllByRole('menuitem');
    items[0].focus();
    expect(document.activeElement).toBe(items[0]);

    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(items[1]);

    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(items[2]);

    await user.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(items[1]);
  });

  it('wraps focus at boundaries', async () => {
    const user = userEvent.setup();
    render(
      <XDSNavHeadingMenu>
        <XDSNavHeadingMenuItem label="First" />
        <XDSNavHeadingMenuItem label="Last" />
      </XDSNavHeadingMenu>,
    );
    const items = screen.getAllByRole('menuitem');
    items[1].focus();

    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(items[0]);
  });

  it('Home focuses first item, End focuses last', async () => {
    const user = userEvent.setup();
    render(
      <XDSNavHeadingMenu>
        <XDSNavHeadingMenuItem label="First" />
        <XDSNavHeadingMenuItem label="Middle" />
        <XDSNavHeadingMenuItem label="Last" />
      </XDSNavHeadingMenu>,
    );
    const items = screen.getAllByRole('menuitem');
    items[1].focus();

    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(items[0]);

    await user.keyboard('{End}');
    expect(document.activeElement).toBe(items[2]);
  });
});

describe('context forwarding', () => {
  it('forwards closeMenu from parent NavMenuContext', async () => {
    const user = userEvent.setup();
    const closeMenu = vi.fn();
    render(
      <XDSNavHeadingMenu>
        <XDSNavHeadingMenuItem label="Action" onClick={() => {}} />
      </XDSNavHeadingMenu>,
      {
        wrapper: ({children}) => (
          <XDSNavHeadingCloseContext.Provider value={{closeMenu}}>
            {children}
          </XDSNavHeadingCloseContext.Provider>
        ),
      },
    );
    await user.click(screen.getByRole('menuitem'));
    expect(closeMenu).toHaveBeenCalledOnce();
  });

  it('calls parent closeMenu on Escape', async () => {
    const user = userEvent.setup();
    const closeMenu = vi.fn();
    render(
      <XDSNavHeadingMenu>
        <XDSNavHeadingMenuItem label="First" />
      </XDSNavHeadingMenu>,
      {
        wrapper: ({children}) => (
          <XDSNavHeadingCloseContext.Provider value={{closeMenu}}>
            {children}
          </XDSNavHeadingCloseContext.Provider>
        ),
      },
    );
    screen.getByRole('menuitem').focus();
    await user.keyboard('{Escape}');
    expect(closeMenu).toHaveBeenCalledOnce();
  });
});

describe('XDSNavMenuItem backward compat', () => {
  it('is the same component as XDSNavHeadingMenuItem', () => {
    expect(XDSNavMenuItem).toBe(XDSNavHeadingMenuItem);
  });

  it('renders correctly when used as XDSNavMenuItem', () => {
    render(
      <XDSNavHeadingMenu>
        <XDSNavMenuItem label="Legacy" />
      </XDSNavHeadingMenu>,
    );
    expect(screen.getByRole('menuitem')).toHaveTextContent('Legacy');
  });
});
