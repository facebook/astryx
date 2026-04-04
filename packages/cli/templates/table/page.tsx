'use client';

import {useState} from 'react';
import {XDSLayout, XDSLayoutHeader, XDSLayoutContent} from '@xds/core';
import {XDSText} from '@xds/core';
import {XDSButton} from '@xds/core';
import {XDSHStack} from '@xds/core';
import {XDSTable} from '@xds/core';
import {XDSBadge} from '@xds/core';
import type {XDSTableColumn} from '@xds/core';

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

const columns: XDSTableColumn<Item>[] = [
  {
    key: 'name',
    header: 'Name',
    renderCell: (item: Item) => (
      <XDSText type="body" weight="semibold">
        {item.name}
      </XDSText>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    renderCell: (item: Item) => (
      <XDSBadge
        variant={item.status === 'active' ? 'success' : 'neutral'}
        label={item.status}
      />
    ),
  },
  {
    key: 'updatedAt',
    header: 'Updated',
    renderCell: (item: Item) => (
      <XDSText type="body" color="secondary">
        {item.updatedAt}
      </XDSText>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    renderCell: () => <XDSButton label="Edit" variant="secondary" size="sm" />,
  },
];

export default function TablePage() {
  const [data] = useState<Item[]>(SAMPLE_DATA);

  return (
    <XDSLayout
      header={
        <XDSLayoutHeader hasDivider>
          <XDSHStack vAlign="center" hAlign="between">
            <XDSText type="large" weight="semibold">
              Items
            </XDSText>
            <XDSButton label="Add Item" variant="primary" />
          </XDSHStack>
        </XDSLayoutHeader>
      }
      content={
        <XDSLayoutContent>
          <XDSTable<Item> data={data} columns={columns} idKey="id" hasHover />
        </XDSLayoutContent>
      }
    />
  );
}
