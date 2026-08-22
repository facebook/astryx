// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Menu.test.tsx
 * @input vitest, Testing Library, Menu, DropdownMenuItem, DropdownMenuSubMenu
 * @output Unit tests for the standalone menu body (#4985)
 * @position Tests; the menu container with no trigger and no layer of its own
 *
 * SYNC: When Menu.tsx changes, update these tests.
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {StrictMode, useState} from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Menu} from './Menu';
import {DropdownMenuItem} from './DropdownMenuItem';
import {DropdownMenuSubMenu} from './DropdownMenuSubMenu';

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

describe('Menu', () => {
  it('renders a named role=menu with no trigger and no dialog wrapper', () => {
    render(
      <Menu label="Models" onClose={() => {}}>
        <DropdownMenuItem label="GPT-4" />
      </Menu>,
    );

    expect(screen.getByRole('menu', {name: 'Models'})).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('closes when Tab is pressed inside it (APG menu-button)', () => {
    const onClose = vi.fn();
    render(
      <Menu label="Models" onClose={onClose}>
        <DropdownMenuItem label="GPT-4" />
      </Menu>,
    );

    fireEvent.keyDown(screen.getByRole('menu', {name: 'Models'}), {
      key: 'Tab',
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('typeahead focuses the item matching the typed character', () => {
    render(
      <Menu label="Models" onClose={() => {}}>
        <DropdownMenuItem label="Claude" />
        <DropdownMenuItem label="GPT-4" />
        <DropdownMenuItem label="Llama" />
      </Menu>,
    );

    fireEvent.keyDown(screen.getByRole('menu', {name: 'Models'}), {key: 'g'});
    expect(screen.getByRole('menuitem', {name: 'GPT-4'})).toHaveFocus();
  });

  it('Enter activates the focused item', () => {
    const onClick = vi.fn();
    render(
      <Menu label="Models" onClose={() => {}}>
        <DropdownMenuItem label="GPT-4" onClick={onClick} />
      </Menu>,
    );

    const item = screen.getByRole('menuitem', {name: 'GPT-4'});
    item.focus();
    fireEvent.keyDown(screen.getByRole('menu', {name: 'Models'}), {
      key: 'Enter',
    });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('closes the stack when a leaf item is selected', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Menu label="Models" onClose={onClose}>
        <DropdownMenuItem label="GPT-4" />
      </Menu>,
    );

    await user.click(screen.getByRole('menuitem', {name: 'GPT-4'}));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not steal focus on mount when isOpen is false', () => {
    render(
      <Menu label="Models" onClose={() => {}} isOpen={false}>
        <DropdownMenuItem label="GPT-4" />
      </Menu>,
    );

    expect(screen.getByRole('menuitem', {name: 'GPT-4'})).not.toHaveFocus();
    expect(screen.getByRole('menu', {name: 'Models'})).not.toHaveFocus();
  });

  it('focuses the first item when isOpen becomes true', async () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open
          </button>
          <Menu label="Models" onClose={() => {}} isOpen={open}>
            <DropdownMenuItem label="GPT-4" />
            <DropdownMenuItem label="Claude" />
          </Menu>
        </>
      );
    }

    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', {name: 'Open'}));
    await waitFor(() =>
      expect(screen.getByRole('menuitem', {name: 'GPT-4'})).toHaveFocus(),
    );
  });

  it('focuses the container when focusOnOpen is container', async () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open
          </button>
          <Menu
            label="Models"
            onClose={() => {}}
            isOpen={open}
            focusOnOpen="container">
            <DropdownMenuItem label="GPT-4" />
          </Menu>
        </>
      );
    }

    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', {name: 'Open'}));
    await waitFor(() =>
      expect(screen.getByRole('menu', {name: 'Models'})).toHaveFocus(),
    );
  });

  it('opens a DropdownMenuSubMenu flyout as its own top-layer element', async () => {
    const user = userEvent.setup();
    render(
      <Menu label="Models" onClose={() => {}}>
        <DropdownMenuItem label="GPT-4" />
        <DropdownMenuSubMenu label="More models">
          <DropdownMenuItem label="Fable 5" />
        </DropdownMenuSubMenu>
      </Menu>,
    );

    await user.click(screen.getByRole('menuitem', {name: /More models/}));
    await waitFor(() => {
      expect(
        screen.getByRole('menuitem', {name: /More models/}),
      ).toHaveAttribute('aria-expanded', 'true');
    });

    const flyoutItem = screen.getByRole('menuitem', {
      name: 'Fable 5',
      hidden: true,
    });
    const flyout = flyoutItem.closest('[role="menu"]');
    expect(flyout?.closest('[popover]')).not.toBeNull();
    expect(flyout?.closest('[popover]')).toHaveAttribute('popover', 'manual');
  });
});

