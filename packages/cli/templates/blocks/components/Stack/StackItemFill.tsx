'use client';

import {XDSStack, XDSStackItem} from '@xds/core/Layout';

const staticStyle = {
  padding: '8px 16px',
  borderRadius: 6,
  backgroundColor: '#f3f4f6',
  color: '#4b5563',
  border: '1px solid #d1d5db',
  fontWeight: 500,
} as const;

const fillStyle = {
  padding: '8px 16px',
  borderRadius: 6,
  backgroundColor: '#e8f0fe',
  color: '#1a73e8',
  border: '1px solid #c6dafc',
  fontWeight: 500,
} as const;

export default function StackItemFill() {
  return (
    <XDSStack direction="horizontal" gap={2}>
      <XDSStackItem size="static">
        <div style={staticStyle}>Static</div>
      </XDSStackItem>
      <XDSStackItem size="fill">
        <div style={fillStyle}>Fill (grows to remaining space)</div>
      </XDSStackItem>
      <XDSStackItem size="static">
        <div style={staticStyle}>Static</div>
      </XDSStackItem>
    </XDSStack>
  );
}
