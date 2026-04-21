'use client';

import {XDSGrid} from '@xds/core/Grid';

export default function GridShowcase() {
  return (
    <XDSGrid columns={3} gap={4}>
      {Array.from({length: 6}, (_, i) => (
        <div
          key={i}
          style={{
            padding: 16,
            backgroundColor: 'var(--color-background-body)',
            borderRadius: 'var(--radius-element, 8px)',
            textAlign: 'center',
          }}>
          Item {i + 1}
        </div>
      ))}
    </XDSGrid>
  );
}
