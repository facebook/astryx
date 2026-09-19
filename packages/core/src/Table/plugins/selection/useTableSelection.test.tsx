// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useTableSelection.test.tsx
 * @input useTableSelection, Table, React testing utilities
 * @output Functional tests for the selection plugin
 * @position Test file; validates selection behavior (checkboxes, aria, select-all)
 */

import {describe, it, expect, vi} from 'vitest';
import {useState} from 'react';
import {act, render, renderHook, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Table} from '../../Table';
import {useTableSelection} from './useTableSelection';
import {colorVars} from '../../../theme/tokens.stylex';
import {defineTheme} from '../../../theme/defineTheme';
import {generateThemeCSS} from '../../../theme/generateThemeRules';
import type {BodyRowRenderProps, TableColumn} from '../../types';

// =============================================================================
// Test Data
// =============================================================================

interface SelectableUser extends Record<string, unknown> {
  id: string;
  name: string;
  role: string;
  isLocked: boolean;
}

const selectableUsers: SelectableUser[] = [
  {id: '1', name: 'Alice', role: 'engineer', isLocked: false},
  {id: '2', name: 'Bob', role: 'admin', isLocked: false},
  {id: '3', name: 'Charlie', role: 'designer', isLocked: true},
];

const selectableColumns: TableColumn<SelectableUser>[] = [
  {key: 'name', header: 'Name'},
  {key: 'role', header: 'Role'},
];

function SelectionTable({
  getIsItemSelectable,
  getIsItemEnabled,
  getRowLabel,
  hasRowHighlight,
}: {
  getIsItemSelectable?: (item: SelectableUser) => boolean;
  getIsItemEnabled?: (item: SelectableUser) => boolean;
  getRowLabel?: (item: SelectableUser) => string;
  hasRowHighlight?: boolean;
}) {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const nonAdminUsers = getIsItemSelectable
    ? selectableUsers.filter(getIsItemSelectable)
    : selectableUsers;

  const selectionPlugin = useTableSelection<SelectableUser>({
    getIsItemSelected: item => selectedKeys.has(item.id),
    onSelectItem: ({item, isSelected}) => {
      const next = new Set(selectedKeys);
      if (isSelected) {
        next.add(item.id);
      } else {
        next.delete(item.id);
      }
      setSelectedKeys(next);
    },
    onSelectAll: ({isAllSelected}) => {
      setSelectedKeys(
        isAllSelected ? new Set(nonAdminUsers.map(u => u.id)) : new Set(),
      );
    },
    getIsAllSelected: () =>
      nonAdminUsers.length > 0 &&
      nonAdminUsers.every(u => selectedKeys.has(u.id)),
    getIsIndeterminate: () => {
      const count = nonAdminUsers.filter(u => selectedKeys.has(u.id)).length;
      return count > 0 && count < nonAdminUsers.length;
    },
    getIsItemSelectable,
    getIsItemEnabled,
    getRowLabel,
    hasRowHighlight,
  });

  return (
    <Table
      data={selectableUsers}
      columns={selectableColumns}
      idKey="id"
      plugins={{selection: selectionPlugin}}
    />
  );
}

/**
 * Selection table whose row data can change for reasons unrelated to
 * selection. Renaming keeps the item's `id`, so the row keeps its React key
 * and the same `<tr>` element re-renders — the situation where React re-owns
 * the row's `className` while the plugin's imperative theming state has to
 * survive on it.
 */
function RenamingSelectionTable() {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<SelectableUser[]>(selectableUsers);

  const selectionPlugin = useTableSelection<SelectableUser>({
    getIsItemSelected: item => selectedKeys.has(item.id),
    onSelectItem: ({item, isSelected}) => {
      const next = new Set(selectedKeys);
      if (isSelected) {
        next.add(item.id);
      } else {
        next.delete(item.id);
      }
      setSelectedKeys(next);
    },
    onSelectAll: ({isAllSelected}) => {
      setSelectedKeys(
        isAllSelected ? new Set(items.map(u => u.id)) : new Set(),
      );
    },
    getIsAllSelected: () =>
      items.length > 0 && items.every(u => selectedKeys.has(u.id)),
  });

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          setItems(prev =>
            prev.map(item =>
              item.id === '1' ? {...item, name: 'Alicia'} : item,
            ),
          )
        }>
        Rename Alice
      </button>
      <Table
        data={items}
        columns={selectableColumns}
        idKey="id"
        plugins={{selection: selectionPlugin}}
      />
    </div>
  );
}

