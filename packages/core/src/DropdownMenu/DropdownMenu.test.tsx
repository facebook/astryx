// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DropdownMenu.test.tsx
 * @input Uses vitest, @testing-library/react, DropdownMenu component
 * @output Unit tests for DropdownMenu component behavior
 * @position Testing; validates DropdownMenu.tsx implementation
 *
 * SYNC: When DropdownMenu.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {DropdownMenu} from './DropdownMenu';
import {DropdownMenuItem} from './DropdownMenuItem';
import {Divider} from '../Divider';

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

describe('DropdownMenu', () => {
  it('renders trigger button with label', () => {
    render(
      <DropdownMenu button={{label: 'Actions'}} items={[{label: 'Item 1'}]} />,
    );
    expect(screen.getByRole('button', {name: /Actions/})).toBeInTheDocument();
  });

  it('renders menu with role="menu"', () => {
    render(
      <DropdownMenu button={{label: 'Actions'}} items={[{label: 'Item 1'}]} />,
    );
    expect(screen.getByRole('menu', {hidden: true})).toBeInTheDocument();
  });

  it('names the menu from the trigger label (menus-13)', () => {
    render(
      <DropdownMenu button={{label: 'Actions'}} items={[{label: 'Item 1'}]} />,
    );
    expect(
      screen.getByRole('menu', {name: 'Actions', hidden: true}),
    ).toBeInTheDocument();
  });

  it('does not wrap the menu in a role="dialog" aria-modal element', () => {
    render(
      <DropdownMenu button={{label: 'Actions'}} items={[{label: 'Item 1'}]} />,
    );
    // The popup exposes its own role="menu"; it must not be nested inside a
    // modal dialog, which would announce an unnamed dialog around the menu
    // while focus stays on the trigger.
    expect(
      screen.queryByRole('dialog', {hidden: true}),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector('[aria-modal="true"]'),
    ).not.toBeInTheDocument();
  });

  it('defaults menu placement below', () => {
    render(
      <DropdownMenu button={{label: 'Actions'}} items={[{label: 'Item 1'}]} />,
    );
    const popover = screen
      .getByRole('menu', {hidden: true})
      .closest('[popover]');
    expect(popover?.getAttribute('style')).toContain(
      'position-area: self-block-end span-self-inline-end',
    );
  });

  it('supports explicit menu placement', () => {
    render(
      <DropdownMenu
        button={{label: 'Actions'}}
        placement="above"
        items={[{label: 'Item 1'}]}
      />,
    );
    const popover = screen
      .getByRole('menu', {hidden: true})
      .closest('[popover]');
    expect(popover?.getAttribute('style')).toContain(
      'position-area: self-block-start span-self-inline-end',
    );
  });

  it('emits the direction-independent logical mapping under an RTL ancestor (#3389)', async () => {
    // The self-* position-area keywords resolve against the popover's own
    // inherited direction in the browser, so RTL emits the same string as
    // LTR and the mirroring is pure CSS. jsdom can't verify the geometry —
    // the DropdownMenu RTL Storybook story is the visual proof surface.
    const user = userEvent.setup();
    const {container} = render(
      <div style={{direction: 'rtl'}}>
        <DropdownMenu button={{label: 'Actions'}} items={[{label: 'Item 1'}]} />
      </div>,
    );

    await user.click(screen.getByRole('button', {name: /Actions/}));

    const popover = container.querySelector('[popover]');
    expect(popover?.getAttribute('style')).toContain(
      'position-area: self-block-end span-self-inline-end',
    );
  });

  it('has aria-haspopup and aria-expanded attributes', () => {
    render(
      <DropdownMenu button={{label: 'Actions'}} items={[{label: 'Item 1'}]} />,
    );
    const button = screen.getByRole('button', {name: /Actions/});
    expect(button).toHaveAttribute('aria-haspopup', 'menu');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens menu when button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu button={{label: 'Actions'}} items={[{label: 'Item 1'}]} />,
    );

    await user.click(screen.getByRole('button', {name: /Actions/}));
    expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
  });

  it('closes the menu when Tab is pressed inside it (APG menu-button)', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu button={{label: 'Actions'}} items={[{label: 'Item 1'}]} />,
    );

    await user.click(screen.getByRole('button', {name: /Actions/}));
    expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();

    const menu = screen.getByRole('menu', {hidden: true});
    fireEvent.keyDown(menu, {key: 'Tab'});
    expect(HTMLElement.prototype.hidePopover).toHaveBeenCalled();
  });

  it('typeahead focuses the item matching the typed character (menus-11)', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Cut'}, {label: 'Copy'}, {label: 'Delete'}]}
      />,
    );
    await user.click(screen.getByRole('button', {name: /Actions/}));
    const menu = screen.getByRole('menu', {hidden: true});
    fireEvent.keyDown(menu, {key: 'd'});
    expect(
      screen.getByRole('menuitem', {name: 'Delete', hidden: true}),
    ).toHaveFocus();
  });

  it('calls onClick callback when button is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <DropdownMenu
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
      <DropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Item 1'}]}
        data-testid="my-dropdown"
      />,
    );
    expect(screen.getByTestId('my-dropdown')).toBeInTheDocument();
  });
});

