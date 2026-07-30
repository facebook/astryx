// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useTableTreeData-perf.test.tsx
 * @input Table, useTableTreeData, useTableTreeState, React testing utilities
 * @output Performance tests for tree plugin render behavior
 * @position Test file; validates toggle render efficiency and DOM cost
 *
 * The tree plugin uses an external store so a toggle re-renders only the
 * affected cells — not the whole table body. Note: expanding inserts rows,
 * which shifts the rowIndex of every row *after* the insertion point (the
 * row memo comparator includes rowIndex by design), so the guarantee is
 * scoped to rows before the toggled row.
 */

import {describe, it, expect} from 'vitest';
import {render, screen, act} from '@testing-library/react';
import {useMemo} from 'react';
import userEvent from '@testing-library/user-event';
import {Table} from '../../Table';
import type {TableColumn} from '../../types';
import {useTableTreeData} from './useTableTreeData';
import {useTableTreeState} from './useTableTreeState';

interface TreeRow extends Record<string, unknown> {
  id: string;
  name: string;
  children?: TreeRow[];
}

/** 5 roots; the last root has 2 children. */
const roots: TreeRow[] = [
  ...Array.from({length: 4}, (_, i) => ({
    id: `root-${i}`,
    name: `Root ${i}`,
  })),
  {
    id: 'root-4',
    name: 'Root 4',
    children: [
      {id: 'child-0', name: 'Child 0'},
      {id: 'child-1', name: 'Child 1'},
    ],
  },
];

function TreeRenderCountTable({
  renderCounts,
}: {
  renderCounts: Record<string, number>;
}) {
  const columns = useMemo<TableColumn<TreeRow>[]>(
    () => [
      {
        key: 'name',
        header: 'Name',
        renderCell: (item: TreeRow) => {
          renderCounts[item.id] = (renderCounts[item.id] ?? 0) + 1;
          return item.name;
        },
      },
    ],
    [renderCounts],
  );

  const {visibleData, treeConfig} = useTableTreeState<TreeRow>({
    data: roots,
    idKey: 'id',
  });
  const tree = useTableTreeData(treeConfig);

  return (
    <Table data={visibleData} columns={columns} idKey="id" plugins={{tree}} />
  );
}

describe('Tree plugin render performance', () => {
  it('expanding the last root does not re-render preceding rows', async () => {
    const user = userEvent.setup();
    const renderCounts: Record<string, number> = {};

    render(<TreeRenderCountTable renderCounts={renderCounts} />);

    const initialCounts = {...renderCounts};
    expect(Object.keys(initialCounts)).toHaveLength(5);

    await act(async () => {
      await user.click(screen.getByRole('button', {name: 'Expand row'}));
    });

    for (let i = 0; i < 4; i++) {
      expect(renderCounts[`root-${i}`]).toBe(initialCounts[`root-${i}`]);
    }
    // The children mounted exactly once.
    expect(renderCounts['child-0']).toBe(1);
    expect(renderCounts['child-1']).toBe(1);
  });

  it('collapsing unmounts the subtree rows entirely', async () => {
    const user = userEvent.setup();
    const renderCounts: Record<string, number> = {};

    render(<TreeRenderCountTable renderCounts={renderCounts} />);

    await act(async () => {
      await user.click(screen.getByRole('button', {name: 'Expand row'}));
    });
    expect(screen.getAllByRole('row')).toHaveLength(8); // header + 5 roots + 2 children

    await act(async () => {
      await user.click(screen.getByRole('button', {name: 'Collapse row'}));
    });
    expect(screen.getAllByRole('row')).toHaveLength(6); // header + 5 roots
  });

  it('adds at most one wrapper, one expander/spacer to the tree column and zero DOM to other columns', () => {
    const {container} = render(
      <Table
        data={
          [{id: 'a', name: 'a', children: [{id: 'b', name: 'b'}]}] as TreeRow[]
        }
        columns={[
          {key: 'name', header: 'Name'},
          {key: 'id', header: 'Id'},
        ]}
        idKey="id"
        plugins={{}}
      />,
    );
    const plainSecondCellHTML =
      container.querySelectorAll('tbody td')[1].innerHTML;

    function DomBudgetTable() {
      const {visibleData, treeConfig} = useTableTreeState<TreeRow>({
        data: [{id: 'a', name: 'a', children: [{id: 'b', name: 'b'}]}],
        idKey: 'id',
      });
      const tree = useTableTreeData(treeConfig);
      return (
        <Table
          data={visibleData}
          columns={[
            {key: 'name', header: 'Name'},
            {key: 'id', header: 'Id'},
          ]}
          idKey="id"
          plugins={{tree}}
        />
      );
    }
    const {container: treeContainer} = render(<DomBudgetTable />);
    const cells = treeContainer.querySelectorAll('tbody td');

    // Tree column: one flex wrapper containing one expander button + text.
    const wrapper = cells[0].firstElementChild as HTMLElement;
    expect(wrapper.tagName).toBe('DIV');
    expect(wrapper.children).toHaveLength(1);
    expect(wrapper.querySelector('button')).not.toBeNull();

    // Other columns: byte-identical to the plugin-free render.
    expect(cells[1].innerHTML).toBe(plainSecondCellHTML);
  });
});
