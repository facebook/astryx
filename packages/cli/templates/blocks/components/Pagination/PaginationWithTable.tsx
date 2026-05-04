'use client';

import {useState} from 'react';
import {XDSPagination} from '@xds/core/Pagination';
import {XDSTable} from '@xds/core/Table';
import {XDSStack} from '@xds/core/Layout';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  root: {
    width: '100%',
    maxWidth: 500,
  },
  pagination: {
    justifyContent: 'center',
    paddingTop: 8,
  },
});

const ALL_DATA = [
  {id: '1', name: 'Olivia Chen', role: 'Engineer', status: 'Active'},
  {id: '2', name: 'Marcus Rivera', role: 'Designer', status: 'Active'},
  {id: '3', name: 'Aisha Patel', role: 'Marketing', status: 'Invited'},
  {id: '4', name: 'James Okafor', role: 'Engineer', status: 'Active'},
  {id: '5', name: 'Sofia Nguyen', role: 'Sales', status: 'Active'},
  {id: '6', name: 'Liam Johansson', role: 'Engineer', status: 'Inactive'},
  {id: '7', name: 'Elena Kowalski', role: 'Designer', status: 'Active'},
  {id: '8', name: 'David Kim', role: 'Marketing', status: 'Active'},
  {id: '9', name: 'Priya Sharma', role: 'Sales', status: 'Invited'},
  {id: '10', name: 'Noah Tanaka', role: 'Engineer', status: 'Active'},
  {id: '11', name: 'Fatima Al-Rashid', role: 'Designer', status: 'Active'},
  {id: '12', name: 'Carlos Mendez', role: 'Marketing', status: 'Inactive'},
];

const PAGE_SIZE = 4;

export default function PaginationWithTable() {
  const [page, setPage] = useState(1);
  const start = (page - 1) * PAGE_SIZE;
  const pageData = ALL_DATA.slice(start, start + PAGE_SIZE);

  return (
    <XDSStack direction="vertical" xstyle={styles.root}>
      <XDSTable
        idKey="id"
        columns={[
          {key: 'name', header: 'Name'},
          {key: 'role', header: 'Role'},
          {key: 'status', header: 'Status'},
        ]}
        data={pageData}
      />
      <XDSPagination
        page={page}
        onChange={setPage}
        totalItems={ALL_DATA.length}
        pageSize={PAGE_SIZE}
        variant="count"
        size="sm"
        xstyle={styles.pagination}
      />
    </XDSStack>
  );
}
