// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DropdownMenuSubMenu.test.tsx
 * @input vitest, @testing-library/react, DropdownMenu + DropdownMenuSubMenu
 * @output Unit tests for DropdownMenuSubMenu (#3829)
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {useState} from 'react';
import {render, screen, waitFor, fireEvent, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {DropdownMenu} from './DropdownMenu';
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

function MoveMenu({onMove}: {onMove?: (folder: string) => void} = {}) {
  return (
    <DropdownMenu button={{label: 'Actions'}}>
      <DropdownMenuItem label="Rename" onClick={() => {}} />
      <DropdownMenuSubMenu label="Move to">
        <DropdownMenuItem label="Folder A" onClick={() => onMove?.('a')} />
        <DropdownMenuItem label="Folder B" onClick={() => onMove?.('b')} />
      </DropdownMenuSubMenu>
    </DropdownMenu>
  );
}

describe('DropdownMenuSubMenu', () => {
  it('renders the trigger with aria-haspopup and collapsed aria-expanded', async () => {
    const user = userEvent.setup();
    render(<MoveMenu />);
    await user.click(screen.getByRole('button', {name: /Actions/}));
    const trigger = screen.getByRole('menuitem', {
      name: /Move to/,
      hidden: true,
    });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens the flyout on trigger click and exposes its items', async () => {
    const user = userEvent.setup();
    render(<MoveMenu />);
    await user.click(screen.getByRole('button', {name: /Actions/}));
    const trigger = screen.getByRole('menuitem', {
      name: /Move to/,
      hidden: true,
    });
    await user.click(trigger);
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
    expect(
      screen.getByRole('menuitem', {name: 'Folder A', hidden: true}),
    ).toBeInTheDocument();
  });

  it('opens on ArrowRight and returns focus to the trigger on ArrowLeft', async () => {
    const user = userEvent.setup();
    render(<MoveMenu />);
    await user.click(screen.getByRole('button', {name: /Actions/}));
    const trigger = screen.getByRole('menuitem', {
      name: /Move to/,
      hidden: true,
    });
    // A pointer open focuses the menu container via rAF (#4477); wait for
    // that to settle before moving focus to the submenu trigger, so the
    // deferred focus can't steal it back mid-test.
    await waitFor(() => {
      expect(
        screen.getByRole('menu', {name: 'Actions', hidden: true}),
      ).toHaveFocus();
    });
    trigger.focus();
    await user.keyboard('{ArrowRight}');
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
    // Focus moved into the flyout's first item.
    await waitFor(() => {
      expect(
        screen.getByRole('menuitem', {name: 'Folder A', hidden: true}),
      ).toHaveFocus();
    });
    await user.keyboard('{ArrowLeft}');
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
    expect(trigger).toHaveFocus();
  });

  it('names the flyout from its trigger via aria-labelledby', async () => {
    const user = userEvent.setup();
    render(<MoveMenu />);
    await user.click(screen.getByRole('button', {name: /Actions/}));
    const trigger = screen.getByRole('menuitem', {
      name: /Move to/,
      hidden: true,
    });
    await user.click(trigger);
    const flyout = await screen.findByRole('menu', {
      name: /Move to/,
      hidden: true,
    });
    expect(flyout).toHaveAttribute('aria-labelledby', trigger.id);
  });

  it('invokes the nested item handler on selection', async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    render(<MoveMenu onMove={onMove} />);
    await user.click(screen.getByRole('button', {name: /Actions/}));
    await user.click(
      screen.getByRole('menuitem', {name: /Move to/, hidden: true}),
    );
    await user.click(
      await screen.findByRole('menuitem', {name: 'Folder A', hidden: true}),
    );
    expect(onMove).toHaveBeenCalledWith('a');
  });

  it('closes the whole menu after selecting a nested item', async () => {
    // Regression: the nested closeMenu only closed the flyout, leaving the
    // root menu open. Selecting a leaf must dismiss the entire stack. The root
    // menu's open state is reflected on its trigger button's aria-expanded.
    const user = userEvent.setup();
    render(<MoveMenu />);
    const button = screen.getByRole('button', {name: /Actions/});
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    await user.click(
      screen.getByRole('menuitem', {name: /Move to/, hidden: true}),
    );
    await user.click(
      await screen.findByRole('menuitem', {name: 'Folder A', hidden: true}),
    );
    // The whole stack is dismissed — the root menu closed too.
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('activates a nested item with the Enter key and closes the menu', async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    render(<MoveMenu onMove={onMove} />);
    const button = screen.getByRole('button', {name: /Actions/});
    await user.click(button);
    const trigger = screen.getByRole('menuitem', {
      name: /Move to/,
      hidden: true,
    });
    // Let the root menu's pointer-open focus (the container, via rAF) settle
    // before moving focus to the submenu trigger, so it can't steal focus
    // back mid-test.
    await waitFor(() => {
      expect(
        screen.getByRole('menu', {name: 'Actions', hidden: true}),
      ).toHaveFocus();
    });
    trigger.focus();
    await user.keyboard('{ArrowRight}');
    await waitFor(() => {
      expect(
        screen.getByRole('menuitem', {name: 'Folder A', hidden: true}),
      ).toHaveFocus();
    });
    await user.keyboard('{Enter}');
    expect(onMove).toHaveBeenCalledWith('a');
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('does not open a disabled submenu', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuSubMenu label="Move to" isDisabled>
          <DropdownMenuItem label="Folder A" onClick={() => {}} />
        </DropdownMenuSubMenu>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', {name: /Actions/}));
    const trigger = screen.getByRole('menuitem', {
      name: /Move to/,
      hidden: true,
    });
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('steps through every flyout item with ArrowDown without skipping', async () => {
    // Regression: the flyout renders inline inside the parent menu's
    // roving-focus container, so an unstopped ArrowDown bubbled to the parent
    // and moved focus a second time — skipping the middle item.
    const user = userEvent.setup();
    render(
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuSubMenu label="Move to">
          <DropdownMenuItem label="Projects" onClick={() => {}} />
          <DropdownMenuItem label="Archive" onClick={() => {}} />
          <DropdownMenuItem label="Trash" onClick={() => {}} />
        </DropdownMenuSubMenu>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', {name: /Actions/}));
    const trigger = screen.getByRole('menuitem', {
      name: /Move to/,
      hidden: true,
    });
    // Let the pointer-open container focus (rAF, #4477) settle so it can't
    // steal focus from the manually focused trigger mid-test.
    await waitFor(() => {
      expect(
        screen.getByRole('menu', {name: 'Actions', hidden: true}),
      ).toHaveFocus();
    });
    trigger.focus();
    await user.keyboard('{ArrowRight}');
    // Opens and focuses the first item.
    await waitFor(() => {
      expect(
        screen.getByRole('menuitem', {name: 'Projects', hidden: true}),
      ).toHaveFocus();
    });
    // ArrowDown lands on the MIDDLE item (previously skipped to Trash).
    await user.keyboard('{ArrowDown}');
    await waitFor(() => {
      expect(
        screen.getByRole('menuitem', {name: 'Archive', hidden: true}),
      ).toHaveFocus();
    });
    // ArrowDown again lands on the last item.
    await user.keyboard('{ArrowDown}');
    await waitFor(() => {
      expect(
        screen.getByRole('menuitem', {name: 'Trash', hidden: true}),
      ).toHaveFocus();
    });
    // ArrowUp returns to the middle item (no skip in reverse either).
    await user.keyboard('{ArrowUp}');
    await waitFor(() => {
      expect(
        screen.getByRole('menuitem', {name: 'Archive', hidden: true}),
      ).toHaveFocus();
    });
  });
});

describe('DropdownMenu data-driven submenus', () => {
  it('renders a submenu when an item declares nested items', async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    render(
      <DropdownMenu
        button={{label: 'Actions'}}
        items={[
          {label: 'Rename', onClick: () => {}},
          {
            label: 'Move to',
            items: [
              {
                label: 'Folder A',
                onClick: () => {
                  onMove('a');
                },
              },
              {
                label: 'Folder B',
                onClick: () => {
                  onMove('b');
                },
              },
            ],
          },
        ]}
      />,
    );
    await user.click(screen.getByRole('button', {name: /Actions/}));
    const trigger = screen.getByRole('menuitem', {
      name: /Move to/,
      hidden: true,
    });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    await user.click(trigger);
    await user.click(
      await screen.findByRole('menuitem', {name: 'Folder B', hidden: true}),
    );
    expect(onMove).toHaveBeenCalledWith('b');
  });

  it('keyboard-reaches an item positioned after a submenu row', async () => {
    // Regression: the submenu flyout renders inline inside the root menu, so
    // the root's item query swept in the (hidden) flyout items. Arrow nav then
    // stalled on those unfocusable items and never reached "Delete" below the
    // submenu row.
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <DropdownMenu
        button={{label: 'Actions'}}
        items={[
          {label: 'Rename', onClick: () => {}},
          {
            label: 'Move to',
            items: [
              {label: 'Folder A', onClick: () => {}},
              {label: 'Folder B', onClick: () => {}},
            ],
          },
          {type: 'divider'},
          {label: 'Delete', onClick: onDelete},
        ]}
      />,
    );
    await user.click(screen.getByRole('button', {name: /Actions/}));
    // Pointer open focuses the container (#4477); the first ArrowDown then
    // moves onto Rename.
    await waitFor(() => {
      expect(
        screen.getByRole('menu', {name: 'Actions', hidden: true}),
      ).toHaveFocus();
    });
    await user.keyboard('{ArrowDown}');
    await waitFor(() => {
      expect(
        screen.getByRole('menuitem', {name: 'Rename', hidden: true}),
      ).toHaveFocus();
    });
    // Rename → Move to → Delete (no stalling on hidden flyout items).
    await user.keyboard('{ArrowDown}');
    await waitFor(() => {
      expect(
        screen.getByRole('menuitem', {name: /Move to/, hidden: true}),
      ).toHaveFocus();
    });
    await user.keyboard('{ArrowDown}');
    await waitFor(() => {
      expect(
        screen.getByRole('menuitem', {name: 'Delete', hidden: true}),
      ).toHaveFocus();
    });
    await user.keyboard('{Enter}');
    expect(onDelete).toHaveBeenCalled();
  });
});

describe('DropdownMenuSubMenu accessibility (WCAG 2.2 / APG)', () => {
  // 2.1.2 No Keyboard Trap + APG submenu contract: Escape closes the current
  // submenu and returns focus to its trigger, leaving the parent menu open.
  it('closes only the submenu on Escape and restores focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<MoveMenu />);
    const button = screen.getByRole('button', {name: /Actions/});
    await user.click(button);
    const trigger = screen.getByRole('menuitem', {
      name: /Move to/,
      hidden: true,
    });
    await waitFor(() => {
      expect(
        screen.getByRole('menu', {name: 'Actions', hidden: true}),
      ).toHaveFocus();
    });
    trigger.focus();
    await user.keyboard('{ArrowRight}');
    await waitFor(() => {
      expect(
        screen.getByRole('menuitem', {name: 'Folder A', hidden: true}),
      ).toHaveFocus();
    });
    await user.keyboard('{Escape}');
    // Submenu collapsed, focus back on the trigger…
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
    expect(trigger).toHaveFocus();
    // …but the parent menu is still open (Escape didn't dismiss everything).
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  // 2.1.1 Keyboard: type-ahead is operable inside the flyout.
  it('supports first-character type-ahead within the flyout', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuSubMenu label="Move to">
          <DropdownMenuItem label="Apple" onClick={() => {}} />
          <DropdownMenuItem label="Banana" onClick={() => {}} />
          <DropdownMenuItem label="Cherry" onClick={() => {}} />
        </DropdownMenuSubMenu>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', {name: /Actions/}));
    const trigger = screen.getByRole('menuitem', {
      name: /Move to/,
      hidden: true,
    });
    // Let the pointer-open container focus (rAF, #4477) settle so it can't
    // steal focus from the manually focused trigger mid-test.
    await waitFor(() => {
      expect(
        screen.getByRole('menu', {name: 'Actions', hidden: true}),
      ).toHaveFocus();
    });
    trigger.focus();
    await user.keyboard('{ArrowRight}');
    await waitFor(() => {
      expect(
        screen.getByRole('menuitem', {name: 'Apple', hidden: true}),
      ).toHaveFocus();
    });
    await user.keyboard('c');
    await waitFor(() => {
      expect(
        screen.getByRole('menuitem', {name: 'Cherry', hidden: true}),
      ).toHaveFocus();
    });
  });

  // The core of the inline-flyout fix: a submenu nested inside a submenu must
  // not double-handle arrow keys (each level self-scopes via boundarySelector),
  // so navigation in the deepest flyout steps one item at a time.
  it('navigates a two-level nested submenu without double-stepping', async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();
    render(
      <DropdownMenu button={{label: 'Share'}}>
        <DropdownMenuItem label="Copy link" onClick={() => {}} />
        <DropdownMenuSubMenu label="Share to">
          <DropdownMenuItem label="Email" onClick={() => {}} />
          <DropdownMenuSubMenu label="Team">
            <DropdownMenuItem
              label="Design"
              onClick={() => {
                onPick('design');
              }}
            />
            <DropdownMenuItem
              label="Eng"
              onClick={() => {
                onPick('eng');
              }}
            />
            <DropdownMenuItem
              label="Data"
              onClick={() => {
                onPick('data');
              }}
            />
          </DropdownMenuSubMenu>
        </DropdownMenuSubMenu>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', {name: /Share/}));
    const shareTo = screen.getByRole('menuitem', {
      name: /Share to/,
      hidden: true,
    });
    // Let the root menu's pointer-open focus (the container, via rAF, #4477)
    // settle first so it can't steal focus back after we move to the submenu
    // trigger.
    await waitFor(() => {
      expect(
        screen.getByRole('menu', {name: 'Share', hidden: true}),
      ).toHaveFocus();
    });
    shareTo.focus();
    await user.keyboard('{ArrowRight}');
    // First flyout: focus on Email.
    await waitFor(() => {
      expect(
        screen.getByRole('menuitem', {name: 'Email', hidden: true}),
      ).toHaveFocus();
    });
    // Down to the nested submenu trigger, then open it.
    await user.keyboard('{ArrowDown}');
    const teamTrigger = screen.getByRole('menuitem', {
      name: /Team/,
      hidden: true,
    });
    await waitFor(() => {
      expect(teamTrigger).toHaveFocus();
    });
    await user.keyboard('{ArrowRight}');
    // Deepest flyout: Design → Eng → Data, one step per press (no skipping).
    await waitFor(() => {
      expect(
        screen.getByRole('menuitem', {name: 'Design', hidden: true}),
      ).toHaveFocus();
    });
    await user.keyboard('{ArrowDown}');
    await waitFor(() => {
      expect(
        screen.getByRole('menuitem', {name: 'Eng', hidden: true}),
      ).toHaveFocus();
    });
    await user.keyboard('{ArrowDown}');
    await waitFor(() => {
      expect(
        screen.getByRole('menuitem', {name: 'Data', hidden: true}),
      ).toHaveFocus();
    });
    await user.keyboard('{Enter}');
    expect(onPick).toHaveBeenCalledWith('data');
  });

  // Regression: hovering the submenu trigger while a sibling item still holds
  // focus must move the single focus-driven highlight onto the trigger — not
  // leave two items highlighted at once (the trigger via :hover, the sibling
  // via :focus). Mirrors DropdownMenuItem's hover-focus behavior.
  it('moves focus to the submenu trigger on hover, keeping a single highlight', async () => {
    const user = userEvent.setup();
    render(<MoveMenu />);
    await user.click(screen.getByRole('button', {name: /Actions/}));

    const rename = screen.getByRole('menuitem', {
      name: 'Rename',
      hidden: true,
    });
    const trigger = screen.getByRole('menuitem', {
      name: /Move to/,
      hidden: true,
    });

    rename.focus();
    expect(rename).toHaveFocus();

    // A mouse hover over the submenu trigger moves focus onto it, so the single
    // focus-driven highlight follows the pointer instead of leaving two.
    fireEvent.pointerMove(trigger, {pointerType: 'mouse'});
    expect(trigger).toHaveFocus();
    expect(rename).not.toHaveFocus();
  });

  // 1.4.13 Content on Hover or Focus: the flyout stays open while the pointer
  // is over it (moving onto the flyout must not dismiss it).
  it('keeps the flyout open while the pointer is over it', async () => {
    const user = userEvent.setup();
    render(<MoveMenu />);
    await user.click(screen.getByRole('button', {name: /Actions/}));
    const trigger = screen.getByRole('menuitem', {
      name: /Move to/,
      hidden: true,
    });
    await user.click(trigger);
    const flyout = await screen.findByRole('menu', {
      name: /Move to/,
      hidden: true,
    });
    await user.hover(flyout);
    await user.hover(
      screen.getByRole('menuitem', {name: 'Folder A', hidden: true}),
    );
    // Still open after moving the pointer onto the flyout and its items.
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  // Async/loading submenu (hasSpinner): the flyout may contain no focusable
  // items yet (only a disabled "Loading…" row). Opening it must still move
  // keyboard ownership INTO the flyout — otherwise focus stays on the parent
  // list, arrow keys rove the parent while the empty flyout stays open, and
  // Enter re-triggers into a broken state.
  it('moves focus into a loading (item-less) flyout so keyboard ownership transfers', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuItem label="Rename" onClick={() => {}} />
        <DropdownMenuSubMenu label="Move to" hasSpinner>
          <DropdownMenuItem label="Loading…" isDisabled onClick={() => {}} />
        </DropdownMenuSubMenu>
        <DropdownMenuItem label="Delete" onClick={() => {}} />
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', {name: /Actions/}));
    const trigger = screen.getByRole('menuitem', {
      name: /Move to/,
      hidden: true,
    });
    await waitFor(() => {
      expect(
        screen.getByRole('menu', {name: 'Actions', hidden: true}),
      ).toHaveFocus();
    });
    trigger.focus();
    await user.keyboard('{ArrowRight}');
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
    // The flyout has no focusable items, so focus lands on the flyout container
    // itself — NOT on a parent item (Rename/Delete).
    const flyout = screen.getByRole('menu', {name: /Move to/, hidden: true});
    await waitFor(() => {
      expect(flyout).toHaveFocus();
    });
    expect(
      screen.getByRole('menuitem', {name: 'Rename', hidden: true}),
    ).not.toHaveFocus();
    expect(
      screen.getByRole('menuitem', {name: 'Delete', hidden: true}),
    ).not.toHaveFocus();
    // Left/Escape from the loading flyout closes it and returns to the trigger.
    await user.keyboard('{ArrowLeft}');
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
    expect(trigger).toHaveFocus();
  });

  it('roves to the first item once a loading flyout resolves', async () => {
    // After children load, ArrowDown from the focused container moves onto the
    // first real item (container reports index -1, so next = first).
    const user = userEvent.setup();
    function AsyncSubmenu() {
      const [loaded, setLoaded] = useState(false);
      return (
        <DropdownMenu button={{label: 'Actions'}}>
          <DropdownMenuSubMenu
            label="Move to"
            hasSpinner={!loaded}
            onOpenChange={open => {
              if (open) {
                setLoaded(true);
              }
            }}>
            {loaded ? (
              <>
                <DropdownMenuItem label="Folder A" onClick={() => {}} />
                <DropdownMenuItem label="Folder B" onClick={() => {}} />
              </>
            ) : (
              <DropdownMenuItem
                label="Loading…"
                isDisabled
                onClick={() => {}}
              />
            )}
          </DropdownMenuSubMenu>
        </DropdownMenu>
      );
    }
    render(<AsyncSubmenu />);
    await user.click(screen.getByRole('button', {name: /Actions/}));
    const trigger = screen.getByRole('menuitem', {
      name: /Move to/,
      hidden: true,
    });
    // Let the pointer-open container focus (rAF, #4477) settle so it can't
    // steal focus from the manually focused trigger mid-test.
    await waitFor(() => {
      expect(
        screen.getByRole('menu', {name: 'Actions', hidden: true}),
      ).toHaveFocus();
    });
    trigger.focus();
    await user.keyboard('{ArrowRight}');
    // Children resolve on open; ArrowDown moves from the container to Folder A.
    await user.keyboard('{ArrowDown}');
    await waitFor(() => {
      expect(
        screen.getByRole('menuitem', {name: 'Folder A', hidden: true}),
      ).toHaveFocus();
    });
  });
});

describe('DropdownMenuSubMenu theming slots', () => {
  it('exposes a themeable slot on the submenu indicator icon', async () => {
    const user = userEvent.setup();
    render(<MoveMenu />);
    await user.click(screen.getByRole('button', {name: /Actions/}));
    const trigger = screen.getByRole('menuitem', {
      name: /Move to/,
      hidden: true,
    });
    // The indicator-icon slot sits on the chevron glyph itself (the element
    // that carries the icon size), so a theme can restyle its size/color
    // directly.
    const indicator = trigger.querySelector(
      '.astryx-dropdown-menu-indicator-icon',
    );
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('astryx-icon');
  });
});

describe('DropdownMenuSubMenu hover/click guard', () => {
  it('keeps the flyout open when a hover-open is immediately clicked', async () => {
    vi.useFakeTimers({shouldAdvanceTime: true});
    const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
    render(<MoveMenu />);

    await user.click(screen.getByRole('button', {name: /Actions/}));
    const trigger = screen.getByRole('menuitem', {
      name: /Move to/,
      hidden: true,
    });

    await user.hover(trigger);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('menuitem', {name: 'Folder A', hidden: true}),
    ).toHaveFocus();

    vi.useRealTimers();
  });

  it('closes on a click that lands well after the hover-open', async () => {
    vi.useFakeTimers({shouldAdvanceTime: true});
    const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
    render(<MoveMenu />);

    await user.click(screen.getByRole('button', {name: /Actions/}));
    const trigger = screen.getByRole('menuitem', {
      name: /Move to/,
      hidden: true,
    });

    await user.hover(trigger);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    act(() => {
      vi.advanceTimersByTime(1200);
    });

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    vi.useRealTimers();
  });

  it('moves focus into the flyout synchronously on a click-open', async () => {
    const user = userEvent.setup();
    render(<MoveMenu />);

    await user.click(screen.getByRole('button', {name: /Actions/}));
    const trigger = screen.getByRole('menuitem', {
      name: /Move to/,
      hidden: true,
    });

    await user.click(trigger);

    // No waitFor: a deferred (rAF) focus would fail here.
    expect(
      screen.getByRole('menuitem', {name: 'Folder A', hidden: true}),
    ).toHaveFocus();
  });
});
