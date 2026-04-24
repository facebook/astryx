'use client';

import {XDSGrid, XDSGridSpan} from '@xds/core/Grid';

const cellStyle: React.CSSProperties = {
  padding: 16,
  backgroundColor: 'var(--color-background-body)',
  borderRadius: 'var(--radius-element, 8px)',
  textAlign: 'center' as const,
};

export default function GridSpanShowcase() {
  return (
    <XDSGrid columns={3} gap={3}>
      <XDSGridSpan columns={2}>
        <div style={cellStyle}>Spans 2 columns</div>
      </XDSGridSpan>
      <div style={cellStyle}>1 col</div>
      <div style={cellStyle}>1 col</div>
      <XDSGridSpan columns="full">
        <div style={cellStyle}>Full width row</div>
      </XDSGridSpan>
    </XDSGrid>
  );
}
