// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DropdownMenuRadioCell.test.tsx
 * @input Uses vitest, Testing Library, DropdownMenu, DropdownMenuRadioGroup
 *   and DropdownMenuRadioItem
 * @output Tests for a radio item given children: a cell drawn from the
 *   caller's content, named by its label, that keeps the row's role, focus and
 *   selection
 * @position Testing; validates the cell form of DropdownMenuRadioItem.tsx
 *
 * SYNC: When DropdownMenuRadioItem.tsx changes its cell form, update these tests.
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as stylex from '@stylexjs/stylex';
import {focusOutlineStyles} from '../utils/focusOutline.stylex';
import {DropdownMenu} from './DropdownMenu';
import {DropdownMenuItem} from './DropdownMenuItem';
import {DropdownMenuRadioGroup} from './DropdownMenuRadioGroup';
import {DropdownMenuRadioItem} from './DropdownMenuRadioItem';

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

const COLORS = [
  {value: 'red', label: 'Red'},
  {value: 'green', label: 'Green'},
  {value: 'blue', label: 'Blue'},
];

const ignoreChange = () => {};

function ColorMenu({
  value = 'red',
  onChange = ignoreChange,
}: {
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <DropdownMenu button={{label: 'Color'}}>
      <DropdownMenuItem label="Reset" />
      <DropdownMenuRadioGroup value={value} onChange={onChange} label="Color">
        {COLORS.map(color => (
          <DropdownMenuRadioItem
            key={color.value}
            value={color.value}
            label={color.label}>
            <span data-testid={`swatch-${color.value}`} />
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </DropdownMenu>
  );
}

function cell(name: string): HTMLElement {
  return screen.getByRole('menuitemradio', {name, hidden: true});
}

const RING_CLASSES = stylex
  .props(focusOutlineStyles.focusVisible)
  .className!.split(' ');

// The ring's classes on a cell that another, unfocused and unchecked cell
// lacks: the ones the keyboard ring adds.
function ringClassesOn(element: HTMLElement, reference: HTMLElement): string[] {
  return RING_CLASSES.filter(
    name =>
      element.classList.contains(name) && !reference.classList.contains(name),
  );
}

describe('DropdownMenuRadioItem with children (a cell)', () => {
  it('draws its children as the cell, named by its label, with no radio mark', async () => {
    const user = userEvent.setup();
    render(<ColorMenu />);
    await user.click(screen.getByRole('button', {name: /Color/}));

    const red = cell('Red');
    const green = cell('Green');
    expect(within(red).getByTestId('swatch-red')).toBeInTheDocument();
    expect(red).toHaveAttribute('aria-checked', 'true');
    expect(green).toHaveAttribute('aria-checked', 'false');
    expect(red).toHaveAttribute('tabindex', '-1');
    // No row: no radio mark and no row label slot, only the hidden name.
    expect(red.querySelector('.astryx-radio-indicator')).toBeNull();
    expect(red.querySelector('.astryx-dropdown-menu-radio')).toBeNull();
    expect(red).toHaveTextContent(/^Red$/);
    // The checked cell is painted apart from the others.
    expect(red.className).not.toBe(green.className);
    expect(cell('Blue').className).toBe(green.className);
  });

  it('selects on a click and closes the menu, as a row does', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorMenu onChange={onChange} />);
    await user.click(screen.getByRole('button', {name: /Color/}));

    await user.click(cell('Green'));
    expect(onChange).toHaveBeenCalledWith('green');
    expect(HTMLElement.prototype.hidePopover).toHaveBeenCalledTimes(1);
  });

  it('is reached by the arrow keys in DOM order and found by typeahead on its label', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorMenu onChange={onChange} />);
    await user.click(screen.getByRole('button', {name: /Color/}));
    const menu = screen.getByRole('menu', {hidden: true});
    await waitFor(() => expect(menu).toHaveFocus());

    fireEvent.keyDown(menu, {key: 'ArrowDown'});
    expect(
      screen.getByRole('menuitem', {name: 'Reset', hidden: true}),
    ).toHaveFocus();
    fireEvent.keyDown(menu, {key: 'ArrowDown'});
    expect(cell('Red')).toHaveFocus();
    fireEvent.keyDown(menu, {key: 'ArrowDown'});
    expect(cell('Green')).toHaveFocus();

    fireEvent.keyDown(menu, {key: 'b'});
    expect(cell('Blue')).toHaveFocus();
    fireEvent.keyDown(menu, {key: 'Enter'});
    expect(onChange).toHaveBeenCalledWith('blue');
  });

  it('reaches cells laid out in a wrapper inside the group', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu button={{label: 'Icon'}}>
        <DropdownMenuRadioGroup value="cat" onChange={() => {}} label="Icon">
          <DropdownMenuRadioItem value="default" label="Default icon">
            <span>Default icon</span>
          </DropdownMenuRadioItem>
          <div data-testid="grid">
            <DropdownMenuRadioItem value="cat" label="Cat">
              <span aria-hidden="true">🐱</span>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dog" label="Dog">
              <span aria-hidden="true">🐶</span>
            </DropdownMenuRadioItem>
          </div>
        </DropdownMenuRadioGroup>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', {name: /Icon/}));
    const menu = screen.getByRole('menu', {hidden: true});
    await waitFor(() => expect(menu).toHaveFocus());

    fireEvent.keyDown(menu, {key: 'ArrowDown'});
    expect(cell('Default icon')).toHaveFocus();
    fireEvent.keyDown(menu, {key: 'ArrowDown'});
    expect(cell('Cat')).toHaveFocus();
    expect(cell('Cat')).toHaveAttribute('aria-checked', 'true');
    expect(
      within(screen.getByTestId('grid')).getAllByRole('menuitemradio', {
        hidden: true,
      }),
    ).toHaveLength(2);
  });

  it('keeps a disabled cell focusable and selects nothing from it', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DropdownMenu button={{label: 'Slot'}}>
        <DropdownMenuRadioGroup value="1" onChange={onChange} label="Slot">
          <DropdownMenuRadioItem value="1" label="Slot 1">
            1
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="2" label="Slot 2" isDisabled>
            2
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', {name: /Slot/}));

    const disabled = cell('Slot 2');
    expect(disabled).toHaveAttribute('aria-disabled', 'true');
    await user.click(disabled);
    expect(onChange).not.toHaveBeenCalled();
    expect(HTMLElement.prototype.hidePopover).not.toHaveBeenCalled();
  });

  it('stays a row when its children render nothing', async () => {
    const user = userEvent.setup();
    const showSwatch = false;
    render(
      <DropdownMenu button={{label: 'Color'}}>
        <DropdownMenuRadioGroup value="red" onChange={() => {}} label="Color">
          <DropdownMenuRadioItem value="red" label="Red">
            {showSwatch && <span data-testid="swatch" />}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="green" label="Green">
            {''}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="blue" label="Blue">
            {showSwatch && <span data-testid="swatch" />}
            {showSwatch && <span data-testid="badge" />}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="gray" label="Gray">
            {[].map(id => (
              <span key={id} data-testid="swatch" />
            ))}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', {name: /Color/}));
    // Each is a row, with its radio mark, not an empty cell, also when the
    // children are an array of nothing.
    for (const name of ['Red', 'Green', 'Blue', 'Gray']) {
      expect(
        cell(name).querySelector('.astryx-radio-indicator'),
      ).not.toBeNull();
    }
  });

  it('is a cell for a fragment or a component that renders nothing, as an element cannot be read before it renders', async () => {
    const user = userEvent.setup();
    const showSwatch = false;
    function Nothing() {
      return null;
    }
    render(
      <DropdownMenu button={{label: 'Color'}}>
        <DropdownMenuRadioGroup value="red" onChange={() => {}} label="Color">
          <DropdownMenuRadioItem value="red" label="Red">
            <>
              {showSwatch && <span data-testid="swatch" />}
              {showSwatch && <span data-testid="badge" />}
            </>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="green" label="Green">
            <Nothing />
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', {name: /Color/}));
    for (const name of ['Red', 'Green']) {
      expect(cell(name).querySelector('.astryx-radio-indicator')).toBeNull();
    }
  });

  it('paints the keyboard ring for focus after keyboard input, also where the mouse then moves it, and none after pointer input', async () => {
    const user = userEvent.setup();
    render(<ColorMenu />);
    // A pointer open: the cells the mouse rests on take focus, with no ring.
    await user.click(screen.getByRole('button', {name: /Color/}));
    const menu = screen.getByRole('menu', {hidden: true});
    await waitFor(() => expect(menu).toHaveFocus());
    fireEvent.pointerMove(cell('Green'), {pointerType: 'mouse'});
    expect(cell('Green')).toHaveFocus();
    expect(ringClassesOn(cell('Green'), cell('Blue'))).toEqual([]);

    // A key takes over: the cell it reaches carries the ring.
    await user.keyboard('{ArrowDown}');
    expect(cell('Blue')).toHaveFocus();
    expect(
      ringClassesOn(cell('Blue'), cell('Green')).length,
    ).toBeGreaterThanOrEqual(3);

    // The last input is still the keyboard: focus the mouse moves keeps it.
    fireEvent.pointerMove(cell('Green'), {pointerType: 'mouse'});
    expect(cell('Green')).toHaveFocus();
    expect(
      ringClassesOn(cell('Green'), cell('Red')).length,
    ).toBeGreaterThanOrEqual(3);
  });

  it('warns in development when a cell is given an icon, a description or end content', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const user = userEvent.setup();
      render(
        <DropdownMenu button={{label: 'Color'}}>
          <DropdownMenuRadioGroup value="red" onChange={() => {}} label="Color">
            <DropdownMenuRadioItem value="red" label="Red" description="Warm">
              <span />
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenu>,
      );
      await user.click(screen.getByRole('button', {name: /Color/}));
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('is a cell, which shows no icon, description'),
      );
      expect(cell('Red')).not.toHaveTextContent('Warm');
    } finally {
      warn.mockRestore();
    }
  });
});
