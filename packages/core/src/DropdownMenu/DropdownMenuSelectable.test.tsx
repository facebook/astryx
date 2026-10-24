// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file DropdownMenuSelectable.test.tsx
 * @input vitest, @testing-library/react, DropdownMenu + selectable items
 * @output Component-local callback, composition, and marker styling tests for
 *   DropdownMenuCheckboxItem / RadioGroup / RadioItem (#3829)
 * @position Shared checkbox and radio-group role, name, state, and interaction
 *   outcomes live in their reusable contracts; Menu retains navigation.
 */

import {createElement, Fragment, useState} from 'react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {act, render, screen, fireEvent, waitFor} from '@testing-library/react';
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
    expect(HTMLElement.prototype.hidePopover).not.toHaveBeenCalled();
  });

  it('composes the caller click handler with the checked-state change', async () => {
    const user = userEvent.setup();
    const calls: string[] = [];
    const onChange = vi.fn(() => calls.push('change'));
    const onClick = vi.fn(() => calls.push('click'));
    render(
      <DropdownMenu button={{label: 'View'}}>
        <DropdownMenuCheckboxItem
          label="Show archived"
          value={false}
          onChange={onChange}
          onClick={onClick}
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
    expect(onChange).toHaveBeenCalledWith(true);
    expect(onClick).toHaveBeenCalledOnce();
    expect(calls).toEqual(['change', 'click']);
  });

  it('composes the caller click handler on keyboard activation', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onClick = vi.fn();
    render(
      <DropdownMenu button={{label: 'View'}}>
        <DropdownMenuCheckboxItem
          label="Show archived"
          value={false}
          onChange={onChange}
          onClick={onClick}
        />
      </DropdownMenu>,
    );
    const trigger = screen.getByRole('button', {name: /View/});
    trigger.focus();
    await user.keyboard('{Enter}');
    const item = screen.getByRole('menuitemcheckbox', {
      name: /Show archived/,
      hidden: true,
    });
    await waitFor(() => expect(item).toHaveFocus());
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(true);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('composes the caller pointer-move handler with menu hover focus', async () => {
    const user = userEvent.setup();
    const onPointerMove = vi.fn(() => document.activeElement);
    render(
      <DropdownMenu button={{label: 'View'}}>
        <DropdownMenuCheckboxItem
          label="Show archived"
          value={false}
          onPointerMove={onPointerMove}
        />
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', {name: /View/}));
    const item = screen.getByRole('menuitemcheckbox', {
      name: /Show archived/,
      hidden: true,
    });
    fireEvent.pointerMove(item, {pointerType: 'mouse'});
    expect(item).toHaveFocus();
    expect(onPointerMove).toHaveBeenCalledOnce();
    expect(onPointerMove).toHaveReturnedWith(item);
  });

  it('does not call consumer activation handlers when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onClick = vi.fn();
    render(
      <DropdownMenu button={{label: 'View'}}>
        <DropdownMenuCheckboxItem
          label="Show archived"
          value={false}
          onChange={onChange}
          onClick={onClick}
          isDisabled
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
    expect(onChange).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('closes after a successful toggle only when requested', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu button={{label: 'View'}}>
        <DropdownMenuCheckboxItem
          label="Show archived"
          value={false}
          onChange={() => {}}
          hasCloseOnSelect
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
    expect(HTMLElement.prototype.hidePopover).toHaveBeenCalledOnce();
  });

  it('maps a small menu to the small shared checkbox marker', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu button={{label: 'View', size: 'sm'}}>
        <DropdownMenuCheckboxItem label="Show archived" value={true} />
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', {name: /View/}));
    const row = screen.getByRole('menuitemcheckbox', {
      name: /Show archived/,
      hidden: true,
    });
    expect(row).toHaveAttribute('aria-checked', 'true');
    expect(row.querySelector('.astryx-checkbox-indicator')).toHaveAttribute(
      'data-size',
      'sm',
    );
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
    // `astryx-checkbox-indicator` too).
    const marker = row.querySelector('.astryx-checkbox-indicator');
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
    expect(box).toHaveClass('astryx-radio-indicator');
    expect(box).toHaveAttribute('data-size', 'md');
    expect(box).toHaveAttribute('data-checked', 'checked');
    expect(
      box?.querySelector('.astryx-radio-indicator-dot'),
    ).toBeInTheDocument();

    // The unchecked radio still draws its circle, without the dot.
    const unchecked = screen.getByRole('menuitemradio', {
      name: 'Oldest',
      hidden: true,
    });
    const uncheckedIndicator = unchecked.querySelector(
      '.astryx-radio-indicator',
    );
    expect(uncheckedIndicator).toBeInTheDocument();
    expect(uncheckedIndicator).not.toHaveAttribute('data-checked');
    expect(
      uncheckedIndicator?.querySelector('.astryx-radio-indicator-dot'),
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
    expect(
      screen.getByRole('menuitemradio', {name: 'Newest', hidden: true}),
    ).toHaveAttribute('aria-checked', 'true');
    expect(
      screen.getByRole('menuitemradio', {name: 'Oldest', hidden: true}),
    ).toHaveAttribute('aria-checked', 'false');
    expect(HTMLElement.prototype.hidePopover).toHaveBeenCalledTimes(1);
  });

  it('composes the caller click handler with the selection', async () => {
    const user = userEvent.setup();
    const calls: string[] = [];
    const onChange = vi.fn(() => calls.push('change'));
    const onClick = vi.fn(() => calls.push('click'));
    render(
      <DropdownMenu button={{label: 'Sort'}}>
        <DropdownMenuRadioGroup
          value="newest"
          onChange={onChange}
          label="Sort by"
          hasCloseOnSelect={false}>
          <DropdownMenuRadioItem value="newest" label="Newest" />
          <DropdownMenuRadioItem
            value="oldest"
            label="Oldest"
            onClick={onClick}
          />
        </DropdownMenuRadioGroup>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', {name: /Sort/}));
    await user.click(
      screen.getByRole('menuitemradio', {name: 'Oldest', hidden: true}),
    );
    expect(onChange).toHaveBeenCalledWith('oldest');
    expect(onClick).toHaveBeenCalledOnce();
    expect(calls).toEqual(['change', 'click']);
  });

  it('composes the caller pointer-move handler with menu hover focus', async () => {
    const user = userEvent.setup();
    const onPointerMove = vi.fn(() => document.activeElement);
    render(
      <DropdownMenu button={{label: 'Sort'}}>
        <DropdownMenuRadioGroup
          value="newest"
          onChange={() => {}}
          label="Sort by">
          <DropdownMenuRadioItem value="newest" label="Newest" />
          <DropdownMenuRadioItem
            value="oldest"
            label="Oldest"
            onPointerMove={onPointerMove}
          />
        </DropdownMenuRadioGroup>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', {name: /Sort/}));
    const item = screen.getByRole('menuitemradio', {
      name: 'Oldest',
      hidden: true,
    });
    fireEvent.pointerMove(item, {pointerType: 'mouse'});
    expect(item).toHaveFocus();
    expect(onPointerMove).toHaveBeenCalledOnce();
    expect(onPointerMove).toHaveReturnedWith(item);
  });

  it('composes the caller click handler on keyboard activation', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onClick = vi.fn();
    render(
      <DropdownMenu button={{label: 'Sort'}}>
        <DropdownMenuRadioGroup
          value="oldest"
          onChange={onChange}
          label="Sort by">
          <DropdownMenuRadioItem
            value="newest"
            label="Newest"
            onClick={onClick}
          />
          <DropdownMenuRadioItem value="oldest" label="Oldest" />
        </DropdownMenuRadioGroup>
      </DropdownMenu>,
    );
    screen.getByRole('button', {name: /Sort/}).focus();
    await user.keyboard('{Enter}');
    const item = screen.getByRole('menuitemradio', {
      name: 'Newest',
      hidden: true,
    });
    await waitFor(() => expect(item).toHaveFocus());
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('newest');
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not select, close, or call the caller click handler when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onClick = vi.fn();
    render(
      <DropdownMenu button={{label: 'Sort'}}>
        <DropdownMenuRadioGroup
          value="newest"
          onChange={onChange}
          label="Sort by">
          <DropdownMenuRadioItem value="newest" label="Newest" />
          <DropdownMenuRadioItem
            value="oldest"
            label="Oldest"
            onClick={onClick}
            isDisabled
          />
        </DropdownMenuRadioGroup>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', {name: /Sort/}));
    const item = screen.getByRole('menuitemradio', {
      name: 'Oldest',
      hidden: true,
    });
    expect(item).toHaveAttribute('aria-disabled', 'true');
    await user.click(item);
    // A screen reader's activation reaches the row as a detail-0 click that
    // the menu's press model does not intercept.
    fireEvent.click(item, {detail: 0});
    expect(onChange).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
    expect(item).toHaveAttribute('aria-checked', 'false');
    expect(HTMLElement.prototype.hidePopover).not.toHaveBeenCalled();
  });

  it('keeps the menu open while controlled selection updates when requested', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    function ControlledGroup() {
      const [value, setValue] = useState('newest');
      return (
        <DropdownMenu button={{label: 'Sort'}}>
          <DropdownMenuRadioGroup
            value={value}
            onChange={nextValue => {
              onChange(nextValue);
              setValue(nextValue);
            }}
            label="Sort by"
            hasCloseOnSelect={false}>
            <DropdownMenuRadioItem value="newest" label="Newest" />
            <DropdownMenuRadioItem value="oldest" label="Oldest" />
          </DropdownMenuRadioGroup>
        </DropdownMenu>
      );
    }

    render(<ControlledGroup />);
    await user.click(screen.getByRole('button', {name: /Sort/}));
    const oldest = screen.getByRole('menuitemradio', {
      name: 'Oldest',
      hidden: true,
    });
    await user.click(oldest);

    expect(onChange).toHaveBeenCalledWith('oldest');
    expect(oldest).toHaveAttribute('aria-checked', 'true');
    expect(HTMLElement.prototype.hidePopover).not.toHaveBeenCalled();
  });

  it('names and composes the group root when no value matches', async () => {
    const user = userEvent.setup();
    const ref = vi.fn();
    const onClick = vi.fn();
    render(
      <>
        <span id="sort-label">Visible sort label</span>
        <DropdownMenu button={{label: 'Sort'}}>
          <DropdownMenuRadioGroup
            ref={ref}
            role="tree"
            aria-label="Consumer label"
            aria-labelledby="sort-label"
            data-owner="consumer"
            className="consumer-group"
            style={{inlineSize: 240}}
            onClick={onClick}
            value={undefined}
            onChange={() => {}}
            label="Sort fallback">
            <DropdownMenuRadioItem value="newest" label="Newest" />
            <DropdownMenuRadioItem value="oldest" label="Oldest" />
          </DropdownMenuRadioGroup>
        </DropdownMenu>
      </>,
    );
    await user.click(screen.getByRole('button', {name: /Sort/}));

    const group = screen.getByRole('group', {
      name: 'Visible sort label',
      hidden: true,
    });
    expect(group).toHaveAttribute('role', 'group');
    expect(group).toHaveAttribute('aria-label', 'Sort fallback');
    expect(group).toHaveAttribute('aria-labelledby', 'sort-label');
    expect(group).toHaveAttribute('data-owner', 'consumer');
    expect(group).toHaveClass('consumer-group');
    expect(group).toHaveStyle({inlineSize: '240px'});
    expect(ref).toHaveBeenCalledWith(group);
    expect(
      screen
        .getAllByRole('menuitemradio', {hidden: true})
        .every(item => item.getAttribute('aria-checked') === 'false'),
    ).toBe(true);

    fireEvent.click(group);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('composes caller root inputs without replacing the row semantics', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu button={{label: 'Sort'}}>
        <DropdownMenuRadioGroup
          value="newest"
          onChange={() => {}}
          label="Sort by">
          <DropdownMenuRadioItem
            value="newest"
            label="Newest"
            data-owner="consumer"
            aria-describedby="sort-hint"
            className="consumer-row"
            style={{inlineSize: 240}}
          />
        </DropdownMenuRadioGroup>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', {name: /Sort/}));
    const item = screen.getByRole('menuitemradio', {
      name: 'Newest',
      hidden: true,
    });
    expect(item).toHaveAttribute('data-owner', 'consumer');
    expect(item).toHaveAttribute('aria-describedby', 'sort-hint');
    expect(item).toHaveAttribute('aria-checked', 'true');
    expect(item).toHaveClass('consumer-row');
    expect(item).toHaveClass('astryx-dropdown-menu-item');
    expect(item).toHaveStyle({inlineSize: '240px'});
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

describe('DropdownMenuRadioGroup title', () => {
  const h = {hidden: true} as const;

  async function openMenu(group: React.ReactNode) {
    const user = userEvent.setup();
    render(
      <DropdownMenu button={{label: 'Filter'}}>
        <DropdownMenuCheckboxItem
          label="Show drafts"
          value
          onChange={() => {}}
        />
        {group}
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', {name: /Filter/}));
    // A pointer open focuses the menu itself; let that land first.
    const menu = screen.getByRole('menu', h);
    await waitFor(() => expect(menu).toHaveFocus());
    return user;
  }

  it('names the group by a visible heading, so a titled radio set is one group with one name', async () => {
    await openMenu(
      <DropdownMenuRadioGroup
        value="hide"
        onChange={() => {}}
        title="Hidden files">
        <DropdownMenuRadioItem value="hide" label="Hide hidden files" />
        <DropdownMenuRadioItem value="show" label="Show hidden files" />
      </DropdownMenuRadioGroup>,
    );
    const groups = screen.getAllByRole('group', h);
    expect(groups).toHaveLength(1);
    const [group] = groups;
    expect(group).toHaveAccessibleName('Hidden files');
    expect(group).not.toHaveAttribute('aria-label');
    const heading = screen.getByText('Hidden files');
    expect(group).toHaveAttribute('aria-labelledby', heading.id);
    // The heading is the menu's section heading: same theme target as a
    // DropdownMenuGroup's, and not a row.
    expect(heading).toHaveClass('astryx-dropdown-menu-section-heading');
    expect(heading).not.toHaveAttribute('role');
    expect(group.firstElementChild).toBe(heading);
    expect(
      screen
        .getAllByRole('menuitemradio', h)
        .map(item => item.getAttribute('aria-checked')),
    ).toEqual(['true', 'false']);
  });

  it('skips the heading in arrow-key order and typeahead', async () => {
    const user = await openMenu(
      <DropdownMenuRadioGroup
        value="hide"
        onChange={() => {}}
        title="Hidden files">
        <DropdownMenuRadioItem value="hide" label="Hide hidden files" />
        <DropdownMenuRadioItem value="show" label="Show hidden files" />
      </DropdownMenuRadioGroup>,
    );
    const drafts = screen.getByRole('menuitemcheckbox', {
      name: 'Show drafts',
      ...h,
    });
    act(() => drafts.focus());
    await user.keyboard('{ArrowDown}');
    expect(
      screen.getByRole('menuitemradio', {name: 'Hide hidden files', ...h}),
    ).toHaveFocus();
    // Typing the heading's first letter lands on a row starting with it.
    act(() => drafts.focus());
    await user.keyboard('h');
    expect(
      screen.getByRole('menuitemradio', {name: 'Hide hidden files', ...h}),
    ).toHaveFocus();
  });

  it.each([
    ['a label', {label: 'Hidden files visibility'}],
    ['an aria-label', {'aria-label': 'Hidden files visibility'}],
  ])(
    'with %s too, the visible title still names the group, and the other name warns in development',
    async (_prop, nameProps) => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        await openMenu(
          <DropdownMenuRadioGroup
            value="hide"
            onChange={() => {}}
            title="Hidden files"
            {...nameProps}>
            <DropdownMenuRadioItem value="hide" label="Hide hidden files" />
          </DropdownMenuRadioGroup>,
        );
        const group = screen.getByRole('group', h);
        // The name holds the heading a speech-input user reads.
        expect(group).toHaveAccessibleName('Hidden files');
        expect(group).toHaveAttribute(
          'aria-labelledby',
          screen.getByText('Hidden files').id,
        );
        expect(group).not.toHaveAttribute('aria-label');
        expect(warn).toHaveBeenCalledWith(
          expect.stringContaining('The title names the group'),
        );
      } finally {
        warn.mockRestore();
      }
    },
  );

  it('a label that repeats the title does not warn', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      await openMenu(
        <DropdownMenuRadioGroup
          value="hide"
          onChange={() => {}}
          label="Hidden files"
          title="Hidden files">
          <DropdownMenuRadioItem value="hide" label="Hide hidden files" />
        </DropdownMenuRadioGroup>,
      );
      expect(screen.getByRole('group', h)).toHaveAccessibleName('Hidden files');
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });

  it('without a title nothing changes: the label names the group and no heading renders', async () => {
    await openMenu(
      <DropdownMenuRadioGroup
        value="newest"
        onChange={() => {}}
        label="Sort by">
        <DropdownMenuRadioItem value="newest" label="Newest" />
      </DropdownMenuRadioGroup>,
    );
    const group = screen.getByRole('group', h);
    expect(group).toHaveAttribute('aria-label', 'Sort by');
    expect(group).not.toHaveAttribute('aria-labelledby');
    expect(
      group.querySelector('.astryx-dropdown-menu-section-heading'),
    ).toBeNull();
  });

  it("names the group by a caller's aria-label when label is omitted and there is no title, and does not warn", async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      await openMenu(
        <DropdownMenuRadioGroup
          value="hide"
          onChange={() => {}}
          aria-label="Hidden files visibility">
          <DropdownMenuRadioItem value="hide" label="Hide hidden files" />
        </DropdownMenuRadioGroup>,
      );
      const group = screen.getByRole('group', h);
      expect(group).toHaveAccessibleName('Hidden files visibility');
      expect(group).not.toHaveAttribute('aria-labelledby');
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });

  it("reads a caller's aria-labelledby after the title, which still names the group first", async () => {
    const user = userEvent.setup();
    render(
      <>
        <span id="radio-set-name">Visibility</span>
        <DropdownMenu button={{label: 'Filter'}}>
          <DropdownMenuRadioGroup
            value="hide"
            onChange={() => {}}
            aria-labelledby="radio-set-name"
            title="Hidden files">
            <DropdownMenuRadioItem value="hide" label="Hide hidden files" />
          </DropdownMenuRadioGroup>
        </DropdownMenu>
      </>,
    );
    await user.click(screen.getByRole('button', {name: /Filter/}));
    const group = await screen.findByRole('group', h);
    expect(group).toHaveAttribute(
      'aria-labelledby',
      `${screen.getByText('Hidden files').id} radio-set-name`,
    );
    expect(group).toHaveAccessibleName('Hidden files Visibility');
  });

  function NoTitle() {
    return null;
  }
  it.each([
    ['true', true, 'Give the group a label or a title'],
    [
      'an empty fragment',
      createElement(Fragment),
      'The title renders no text, so it does not name the group',
    ],
    [
      'a component that returns null',
      createElement(NoTitle),
      'The title renders no text, so it does not name the group',
    ],
  ])(
    'a title that renders no text, %s, counts as no title: the label names the group, no heading shows, and an unnamed group warns',
    async (_case, title, unnamedWarning) => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        const {unmount} = render(
          <DropdownMenu button={{label: 'Filter'}}>
            <DropdownMenuRadioGroup
              value="hide"
              onChange={() => {}}
              label="Hidden files"
              title={title}>
              <DropdownMenuRadioItem value="hide" label="Hide hidden files" />
            </DropdownMenuRadioGroup>
          </DropdownMenu>,
        );
        await userEvent
          .setup()
          .click(screen.getByRole('button', {name: /Filter/}));
        const group = await screen.findByRole('group', h);
        expect(group).toHaveAccessibleName('Hidden files');
        expect(group).not.toHaveAttribute('aria-labelledby');
        const heading = group.querySelector(
          '.astryx-dropdown-menu-section-heading',
        );
        // The heading, when one mounts to be read, shows nothing.
        if (heading != null) {
          expect(getComputedStyle(heading).display).toBe('none');
        }
        // Beside a title that counts, a different label would warn.
        expect(warn).not.toHaveBeenCalledWith(
          expect.stringContaining('The title names the group'),
        );
        unmount();

        await openMenu(
          <DropdownMenuRadioGroup
            value="hide"
            onChange={() => {}}
            title={title}>
            <DropdownMenuRadioItem value="hide" label="Hide hidden files" />
          </DropdownMenuRadioGroup>,
        );
        expect(warn).toHaveBeenCalledWith(
          expect.stringContaining(unnamedWarning),
        );
      } finally {
        warn.mockRestore();
      }
    },
  );

  it.each([
    ['the same text', 'Hidden files', false],
    ['the same text with other spacing', ' Hidden   files ', false],
    ['other text', 'Hidden files visibility', true],
  ])(
    "compares a label with the title's rendered text: a node title with %s warns only when they differ",
    async (_case, label, warns) => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        await openMenu(
          <DropdownMenuRadioGroup
            value="hide"
            onChange={() => {}}
            label={label}
            title={
              <span>
                Hidden <b>files</b>
              </span>
            }>
            <DropdownMenuRadioItem value="hide" label="Hide hidden files" />
          </DropdownMenuRadioGroup>,
        );
        expect(screen.getByRole('group', h)).toHaveAccessibleName(
          'Hidden files',
        );
        const warned = warn.mock.calls.some(call =>
          String(call[0]).includes('The title names the group'),
        );
        expect(warned).toBe(warns);
      } finally {
        warn.mockRestore();
      }
    },
  );

  it('reads the title again on each render, so a title that starts rendering text names the group', async () => {
    function LateTitle({text}: {text: string | null}) {
      return text;
    }
    function Menu({text}: {text: string | null}) {
      return (
        <DropdownMenu button={{label: 'Filter'}}>
          <DropdownMenuRadioGroup
            value="hide"
            onChange={() => {}}
            label="Hidden files"
            title={<LateTitle text={text} />}>
            <DropdownMenuRadioItem value="hide" label="Hide hidden files" />
          </DropdownMenuRadioGroup>
        </DropdownMenu>
      );
    }
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const {rerender} = render(<Menu text={null} />);
      await userEvent
        .setup()
        .click(screen.getByRole('button', {name: /Filter/}));
      const group = await screen.findByRole('group', h);
      expect(group).toHaveAccessibleName('Hidden files');

      rerender(<Menu text="Hidden files" />);
      await waitFor(() =>
        expect(group).toHaveAttribute(
          'aria-labelledby',
          screen.getByText('Hidden files').id,
        ),
      );
      expect(
        getComputedStyle(screen.getByText('Hidden files')).display,
      ).not.toBe('none');
      expect(group).not.toHaveAttribute('aria-label');
    } finally {
      warn.mockRestore();
    }
  });

  it('re-reads a title that changes its own text, through its own state, while the menu shows', async () => {
    let setTitleText!: (text: string | null) => void;
    function SelfUpdatingTitle() {
      const [text, setText] = useState<string | null>(null);
      setTitleText = setText;
      return text;
    }
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      await openMenu(
        <DropdownMenuRadioGroup
          value="hide"
          onChange={() => {}}
          label="Hidden files"
          title={<SelfUpdatingTitle />}>
          <DropdownMenuRadioItem value="hide" label="Hide hidden files" />
        </DropdownMenuRadioGroup>,
      );
      const group = screen.getByRole('group', h);
      expect(group).toHaveAccessibleName('Hidden files');

      // Text arrives without the group rendering: the title names the group.
      await act(async () => setTitleText('Sort by'));
      await waitFor(() => expect(group).toHaveAccessibleName('Sort by'));
      expect(getComputedStyle(screen.getByText('Sort by')).display).not.toBe(
        'none',
      );
      expect(group).not.toHaveAttribute('aria-label');

      // Text goes away: the label names the group again, and the heading
      // shows nothing.
      await act(async () => setTitleText(null));
      await waitFor(() => expect(group).toHaveAccessibleName('Hidden files'));
      const heading = group.querySelector(
        '.astryx-dropdown-menu-section-heading',
      );
      expect(heading).not.toBeNull();
      expect(getComputedStyle(heading!).display).toBe('none');
    } finally {
      warn.mockRestore();
    }
  });

  it('titled groups read their titles through one shared observer, not one each', async () => {
    const Original = globalThis.MutationObserver;
    const observedBy = new Map<Node, MutationObserver>();
    class Recording extends Original {
      observe(target: Node, options?: MutationObserverInit) {
        observedBy.set(target, this);
        super.observe(target, options);
      }
    }
    globalThis.MutationObserver = Recording;
    try {
      await openMenu(
        <>
          <DropdownMenuRadioGroup
            value="name"
            onChange={() => {}}
            title="Sort by">
            <DropdownMenuRadioItem value="name" label="Name" />
          </DropdownMenuRadioGroup>
          <DropdownMenuRadioGroup
            value="kind"
            onChange={() => {}}
            title="Group by">
            <DropdownMenuRadioItem value="kind" label="Kind" />
          </DropdownMenuRadioGroup>
        </>,
      );
      const headings = Array.from(
        document.querySelectorAll('.astryx-dropdown-menu-section-heading'),
      );
      expect(headings).toHaveLength(2);
      const [first, second] = headings.map(heading => observedBy.get(heading));
      expect(first).toBeDefined();
      expect(second).toBe(first);
    } finally {
      globalThis.MutationObserver = Original;
    }
  });

  it('a focusable node in the title is not reachable by the arrow keys, as in a DropdownMenuGroup heading', async () => {
    await openMenu(
      <DropdownMenuRadioGroup
        value="hide"
        onChange={() => {}}
        title={
          <>
            Hidden files <button type="button">Info</button>
          </>
        }>
        <DropdownMenuRadioItem value="hide" label="Hide hidden files" />
        <DropdownMenuRadioItem value="show" label="Show hidden files" />
      </DropdownMenuRadioGroup>,
    );
    const menu = screen.getByRole('menu', h);
    const info = screen.getByRole('button', {name: 'Info', ...h});
    const hide = screen.getByRole('menuitemradio', {
      name: 'Hide hidden files',
      ...h,
    });
    const show = screen.getByRole('menuitemradio', {
      name: 'Show hidden files',
      ...h,
    });

    hide.focus();
    fireEvent.keyDown(menu, {key: 'ArrowDown'});
    expect(show).toHaveFocus();
    fireEvent.keyDown(menu, {key: 'ArrowDown'});
    expect(info).not.toHaveFocus();
    fireEvent.keyDown(menu, {key: 'ArrowUp'});
    expect(info).not.toHaveFocus();
  });

  it('warns in development when the group has neither a label nor a title', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      await openMenu(
        <DropdownMenuRadioGroup value="a" onChange={() => {}}>
          <DropdownMenuRadioItem value="a" label="A" />
        </DropdownMenuRadioGroup>,
      );
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining(
          'DropdownMenuRadioGroup: Give the group a label or a title',
        ),
      );
    } finally {
      warn.mockRestore();
    }
  });
});
