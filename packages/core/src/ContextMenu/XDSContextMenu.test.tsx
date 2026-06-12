// Copyright (c) Meta Platforms, Inc. and affiliates.
/**
 * @file XDSContextMenu.test.tsx
 * @input Uses vitest, @testing-library/react, XDSContextMenu component
 * @output Unit tests for XDSContextMenu component behavior
 * @position Testing; validates XDSContextMenu.tsx implementation
 *
 * SYNC: When XDSContextMenu.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSContextMenu} from './XDSContextMenu';
import {XDSContextMenuItem} from './index';
import {XDSDropdownMenuItem} from '../DropdownMenu/XDSDropdownMenuItem';
import {XDSDivider} from '../Divider';

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

describe('XDSContextMenu', () => {
  it('renders trigger children', () => {
    render(
      <XDSContextMenu items={[{label: 'Item 1'}]}>
        <div>Right-click me</div>
      </XDSContextMenu>,
    );
    expect(screen.getByText('Right-click me')).toBeInTheDocument();
  });

  it('renders menu with role="menu"', () => {
    render(
      <XDSContextMenu items={[{label: 'Item 1'}]}>
        <div>Right-click me</div>
      </XDSContextMenu>,
    );
    expect(screen.getByRole('menu', {hidden: true})).toBeInTheDocument();
  });

  it('opens menu on right-click', () => {
    render(
      <XDSContextMenu items={[{label: 'Item 1'}]}>
        <div>Right-click me</div>
      </XDSContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText('Right-click me'));
    expect(HTMLElement.prototype.showPopover).toHaveBeenCalled();
  });

  it('prevents default context menu on right-click', () => {
    render(
      <XDSContextMenu items={[{label: 'Item 1'}]}>
        <div>Right-click me</div>
      </XDSContextMenu>,
    );

    const event = new MouseEvent('contextmenu', {bubbles: true});
    const preventDefault = vi.spyOn(event, 'preventDefault');
    screen.getByText('Right-click me').dispatchEvent(event);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('does not open when isDisabled is true', () => {
    render(
      <XDSContextMenu items={[{label: 'Item 1'}]} isDisabled>
        <div>Right-click me</div>
      </XDSContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText('Right-click me'));
    expect(HTMLElement.prototype.showPopover).not.toHaveBeenCalled();
  });

  it('applies data-testid to trigger wrapper', () => {
    render(
      <XDSContextMenu items={[{label: 'Item 1'}]} data-testid="my-context-menu">
        <div>Right-click me</div>
      </XDSContextMenu>,
    );
    expect(screen.getByTestId('my-context-menu')).toBeInTheDocument();
  });
});

describe('XDSContextMenu items', () => {
  it('renders items with labels', () => {
    render(
      <XDSContextMenu items={[{label: 'Cut'}, {label: 'Copy'}]}>
        <div>Right-click me</div>
      </XDSContextMenu>,
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
      <XDSContextMenu items={[{label: 'Cut', onClick: handleClick}]}>
        <div>Right-click me</div>
      </XDSContextMenu>,
    );

    await user.click(screen.getByRole('menuitem', {name: 'Cut', hidden: true}));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <XDSContextMenu
        items={[{label: 'Cut', onClick: handleClick, isDisabled: true}]}>
        <div>Right-click me</div>
      </XDSContextMenu>,
    );

    await user.click(screen.getByRole('menuitem', {name: 'Cut', hidden: true}));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('has aria-disabled when disabled', () => {
    render(
      <XDSContextMenu items={[{label: 'Cut', isDisabled: true}]}>
        <div>Right-click me</div>
      </XDSContextMenu>,
    );
    expect(
      screen.getByRole('menuitem', {name: 'Cut', hidden: true}),
    ).toHaveAttribute('aria-disabled', 'true');
  });
});

describe('XDSContextMenu sections', () => {
  it('renders section with title', () => {
    render(
      <XDSContextMenu
        items={[
          {
            type: 'section',
            title: 'Edit',
            items: [{label: 'Cut'}, {label: 'Copy'}],
          },
        ]}>
        <div>Right-click me</div>
      </XDSContextMenu>,
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
      <XDSContextMenu
        items={[
          {
            type: 'section',
            title: 'Edit',
            items: [{label: 'Cut'}],
          },
        ]}>
        <div>Right-click me</div>
      </XDSContextMenu>,
    );

    const group = screen.getByRole('group', {name: 'Edit', hidden: true});
    expect(group).toBeInTheDocument();
  });
});

describe('XDSContextMenu dividers', () => {
  it('renders dividers between items', () => {
    render(
      <XDSContextMenu
        items={[{label: 'Cut'}, {type: 'divider'}, {label: 'Paste'}]}>
        <div>Right-click me</div>
      </XDSContextMenu>,
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

describe('XDSContextMenu compound mode', () => {
  it('renders menuContent as menu items', () => {
    render(
      <XDSContextMenu
        menuContent={
          <>
            <XDSDropdownMenuItem label="Cut" onClick={() => {}} />
            <XDSDropdownMenuItem label="Copy" onClick={() => {}} />
          </>
        }>
        <div>Right-click me</div>
      </XDSContextMenu>,
    );
    expect(
      screen.getByRole('menuitem', {name: 'Cut', hidden: true}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {name: 'Copy', hidden: true}),
    ).toBeInTheDocument();
  });

  it('renders XDSContextMenuItem endContent', () => {
    render(
      <XDSContextMenu
        menuContent={
          <XDSContextMenuItem
            label="Cut"
            endContent={<span data-testid="shortcut">⌘X</span>}
            onClick={() => {}}
          />
        }>
        <div>Right-click me</div>
      </XDSContextMenu>,
    );

    expect(screen.getByTestId('shortcut')).toHaveTextContent('⌘X');
  });

  it('calls onClick when compound item is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <XDSContextMenu
        menuContent={<XDSDropdownMenuItem label="Cut" onClick={handleClick} />}>
        <div>Right-click me</div>
      </XDSContextMenu>,
    );

    await user.click(screen.getByRole('menuitem', {name: 'Cut', hidden: true}));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders dividers between compound items', () => {
    render(
      <XDSContextMenu
        menuContent={
          <>
            <XDSDropdownMenuItem label="Cut" onClick={() => {}} />
            <XDSDivider />
            <XDSDropdownMenuItem label="Paste" onClick={() => {}} />
          </>
        }>
        <div>Right-click me</div>
      </XDSContextMenu>,
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
