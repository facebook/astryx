'use client';

import {XDSGrid, XDSGridSpan} from '@xds/core/Grid';

export default function GridSpanningColumns() {
  return (
    <XDSGrid columns={3} gap={4}>
      <XDSGridSpan columns={2}>
        <div
          style={{
            background: 'var(--color-background-secondary)',
            borderRadius: 8,
            padding: 16,
            textAlign: 'center',
          }}>
          Wide item
        </div>
      </XDSGridSpan>
      <div
        style={{
          background: 'var(--color-background-secondary)',
          borderRadius: 8,
          padding: 16,
          textAlign: 'center',
        }}>
        Normal item
      </div>
    </XDSGrid>
  );
}
