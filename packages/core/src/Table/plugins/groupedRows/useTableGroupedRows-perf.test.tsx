// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useTableGroupedRows-perf.test.tsx
 * @input Table, useTableGroupedRows, React testing utilities
 * @output Performance tests for grouped-rows render behavior
 * @position Test file; validates that grouping costs no extra row renders
 *
 * The plugin keeps group headers out of cell renderers per cell, at render
 * time. Doing it by rewriting the columns instead would hand BaseTable a new
 * column object on every render, and its element-by-element check on the
 * resolved column array is what stops every row re-rendering.
 */

import {describe, it, expect} from 'vitest';
import {render, screen, act} from '@testing-library/react';
import {useCallback, useMemo, useState} from 'react';
import userEvent from '@testing-library/user-event';
import {Table} from '../../Table';
import type {TableColumn} from '../../types';
import {useTableGroupedRows} from './useTableGroupedRows';

interface Person extends Record<string, unknown> {
  id: string;
  name: string;
  team: string;
}

const people: Person[] = [
  {id: 'a', name: 'Alice', team: 'Core'},
  {id: 'b', name: 'Bob', team: 'Core'},
  {id: 'c', name: 'Carol', team: 'Infra'},
];

const EMPTY = new Set<string>();

function GroupedRenderCountTable({
  renderCounts,
}: {
  renderCounts: Record<string, number>;
}) {
  const [tick, setTick] = useState(0);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(EMPTY);

  const columns = useMemo<TableColumn<Person>[]>(
    () => [
      {
        key: 'name',
        header: 'Name',
        renderCell: (item: Person) => {
          renderCounts[item.id] = (renderCounts[item.id] ?? 0) + 1;
          return item.name;
        },
      },
    ],
    [renderCounts],
  );

  const grouped = useTableGroupedRows<Person>({
    data: people,
    groupBy: useCallback((p: Person) => p.team, []),
    collapsedGroups,
    onToggleGroup: useCallback(
      (key: string) =>
        setCollapsedGroups(prev => {
          const next = new Set(prev);
          if (!next.delete(key)) {
            next.add(key);
          }
          return next;
        }),
      [],
    ),
    getRowKey: useCallback((p: Person) => p.id, []),
  });

  return (
    <>
      <button type="button" onClick={() => setTick(t => t + 1)}>
        bump {tick}
      </button>
      <Table
        data={grouped.data}
        columns={columns}
        idKey={grouped.idKey}
        plugins={{grouped: grouped.plugin}}
      />
    </>
  );
}

describe('Grouped rows render performance', () => {
  it('renders each real row once and no group header at all', () => {
    const renderCounts: Record<string, number> = {};
    render(<GroupedRenderCountTable renderCounts={renderCounts} />);
    expect(renderCounts).toEqual({a: 1, b: 1, c: 1});
  });

  it('a re-render of the surrounding component re-renders no rows', async () => {
    const user = userEvent.setup();
    const renderCounts: Record<string, number> = {};
    render(<GroupedRenderCountTable renderCounts={renderCounts} />);
    const before = {...renderCounts};

    await act(async () => {
      await user.click(screen.getByRole('button', {name: /bump/}));
    });

    expect(screen.getByRole('button', {name: 'bump 1'})).toBeInTheDocument();
    expect(renderCounts).toEqual(before);
  });
});
