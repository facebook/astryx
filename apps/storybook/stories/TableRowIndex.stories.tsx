// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useMemo, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {
  Table,
  useTableRowIndex,
  useTableSortable,
  useTableSortableState,
  proportional,
  pixel,
} from '@astryxdesign/core/Table';
import type {TableColumn, TableSortState} from '@astryxdesign/core/Table';

// =============================================================================
// Sample Data
// =============================================================================

interface Track extends Record<string, unknown> {
  id: string;
  title: string;
  artist: string;
  plays: number;
}

const tracks: Track[] = [
  {id: 't1', title: 'Nightfall', artist: 'Ava Chen', plays: 1820},
  {id: 't2', title: 'Ember', artist: 'Liam Park', plays: 942},
  {id: 't3', title: 'Tidal', artist: 'Zoe Vega', plays: 3310},
  {id: 't4', title: 'Cinder', artist: 'Max Ross', plays: 604},
  {id: 't5', title: 'Halcyon', artist: 'Mia Cole', plays: 2075},
];

const columns: TableColumn<Track>[] = [
  {key: 'title', header: 'Title', width: proportional(2)},
  {key: 'artist', header: 'Artist', width: proportional(2)},
  {
    key: 'plays',
    header: 'Plays',
    width: pixel(90),
    align: 'end',
    sortable: true,
  },
];

const meta: Meta = {
  title: 'Core/TableRowIndex',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

/**
 * A monospaced, right-aligned row-number column is prepended to the table.
 * Numbering follows the rendered data order and starts at 1 by default.
 */
export const Default: Story = {
  render: () => {
    const rowIndex = useTableRowIndex<Track>({data: tracks});
    return (
      <Table
        data={tracks}
        columns={columns}
        idKey="id"
        hasHover
        plugins={{rowIndex}}
      />
    );
  },
};

/**
 * Customize the header `label` and the `startFrom` offset (e.g. 0-based).
 */
export const CustomLabelAndStart: Story = {
  render: () => {
    const rowIndex = useTableRowIndex<Track>({
      data: tracks,
      label: 'No.',
      startFrom: 0,
    });
    return (
      <Table
        data={tracks}
        columns={columns}
        idKey="id"
        hasHover
        plugins={{rowIndex}}
      />
    );
  },
};

/**
 * The index reflects the current view: with sorting active, pass the **sorted**
 * data to `useTableRowIndex` so numbering renumbers as the order changes. Sort
 * by Plays to see rows renumber 1..n in the new order.
 */
export const RenumbersWithSort: Story = {
  render: () => {
    const [sort, setSort] = useState<TableSortState>([
      {sortKey: 'plays', direction: 'descending'},
    ]);
    const {sortedData, sortConfig} = useTableSortableState<Track>({
      data: tracks,
      sort,
      onSortChange: setSort,
    });
    const sortPlugin = useTableSortable<Track>(sortConfig);
    // Pass the sorted data + a stable key so the index tracks the sorted order.
    const rowIndex = useTableRowIndex<Track>({
      data: sortedData,
      getRowKey: item => item.id,
    });
    const plugins = useMemo(
      () => ({rowIndex, sort: sortPlugin}),
      [rowIndex, sortPlugin],
    );
    return (
      <Table
        data={sortedData}
        columns={columns}
        idKey="id"
        hasHover
        plugins={plugins}
      />
    );
  },
};
