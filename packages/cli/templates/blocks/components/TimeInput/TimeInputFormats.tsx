'use client';

import {useState} from 'react';
import {XDSTimeInput} from '@xds/core/TimeInput';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function TimeInputFormats() {
  const [time24h, setTime24h] = useState('14:30');
  const [timeSec, setTimeSec] = useState('14:30:45');

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        Format variations for different contexts
      </XDSText>
      <XDSStack direction="vertical" gap={3}>
        <XDSTimeInput
          label="24-hour"
          value={time24h as never}
          onChange={setTime24h as never}
          hourFormat="24h"
        />
        <XDSTimeInput
          label="With seconds"
          value={timeSec as never}
          onChange={setTimeSec as never}
          hasSeconds
        />
      </XDSStack>
    </XDSStack>
  );
}
