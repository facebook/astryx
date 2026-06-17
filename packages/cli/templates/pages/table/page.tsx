// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {Layout, LayoutHeader, LayoutContent} from '@xds/core';
import {Text} from '@xds/core';
import {Button} from '@xds/core';
import {HStack} from '@xds/core';
import {Table} from '@xds/core';
import {Badge} from '@xds/core';
import type {TableColumn} from '@xds/core';

type Item = {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  updatedAt: string;
};

const SAMPLE_DATA: Item[] = [
  {id: '1', name: 'Item One', status: 'active', updatedAt: '2025-01-15'},
  {id: '2', name: 'Item Two', status: 'inactive', updatedAt: '2025-01-14'},
  {id: '3', name: 'Item Three', status: 'active', updatedAt: '2025-01-13'},
];

const columns: TableColumn<Item>[] = [
  {
    key: 'name',
    header: 'Name',
    renderCell: (item: Item) => (
      <Text type="body" weight="semibold">
        {item.name}
      </Text>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    renderCell: (item: Item) => (
      <Badge
        variant={item.status === 'active' ? 'success' : 'neutral'}
        label={item.status}
      />
    ),
  },
  {
    key: 'updatedAt',
    header: 'Updated',
    renderCell: (item: Item) => (
      <Text type="body" color="secondary">
        {item.updatedAt}
      </Text>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    renderCell: () => <Button label="Edit" variant="secondary" size="sm" />,
  },
];

export default function TablePage() {
  const [data] = useState<Item[]>(SAMPLE_DATA);

  return (
    <Layout
      header={
        <LayoutHeader hasDivider>
          <HStack vAlign="center" hAlign="between">
            <Text type="large" weight="semibold">
              Items
            </Text>
            <Button label="Add Item" variant="primary" />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <Table<Item> data={data} columns={columns} idKey="id" hasHover />
        </LayoutContent>
      }
    />
  );
}
