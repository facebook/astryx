'use client';

import {XDSTable, proportional, pixel} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {
  colorDefaults,
  spacingDefaults,
  radiusDefaults,
  textSizeDefaults,
} from '@xds/core/theme';

interface User extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  role: string;
  age: number;
}

const users: User[] = [
  {id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Engineer', age: 30},
  {id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'Designer', age: 25},
  {id: '3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'PM', age: 35},
  {id: '4', name: 'Diana Prince', email: 'diana@example.com', role: 'Engineer', age: 28},
  {id: '5', name: 'Eve Davis', email: 'eve@example.com', role: 'Designer', age: 32},
];

const columns: XDSTableColumn<User>[] = [
  {key: 'name', header: 'Name'},
  {
    key: 'email',
    header: 'Email',
    width: proportional(2),
    renderCell: (item) => (
      <a href={`mailto:${item.email}`} style={{color: 'inherit'}}>
        {item.email}
      </a>
    ),
  },
  {
    key: 'role',
    header: 'Role',
    renderCell: (item) => (
      <span
        style={{
          padding: `${spacingDefaults['--spacing-0-5']} ${spacingDefaults['--spacing-2']}`,
          borderRadius: radiusDefaults['--radius-inner'],
          fontSize: textSizeDefaults['--font-size-xs'],
          backgroundColor:
            item.role === 'Engineer'
              ? colorDefaults['--color-background-blue']
              : colorDefaults['--color-background-purple'],
          color:
            item.role === 'Engineer'
              ? colorDefaults['--color-text-blue']
              : colorDefaults['--color-text-purple'],
        }}>
        {item.role}
      </span>
    ),
  },
  {key: 'age', header: 'Age', width: pixel(80)},
];

export default function TableRichCellTable() {
  return <XDSTable data={users} columns={columns} idKey="id" hasHover />;
}
