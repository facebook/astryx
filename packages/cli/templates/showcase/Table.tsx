'use client';

import {XDSTable, proportional, pixel} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';

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
];

const columns: XDSTableColumn<User>[] = [
  {key: 'name', header: 'Name'},
  {key: 'email', header: 'Email', width: proportional(2)},
  {key: 'role', header: 'Role'},
  {key: 'age', header: 'Age', width: pixel(80)},
];

export default function TableShowcase() {
  return <XDSTable data={users} columns={columns} idKey="id" hasHover />;
}
