'use client';

import {XDSGrid} from '@xds/core/Grid';

function Item() {
  return (
    <div
      style={{
        background: 'var(--color-background-secondary)',
        borderRadius: 8,
        padding: 16,
        textAlign: 'center',
      }}>
      Item
    </div>
  );
}

export default function GridFixedColumns() {
  return (
    <XDSGrid columns={3} gap={4}>
      <Item />
      <Item />
      <Item />
    </XDSGrid>
  );
}
