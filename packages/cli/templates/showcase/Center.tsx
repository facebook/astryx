'use client';

import {XDSCenter} from '@xds/core/Center';

export default function CenterShowcase() {
  return (
    <XDSCenter axis="both" width="100%" height={200}>
      <div
        style={{
          padding: '16px 24px',
          backgroundColor: '#e8f0fe',
          borderRadius: 8,
          fontWeight: 500,
        }}>
        Centered Content
      </div>
    </XDSCenter>
  );
}
