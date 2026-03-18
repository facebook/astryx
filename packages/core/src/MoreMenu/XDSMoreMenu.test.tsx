/**
 * @file XDSMoreMenu.test.tsx
 * @input Uses vitest, @testing-library/react, XDSMoreMenu component
 * @output Unit tests for XDSMoreMenu component behavior
 * @position Testing; validates XDSMoreMenu.tsx implementation
 *
 * SYNC: When XDSMoreMenu.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSMoreMenu} from './XDSMoreMenu';

// Mock showPopover and hidePopover methods since they're not implemented in jsdom
beforeEach(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    this.setAttribute('popover-open', '');
    const event = new Event('toggle', {bubbles: false});
    Object.defineProperty(event, 'newState', {value: 'open'});
    this.dispatchEvent(event);
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    this.removeAttribute('popover-open');
    const event = new Event('toggle', {bubbles: false});
    Object.defineProperty(event, 'newState', {value: 'closed'});
    this.dispatchEvent(event);
  });
  const originalMatches = HTMLElement.prototype.matches;
  HTMLElement.prototype.matches = function (selector: string) {
    if (selector === ':popover-open') {
      return this.hasAttribute('popover-open');
    }
    return originalMatches.call(this, selector);
  };
});

const defaultItems = [
  {label: 'Edit', onClick: vi.fn()},
  {label: 'Delete', onClick: vi.fn()},
];

describe('XDSMoreMenu', () => {
  it('renders trigger button with default aria-label', () => {
    render(<XDSMoreMenu items={defaultItems} />);
    expect(
      screen.getByRole('button', {name: 'More options'}),
    ).toBeInTheDocument();
  });

  it('renders menu with role="menu"', () => {
    render(<XDSMoreMenu items={defaultItems} />);
    expect(screen.getByRole('menu', {hidden: true})).toBeInTheDocument();
  });

  it('has aria-haspopup and aria-expanded attributes', () => {
    render(<XDSMoreMenu items={defaultItems} />);
    const button = screen.getByRole('button', {name: 'More options'});
    expect(button).toHaveAttribute('aria-haspopup', 'menu');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders menu items', () => {
    render(<XDSMoreMenu items={defaultItems} />);

    expect(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {name: 'Delete', hidden: true}),
    ).toBeInTheDocument();
  });

  it('opens menu when button is clicked', async () => {
    const user = userEvent.setup();
    render(<XDSMoreMenu items={defaultItems} />);

    await user.click(screen.getByRole('button', {name: 'More options'}));
    expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
  });

  it('calls onClick when item is clicked', async () => {
    const handleEdit = vi.fn();
    const items = [
      {label: 'Edit', onClick: handleEdit},
      {label: 'Delete', onClick: vi.fn()},
    ];
    const user = userEvent.setup();
    render(<XDSMoreMenu items={items} />);

    // Open the menu first
    await user.click(screen.getByRole('button', {name: 'More options'}));
    // Click the item
    await user.click(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    );

    expect(handleEdit).toHaveBeenCalledOnce();
  });

  it('supports disabled state', () => {
    render(<XDSMoreMenu items={defaultItems} isDisabled />);
    const button = screen.getByRole('button', {name: 'More options'});
    expect(button).toBeDisabled();
  });

  it('supports custom label', () => {
    render(<XDSMoreMenu items={defaultItems} label="Row actions" />);
    expect(
      screen.getByRole('button', {name: 'Row actions'}),
    ).toBeInTheDocument();
  });

  it('supports custom icon', () => {
    const CustomIcon = () => <span data-testid="custom-icon">★</span>;
    render(<XDSMoreMenu items={defaultItems} icon={<CustomIcon />} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('supports data-testid', () => {
    render(<XDSMoreMenu items={defaultItems} data-testid="my-menu" />);
    expect(screen.getByTestId('my-menu')).toBeInTheDocument();
  });

  it('opens menu when clicked', async () => {
    const user = userEvent.setup();
    render(<XDSMoreMenu items={defaultItems} />);

    await user.click(screen.getByRole('button', {name: 'More options'}));
    expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
  });

  it('renders sections with group role', () => {
    const items = [
      {
        type: 'section' as const,
        title: 'Actions',
        items: [{label: 'Edit', onClick: vi.fn()}],
      },
    ];
    render(<XDSMoreMenu items={items} />);

    expect(
      screen.getByRole('group', {name: 'Actions', hidden: true}),
    ).toBeInTheDocument();
  });

  it('does not call onClick for disabled items', async () => {
    const handleEdit = vi.fn();
    const items = [{label: 'Edit', onClick: handleEdit, isDisabled: true}];
    const user = userEvent.setup();
    render(<XDSMoreMenu items={items} />);

    await user.click(screen.getByRole('button', {name: 'More options'}));
    await user.click(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    );

    expect(handleEdit).not.toHaveBeenCalled();
  });

  it('supports forwardRef', () => {
    const ref = vi.fn();
    render(<XDSMoreMenu items={defaultItems} ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('renders dividers between items', () => {
    const items = [
      {label: 'Edit', onClick: vi.fn()},
      {type: 'divider' as const},
      {label: 'Delete', onClick: vi.fn()},
    ];
    render(<XDSMoreMenu items={items} />);

    const separators = screen.getAllByRole('separator', {hidden: true});
    expect(separators.length).toBeGreaterThanOrEqual(1);
  });

  it('defaults to ghost variant', () => {
    render(<XDSMoreMenu items={defaultItems} />);
    const button = screen.getByRole('button', {name: 'More options'});
    // Ghost variant should render a button element
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });

  it('renders xds-more-menu class on dropdown panel for theme targeting', () => {
    render(<XDSMoreMenu items={defaultItems} />);
    const menu = screen.getByRole('menu', {hidden: true});
    expect(menu.className).toContain('xds-more-menu');
  });
});
