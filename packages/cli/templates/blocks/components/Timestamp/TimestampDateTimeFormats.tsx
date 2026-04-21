'use client';

import {XDSTimestamp} from '@xds/core/Timestamp';
import {XDSText} from '@xds/core/Text';

export default function TimestampDateTimeFormats() {
  const date = '2026-02-19T17:00:00Z';
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
      <div>
        <XDSText type="label" color="secondary">
          date:{' '}
        </XDSText>
        <XDSTimestamp value={date} format="date" />
      </div>
      <div>
        <XDSText type="label" color="secondary">
          date_time:{' '}
        </XDSText>
        <XDSTimestamp value={date} format="date_time" />
      </div>
      <div>
        <XDSText type="label" color="secondary">
          time:{' '}
        </XDSText>
        <XDSTimestamp value={date} format="time" />
      </div>
      <div>
        <XDSText type="label" color="secondary">
          system_date:{' '}
        </XDSText>
        <XDSTimestamp value={date} format="system_date" type="code" />
      </div>
      <div>
        <XDSText type="label" color="secondary">
          system_date_time:{' '}
        </XDSText>
        <XDSTimestamp value={date} format="system_date_time" type="code" />
      </div>
    </div>
  );
}
