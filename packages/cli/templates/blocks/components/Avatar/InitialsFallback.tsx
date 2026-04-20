'use client';

import {XDSAvatar} from '@xds/core/Avatar';

export default function InitialsFallback() {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
      <XDSAvatar name="John Doe" size="medium" />
      <XDSAvatar name="Alice" size="medium" />
      <XDSAvatar name="Bob Smith Johnson" size="medium" />
      <XDSAvatar name="Dr. Sarah Connor" size="medium" />
    </div>
  );
}
