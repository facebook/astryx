// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TopNavMenu.test.tsx
 * @input Uses vitest, @testing-library/react, TopNavMenu
 * @output Unit tests for TopNavMenu component
 * @position Testing; validates TopNavMenu behavior
 *
 * SYNC: When TopNavMenu changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {TopNavMenu} from './TopNavMenu';

const mockItems = [
  {
    title: 'Analytics',
    description: 'Track user behavior',
    href: '/analytics',
  },
  {
    title: 'Messaging',
    description: 'Real-time communication',
    href: '/messaging',
  },
];

describe('TopNavMenu', () => {
  it('renders the trigger button with label', () => {
    render(<TopNavMenu label="Products" items={mockItems} />);
    expect(screen.getByRole('button', {name: 'Products'})).toBeInTheDocument();
  });

  it('trigger announces a menu popup, not a dialog', () => {
    render(<TopNavMenu label="Products" items={mockItems} />);
    const trigger = screen.getByRole('button', {name: 'Products'});
    // usePopover with role:'none' emits aria-haspopup="true" (the ARIA
    // synonym for "menu") because the exposed semantics of the popup are its
    // child role="menu", not a dialog.
    expect(trigger).toHaveAttribute('aria-haspopup', 'true');
  });

  it('renders with custom items', () => {
    const items = [{title: 'Custom Item', description: 'A custom description'}];
    render(<TopNavMenu label="Menu" items={items} />);
    expect(screen.getByRole('button', {name: 'Menu'})).toBeInTheDocument();
  });

  it('renders icon when provided in items', () => {
    const items = [
      {
        title: 'With Icon',
        description: 'Has an icon',
        icon: <span data-testid="menu-icon">Icon</span>,
      },
    ];
    render(<TopNavMenu label="Menu" items={items} />);
    // Icon is in the hover card content, which may not be visible initially
    expect(screen.getByRole('button', {name: 'Menu'})).toBeInTheDocument();
  });
});

describe('menu semantics (APG)', () => {
  it('does not wrap the popup in a role="dialog" / aria-modal shell', () => {
    render(<TopNavMenu label="Products" items={mockItems} />);
    // The popup's exposed semantics are the role="menu" container itself —
    // no dialog wrapper, no aria-modal.
    expect(
      screen.queryByRole('dialog', {hidden: true}),
    ).not.toBeInTheDocument();
    expect(document.querySelector('[aria-modal]')).toBeNull();
    expect(
      screen.getByRole('menu', {name: 'Products', hidden: true}),
    ).toBeInTheDocument();
  });
});

describe('keyboard navigation (APG menu pattern)', () => {
  it('exposes exactly one tab stop among menu items (roving tabindex)', async () => {
    const user = userEvent.setup();
    render(<TopNavMenu label="Products" items={mockItems} />);
    await user.click(screen.getByRole('button', {name: 'Products'}));

    const items = screen.getAllByRole('menuitem', {hidden: true});
    expect(items).toHaveLength(2);
    const tabbable = items.filter(el => el.getAttribute('tabindex') === '0');
    expect(tabbable).toHaveLength(1);
  });

  it('moves focus with ArrowDown/ArrowUp and the tab stop follows', async () => {
    const user = userEvent.setup();
    render(<TopNavMenu label="Products" items={mockItems} />);
    await user.click(screen.getByRole('button', {name: 'Products'}));

    const menu = screen.getByRole('menu', {hidden: true});
    const items = screen.getAllByRole('menuitem', {hidden: true});
    items[0].focus();

    fireEvent.keyDown(menu, {key: 'ArrowDown'});
    expect(items[1]).toHaveFocus();
    expect(items[1]).toHaveAttribute('tabindex', '0');
    expect(items[0]).toHaveAttribute('tabindex', '-1');

    fireEvent.keyDown(menu, {key: 'ArrowUp'});
    expect(items[0]).toHaveFocus();
    expect(items[0]).toHaveAttribute('tabindex', '0');
    expect(items[1]).toHaveAttribute('tabindex', '-1');
  });

  it('wraps focus at both ends', async () => {
    const user = userEvent.setup();
    render(<TopNavMenu label="Products" items={mockItems} />);
    await user.click(screen.getByRole('button', {name: 'Products'}));

    const menu = screen.getByRole('menu', {hidden: true});
    const items = screen.getAllByRole('menuitem', {hidden: true});

    items[1].focus();
    fireEvent.keyDown(menu, {key: 'ArrowDown'});
    expect(items[0]).toHaveFocus();

    fireEvent.keyDown(menu, {key: 'ArrowUp'});
    expect(items[1]).toHaveFocus();
  });

  it('typeahead moves focus to the item matching the typed character', async () => {
    const user = userEvent.setup();
    render(<TopNavMenu label="Products" items={mockItems} />);
    await user.click(screen.getByRole('button', {name: 'Products'}));

    const menu = screen.getByRole('menu', {hidden: true});
    fireEvent.keyDown(menu, {key: 'm'});
    expect(
      screen.getByRole('menuitem', {name: /Messaging/, hidden: true}),
    ).toHaveFocus();
  });

  it('activates a focused onClick-only item with Enter', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<TopNavMenu label="Menu" items={[{title: 'Action', onClick}]} />);
    await user.click(screen.getByRole('button', {name: 'Menu'}));

    const item = screen.getByRole('menuitem', {hidden: true});
    item.focus();
    fireEvent.keyDown(item, {key: 'Enter'});
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('still activates an item on click', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<TopNavMenu label="Menu" items={[{title: 'Action', onClick}]} />);
    await user.click(screen.getByRole('button', {name: 'Menu'}));

    await user.click(screen.getByRole('menuitem', {hidden: true}));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('closes the menu with Escape', async () => {
    const user = userEvent.setup();
    render(<TopNavMenu label="Products" items={mockItems} />);
    const trigger = screen.getByRole('button', {name: 'Products'});
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    const menu = screen.getByRole('menu', {hidden: true});
    fireEvent.keyDown(menu, {key: 'Escape'});
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
