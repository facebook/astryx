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
import {render, screen, fireEvent} from '@testing-library/react';
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
      <ContextMenu
        items={[{label: 'Cut'}, {label: 'Copy'}, {label: 'Paste'}]}
        hasAutoFocus={false}>
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
      <ContextMenu items={[{label: 'Item 1'}]} hasAutoFocus={false}>
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
      <ContextMenu items={[{label: 'Item 1'}]} hasAutoFocus={false}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText('Right-click me'));
    fireEvent.keyDown(document, {key: 'Escape', isComposing: true});
    expect(HTMLElement.prototype.hidePopover).not.toHaveBeenCalled();
  });

  it('restores focus to the trigger on close', () => {
    render(
      <ContextMenu items={[{label: 'Item 1'}]} hasAutoFocus={false}>
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
});
