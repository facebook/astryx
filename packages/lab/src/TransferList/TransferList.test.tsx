// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TransferList.test.tsx
 * @input Uses Vitest, Testing Library, and the data-driven TransferList API
 * @output Behavioral coverage for transfer, filtering, and keyboard reordering
 * @position Lab tests; validates TransferList.tsx
 *
 * SYNC: When TransferList.tsx behavior changes, update these tests.
 */

import {useState} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as stylex from '@stylexjs/stylex';
import {
  TransferList,
  type TransferListOption,
  type TransferListProps,
} from './TransferList';

const OPTIONS: ReadonlyArray<TransferListOption<string>> = [
  {
    value: 'name',
    label: 'Name',
    description: 'Primary identifier',
    group: 'Identity',
  },
  {value: 'owner', label: 'Owner', group: 'Identity'},
  {value: 'status', label: 'Status', group: 'Details'},
  {value: 'updated', label: 'Updated', group: 'Details'},
];

const LOCKED_OPTIONS: ReadonlyArray<TransferListOption<string>> = [
  OPTIONS[0],
  {
    value: 'owner',
    label: 'Owner',
    group: 'Identity',
    isDisabled: true,
    disabledMessage: 'Required',
  },
  OPTIONS[2],
  OPTIONS[3],
];

type ControlledTransferListProps = Omit<
  TransferListProps<string>,
  'label' | 'options' | 'value' | 'onChange'
> & {
  initialValue?: readonly string[];
  onValueChange?: (value: readonly string[]) => void;
  options?: ReadonlyArray<TransferListOption<string>>;
};

function ControlledTransferList({
  initialValue = [],
  onValueChange,
  options = OPTIONS,
  ...props
}: ControlledTransferListProps) {
  const [value, setValue] = useState<readonly string[]>(initialValue);

  return (
    <TransferList
      label="Columns"
      selectedLabel="Selected columns"
      availableLabel="Available columns"
      options={options}
      value={value}
      onChange={nextValue => {
        onValueChange?.(nextValue);
        setValue(nextValue);
      }}
      {...props}
    />
  );
}

const testStyles = stylex.create({
  root: (opacity: number) => ({opacity}),
});

