// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSDateInput} from '@xds/core/DateInput';
import {XDSStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

type DateString =
  `${number}${number}${number}${number}-${number}${number}-${number}${number}`;

export default function DateInputWithDescription() {
  const [value, setValue] = useState<DateString | undefined>(undefined);

  return (
    <XDSStack direction="vertical" gap={4} width="100%" style={{maxWidth: 400}}>
      <XDSText type="supporting" color="secondary">
        Helper text explains what the field expects
      </XDSText>
      <XDSDateInput
        label="Start date"
        description="Your subscription begins on this date"
        placeholder="Select a start date"
        value={value}
        onChange={setValue}
      />
    </XDSStack>
  );
}
