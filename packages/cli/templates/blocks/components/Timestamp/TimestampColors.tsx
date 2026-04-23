'use client';

import {XDSTimestamp} from '@xds/core/Timestamp';
import {XDSText} from '@xds/core/Text';

export default function TimestampColors() {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
      <div>
        <XDSText type="label" color="secondary">
          primary:{' '}
        </XDSText>
        <XDSTimestamp
          value="2026-02-19T17:00:00Z"
          format="date_time"
          color="primary"
        />
      </div>
      <div>
        <XDSText type="label" color="secondary">
          secondary:{' '}
        </XDSText>
        <XDSTimestamp
          value="2026-02-19T17:00:00Z"
          format="date_time"
          color="secondary"
        />
      </div>
      <div>
        <XDSText type="label" color="secondary">
          disabled:{' '}
        </XDSText>
        <XDSTimestamp
          value="2026-02-19T17:00:00Z"
          format="date_time"
          color="disabled"
        />
      </div>
      <div>
        <XDSText type="label" color="secondary">
          active:{' '}
        </XDSText>
        <XDSTimestamp
          value="2026-02-19T17:00:00Z"
          format="date_time"
          color="active"
        />
      </div>
    </div>
  );
}
