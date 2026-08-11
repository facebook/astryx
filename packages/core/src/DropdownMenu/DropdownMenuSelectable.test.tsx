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

  it('keeps the composed checkbox decorative (row is the only announced control)', async () => {
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

    // The composed CheckboxInput is present in the DOM but sits inside an
    // `aria-hidden` + `inert` subtree: it contributes nothing to the row's
    // accessible name and its native <input> is out of the tab order and the
    // accessibility tree, so it is not a second announced/focusable control.
    // (Browsers enforce inert; jsdom does not model its a11y removal, so this
    // asserts the aria-hidden/inert boundary directly rather than via role.)
    const row = screen.getByRole('menuitemcheckbox', {
      name: /Show archived/,
      hidden: true,
    });
    const input = row.querySelector('input[type="checkbox"]');
    expect(input).not.toBeNull();
    const marker = input?.closest('[inert]');
    expect(marker).not.toBeNull();
    expect(marker).toHaveAttribute('aria-hidden', 'true');
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

  it('exposes a themeable slot on the checked radio dot', async () => {
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
    const dot = checked.querySelector('.astryx-dropdown-menu-radio-dot');
    expect(dot).toBeInTheDocument();
    // Mirrors the radio container's visual props/states for consistent theming.
    expect(dot).toHaveAttribute('data-size', 'md');
    expect(dot).toHaveAttribute('data-checked', 'checked');
    // The unchecked radio has no dot, so no dot slot either.
    const unchecked = screen.getByRole('menuitemradio', {
      name: 'Oldest',
      hidden: true,
    });
    expect(
      unchecked.querySelector('.astryx-dropdown-menu-radio-dot'),
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
