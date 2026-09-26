// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {TimeInput} from '@astryxdesign/core/TimeInput';
import {Stack} from '@astryxdesign/core/Layout';

export default function TimeInputStates() {
  const [disabledVal, setDisabledVal] = useState('10:00');
  const [errorVal, setErrorVal] = useState('22:00');
  const [warningVal, setWarningVal] = useState('07:00');
  const [successVal, setSuccessVal] = useState('10:00');

  return (
    <Stack direction="vertical" gap={3}>
      <TimeInput
        label="Disabled field"
        value={disabledVal as never}
        onChange={setDisabledVal as never}
        isDisabled
      />
      <TimeInput
        label="Error message"
        value={errorVal as never}
        onChange={setErrorVal as never}
        status={{type: 'error', message: 'Time must be during business hours'}}
      />
      <TimeInput
        label="Warning message"
        value={warningVal as never}
        onChange={setWarningVal as never}
        status={{type: 'warning', message: 'Early morning — are you sure?'}}
      />
      <TimeInput
        label="Success message"
        value={successVal as never}
        onChange={setSuccessVal as never}
        status={{type: 'success', message: 'Time slot is available'}}
      />
    </Stack>
  );
}
