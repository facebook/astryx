'use client';

import {XDSGrid} from '@xds/core/Grid';

const itemStyle = {
  padding: 16,
  backgroundColor: 'var(--color-background-body)',
  borderRadius: 'var(--radius-element, 8px)',
  textAlign: 'center' as const,
};

export default function GridResponsiveAutoFit() {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
      <div>
        <p
          style={{
            fontSize: 12,
            color: 'var(--color-text-secondary)',
            marginBottom: 8,
          }}>
          2 items — cards stretch to fill available space
        </p>
        <XDSGrid minChildWidth={200} gap={4}>
          <div style={itemStyle}>Item 1</div>
          <div style={itemStyle}>Item 2</div>
        </XDSGrid>
      </div>
      <div>
        <p
          style={{
            fontSize: 12,
            color: 'var(--color-text-secondary)',
            marginBottom: 8,
          }}>
          6 items — columns wrap responsively
        </p>
        <XDSGrid minChildWidth={200} gap={4}>
          <div style={itemStyle}>Item 1</div>
          <div style={itemStyle}>Item 2</div>
          <div style={itemStyle}>Item 3</div>
          <div style={itemStyle}>Item 4</div>
          <div style={itemStyle}>Item 5</div>
          <div style={itemStyle}>Item 6</div>
        </XDSGrid>
      </div>
    </div>
  );
}
