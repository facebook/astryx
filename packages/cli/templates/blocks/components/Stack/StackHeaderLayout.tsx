'use client';

import {XDSStack, XDSStackItem} from '@xds/core/Layout';

const sideStyle = {
  padding: '8px 16px',
  borderRadius: 6,
  backgroundColor: '#f3f4f6',
  color: '#4b5563',
  border: '1px solid #d1d5db',
  fontWeight: 500,
} as const;

const mainStyle = {
  padding: '8px 16px',
  borderRadius: 6,
  backgroundColor: '#e8f0fe',
  color: '#1a73e8',
  border: '1px solid #c6dafc',
  fontWeight: 500,
} as const;

export default function StackHeaderLayout() {
  return (
    <XDSStack direction="horizontal" gap={2}>
      <XDSStackItem size="static">
        <div style={sideStyle}>Logo</div>
      </XDSStackItem>
      <XDSStackItem size="fill">
        <div style={mainStyle}>Navigation</div>
      </XDSStackItem>
      <XDSStackItem size="static">
        <div style={sideStyle}>Actions</div>
      </XDSStackItem>
    </XDSStack>
  );
}
