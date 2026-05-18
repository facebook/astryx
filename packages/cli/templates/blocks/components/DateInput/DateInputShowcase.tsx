// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSDateInput} from '@xds/core/DateInput';
import {XDSStack} from '@xds/core/Layout';

type DateString =
  `${number}${number}${number}${number}-${number}${number}-${number}${number}`;

export default function DateInputShowcase() {
  const [date, setDate] = useState<DateString | undefined>(undefined);

  return (
    <XDSStack direction="vertical" width="100%" style={{maxWidth: 400}}>
      <XDSDateInput
        label="Start date"
        placeholder="Select a date"
        value={date}
        onChange={setDate}
        hasClear
      />
    </XDSStack>
  );
}
