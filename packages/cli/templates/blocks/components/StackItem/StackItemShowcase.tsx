'use client';

import {XDSHStack, XDSStackItem} from '@xds/core/Layout';

export default function StackItemShowcase() {
  return (
    <XDSHStack gap={3} style={{height: 48}}>
      <XDSStackItem
        size="static"
        style={{
          padding: '0 12px',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--color-background-body)',
          borderRadius: 'var(--radius-element, 8px)',
          whiteSpace: 'nowrap',
        }}>
        Logo
      </XDSStackItem>
      <XDSStackItem
        size="fill"
        style={{
          padding: '0 12px',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--color-background-body)',
          borderRadius: 'var(--radius-element, 8px)',
        }}>
        Content fills remaining space
      </XDSStackItem>
      <XDSStackItem
        size="static"
        style={{
          padding: '0 12px',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--color-background-body)',
          borderRadius: 'var(--radius-element, 8px)',
          whiteSpace: 'nowrap',
        }}>
        Actions
      </XDSStackItem>
    </XDSHStack>
  );
}
