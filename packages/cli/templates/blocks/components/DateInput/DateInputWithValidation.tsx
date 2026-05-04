'use client';

import {useState} from 'react';
import {XDSDateInput} from '@xds/core/DateInput';
import {XDSStack} from '@xds/core/Layout';

type DateString =
  `${number}${number}${number}${number}-${number}${number}-${number}${number}`;

export default function DateInputWithValidation() {
  const [errorVal, setErrorVal] = useState<DateString | undefined>(
    '2026-01-25' as DateString,
  );
  const [warningVal, setWarningVal] = useState<DateString | undefined>(
    '2026-12-25' as DateString,
  );
  const [successVal, setSuccessVal] = useState<DateString | undefined>(
    '2026-03-10' as DateString,
  );

  return (
    <XDSStack direction="vertical" gap={4} width="100%" style={{maxWidth: 400}}>
      <XDSDateInput
        label="Event date"
        value={errorVal}
        onChange={setErrorVal}
        status={{type: 'error', message: 'This date is already booked'}}
      />
      <XDSDateInput
        label="Preferred date"
        value={warningVal}
        onChange={setWarningVal}
        status={{type: 'warning', message: 'This date falls on a holiday'}}
      />
      <XDSDateInput
        label="Start date"
        value={successVal}
        onChange={setSuccessVal}
        status={{type: 'success', message: 'Date confirmed'}}
      />
    </XDSStack>
  );
}
