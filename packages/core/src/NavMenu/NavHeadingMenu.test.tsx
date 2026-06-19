// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {NavHeadingMenu} from './NavHeadingMenu';
import {NavHeadingMenuItem} from './NavHeadingMenuItem';
import {NavMenuItem} from './NavMenuItem';
import {NavHeadingCloseContext} from './NavMenuContext';

describe('NavHeadingMenu', () => {
  it('renders with role="menu"', () => {
    render(
      <NavHeadingMenu>
        <NavHeadingMenuItem label="Item 1" />
      </NavHeadingMenu>,
    );
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('renders children as menuitems', () => {
    render(
      <NavHeadingMenu>
        <NavHeadingMenuItem label="Dashboard" />
        <NavHeadingMenuItem label="Settings" />
      </NavHeadingMenu>,
    );
    const items = screen.getAllByRole('menuitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Dashboard');
    expect(items[1]).toHaveTextContent('Settings');
  });

  it('applies size class to container', () => {
    render(
      <NavHeadingMenu size="lg">
        <NavHeadingMenuItem label="Item" />
      </NavHeadingMenu>,
    );
    const menu = screen.getByRole('menu');
    expect(menu.className).toContain('nav-heading-menu');
  });

  it('applies data-testid', () => {
    render(
      <NavHeadingMenu data-testid="product-menu">
        <NavHeadingMenuItem label="Item" />
      </NavHeadingMenu>,
    );
    expect(screen.getByTestId('product-menu')).toBeInTheDocument();
  });

  it('applies minWidth override via inline style', () => {
    render(
      <NavHeadingMenu minWidth={300}>
        <NavHeadingMenuItem label="Item" />
      </NavHeadingMenu>,
    );
    const menu = screen.getByRole('menu');
    expect(menu.style.minWidth).toBe('300px');
  });
});

describe('NavHeadingMenuItem', () => {
  it('renders with role="menuitem"', () => {
    render(
      <NavHeadingMenu>
        <NavHeadingMenuItem label="Dashboard" />
      </NavHeadingMenu>,
    );
    expect(screen.getByRole('menuitem')).toHaveTextContent('Dashboard');
  });

  it('renders as a link when href is provided', () => {
    render(
      <NavHeadingMenu>
        <NavHeadingMenuItem label="Docs" href="/docs" />
      </NavHeadingMenu>,
    );
    const item = screen.getByRole('menuitem');
    expect(item.tagName).toBe('A');
    expect(item).toHaveAttribute('href', '/docs');
  });

  it('renders as div when no href', () => {
    render(
      <NavHeadingMenu>
        <NavHeadingMenuItem label="Action" onClick={() => {}} />
      </NavHeadingMenu>,
    );
    const item = screen.getByRole('menuitem');
    expect(item.tagName).toBe('DIV');
  });

  it('calls onClick on click', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <NavHeadingMenu>
        <NavHeadingMenuItem label="Action" onClick={onClick} />
      </NavHeadingMenu>,
    );
    await user.click(screen.getByRole('menuitem'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <NavHeadingMenu>
        <NavHeadingMenuItem label="Action" onClick={onClick} isDisabled />
      </NavHeadingMenu>,
    );
    await user.click(screen.getByRole('menuitem'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('sets aria-disabled when disabled', () => {
    render(
      <NavHeadingMenu>
        <NavHeadingMenuItem label="Disabled" isDisabled />
      </NavHeadingMenu>,
    );
    expect(screen.getByRole('menuitem')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('renders description text', () => {
    render(
      <NavHeadingMenu>
        <NavHeadingMenuItem label="Dashboard" description="View metrics" />
      </NavHeadingMenu>,
    );
    expect(screen.getByText('View metrics')).toBeInTheDocument();
  });

  it('applies data-testid', () => {
    render(
      <NavHeadingMenu>
        <NavHeadingMenuItem label="Item" data-testid="menu-item-1" />
      </NavHeadingMenu>,
    );
    expect(screen.getByTestId('menu-item-1')).toBeInTheDocument();
  });
});

describe('keyboard navigation', () => {
  it('moves focus with arrow keys', async () => {
    const user = userEvent.setup();
    render(
      <NavHeadingMenu>
        <NavHeadingMenuItem label="First" />
        <NavHeadingMenuItem label="Second" />
        <NavHeadingMenuItem label="Third" />
      </NavHeadingMenu>,
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
      <NavHeadingMenu>
        <NavHeadingMenuItem label="First" />
        <NavHeadingMenuItem label="Last" />
      </NavHeadingMenu>,
    );
    const items = screen.getAllByRole('menuitem');
    items[1].focus();

    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(items[0]);
  });

  it('Home focuses first item, End focuses last', async () => {
    const user = userEvent.setup();
    render(
      <NavHeadingMenu>
        <NavHeadingMenuItem label="First" />
        <NavHeadingMenuItem label="Middle" />
        <NavHeadingMenuItem label="Last" />
      </NavHeadingMenu>,
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
      <NavHeadingMenu>
        <NavHeadingMenuItem label="Action" onClick={() => {}} />
      </NavHeadingMenu>,
      {
        wrapper: ({children}) => (
          <NavHeadingCloseContext value={{closeMenu}}>
            {children}
          </NavHeadingCloseContext>
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
      <NavHeadingMenu>
        <NavHeadingMenuItem label="First" />
      </NavHeadingMenu>,
      {
        wrapper: ({children}) => (
          <NavHeadingCloseContext value={{closeMenu}}>
            {children}
          </NavHeadingCloseContext>
        ),
      },
    );
    screen.getByRole('menuitem').focus();
    await user.keyboard('{Escape}');
    expect(closeMenu).toHaveBeenCalledOnce();
  });
});

describe('NavMenuItem backward compat', () => {
  it('is the same component as NavHeadingMenuItem', () => {
    expect(NavMenuItem).toBe(NavHeadingMenuItem);
  });

  it('renders correctly when used as NavMenuItem', () => {
    render(
      <NavHeadingMenu>
        <NavMenuItem label="Legacy" />
      </NavHeadingMenu>,
    );
    expect(screen.getByRole('menuitem')).toHaveTextContent('Legacy');
  });
});
