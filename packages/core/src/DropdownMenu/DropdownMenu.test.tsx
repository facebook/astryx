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
import {render, screen, fireEvent, waitFor, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {DropdownMenu} from './DropdownMenu';
import {DropdownMenuItem} from './DropdownMenuItem';
import {DropdownMenuDivider} from './DropdownMenuDivider';
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

  it('supports explicit menu alignment', () => {
    render(
      <DropdownMenu
        button={{label: 'Actions'}}
        alignment="end"
        items={[{label: 'Item 1'}]}
      />,
    );
    const popover = screen
      .getByRole('menu', {hidden: true})
      .closest('[popover]');
    expect(popover?.getAttribute('style')).toContain(
      'position-area: self-block-end span-self-inline-start',
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

  it('calls onOpenChange for uncontrolled native open and close transitions', async () => {
    const user = userEvent.setup();
    const handleOpenChange = vi.fn();
    render(
      <DropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Item 1'}]}
        onOpenChange={handleOpenChange}
      />,
    );

    await user.click(screen.getByRole('button', {name: /Actions/}));
    expect(handleOpenChange).toHaveBeenCalledWith(true);

    handleOpenChange.mockClear();
    const popoverEl = screen
      .getByRole('menu', {hidden: true})
      .closest('[popover]');
    expect(popoverEl).not.toBeNull();
    const toggleEvent = new Event('toggle');
    Object.defineProperty(toggleEvent, 'newState', {value: 'closed'});
    fireEvent(popoverEl as HTMLElement, toggleEvent);

    expect(handleOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole('button', {name: /Actions/})).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('restores focus to the trigger after native light dismiss', async () => {
    const raf = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation(callback => {
        callback(0);
        return 0;
      });

    try {
      const user = userEvent.setup();
      render(
        <DropdownMenu
          button={{label: 'Actions'}}
          items={[{label: 'Edit'}, {label: 'Delete'}]}
        />,
      );

      const trigger = screen.getByRole('button', {name: /Actions/});
      trigger.focus();
      await user.click(trigger);
      // Pointer opens focus the menu container, not the first item (#4477).
      expect(screen.getByRole('menu', {hidden: true})).toHaveFocus();

      const popoverEl = screen
        .getByRole('menu', {hidden: true})
        .closest('[popover]');
      expect(popoverEl).not.toBeNull();
      popoverEl?.addEventListener('toggle', () => {
        trigger.blur();
      });
      const toggleEvent = new Event('toggle');
      Object.defineProperty(toggleEvent, 'newState', {value: 'closed'});
      fireEvent(popoverEl as HTMLElement, toggleEvent);

      expect(trigger).toHaveFocus();
    } finally {
      raf.mockRestore();
    }
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

  it('typeahead advances past an item that already starts with the letter', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Copy'}, {label: 'Copy link'}, {label: 'Delete'}]}
      />,
    );
    await user.click(screen.getByRole('button', {name: /Actions/}));
    const menu = screen.getByRole('menu', {hidden: true});
    screen.getByRole('menuitem', {name: 'Copy', hidden: true}).focus();

    fireEvent.keyDown(menu, {key: 'c'});

    // APG: a printable character moves focus to the NEXT item starting with
    // it. Anchoring at the focused item instead makes the press a dead key.
    expect(
      screen.getByRole('menuitem', {name: 'Copy link', hidden: true}),
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
  function openMenu() {
    render(
      <DropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Edit'}]}
        data-testid="astryx-dropdown-menu"
      />,
    );
    const trigger = screen.getByTestId('astryx-dropdown-menu');
    fireEvent.pointerDown(trigger);
    fireEvent.click(trigger);
    expect(HTMLElement.prototype.showPopover).toHaveBeenCalledTimes(1);
    return trigger;
  }

  /**
   * The browser dismisses the menu on pointerup and queues the `toggle` event;
   * on the engines that lose the race it reaches React before the trigger's
   * own click, which then reads a closed menu.
   */
  function lightDismiss() {
    const popover = document.querySelector('[popover]') as HTMLElement;
    act(() => {
      popover.dispatchEvent(
        Object.assign(new Event('toggle'), {
          oldState: 'open',
          newState: 'closed',
        }),
      );
    });
  }

  it('does not re-open when the trigger click follows its own light dismiss', () => {
    const trigger = openMenu();

    fireEvent.pointerDown(trigger);
    lightDismiss();
    fireEvent.click(trigger);

    expect(HTMLElement.prototype.showPopover).toHaveBeenCalledTimes(1);
  });

  it('re-opens on a press of its own after a light dismiss', () => {
    const trigger = openMenu();

    fireEvent.pointerDown(trigger);
    lightDismiss();
    fireEvent.click(trigger);
    fireEvent.pointerDown(trigger);
    fireEvent.click(trigger);

    expect(HTMLElement.prototype.showPopover).toHaveBeenCalledTimes(2);
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

  it('closes the menu after an item is activated', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Edit', onClick: () => {}}]}
      />,
    );

    await user.click(screen.getByRole('button', {name: /Actions/}));
    await user.click(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    );
    expect(HTMLElement.prototype.hidePopover).toHaveBeenCalled();
  });

  it('keeps the menu open when the item opts out of closing', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <DropdownMenu
        button={{label: 'Actions'}}
        items={[
          {label: 'Copy ID', onClick: handleClick, hasCloseOnSelect: false},
        ]}
      />,
    );

    await user.click(screen.getByRole('button', {name: /Actions/}));
    const item = screen.getByRole('menuitem', {name: 'Copy ID', hidden: true});
    await user.click(item);
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(HTMLElement.prototype.hidePopover).not.toHaveBeenCalled();

    // Second activation still works, and focus never left the item.
    await user.click(item);
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('keeps the menu open on keyboard activation too', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <DropdownMenu
        button={{label: 'Actions'}}
        items={[
          {label: 'Copy ID', onClick: handleClick, hasCloseOnSelect: false},
        ]}
      />,
    );

    await user.click(screen.getByRole('button', {name: /Actions/}));
    const menu = screen.getByRole('menu', {hidden: true});
    await waitFor(() => expect(menu).toHaveFocus());
    fireEvent.keyDown(menu, {key: 'ArrowDown'});
    fireEvent.keyDown(menu, {key: 'Enter'});

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(HTMLElement.prototype.hidePopover).not.toHaveBeenCalled();
    expect(
      screen.getByRole('menuitem', {name: 'Copy ID', hidden: true}),
    ).toHaveFocus();
  });

  it('closes the menu on activation even when the item carries no handler', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu button={{label: 'Actions'}} items={[{label: 'Edit'}]} />,
    );

    await user.click(screen.getByRole('button', {name: /Actions/}));
    await user.click(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    );
    expect(HTMLElement.prototype.hidePopover).toHaveBeenCalled();
  });

  it('keeps a row mounted when its label changes, so focus survives (data mode keys by position)', async () => {
    const user = userEvent.setup();

    function CopyMenu() {
      const [copied, setCopied] = useState(false);
      return (
        <DropdownMenu
          button={{label: 'Actions'}}
          items={[
            {
              label: copied ? 'Copied' : 'Copy ID',
              hasCloseOnSelect: false,
              onClick: () => setCopied(true),
            },
            {label: 'Rename'},
          ]}
        />
      );
    }

    render(<CopyMenu />);
    await user.click(screen.getByRole('button', {name: /Actions/}));
    const item = screen.getByRole('menuitem', {name: 'Copy ID', hidden: true});
    item.focus();
    await user.click(item);

    const renamed = screen.getByRole('menuitem', {
      name: 'Copied',
      hidden: true,
    });
    expect(renamed).toBe(item);
    expect(renamed).toHaveFocus();
  });

  it('follows the item, not the slot, when ids are supplied and the list changes', async () => {
    const user = userEvent.setup();

    // A menu whose rows are filtered by a control outside it: the focused row
    // survives at a new index. Position keys cannot express this — the DOM node
    // at index 0 would be reused for whatever item lands there.
    function FilterableMenu({hideFirst}: {hideFirst: boolean}) {
      const items = [
        {id: 'edit', label: 'Edit'},
        {id: 'duplicate', label: 'Duplicate'},
        {id: 'archive', label: 'Archive'},
      ].filter(item => !hideFirst || item.id !== 'edit');
      return <DropdownMenu button={{label: 'Actions'}} items={items} />;
    }

    const {rerender} = render(<FilterableMenu hideFirst={false} />);
    await user.click(screen.getByRole('button', {name: /Actions/}));

    const duplicate = screen.getByRole('menuitem', {
      name: 'Duplicate',
      hidden: true,
    });
    duplicate.focus();

    rerender(<FilterableMenu hideFirst={true} />);

    // Same node, still focused, even though it moved from index 1 to index 0.
    expect(
      screen.getByRole('menuitem', {name: 'Duplicate', hidden: true}),
    ).toBe(duplicate);
    expect(duplicate).toHaveFocus();
    expect(
      screen.queryByRole('menuitem', {name: 'Edit', hidden: true}),
    ).not.toBeInTheDocument();
  });

  it('does not put id on the rendered row', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu
        button={{label: 'Actions'}}
        items={[{id: 'edit', label: 'Edit'}]}
      />,
    );
    await user.click(screen.getByRole('button', {name: /Actions/}));

    // `id` is identity for React, not a DOM attribute the caller is setting.
    expect(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    ).not.toHaveAttribute('id', 'edit');
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

describe('DropdownMenu theming slots', () => {
  it('exposes a themeable slot on the section heading', () => {
    render(
      <DropdownMenu
        button={{label: 'Actions'}}
        items={[
          {
            type: 'section',
            title: 'File Actions',
            items: [{label: 'New'}],
          },
        ]}
      />,
    );

    expect(screen.getByText('File Actions')).toHaveClass(
      'astryx-dropdown-menu-section-heading',
    );
  });

  it('exposes a themeable slot on the menu divider', () => {
    render(
      <DropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Edit'}, {type: 'divider'}, {label: 'Delete'}]}
      />,
    );

    const divider = screen.getByRole('separator', {hidden: true});
    expect(divider).toHaveClass('astryx-dropdown-menu-divider');
    // Still carries the base Divider slot so global divider theming applies too.
    expect(divider).toHaveClass('astryx-divider');
  });
});

describe('DropdownMenuItem destructive variant', () => {
  it('marks a compound-mode item destructive via data-variant', () => {
    render(
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuItem
          label="Delete"
          variant="destructive"
          onClick={() => {}}
        />
        <DropdownMenuItem label="Edit" onClick={() => {}} />
      </DropdownMenu>,
    );

    const del = screen.getByRole('menuitem', {name: 'Delete', hidden: true});
    const edit = screen.getByRole('menuitem', {name: 'Edit', hidden: true});
    expect(del).toHaveAttribute('data-variant', 'destructive');
    // Default items carry no variant attribute, so existing usage is unchanged.
    expect(edit).not.toHaveAttribute('data-variant');
  });

  it('forwards variant from the data-driven items API', () => {
    render(
      <DropdownMenu
        button={{label: 'Actions'}}
        items={[
          {label: 'Delete', variant: 'destructive', onClick: () => {}},
          {label: 'Edit', onClick: () => {}},
        ]}
      />,
    );

    expect(
      screen.getByRole('menuitem', {name: 'Delete', hidden: true}),
    ).toHaveAttribute('data-variant', 'destructive');
    expect(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    ).not.toHaveAttribute('data-variant');
  });

  it('forwards variant to items nested inside a section', () => {
    render(
      <DropdownMenu
        button={{label: 'Actions'}}
        items={[
          {
            type: 'section',
            title: 'Danger zone',
            items: [
              {label: 'Delete', variant: 'destructive', onClick: () => {}},
            ],
          },
        ]}
      />,
    );

    expect(
      screen.getByRole('menuitem', {name: 'Delete', hidden: true}),
    ).toHaveAttribute('data-variant', 'destructive');
  });

  it('defaults to no variant attribute', () => {
    render(
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuItem label="Edit" onClick={() => {}} />
      </DropdownMenu>,
    );
    expect(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    ).not.toHaveAttribute('data-variant');
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

  it('moves focus to the item the mouse hovers, keeping a single highlight', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuItem label="Edit" onClick={() => {}} />
        <DropdownMenuItem label="Duplicate" onClick={() => {}} />
        <DropdownMenuItem label="Delete" onClick={() => {}} />
      </DropdownMenu>,
    );

    await user.click(screen.getByRole('button', {name: /Actions/}));
    // Keyboard focus starts on the first item.
    const edit = screen.getByRole('menuitem', {name: 'Edit', hidden: true});
    const del = screen.getByRole('menuitem', {name: 'Delete', hidden: true});
    edit.focus();
    expect(edit).toHaveFocus();

    // A mouse hover over another item moves focus to it, so the single
    // focus-driven highlight follows the pointer instead of leaving two.
    fireEvent.pointerMove(del, {pointerType: 'mouse'});
    expect(del).toHaveFocus();
    expect(edit).not.toHaveFocus();
  });

  it('does not move focus on hover for a disabled item', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuItem label="Edit" onClick={() => {}} />
        <DropdownMenuItem label="Delete" isDisabled onClick={() => {}} />
      </DropdownMenu>,
    );

    await user.click(screen.getByRole('button', {name: /Actions/}));
    const edit = screen.getByRole('menuitem', {name: 'Edit', hidden: true});
    const del = screen.getByRole('menuitem', {name: 'Delete', hidden: true});
    edit.focus();

    fireEvent.pointerMove(del, {pointerType: 'mouse'});
    expect(edit).toHaveFocus();
  });

  it('does not move focus for a non-mouse (touch) pointer', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuItem label="Edit" onClick={() => {}} />
        <DropdownMenuItem label="Delete" onClick={() => {}} />
      </DropdownMenu>,
    );

    await user.click(screen.getByRole('button', {name: /Actions/}));
    const edit = screen.getByRole('menuitem', {name: 'Edit', hidden: true});
    const del = screen.getByRole('menuitem', {name: 'Delete', hidden: true});
    edit.focus();

    fireEvent.pointerMove(del, {pointerType: 'touch'});
    expect(edit).toHaveFocus();
  });
});

describe('DropdownMenu open focus follows input modality (#4477)', () => {
  const items = [{label: 'Edit'}, {label: 'Duplicate'}, {label: 'Delete'}];

  it('pointer open focuses the menu container, not the first item (items mode)', async () => {
    const user = userEvent.setup();
    render(<DropdownMenu button={{label: 'Actions'}} items={items} />);

    await user.click(screen.getByRole('button', {name: /Actions/}));

    const menu = screen.getByRole('menu', {hidden: true});
    await waitFor(() => expect(menu).toHaveFocus());
    expect(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    ).not.toHaveFocus();
  });

  it('pointer open focuses the menu container in compound mode', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuItem label="Edit" onClick={() => {}} />
        <DropdownMenuItem label="Delete" onClick={() => {}} />
      </DropdownMenu>,
    );

    await user.click(screen.getByRole('button', {name: /Actions/}));

    const menu = screen.getByRole('menu', {hidden: true});
    await waitFor(() => expect(menu).toHaveFocus());
    expect(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    ).not.toHaveFocus();
  });

  it('first ArrowDown after a pointer open moves focus to the first enabled item', async () => {
    const user = userEvent.setup();
    render(<DropdownMenu button={{label: 'Actions'}} items={items} />);

    await user.click(screen.getByRole('button', {name: /Actions/}));
    const menu = screen.getByRole('menu', {hidden: true});
    await waitFor(() => expect(menu).toHaveFocus());

    fireEvent.keyDown(menu, {key: 'ArrowDown'});
    expect(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    ).toHaveFocus();
  });

  it('ArrowDown after a pointer open skips a disabled leading item', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Edit', isDisabled: true}, {label: 'Delete'}]}
      />,
    );

    await user.click(screen.getByRole('button', {name: /Actions/}));
    const menu = screen.getByRole('menu', {hidden: true});
    await waitFor(() => expect(menu).toHaveFocus());

    fireEvent.keyDown(menu, {key: 'ArrowDown'});
    expect(
      screen.getByRole('menuitem', {name: 'Delete', hidden: true}),
    ).toHaveFocus();
  });

  it('keyboard open via Enter focuses the first enabled item', async () => {
    const user = userEvent.setup();
    render(<DropdownMenu button={{label: 'Actions'}} items={items} />);

    screen.getByRole('button', {name: /Actions/}).focus();
    await user.keyboard('{Enter}');

    await waitFor(() =>
      expect(
        screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
      ).toHaveFocus(),
    );
  });

  it('keyboard open via ArrowDown skips a disabled leading item', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Edit', isDisabled: true}, {label: 'Delete'}]}
      />,
    );

    screen.getByRole('button', {name: /Actions/}).focus();
    await user.keyboard('{ArrowDown}');

    await waitFor(() =>
      expect(
        screen.getByRole('menuitem', {name: 'Delete', hidden: true}),
      ).toHaveFocus(),
    );
  });

  it('a synthesized click (detail 0, AT activation) still focuses the first item', async () => {
    render(<DropdownMenu button={{label: 'Actions'}} items={items} />);

    // fireEvent.click dispatches a MouseEvent with detail 0 (the shape of a
    // screen reader / AT activation), so it must keep the keyboard behavior.
    fireEvent.click(screen.getByRole('button', {name: /Actions/}));

    await waitFor(() =>
      expect(
        screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
      ).toHaveFocus(),
    );
  });

  it('controlled pointer open focuses the menu container', async () => {
    function Controlled() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <DropdownMenu
          button={{label: 'Actions'}}
          items={items}
          isMenuOpen={isOpen}
          onOpenChange={setIsOpen}
        />
      );
    }
    const user = userEvent.setup();
    render(<Controlled />);

    await user.click(screen.getByRole('button', {name: /Actions/}));

    const menu = screen.getByRole('menu', {hidden: true});
    await waitFor(() => expect(menu).toHaveFocus());
    expect(
      screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
    ).not.toHaveFocus();
  });

  it('programmatic controlled open still focuses the first item', async () => {
    const {rerender} = render(
      <DropdownMenu
        button={{label: 'Actions'}}
        items={items}
        isMenuOpen={false}
        onOpenChange={() => {}}
      />,
    );

    rerender(
      <DropdownMenu
        button={{label: 'Actions'}}
        items={items}
        isMenuOpen={true}
        onOpenChange={() => {}}
      />,
    );

    await waitFor(() =>
      expect(
        screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
      ).toHaveFocus(),
    );
  });

  it('Escape still closes the menu after a pointer open', async () => {
    const user = userEvent.setup();
    render(<DropdownMenu button={{label: 'Actions'}} items={items} />);

    await user.click(screen.getByRole('button', {name: /Actions/}));
    const menu = screen.getByRole('menu', {hidden: true});
    await waitFor(() => expect(menu).toHaveFocus());

    fireEvent.keyDown(menu, {key: 'Escape'});
    expect(HTMLElement.prototype.hidePopover).toHaveBeenCalled();
  });

  it('Tab still closes the menu after a pointer open (APG menu-button)', async () => {
    const user = userEvent.setup();
    render(<DropdownMenu button={{label: 'Actions'}} items={items} />);

    await user.click(screen.getByRole('button', {name: /Actions/}));
    const menu = screen.getByRole('menu', {hidden: true});
    await waitFor(() => expect(menu).toHaveFocus());

    fireEvent.keyDown(menu, {key: 'Tab'});
    expect(HTMLElement.prototype.hidePopover).toHaveBeenCalled();
  });
});

