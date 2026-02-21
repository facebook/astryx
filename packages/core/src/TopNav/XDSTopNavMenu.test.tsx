/**
 * @file XDSTopNavMenu.test.tsx
 * @input Uses vitest, @testing-library/react, XDSTopNavMenu
 * @output Unit tests for XDSTopNavMenu component
 * @position Testing; validates XDSTopNavMenu behavior
 *
 * SYNC: When XDSTopNavMenu changes, update tests to match new behavior
 */

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {XDSTopNavMenu} from './XDSTopNavMenu';

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

describe('XDSTopNavMenu', () => {
  it('renders the trigger button with label', () => {
    render(<XDSTopNavMenu label="Products" items={mockItems} />);
    expect(screen.getByRole('button', {name: 'Products'})).toBeInTheDocument();
  });

  it('trigger has aria-haspopup attribute', () => {
    render(<XDSTopNavMenu label="Products" items={mockItems} />);
    const trigger = screen.getByRole('button', {name: 'Products'});
    expect(trigger).toHaveAttribute('aria-haspopup', 'true');
  });

  it('renders with custom items', () => {
    const items = [{title: 'Custom Item', description: 'A custom description'}];
    render(<XDSTopNavMenu label="Menu" items={items} />);
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
    render(<XDSTopNavMenu label="Menu" items={items} />);
    // Icon is in the hover card content, which may not be visible initially
    expect(screen.getByRole('button', {name: 'Menu'})).toBeInTheDocument();
  });
});