// =============================================================================
// Tests
// =============================================================================

describe('useTableSelection', () => {
  it('renders selection checkboxes in header and body rows', () => {
    render(<SelectionTable />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(4);
  });

  it('renders header checkbox with "Select all rows" label', () => {
    render(<SelectionTable />);
    expect(screen.getByLabelText('Select all rows')).toBeInTheDocument();
  });

  it('renders row checkboxes with "Select row" label', () => {
    render(<SelectionTable />);
    const rowCheckboxes = screen.getAllByLabelText('Select row');
    expect(rowCheckboxes).toHaveLength(3);
  });

  it('derives per-row accessible names from getRowLabel', () => {
    render(<SelectionTable getRowLabel={item => item.name} />);
    expect(screen.getByLabelText('Select Alice')).toBeInTheDocument();
    expect(screen.getByLabelText('Select Bob')).toBeInTheDocument();
    expect(screen.getByLabelText('Select Charlie')).toBeInTheDocument();
    expect(screen.queryByLabelText('Select row')).not.toBeInTheDocument();
  });

  it('keeps the "Select all rows" header label when getRowLabel is provided', () => {
    render(<SelectionTable getRowLabel={item => item.name} />);
    expect(screen.getByLabelText('Select all rows')).toBeInTheDocument();
  });

  it('toggles individual row selection on click', async () => {
    const user = userEvent.setup();
    render(<SelectionTable />);
    const rowCheckboxes = screen.getAllByLabelText('Select row');

    await user.click(rowCheckboxes[0]);

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveAttribute('aria-selected', 'true');
    expect(rows[2]).not.toHaveAttribute('aria-selected');
    expect(rows[3]).not.toHaveAttribute('aria-selected');
  });

  it('deselects a selected row on click', async () => {
    const user = userEvent.setup();
    render(<SelectionTable />);
    const rowCheckboxes = screen.getAllByLabelText('Select row');

    await user.click(rowCheckboxes[0]);
    expect(screen.getAllByRole('row')[1]).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await user.click(rowCheckboxes[0]);
    expect(screen.getAllByRole('row')[1]).not.toHaveAttribute('aria-selected');
  });

  it('selects all rows when select-all is clicked', async () => {
    const user = userEvent.setup();
    render(<SelectionTable />);
    const selectAll = screen.getByLabelText('Select all rows');

    await user.click(selectAll);

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveAttribute('aria-selected', 'true');
    expect(rows[2]).toHaveAttribute('aria-selected', 'true');
    expect(rows[3]).toHaveAttribute('aria-selected', 'true');
  });

  it('deselects all rows when select-all is clicked again', async () => {
    const user = userEvent.setup();
    render(<SelectionTable />);
    const selectAll = screen.getByLabelText('Select all rows');

    await user.click(selectAll);
    await user.click(selectAll);

    const rows = screen.getAllByRole('row');
    expect(rows[1]).not.toHaveAttribute('aria-selected');
    expect(rows[2]).not.toHaveAttribute('aria-selected');
    expect(rows[3]).not.toHaveAttribute('aria-selected');
  });

  it('hides checkbox for non-selectable rows', () => {
    render(
      <SelectionTable getIsItemSelectable={item => item.role !== 'admin'} />,
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
  });

  it('disables checkbox for disabled rows', () => {
    render(<SelectionTable getIsItemEnabled={item => !item.isLocked} />);
    const rowCheckboxes = screen.getAllByLabelText('Select row');
    expect(rowCheckboxes[0]).not.toBeDisabled();
    expect(rowCheckboxes[1]).not.toBeDisabled();
    expect(rowCheckboxes[2]).toBeDisabled();
  });

  it('prepends selection <td> to each body row', () => {
    render(<SelectionTable />);
    const rows = screen.getAllByRole('row');
    const firstBodyRow = rows[1];
    const cells = within(firstBodyRow).getAllByRole('cell');
    expect(cells).toHaveLength(3);
  });

  it('prepends selection <th> to header row', () => {
    render(<SelectionTable />);
    const headerRow = screen.getAllByRole('row')[0];
    const headers = within(headerRow).getAllByRole('columnheader');
    expect(headers).toHaveLength(3);
  });

  describe('hasRowHighlight', () => {
    // The wash resolves through the themeable lever (see the
    // 'selected-row theming' block below) rather than a fixed colour.
    const selectedBgColor = `var(--table-row-selected-background, ${colorVars['--color-accent-muted']})`;

    it('paints a checked row with the accent wash by default', async () => {
      const user = userEvent.setup();
      render(<SelectionTable />);

      await user.click(screen.getAllByLabelText('Select row')[0]);

      const row = screen.getAllByRole('row')[1];
      expect(row.style.backgroundColor).toBe(selectedBgColor);
      expect(row).toHaveAttribute('aria-selected', 'true');
    });

    it('leaves the row background alone when hasRowHighlight is false', async () => {
      const user = userEvent.setup();
      render(<SelectionTable hasRowHighlight={false} />);

      await user.click(screen.getAllByLabelText('Select row')[0]);

      const row = screen.getAllByRole('row')[1];
      expect(row.style.backgroundColor).toBe('');
      // The wash is opt-out; the semantics are not.
      expect(row).toHaveAttribute('aria-selected', 'true');
    });

    it('clears an already-painted row when the flag flips to false', async () => {
      const user = userEvent.setup();
      const {rerender} = render(<SelectionTable />);

      await user.click(screen.getAllByLabelText('Select row')[0]);
      expect(screen.getAllByRole('row')[1].style.backgroundColor).toBe(
        selectedBgColor,
      );

      rerender(<SelectionTable hasRowHighlight={false} />);

      const row = screen.getAllByRole('row')[1];
      expect(row.style.backgroundColor).toBe('');
      expect(row).toHaveAttribute('aria-selected', 'true');
    });

    it('repaints an already-checked row when the flag flips back to true', async () => {
      const user = userEvent.setup();
      const {rerender} = render(<SelectionTable hasRowHighlight={false} />);

      await user.click(screen.getAllByLabelText('Select row')[0]);
      rerender(<SelectionTable hasRowHighlight />);

      expect(screen.getAllByRole('row')[1].style.backgroundColor).toBe(
        selectedBgColor,
      );
    });

    it('never paints unchecked rows in either mode', async () => {
      const user = userEvent.setup();
      const {rerender} = render(<SelectionTable />);

      await user.click(screen.getAllByLabelText('Select row')[0]);
      expect(screen.getAllByRole('row')[2].style.backgroundColor).toBe('');
      expect(screen.getAllByRole('row')[2]).not.toHaveAttribute(
        'aria-selected',
      );

      rerender(<SelectionTable hasRowHighlight={false} />);
      expect(screen.getAllByRole('row')[2].style.backgroundColor).toBe('');
      expect(screen.getAllByRole('row')[2]).not.toHaveAttribute(
        'aria-selected',
      );
    });

    // A pinned cell paints over the row, then replays whatever the row
    // published as --table-row-overlay. Without the variable the wash simply
    // stops at the freeze line, so it has to track the background exactly.
    describe('--table-row-overlay', () => {
      const readOverlay = (row: HTMLElement) =>
        row.style.getPropertyValue('--table-row-overlay');

      it('publishes the wash so pinned cells can replay it', async () => {
        const user = userEvent.setup();
        render(<SelectionTable />);

        await user.click(screen.getAllByLabelText('Select row')[0]);

        expect(readOverlay(screen.getAllByRole('row')[1])).toBe(
          selectedBgColor,
        );
      });

      it('publishes nothing when the row is not painted', async () => {
        const user = userEvent.setup();
        render(<SelectionTable hasRowHighlight={false} />);

        await user.click(screen.getAllByLabelText('Select row')[0]);

        expect(readOverlay(screen.getAllByRole('row')[1])).toBe('');
      });

      it('withdraws the variable when a row is unchecked', async () => {
        const user = userEvent.setup();
        render(<SelectionTable />);

        const checkbox = screen.getAllByLabelText('Select row')[0];
        await user.click(checkbox);
        await user.click(checkbox);

        expect(readOverlay(screen.getAllByRole('row')[1])).toBe('');
      });

      it('tracks the background when the flag flips', async () => {
        const user = userEvent.setup();
        const {rerender} = render(<SelectionTable />);

        await user.click(screen.getAllByLabelText('Select row')[0]);
        rerender(<SelectionTable hasRowHighlight={false} />);
        expect(readOverlay(screen.getAllByRole('row')[1])).toBe('');

        rerender(<SelectionTable hasRowHighlight />);
        expect(readOverlay(screen.getAllByRole('row')[1])).toBe(
          selectedBgColor,
        );
      });

      it('leaves unchecked rows without the variable', async () => {
        const user = userEvent.setup();
        render(<SelectionTable />);

        await user.click(screen.getAllByLabelText('Select row')[0]);

        expect(readOverlay(screen.getAllByRole('row')[2])).toBe('');
      });
    });
  });

  // The selected state has to reach the theming system through the same
  // surface every component uses (the `astryx-table-row` target), and the
  // wash has to resolve through a value a theme can actually set — otherwise
  // a theme can only turn the highlight off, never restyle it (#5425).
  describe('selected-row theming', () => {
    const selectedWashColor = `var(--table-row-selected-background, ${colorVars['--color-accent-muted']})`;

    it('publishes the selected state on the table-row target', async () => {
      const user = userEvent.setup();
      render(<SelectionTable />);

      await user.click(screen.getAllByLabelText('Select row')[0]);

      const [selectedRow, unselectedRow] = [
        screen.getAllByRole('row')[1],
        screen.getAllByRole('row')[2],
      ];
      expect(selectedRow).toHaveClass('astryx-table-row');
      expect(selectedRow).toHaveClass('selected');
      expect(selectedRow).toHaveAttribute('data-selected', 'selected');
      expect(unselectedRow).toHaveClass('astryx-table-row');
      expect(unselectedRow).not.toHaveClass('selected');
      expect(unselectedRow).not.toHaveAttribute('data-selected');
    });

    it('matches the selectors a theme generates for the selected state', async () => {
      const user = userEvent.setup();
      render(<SelectionTable />);

      await user.click(screen.getAllByLabelText('Select row')[0]);

      // The rule `defineTheme({components: {'table-row': {selected: …}}})`
      // emits is `.astryx-table-row.selected`; the data-attribute form is the
      // raw-CSS escape hatch. Both must distinguish selected from unselected.
      const [selectedRow, unselectedRow] = [
        screen.getAllByRole('row')[1],
        screen.getAllByRole('row')[2],
      ];
      expect(selectedRow.matches('.astryx-table-row.selected')).toBe(true);
      expect(selectedRow.matches('[data-selected="selected"]')).toBe(true);
      expect(unselectedRow.matches('.astryx-table-row.selected')).toBe(false);
      expect(unselectedRow.matches('[data-selected="selected"]')).toBe(false);
    });

    it('keeps the published state across a rerender that does not change selection', async () => {
      const user = userEvent.setup();
      render(<RenamingSelectionTable />);

      await user.click(screen.getAllByLabelText('Select row')[0]);

      const rowBefore = screen.getAllByRole('row')[1];
      expect(rowBefore).toHaveClass('astryx-table-row');
      expect(rowBefore).toHaveClass('selected');
      expect(rowBefore).toHaveAttribute('data-selected', 'selected');
      expect(rowBefore).toHaveAttribute('aria-selected', 'true');

      // Rerender the selected row itself for a reason unrelated to selection:
      // same item id, so the same <tr> element re-renders under React.
      await user.click(screen.getByRole('button', {name: 'Rename Alice'}));

      // The rerender really happened, on the same element...
      expect(screen.getByText('Alicia')).toBeInTheDocument();
      const rowAfter = screen.getAllByRole('row')[1];
      expect(rowAfter).toBe(rowBefore);
      // ...and the imperatively-published theming state survived it.
      expect(rowAfter).toHaveClass('astryx-table-row');
      expect(rowAfter).toHaveClass('selected');
      expect(rowAfter).toHaveAttribute('data-selected', 'selected');
      expect(rowAfter).toHaveAttribute('aria-selected', 'true');
      // The paint contract survived it too.
      expect(rowAfter.style.backgroundColor).toBe(selectedWashColor);
      expect(rowAfter.style.getPropertyValue('--table-row-overlay')).toBe(
        selectedWashColor,
      );
    });

    it('clears the published state when a row is unchecked', async () => {
      const user = userEvent.setup();
      render(<SelectionTable />);

      const checkbox = screen.getAllByLabelText('Select row')[0];
      await user.click(checkbox);
      await user.click(checkbox);

      const row = screen.getAllByRole('row')[1];
      expect(row).not.toHaveClass('selected');
      expect(row).not.toHaveAttribute('data-selected');
      expect(row).not.toHaveAttribute('aria-selected');
    });

    it('publishes the state even when the wash is opted out', async () => {
      const user = userEvent.setup();
      render(<SelectionTable hasRowHighlight={false} />);

      await user.click(screen.getAllByLabelText('Select row')[0]);

      // hasRowHighlight drops only the paint. The state a theme keys off —
      // and the semantics — stay, so a theme can supply its own selected
      // treatment on a table that turned the built-in wash off.
      const row = screen.getAllByRole('row')[1];
      expect(row).toHaveClass('selected');
      expect(row).toHaveAttribute('data-selected', 'selected');
      expect(row).toHaveAttribute('aria-selected', 'true');
      expect(row.style.backgroundColor).toBe('');
    });

    it('paints the wash through a value a theme can set', async () => {
      const user = userEvent.setup();
      render(<SelectionTable />);

      await user.click(screen.getAllByLabelText('Select row')[0]);

      // Not a fixed colour: the inline wash reads --table-row-selected-background,
      // so a theme that sets it retints every checked row without touching the
      // plugin config.
      const row = screen.getAllByRole('row')[1];
      expect(row.style.backgroundColor).toBe(
        `var(--table-row-selected-background, ${colorVars['--color-accent-muted']})`,
      );
      // The same lever is what pinned cells replay, so a themed wash runs
      // under the freeze line instead of stopping at it.
      expect(row.style.getPropertyValue('--table-row-overlay')).toBe(
        `var(--table-row-selected-background, ${colorVars['--color-accent-muted']})`,
      );
    });

    it('emits the themed wash on the selected target the row matches', () => {
      // The full chain, end to end: a theme recolours the wash through the
      // selected state key, the generated rule lands on
      // `.astryx-table-row.selected`, and that selector matches exactly the
      // rows the plugin marks.
      const {component} = generateThemeCSS(
        defineTheme({
          name: 'selection-theme-test',
          components: {
            'table-row': {
              selected: {
                '--table-row-selected-background': 'var(--color-success-muted)',
              },
            },
          },
        }),
      );

      expect(component).toContain('.astryx-table-row.selected');
      expect(component).toContain(
        '--table-row-selected-background: var(--color-success-muted)',
      );

      const selected = document.createElement('tr');
      selected.className = 'astryx-table-row selected';
      const unselected = document.createElement('tr');
      unselected.className = 'astryx-table-row';
      expect(selected.matches('.astryx-table-row.selected')).toBe(true);
      expect(unselected.matches('.astryx-table-row.selected')).toBe(false);
    });
  });

  it('unsubscribes detached row refs instead of accumulating listeners', () => {
    const getIsItemSelected = vi.fn(() => false);
    const {result, rerender} = renderHook(() =>
      useTableSelection<SelectableUser>({
        getIsItemSelected,
        onSelectItem: vi.fn(),
        onSelectAll: vi.fn(),
        getIsAllSelected: () => false,
      }),
    );

    const initialProps: BodyRowRenderProps = {
      htmlProps: {},
      xstyle: [],
      children: null,
    };
    const row = document.createElement('tr');
    document.body.append(row);

    let detach: (() => void) | undefined;

    // Simulate React replacing the callback ref as this row re-renders.
    // Each detach must unsubscribe the previous ref before the next attaches.
    for (let i = 0; i < 3; i++) {
      act(() => {
        detach?.();
      });

      const transformed = result.current.transformBodyRow?.(
        initialProps,
        selectableUsers[0],
        0,
      );
      expect(transformed?.ref).toBeTypeOf('function');

      act(() => {
        const cleanup = (
          transformed?.ref as React.RefCallback<HTMLTableRowElement>
        )(row);
        expect(cleanup).toBeTypeOf('function');
        detach = cleanup as () => void;
      });
    }

    getIsItemSelected.mockClear();
    rerender();
    expect(getIsItemSelected).toHaveBeenCalledTimes(1);

    act(() => {
      detach?.();
    });
    getIsItemSelected.mockClear();
    rerender();
    expect(getIsItemSelected).not.toHaveBeenCalled();

    row.remove();
  });
});
