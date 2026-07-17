// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Table} from '@astryxdesign/core/Table';
import {Badge} from '@astryxdesign/core/Badge';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {proportional, pixel} from '@astryxdesign/core/Table';

interface Transaction extends Record<string, unknown> {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

const transactions: Transaction[] = [
  {id: '1', description: 'Payment from Acme Corp', amount: 2500.00, date: '2024-03-15', status: 'completed'},
  {id: '2', description: 'Subscription renewal', amount: -49.99, date: '2024-03-14', status: 'completed'},
  {id: '3', description: 'Refund - Order #1234', amount: 150.00, date: '2024-03-13', status: 'pending'},
  {id: '4', description: 'Transfer to savings', amount: -500.00, date: '2024-03-12', status: 'completed'},
  {id: '5', description: 'Invoice payment', amount: 1200.00, date: '2024-03-11', status: 'failed'},
];

const statusVariant = {
  completed: 'success' as const,
  pending: 'warning' as const,
  failed: 'error' as const,
};

export default function TransactionList() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Heading level={2}>Transactions</Heading>
      <div className="mt-4">
        <Table
          data={transactions}
          idKey="id"
          hasHover
          columns={[
            {key: 'description', header: 'Description', width: proportional(2)},
            {
              key: 'amount',
              header: 'Amount',
              width: pixel(120),
              align: 'end' as const,
              renderCell: (row: Transaction) => (
                <Text color={row.amount >= 0 ? 'primary' : 'secondary'}>
                  {row.amount >= 0 ? '+' : ''}{row.amount.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}
                </Text>
              ),
            },
            {key: 'date', header: 'Date', width: pixel(120)},
            {
              key: 'status',
              header: 'Status',
              width: pixel(100),
              renderCell: (row: Transaction) => (
                <Badge variant={statusVariant[row.status]}>{row.status}</Badge>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
