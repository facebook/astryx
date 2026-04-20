'use client';

import {XDSStack} from '@xds/core/Layout';

const boxStyle = {
  padding: '8px 16px',
  borderRadius: 6,
  backgroundColor: '#e8f0fe',
  color: '#1a73e8',
  border: '1px solid #c6dafc',
  fontWeight: 500,
} as const;

export default function StackDirections() {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
      <div>
        <h4 style={{margin: '0 0 8px'}}>Horizontal</h4>
        <XDSStack direction="horizontal" gap={2}>
          <div style={boxStyle}>Item 1</div>
          <div style={boxStyle}>Item 2</div>
          <div style={boxStyle}>Item 3</div>
        </XDSStack>
      </div>
      <div>
        <h4 style={{margin: '0 0 8px'}}>Vertical</h4>
        <XDSStack direction="vertical" gap={2}>
          <div style={boxStyle}>Item 1</div>
          <div style={boxStyle}>Item 2</div>
          <div style={boxStyle}>Item 3</div>
        </XDSStack>
      </div>
    </div>
  );
}
