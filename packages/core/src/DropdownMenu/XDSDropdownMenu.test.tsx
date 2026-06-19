// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDSDropdownMenu.test.tsx
 * @input Uses vitest, @testing-library/react, XDSDropdownMenu component
 * @output Unit tests for XDSDropdownMenu component behavior
 * @position Testing; validates XDSDropdownMenu.tsx implementation
 *
 * SYNC: When XDSDropdownMenu.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSDropdownMenu} from './XDSDropdownMenu';
import {XDSDropdownMenuItem} from './XDSDropdownMenuItem';
import {XDSDivider} from '../Divider';

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

  it('defaults menu placement below', () => {
    render(
      <XDSDropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Item 1'}]}
      />,
    );
    const popover = screen
      .getByRole('menu', {hidden: true})
      .closest('[popover]');
    expect(popover?.getAttribute('style')).toContain(
      'position-area: bottom span-right',
    );
  });

  it('supports explicit menu placement', () => {
    render(
      <XDSDropdownMenu
        button={{label: 'Actions'}}
        placement="above"
        items={[{label: 'Item 1'}]}
      />,
    );
    const popover = screen
      .getByRole('menu', {hidden: true})
      .closest('[popover]');
    expect(popover?.getAttribute('style')).toContain(
      'position-area: top span-right',
    );
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

describe('XDSDropdownMenu light-dismiss race', () => {
  it('does not re-open the menu when a click follows a hide within the guard window', () => {
    // Reproduces the iOS Safari race: pointerdown fires light-dismiss before
    // the subsequent click on the trigger; without the guard, the click would
    // immediately re-open the menu in the same tap.
    render(
      <XDSDropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Edit'}]}
        data-testid="xds-dropdown-menu"
      />,
    );

    const trigger = screen.getByTestId('xds-dropdown-menu');
    fireEvent.click(trigger); // open
    fireEvent.click(trigger); // close (stamps guard)
    fireEvent.click(trigger); // would re-open without guard
    expect(HTMLElement.prototype.showPopover).toHaveBeenCalledTimes(1);
    expect(HTMLElement.prototype.hidePopover).toHaveBeenCalledTimes(1);
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
        onOpenChange={handleToggle}
      />,
    );

    const button = screen.getByRole('button', {name: /Actions/});
    expect(button).toHaveAttribute('aria-expanded', 'false');

    rerender(
      <XDSDropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Item 1'}]}
        isMenuOpen={true}
        onOpenChange={handleToggle}
      />,
    );

    expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
  });

  it('calls onOpenChange when button is clicked', async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();
    render(
      <XDSDropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Item 1'}]}
        isMenuOpen={false}
        onOpenChange={handleToggle}
      />,
    );

    await user.click(screen.getByRole('button', {name: /Actions/}));
    expect(handleToggle).toHaveBeenCalledWith(true);
  });
});

