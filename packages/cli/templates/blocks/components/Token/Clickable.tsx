'use client';

import {XDSToken} from '@xds/core/Token';

export default function Clickable() {
  return (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <XDSToken label="Click me" onClick={() => {}} />
      <XDSToken label="Green action" color="green" onClick={() => {}} />
    </div>
  );
}
