// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState, type CSSProperties} from 'react';
import {Pagination} from '@astryxdesign/core/Pagination';
import {Heading} from '@astryxdesign/core/Text';
import {Stack} from '@astryxdesign/core/Layout';
import {Table} from '@astryxdesign/core/Table';

const root: CSSProperties = {
  width: '100%',
  maxWidth: 500,
};

const pagination: CSSProperties = {
  paddingTop: 8,
  flexDirection: 'row-reverse',
};

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
    <Stack direction="vertical" style={root}>
      <Heading level={4}>Transactions</Heading>
      <Table
        idKey="id"
        columns={[
          {key: 'date', header: 'Date'},
          {key: 'description', header: 'Description'},
          {key: 'amount', header: 'Amount'},
        ]}
        data={DATA}
      />
      <Pagination
        page={page}
        onChange={setPage}
        totalItems={350}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[10, 25, 50, 100]}
        variant="count"
        style={pagination}
      />
    </Stack>
  );
}
