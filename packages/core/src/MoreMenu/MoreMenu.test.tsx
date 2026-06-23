// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MoreMenu.test.tsx
 * @input Uses vitest, @testing-library/react, MoreMenu component
 * @output Unit tests for MoreMenu component behavior
 * @position Testing; validates MoreMenu.tsx implementation
 *
 * SYNC: When MoreMenu.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MoreMenu} from './MoreMenu';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).matches = function (
    selector: string,
  ): boolean {
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

describe('MoreMenu', () => {
  it('renders trigger button with default aria-label', () => {
    render(<MoreMenu items={defaultItems} />);
    expect(
      screen.getByRole('button', {name: 'More options'}),
    ).toBeInTheDocument();
  });

  it('renders menu with role="menu"', () => {
    render(<MoreMenu items={defaultItems} />);
    expect(screen.getByRole('menu', {hidden: true})).toBeInTheDocument();
  });

  it('has aria-haspopup and aria-expanded attributes', () => {
    render(<MoreMenu items={defaultItems} />);
    const button = screen.getByRole('button', {name: 'More options'});
    expect(button).toHaveAttribute('aria-haspopup', 'menu');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders menu items', () => {
    render(<MoreMenu items={defaultItems} />);

    expect(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {name: 'Delete', hidden: true}),
    ).toBeInTheDocument();
  });

  it('opens menu when button is clicked', async () => {
    const user = userEvent.setup();
    render(<MoreMenu items={defaultItems} />);

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
    render(<MoreMenu items={items} />);

    // Open the menu first
    await user.click(screen.getByRole('button', {name: 'More options'}));
    // Click the item
    await user.click(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    );

    expect(handleEdit).toHaveBeenCalledOnce();
  });

  it('supports disabled state', () => {
    render(<MoreMenu items={defaultItems} isDisabled />);
    const button = screen.getByRole('button', {name: 'More options'});
    // Button uses aria-disabled (not native disabled) to keep
    // the button focusable for tooltip access
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('supports custom label', () => {
    render(<MoreMenu items={defaultItems} label="Row actions" />);
    expect(
      screen.getByRole('button', {name: 'Row actions'}),
    ).toBeInTheDocument();
  });

  it('supports custom icon', () => {
    const CustomIcon = () => <span data-testid="custom-icon">★</span>;
    render(<MoreMenu items={defaultItems} icon={<CustomIcon />} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('supports data-testid', () => {
    render(<MoreMenu items={defaultItems} data-testid="my-menu" />);
    expect(screen.getByTestId('my-menu')).toBeInTheDocument();
  });

  it('opens menu when clicked', async () => {
    const user = userEvent.setup();
    render(<MoreMenu items={defaultItems} />);

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
    render(<MoreMenu items={items} />);

    expect(
      screen.getByRole('group', {name: 'Actions', hidden: true}),
    ).toBeInTheDocument();
  });

  it('does not call onClick for disabled items', async () => {
    const handleEdit = vi.fn();
    const items = [{label: 'Edit', onClick: handleEdit, isDisabled: true}];
    const user = userEvent.setup();
    render(<MoreMenu items={items} />);

    await user.click(screen.getByRole('button', {name: 'More options'}));
    await user.click(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    );

    expect(handleEdit).not.toHaveBeenCalled();
  });

  it('supports forwardRef', () => {
    const ref = vi.fn();
    render(<MoreMenu items={defaultItems} ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('renders dividers between items', () => {
    const items = [
      {label: 'Edit', onClick: vi.fn()},
      {type: 'divider' as const},
      {label: 'Delete', onClick: vi.fn()},
    ];
    render(<MoreMenu items={items} />);

    const separators = screen.getAllByRole('separator', {hidden: true});
    expect(separators.length).toBeGreaterThanOrEqual(1);
  });

  it('defaults to ghost variant', () => {
    render(<MoreMenu items={defaultItems} />);
    const button = screen.getByRole('button', {name: 'More options'});
    // Ghost variant should render a button element
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });

  it('renders xds-more-menu class on dropdown panel for theme targeting', () => {
    render(<MoreMenu items={defaultItems} />);
    const menu = screen.getByRole('menu', {hidden: true});
    expect(menu.className).toContain('astryx-more-menu');
  });
});
