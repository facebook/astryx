'use client';

import {XDSToken} from '@xds/core/Token';

export default function TokenWithIcon() {
  return (
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
      <XDSToken
        label="Star"
        icon={
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 0l1.8 3.6L12 4.2 8.9 7.1l.7 4.1L6 9.2 2.4 11.2l.7-4.1L0 4.2l4.2-.6z" />
          </svg>
        }
      />
      <XDSToken
        label="Info"
        color="blue"
        icon={
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <circle
              cx="6"
              cy="6"
              r="5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <text
              x="6"
              y="9"
              textAnchor="middle"
              fontSize="8"
              fill="currentColor">
              i
            </text>
          </svg>
        }
      />
    </div>
  );
}
