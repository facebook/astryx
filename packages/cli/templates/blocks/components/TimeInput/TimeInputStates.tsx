'use client';

import {useState} from 'react';
import {XDSTimeInput} from '@xds/core/TimeInput';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

export default function TimeInputStates() {
  const [defaultVal, setDefaultVal] = useState(undefined);
  const [disabledVal, setDisabledVal] = useState('10:00');
  const [errorVal, setErrorVal] = useState('22:00');
  const [warningVal, setWarningVal] = useState('07:00');
  const [successVal, setSuccessVal] = useState('10:00');

  return (
    <XDSStack direction="vertical" gap={4}>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Default
        </XDSText>
        <XDSTimeInput
          label="Start time"
          value={defaultVal as never}
          onChange={setDefaultVal as never}
          placeholder="Select a start time"
        />
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Disabled
        </XDSText>
        <XDSTimeInput
          label="Locked time"
          value={disabledVal as never}
          onChange={setDisabledVal as never}
          isDisabled
        />
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Error
        </XDSText>
        <XDSTimeInput
          label="Event time"
          value={errorVal as never}
          onChange={setErrorVal as never}
          status={{
            type: 'error',
            message: 'Time must be during business hours',
          }}
        />
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Warning
        </XDSText>
        <XDSTimeInput
          label="Meeting time"
          value={warningVal as never}
          onChange={setWarningVal as never}
          status={{type: 'warning', message: 'Early morning — are you sure?'}}
        />
      </XDSStack>
      <XDSStack direction="vertical" gap={1}>
        <XDSText type="supporting" color="secondary">
          Success
        </XDSText>
        <XDSTimeInput
          label="Scheduled time"
          value={successVal as never}
          onChange={setSuccessVal as never}
          status={{type: 'success', message: 'Time slot is available'}}
        />
      </XDSStack>
    </XDSStack>
  );
}
