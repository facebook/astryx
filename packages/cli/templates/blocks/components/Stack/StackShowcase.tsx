'use client';

import {XDSStack} from '@xds/core/Layout';

export default function StackShowcase() {
  return (
    <XDSStack direction="vertical" gap={2}>
      <div
        style={{
          padding: '8px 16px',
          borderRadius: 6,
          backgroundColor: '#e8f0fe',
          color: '#1a73e8',
          border: '1px solid #c6dafc',
        }}>
        Item 1
      </div>
      <div
        style={{
          padding: '8px 16px',
          borderRadius: 6,
          backgroundColor: '#e8f0fe',
          color: '#1a73e8',
          border: '1px solid #c6dafc',
        }}>
        Item 2
      </div>
      <div
        style={{
          padding: '8px 16px',
          borderRadius: 6,
          backgroundColor: '#e8f0fe',
          color: '#1a73e8',
          border: '1px solid #c6dafc',
        }}>
        Item 3
      </div>
    </XDSStack>
  );
}
