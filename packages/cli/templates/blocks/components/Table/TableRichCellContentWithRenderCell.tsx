'use client';

import {XDSBadge} from '@xds/core/Badge';
import {XDSVStack} from '@xds/core/Layout';
import {XDSTable} from '@xds/core/Table';
import {XDSText} from '@xds/core/Text';

export default function TableRichCellContentWithRenderCell() {
  return (
    <XDSTable
      data={transactions}
      columns={[
        {
          key: 'description',
          header: 'Transaction',
          renderCell: tx => (
            <XDSVStack gap={1}>
              <XDSText weight="semibold">{tx.description}</XDSText>
              <XDSText type="supporting" color="secondary">
                {tx.date}
              </XDSText>
            </XDSVStack>
          ),
        },
        {
          key: 'amount',
          header: 'Amount',
          renderCell: tx => (
            <XDSText
              weight="semibold"
              color={tx.amount > 0 ? 'positive' : 'negative'}>
              {tx.amount > 0 ? '+' : ''}
              {tx.amount.toFixed(2)}
            </XDSText>
          ),
        },
        {
          key: 'status',
          header: 'Status',
          renderCell: tx => (
            <XDSBadge
              variant={
                tx.status === 'completed'
                  ? 'success'
                  : tx.status === 'pending'
                    ? 'warning'
                    : 'error'
              }
              label={tx.status}
            />
          ),
        },
      ]}
      density="balanced"
      dividers="rows"
      hasHover
    />
  );
}