describe('Menu focus-on-open fallbacks', () => {
  function Harness({children}: {children?: React.ReactNode}) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(o => !o)}>
          Toggle
        </button>
        <Menu label="Models" onClose={() => setOpen(false)} isOpen={open}>
          {children}
        </Menu>
      </>
    );
  }

  it('focuses the container when every item is disabled', async () => {
    const user = userEvent.setup();
    render(
      <Harness>
        <DropdownMenuItem label="GPT-4" isDisabled />
        <DropdownMenuItem label="Claude" isDisabled />
      </Harness>,
    );

    await user.click(screen.getByRole('button', {name: 'Toggle'}));
    await waitFor(() =>
      expect(screen.getByRole('menu', {name: 'Models'})).toHaveFocus(),
    );
  });

  it('focuses the container when the menu has no items at all', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', {name: 'Toggle'}));
    await waitFor(() =>
      expect(screen.getByRole('menu', {name: 'Models'})).toHaveFocus(),
    );
  });

  it('skips a disabled leading item', async () => {
    const user = userEvent.setup();
    render(
      <Harness>
        <DropdownMenuItem label="GPT-4" isDisabled />
        <DropdownMenuItem label="Claude" />
      </Harness>,
    );

    await user.click(screen.getByRole('button', {name: 'Toggle'}));
    await waitFor(() =>
      expect(screen.getByRole('menuitem', {name: 'Claude'})).toHaveFocus(),
    );
  });

  it('re-focuses the first item on every reopen', async () => {
    const user = userEvent.setup();
    render(
      <Harness>
        <DropdownMenuItem label="GPT-4" />
        <DropdownMenuItem label="Claude" />
      </Harness>,
    );

    const toggle = screen.getByRole('button', {name: 'Toggle'});
    await user.click(toggle);
    await waitFor(() =>
      expect(screen.getByRole('menuitem', {name: 'GPT-4'})).toHaveFocus(),
    );

    // Move the roving focus, then close and reopen.
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', {name: 'Claude'})).toHaveFocus();
    await user.click(toggle);
    await user.click(toggle);

    await waitFor(() =>
      expect(screen.getByRole('menuitem', {name: 'GPT-4'})).toHaveFocus(),
    );
  });

  it('does not pull focus when the ancestor layer closed before the focus frame', async () => {
    // Light dismiss can close the layer between the isOpen flip and the frame
    // that moves focus. Stealing focus back then would yank it off the trigger.
    function ClosedLayer() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open
          </button>
          {/* Never gets `popover-open` — i.e. the layer is not showing. */}
          <div popover="auto" data-testid="layer">
            <Menu label="Models" onClose={() => {}} isOpen={open}>
              <DropdownMenuItem label="GPT-4" />
            </Menu>
          </div>
        </>
      );
    }

    const user = userEvent.setup();
    render(<ClosedLayer />);
    const open = screen.getByRole('button', {name: 'Open'});
    await user.click(open);
    await new Promise(resolve => {
      requestAnimationFrame(() => resolve(null));
    });

    expect(
      screen.getByRole('menuitem', {name: 'GPT-4', hidden: true}),
    ).not.toHaveFocus();
    expect(open).toHaveFocus();
  });
});

