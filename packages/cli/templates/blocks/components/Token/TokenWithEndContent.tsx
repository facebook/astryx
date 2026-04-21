'use client';

import {XDSToken} from '@xds/core/Token';

export default function TokenWithEndContent() {
  return (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <XDSToken
        label="Count"
        endContent={
          <span
            style={{
              fontSize: '10px',
              opacity: 0.7,
              marginInlineStart: '2px',
            }}>
            (3)
          </span>
        }
      />
      <XDSToken
        label="Status"
        color="green"
        endContent={
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'currentColor',
              marginInlineStart: '2px',
            }}
          />
        }
      />
    </div>
  );
}
