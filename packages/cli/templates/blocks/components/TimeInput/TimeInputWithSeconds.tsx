'use client';

import {useState} from 'react';
import {XDSTimeInput} from '@xds/core/TimeInput';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function TimeInputWithSeconds() {
  const [countdown, setCountdown] = useState('14:30:00');
  const [logEntry, setLogEntry] = useState('09:15:30');

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        Seconds precision for timing-sensitive inputs
      </XDSText>
      <XDSStack direction="vertical" gap={3}>
        <XDSTimeInput
          label="Countdown start"
          hasSeconds
          value={countdown as never}
          onChange={setCountdown as never}
          description="Precise time for event countdown"
          increment={15}
        />
        <XDSTimeInput
          label="Log entry time"
          hasSeconds
          hourFormat="24h"
          value={logEntry as never}
          onChange={setLogEntry as never}
          description="24-hour format with seconds for audit logs"
          hasClear
        />
      </XDSStack>
    </XDSStack>
  );
}
