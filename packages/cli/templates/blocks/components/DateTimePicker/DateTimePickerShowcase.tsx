'use client';

import {useState} from 'react';
import {XDSDateTimePicker} from '@xds/core/DateTimePicker';
import type {ISODateTimeString} from '@xds/core/DateTimePicker';
import {XDSStack} from '@xds/core/Layout';

export default function DateTimePickerShowcase() {
  const [dateTime, setDateTime] = useState<ISODateTimeString | undefined>(
    undefined,
  );

  return (
    <XDSStack direction="vertical" width="100%" style={{maxWidth: 400}}>
      <XDSDateTimePicker
        label="Meeting time"
        placeholder="Select a date"
        value={dateTime}
        onChange={setDateTime}
        hasClear
      />
    </XDSStack>
  );
}
