'use client';

import {useState} from 'react';
import {XDSPagination} from '@xds/core/Pagination';
import {XDSHeading} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Layout';
import {XDSTable} from '@xds/core/Table';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  root: {
    width: '100%',
    maxWidth: 500,
  },
  pagination: {
    paddingTop: 8,
    flexDirection: 'row-reverse',
  },
});

const DATA = [
  {
    id: '1',
    date: 'Apr 18',
    description: 'Payment received',
    amount: '$2,450.00',
  },
  {
    id: '2',
    date: 'Apr 15',
    description: 'Subscription renewal',
    amount: '$99.00',
  },
  {id: '3', date: 'Apr 12', description: 'Refund issued', amount: '-$180.00'},
  {id: '4', date: 'Apr 10', description: 'Invoice paid', amount: '$1,200.00'},
];

export default function PaginationPageSize() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  return (
    <XDSStack direction="vertical" xstyle={styles.root}>
      <XDSHeading level={4}>Transactions</XDSHeading>
      <XDSTable
        idKey="id"
        columns={[
          {key: 'date', header: 'Date'},
          {key: 'description', header: 'Description'},
          {key: 'amount', header: 'Amount'},
        ]}
        data={DATA}
      />
      <XDSPagination
        page={page}
        onChange={setPage}
        totalItems={350}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[10, 25, 50, 100]}
        variant="count"
        xstyle={styles.pagination}
      />
    </XDSStack>
  );
}
