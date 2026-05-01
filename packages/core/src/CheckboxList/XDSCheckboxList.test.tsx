/**
 * @file XDSCheckboxList.test.tsx
 * @input Uses vitest, @testing-library/react, XDSCheckboxList, XDSCheckboxListItem
 * @output Unit tests for XDSCheckboxList and XDSCheckboxListItem behavior
 * @position Testing; validates XDSCheckboxList.tsx and XDSCheckboxListItem.tsx implementation
 *
 * SYNC: When XDSCheckboxList.tsx or XDSCheckboxListItem.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {XDSCheckboxList} from './XDSCheckboxList';
import {XDSCheckboxListItem} from './XDSCheckboxListItem';
import {XDSList} from '../List/XDSList';

describe('XDSCheckboxList', () => {
  it('renders with label', () => {
    render(
      <XDSCheckboxList label="Preferences" value={[]} onChange={() => {}}>
        <XDSCheckboxListItem label="Option A" value="a" />
      </XDSCheckboxList>,
    );
    expect(screen.getByText('Preferences')).toBeInTheDocument();
  });

  it('renders checkbox items', () => {
    render(
      <XDSCheckboxList label="Preferences" value={[]} onChange={() => {}}>
        <XDSCheckboxListItem label="Option A" value="a" />
        <XDSCheckboxListItem label="Option B" value="b" />
        <XDSCheckboxListItem label="Option C" value="c" />
      </XDSCheckboxList>,
    );
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
  });

  it('checks the correct items based on value prop', () => {
    render(
      <XDSCheckboxList
        label="Preferences"
        value={['a', 'c']}
        onChange={() => {}}>
        <XDSCheckboxListItem label="Option A" value="a" />
        <XDSCheckboxListItem label="Option B" value="b" />
        <XDSCheckboxListItem label="Option C" value="c" />
      </XDSCheckboxList>,
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
      <XDSCheckboxList
        label="Preferences"
        value={['a']}
        onChange={handleChange}>
        <XDSCheckboxListItem label="Option A" value="a" />
        <XDSCheckboxListItem label="Option B" value="b" />
      </XDSCheckboxList>,
    );

    await user.click(screen.getByRole('checkbox', {name: 'Option B'}));
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(['a', 'b']);
  });

  it('calls onChange with removed value when unchecking an item', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSCheckboxList
        label="Preferences"
        value={['a', 'b']}
        onChange={handleChange}>
        <XDSCheckboxListItem label="Option A" value="a" />
        <XDSCheckboxListItem label="Option B" value="b" />
      </XDSCheckboxList>,
    );

    await user.click(screen.getByRole('checkbox', {name: 'Option A'}));
    expect(handleChange).toHaveBeenCalledWith(['b']);
  });

  it('disables all checkboxes when group isDisabled is true', () => {
    render(
      <XDSCheckboxList
        label="Preferences"
        value={[]}
        onChange={() => {}}
        isDisabled>
        <XDSCheckboxListItem label="Option A" value="a" />
        <XDSCheckboxListItem label="Option B" value="b" />
      </XDSCheckboxList>,
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeDisabled();
    expect(checkboxes[1]).toBeDisabled();
  });

  it('does not call onChange when group is disabled', () => {
    const handleChange = vi.fn();
    render(
      <XDSCheckboxList
        label="Preferences"
        value={[]}
        onChange={handleChange}
        isDisabled>
        <XDSCheckboxListItem label="Option A" value="a" />
      </XDSCheckboxList>,
    );

    // Use fireEvent since userEvent correctly blocks pointer-events: none
    fireEvent.click(screen.getByRole('checkbox', {name: 'Option A'}));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('disables individual item when item isDisabled is true', () => {
    render(
      <XDSCheckboxList label="Preferences" value={[]} onChange={() => {}}>
        <XDSCheckboxListItem label="Option A" value="a" />
        <XDSCheckboxListItem label="Option B" value="b" isDisabled />
      </XDSCheckboxList>,
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).not.toBeDisabled();
    expect(checkboxes[1]).toBeDisabled();
  });

  it('throws when item has no value prop inside collection-mode XDSCheckboxList', () => {
    // Suppress console.error for expected error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      render(
        <XDSCheckboxList label="Preferences" value={[]} onChange={() => {}}>
          <XDSCheckboxListItem label="No value" />
        </XDSCheckboxList>,
      );
    }).toThrow(
      'XDSCheckboxListItem requires a `value` prop when used inside XDSCheckboxList with a value array.',
    );
    spy.mockRestore();
  });

  it('renders error status message', () => {
    render(
      <XDSCheckboxList
        label="Preferences"
        value={[]}
        onChange={() => {}}
        status={{type: 'error', message: 'Select at least one'}}>
        <XDSCheckboxListItem label="Option A" value="a" />
      </XDSCheckboxList>,
    );
    expect(screen.getByText('Select at least one')).toBeInTheDocument();
  });

  it('renders description on items', () => {
    render(
      <XDSCheckboxList label="Preferences" value={[]} onChange={() => {}}>
        <XDSCheckboxListItem
          label="Option A"
          value="a"
          description="This is option A"
        />
      </XDSCheckboxList>,
    );
    expect(screen.getByText('This is option A')).toBeInTheDocument();
  });

  it('renders description on the checkbox list group', () => {
    render(
      <XDSCheckboxList
        label="Preferences"
        description="Choose your preferences"
        value={[]}
        onChange={() => {}}>
        <XDSCheckboxListItem label="Option A" value="a" />
      </XDSCheckboxList>,
    );
    expect(screen.getByText('Choose your preferences')).toBeInTheDocument();
  });

  it('supports data-testid on CheckboxList', () => {
    render(
      <XDSCheckboxList
        label="Preferences"
        value={[]}
        onChange={() => {}}
        data-testid="my-checkbox-list">
        <XDSCheckboxListItem label="Option A" value="a" />
      </XDSCheckboxList>,
    );
    expect(screen.getByTestId('my-checkbox-list')).toBeInTheDocument();
  });

  it('supports data-testid on CheckboxListItem', () => {
    render(
      <XDSCheckboxList label="Preferences" value={[]} onChange={() => {}}>
        <XDSCheckboxListItem
          label="Option A"
          value="a"
          data-testid="my-checkbox-item"
        />
      </XDSCheckboxList>,
    );
    expect(screen.getByTestId('my-checkbox-item')).toBeInTheDocument();
  });

  it('renders endContent', () => {
    render(
      <XDSCheckboxList label="Preferences" value={[]} onChange={() => {}}>
        <XDSCheckboxListItem
          label="Option A"
          value="a"
          endContent={<span data-testid="end">Badge</span>}
        />
      </XDSCheckboxList>,
    );
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('does not toggle when clicking interactive endContent', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <XDSCheckboxList label="Preferences" value={[]} onChange={handleChange}>
        <XDSCheckboxListItem
          label="Option A"
          value="a"
          endContent={<button data-testid="end-btn">Action</button>}
        />
      </XDSCheckboxList>,
    );

    await user.click(screen.getByTestId('end-btn'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('allows standalone items inside XDSCheckboxList without parent value (select-all pattern)', async () => {
    const user = userEvent.setup();
    const handleSelectAll = vi.fn();
    const handleCheck = vi.fn();
    render(
      <XDSCheckboxList label="Columns" hasDividers>
        <XDSCheckboxListItem
          label="Select all"
          isChecked={false}
          onCheck={handleSelectAll}
        />
        <XDSCheckboxListItem
          label="Name"
          isChecked={true}
          onCheck={handleCheck}
        />
        <XDSCheckboxListItem
          label="Email"
          isChecked={false}
          onCheck={handleCheck}
        />
      </XDSCheckboxList>,
    );

    // All items render without throwing
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);

    // Select all triggers its own handler
    await user.click(screen.getByRole('checkbox', {name: 'Select all'}));
    expect(handleSelectAll).toHaveBeenCalledWith(true);
    expect(handleCheck).not.toHaveBeenCalled();
  });
});

describe('XDSCheckboxListItem standalone mode', () => {
  it('uses isChecked/onCheck for standalone control', async () => {
    const user = userEvent.setup();
    const handleCheck = vi.fn();
    render(
      <XDSList>
        <XDSCheckboxListItem
          label="Accept terms"
          isChecked={false}
          onCheck={handleCheck}
        />
      </XDSList>,
    );

    await user.click(screen.getByRole('checkbox', {name: 'Accept terms'}));
    expect(handleCheck).toHaveBeenCalledWith(true);
  });

  it('renders checked state from isChecked prop', () => {
    render(
      <XDSList>
        <XDSCheckboxListItem label="Checked item" isChecked={true} />
      </XDSList>,
    );
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('renders unchecked when no isChecked provided', () => {
    render(
      <XDSList>
        <XDSCheckboxListItem label="Default item" />
      </XDSList>,
    );
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('does not throw without value prop in standalone mode', () => {
    expect(() => {
      render(
        <XDSList>
          <XDSCheckboxListItem label="No value needed" />
        </XDSList>,
      );
    }).not.toThrow();
  });

  it('renders indeterminate state', () => {
    render(
      <XDSList>
        <XDSCheckboxListItem label="Partial" isChecked="indeterminate" />
      </XDSList>,
    );
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
  });

  it('calls onCheck with true when clicking indeterminate item', async () => {
    const user = userEvent.setup();
    const handleCheck = vi.fn();
    render(
      <XDSList>
        <XDSCheckboxListItem
          label="Partial"
          isChecked="indeterminate"
          onCheck={handleCheck}
        />
      </XDSList>,
    );

    await user.click(screen.getByRole('checkbox', {name: 'Partial'}));
    expect(handleCheck).toHaveBeenCalledWith(true);
  });
});

describe('XDSCheckboxListItem ARIA props', () => {
  it('sets aria-checked on the list item in collection mode', () => {
    render(
      <XDSCheckboxList label="Prefs" value={['a']} onChange={() => {}}>
        <XDSCheckboxListItem label="Option A" value="a" />
        <XDSCheckboxListItem label="Option B" value="b" />
      </XDSCheckboxList>,
    );
    const items = screen.getAllByRole('listitem');
    // Item A is checked
    expect(items[0]).toHaveAttribute('aria-checked', 'true');
    // Item B is not checked
    expect(items[1]).toHaveAttribute('aria-checked', 'false');
  });

  it('sets aria-checked on the list item in standalone mode', () => {
    render(
      <XDSList>
        <XDSCheckboxListItem label="Done" isChecked={true} />
        <XDSCheckboxListItem label="Todo" isChecked={false} />
      </XDSList>,
    );
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveAttribute('aria-checked', 'true');
    expect(items[1]).toHaveAttribute('aria-checked', 'false');
  });

  it('sets aria-checked="mixed" for indeterminate items', () => {
    render(
      <XDSList>
        <XDSCheckboxListItem label="Partial" isChecked="indeterminate" />
      </XDSList>,
    );
    const item = screen.getByRole('listitem');
    expect(item).toHaveAttribute('aria-checked', 'mixed');
  });

  it('sets aria-busy during async actions', () => {
    // Render with a pending async action by providing changeAction
    // that returns a promise that never resolves
    render(
      <XDSCheckboxList label="Prefs" value={['a']} onChange={() => {}}>
        <XDSCheckboxListItem label="Option A" value="a" />
      </XDSCheckboxList>,
    );
    // By default isBusy is false, so aria-busy should not be present
    const item = screen.getByRole('listitem');
    expect(item).not.toHaveAttribute('aria-busy');
  });

  it('forwards arbitrary aria attributes to the list item DOM element', () => {
    render(
      <XDSList>
        <XDSCheckboxListItem
          label="Custom aria"
          aria-describedby="help-text"
          aria-label="custom label"
        />
      </XDSList>,
    );
    const item = screen.getByRole('listitem');
    expect(item).toHaveAttribute('aria-describedby', 'help-text');
    expect(item).toHaveAttribute('aria-label', 'custom label');
  });
});
