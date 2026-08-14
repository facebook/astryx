// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState, useCallback} from 'react';
import {
  Table,
  useTableGroupedRows,
  proportional,
  pixel,
} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';

interface Person extends Record<string, unknown> {
  id: string;
  name: string;
  team: string;
  role: string;
}

const people: Person[] = [
  {id: '1', name: 'Ava Chen', team: 'Design Systems', role: 'Staff Eng'},
  {id: '2', name: 'Liam Park', team: 'Design Systems', role: 'Engineer'},
  {id: '3', name: 'Zoe Vega', team: 'Design Systems', role: 'Manager'},
  {id: '4', name: 'Max Ross', team: 'Infra', role: 'Senior Eng'},
  {id: '5', name: 'Mia Cole', team: 'Infra', role: 'Engineer'},
  {id: '6', name: 'Leo Nash', team: 'Growth', role: 'PM'},
];

const columns: TableColumn<Person>[] = [
  {key: 'name', header: 'Name', width: proportional(2)},
  {key: 'role', header: 'Role', width: pixel(140)},
];

export default function TableGroupedRowsTable() {
  const [collapsedGroups, setCollapsed] = useState<Set<string>>(new Set());
  const onToggleGroup = useCallback((key: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const grouped = useTableGroupedRows<Person>({
    data: people,
    groupBy: p => p.team,
    collapsedGroups,
    onToggleGroup,
    getRowKey: p => p.id,
  });

  return (
    <Table
      data={grouped.data}
      columns={columns}
      idKey={grouped.idKey}
      hasHover
      plugins={{grouped: grouped.plugin}}
    />
  );
}
