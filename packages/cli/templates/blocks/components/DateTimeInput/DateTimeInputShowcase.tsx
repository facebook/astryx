// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState} from 'react';
import {XDSDateTimeInput} from '@xds/core/DateTimeInput';
import type {ISODateTimeString} from '@xds/core/DateTimeInput';
import {XDSStack} from '@xds/core/Layout';

export default function DateTimeInputShowcase() {
  const [dateTime, setDateTime] = useState<ISODateTimeString | undefined>(
    undefined,
  );

  return (
    <XDSStack direction="vertical" width="100%" style={{maxWidth: 400}}>
      <XDSDateTimeInput
        label="Meeting time"
        placeholder="Select a date"
        value={dateTime}
        onChange={setDateTime}
        hasClear
      />
    </XDSStack>
  );
}
