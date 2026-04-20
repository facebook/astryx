'use client';

import {XDSToken} from '@xds/core/Token';

export default function WithRemove() {
  return (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <XDSToken label="Removable" onRemove={() => {}} />
      <XDSToken label="Red tag" color="red" onRemove={() => {}} />
      <XDSToken label="Blue tag" color="blue" onRemove={() => {}} />
    </div>
  );
}
