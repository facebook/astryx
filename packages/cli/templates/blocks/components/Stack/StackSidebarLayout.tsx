'use client';

import {XDSStack, XDSStackItem} from '@xds/core/Layout';

const sidebarStyle = {
  padding: '8px 16px',
  borderRadius: 6,
  backgroundColor: '#f3f4f6',
  color: '#4b5563',
  border: '1px solid #d1d5db',
  fontWeight: 500,
  height: '100%',
  boxSizing: 'border-box',
} as const;

const contentStyle = {
  padding: '8px 16px',
  borderRadius: 6,
  backgroundColor: '#e8f0fe',
  color: '#1a73e8',
  border: '1px solid #c6dafc',
  fontWeight: 500,
  height: '100%',
  boxSizing: 'border-box',
} as const;

export default function StackSidebarLayout() {
  return (
    <div style={{height: 200}}>
      <XDSStack direction="horizontal" gap={2}>
        <XDSStackItem size="static">
          <div style={{...sidebarStyle, width: 150}}>Sidebar</div>
        </XDSStackItem>
        <XDSStackItem size="fill">
          <div style={contentStyle}>Main Content</div>
        </XDSStackItem>
      </XDSStack>
    </div>
  );
}
