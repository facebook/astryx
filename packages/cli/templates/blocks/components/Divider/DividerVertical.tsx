'use client';

import {XDSDivider} from '@xds/core/Divider';

export default function DividerVertical() {
  return (
    <div style={{display: 'flex', height: 100, alignItems: 'center'}}>
      <span>Left</span>
      <XDSDivider orientation="vertical" />
      <span>Right</span>
    </div>
  );
}
