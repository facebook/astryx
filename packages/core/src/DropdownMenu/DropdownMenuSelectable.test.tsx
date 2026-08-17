// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DropdownMenuSelectable.test.tsx
 * @input vitest, @testing-library/react, DropdownMenu + selectable items
 * @output Unit tests for DropdownMenuCheckboxItem / RadioGroup / RadioItem (#3829)
 */

import {describe, it, expect, vi, beforeEach} from 'vitest';
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
  it('renders role menuitemcheckbox and reflects checked state', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu button={{label: 'View'}}>
        <DropdownMenuCheckboxItem label="Show archived" value={true} />
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', {name: /View/}));
    expect(
      screen.getByRole('menuitemcheckbox', {
        name: /Show archived/,
        hidden: true,
      }),
    ).toHaveAttribute('aria-checked', 'true');
  });

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
  it('renders a named group with radios reflecting the selected value', async () => {
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
    expect(
      screen.getByRole('menuitemradio', {name: 'Newest', hidden: true}),
    ).toHaveAttribute('aria-checked', 'true');
    expect(
      screen.getByRole('menuitemradio', {name: 'Oldest', hidden: true}),
    ).toHaveAttribute('aria-checked', 'false');
    expect(
      screen.getByRole('group', {name: 'Sort by', hidden: true}),
    ).toBeInTheDocument();
  });

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

  it('names the group from the required label prop', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu button={{label: 'Sort'}}>
        <DropdownMenuRadioGroup
          value="newest"
          onChange={() => {}}
          label="Sort by">
          <DropdownMenuRadioItem value="newest" label="Newest" />
        </DropdownMenuRadioGroup>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', {name: /Sort/}));
    expect(
      screen.getByRole('group', {name: 'Sort by', hidden: true}),
    ).toBeInTheDocument();
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
