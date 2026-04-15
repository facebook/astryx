'use client';

import {XDSGrid} from '@xds/core/Grid';

function Card() {
  return (
    <div
      style={{
        background: 'var(--color-background-secondary)',
        borderRadius: 8,
        padding: 16,
        textAlign: 'center',
      }}>
      Card
    </div>
  );
}

export default function GridResponsiveAutoFit() {
  return (
    <XDSGrid minChildWidth={200} gap={4}>
      <Card />
      <Card />
      <Card />
    </XDSGrid>
  );
}
