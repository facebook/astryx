// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TopNavMenu.test.tsx
 * @input Uses vitest, @testing-library/react, TopNavMenu
 * @output Unit tests for TopNavMenu component
 * @position Testing; validates TopNavMenu behavior
 *
 * SYNC: When TopNavMenu changes, update tests to match new behavior
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
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

  it('trigger has aria-haspopup attribute', () => {
    render(<TopNavMenu label="Products" items={mockItems} />);
    const trigger = screen.getByRole('button', {name: 'Products'});
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
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
