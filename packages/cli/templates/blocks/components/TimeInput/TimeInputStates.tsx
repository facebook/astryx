'use client';

import {useState} from 'react';
import {XDSTimeInput} from '@xds/core/TimeInput';
import {XDSStack} from '@xds/core/Layout';

export default function TimeInputStates() {
  const [disabledVal, setDisabledVal] = useState('10:00');
  const [errorVal, setErrorVal] = useState('22:00');
  const [warningVal, setWarningVal] = useState('07:00');
  const [successVal, setSuccessVal] = useState('10:00');

  return (
    <XDSStack direction="vertical" gap={3}>
      <XDSTimeInput
        label="Disabled field"
        value={disabledVal as never}
        onChange={setDisabledVal as never}
        isDisabled
      />
      <XDSTimeInput
        label="Error message"
        value={errorVal as never}
        onChange={setErrorVal as never}
        status={{type: 'error', message: 'Time must be during business hours'}}
      />
      <XDSTimeInput
        label="Warning message"
        value={warningVal as never}
        onChange={setWarningVal as never}
        status={{type: 'warning', message: 'Early morning — are you sure?'}}
      />
      <XDSTimeInput
        label="Success message"
        value={successVal as never}
        onChange={setSuccessVal as never}
        status={{type: 'success', message: 'Time slot is available'}}
      />
    </XDSStack>
  );
}