describe('TransferList', () => {
  describe('semantics and content', () => {
    it('renders a labelled pair of semantic lists without listbox roles', () => {
      render(
        <TransferList
          label="Table columns"
          description="Choose and order the columns shown in the table."
          selectedLabel="Shown columns"
          availableLabel="Hidden columns"
          options={OPTIONS}
          value={['name', 'status']}
          onChange={() => {}}
        />,
      );

      expect(screen.getByText('Table columns')).toBeInTheDocument();
      expect(
        screen.getByText('Choose and order the columns shown in the table.'),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('list', {name: 'Shown columns'}),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('list', {name: 'Hidden columns'}),
      ).toBeInTheDocument();
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(screen.queryByRole('option')).not.toBeInTheDocument();
    });

    it('uses one divided collection with direction-neutral row actions', () => {
      const {container} = render(
        <ControlledTransferList
          initialValue={['name', 'status']}
          hasClear
          hasSelectAll
        />,
      );

      const collection = container.querySelector(
        '.astryx-transfer-list-collection',
      );
      expect(collection).toBeInTheDocument();
      expect(
        collection?.querySelectorAll(':scope > .astryx-transfer-list-panel'),
      ).toHaveLength(2);

      expect(screen.queryByText('2 items')).not.toBeInTheDocument();
      expect(screen.getByRole('button', {name: 'Clear'})).toHaveAttribute(
        'data-transfer-list-header-action',
        'true',
      );
      expect(screen.getByRole('button', {name: 'Add all'})).toHaveAttribute(
        'data-transfer-list-header-action',
        'true',
      );
      const addButton = screen.getByRole('button', {name: 'Add Owner'});
      const removeButton = screen.getByRole('button', {name: 'Remove Name'});
      expect(addButton.querySelector('svg')).toHaveClass('lucide-plus');
      expect(removeButton.querySelector('svg')).toHaveClass('lucide-x');

      const selectedList = screen.getByRole('list', {
        name: 'Selected columns',
      });
      const nameRow = within(selectedList).getByText('Name').closest('li');
      expect(nameRow).not.toBeNull();
      const rowButtons = within(nameRow as HTMLLIElement).getAllByRole(
        'button',
      );
      expect(rowButtons[0]).toHaveAccessibleName('Reorder Name');
      expect(rowButtons[0].querySelector('svg')).toHaveClass(
        'lucide-grip-vertical',
      );
      expect(rowButtons[1]).toHaveAccessibleName('Remove Name');
    });

    it('keeps support metadata out of rows while retaining search and groups', async () => {
      const user = userEvent.setup();
      render(<ControlledTransferList initialValue={['name', 'status']} />);

      expect(screen.queryByText('Primary identifier')).not.toBeInTheDocument();
      expect(screen.getAllByText('Identity').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Details').length).toBeGreaterThan(0);

      await user.type(screen.getByRole('searchbox'), 'primary identifier');
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.queryByText('Owner')).not.toBeInTheDocument();
    });

    it('renders custom option content for selected and available values', () => {
      render(
        <ControlledTransferList
          initialValue={['name']}
          renderOption={option => (
            <span data-testid={`custom-${option.value}`}>
              Custom {option.label}
            </span>
          )}
        />,
      );

      expect(screen.getByTestId('custom-name')).toHaveTextContent(
        'Custom Name',
      );
      expect(screen.getByTestId('custom-status')).toHaveTextContent(
        'Custom Status',
      );
    });

    it('renders custom empty-state copy for both panels', () => {
      const {rerender} = render(
        <TransferList
          label="Columns"
          options={OPTIONS}
          value={[]}
          onChange={() => {}}
          selectedEmptyText="Nothing is shown"
          availableEmptyText="Nothing else is available"
        />,
      );

      expect(screen.getByText('Nothing is shown')).toBeInTheDocument();

      rerender(
        <TransferList
          label="Columns"
          options={OPTIONS}
          value={OPTIONS.map(option => option.value)}
          onChange={() => {}}
          selectedEmptyText="Nothing is shown"
          availableEmptyText="Nothing else is available"
        />,
      );
      expect(screen.getByText('Nothing else is available')).toBeInTheDocument();
    });
  });

  describe('transfers and filtering', () => {
    it('appends an added value and preserves selected order when removing', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <ControlledTransferList
          initialValue={['status', 'name']}
          onValueChange={onValueChange}
        />,
      );

      await user.click(screen.getByRole('button', {name: 'Add Owner'}));
      expect(onValueChange).toHaveBeenLastCalledWith([
        'status',
        'name',
        'owner',
      ]);

      await user.click(screen.getByRole('button', {name: 'Remove Name'}));
      expect(onValueChange).toHaveBeenLastCalledWith(['status', 'owner']);
    });

    it('filters both panels with the shared search field', async () => {
      const user = userEvent.setup();
      render(
        <ControlledTransferList
          initialValue={['name', 'status']}
          searchLabel="Filter columns"
          searchPlaceholder="Find a column"
          noResultsText="No matching columns"
        />,
      );

      const search = screen.getByRole('searchbox', {name: 'Filter columns'});
      expect(search).toHaveAttribute('placeholder', 'Find a column');

      await user.type(search, 'owner');
      expect(screen.getByText('Owner')).toBeInTheDocument();
      expect(screen.queryByText('Updated')).not.toBeInTheDocument();
      expect(screen.getAllByText('No matching columns').length).toBeGreaterThan(
        0,
      );
    });

    it('enables search and reordering by default', () => {
      render(<ControlledTransferList initialValue={['name']} />);

      expect(screen.getByRole('searchbox')).toBeInTheDocument();
      expect(
        screen.getByRole('button', {name: 'Reorder Name'}),
      ).toBeInTheDocument();
    });

    it('can turn off search and reordering', () => {
      render(
        <ControlledTransferList
          initialValue={['name']}
          hasSearch={false}
          isReorderable={false}
        />,
      );

      expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', {name: 'Reorder Name'}),
      ).not.toBeInTheDocument();
    });
  });

  describe('disabled values and bulk actions', () => {
    it('marks a disabled selected value as required and exposes no actions', () => {
      render(
        <ControlledTransferList
          options={LOCKED_OPTIONS}
          initialValue={['owner', 'status']}
        />,
      );

      const selectedList = screen.getByRole('list', {
        name: 'Selected columns',
      });
      expect(within(selectedList).getByText('Required')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', {name: 'Remove Owner'}),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', {name: 'Reorder Owner'}),
      ).not.toBeInTheDocument();
    });

    it('adds all available values in option order', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <ControlledTransferList
          initialValue={['status']}
          hasSelectAll
          onValueChange={onValueChange}
        />,
      );

      await user.click(screen.getByRole('button', {name: 'Add all'}));
      expect(onValueChange).toHaveBeenCalledWith([
        'status',
        'name',
        'owner',
        'updated',
      ]);
    });

    it('clears removable values but retains disabled selected values', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <ControlledTransferList
          options={LOCKED_OPTIONS}
          initialValue={['status', 'owner', 'updated']}
          hasClear
          onValueChange={onValueChange}
        />,
      );

      await user.click(screen.getByRole('button', {name: 'Clear'}));
      expect(onValueChange).toHaveBeenCalledWith(['owner']);
    });

    it('delegates reset behavior to the consumer', async () => {
      const user = userEvent.setup();
      const onReset = vi.fn();
      const onValueChange = vi.fn();
      render(
        <ControlledTransferList
          initialValue={['status']}
          onReset={onReset}
          onValueChange={onValueChange}
        />,
      );

      await user.click(screen.getByRole('button', {name: 'Reset'}));
      expect(onReset).toHaveBeenCalledTimes(1);
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe('root customization', () => {
    it('provides a theme target and forwards root props and ref', () => {
      const ref = {current: null as HTMLDivElement | null};
      const onClick = vi.fn();
      render(
        <TransferList
          ref={ref}
          label="Columns"
          options={OPTIONS}
          value={['name']}
          onChange={() => {}}
          data-testid="transfer-list"
          data-owner="tables"
          className="consumer-class"
          style={{marginTop: 12}}
          xstyle={testStyles.root(0.75)}
          onClick={onClick}
        />,
      );

      const root = screen.getByTestId('transfer-list');
      expect(ref.current).toBe(root);
      expect(root).toHaveClass('astryx-transfer-list', 'consumer-class');
      expect(root).toHaveAttribute('data-owner', 'tables');
      expect(root).toHaveStyle({marginTop: '12px'});
      expect(root.getAttribute('style')).toContain('0.75');
      root.click();
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('keyboard reordering', () => {
    it('moves immediately, keeps handle focus, and drops without another change', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <ControlledTransferList
          initialValue={['name', 'owner', 'status']}
          onValueChange={onValueChange}
        />,
      );

      const handle = screen.getByRole('button', {name: 'Reorder Owner'});
      handle.focus();
      await user.keyboard('{Enter}{ArrowUp}');

      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenLastCalledWith([
        'owner',
        'name',
        'status',
      ]);
      expect(handle).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(handle).toHaveFocus();
    });

    it('supports Home and End while a value is grabbed', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <ControlledTransferList
          initialValue={['name', 'owner', 'status', 'updated']}
          onValueChange={onValueChange}
        />,
      );

      const handle = screen.getByRole('button', {name: 'Reorder Owner'});
      handle.focus();
      await user.keyboard(' {End}{Home} ');

      expect(onValueChange).toHaveBeenNthCalledWith(1, [
        'name',
        'status',
        'updated',
        'owner',
      ]);
      expect(onValueChange).toHaveBeenNthCalledWith(2, [
        'owner',
        'name',
        'status',
        'updated',
      ]);
      expect(onValueChange).toHaveBeenCalledTimes(2);
      expect(handle).toHaveFocus();
    });

    it('restores the original order when a grabbed move is cancelled', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <ControlledTransferList
          initialValue={['name', 'owner', 'status']}
          onValueChange={onValueChange}
        />,
      );

      const handle = screen.getByRole('button', {name: 'Reorder Owner'});
      handle.focus();
      await user.keyboard('{Enter}{ArrowDown}{Escape}');

      expect(onValueChange).toHaveBeenNthCalledWith(1, [
        'name',
        'status',
        'owner',
      ]);
      expect(onValueChange).toHaveBeenNthCalledWith(2, [
        'name',
        'owner',
        'status',
      ]);
      expect(handle).toHaveFocus();
    });

    it('does not allow a value to cross a disabled selected value', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <ControlledTransferList
          options={LOCKED_OPTIONS}
          initialValue={['name', 'owner', 'status', 'updated']}
          onValueChange={onValueChange}
        />,
      );

      const beforeBarrier = screen.getByRole('button', {
        name: 'Reorder Name',
      });
      beforeBarrier.focus();
      await user.keyboard('{Enter}{ArrowDown}{Enter}');
      expect(onValueChange).not.toHaveBeenCalled();

      const afterBarrier = screen.getByRole('button', {
        name: 'Reorder Updated',
      });
      afterBarrier.focus();
      await user.keyboard('{Enter}{Home}');
      expect(onValueChange).toHaveBeenLastCalledWith([
        'name',
        'owner',
        'updated',
        'status',
      ]);
      await user.keyboard('{ArrowUp}{Enter}');
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(afterBarrier).toHaveFocus();
    });
  });
});
