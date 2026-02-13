/**
 * @file XDSDropdownMenu.test.tsx
 * @input Uses vitest, @testing-library/react, XDSDropdownMenu component
 * @output Unit tests for XDSDropdownMenu component behavior
 * @position Testing; validates XDSDropdownMenu.tsx implementation
 *
 * SYNC: When XDSDropdownMenu.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSDropdownMenu} from './XDSDropdownMenu';

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

describe('XDSDropdownMenu', () => {
  it('renders trigger button with label', () => {
    render(
      <XDSDropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Item 1'}]}
      />,
    );
    expect(screen.getByRole('button', {name: /Actions/})).toBeInTheDocument();
  });

  it('renders menu with role="menu"', () => {
    render(
      <XDSDropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Item 1'}]}
      />,
    );
    expect(screen.getByRole('menu', {hidden: true})).toBeInTheDocument();
  });

  it('has aria-haspopup and aria-expanded attributes', () => {
    render(
      <XDSDropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Item 1'}]}
      />,
    );
    const button = screen.getByRole('button', {name: /Actions/});
    expect(button).toHaveAttribute('aria-haspopup', 'menu');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens menu when button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <XDSDropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Item 1'}]}
      />,
    );

    await user.click(screen.getByRole('button', {name: /Actions/}));
    expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
  });

  it('calls onClick callback when button is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <XDSDropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Item 1'}]}
        onClick={handleClick}
      />,
    );

    await user.click(screen.getByRole('button', {name: /Actions/}));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies data-testid to button', () => {
    render(
      <XDSDropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Item 1'}]}
        data-testid="my-dropdown"
      />,
    );
    expect(screen.getByTestId('my-dropdown')).toBeInTheDocument();
  });
});

describe('XDSDropdownMenu controlled mode', () => {
  it('respects isMenuOpen prop', async () => {
    const handleToggle = vi.fn();
    const {rerender} = render(
      <XDSDropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Item 1'}]}
        isMenuOpen={false}
        onMenuToggle={handleToggle}
      />,
    );

    const button = screen.getByRole('button', {name: /Actions/});
    expect(button).toHaveAttribute('aria-expanded', 'false');

    rerender(
      <XDSDropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Item 1'}]}
        isMenuOpen={true}
        onMenuToggle={handleToggle}
      />,
    );

    expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
  });

  it('calls onMenuToggle when button is clicked', async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();
    render(
      <XDSDropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Item 1'}]}
        isMenuOpen={false}
        onMenuToggle={handleToggle}
      />,
    );

    await user.click(screen.getByRole('button', {name: /Actions/}));
    expect(handleToggle).toHaveBeenCalledWith(true);
  });
});

describe('XDSDropdownMenu items', () => {
  it('renders items with labels', () => {
    render(
      <XDSDropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Edit'}, {label: 'Delete'}]}
      />,
    );
    expect(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {name: 'Delete', hidden: true}),
    ).toBeInTheDocument();
  });

  it('calls onClick when item is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <XDSDropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Edit', onClick: handleClick}]}
      />,
    );

    await user.click(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    );
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <XDSDropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Edit', onClick: handleClick, disabled: true}]}
      />,
    );

    await user.click(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    );
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('has aria-disabled when disabled', () => {
    render(
      <XDSDropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Edit', disabled: true}]}
      />,
    );
    expect(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    ).toHaveAttribute('aria-disabled', 'true');
  });
});

describe('XDSDropdownMenu sections', () => {
  it('renders section with title', () => {
    render(
      <XDSDropdownMenu
        button={{label: 'Actions'}}
        items={[
          {
            type: 'section',
            title: 'File Actions',
            items: [{label: 'New'}, {label: 'Open'}],
          },
        ]}
      />,
    );

    expect(screen.getByText('File Actions')).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {name: 'New', hidden: true}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {name: 'Open', hidden: true}),
    ).toBeInTheDocument();
  });

  it('renders section without title', () => {
    render(
      <XDSDropdownMenu
        button={{label: 'Actions'}}
        items={[
          {
            type: 'section',
            items: [{label: 'Item 1'}, {label: 'Item 2'}],
          },
        ]}
      />,
    );

    expect(
      screen.getByRole('menuitem', {name: 'Item 1', hidden: true}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {name: 'Item 2', hidden: true}),
    ).toBeInTheDocument();
  });

  it('has role="group" with aria-label', () => {
    render(
      <XDSDropdownMenu
        button={{label: 'Actions'}}
        items={[
          {
            type: 'section',
            title: 'My Section',
            items: [{label: 'Item'}],
          },
        ]}
      />,
    );

    const group = screen.getByRole('group', {name: 'My Section', hidden: true});
    expect(group).toBeInTheDocument();
  });
});

describe('XDSDropdownMenu dividers', () => {
  it('renders dividers between items', () => {
    render(
      <XDSDropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Edit'}, {type: 'divider'}, {label: 'Delete'}]}
      />,
    );

    expect(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {name: 'Delete', hidden: true}),
    ).toBeInTheDocument();
    expect(screen.getByRole('separator', {hidden: true})).toBeInTheDocument();
  });
});

describe('XDSDropdownMenu button customization', () => {
  it('renders with different button variants', () => {
    const {rerender} = render(
      <XDSDropdownMenu
        button={{label: 'Primary', variant: 'primary'}}
        items={[{label: 'Item'}]}
      />,
    );
    expect(screen.getByRole('button', {name: /Primary/})).toBeInTheDocument();

    rerender(
      <XDSDropdownMenu
        button={{label: 'Ghost', variant: 'ghost'}}
        items={[{label: 'Item'}]}
      />,
    );
    expect(screen.getByRole('button', {name: /Ghost/})).toBeInTheDocument();
  });

  it('renders with different button sizes', () => {
    const {rerender} = render(
      <XDSDropdownMenu
        button={{label: 'Small', size: 'sm'}}
        items={[{label: 'Item'}]}
      />,
    );
    expect(screen.getByRole('button', {name: /Small/})).toBeInTheDocument();

    rerender(
      <XDSDropdownMenu
        button={{label: 'Large', size: 'lg'}}
        items={[{label: 'Item'}]}
      />,
    );
    expect(screen.getByRole('button', {name: /Large/})).toBeInTheDocument();
  });
});

describe('XDSDropdownMenu custom render', () => {
  it('supports custom item rendering via children prop', () => {
    render(
      <XDSDropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Edit'}, {label: 'Delete'}]}>
        {item => (
          <span data-testid={`custom-${item.label}`}>{item.label}!</span>
        )}
      </XDSDropdownMenu>,
    );

    expect(screen.getByTestId('custom-Edit')).toBeInTheDocument();
    expect(screen.getByTestId('custom-Delete')).toBeInTheDocument();
  });
});
