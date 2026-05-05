'use client';

import {useState} from 'react';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSVStack} from '@xds/core/Layout';
import {XDSCenter} from '@xds/core/Center';

export default function SwitchWithStatus() {
  const [terms, setTerms] = useState(false);
  const [sharing, setSharing] = useState(true);
  const [twoFactor, setTwoFactor] = useState(true);

  return (
    <XDSCenter width={400}>
      <XDSVStack gap={6} width="100%" style={{maxWidth: 400}}>
        <XDSSwitch
          label="Accept terms and conditions"
          value={terms}
          onChange={setTerms}
          isRequired
          status={{
            type: 'error',
            message: 'You must accept the terms to continue',
          }}
        />
        <XDSSwitch
          label="Share usage data"
          description="Help us improve by sharing anonymous usage statistics"
          value={sharing}
          onChange={setSharing}
          status={{
            type: 'warning',
            message: 'This data may be shared with partners',
          }}
        />
        <XDSSwitch
          label="Two-factor authentication"
          value={twoFactor}
          onChange={setTwoFactor}
          status={{type: 'success', message: 'Your account is now more secure'}}
        />
      </XDSVStack>
    </XDSCenter>
  );
}
