// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CheckboxList.test.tsx
 * @input Uses vitest, @testing-library/react, CheckboxList, CheckboxListItem
 * @output Unit tests for CheckboxList and CheckboxListItem behavior
 * @position Testing; validates CheckboxList.tsx and CheckboxListItem.tsx implementation
 *
 * SYNC: When CheckboxList.tsx or CheckboxListItem.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {CheckboxList} from './CheckboxList';
import {CheckboxListItem} from './CheckboxListItem';
import {List} from '../List/List';

describe('CheckboxList', () => {
  it('renders with label', () => {
    render(
      <CheckboxList label="Preferences" value={[]} onChange={() => {}}>
        <CheckboxListItem label="Option A" value="a" />
      </CheckboxList>,
    );
    expect(screen.getByText('Preferences')).toBeInTheDocument();
  });

  it('renders checkbox items', () => {
    render(
      <CheckboxList label="Preferences" value={[]} onChange={() => {}}>
        <CheckboxListItem label="Option A" value="a" />
        <CheckboxListItem label="Option B" value="b" />
        <CheckboxListItem label="Option C" value="c" />
      </CheckboxList>,
    );
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
  });

  it('checks the correct items based on value prop', () => {
    render(
      <CheckboxList
        label="Preferences"
        value={['a', 'c']}
        onChange={() => {}}>
        <CheckboxListItem label="Option A" value="a" />
        <CheckboxListItem label="Option B" value="b" />
        <CheckboxListItem label="Option C" value="c" />
      </CheckboxList>,
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
    expect(checkboxes[2]).toBeChecked();
  });

  it('calls onChange with added value when checking an item', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <CheckboxList
        label="Preferences"
        value={['a']}
        onChange={handleChange}>
        <CheckboxListItem label="Option A" value="a" />
        <CheckboxListItem label="Option B" value="b" />
      </CheckboxList>,
    );

    await user.click(screen.getByRole('checkbox', {name: 'Option B'}));
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(['a', 'b']);
  });

  it('calls onChange with removed value when unchecking an item', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <CheckboxList
        label="Preferences"
        value={['a', 'b']}
        onChange={handleChange}>
        <CheckboxListItem label="Option A" value="a" />
        <CheckboxListItem label="Option B" value="b" />
      </CheckboxList>,
    );

    await user.click(screen.getByRole('checkbox', {name: 'Option A'}));
    expect(handleChange).toHaveBeenCalledWith(['b']);
  });

  it('disables all checkboxes when group isDisabled is true', () => {
    render(
      <CheckboxList
        label="Preferences"
        value={[]}
        onChange={() => {}}
        isDisabled>
        <CheckboxListItem label="Option A" value="a" />
        <CheckboxListItem label="Option B" value="b" />
      </CheckboxList>,
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeDisabled();
    expect(checkboxes[1]).toBeDisabled();
  });

  it('does not call onChange when group is disabled', () => {
    const handleChange = vi.fn();
    render(
      <CheckboxList
        label="Preferences"
        value={[]}
        onChange={handleChange}
        isDisabled>
        <CheckboxListItem label="Option A" value="a" />
      </CheckboxList>,
    );

    // Use fireEvent since userEvent correctly blocks pointer-events: none
    fireEvent.click(screen.getByRole('checkbox', {name: 'Option A'}));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('disables individual item when item isDisabled is true', () => {
    render(
      <CheckboxList label="Preferences" value={[]} onChange={() => {}}>
        <CheckboxListItem label="Option A" value="a" />
        <CheckboxListItem label="Option B" value="b" isDisabled />
      </CheckboxList>,
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).not.toBeDisabled();
    expect(checkboxes[1]).toBeDisabled();
  });

  it('throws when item has no value prop inside collection-mode CheckboxList', () => {
    // Suppress console.error for expected error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      render(
        <CheckboxList label="Preferences" value={[]} onChange={() => {}}>
          <CheckboxListItem label="No value" />
        </CheckboxList>,
      );
    }).toThrow(
      'CheckboxListItem requires a `value` prop when used inside CheckboxList with a value array.',
    );
    spy.mockRestore();
  });

  it('renders error status message', () => {
    render(
      <CheckboxList
        label="Preferences"
        value={[]}
        onChange={() => {}}
        status={{type: 'error', message: 'Select at least one'}}>
        <CheckboxListItem label="Option A" value="a" />
      </CheckboxList>,
    );
    expect(screen.getByText('Select at least one')).toBeInTheDocument();
  });

  it('renders description on items', () => {
    render(
      <CheckboxList label="Preferences" value={[]} onChange={() => {}}>
        <CheckboxListItem
          label="Option A"
          value="a"
          description="This is option A"
        />
      </CheckboxList>,
    );
    expect(screen.getByText('This is option A')).toBeInTheDocument();
  });

  it('renders description on the checkbox list group', () => {
    render(
      <CheckboxList
        label="Preferences"
        description="Choose your preferences"
        value={[]}
        onChange={() => {}}>
        <CheckboxListItem label="Option A" value="a" />
      </CheckboxList>,
    );
    expect(screen.getByText('Choose your preferences')).toBeInTheDocument();
  });

  it('supports data-testid on CheckboxList', () => {
    render(
      <CheckboxList
        label="Preferences"
        value={[]}
        onChange={() => {}}
        data-testid="my-checkbox-list">
        <CheckboxListItem label="Option A" value="a" />
      </CheckboxList>,
    );
    expect(screen.getByTestId('my-checkbox-list')).toBeInTheDocument();
  });

  it('passes spacious density through to checkbox list items', () => {
    render(
      <CheckboxList
        label="Preferences"
        density="spacious"
        value={[]}
        onChange={() => {}}>
        <CheckboxListItem label="Option A" value="a" />
      </CheckboxList>,
    );
    expect(screen.getByRole('listitem').className).toContain('spacious');
  });

  it('supports data-testid on CheckboxListItem', () => {
    render(
      <CheckboxList label="Preferences" value={[]} onChange={() => {}}>
        <CheckboxListItem
          label="Option A"
          value="a"
          data-testid="my-checkbox-item"
        />
      </CheckboxList>,
    );
    expect(screen.getByTestId('my-checkbox-item')).toBeInTheDocument();
  });

  it('renders endContent', () => {
    render(
      <CheckboxList label="Preferences" value={[]} onChange={() => {}}>
        <CheckboxListItem
          label="Option A"
          value="a"
          endContent={<span data-testid="end">Badge</span>}
        />
      </CheckboxList>,
    );
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('does not toggle when clicking interactive endContent', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <CheckboxList label="Preferences" value={[]} onChange={handleChange}>
        <CheckboxListItem
          label="Option A"
          value="a"
          endContent={
            <button type="button" data-testid="end-btn">
              Action
            </button>
          }
        />
      </CheckboxList>,
    );

    await user.click(screen.getByTestId('end-btn'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('allows standalone items inside CheckboxList without parent value (select-all pattern)', async () => {
    const user = userEvent.setup();
    const handleSelectAll = vi.fn();
    const handleCheck = vi.fn();
    render(
      <CheckboxList label="Columns" hasDividers>
        <CheckboxListItem
          label="Select all"
          isChecked={false}
          onCheck={handleSelectAll}
        />
        <CheckboxListItem
          label="Name"
          isChecked={true}
          onCheck={handleCheck}
        />
        <CheckboxListItem
          label="Email"
          isChecked={false}
          onCheck={handleCheck}
        />
      </CheckboxList>,
    );

    // All items render without throwing
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);

    // Select all triggers its own handler
    await user.click(screen.getByRole('checkbox', {name: 'Select all'}));
    expect(handleSelectAll).toHaveBeenCalledWith(true);
    expect(handleCheck).not.toHaveBeenCalled();
  });
});

describe('CheckboxListItem standalone mode', () => {
  it('uses isChecked/onCheck for standalone control', async () => {
    const user = userEvent.setup();
    const handleCheck = vi.fn();
    render(
      <List>
        <CheckboxListItem
          label="Accept terms"
          isChecked={false}
          onCheck={handleCheck}
        />
      </List>,
    );

    await user.click(screen.getByRole('checkbox', {name: 'Accept terms'}));
    expect(handleCheck).toHaveBeenCalledWith(true);
  });

  it('renders checked state from isChecked prop', () => {
    render(
      <List>
        <CheckboxListItem label="Checked item" isChecked={true} />
      </List>,
    );
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('renders unchecked when no isChecked provided', () => {
    render(
      <List>
        <CheckboxListItem label="Default item" />
      </List>,
    );
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('does not throw without value prop in standalone mode', () => {
    expect(() => {
      render(
        <List>
          <CheckboxListItem label="No value needed" />
        </List>,
      );
    }).not.toThrow();
  });

  it('renders indeterminate state', () => {
    render(
      <List>
        <CheckboxListItem label="Partial" isChecked="indeterminate" />
      </List>,
    );
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
  });

  it('calls onCheck with true when clicking indeterminate item', async () => {
    const user = userEvent.setup();
    const handleCheck = vi.fn();
    render(
      <List>
        <CheckboxListItem
          label="Partial"
          isChecked="indeterminate"
          onCheck={handleCheck}
        />
      </List>,
    );

    await user.click(screen.getByRole('checkbox', {name: 'Partial'}));
    expect(handleCheck).toHaveBeenCalledWith(true);
  });
});

describe('CheckboxListItem ARIA props', () => {
  it('sets aria-checked on the list item in collection mode', () => {
    render(
      <CheckboxList label="Prefs" value={['a']} onChange={() => {}}>
        <CheckboxListItem label="Option A" value="a" />
        <CheckboxListItem label="Option B" value="b" />
      </CheckboxList>,
    );
    const items = screen.getAllByRole('listitem');
    // Item A is checked
    expect(items[0]).toHaveAttribute('aria-checked', 'true');
    // Item B is not checked
    expect(items[1]).toHaveAttribute('aria-checked', 'false');
  });

  it('sets aria-checked on the list item in standalone mode', () => {
    render(
      <List>
        <CheckboxListItem label="Done" isChecked={true} />
        <CheckboxListItem label="Todo" isChecked={false} />
      </List>,
    );
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveAttribute('aria-checked', 'true');
    expect(items[1]).toHaveAttribute('aria-checked', 'false');
  });

  it('sets aria-checked="mixed" for indeterminate items', () => {
    render(
      <List>
        <CheckboxListItem label="Partial" isChecked="indeterminate" />
      </List>,
    );
    const item = screen.getByRole('listitem');
    expect(item).toHaveAttribute('aria-checked', 'mixed');
  });

  it('does not mark items aria-busy when idle', () => {
    render(
      <CheckboxList label="Prefs" value={['a']} onChange={() => {}}>
        <CheckboxListItem label="Option A" value="a" />
      </CheckboxList>,
    );
    const item = screen.getByRole('listitem');
    expect(item).not.toHaveAttribute('aria-busy');
  });

  it('marks the item aria-busy when item-level isLoading is set', () => {
    render(
      <CheckboxList label="Prefs" value={['a']} onChange={() => {}}>
        <CheckboxListItem label="Option A" value="a" isLoading />
        <CheckboxListItem label="Option B" value="b" />
      </CheckboxList>,
    );
    const [itemA, itemB] = screen.getAllByRole('listitem');
    expect(itemA).toHaveAttribute('aria-busy', 'true');
    // Loading is per-item — sibling items are unaffected.
    expect(itemB).not.toHaveAttribute('aria-busy');
  });

  it('renders a spinner inside the checkbox when item isLoading is set', () => {
    render(
      <CheckboxList label="Prefs" value={['a']} onChange={() => {}}>
        <CheckboxListItem label="Option A" value="a" isLoading />
      </CheckboxList>,
    );
    // The spinner is decorative — it lives inside the checkbox's
    // aria-hidden visual box, so query with hidden:true. The accessible
    // loading signal is `aria-busy` on the item (asserted above).
    expect(screen.getByRole('status', {hidden: true})).toBeInTheDocument();
  });

  it('does not toggle when item-level isLoading is set', () => {
    const onChange = vi.fn();
    render(
      <CheckboxList label="Prefs" value={[]} onChange={onChange}>
        <CheckboxListItem label="Option A" value="a" isLoading />
      </CheckboxList>,
    );
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows a spinner only on the toggled item while changeAction is pending', async () => {
    // changeAction returns a promise that never resolves, so the pending
    // (loading) state persists for assertions.
    const changeAction = vi.fn(async () => {
      await new Promise<void>(() => {});
    });
    render(
      <CheckboxList
        label="Prefs"
        value={[]}
        onChange={() => {}}
        changeAction={changeAction}>
        <CheckboxListItem label="Option A" value="a" />
        <CheckboxListItem label="Option B" value="b" />
      </CheckboxList>,
    );

    const [itemA, itemB] = screen.getAllByRole('listitem');
    // Toggle Option A.
    fireEvent.click(within(itemA).getByRole('checkbox'));

    // The toggled item becomes busy and shows a spinner; the sibling stays idle.
    // The spinner is decorative (inside the aria-hidden box), so query hidden.
    expect(
      await within(itemA).findByRole('status', {hidden: true}),
    ).toBeInTheDocument();
    expect(itemA).toHaveAttribute('aria-busy', 'true');
    expect(itemB).not.toHaveAttribute('aria-busy');
    expect(
      within(itemB).queryByRole('status', {hidden: true}),
    ).not.toBeInTheDocument();
    expect(changeAction).toHaveBeenCalledWith(['a']);
  });

  it('forwards arbitrary aria attributes to the list item DOM element', () => {
    render(
      <List>
        <CheckboxListItem
          label="Custom aria"
          aria-describedby="help-text"
          aria-label="custom label"
        />
      </List>,
    );
    const item = screen.getByRole('listitem');
    expect(item).toHaveAttribute('aria-describedby', 'help-text');
    expect(item).toHaveAttribute('aria-label', 'custom label');
  });
});
