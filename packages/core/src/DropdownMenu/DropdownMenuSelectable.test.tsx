// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DropdownMenuSelectable.test.tsx
 * @input vitest, @testing-library/react, DropdownMenu + selectable items
 * @output Component-local callback, composition, and marker styling tests for
 *   DropdownMenuCheckboxItem / RadioGroup / RadioItem (#3829)
 * @position Shared checkbox and radio-group role, name, state, and interaction
 *   outcomes live in their reusable contracts; Menu retains navigation.
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {useState} from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {DropdownMenu} from './DropdownMenu';
import {DropdownMenuCheckboxItem} from './DropdownMenuCheckboxItem';
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

describe('DropdownMenuCheckboxItem', () => {
  it('calls onChange with the toggled value on click', async () => {
    const user = userEvent.setup();
    const onChangeSpy = vi.fn();
    render(
      <DropdownMenu button={{label: 'View'}}>
        <DropdownMenuCheckboxItem
          label="Show archived"
          value={false}
          onChange={onChangeSpy}
        />
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', {name: /View/}));
    await user.click(
      screen.getByRole('menuitemcheckbox', {
        name: /Show archived/,
        hidden: true,
      }),
    );
    expect(onChangeSpy).toHaveBeenCalledWith(true);
  });

  it('keeps the checkbox indicator decorative (row is the only announced control)', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu button={{label: 'View'}}>
        <DropdownMenuCheckboxItem label="Show archived" value={true} />
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', {name: /View/}));

    // The row owns role="menuitemcheckbox" — it is the single such control.
    expect(
      screen.getAllByRole('menuitemcheckbox', {hidden: true}),
    ).toHaveLength(1);

    // The visual is the shared checkbox indicator: aria-hidden, with no nested
    // native <input>, so the row is the only announced/focusable control.
    const row = screen.getByRole('menuitemcheckbox', {
      name: /Show archived/,
      hidden: true,
    });
    expect(row.querySelector('input[type="checkbox"]')).toBeNull();
    // The shared checkbox target, directly on the row — no wrapper, and no
    // menu-specific target added for it (main reached this element through
    // `astryx-checkbox` too).
    const marker = row.querySelector('.astryx-checkbox');
    expect(marker).toBeInTheDocument();
    expect(marker).toHaveAttribute('aria-hidden', 'true');
    expect(marker).toHaveAttribute('data-checked', 'checked');
  });

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup();
    const onChangeSpy = vi.fn();
    render(
      <DropdownMenu button={{label: 'View'}}>
        <DropdownMenuCheckboxItem
          label="Show archived"
          value={false}
          onChange={onChangeSpy}
          isDisabled
        />
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', {name: /View/}));
    const item = screen.getByRole('menuitemcheckbox', {
      name: /Show archived/,
      hidden: true,
    });
    expect(item).toHaveAttribute('aria-disabled', 'true');
    await user.click(item);
    expect(onChangeSpy).not.toHaveBeenCalled();
  });
});

