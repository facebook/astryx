'use client';

import {XDSOverflowList} from '@xds/core/OverflowList';
import {XDSBadge} from '@xds/core/Badge';

export default function OverflowListOverflowBadges() {
  return (
    <div
      style={{
        resize: 'horizontal',
        overflow: 'hidden',
        border: '1px dashed #ccc',
        padding: 8,
        width: 300,
        minWidth: 80,
      }}>
      <XDSOverflowList
        gap={1}
        overflowRenderer={overflowItems => (
          <XDSBadge variant="neutral" label={`+${overflowItems.length}`} />
        )}>
        <XDSBadge variant="info" label="React" />
        <XDSBadge variant="success" label="TypeScript" />
        <XDSBadge variant="warning" label="StyleX" />
        <XDSBadge variant="neutral" label="Storybook" />
        <XDSBadge variant="error" label="Vitest" />
      </XDSOverflowList>
    </div>
  );
}
