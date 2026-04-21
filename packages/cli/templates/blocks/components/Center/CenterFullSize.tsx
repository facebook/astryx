'use client';

import {XDSCenter} from '@xds/core/Center';

export default function CenterFullSize() {
  return (
    <XDSCenter axis="both" width="100%" height={300}>
      <div
        style={{
          padding: '16px 24px',
          backgroundColor: '#e8f0fe',
          borderRadius: 8,
          fontWeight: 500,
        }}>
        Full Width, Fixed Height
      </div>
    </XDSCenter>
  );
}