describe('DropdownMenu data/compound parity', () => {
  it('renders an identical divider from either mode', () => {
    const {unmount} = render(
      <DropdownMenu
        button={{label: 'Actions'}}
        items={[{label: 'Edit'}, {type: 'divider'}, {label: 'Delete'}]}
      />,
    );
    const fromData = screen.getByRole('separator', {hidden: true}).outerHTML;
    unmount();

    render(
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuItem label="Edit" />
        <DropdownMenuDivider />
        <DropdownMenuItem label="Delete" />
      </DropdownMenu>,
    );
    const fromCompound = screen.getByRole('separator', {hidden: true});

    expect(fromCompound.outerHTML).toBe(fromData);
    expect(fromCompound).toHaveClass('astryx-dropdown-menu-divider');
  });

  it('skips a compound divider in the arrow-key order', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuItem label="Edit" />
        <DropdownMenuDivider />
        <DropdownMenuItem label="Delete" />
      </DropdownMenu>,
    );

    await user.tab();
    await user.keyboard('{ArrowDown}');
    const menu = screen.getByRole('menu', {hidden: true});
    await waitFor(() =>
      expect(
        screen.getByRole('menuitem', {name: 'Edit', hidden: true}),
      ).toHaveFocus(),
    );

    fireEvent.keyDown(menu, {key: 'ArrowDown'});
    expect(
      screen.getByRole('menuitem', {name: 'Delete', hidden: true}),
    ).toHaveFocus();
    expect(screen.getByRole('separator', {hidden: true})).not.toHaveFocus();
  });

  it('carries endContent and description through the items data API', () => {
    render(
      <DropdownMenu
        button={{label: 'Actions'}}
        items={[
          {
            label: 'Search',
            description: 'Find anything',
            endContent: <span data-testid="shortcut">⌘K</span>,
          },
        ]}
      />,
    );

    const item = screen.getByRole('menuitem', {hidden: true});
    expect(item).toHaveTextContent('Find anything');
    expect(item).toContainElement(screen.getByTestId('shortcut'));
  });

  it('takes a ReactNode label through the items data API', () => {
    render(
      <DropdownMenu
        button={{label: 'Actions'}}
        items={[{label: <em data-testid="rich">Rename</em>}]}
      />,
    );

    const item = screen.getByRole('menuitem', {hidden: true});
    expect(item).toContainElement(screen.getByTestId('rich'));
    // Still typeahead- and screen-reader-addressable: both read text content.
    expect(item).toHaveAccessibleName('Rename');
  });
});
