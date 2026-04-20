'use client';

import {useState} from 'react';
import {XDSTable, useXDSTablePagination, paginateData} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';

interface User extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  role: string;
}

const users: User[] = Array.from({length: 50}, (_, i) => ({
  id: String(i + 1),
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: ['Engineer', 'Designer', 'Manager', 'Admin', 'Analyst'][i % 5],
}));

const columns: XDSTableColumn<User>[] = [
  {key: 'name', header: 'Name'},
  {key: 'email', header: 'Email'},
  {key: 'role', header: 'Role'},
];

export default function TablePaginatedTable() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const plugin = useXDSTablePagination<User>({
    page,
    onPageChange: setPage,
    totalItems: users.length,
    pageSize,
  });

  return (
    <XDSTable
      data={paginateData(users, page, pageSize)}
      columns={columns}
      idKey="id"
      plugins={{pagination: plugin}}
    />
  );
}
