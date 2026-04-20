'use client';

import {XDSCenter} from '@xds/core/Center';
import {XDSCard} from '@xds/core/Card';

export default function CenterInsideACard() {
  return (
    <XDSCard>
      <XDSCenter height={150}>
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: '#e8f0fe',
            borderRadius: 8,
            fontWeight: 500,
          }}>
          Centered in Card
        </div>
      </XDSCenter>
    </XDSCard>
  );
}