describe('DropdownMenu light-dismiss race', () => {
  it('does not re-open the menu when a click follows a hide within the guard window', () => {
    // Reproduces the iOS Safari race: pointerdown fires light-dismiss before
    // the subsequent click on the trigger; without the guard, the click would
    // immediately re-open the menu in the same tap.
    render(
      <DropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Edit'}]}
        data-testid="astryx-dropdown-menu"
      />,
    );

    const trigger = screen.getByTestId('astryx-dropdown-menu');
    fireEvent.click(trigger); // open
    fireEvent.click(trigger); // close (stamps guard)
    fireEvent.click(trigger); // would re-open without guard
    expect(HTMLElement.prototype.showPopover).toHaveBeenCalledTimes(1);
    expect(HTMLElement.prototype.hidePopover).toHaveBeenCalledTimes(1);
  });
});

describe('DropdownMenu controlled mode', () => {
  it('respects isMenuOpen prop', async () => {
    const handleToggle = vi.fn();
    const {rerender} = render(
      <DropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Item 1'}]}
        isMenuOpen={false}
        onOpenChange={handleToggle}
      />,
    );

    const button = screen.getByRole('button', {name: /Actions/});
    expect(button).toHaveAttribute('aria-expanded', 'false');

    rerender(
      <DropdownMenu
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
      <DropdownMenu
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

describe('DropdownMenu items', () => {
  it('renders items with labels', () => {
    render(
      <DropdownMenu
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
      <DropdownMenu
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
      <DropdownMenu
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
      <DropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Edit', isDisabled: true}]}
      />,
    );
    expect(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    ).toHaveAttribute('aria-disabled', 'true');
  });
});

describe('DropdownMenu sections', () => {
  it('renders section with title', () => {
    render(
      <DropdownMenu
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
      <DropdownMenu
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
      <DropdownMenu
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

describe('DropdownMenu dividers', () => {
  it('renders dividers between items', () => {
    render(
      <DropdownMenu
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

describe('DropdownMenu button customization', () => {
  it('renders with different button variants', () => {
    const {rerender} = render(
      <DropdownMenu
        button={{label: 'Primary', variant: 'primary'}}
        items={[{label: 'Item'}]}
      />,
    );
    expect(screen.getByRole('button', {name: /Primary/})).toBeInTheDocument();

    rerender(
      <DropdownMenu
        button={{label: 'Ghost', variant: 'ghost'}}
        items={[{label: 'Item'}]}
      />,
    );
    expect(screen.getByRole('button', {name: /Ghost/})).toBeInTheDocument();
  });

  it('renders with different button sizes', () => {
    const {rerender} = render(
      <DropdownMenu
        button={{label: 'Small', size: 'sm'}}
        items={[{label: 'Item'}]}
      />,
    );
    expect(screen.getByRole('button', {name: /Small/})).toBeInTheDocument();

    rerender(
      <DropdownMenu
        button={{label: 'Large', size: 'lg'}}
        items={[{label: 'Item'}]}
      />,
    );
    expect(screen.getByRole('button', {name: /Large/})).toBeInTheDocument();
  });
});

describe('DropdownMenu icon-only mode', () => {
  it('renders icon-only button when icon is set without children', () => {
    render(
      <DropdownMenu
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
      <DropdownMenu
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

describe('DropdownMenu hasChevron', () => {
  it('hides chevron when hasChevron is false', () => {
    render(
      <DropdownMenu
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

describe('DropdownMenu compound mode', () => {
  it('renders JSX children as menu items', () => {
    render(
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuItem label="Edit" onClick={() => {}} />
        <DropdownMenuItem label="Delete" onClick={() => {}} />
      </DropdownMenu>,
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
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuItem
          label="Notifications"
          endContent={<span data-testid="badge">3</span>}
        />
      </DropdownMenu>,
    );

    expect(screen.getByTestId('badge')).toHaveTextContent('3');
  });

  it('calls onClick when compound item is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuItem label="Edit" onClick={handleClick} />
      </DropdownMenu>,
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
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuItem label="Edit" onClick={handleClick} isDisabled />
      </DropdownMenu>,
    );

    await user.click(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    );
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders dividers between compound items', () => {
    render(
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuItem label="Edit" onClick={() => {}} />
        <Divider />
        <DropdownMenuItem label="Delete" onClick={() => {}} />
      </DropdownMenu>,
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
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuItem label="Edit" onClick={() => {}} isDisabled />
      </DropdownMenu>,
    );
    expect(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('supports mixed static and dynamic compound children', () => {
    const showExtra = true;
    render(
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuItem label="Always" onClick={() => {}} />
        {showExtra && (
          <DropdownMenuItem label="Conditional" onClick={() => {}} />
        )}
      </DropdownMenu>,
    );

    expect(
      screen.getByRole('menuitem', {name: 'Always', hidden: true}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {name: 'Conditional', hidden: true}),
    ).toBeInTheDocument();
  });
});

describe('DropdownMenu keyboard access for menuitemradio/menuitemcheckbox (#3829)', () => {
  it('arrow navigation reaches consumer-rendered menuitemradio and menuitemcheckbox items', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu button={{label: 'Sort'}}>
        <DropdownMenuItem label="Edit" onClick={() => {}} />
        <div role="menuitemradio" tabIndex={-1} aria-checked="false">
          Newest
        </div>
        <div role="menuitemcheckbox" tabIndex={-1} aria-checked="false">
          Archived
        </div>
      </DropdownMenu>,
    );

    await user.click(screen.getByRole('button', {name: /Sort/}));
    const menu = screen.getByRole('menu', {hidden: true});
    screen.getByRole('menuitem', {name: 'Edit', hidden: true}).focus();

    fireEvent.keyDown(menu, {key: 'ArrowDown'});
    expect(
      screen.getByRole('menuitemradio', {name: 'Newest', hidden: true}),
    ).toHaveFocus();

    fireEvent.keyDown(menu, {key: 'ArrowDown'});
    expect(
      screen.getByRole('menuitemcheckbox', {name: 'Archived', hidden: true}),
    ).toHaveFocus();
  });

  it('activates a focused menuitemradio with Enter and a menuitemcheckbox with Space', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onToggle = vi.fn();
    render(
      <DropdownMenu button={{label: 'Sort'}}>
        <DropdownMenuItem label="Edit" onClick={() => {}} />
        <div
          role="menuitemradio"
          tabIndex={-1}
          aria-checked="false"
          onClick={onSelect}>
          Newest
        </div>
        <div
          role="menuitemcheckbox"
          tabIndex={-1}
          aria-checked="false"
          onClick={onToggle}>
          Archived
        </div>
      </DropdownMenu>,
    );

    await user.click(screen.getByRole('button', {name: /Sort/}));
    const menu = screen.getByRole('menu', {hidden: true});

    screen.getByRole('menuitemradio', {name: 'Newest', hidden: true}).focus();
    fireEvent.keyDown(menu, {key: 'Enter'});
    expect(onSelect).toHaveBeenCalledTimes(1);

    screen
      .getByRole('menuitemcheckbox', {name: 'Archived', hidden: true})
      .focus();
    fireEvent.keyDown(menu, {key: ' '});
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('typeahead matches a menuitemradio label', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu button={{label: 'Sort'}}>
        <DropdownMenuItem label="Edit" onClick={() => {}} />
        <div role="menuitemradio" tabIndex={-1} aria-checked="false">
          Newest
        </div>
        <div role="menuitemcheckbox" tabIndex={-1} aria-checked="false">
          Archived
        </div>
      </DropdownMenu>,
    );

    await user.click(screen.getByRole('button', {name: /Sort/}));
    fireEvent.keyDown(screen.getByRole('menu', {hidden: true}), {key: 'n'});
    expect(
      screen.getByRole('menuitemradio', {name: 'Newest', hidden: true}),
    ).toHaveFocus();
  });

  it('typeahead matches a menuitemcheckbox label', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu button={{label: 'Sort'}}>
        <DropdownMenuItem label="Edit" onClick={() => {}} />
        <div role="menuitemradio" tabIndex={-1} aria-checked="false">
          Newest
        </div>
        <div role="menuitemcheckbox" tabIndex={-1} aria-checked="false">
          Archived
        </div>
      </DropdownMenu>,
    );

    await user.click(screen.getByRole('button', {name: /Sort/}));
    fireEvent.keyDown(screen.getByRole('menu', {hidden: true}), {key: 'a'});
    expect(
      screen.getByRole('menuitemcheckbox', {name: 'Archived', hidden: true}),
    ).toHaveFocus();
  });

  it('typeahead skips an aria-disabled item and matches the next enabled label', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu button={{label: 'Sort'}}>
        <DropdownMenuItem label="Edit" onClick={() => {}} />
        <div role="menuitemradio" tabIndex={-1} aria-disabled="true">
          Newest
        </div>
        <div role="menuitemcheckbox" tabIndex={-1} aria-checked="false">
          Nightly
        </div>
      </DropdownMenu>,
    );

    await user.click(screen.getByRole('button', {name: /Sort/}));
    // Anchor the search on 'Edit' so typeahead scans forward and meets the
    // disabled 'Newest' (also an 'n' match) before the enabled 'Nightly'.
    // This pins the `:not([aria-disabled="true"])` in MENU_ITEM_SELECTOR: the
    // menus never pass useTypeahead's `isDisabled` option, so that clause is
    // the only thing keeping disabled rows out of the typeahead list. An
    // arrow-key test cannot cover it — useListFocus re-filters disabled items
    // independently, so arrow navigation is guarded twice over.
    // The disabled row keeps tabIndex={-1} on purpose: it stays focusable, so
    // the selector clause is the sole reason focus skips it.
    screen.getByRole('menuitem', {name: 'Edit', hidden: true}).focus();
    fireEvent.keyDown(screen.getByRole('menu', {hidden: true}), {key: 'n'});
    expect(
      screen.getByRole('menuitemcheckbox', {name: 'Nightly', hidden: true}),
    ).toHaveFocus();
  });

  it('skips aria-disabled menuitemradio and menuitemcheckbox items during arrow navigation', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu button={{label: 'Sort'}}>
        <DropdownMenuItem label="Edit" onClick={() => {}} />
        <div role="menuitemradio" tabIndex={-1} aria-disabled="true">
          Newest
        </div>
        <div role="menuitemcheckbox" tabIndex={-1} aria-disabled="true">
          Archived
        </div>
        <div role="menuitemradio" tabIndex={-1} aria-checked="false">
          Oldest
        </div>
      </DropdownMenu>,
    );

    await user.click(screen.getByRole('button', {name: /Sort/}));
    const menu = screen.getByRole('menu', {hidden: true});
    screen.getByRole('menuitem', {name: 'Edit', hidden: true}).focus();

    fireEvent.keyDown(menu, {key: 'ArrowDown'});
    expect(
      screen.getByRole('menuitemradio', {name: 'Oldest', hidden: true}),
    ).toHaveFocus();
  });
});