describe('Menu keyboard', () => {
  it('Escape closes the menu', () => {
    const onClose = vi.fn();
    render(
      <Menu label="Models" onClose={onClose}>
        <DropdownMenuItem label="GPT-4" />
      </Menu>,
    );

    fireEvent.keyDown(screen.getByRole('menu', {name: 'Models'}), {
      key: 'Escape',
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('arrow navigation stops at both ends instead of wrapping', () => {
    render(
      <Menu label="Models" onClose={() => {}}>
        <DropdownMenuItem label="Alpha" />
        <DropdownMenuItem label="Beta" />
      </Menu>,
    );

    const menu = screen.getByRole('menu', {name: 'Models'});
    screen.getByRole('menuitem', {name: 'Alpha'}).focus();

    fireEvent.keyDown(menu, {key: 'ArrowUp'});
    expect(screen.getByRole('menuitem', {name: 'Alpha'})).toHaveFocus();

    fireEvent.keyDown(menu, {key: 'ArrowDown'});
    expect(screen.getByRole('menuitem', {name: 'Beta'})).toHaveFocus();

    fireEvent.keyDown(menu, {key: 'ArrowDown'});
    expect(screen.getByRole('menuitem', {name: 'Beta'})).toHaveFocus();
  });

  it('Home and End jump to the first and last item', () => {
    render(
      <Menu label="Models" onClose={() => {}}>
        <DropdownMenuItem label="Alpha" />
        <DropdownMenuItem label="Beta" />
        <DropdownMenuItem label="Gamma" />
      </Menu>,
    );

    const menu = screen.getByRole('menu', {name: 'Models'});
    screen.getByRole('menuitem', {name: 'Alpha'}).focus();

    fireEvent.keyDown(menu, {key: 'End'});
    expect(screen.getByRole('menuitem', {name: 'Gamma'})).toHaveFocus();

    fireEvent.keyDown(menu, {key: 'Home'});
    expect(screen.getByRole('menuitem', {name: 'Alpha'})).toHaveFocus();
  });

  it('typeahead skips disabled items', () => {
    render(
      <Menu label="Models" onClose={() => {}}>
        <DropdownMenuItem label="Claude" />
        <DropdownMenuItem label="Gemini" isDisabled />
        <DropdownMenuItem label="GPT-4" />
      </Menu>,
    );

    fireEvent.keyDown(screen.getByRole('menu', {name: 'Models'}), {key: 'g'});
    expect(screen.getByRole('menuitem', {name: 'GPT-4'})).toHaveFocus();
  });

  it('ignores key events that belong to a nested flyout', async () => {
    // A submenu flyout renders inline, so its key events bubble here. Only the
    // level that owns the event may act on it, or focus moves twice.
    const user = userEvent.setup();
    render(
      <Menu label="Models" onClose={() => {}}>
        <DropdownMenuItem label="Alpha" />
        <DropdownMenuSubMenu label="More">
          <DropdownMenuItem label="Zeta" />
        </DropdownMenuSubMenu>
      </Menu>,
    );

    await user.click(screen.getByRole('menuitem', {name: /More/}));
    await waitFor(() =>
      expect(screen.getByRole('menuitem', {name: /More/})).toHaveAttribute(
        'aria-expanded',
        'true',
      ),
    );

    const flyoutItem = screen.getByRole('menuitem', {
      name: 'Zeta',
      hidden: true,
    });
    flyoutItem.focus();
    // "Alpha" only exists in the parent menu — typeahead there must not fire.
    fireEvent.keyDown(flyoutItem, {key: 'a'});

    expect(screen.getByRole('menuitem', {name: 'Alpha'})).not.toHaveFocus();
  });

  it('runs a consumer onKeyDown alongside menu navigation', () => {
    // `onKeyDown` is part of BaseProps, so the type says it works. It has to.
    const onKeyDown = vi.fn();
    render(
      <Menu label="Models" onClose={() => {}} onKeyDown={onKeyDown}>
        <DropdownMenuItem label="Alpha" />
        <DropdownMenuItem label="Beta" />
      </Menu>,
    );

    const menu = screen.getByRole('menu', {name: 'Models'});
    screen.getByRole('menuitem', {name: 'Alpha'}).focus();
    fireEvent.keyDown(menu, {key: 'ArrowDown'});

    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('menuitem', {name: 'Beta'})).toHaveFocus();
  });

  it('lets a consumer opt out of menu navigation with preventDefault', () => {
    render(
      <Menu
        label="Models"
        onClose={() => {}}
        onKeyDown={event => event.preventDefault()}>
        <DropdownMenuItem label="Alpha" />
        <DropdownMenuItem label="Beta" />
      </Menu>,
    );

    const menu = screen.getByRole('menu', {name: 'Models'});
    screen.getByRole('menuitem', {name: 'Alpha'}).focus();
    fireEvent.keyDown(menu, {key: 'ArrowDown'});

    expect(screen.getByRole('menuitem', {name: 'Alpha'})).toHaveFocus();
  });

  it('keeps role="menu" even if a consumer passes another role', () => {
    // `role` reaches Menu through BaseProps' rest spread, so prop order in the
    // container is what protects the menu's identity.
    render(
      <Menu label="Models" onClose={() => {}} role="listbox">
        <DropdownMenuItem label="GPT-4" />
      </Menu>,
    );

    expect(screen.getByRole('menu', {name: 'Models'})).toBeInTheDocument();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});

describe('Menu focus-on-open is idempotent', () => {
  // React double-invokes mount effects under StrictMode (and re-runs effects
  // on Fast Refresh / Activity). The open-transition bookkeeping has to
  // survive that, or the default `isOpen` (true — a Menu mounted into an
  // already-open surface) is the one path that never gets focus.
  it('focuses the first item when mounted already open under StrictMode', async () => {
    render(
      <StrictMode>
        <Menu label="Models" onClose={() => {}}>
          <DropdownMenuItem label="GPT-4" />
          <DropdownMenuItem label="Claude" />
        </Menu>
      </StrictMode>,
    );

    await waitFor(() =>
      expect(screen.getByRole('menuitem', {name: 'GPT-4'})).toHaveFocus(),
    );
  });

  it('focuses the container when mounted already open with no enabled item', async () => {
    render(
      <StrictMode>
        <Menu label="Models" onClose={() => {}}>
          <DropdownMenuItem label="GPT-4" isDisabled />
        </Menu>
      </StrictMode>,
    );

    await waitFor(() =>
      expect(screen.getByRole('menu', {name: 'Models'})).toHaveFocus(),
    );
  });

  it('focuses the first item on an isOpen transition under StrictMode', async () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open
          </button>
          <Menu label="Models" onClose={() => {}} isOpen={open}>
            <DropdownMenuItem label="GPT-4" />
          </Menu>
        </>
      );
    }

    const user = userEvent.setup();
    render(
      <StrictMode>
        <Harness />
      </StrictMode>,
    );
    await user.click(screen.getByRole('button', {name: 'Open'}));
    await waitFor(() =>
      expect(screen.getByRole('menuitem', {name: 'GPT-4'})).toHaveFocus(),
    );
  });

  it('does not re-steal focus when props change while already open', async () => {
    function Harness() {
      const [size, setSize] = useState<'md' | 'sm'>('md');
      return (
        <>
          <button type="button" onClick={() => setSize('sm')}>
            Shrink
          </button>
          <Menu label="Models" onClose={() => {}} size={size}>
            <DropdownMenuItem label="GPT-4" />
            <DropdownMenuItem label="Claude" />
          </Menu>
        </>
      );
    }

    const user = userEvent.setup();
    render(<Harness />);
    await waitFor(() =>
      expect(screen.getByRole('menuitem', {name: 'GPT-4'})).toHaveFocus(),
    );

    const shrink = screen.getByRole('button', {name: 'Shrink'});
    screen.getByRole('menuitem', {name: 'Claude'}).focus();
    await user.click(shrink);
    await new Promise(resolve => {
      requestAnimationFrame(() => resolve(null));
    });

    // Focus stays where the user left it — a prop change is not a re-open.
    expect(screen.getByRole('menuitem', {name: 'GPT-4'})).not.toHaveFocus();
  });
});
