'use client';

import {useState} from 'react';
import {XDSTimeInput, type XDSTimeInputProps} from '@xds/core/TimeInput';

type TimeValue = NonNullable<XDSTimeInputProps['value']>;

export default function TimeInput24hourFormatWithClearButton() {
  const [time, setTime] = useState<TimeValue | undefined>(
    '09:00' as TimeValue,
  );

  return (
    <XDSTimeInput
      label="Meeting time"
      value={time}
      onChange={setTime}
      hourFormat="24h"
      hasClear
    />
  );
}
