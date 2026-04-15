'use client';

import {XDSTable, pixel} from '@xds/core/Table';

const transactions = [
  {description: 'Payment', quantity: 1, amount: 100},
  {description: 'Refund', quantity: 2, amount: -25},
];

export default function TableColumnAlignmentAndVerticalAlignment() {
  return (
    <XDSTable
      data={transactions}
      columns={[
        { key: 'description', header: 'Description' },
        { key: 'quantity', header: 'Qty', align: 'center', width: pixel(80) },
        { key: 'amount', header: 'Amount', align: 'end', width: pixel(120) },
      ]}
      verticalAlign="top"
      density="balanced"
    />
  );
}
