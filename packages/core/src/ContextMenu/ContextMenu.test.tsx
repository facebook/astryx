// Copyright (c) Meta Platforms, Inc. and affiliates.
/**
 * @file ContextMenu.test.tsx
 * @input Uses vitest, @testing-library/react, ContextMenu component
 * @output Unit tests for ContextMenu component behavior
 * @position Testing; validates ContextMenu.tsx implementation
 *
 * SYNC: When ContextMenu.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {ContextMenu} from './ContextMenu';
import {ContextMenuItem} from './index';
import {DropdownMenuItem} from '../DropdownMenu/DropdownMenuItem';
import {Divider} from '../Divider';

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

describe('ContextMenu', () => {
  it('renders trigger children', () => {
    render(
      <ContextMenu items={[{label: 'Item 1'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );
    expect(screen.getByText('Right-click me')).toBeInTheDocument();
  });

  it('renders menu with role="menu"', () => {
    render(
      <ContextMenu items={[{label: 'Item 1'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );
    expect(screen.getByRole('menu', {hidden: true})).toBeInTheDocument();
  });

  it('typeahead focuses the matching menu item (menus-11)', () => {
    render(
      <ContextMenu items={[{label: 'Cut'}, {label: 'Copy'}, {label: 'Paste'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText('Right-click me'));
    const menu = screen.getByRole('menu', {hidden: true});
    fireEvent.keyDown(menu, {key: 'p'});
    expect(
      screen.getByRole('menuitem', {name: 'Paste', hidden: true}),
    ).toHaveFocus();
  });

  it('gives the menu an accessible name (menus-13)', () => {
    render(
      <ContextMenu items={[{label: 'Item 1'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );
    // Defaults to "Context menu"; overridable via label.
    expect(
      screen.getByRole('menu', {name: 'Context menu', hidden: true}),
    ).toBeInTheDocument();
  });

  it('uses a custom label', () => {
    render(
      <ContextMenu items={[{label: 'Item 1'}]} label="Row actions">
        <div>Right-click me</div>
      </ContextMenu>,
    );
    expect(
      screen.getByRole('menu', {name: 'Row actions', hidden: true}),
    ).toBeInTheDocument();
  });

  it('does not put aria-haspopup on the role-less trigger wrapper (menus-15)', () => {
    render(
      <ContextMenu items={[{label: 'Item 1'}]} data-testid="ctx">
        <div>Right-click me</div>
      </ContextMenu>,
    );
    expect(screen.getByTestId('ctx')).not.toHaveAttribute('aria-haspopup');
  });

  it('opens menu on right-click', () => {
    render(
      <ContextMenu items={[{label: 'Item 1'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText('Right-click me'));
    expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
  });

  it('closes on Escape even when opened without auto-focus', () => {
    render(
      <ContextMenu items={[{label: 'Item 1'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText('Right-click me'));
    expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
    // Focus is not inside the menu, so the Escape path must be document-level.
    fireEvent.keyDown(document, {key: 'Escape'});
    expect(HTMLElement.prototype.hidePopover).toHaveBeenCalled();
  });

  it('ignores Escape during IME composition', () => {
    render(
      <ContextMenu items={[{label: 'Item 1'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText('Right-click me'));
    fireEvent.keyDown(document, {key: 'Escape', isComposing: true});
    expect(HTMLElement.prototype.hidePopover).not.toHaveBeenCalled();
  });

  it('restores focus to the trigger on close', () => {
    render(
      <ContextMenu items={[{label: 'Item 1'}]}>
        <button type="button">Right-click me</button>
      </ContextMenu>,
    );

    const trigger = screen.getByRole('button', {name: 'Right-click me'});
    trigger.focus();
    expect(trigger).toHaveFocus();

    fireEvent.contextMenu(trigger);
    fireEvent.keyDown(document, {key: 'Escape'});
    expect(trigger).toHaveFocus();
  });

  it('prevents default context menu on right-click', () => {
    render(
      <ContextMenu items={[{label: 'Item 1'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    const event = new MouseEvent('contextmenu', {bubbles: true});
    const preventDefault = vi.spyOn(event, 'preventDefault');
    screen.getByText('Right-click me').dispatchEvent(event);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('prevents default context menu on the opened menu container', () => {
    render(
      <ContextMenu items={[{label: 'Item 1'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText('Right-click me'));
    const menu = screen.getByRole('menu', {hidden: true});
    const event = new MouseEvent('contextmenu', {bubbles: true});
    const preventDefault = vi.spyOn(event, 'preventDefault');
    menu.dispatchEvent(event);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('does not open when isDisabled is true', () => {
    render(
      <ContextMenu items={[{label: 'Item 1'}]} isDisabled>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText('Right-click me'));
    expect(HTMLElement.prototype.showPopover).not.toHaveBeenCalled();
  });

  it('applies data-testid to trigger wrapper', () => {
    render(
      <ContextMenu items={[{label: 'Item 1'}]} data-testid="my-context-menu">
        <div>Right-click me</div>
      </ContextMenu>,
    );
    expect(screen.getByTestId('my-context-menu')).toBeInTheDocument();
  });

  it('opens from a keyboard-invoked contextmenu (Shift+F10 / Menu key)', () => {
    render(
      <ContextMenu items={[{label: 'Item 1'}]} data-testid="ctx">
        <div>Right-click me</div>
      </ContextMenu>,
    );
    const trigger = screen.getByTestId('ctx');
    // Anchor the trigger box so the rect fallback has a position to read.
    trigger.getBoundingClientRect = () =>
      ({
        left: 40,
        top: 10,
        bottom: 30,
        right: 100,
        width: 60,
        height: 20,
      }) as DOMRect;
    // Keyboard-initiated contextmenu: coords are (0,0) and detail is 0.
    fireEvent.contextMenu(trigger, {clientX: 0, clientY: 0, detail: 0});
    expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
  });

  it('opens on touch long-press', () => {
    vi.useFakeTimers();
    try {
      render(
        <ContextMenu items={[{label: 'Item 1'}]} data-testid="ctx">
          <div>Long-press me</div>
        </ContextMenu>,
      );
      const trigger = screen.getByTestId('ctx');
      fireEvent.touchStart(trigger, {
        touches: [{clientX: 20, clientY: 20}],
      });
      // Not open until the long-press threshold elapses.
      expect(HTMLElement.prototype.showPopover).not.toHaveBeenCalled();
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('cancels the long-press when the finger moves past the threshold', () => {
    vi.useFakeTimers();
    try {
      render(
        <ContextMenu items={[{label: 'Item 1'}]} data-testid="ctx">
          <div>Long-press me</div>
        </ContextMenu>,
      );
      const trigger = screen.getByTestId('ctx');
      fireEvent.touchStart(trigger, {touches: [{clientX: 20, clientY: 20}]});
      // Move past MOVE_CANCEL_PX (10px) — treated as a scroll, not a press.
      fireEvent.touchMove(trigger, {touches: [{clientX: 20, clientY: 40}]});
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(HTMLElement.prototype.showPopover).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('ContextMenu items', () => {
  it('renders items with labels', () => {
    render(
      <ContextMenu items={[{label: 'Cut'}, {label: 'Copy'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );
    expect(
      screen.getByRole('menuitem', {name: 'Cut', hidden: true}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {name: 'Copy', hidden: true}),
    ).toBeInTheDocument();
  });

  it('calls onClick when item is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <ContextMenu items={[{label: 'Cut', onClick: handleClick}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    await user.click(screen.getByRole('menuitem', {name: 'Cut', hidden: true}));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <ContextMenu
        items={[{label: 'Cut', onClick: handleClick, isDisabled: true}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    await user.click(screen.getByRole('menuitem', {name: 'Cut', hidden: true}));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('has aria-disabled when disabled', () => {
    render(
      <ContextMenu items={[{label: 'Cut', isDisabled: true}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );
    expect(
      screen.getByRole('menuitem', {name: 'Cut', hidden: true}),
    ).toHaveAttribute('aria-disabled', 'true');
  });
});

describe('ContextMenu sections', () => {
  it('renders section with title', () => {
    render(
      <ContextMenu
        items={[
          {
            type: 'section',
            title: 'Edit',
            items: [{label: 'Cut'}, {label: 'Copy'}],
          },
        ]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {name: 'Cut', hidden: true}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {name: 'Copy', hidden: true}),
    ).toBeInTheDocument();
  });

  it('has role="group" with aria-label', () => {
    render(
      <ContextMenu
        items={[
          {
            type: 'section',
            title: 'Edit',
            items: [{label: 'Cut'}],
          },
        ]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    const group = screen.getByRole('group', {name: 'Edit', hidden: true});
    expect(group).toBeInTheDocument();
  });
});

describe('ContextMenu dividers', () => {
  it('renders dividers between items', () => {
    render(
      <ContextMenu
        items={[{label: 'Cut'}, {type: 'divider'}, {label: 'Paste'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    expect(
      screen.getByRole('menuitem', {name: 'Cut', hidden: true}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {name: 'Paste', hidden: true}),
    ).toBeInTheDocument();
    expect(screen.getByRole('separator', {hidden: true})).toBeInTheDocument();
  });
});

describe('ContextMenu compound mode', () => {
  it('renders menuContent as menu items', () => {
    render(
      <ContextMenu
        menuContent={
          <>
            <DropdownMenuItem label="Cut" onClick={() => {}} />
            <DropdownMenuItem label="Copy" onClick={() => {}} />
          </>
        }>
        <div>Right-click me</div>
      </ContextMenu>,
    );
    expect(
      screen.getByRole('menuitem', {name: 'Cut', hidden: true}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {name: 'Copy', hidden: true}),
    ).toBeInTheDocument();
  });

  it('renders ContextMenuItem endContent', () => {
    render(
      <ContextMenu
        menuContent={
          <ContextMenuItem
            label="Cut"
            endContent={<span data-testid="shortcut">⌘X</span>}
            onClick={() => {}}
          />
        }>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    expect(screen.getByTestId('shortcut')).toHaveTextContent('⌘X');
  });

  it('calls onClick when compound item is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <ContextMenu
        menuContent={<DropdownMenuItem label="Cut" onClick={handleClick} />}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    await user.click(screen.getByRole('menuitem', {name: 'Cut', hidden: true}));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders dividers between compound items', () => {
    render(
      <ContextMenu
        menuContent={
          <>
            <DropdownMenuItem label="Cut" onClick={() => {}} />
            <Divider />
            <DropdownMenuItem label="Paste" onClick={() => {}} />
          </>
        }>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    expect(
      screen.getByRole('menuitem', {name: 'Cut', hidden: true}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {name: 'Paste', hidden: true}),
    ).toBeInTheDocument();
    expect(screen.getByRole('separator', {hidden: true})).toBeInTheDocument();
  });

  describe('cursor anchor positioning (#3465)', () => {
    // The menu is anchored to a zero-size element placed at the cursor point
    // *inside the trigger*, so it is positioned relative to the trigger's
    // context (scroll-follow + auto-flip) rather than the viewport.
    function getCursorAnchor(trigger: HTMLElement): HTMLElement {
      const anchor = trigger.querySelector<HTMLElement>('[aria-hidden="true"]');
      if (!anchor) {
        throw new Error('cursor anchor not found');
      }
      return anchor;
    }

    it('renders a zero-size cursor anchor inside the trigger', () => {
      render(
        <ContextMenu items={[{label: 'Item 1'}]} data-testid="ctx">
          <div>Right-click me</div>
        </ContextMenu>,
      );
      const anchor = getCursorAnchor(screen.getByTestId('ctx'));
      expect(anchor.tagName).toBe('SPAN');
      // Carries an anchor-name so the menu can be anchored to it via CSS
      // anchor positioning (context mode), not fixed viewport coordinates.
      expect(anchor.style.anchorName).toMatch(/^--astryx-layer-/);
    });

    it('places the cursor anchor at the pointer position relative to the trigger', () => {
      render(
        <ContextMenu items={[{label: 'Item 1'}]} data-testid="ctx">
          <div>Right-click me</div>
        </ContextMenu>,
      );
      const trigger = screen.getByTestId('ctx');
      trigger.getBoundingClientRect = () =>
        ({
          left: 100,
          top: 50,
          right: 300,
          bottom: 150,
          width: 200,
          height: 100,
        }) as DOMRect;
      // Pointer at viewport (170, 90) -> local trigger offset (70, 40).
      fireEvent.contextMenu(trigger, {clientX: 170, clientY: 90, detail: 1});
      const anchor = getCursorAnchor(trigger);
      expect(anchor.style.left).toBe('70px');
      expect(anchor.style.top).toBe('40px');
    });

    it('anchors a keyboard-invoked menu to the trigger bottom-left', () => {
      render(
        <ContextMenu items={[{label: 'Item 1'}]} data-testid="ctx">
          <div>Right-click me</div>
        </ContextMenu>,
      );
      const trigger = screen.getByTestId('ctx');
      trigger.getBoundingClientRect = () =>
        ({
          left: 40,
          top: 10,
          right: 100,
          bottom: 30,
          width: 60,
          height: 20,
        }) as DOMRect;
      // Keyboard-initiated contextmenu: coords (0,0), detail 0 -> local (0, height).
      fireEvent.contextMenu(trigger, {clientX: 0, clientY: 0, detail: 0});
      const anchor = getCursorAnchor(trigger);
      expect(anchor.style.left).toBe('0px');
      expect(anchor.style.top).toBe('20px');
    });
  });
});

describe('ContextMenu keyboard access for menuitemradio/menuitemcheckbox (#3829)', () => {
  it('arrow navigation reaches consumer-rendered menuitemradio and menuitemcheckbox items', () => {
    render(
      <ContextMenu
        menuContent={
          <>
            <DropdownMenuItem label="Cut" onClick={() => {}} />
            <div role="menuitemradio" tabIndex={-1} aria-checked="false">
              Newest
            </div>
            <div role="menuitemcheckbox" tabIndex={-1} aria-checked="false">
              Archived
            </div>
          </>
        }>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText('Right-click me'));
    const menu = screen.getByRole('menu', {hidden: true});
    screen.getByRole('menuitem', {name: 'Cut', hidden: true}).focus();

    fireEvent.keyDown(menu, {key: 'ArrowDown'});
    expect(
      screen.getByRole('menuitemradio', {name: 'Newest', hidden: true}),
    ).toHaveFocus();

    fireEvent.keyDown(menu, {key: 'ArrowDown'});
    expect(
      screen.getByRole('menuitemcheckbox', {name: 'Archived', hidden: true}),
    ).toHaveFocus();
  });

  it('activates a focused menuitemradio with Enter and a menuitemcheckbox with Space', () => {
    const onSelect = vi.fn();
    const onToggle = vi.fn();
    render(
      <ContextMenu
        menuContent={
          <>
            <DropdownMenuItem label="Cut" onClick={() => {}} />
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
          </>
        }>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText('Right-click me'));
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

  it('typeahead matches a menuitemradio label', () => {
    render(
      <ContextMenu
        menuContent={
          <>
            <DropdownMenuItem label="Cut" onClick={() => {}} />
            <div role="menuitemradio" tabIndex={-1} aria-checked="false">
              Newest
            </div>
            <div role="menuitemcheckbox" tabIndex={-1} aria-checked="false">
              Archived
            </div>
          </>
        }>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText('Right-click me'));
    fireEvent.keyDown(screen.getByRole('menu', {hidden: true}), {key: 'n'});
    expect(
      screen.getByRole('menuitemradio', {name: 'Newest', hidden: true}),
    ).toHaveFocus();
  });

  it('typeahead matches a menuitemcheckbox label', () => {
    render(
      <ContextMenu
        menuContent={
          <>
            <DropdownMenuItem label="Cut" onClick={() => {}} />
            <div role="menuitemradio" tabIndex={-1} aria-checked="false">
              Newest
            </div>
            <div role="menuitemcheckbox" tabIndex={-1} aria-checked="false">
              Archived
            </div>
          </>
        }>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText('Right-click me'));
    fireEvent.keyDown(screen.getByRole('menu', {hidden: true}), {key: 'a'});
    expect(
      screen.getByRole('menuitemcheckbox', {name: 'Archived', hidden: true}),
    ).toHaveFocus();
  });

  it('skips aria-disabled menuitemradio and menuitemcheckbox items during arrow navigation', () => {
    render(
      <ContextMenu
        menuContent={
          <>
            <DropdownMenuItem label="Cut" onClick={() => {}} />
            <div role="menuitemradio" tabIndex={-1} aria-disabled="true">
              Newest
            </div>
            <div role="menuitemcheckbox" tabIndex={-1} aria-checked="false">
              Archived
            </div>
          </>
        }>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText('Right-click me'));
    const menu = screen.getByRole('menu', {hidden: true});
    screen.getByRole('menuitem', {name: 'Cut', hidden: true}).focus();

    fireEvent.keyDown(menu, {key: 'ArrowDown'});
    expect(
      screen.getByRole('menuitemcheckbox', {name: 'Archived', hidden: true}),
    ).toHaveFocus();
  });
});
