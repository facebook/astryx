// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DropdownMenuSubMenu.test.tsx
 * @input vitest, @testing-library/react, DropdownMenu + DropdownMenuSubMenu
 * @output Unit tests for DropdownMenuSubMenu (#3829)
 */

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {useState} from 'react';
import {render, screen, waitFor, fireEvent, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as stylex from '@stylexjs/stylex';
import {DropdownMenu} from './DropdownMenu';
import {DropdownMenuItem} from './DropdownMenuItem';
import {DropdownMenuSubMenu} from './DropdownMenuSubMenu';
import {COMPACT_TOUCH_PRESENTATION_QUERY} from '../hooks/useAdaptivePresentation';
import {rtlStyles} from '../utils';

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

  it('caps the flyout width and height to the available viewport', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuSubMenu label="Move to" menuWidth={640}>
          <DropdownMenuItem label="Folder A" onClick={() => {}} />
        </DropdownMenuSubMenu>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', {name: /Actions/}));
    const trigger = screen.getByRole('menuitem', {
      name: /Move to/,
      hidden: true,
    });
    await user.click(trigger);

    const flyout = screen.getByRole('menu', {name: /Move to/, hidden: true});
    const popover = flyout.closest('[popover]');
    expect(popover?.className).toContain(
      'DropdownMenuSubMenu__flyoutStyles.popoverViewport',
    );
    expect(popover).not.toHaveStyle(
      'margin-inline-start: max(var(--spacing-2),env(safe-area-inset-left,0px))',
    );
    expect(popover).not.toHaveStyle(
      'margin-inline-end: max(var(--spacing-2),env(safe-area-inset-right,0px))',
    );
    expect(popover).toHaveStyle({minWidth: 'var(--x-minWidth)'});
    expect(popover?.getAttribute('style')).toContain('min(640px, calc(100vw');
    expect(flyout).toHaveStyle(
      'max-height: min(300px,calc(100dvb - calc(max(var(--spacing-4), env(safe-area-inset-top, 0px)) + var(--astryx-layer-inset-block-start, 0px)) - calc(max(var(--spacing-4), env(safe-area-inset-bottom, 0px)) + var(--astryx-layer-inset-block-end, 0px))))',
    );
    expect(flyout).not.toHaveStyle({overflowY: 'auto'});
    expect(flyout).toHaveAttribute('tabindex', '-1');

    Object.defineProperties(flyout, {
      clientHeight: {configurable: true, value: 300},
      scrollHeight: {configurable: true, value: 480},
    });
    fireEvent(window, new Event('resize'));

    await waitFor(() => {
      expect(flyout).toHaveStyle({overflowY: 'auto'});
      expect(flyout).toHaveAttribute('tabindex', '0');
    });
  });

  it.each(['max-content', 'fit-content', 'auto'])(
    'preserves the valid %s flyout width while retaining the viewport cap',
    async menuWidth => {
      const user = userEvent.setup();
      render(
        <DropdownMenu button={{label: 'Actions'}}>
          <DropdownMenuSubMenu label="Move to" menuWidth={menuWidth}>
            <DropdownMenuItem label="Folder A" onClick={() => {}} />
          </DropdownMenuSubMenu>
        </DropdownMenu>,
      );
      await user.click(screen.getByRole('button', {name: /Actions/}));
      await user.click(
        screen.getByRole('menuitem', {name: /Move to/, hidden: true}),
      );

      const flyout = screen.getByRole('menu', {name: /Move to/, hidden: true});
      const popover = flyout.closest('[popover]');
      expect(popover?.className).toContain(
        'DropdownMenuSubMenu__flyoutStyles.popoverCustomIntrinsicWidth',
      );
      expect(popover?.getAttribute('style')).toContain(menuWidth);
      expect(popover?.className).toContain(
        'DropdownMenuSubMenu__flyoutStyles.popoverViewport',
      );
      expect(popover?.getAttribute('style')).not.toContain(`min(${menuWidth},`);
    },
  );

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

  it('mirrors its indicator and keyboard directions under RTL', async () => {
    const user = userEvent.setup();
    const {className: mirrorClassName} = stylex.props(rtlStyles.mirror);
    const mirrorClasses = mirrorClassName?.split(' ') ?? [];
    expect(mirrorClasses.length).toBeGreaterThan(0);
    render(
      <div dir="rtl" style={{direction: 'rtl'}}>
        <MoveMenu />
      </div>,
    );

    await user.click(screen.getByRole('button', {name: /Actions/}));
    const trigger = screen.getByRole('menuitem', {
      name: /Move to/,
      hidden: true,
    });
    const indicator = trigger.querySelector('.astryx-icon');
    expect(indicator).not.toBeNull();
    for (const className of mirrorClasses) {
      expect(indicator).toHaveClass(className);
    }

    await waitFor(() => {
      expect(
        screen.getByRole('menu', {name: 'Actions', hidden: true}),
      ).toHaveFocus();
    });
    // jsdom does not propagate the ancestor's computed direction, so set the
    // same RTL direction directly on each keyboard event owner.
    trigger.style.direction = 'rtl';
    trigger.focus();
    await user.keyboard('{ArrowLeft}');
    const flyout = screen.getByRole('menu', {name: /Move to/, hidden: true});
    flyout.style.direction = 'rtl';
    await waitFor(() => {
      expect(
        screen.getByRole('menuitem', {name: 'Folder A', hidden: true}),
      ).toHaveFocus();
    });
    await user.keyboard('{ArrowRight}');
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

describe('DropdownMenuSubMenu press model', () => {
  it('a press released on the sub-menu row opens it and keeps the menu', async () => {
    const user = userEvent.setup();
    render(<MoveMenu />);
    const root = screen.getByRole('button', {name: /Actions/});
    await user.click(root);
    const trigger = screen.getByRole('menuitem', {
      name: /Move to/,
      hidden: true,
    });
    const rename = screen.getByRole('menuitem', {name: 'Rename', hidden: true});
    fireEvent.pointerDown(rename, {pointerType: 'touch', pointerId: 1});
    fireEvent.pointerMove(trigger, {pointerType: 'touch', pointerId: 1});
    fireEvent.pointerUp(trigger, {pointerType: 'touch', pointerId: 1});
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(root).toHaveAttribute('aria-expanded', 'true');
  });

  it('a release inside the flyout acts on the flyout row and closes the whole menu', async () => {
    const onMove = vi.fn();
    const user = userEvent.setup();
    render(<MoveMenu onMove={onMove} />);
    const root = screen.getByRole('button', {name: /Actions/});
    await user.click(root);
    const trigger = screen.getByRole('menuitem', {
      name: /Move to/,
      hidden: true,
    });
    await user.click(trigger);
    const folderB = screen.getByRole('menuitem', {
      name: 'Folder B',
      hidden: true,
    });
    const folderA = screen.getByRole('menuitem', {
      name: 'Folder A',
      hidden: true,
    });
    fireEvent.pointerDown(folderA, {pointerType: 'touch', pointerId: 1});
    fireEvent.pointerMove(folderB, {pointerType: 'touch', pointerId: 1});
    fireEvent.pointerUp(folderB, {pointerType: 'touch', pointerId: 1});
    fireEvent.click(folderA, {detail: 1});
    expect(onMove).toHaveBeenCalledTimes(1);
    expect(onMove).toHaveBeenCalledWith('b');
    expect(root).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('DropdownMenuSubMenu drill-in on a phone', () => {
  const originalMatchMedia = window.matchMedia;

  // The drill-in resolves on the same query the root presentation uses for
  // its bottom sheet, so one component carries one meaning of "adaptive".
  function stubCompactTouch(matches: boolean) {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: matches && query === COMPACT_TOUCH_PRESENTATION_QUERY,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
  }

  afterEach(() => {
    vi.stubGlobal('matchMedia', originalMatchMedia);
  });

  function PhoneMenu({onMove}: {onMove?: (folder: string) => void} = {}) {
    return (
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuItem label="Rename" onClick={() => {}} />
        <DropdownMenuSubMenu label="Move to">
          <DropdownMenuItem label="Folder A" onClick={() => onMove?.('a')} />
          <DropdownMenuSubMenu label="Archive">
            <DropdownMenuItem label="2025" onClick={() => onMove?.('2025')} />
          </DropdownMenuSubMenu>
        </DropdownMenuSubMenu>
        <DropdownMenuItem label="Delete" onClick={() => {}} />
      </DropdownMenu>
    );
  }

  // The popover is not open for jsdom's accessibility tree, so every query
  // passes `hidden`; the rows a drilled-in view replaced sit under a `hidden`
  // wrapper, which is what "shown" means here.
  const h = {hidden: true} as const;
  const isShown = (el: HTMLElement) => el.closest('[hidden]') == null;
  const visibleRows = () =>
    screen
      .getAllByRole('menuitem', h)
      .filter(isShown)
      .map(el => el.textContent);
  const shownRow = (name: string) =>
    screen.getAllByRole('menuitem', {name, ...h}).find(isShown)!;
  const shownMenu = (name: string) =>
    screen.getAllByRole('menu', {name, ...h}).find(isShown)!;

  it('on a phone a sub-menu drills in, is named by its row, and Back returns', async () => {
    stubCompactTouch(true);
    const user = userEvent.setup();
    const onMove = vi.fn();
    render(<PhoneMenu onMove={onMove} />);
    const trigger = screen.getByRole('button', {name: /Actions/});
    await user.click(trigger);
    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-expanded', 'true'),
    );
    const rootMenu = shownMenu('Actions');

    const moveTo = shownRow('Move to');
    expect(moveTo).toHaveAttribute('aria-haspopup', 'menu');
    expect(moveTo).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(moveTo, {detail: 1});

    // The list is replaced in place: the sibling rows are gone from view, the
    // drilled list is named by its row and leads with a Back row.
    const drilled = await waitFor(() => shownMenu('Move to'));
    expect(rootMenu).toContainElement(drilled);
    expect(visibleRows()).toEqual(['Back to Actions', 'Folder A', 'Archive']);
    // The sibling row is still mounted (its state stays live) but hidden.
    expect(screen.getByRole('menuitem', {name: 'Rename', ...h})).not.toBe(
      undefined,
    );
    expect(isShown(screen.getByRole('menuitem', {name: 'Rename', ...h}))).toBe(
      false,
    );
    // No flyout beside the menu: the drilled list has no popover of its own.
    expect(drilled.closest('[popover]')).toBe(rootMenu.closest('[popover]'));

    // Back returns to the sub-menu row.
    fireEvent.click(shownRow('Back to Actions'), {
      detail: 1,
    });
    await waitFor(() => expect(shownRow('Move to')).toHaveFocus());
    expect(visibleRows()).toEqual(['Rename', 'Move to', 'Delete']);

    // Escape and ArrowLeft pop too, and a second level names its parent.
    fireEvent.keyDown(shownRow('Move to'), {
      key: 'Enter',
    });
    await waitFor(() => shownMenu('Move to'));
    // A keyboard drill-in lands on the first row after Back.
    expect(shownRow('Folder A')).toHaveFocus();
    fireEvent.keyDown(shownRow('Archive'), {
      key: 'Enter',
    });
    await waitFor(() => shownMenu('Archive'));
    expect(visibleRows()).toEqual(['Back to Move to', '2025']);
    expect(shownRow('2025')).toHaveFocus();

    fireEvent.keyDown(document.activeElement!, {key: 'ArrowLeft'});
    await waitFor(() => expect(shownRow('Archive')).toHaveFocus());
    expect(visibleRows()).toEqual(['Back to Actions', 'Folder A', 'Archive']);
    fireEvent.keyDown(document.activeElement!, {key: 'Escape'});
    await waitFor(() => expect(shownRow('Move to')).toHaveFocus());
    // One Escape popped one level; the menu is still open.
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // A pick inside a drilled list acts and closes the whole menu.
    fireEvent.click(shownRow('Move to'), {
      detail: 1,
    });
    await waitFor(() => shownMenu('Move to'));
    fireEvent.click(shownRow('Folder A'), {
      detail: 1,
    });
    expect(onMove).toHaveBeenCalledWith('a');
    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-expanded', 'false'),
    );
  });

  it('typeahead and arrows scope to the drilled rows', async () => {
    stubCompactTouch(true);
    const user = userEvent.setup();
    render(<PhoneMenu />);
    await user.click(screen.getByRole('button', {name: /Actions/}));
    fireEvent.keyDown(await waitFor(() => shownRow('Move to')), {
      key: 'Enter',
    });
    const drilled = await waitFor(() => shownMenu('Move to'));
    const folderA = shownRow('Folder A');
    expect(folderA).toHaveFocus();
    // "d" matches Delete at the root, which is not shown: nothing moves.
    fireEvent.keyDown(folderA, {key: 'd'});
    expect(folderA).toHaveFocus();
    // Arrows, Home and End walk the drilled list only, Back included; the
    // hidden parent rows are not in the order.
    fireEvent.keyDown(folderA, {key: 'ArrowUp'});
    expect(shownRow('Back to Actions')).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, {key: 'End'});
    expect(shownRow('Archive')).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, {key: 'Home'});
    expect(shownRow('Back to Actions')).toHaveFocus();
    expect(drilled).toBeInTheDocument();
  });

  it('presentation="flyout" keeps the flyout on a phone and "drill-in" drills on a laptop', async () => {
    stubCompactTouch(true);
    const user = userEvent.setup();
    const {unmount} = render(
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuSubMenu label="Move to" presentation="flyout">
          <DropdownMenuItem label="Folder A" onClick={() => {}} />
        </DropdownMenuSubMenu>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', {name: /Actions/}));
    fireEvent.click(await waitFor(() => shownRow('Move to')), {
      detail: 1,
    });
    // The flyout renders in a popover of its own beside the row.
    const flyout = await waitFor(() => shownMenu('Move to'));
    expect(flyout.closest('[popover]')).not.toBe(
      shownMenu('Actions').closest('[popover]'),
    );
    expect(screen.queryByRole('menuitem', {name: /^Back to/, ...h})).toBeNull();
    unmount();

    stubCompactTouch(false);
    render(
      <DropdownMenu button={{label: 'Actions'}}>
        <DropdownMenuSubMenu label="Move to" presentation="drill-in">
          <DropdownMenuItem label="Folder A" onClick={() => {}} />
        </DropdownMenuSubMenu>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', {name: /Actions/}));
    fireEvent.click(await waitFor(() => shownRow('Move to')), {
      detail: 1,
    });
    await waitFor(() => shownRow('Back to Actions'));
  });

  it('closing the menu resets the drilled view', async () => {
    stubCompactTouch(true);
    const user = userEvent.setup();
    render(<PhoneMenu />);
    const trigger = screen.getByRole('button', {name: /Actions/});
    await user.click(trigger);
    fireEvent.click(await waitFor(() => shownRow('Move to')), {
      detail: 1,
    });
    await waitFor(() => shownMenu('Move to'));
    fireEvent.keyDown(document.activeElement!, {key: 'Escape'});
    await waitFor(() => expect(shownRow('Move to')).toHaveFocus());
    fireEvent.keyDown(document.activeElement!, {key: 'Escape'});
    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-expanded', 'false'),
    );
    await user.click(trigger);
    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-expanded', 'true'),
    );
    expect(visibleRows()).toEqual(['Rename', 'Move to', 'Delete']);
  });
});
