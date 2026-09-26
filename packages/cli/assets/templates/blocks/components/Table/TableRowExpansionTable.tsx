// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {
  Table,
  useTableRowExpansion,
  proportional,
  pixel,
} from '@astryxdesign/core/Table';
import {VStack, HStack} from '@astryxdesign/core/Stack';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';

interface Order extends Record<string, unknown> {
  id: string;
  customer: string;
  status: string;
  total: string;
  items: {name: string; qty: number; price: string}[];
}

const orders: Order[] = [
  {
    id: 'ord-1001',
    customer: 'Ada Lovelace',
    status: 'Shipped',
    total: '$248.00',
    items: [
      {name: 'Mechanical keyboard', qty: 1, price: '$180.00'},
      {name: 'Wrist rest', qty: 2, price: '$34.00'},
    ],
  },
  {
    id: 'ord-1002',
    customer: 'Alan Turing',
    status: 'Processing',
    total: '$52.00',
    items: [{name: 'USB-C cable', qty: 4, price: '$13.00'}],
  },
  {
    id: 'ord-1003',
    customer: 'Grace Hopper',
    status: 'Delivered',
    total: '$1,200.00',
    items: [{name: 'Standing desk', qty: 1, price: '$1,200.00'}],
  },
];

const columns = [
  {key: 'customer', header: 'Customer', width: proportional(2)},
  {key: 'status', header: 'Status', width: pixel(130)},
  {key: 'total', header: 'Total', width: pixel(110)},
];

export default function TableRowExpansionTable() {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    new Set(['ord-1001']),
  );

  const expansion = useTableRowExpansion<Order>({
    expandedKeys,
    onToggle: key =>
      setExpandedKeys(prev => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      }),
    getRowKey: item => item.id,
    // The detail panel renders arbitrary content below the row: here, the
    // order's line items. Any component composes here (charts, forms, tables).
    renderExpanded: item => (
      <VStack gap={2}>
        <Heading level={4}>Line items</Heading>
        {item.items.map(line => (
          <HStack key={line.name} gap={3}>
            <Badge label={`x${line.qty}`} variant="info" />
            <Text type="body">{line.name}</Text>
            <Text type="body" color="secondary">
              {line.price}
            </Text>
          </HStack>
        ))}
      </VStack>
    ),
  });

  return (
    <Table
      data={orders}
      columns={columns}
      idKey="id"
      hasHover
      plugins={{expansion}}
    />
  );
}
