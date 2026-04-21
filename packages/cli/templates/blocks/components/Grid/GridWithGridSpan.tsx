'use client';

import {XDSGrid, XDSGridSpan} from '@xds/core/Grid';

const itemStyle = {
  padding: 16,
  backgroundColor: 'var(--color-background-body)',
  borderRadius: 'var(--radius-element, 8px)',
  textAlign: 'center' as const,
};

const featuredStyle = {
  padding: 24,
  backgroundColor: 'var(--color-accent-muted)',
  borderRadius: 'var(--radius-element, 8px)',
  textAlign: 'center' as const,
  height: '100%',
  boxSizing: 'border-box' as const,
};

export default function GridWithGridSpan() {
  return (
    <XDSGrid columns={4} gap={4}>
      <XDSGridSpan columns={2}>
        <div style={featuredStyle}>Spans 2 columns</div>
      </XDSGridSpan>
      <div style={itemStyle}>Normal</div>
      <div style={itemStyle}>Normal</div>
      <div style={itemStyle}>Normal</div>
      <XDSGridSpan columns={3}>
        <div style={featuredStyle}>Spans 3 columns</div>
      </XDSGridSpan>
      <XDSGridSpan columns="full">
        <div style={featuredStyle}>Full width (spans all columns)</div>
      </XDSGridSpan>
    </XDSGrid>
  );
}