describe('XDSDropdownMenu hasAutoFocus', () => {
  it('does not focus menu items when hasAutoFocus is false and isMenuOpen is true', () => {
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus');
    render(
      <XDSDropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Edit'}, {label: 'Delete'}]}
        isMenuOpen={true}
        hasAutoFocus={false}
        onOpenChange={() => {}}
      />,
    );

    const menuItems = screen.getAllByRole('menuitem', {hidden: true});
    const menuItemFocusCalls = focusSpy.mock.calls.filter((_, i) => {
      const ctx = focusSpy.mock.contexts[i];
      return menuItems.includes(ctx as HTMLElement);
    });
    expect(menuItemFocusCalls).toHaveLength(0);
    focusSpy.mockRestore();
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
        items={[{label: 'Edit', onClick: handleClick, isDisabled: true}]}
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
        items={[{label: 'Edit', isDisabled: true}]}
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

describe('XDSDropdownMenu icon-only mode', () => {
  it('renders icon-only button when icon is set without children', () => {
    render(
      <XDSDropdownMenu
        button={{
          label: 'More options',
          icon: <span data-testid="icon">⋯</span>,
          variant: 'ghost',
          isIconOnly: true,
        }}
        items={[{label: 'Edit'}, {label: 'Delete'}]}
      />,
    );
    const button = screen.getByRole('button', {name: 'More options'});
    // label should be aria-label, not visible text
    expect(button).toHaveAttribute('aria-label', 'More options');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders icon + label when children are provided on button', () => {
    render(
      <XDSDropdownMenu
        button={{
          label: 'Settings',
          icon: <span data-testid="icon">⚙️</span>,
          variant: 'ghost',
          children: 'Settings',
        }}
        items={[{label: 'Preferences'}]}
      />,
    );
    const button = screen.getByRole('button', {name: /Settings/});
    expect(button).not.toHaveAttribute('aria-label');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});

describe('XDSDropdownMenu hasChevron', () => {
  it('hides chevron when hasChevron is false', () => {
    render(
      <XDSDropdownMenu
        button={{label: 'Sort by'}}
        hasChevron={false}
        items={[{label: 'Name'}, {label: 'Date'}]}
      />,
    );
    // No chevron SVG in the button's endContent wrapper
    const button = screen.getByRole('button', {name: /Sort by/});
    const endContentWrapper = button.querySelector('[class*="endContent"]');
    expect(endContentWrapper).toBeNull();
  });
});

describe('XDSDropdownMenu compound mode', () => {
  it('renders JSX children as menu items', () => {
    render(
      <XDSDropdownMenu button={{label: 'Actions'}}>
        <XDSDropdownMenuItem label="Edit" onClick={() => {}} />
        <XDSDropdownMenuItem label="Delete" onClick={() => {}} />
      </XDSDropdownMenu>,
    );
    expect(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {name: 'Delete', hidden: true}),
    ).toBeInTheDocument();
  });

  it('renders endContent after the item label', () => {
    render(
      <XDSDropdownMenu button={{label: 'Actions'}}>
        <XDSDropdownMenuItem
          label="Notifications"
          endContent={<span data-testid="badge">3</span>}
        />
      </XDSDropdownMenu>,
    );

    expect(screen.getByTestId('badge')).toHaveTextContent('3');
  });

  it('calls onClick when compound item is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <XDSDropdownMenu button={{label: 'Actions'}}>
        <XDSDropdownMenuItem label="Edit" onClick={handleClick} />
      </XDSDropdownMenu>,
    );

    await user.click(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    );
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when compound item is disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <XDSDropdownMenu button={{label: 'Actions'}}>
        <XDSDropdownMenuItem label="Edit" onClick={handleClick} isDisabled />
      </XDSDropdownMenu>,
    );

    await user.click(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    );
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders dividers between compound items', () => {
    render(
      <XDSDropdownMenu button={{label: 'Actions'}}>
        <XDSDropdownMenuItem label="Edit" onClick={() => {}} />
        <XDSDivider />
        <XDSDropdownMenuItem label="Delete" onClick={() => {}} />
      </XDSDropdownMenu>,
    );

    expect(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {name: 'Delete', hidden: true}),
    ).toBeInTheDocument();
    expect(screen.getByRole('separator', {hidden: true})).toBeInTheDocument();
  });

  it('has aria-disabled on disabled compound items', () => {
    render(
      <XDSDropdownMenu button={{label: 'Actions'}}>
        <XDSDropdownMenuItem label="Edit" onClick={() => {}} isDisabled />
      </XDSDropdownMenu>,
    );
    expect(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('supports mixed static and dynamic compound children', () => {
    const showExtra = true;
    render(
      <XDSDropdownMenu button={{label: 'Actions'}}>
        <XDSDropdownMenuItem label="Always" onClick={() => {}} />
        {showExtra && (
          <XDSDropdownMenuItem label="Conditional" onClick={() => {}} />
        )}
      </XDSDropdownMenu>,
    );

    expect(
      screen.getByRole('menuitem', {name: 'Always', hidden: true}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {name: 'Conditional', hidden: true}),
    ).toBeInTheDocument();
  });
});
