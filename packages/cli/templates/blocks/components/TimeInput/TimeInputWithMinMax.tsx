'use client';

import {useState} from 'react';
import {XDSTimeInput} from '@xds/core/TimeInput';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function TimeInputWithMinMax() {
  const [appointment, setAppointment] = useState(undefined);
  const [evening, setEvening] = useState(undefined);

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSText type="supporting" color="secondary">
        Constrained ranges for different scheduling contexts
      </XDSText>
      <XDSStack direction="vertical" gap={3}>
        <XDSTimeInput
          label="Appointment time"
          min={'09:00' as never}
          max={'17:00' as never}
          description="Business hours: 9 AM – 5 PM"
          placeholder="Select appointment time"
          value={appointment as never}
          onChange={setAppointment as never}
          hasClear
        />
        <XDSTimeInput
          label="Dinner reservation"
          min={'17:00' as never}
          max={'22:00' as never}
          description="Evening seating: 5 PM – 10 PM"
          placeholder="Select reservation time"
          value={evening as never}
          onChange={setEvening as never}
          hasClear
        />
      </XDSStack>
    </XDSStack>
  );
}
