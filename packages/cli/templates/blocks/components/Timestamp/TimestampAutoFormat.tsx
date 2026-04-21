'use client';

import {XDSTimestamp} from '@xds/core/Timestamp';
import {XDSText} from '@xds/core/Text';

export default function TimestampAutoFormat() {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
      <div>
        <XDSText type="label" color="secondary">
          Recent (relative):{' '}
        </XDSText>
        <XDSTimestamp value={Date.now() / 1000 - 3600} format="auto" />
      </div>
      <div>
        <XDSText type="label" color="secondary">
          Old (date_time):{' '}
        </XDSText>
        <XDSTimestamp value="2025-01-01T12:00:00Z" format="auto" />
      </div>
    </div>
  );
}
