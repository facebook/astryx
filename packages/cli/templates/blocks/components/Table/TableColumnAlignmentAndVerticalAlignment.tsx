'use client';

import {XDSTable, pixel} from '@xds/core/Table';

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