describe('DropdownMenuRadioGroup / RadioItem', () => {
  it('renders the shared radio indicator in the menu marker', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu button={{label: 'Sort'}}>
        <DropdownMenuRadioGroup
          value="newest"
          onChange={() => {}}
          label="Sort by">
          <DropdownMenuRadioItem value="newest" label="Newest" />
          <DropdownMenuRadioItem value="oldest" label="Oldest" />
        </DropdownMenuRadioGroup>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', {name: /Sort/}));
    const checked = screen.getByRole('menuitemradio', {
      name: 'Newest',
      hidden: true,
    });
    // The menu's target and the shared radio target land on the SAME painted
    // circle, so menu radios and RadioList radios theme together and a theme
    // never has to reach through a wrapper.
    const box = checked.querySelector('.astryx-dropdown-menu-radio');
    expect(box).toHaveClass('astryx-radio');
    expect(box).toHaveAttribute('data-size', 'md');
    expect(box).toHaveAttribute('data-checked', 'checked');
    expect(box?.querySelector('.astryx-radio-dot')).toBeInTheDocument();

    // The unchecked radio still draws its circle, without the dot.
    const unchecked = screen.getByRole('menuitemradio', {
      name: 'Oldest',
      hidden: true,
    });
    const uncheckedIndicator = unchecked.querySelector('.astryx-radio');
    expect(uncheckedIndicator).toBeInTheDocument();
    expect(uncheckedIndicator).not.toHaveAttribute('data-checked');
    expect(
      uncheckedIndicator?.querySelector('.astryx-radio-dot'),
    ).not.toBeInTheDocument();
  });

  it('indicator="check" marks the chosen row with the check mark and keeps the radio semantics', async () => {
    const user = userEvent.setup();
    function Sort() {
      const [sort, setSort] = useState('newest');
      return (
        <DropdownMenu button={{label: 'Sort'}}>
          <DropdownMenuRadioGroup
            value={sort}
            onChange={setSort}
            label="Sort by"
            indicator="check"
            hasCloseOnSelect={false}>
            <DropdownMenuRadioItem value="newest" label="Newest" />
            <DropdownMenuRadioItem value="oldest" label="Oldest" />
          </DropdownMenuRadioGroup>
        </DropdownMenu>
      );
    }
    render(<Sort />);
    await user.click(screen.getByRole('button', {name: /Sort/}));
    const row = (name: string) =>
      screen.getByRole('menuitemradio', {name, hidden: true});
    const mark = (name: string) =>
      row(name).querySelector('.astryx-dropdown-menu-radio');
    expect(row('Newest')).toHaveAttribute('aria-checked', 'true');
    expect(row('Oldest')).toHaveAttribute('aria-checked', 'false');
    // The chosen row draws the check glyph, carrying the menu's target and
    // its state; no radio circle is drawn anywhere.
    expect(mark('Newest')).toHaveClass('astryx-icon');
    expect(mark('Newest')).toHaveAttribute('data-checked', 'checked');
    expect(mark('Newest')).toHaveAttribute('aria-hidden', 'true');
    expect(document.querySelector('.astryx-radio')).toBeNull();
    // The other row draws no mark.
    expect(mark('Oldest')).toBeNull();

    // A new choice moves the mark.
    await user.click(row('Oldest'));
    expect(row('Oldest')).toHaveAttribute('aria-checked', 'true');
    expect(mark('Oldest')).toHaveClass('astryx-icon');
    expect(mark('Newest')).toBeNull();
  });

  it('calls onChange with the selected value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DropdownMenu button={{label: 'Sort'}}>
        <DropdownMenuRadioGroup
          value="newest"
          onChange={onChange}
          label="Sort by">
          <DropdownMenuRadioItem value="newest" label="Newest" />
          <DropdownMenuRadioItem value="oldest" label="Oldest" />
        </DropdownMenuRadioGroup>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', {name: /Sort/}));
    await user.click(
      screen.getByRole('menuitemradio', {name: 'Oldest', hidden: true}),
    );
    expect(onChange).toHaveBeenCalledWith('oldest');
  });

  it('throws when a radio item is used outside a group', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <DropdownMenu button={{label: 'Sort'}}>
          <DropdownMenuRadioItem value="x" label="X" />
        </DropdownMenu>,
      ),
    ).toThrow(/DropdownMenuRadioGroup/);
    spy.mockRestore();
  });
});

describe('selectable item refs', () => {
  it('a ref reaches the menuitemcheckbox element', () => {
    const ref = vi.fn();
    render(
      <DropdownMenu button={{label: 'View'}}>
        <DropdownMenuCheckboxItem
          label="Show archived"
          value={false}
          onChange={() => {}}
          ref={ref}
        />
      </DropdownMenu>,
    );
    expect(ref).toHaveBeenCalledWith(
      screen.getByRole('menuitemcheckbox', {
        name: 'Show archived',
        hidden: true,
      }),
    );
  });

  it('a ref reaches the menuitemradio element', () => {
    const ref = vi.fn();
    render(
      <DropdownMenu button={{label: 'Sort'}}>
        <DropdownMenuRadioGroup
          label="Sort by"
          value="newest"
          onChange={() => {}}>
          <DropdownMenuRadioItem value="newest" label="Newest" ref={ref} />
          <DropdownMenuRadioItem value="oldest" label="Oldest" />
        </DropdownMenuRadioGroup>
      </DropdownMenu>,
    );
    expect(ref).toHaveBeenCalledWith(
      screen.getByRole('menuitemradio', {name: 'Newest', hidden: true}),
    );
  });
});
